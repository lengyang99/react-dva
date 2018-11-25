import React from 'react';
import { connect } from 'dva';
import { Table, Button, Menu, Dropdown, Icon, Select, message, Input, Upload, Popconfirm } from 'antd';
import { find } from 'lodash';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerPlanDetails from './emerPlanDetails.jsx';

const Option = Select.Option;
const EditableCell = ({ editable, value, onChange }) => (
  <div>
    {editable
      ? <Input style={{ margin: '-5px 0' }} value={value} onChange={e => onChange(e.target.value)} />
      : value
    }
  </div>
);

@connect(state => ({
  user: state.login.user,
  token: state.login.token,
  btLoading: state.emer.btLoading,
  emerOrgTemplateId: state.emerLfMap.emerTemplateId,// 应急组织机构批量导入模版文件的uuid
}))

export default class EmerPlanList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerPlanData: [],
      emerEventTypeData: [],
      emerPlanTypeData: [],
      emerEventTypeValue: '0',
      emerDangerTypeValue: '0',
      emerPlanTypeValue: '0',
      selectedEmerPlanId: 0,
      selectedPlanId: 0,
      loading: true,
      addEmerPlanOpen: false,
      updateEmerPlanOpen: false,
      showEmerPlanDetails: false,
      currentEmerPlanData: {},
      emerPlanAttachedFile: [],
      plan_name: '',
      plan_type: 0,
      plan_eventType: 0,
      plan_dangerType: '',
      plan_ownerUnit: '',
      plan_attachFileList: [],
      emerOrganizationData: [],
      organizationData: [],
      cacheData: [],
      isShowOrganizationAdd: false,
      organizationParams: {
        phone: '',
        groupname: '',
        truename: '',
      },
      record: {},
      addType: '', // 添加类型 (新建预案: 添加 编辑 修改预案 :添加 编辑)
      userList: [], // 组织人员列表
      dangerData: [], // 险情分类数据；
      dangerType: '', // 当前险情分类
      cacheUserList: [], // 未增删时的 组织人员列表奥 用作过滤
    };
    message.config({
      duration: 2,
    });
    this.handleGetEmerEventType();
    this.handleGetEmerPlanType();
    this.handleGetEmerPlan();
    this.queryOrganizationUsers();
  }

  cachRecord = {};

  componentDidMount() {
    this.props.dispatch({
      type: 'emer/getDangerType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        console.log(res, '险情分类');
        this.setState({
          dangerData: res.data,
          emerCategory: res.data[0].name,
        });
      },
    });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => { };
    this.props.dispatch({
      type: 'emer/resetData',
      payload: { planId: this.props.user.gid },
    });
  };

  // 打开/关闭新增应急预案弹框
  handleOpenOrCloseAddEmerPlan = (op) => {
    if (op === 'open') {
      this.setState({
        addEmerPlanOpen: true,
      });
    } else {
      this.setState({
        addEmerPlanOpen: false,
        organizationData: [],
        cacheData: [],
        plan_attachFileList: [],
      });
    }
    this.props.dispatch({
      type: 'emer/resetData',
      payload: { planId: this.props.user.gid },
    });
  }

  // 打开/关闭修改应急预案弹框
  handleOpenOrCloseUpdateEmerPlan = (op) => {
    if (op === 'open') {
      this.setState({
        updateEmerPlanOpen: true,
      });
    } else {
      this.setState({
        updateEmerPlanOpen: false,
        organizationData: [],
        cacheData: [],
        plan_attachFileList: [],
      });
    }
  }
  // 新增应急预案
  handleAddEmerPlan = (e) => {
    // 表单校验
    const flag = this.handleCheckForm();
    // 校验成功，发送数据
    if (flag) {
      const f = e.target.ownerDocument.getElementById('emerPlanAdd_form');
      const result = this.flattenData(this.state.organizationData).toString();
      // 获取表单，同时设置属性
      const fd = new FormData();
      // 添加键值对
      fd.append('name', this.state.plan_name);
      fd.append('type', this.state.plan_type);
      // fd.append('eventType', this.state.plan_eventType);
      fd.append('dangerType', this.state.plan_dangerType);
      fd.append('ownerUnit', this.state.plan_ownerUnit);
      fd.append('creatorId', this.props.user.gid);
      fd.append('creator', this.props.user.trueName);
      fd.append('emerOrganization', result);
      // 循环添加文件
      this.state.plan_attachFileList.map((item, index) => {
        fd.append(`attachedFile${index}`, item.originFileObj);
      });
      this.props.dispatch({
        type: 'emer/addEmerPlan',
        payload: fd,
        callback: (res) => {
          // 添加成功，更新应急预案列表
          this.setState({
            addEmerPlanOpen: false,
            organizationData: [],
            cacheData: [],
            plan_attachFileList: [],
          });
          message.info(res.msg);
          this.handleGetEmerPlan();
        },
      });
    }
  }

  // 修改应急预案
  handleUpdateEmerPlan = (e) => {
    // 表单校验
    const flag = this.handleCheckForm();
    // 校验成功，发送数据
    if (flag) {
      const f = e.target.ownerDocument.getElementById('emerPlanAdd_form');
      const result = this.flattenData(this.state.organizationData).toString();
      // 获取表单，同时设置属性
      const fd = new FormData(f);
      const oldFile = [];
      // 添加键值对
      fd.append('gid', this.state.currentEmerPlanData.gid);
      fd.append('name', this.state.plan_name);
      fd.append('type', this.state.plan_type);
      fd.append('eventType', this.state.plan_eventType);
      fd.append('dangerType', this.state.plan_dangerType);
      fd.append('ownerUnit', this.state.plan_ownerUnit);
      fd.append('userId', this.props.user.gid);
      fd.append('userName', this.props.user.trueName);
      fd.append('emerOrganization', result);
      // 循环添加文件
      this.state.plan_attachFileList.map((item, index) => {
        if (typeof item.size === 'undefined') {
          oldFile.push(item.uid);
        } else {
          fd.append(`attachedFile${index}`, item.originFileObj);
        }
      });
      fd.append('oldFile', oldFile);
      this.props.dispatch({
        type: 'emer/updateEmerPlan',
        payload: fd,
        callback: (res) => {
          // 添加成功，更新应急预案列表
          this.setState({
            updateEmerPlanOpen: false,
          });
          message.info(res.msg);
          this.handleGetEmerPlan();
        },
      });
    }
  }

  // 新增应急预案表单校验
  handleCheckForm = () => {
    if (this.state.plan_name.trim() === '') {
      message.warning('预案名称不能为空');
      return false;
    }
    if (this.state.plan_ownerUnit.trim() === '') {
      message.warning('请选择预案所属单位');
      return false;
    }
    if (this.state.plan_type === 0) {
      message.warning('请选择预案类型');
      return false;
    }
    if (this.state.plan_dangerType === '') {
      message.warning('请选择险情分类');
      return false;
    }
    if (this.state.plan_attachFileList.length === 0) {
      message.warning('请选择预案附件');
      return false;
    }
    if (this.state.organizationData.length === 0) {
      message.warning('请选择预案关联的应急组织人员');
      return false;
    }
    return true;
  }

  // 确认/取消删除应急预案
  confirmDelEmerPlan = () => {
    this.handleDelEmerPlan();
  }

  // 删除应急预案
  handleDelEmerPlan = () => {
    const data = {};
    data.gid = this.state.selectedEmerPlanId;
    this.props.dispatch({
      type: 'emer/delEmerPlan',
      payload: data,
      callback: (res) => {
        // 删除成功，更新应急预案列表
        message.info(res.msg);
        this.handleGetEmerPlan();
      },
    });
  }

  // 查询应急预案类型
  handleGetEmerPlanType = () => {
    const data = {
      ecode: this.props.user.ecode,
    };
    this.props.dispatch({
      type: 'emer/getEmerPlanType',
      payload: data,
      callback: (res) => {
        this.setState({
          emerPlanTypeData: res.data,
        });
      },
    });
  }

  // 查询应急事件类型
  handleGetEmerEventType = () => {
    const data = {
      ecode: this.props.user.ecode,
    };
    this.props.dispatch({
      type: 'emer/getEmerEventType',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventTypeData: res.data,
        });
      },
    });
  }

  // 查询应急预案
  handleGetEmerPlan = () => {
    const data = {};
    // data.eventType = this.state.emerEventTypeValue;
    data.dangerType = this.state.emerDangerTypeValue; // 险情分类
    data.type = this.state.emerPlanTypeValue;
    data.ecode = this.props.user.ecode;
    data.status = 1;
    this.props.dispatch({
      type: 'emer/getEmerPlan',
      payload: data,
      callback: (res) => {
        if (res.success) {
          this.setState({
            loading: false,
            emerPlanData: res.data,
          });
        } else {
          this.setState({
            emerPlanData: [],
          });
        }
      },
    });
  }

  // 重置查询条件
  handleResetSearch = () => {
    this.setState({
      // emerEventTypeValue: '0',
      emerDangerTypeValue: '0',
      emerPlanTypeValue: '0',
    }, () => {
      this.handleGetEmerPlan();
    });
  }

  // 处理应急事件类型变化  =>   改为险情分类
  onEventTypeChange = (value) => {
    this.setState({
      // emerEventTypeValue: value,
      emerDangerTypeValue: value,
    });
  }

  // 处理应急预案类型变化
  onPlanTypeChange = (value) => {
    this.setState({
      emerPlanTypeValue: value,
    });
  }

  // 处理“更多操作”
  onDropMenuOpen = (emerPlanId, planId) => {
    this.setState({
      selectedEmerPlanId: emerPlanId,
      selectedPlanId: planId,
    });
  }

  // 设置应急预案名称
  setEmerPlanName = (e) => {
    this.setState({
      plan_name: e.target.value,
    });
  }

  // 设置应急预案所属单位
  setEmerPlanOwnerUnit = (value) => {
    this.setState({
      plan_ownerUnit: value,
    });
  }

  // 设置应急预案类型
  setEmerPlanType = (value) => {
    this.setState({
      plan_type: value,
    });
  }

  // 设置应急预案应对的事件类型及预案级别
  setEmerPlanEventType = (value) => {
    this.setState({
      // plan_eventType: value,
      plan_dangerType: value,
    });
  }

  // 查询应急组织机构信息
  handleGetEmerOrganization = (planId) => {
    const data = {};
    data.planId = planId;
    this.props.dispatch({
      type: 'emerLfMap/getEmerOrganization',
      payload: data,
      callback: (res) => {
        this.setState({
          emerOrganizationData: res.data,
          organizationData: res.data,
          cacheData: [...res.data],
        });
      },
    });
  }
  // 责任人改变
  setEmerPlanOrganization = (id) => {
    const userList = this.state.userList;
    const organizationParams = userList.filter(item => item.userid === id)[0] || {};
    const oldOrganizationParams = this.state.organizationParams;
    this.setState({
      organizationParams: { ...oldOrganizationParams, ...organizationParams }
    });
  };
  // 责任人 电话 组织改变事件回调
  handleOrganizationChange = (e) => {
    const organizationParams = this.state.organizationParams;
    organizationParams[e.target.name] = e.target.value;
    this.setState({
      organizationParams,
    });
  }
  handleAddEmerOrganization = (addType) => {
    this.setState({
      isShowOrganizationAdd: true,
      organizationParams: {},
      addType,
    });
  };
  // 查询组织人员服务
  queryOrganizationUsers = () => {
    const { ecode } = this.props.user;
    this.props.dispatch({
      type: 'emer/queryOrganizationUsers',
      payload: { ecode },
      callback: (data) => {
        if (data) {
          console.log(data, 'wwwwwwwwwwww');
          this.setState({ userList: data, cacheUserList: data });
        }
      },
    });
  }
  // 添加应急组织人员
  handleAddEmerPlanPerson = () => {
    const fd = new FormData();
    // 组别不能为空
    if (!this.state.organizationParams.groupName) {
      message.warn('组别不能为空');
      return;
    }
    // 验证手机号码
    if (!(/^1\d{10}$/.test(this.state.organizationParams.phone) || /^(\d{2,4}-?)?\d{7,8}$/.test(this.state.organizationParams.phone))) {
      message.warn('手机号码格式不正确');
      return;
    }
    const userList = this.state.userList;
    const resultList = userList.filter(item => item.userid !== this.state.organizationParams.userid);
    this.setState({ userList: resultList });
    fd.append('groupName', this.state.organizationParams.groupName);
    fd.append('name', this.state.organizationParams.groupname);
    fd.append('manager', this.state.organizationParams.truename);
    fd.append('firstTel', this.state.organizationParams.phone);
    fd.append('planId', this.props.user.gid);
    fd.append('managerId', this.state.organizationParams.userid);
    if (this.state.addType === 'add_add_son') {
      fd.append('parentId', this.state.record.gid);
    }
    const planId = this.props.user.gid;
    this.props.dispatch({
      type: 'emer/addEmerOrganization',
      payload: fd,
      callback: (res) => {
        this.handleGetEmerOrganization(planId);
        this.setState({
          isShowOrganizationAdd: false,
        });
      },
    });
  };

  handleCloseAddEmerPlanPerson = () => {
    this.setState({
      isShowOrganizationAdd: false,
    });
  };

  // 关闭/显示应急预案详情
  handleOpenOrCloseEmerPlanDetails = (op) => {
    if (op === 'open') {
      // 获取要显示详情的预案
      let currentPlan = null;
      for (let i = 0; i < this.state.emerPlanData.length; i++) {
        const plan = this.state.emerPlanData[i];
        if (plan.gid === this.state.selectedEmerPlanId) {
          currentPlan = plan;
          break;
        }
      }
      // 获取显示详情的预案关联的应急组织
      this.handleGetEmerOrganization(currentPlan.planId);
      // 获取预案附件列表
      this.handleGetEmerPlanAttachedFile(currentPlan.attachedFile);
      this.setState({
        currentEmerPlanData: currentPlan,
        showEmerPlanDetails: true,
      });
    } else {
      this.setState({
        showEmerPlanDetails: false,
      });
    }
  }

  // 获取应急预案附件列表
  handleGetEmerPlanAttachedFile = (fileArr) => {
    const data = {};
    data.ids = fileArr;
    this.props.dispatch({
      type: 'emer/getEmerPlanAttachedFileList',
      payload: data,
      callback: (res) => {
        this.setState({
          emerPlanAttachedFile: res.data,
          plan_attachFileList: res.data.map((v, i) => ({ uid: v.id, name: v.filename, status: 'done', url: 'C:/Users/17637/Desktop/aaa.png' })),
        });
      },
    });
  }

  // 处理“更多”操作
  handleMenuItemClicked = ({ item, key, keyPath }) => {
    if (key === 'details') {
      // 显示应急预案详情
      this.handleOpenOrCloseEmerPlanDetails('open');
    }
    if (key === 'update') {
      // 获取要显示详情的预案
      let currentPlan = null;
      for (let i = 0; i < this.state.emerPlanData.length; i++) {
        const plan = this.state.emerPlanData[i];
        if (plan.gid === this.state.selectedEmerPlanId) {
          currentPlan = plan;
          break;
        }
      }
      // 获取显示详情的预案关联的应急组织
      this.handleGetEmerOrganization(currentPlan.planId);
      // 获取预案附件列表
      this.handleGetEmerPlanAttachedFile(currentPlan.attachedFile);
      this.setState({
        currentEmerPlanData: currentPlan,
        plan_name: currentPlan.name, // 预案名称
        plan_ownerUnit: currentPlan.ownerUnit, // 所属单位
        plan_type: currentPlan.type, // 预案类型
        plan_eventType: currentPlan.eventType, // 事件类型
        plan_dangerType: currentPlan.dangerType, // 险情分类


      });
      // 修改应急预案
      this.handleOpenOrCloseUpdateEmerPlan('open');
    }
  }
  // 删除组织
  onDeleteOrganization = (record) => {
    const userList = this.state.userList;
    const cacheUserList = this.state.cacheUserList;
    const resultList = cacheUserList.filter(item => item.userid === record.managerId.toString())[0];
    userList.push(resultList);
    this.setState({ userList });
    this.props.dispatch({
      type: 'emerLfMap/deleteOrganization',
      payload: { orgId: record.gid },
      callback: () => {
        const planId = this.state.currentEmerPlanData.planId ? this.state.currentEmerPlanData.planId : this.props.user.gid;
        this.handleGetEmerOrganization(planId);
      },
    });
  };
  flattenData = (list) => {
    const result = [];
    const loop = (data) => {
      result.push(data.gid);
      if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
        data.children.forEach((ele) => {
          loop(ele);
        });
      }
    };
    list.forEach(element => loop(element));
    return result;
  };
  //
  loop = (data, id, cloumn, value) => {
    if (data.gid === id) {
      data[cloumn] = value;
    }
    if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
      data.children.forEach((ele) => {
        this.loop(ele, id, cloumn, value);
      });
    }
  };
  // 复制对象
  copy = (record) => {
    const result = {};
    for (const key in record) {
      result[key] = typeof record[key] === 'object' ? this.copy(record[key]) : record[key];
    }
    return result;
  }
  // 编辑行
  edit = (record) => {
    this.cachRecord = this.copy(record);
    const newOrganizationData = [...this.state.organizationData];
    if (newOrganizationData) {
      newOrganizationData.forEach(ele => this.loop(ele, record.gid, 'editable', true));
      this.setState({
        organizationData: newOrganizationData,
      });
    }
  };
  // 保存
  save = (record) => {
    const newOrganizationData = [...this.state.organizationData];
    this.handleChangeData(newOrganizationData, false, record.gid, 'editable');
    const fd = new FormData();
    fd.append('gid', record.gid);
    fd.append('name', record.name);
    fd.append('manager', record.manager);
    fd.append('firstTel', record.firstTel);
    this.props.dispatch({
      type: 'emerLfMap/updateOrganization',
      payload: fd,
      callback: () => {
        // this.handleGetEmerOrganization(this.props.currentEmerPlanData.planId);
      },
    });
  };

  add = (record) => {
    this.setState({
      record,
      isShowOrganizationAdd: true,
      organizationParams: {},
      addType: 'add_add_son',
    });
  }
  cancel = (id) => {
    const newOrganizationData = [...this.state.organizationData];
    const cachRecord = this.cachRecord;
    this.handleChangeData(newOrganizationData, cachRecord.name, cachRecord.gid, 'name');
    this.handleChangeData(newOrganizationData, cachRecord.firstTel, cachRecord.gid, 'firstTel');
    this.handleChangeData(newOrganizationData, cachRecord.manager, cachRecord.gid, 'manager');
    this.handleChangeData(newOrganizationData, false, cachRecord.gid, 'editable');
  }
  // 组织结构改变
  handleChangeData = (data, value, id, column) => {
    data.forEach(ele => {
      this.loop(ele, id, column, value);
    });
    this.setState({
      organizationData: data,
    });
  }
  handleChange(value, id, column) {
    const newOrganizationData = [...this.state.organizationData];
    this.handleChangeData(newOrganizationData, value, id, column);
  }

  render = () => {
    const that = this;
    const { onCancel } = this.props;
    const { userList, organizationParams, dangerData } = this.state;
    const orgTemplateDownloadUrl = `proxy/attach/downloadFile?token=${this.props.token}&id=${this.props.emerOrgTemplateId}`;
    const userOptions = (userList || []).map(item =>
      <Option key={item.userid}>{item.truename}</Option >
    );
    const operationMenu = (
      <Menu onClick={this.handleMenuItemClicked}>
        <Menu.Item key="delete">
          <Popconfirm
            title="确认删除?"
            onConfirm={this.confirmDelEmerPlan}
            okText="是"
            cancelText="否"
            placement="top"
          >
            <span>删除</span>
          </Popconfirm>
        </Menu.Item>
        <Menu.Item key="update">
          <span>修改</span>
        </Menu.Item>
        <Menu.Item key="details">
          <span>详情</span>
        </Menu.Item>
      </Menu>
    );
    const tableColumns = [{
      title: '预案名称',
      dataIndex: 'name',
    }, {
      title: '所属单位',
      dataIndex: 'ownerUnit',
    }, {
      title: '预案类型',
      dataIndex: 'typeName',
    }, {
      title: '险情分类',
      dataIndex: 'dangerTypeName',
    }, {
      title: '预案状态',
      dataIndex: 'statusName',
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
    }, {
      title: '操作',
      render: (record) => (
        <Dropdown overlay={operationMenu} trigger={['click']} onVisibleChange={(emerPlanId, planId) => this.onDropMenuOpen(record.gid, record.planId)}>
          <a className="ant-dropdown-link" style={{ textDecoration: 'none' }}>
            更多<Icon type="down" />
          </a>
        </Dropdown>
      ),
    }];
    const pagination = {
      pageSize: 5,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ['4', '5', '6'],
    };
    const modalStyle = {
      marginLeft: '437px',
      marginTop: '65px',
    };
    const uploadProps = {
      onRemove: (file) => {
        this.setState(({ plan_attachFileList }) => {
          const index = plan_attachFileList.indexOf(file);
          const newFileList = plan_attachFileList.slice();
          newFileList.splice(index, 1);
          return {
            plan_attachFileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(({ plan_attachFileList }) => ({
          plan_attachFileList: [...plan_attachFileList, file],
        }));
        return false;
      },
      onChange: ({ fileList }) => {
        this.setState({ plan_attachFileList: fileList });
      },
      fileList: this.state.plan_attachFileList,
    };
    // 显示已选择的应急组织机构
    const oragnizationTableColumns = [{
      title: '组别',
      dataIndex: 'groupName',
      key: 'groupName',
      width: '15%',
      render: (text, record) => {
        return (
          <EditableCell
            editable={record.editable}
            value={text}
            onChange={value => this.handleChange(value, record.gid, 'groupName')}
          />
        );
      },
    }, {
      title: '组织名称',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, record) => {
        return (
          <EditableCell
            editable={record.editable}
            value={text}
            onChange={value => this.handleChange(value, record.gid, 'name')}
          />
        );
      },
    }, {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: '10%',
      render: (text, record) => {
        return (
          <EditableCell
            editable={record.editable}
            value={text}
            onChange={value => this.handleChange(value, record.gid, 'manager')}
          />
        );
      },
    }, {
      title: '电话',
      dataIndex: 'firstTel',
      key: 'firstTel',
      width: '20%',
      render: (text, record) => {
        return (
          <EditableCell
            editable={record.editable}
            value={text}
            onChange={value => this.handleChange(value, record.gid, 'firstTel')}
          />
        );
      },
    }, {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (text, record) => {
        const { editable } = record;
        return (editable ?
          <span>
            <a style={{ marginRight: '10px' }} onClick={() => this.save(record)}>保存</a>
            <Popconfirm title="确认取消?" onConfirm={() => this.cancel(record.gid)}>
              <a>取消</a>
            </Popconfirm>
          </span> : <span>
            <a style={{ marginRight: '10px' }} onClick={() => this.edit(record)}>编辑</a>
            {record.parentId ? null : <a style={{ marginRight: '10px' }} onClick={() => this.add(record, 'add_add_son')}>新增</a>}
            <Popconfirm title="确认删除?" onConfirm={() => this.onDeleteOrganization(record)}>
              <a href="javascript:;">删除</a>
            </Popconfirm>
          </span>);
      },
    }];

    const organizationPagination = {
      pageSize: 4,
    };
    // 应急预案关联的应急组织
    const currentOrganizationColumns = [{
      title: '#',
      render: (text, record, index) => (
        <span>{index + 1}</span>
      ),
      width: 38,
    }, {
      title: '组别',
      dataIndex: 'groupName',
      width: 100,
    }, {
      title: '组织机构名称',
      dataIndex: 'name',
      width: 165,
    }, {
      title: '负责人',
      dataIndex: 'manager',
      width: 65,
    }, {
      title: '电话',
      dataIndex: 'firstTel',
      width: 90,
    }];
    // 预案附件链接
    const attachedFileUrl = 'proxy/attach/findById';
    // 批量导入
    const orgUploadProps = {
      name: 'file',
      action: `proxy/emer/organization/batchImportEmerOrg?userId=${this.props.user.gid}&token=${this.props.token}&ecode=${this.props.user.ecode}&plat=pc`,
      onChange(info) {
        console.log('***lanxiang***');
        console.log(info);
        if (info.file.status !== 'uploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(info.file.response.msg);
          // 刷新应急组织机构信息
          that.handleGetEmerOrganization(that.props.user.gid);
        } else if (info.file.status === 'error') {
          message.error('文件上传失败');
        }
      },
    };
    return (
      <div>
        <Dialog
          title="应急预案列表"
          width={750}
          onClose={onCancel}
          position={{
            top: 115,
            left: 410,
          }}
        >
          <div style={{ margin: 10, position: 'relative' }}>
            <div>
              <form>
                <span>
                  险情分类:<Select
                    value={this.state.emerDangerTypeValue}
                    style={{
                      width: 120,
                      margin: '0px 14px 5px 8px',
                      display: 'inline-block',
                    }}
                    onChange={this.onEventTypeChange}
                  >
                    <Option value="0">请选择</Option>
                    {
                      dangerData && dangerData.map((item, index) => {
                        return (<Option key={index} value={item.gid}>{item.name}</Option>);
                      })
                    }
                  </Select>
                </span>
                <span>
                  预案类型:<Select
                    value={this.state.emerPlanTypeValue}
                    style={{
                      width: 120,
                      margin: '0px 14px 5px 8px',
                      display: 'inline-block',
                    }}
                    onChange={this.onPlanTypeChange}
                  >
                    <Option value="0">请选择</Option>
                    {
                      this.state.emerPlanTypeData.map((item, index) => {
                        return (<Option key={index} value={item.gid}>{item.name}</Option>);
                      })
                    }
                  </Select>
                </span>
                <Button type="primary" style={{ marginRight: 10 }} onClick={this.handleGetEmerPlan}>查询</Button>&nbsp;&nbsp;&nbsp;
                <Button style={{ marginRight: 10 }} onClick={this.handleResetSearch}>重置</Button>&nbsp;&nbsp;&nbsp;
                <Button type="primary" onClick={(op) => this.handleOpenOrCloseAddEmerPlan('open')}><Icon type="plus" />新建</Button>
              </form>
            </div>
            <Table
              rowKey={(record) => record.gid}
              columns={tableColumns}
              dataSource={this.state.emerPlanData}
              pagination={pagination}
              loading={this.state.loading}
            />
            {
              this.state.emerPlanData.length ? <span style={{ position: 'absolute', bottom: 35, left: 16 }}>
                共<span style={{ color: '#108EE9' }}>{this.state.emerPlanData.length}</span>条数据
              </span> : ''
            }
          </div>
        </Dialog>
        {/* 应急预案详情:基本信息，附件，人员组织 */}
        {
          this.state.showEmerPlanDetails ? <EmerPlanDetails
            onCancel={(op) => this.handleOpenOrCloseEmerPlanDetails('close')}
            emerPlan={this.state.currentEmerPlanData}
            position={null}
          /> : ''
        }
        {/* 新增应急预案 */}
        {
          this.state.addEmerPlanOpen ? <Dialog
            title="新建应急预案"
            width={635}
            onClose={(op) => this.handleOpenOrCloseAddEmerPlan('close')}
            modal
          >
            <div style={{ margin: 10 }}>
              <form id="emerPlanAdd_form" method="post" encType="multipart/form-data">
                <div>
                  <span>
                    预案名称:<Input type="text" style={{ width: '180px', margin: '0px 14px 0px 8px' }} onChange={this.setEmerPlanName} />
                  </span>
                  <span>所属单位:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      onChange={this.setEmerPlanOwnerUnit}
                    >
                      <Option value={this.props.user.company}>{this.props.user.company}</Option>
                    </Select>
                  </span>
                </div>
                <div style={{ marginTop: 5 }}>
                  <span>预案类型:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      onChange={this.setEmerPlanType}
                    >
                      {
                        this.state.emerPlanTypeData.map((item) => {
                          return (<Option key={item.gid} value={item.gid}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </span>
                  <span style={{ height: 32, lineHeight: '32px' }}>险情分类:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      onChange={this.setEmerPlanEventType}
                    >
                      {
                        dangerData && dangerData.map((item) => {
                          return (<Option key={item.gid} value={item.gid}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </span>
                </div>
                <div>
                  <span style={{ height: 32, lineHeight: '32px' }}>预案附件:
                    <div style={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      margin: '0px 14px 0px 8px',
                    }}
                    >
                      <Upload {...uploadProps}>
                        <Button><Icon type="file-add" />选择附件</Button>
                      </Upload>
                    </div>
                  </span>
                </div>
                <br />
                <Button
                  style={{ marginBottom: 10, marginRight: 8 }}
                  onClick={() => { this.handleAddEmerOrganization('add_add_parent'); }}
                >
                  <Icon type="plus-circle-o" />添加
                </Button>
                <Upload {...orgUploadProps}>
                  <Button
                    style={{ marginBottom: 10, marginRight: 8 }}
                  >
                    <Icon type="upload" /> 批量导入组织
                  </Button>
                </Upload>
                <Button
                  style={{ marginBottom: 10, marginRight: 8 }}
                >
                  <Icon type="download" /><a style={{ textDecoration: 'none' }} href={orgTemplateDownloadUrl}>下载应急组织批量导入模版</a>
                </Button>
                <br />
                <div style={{ border: '1px solid #1890FF' }}>
                  {/* 应急组织机构信息 */}
                  <Table
                    rowKey={(record) => record.gid}
                    size="middle"
                    columns={oragnizationTableColumns}
                    dataSource={this.state.organizationData}
                    scroll={{ x: 200, y: 193 }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: 7 }}>
                  <Button size="small" onClick={(op) => this.handleOpenOrCloseAddEmerPlan('close')}>取消</Button>&nbsp;&nbsp;&nbsp;
                  <Button type="primary" size="small" onClick={this.handleAddEmerPlan}>确认</Button>
                </div>
              </form>
            </div>
          </Dialog> : ''
        }
        {/* 修改应急预案 */}
        {
          this.state.updateEmerPlanOpen ? <Dialog
            title="修改应急预案"
            width={590}
            onClose={(op) => this.handleOpenOrCloseUpdateEmerPlan('close')}
            modal
          >
            <div style={{ margin: 10 }}>
              <form id="emerPlanAdd_form" method="post" encType="multipart/form-data">
                <div>
                  <span>
                    预案名称:<Input type="text" value={this.state.plan_name} style={{ width: '180px', margin: '0px 14px 0px 8px' }} onChange={this.setEmerPlanName} />
                  </span>
                  <span>所属单位:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      value={this.state.plan_ownerUnit}
                      onChange={this.setEmerPlanOwnerUnit}
                    >
                      <Option value={this.props.user.company}>{this.props.user.company}</Option>
                    </Select>
                  </span>
                </div>
                <div style={{ marginTop: 5 }}>
                  <span>预案类型:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      value={this.state.plan_type}
                      onChange={this.setEmerPlanType}
                    >
                      {
                        this.state.emerPlanTypeData.map((item) => {
                          return (<Option key={item.gid} value={item.gid}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </span>
                  <span style={{ height: 32, lineHeight: '32px' }}>险情分类:
                    <Select
                      style={{
                        width: '180px',
                        margin: '0px 14px 0px 8px',
                        display: 'inline-block',
                      }}
                      value={this.state.plan_dangerType}
                      onChange={this.setEmerPlanEventType}
                    >
                      {
                        dangerData && dangerData.map((item) => {
                          return (<Option key={item.gid} value={item.gid}>{item.name}</Option>);
                        })
                      }
                    </Select>
                  </span>
                </div>
                <div>
                  <span style={{ height: 32, lineHeight: '32px' }}>预案附件:
                    <div style={{
                      display: 'inline-block',
                      verticalAlign: 'middle',
                      margin: '0px 14px 0px 8px',
                    }}
                    >
                      <Upload {...uploadProps}>
                        <Button><Icon type="file-add" />选择附件</Button>
                      </Upload>
                    </div>
                  </span>
                </div>
                <br />
                <Button
                  className="editable-add-btn"
                  style={{ float: 'right', marginTop: -40 }}
                  onClick={() => { this.handleAddEmerOrganization('edit_add_parent'); }}
                >
                  <Icon type="add" />添加
                </Button>
                <div style={{ border: '1px solid #1890FF' }}>
                  {/* 应急组织机构信息 */}
                  <Table
                    rowKey={(record) => record.gid}
                    size="middle"
                    columns={oragnizationTableColumns}
                    dataSource={this.state.organizationData}
                    scroll={{ x: 200, y: 193 }}
                  />
                </div>
                <div style={{ textAlign: 'right', marginTop: 7 }}>
                  <Button size="small" onClick={(op) => this.handleOpenOrCloseUpdateEmerPlan('close')}>取消</Button>&nbsp;&nbsp;&nbsp;
                  <Button type="primary" size="small" onClick={this.handleUpdateEmerPlan}>确认</Button>
                </div>
              </form>
            </div>
          </Dialog> : ''
        }
        {/* 新增应急预案人员 */}
        {
          this.state.isShowOrganizationAdd ? <Dialog
            title="新建应急预案人员"
            width={300}
            onClose={this.handleCloseAddEmerPlanPerson}
            modal
          >
            <div style={{ width: '100%', display: 'inline-block', padding: 10 }}>
              <div style={{ width: 85, display: 'inline-block', verticalAlign: 'top' }}>
                <span style={{ float: 'right' }}>组别：</span>
              </div>
              <div style={{
                width: 'calc(100% - 85px)',
                display: 'inline-block',
                verticalAlign: 'top',
              }}
              >
                <Input
                  style={{ width: '150px' }}
                  name="groupName"
                  onChange={this.handleOrganizationChange}
                />
              </div>
            </div>
            <div style={{ width: '100%', display: 'inline-block', padding: 10 }}>
              <div style={{ width: 85, display: 'inline-block', verticalAlign: 'top' }}>
                <span style={{ float: 'right' }}>负责人：</span>
              </div>
              <div style={{
                width: 'calc(100% - 85px)',
                display: 'inline-block',
                verticalAlign: 'top',
              }}
              >
                <Select
                  showSearch
                  style={{ width: '150px' }}
                  name="manger"
                  value={this.state.organizationParams.truename || ''}
                  onChange={this.setEmerPlanOrganization}
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {userOptions}
                </Select>
              </div>
            </div>
            <div style={{ width: '100%', display: 'inline-block', padding: 10 }}>
              <div style={{ width: 85, display: 'inline-block', verticalAlign: 'top' }}>
                <span style={{ float: 'right' }}>组织名称：</span>
              </div>
              <div style={{
                width: 'calc(100% - 85px)',
                display: 'inline-block',
                verticalAlign: 'top',
              }}
              >
                <Input
                  style={{ width: '150px' }}
                  disabled
                  name="groupname"
                  value={organizationParams.groupname ? organizationParams.groupname : ''}
                  onChange={this.handleOrganizationChange}
                />
              </div>
            </div>
            <div style={{ width: '100%', display: 'inline-block', padding: 10 }}>
              <div style={{ width: 85, display: 'inline-block', verticalAlign: 'top' }}>
                <span style={{ float: 'right' }}>电话：</span>
              </div>
              <div style={{
                width: 'calc(100% - 85px)',
                display: 'inline-block',
                verticalAlign: 'top',
              }}
              >
                <Input
                  style={{ width: '150px' }}
                  name="phone"
                  value={organizationParams.phone ? organizationParams.phone : ''}
                  onChange={this.handleOrganizationChange}
                />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button size="small" onClick={this.handleCloseAddEmerPlanPerson}>取消</Button>&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" loading={this.props.btLoading} onClick={() => { this.handleAddEmerPlanPerson(); }}>确认</Button>
            </div>
          </Dialog> : ''
        }
      </div>
    );
  }
}
