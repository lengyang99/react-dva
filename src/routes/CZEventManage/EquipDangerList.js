import React from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { stringify } from 'qs';
import { Modal, Button, DatePicker, message, Table, Select, Input, Menu, Dropdown, Icon } from 'antd';
import EcityMap from '../../components/Map/EcityMap';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SelectPanel from '../commonTool/SelectPanelTool/SelectPanel';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel';
import SubmitForm from '../commonTool/SubmitFormModal/SubmitFormModal.js';
import { getCurrTk } from '../../utils/utils.js';
import styles from './EquipDangerList.less';

const { RangePicker } = DatePicker;
const confirm = Modal.confirm;
const Option = Select.Option;
const defaultParams = {
  eventState: '', // 事件状态
  eventType: '15', // 事件类型
  repairType: '', // 隐患类型
  repairTypeTree: [], // 隐患类型数据
  woType: '', // 工单类型
  timeFieldName: 'reporttime',
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  showModal: false,
  isShowMap: false,
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  eventTotal: state.equipRepair.eventTotal,
  eventData: state.equipRepair.eventData,
  fields: state.equipRepair.fields,
  // eventTypeData: state.event.eventTypeData,
  checkNum: state.equipRepair.checkNum,
  stationData: state.patrolPlanList.stationData,
  startFormData: state.equipRepair.startFormData,
  // stations:state.event.stations,
}))

export default class DangerList extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    let params = this.tool.params ? { ...this.tool.params } : { ...defaultParams };
    this.geom = {}; // 记录上报坐标信息
    this.transferType = ''; // 记录当前转工单的事件类型
    this.repairType = [];
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      // 参数
      params: { ...params },
      showModal: false, // 是否展示模态框
      ModelData: {}, // 相关按钮内的值
      // isExpand: false, // 是否展开
      // tableHieght: window.innerHeight - 370,
      loading: false,
    };
    this.locCode = {}; // 当前 处理组织 //所属组织
    this.locCodeArr = []; // 处理组织  //所属组织
  }

  componentDidMount() {
    // this.getEventTypeData();
    this.showRectify();
    // this.getStations();
  }

  componentWillUnmount() {

  }

  showRectify = () => {
    if (this.tool.rectify === '10000001') {
      confirm({
        title: '是否反馈整改结果',
        content: '是否反馈整改结果',
        okText: '是',
        cancelText: '否',
        onOk: () => {
          this.changeRectifyState(this.tool.eventid, 1);
        },
        onCancel: () => {
          this.changeRectifyState(this.tool.eventid, 0);
        },
      });
    } else {
      this.getEventData();
    }
  }

  changeRectifyState = (eventId, state) => {
    this.props.dispatch({
      type: 'equipRepair/updateEvent',
      payload: {
        eventid: eventId,
        data: JSON.stringify({ report_rectify: state }),
      },
      callback: (res) => {
        this.getEventData();
      },
    });
  }

  // 获取事件数据
  getEventData = (type) => {
    let data = {};
    let properties = {
      where: '1=1',
    };
    let params = this.state.params;
    if (this.props.user.gid !== '') {
      data.userid = this.props.user.gid;
    }

    if (params.eventState !== 'all' && params.eventState !== '' && params.eventState != null) {
      properties.eventstate = params.eventState;
    }
    if (params.eventType !== '') {
      properties.eventtype = defaultParams.eventType;
    }
    if (params.timeFieldName) {
      if (params.stime !== null && params.etime !== null) {
        properties[params.timeFieldName] = params.stime.format('YYYY-MM-DD') + ' 00:00:00~' + params.etime.format('YYYY-MM-DD') + ' 23:59:59';
      }
    }
    if (params.repairType) {
      properties.repairType = params.repairType;
    }
    if (params.woType) {
      properties.repairCategory = params.woType;
    }
    if (params.condition !== '') {
      properties.condition = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno !== '') {
      properties.pageno = params.pageno;
    }
    if (params.pagesize !== '') {
      properties.pagesize = params.pagesize;
    }
    if (this.state.params.loc_code && this.state.params.loc_code !== 'all') {
      properties.locCode = this.state.params.loc_code;
      properties.locArea = this.state.params.loc_area;
    }

    if (type === 'excel') {
      data.token = getCurrTk();
      properties.f = 'excel';
      data.properties = JSON.stringify(properties);
      let url = window.location.origin + `/proxy/event/getRepairEventList?${stringify(data)}`;
      window.open(url);
      return url;
    } else {
      properties.f = 'json';
      data.properties = JSON.stringify(properties);
    }

    this.props.dispatch({
      type: 'equipRepair/getEventData',
      payload: data,
    });
  };

  startProcess = (data, flag) => {
    let that = this;
    if (this.pageType === 'CHManager') {
      this.props.dispatch({
        type: 'equipRepair/getWoPlanStartFormData',
        payload: {
          processDefinitionKey: 'woPlan',
          userid: this.props.user.gid,
          eventid: data.eventid,
        },
        callback: () => {
          this.setState({
            ModelData: data,
            showModal: true,
          });
        },
      });
    } else {
      if ('zzRole'.indexOf(flag) > -1) {
        this.props.dispatch({
          type: 'equipRepair/getCZStartFormData',
          payload: {
            processDefinitionKey: data.process,
            userid: this.props.user.gid,
            eventid: data.eventid,
            flag: flag,
          },
          callback: () => {
            this.setState({
              ModelData: data,
              showModal: true,
            });
          },
        });
      } else {
        this.props.dispatch({
          type: 'equipRepair/getCZStartFormData',
          payload: {
            processDefinitionKey: data.process,
            userid: this.props.user.gid,
            eventid: data.eventid,
          },
          callback: () => {
            this.setState({
              ModelData: data,
              showModal: true,
            });
          },
        });
      }
    }
  };

  // 事件状态改变
  onChangeEventState = (valueObj) => {
    let params = this.state.params;
    params.eventState = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  // 隐患类型改变
  onChangeRepairType = (valueObj) => {
    let params = this.state.params;
    params.repairType = valueObj['repair_type'];
    params.woType = '';
    this.repairType.forEach((item) => {
      if (item.name === params.repairType) {
        params.repairTypeTree = item.selectValues || [];
      }
    });
    this.setState({
      params: params,
    });
    this.getEventData();
  }
  // 处理组织改变
  onChangelocCode = (valueObj) => {
    let params = this.state.params;
    params.loc_code = valueObj;
    this.locCodeArr.forEach(item => {
      if (item.name === valueObj) {
        this.locCode = item;
        params.loc_area = this.locCode.selectValues[0].name;
      }
    });
    this.setState({
      params,
    });
    this.getEventData();
  }
  // 所属组织改变
  onChangelocArea = (valueObj) => {
    let params = this.state.params;
    params.loc_area = valueObj;
    this.setState({
      params,
    });
    this.getEventData();
  }
  // 隐患类别改变
  onChangeWoType = (valueObj) => {
    let params = this.state.params;
    params.woType = valueObj.woType;
    this.setState({
      params: params,
    });
    this.getEventData();
  }

  // 时间字段改变
  onChangeTimeField = (value) => {
    const params = this.state.params;
    params.timeFieldName = value.time;
    this.setState({
      ...params,
      timeFieldName: value.time,
    });
  }

  // 上报时间改变
  onChangeTime = (value) => {
    let params = this.state.params;
    params.stime = value[0];
    params.etime = value[1];
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  // 查询改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.target.value;
    this.setState({
      params: params,
    });
  };

  closeEvent = (event) => {
    let that = this;
    confirm({
      title: '是否关闭事件?',
      onOk() {
        that.props.dispatch({
          type: 'equipRepair/closeEvent',
          payload: {
            eventid: event.eventid,
            status: '3',
          },
          callback: (res) => {
            if (res.success) {
              message.success('事件已关闭');
              that.getEventData();
            }
          },
        });
      },
      onCancel() {
      },
    });
  };

  // 查询
  search = () => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  reportEventClick = (value) => {
    this.props.history.push(`/query/report-eventform?eventtype=${value}`);
  }

  // 重置
  reset = () => {
    let params = this.state.params;
    params.eventState = '';
    params.eventType = defaultParams.eventType;
    params.repairType = '';
    params.woType = '';
    params.timeFieldName = 'reporttime';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    params.loc_area = 'all';
    params.loc_code = 'all';
    this.locCode = this.locCodeArr[0];
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  getWorkOrderDetail = (record) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: record.processinstanceid,
      formid: record.formid,
      workOrderNum: record.wocode,
      params: this.state.params,
      historyPageName: '/station/CZdanger',
    };
    this.props.dispatch(routerRedux.push(path));
  };

  getEventdetail = (record) => {
    let path = {
      pathname: '/event-list-detail',
      eventid: record.eventid,
      eventtype: record.type,
      record: record,
      params: this.state.params,
      historyPageName: this.props.location.pathname,
    };
    this.props.dispatch(routerRedux.push(path));
  };

  getDetail = (record) => {
    if (record.processinstanceid) {
      let path = {
        pathname: '/order/workOrder-list-detail',
        processInstanceId: record.processinstanceid,
        formid: record.formid,
        workOrderNum: record.wocode,
        params: this.state.params,
        historyPageName: this.props.location.pathname,
      };
      this.props.dispatch(routerRedux.push(path));
    } else {
      let path = {
        pathname: '/event-list-detail',
        eventid: record.eventid,
        eventtype: record.typeid,
        params: this.state.params,
        historyPageName: '/station/CZdanger',
      };
      this.props.dispatch(routerRedux.push(path));
    }
  };

  handleCancel = () => {
    this.clearFormData();
  };

  clearFormData = () => {
    this.setState({ showModal: false });
    this.getEventData();
    this.geom = {};
    this.props.dispatch({
      type: 'equipRepair/changeStartFormData',
      payload: {
        params: [],
      },
    });
  };

  handleOk = () => {
    let that = this;
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs['formRef_1'].validateRequired();
    if (validate) {
      message.warning('字段【' + validate + '】为空！');
      return;
    }
    let params = this.refs['formRef_1'].getValues();
    for (let key in params) {
      const param = 'accept_userid';
      if (params.hasOwnProperty(key)) {
        if (key.indexOf(param) > -1) {
          paramsObj[param] = params[key];
        } else {
          paramsObj[key] = params[key];
        }
      }
    }
    paramsObj = { ...paramsObj, ...this.geom };

    let paramsAtt = this.refs['formRef_1'].getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({ name: key, value: paramsAtt[key] });
      }
    }

    this.setState({
      loading: true,
    });
    if (this.state.ModelData.taskId === 'repairRectify') {
      this.submitRepairData(paramsObj, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
        this.getEventData();
      });
    } else if (this.state.ModelData.taskId === 'zhiding') {
      this.submitZhiDingData(paramsObj, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    } else if (this.state.ModelData.taskName === '编辑') {
      this.submitEditData(paramsObj, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    } else {
      this.submitWoProcess(paramsObj);
    }
  }

  submitWoProcess = (paramsObj) => {
    let that = this;
    this.props.dispatch({
      type: 'equipRepair/reportFormEvent',
      payload: {
        userid: this.props.user.gid,
        eventtype: this.transferType,
        properties: JSON.stringify({ eventid: this.state.ModelData.eventid, event_type: this.state.ModelData.typeid, ...paramsObj }),
      },
      callback: (res) => {
        this.transferType = '';
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
          });
          that.getEventData();
        } else {
          message.error(res.msg);
        }
      },
    });
  }

  submitRepairData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'equipRepair/submitRepairFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: this.eventid,
        params: JSON.stringify(paramsObj),
      },
      callback: (res) => {
        callback && callback(res);
      },
    });
  }

  submitZhiDingData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'equipRepair/submitZhiDingFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: this.zhiDingId,
        params: JSON.stringify(paramsObj),
      },
      callback: (res) => {
        callback && callback(res);
      },
    });
  }
  submitEditData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'equipRepair/submitEditFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: this.state.ModelData.eventid,
        eventtype: this.state.ModelData.typeid,
        properties: JSON.stringify(paramsObj),
      },
      callback: (res) => {
        callback && callback(res);
        if (res.success) {
          this.setState({
            ModelData: {},
          });
          this.getEventData();
        } else {
          message.error(res.msg);
        }
      },
    });
  }

  submitAttach = (res, paramsAttArray, paramsObj) => {
    // 上报成功之后再上报附件
    // 当存在附件字段提交附件
    if (paramsAttArray.length > 0) {
      this.props.dispatch({
        type: 'equipRepair/submitAttach',
        formData: paramsAttArray,
        attInfo: res.data,
        userInfo: this.props.user,
        callback: (resAtt) => {
          if (resAtt) {
            message.info('上报成功');
            this.setState({ showModal: false, loading: false });
          }
        },
      });
    } else {
      message.info('上报成功');
      this.setState({ showModal: false, loading: false });
    }
  }

  // 获取整改反馈表单
  getRepairFormData = (record) => {
    this.props.dispatch({
      type: 'equipRepair/getRepairFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.eventid = record.eventid;
        this.setState({
          loading: false,
          ModelData: { taskName: '整改反馈', taskId: 'repairRectify' },
          showModal: true,
        });
      },
    });
  }

  // 获取隐患方案制定表单
  getZhiDingFormData = (record) => {
    this.props.dispatch({
      type: 'equipRepair/getZhiDingFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.zhiDingId = record.eventid;
        this.setState({
          loading: false,
          ModelData: { taskName: '隐患方案制定', taskId: 'zhiding' },
          showModal: true,
        });
      },
    });
  }


  getWoStartFormData = (record, btn) => {
    if (!btn.eventtype) {
      return;
    }
    this.transferType = btn.eventtype;
    this.props.dispatch({
      type: 'equipRepair/getFormData',
      payload: {
        eventtype: btn.eventtype,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.setState({
          loading: false,
          ModelData: {
            taskName: btn.name,
            taskId: btn.value,
            eventid: record.eventid,
            typeid: record.type,
          },
          showModal: true,
        });
      },
    });
  }

  onClickGeomBtn = (name) => {
    // this.map.getMapDisplay().clear();
    this.setState({
      showModal: false,
      isShowMap: true,
    });
  };

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      showModal: true,
      isShowMap: false,
    });
  }

  getMap = () => {
    return this.map;
  }

  backToForm = () => {
    this.setState({
      isShowMap: false,
      showModal: true,
    });
  }
  editDetails = (dd, name) => {
    this.props.dispatch({
      type: 'equipRepair/getEventEditInfo',
      payload: {
        eventid: dd.eventid,
        eventtype: dd.type,
        plat: 'web',
      },
      callback: (res) => {
        this.setState({
          showModal: true,
          loading: false,
          ModelData: {
            taskName: name,
            eventid: dd.eventid,
            typeid: dd.type,
          },
        });
      },
    });
  }

  render() {
    const that = this;
    const fieldData = [
      {
        name: '全部',
        value: 'all',
        more: '0',
        showDot: true,
      },
      {
        name: '待处理',
        value: '0',
        more: '0',
        showDot: true,
      },
      {
        name: '处理中',
        value: '1',
        more: '0',
        showDot: true,
      },
      {
        name: '已处理',
        value: '2',
        more: '0',
        showDot: true,
      },
    ];

    const eventStateData = fieldData.map((oneState) => {
      let state = oneState;
      this.props.checkNum.forEach((item) => {
        if (oneState.value == item.state) {
          state = { ...oneState, more: item.value };
        }
      });
      return state;
    });

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/隐患情况/隐患位置',
      valueType: 'input',
      width: '200px',
    }];

    const action = (dd) => {
      let dobtn = [];
      let btn = [];
      try {
        btn = JSON.parse(dd.btn);
      } catch (e) {
        console.error(e);
      }

      if (btn.length === 1) {
        if (btn[0].key === 'rectifyFeedback') {
          dobtn = (
            <span
              style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
              onClick={that.getRepairFormData.bind(that, dd)}
            >{btn[0].value}</span>
          );
        } else if (btn[0].key === '') {
          dobtn.push(
            <span
              style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
              onClick={that.startProcess.bind(that, dd)}
            >巡视跟踪</span>
          );
        } else if (btn[0].key === 'eventEdit') {
          dobtn.push(
            <span
              style={{ marginLeft: 20, cursor: 'pointer', color: '#1890ff' }}
              onClick={that.editDetails.bind(that, dd, '编辑')}
            >编辑</span>
          );
        } else if (btn[0].key === 'repairNew' || btn[0].key === 'rescueEmer' || btn[0].key === 'changetube' || btn[0].key === 'repairTG') {
          dobtn.push(
            <span
              style={{ marginLeft: 20, cursor: 'pointer', color: '#1890ff' }}
              onClick={this.getWoStartFormData.bind(this, dd, btn[0])}
            >{btn[0].value}</span>
          );
        }
      } else if (btn.length > 1) {
        const menus = [];
        for (let i = 0; i < btn.length; i++) {
          if (btn[i].key === 'zhiding') {
            dobtn.push(
              <span
                style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                onClick={this.getZhiDingFormData.bind(this, dd)}
              >{btn[i].value}</span>
            );
          } else if (btn[i].key === 'rectifyFeedback') {
            dobtn.push(
              <span
                style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                onClick={that.getRepairFormData.bind(that, dd)}
              >{btn[i].value}</span>
            );
          } else if (btn[i].key === 'eventEdit') {
            dobtn.push(
              <span
                style={{ margin: '0 20px', cursor: 'pointer', color: '#1890ff' }}
                onClick={that.editDetails.bind(that, dd, '编辑')}
              >编辑</span>
            );
          } else {
            menus.push(
              <Menu.Item key={i}>
                <a href="javascript:void(0)" onClick={this.getWoStartFormData.bind(this, dd, btn[i])}>{btn[i].value}</a>
              </Menu.Item>
            );
          }
        }
        if (menus.length > 0) {
          const menuDiv = (<Menu>{menus}</Menu>);
          dobtn.push(
            <Dropdown overlay={menuDiv} trigger={['click']}>
              <a style={{ textDecoration: 'none' }} className="ant-dropdown-link" href="javascript:void(0)">
                隐患处理 <Icon type="down" />
              </a>
            </Dropdown>
          );
        }
      }
      return (
        <span style={{ float: 'left' }}>
          {/* <span style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}} onClick={that.getEventdetail.bind(that, dd)}>详情</span> */}
          {dobtn}
        </span>);
    };

    const cols = [
      {
        title: '隐患编号',
        width: 140,
        fixed: 'left',
        dataIndex: 'eventid',
        key: 'eventid',
      },
      {
        title: '地点',
        dataIndex: 'address',
        width: 180,
        key: 'address',
        render: (text, record, index) => {
          let textValue = text;
          if (text.indexOf('{') >= 0 && text.indexOf('}') >= 0) {
            let tmpJson = JSON.parse(text);
            textValue = tmpJson.name;
          }
          return <span title={textValue}>{textValue}</span>;
        },
      },
      {
        title: '现场描述',
        width: 160,
        dataIndex: 'remark',
        key: 'remark',
        render: (text, record, index) => <span title={text}>{text}</span>,
      },
      {
        title: '隐患类别',
        width: 140,
        dataIndex: 'repair_category',
        key: 'repair_category',
        render: (text, record, index) => <span title={text}>{text}</span>,
      },
      {
        title: '上报时间',
        width: 180,
        dataIndex: 'reporttime',
        key: 'reporttime',
      },
      {
        title: '上报人',
        width: 180,
        dataIndex: 'reporter',
        key: 'reporter',
      },
      // {
      //   title: '要求完成时间',
      //   width: 180,
      //   // dataIndex:'occurrenttime',
      //   key: 'ask_finish_time',
      //   render: (text, record, index) => <span>{record.occurrenttime}</span>,
      // },
      {
        title: '状态',
        dataIndex: 'statename',
        width: 90,
        key: 'statename',
      },
      // {
      //   title: '处理人',
      //   dataIndex: 'deal_person',
      //   width: 180,
      //   key: 'deal_person',
      // },
      {
        title: '整改情况',
        width: 140,
        dataIndex: 'rectify_situation',
        key: 'rectify_situation',
      },
      {
        title: '整改时间',
        width: 140,
        dataIndex: 'rectify_time',
        key: 'rectify_time',
      },
      // {
      //   title: '关联工单',
      //   // dataIndex:'wocode',
      //   width: 140,
      //   key: 'wocode',
      //   render: (text, record) => {
      //     return (<a onClick={that.getWorkOrderDetail.bind(that, record)} >{record.wocode}</a>);
      //   },
      // },
      {
        title: '操作',
        fixed: 'right',
        width: 250,
        render: (text, record) => {
          return <span>{action(record)}</span>;
        },
      },
    ];

    const typeFields = [];
    const repairType = {
      name: 'repair_type',
      alias: '隐患类型',
      value: this.state.params.repairType,
      valueType: 'ddl',
      width: '110px',
      selectValues: [],
    };

    repairType.selectValues.push({ name: '全部', value: '' });
    this.props.fields.forEach((item) => {
      if (item.name === 'repair_category') {
        this.repairType = item.selectValues;
        item.selectValues.forEach((itemType) => {
          repairType.selectValues.push({
            name: itemType.alias,
            value: itemType.name,
          });
        });
      }
    });
    typeFields.push(repairType);

    const woFields = [];
    const repairCategoryTree = [{ alias: '全部', name: '', selectValues: [] }];
    if (this.state.params.repairTypeTree) {
      repairCategoryTree[0].selectValues = this.state.params.repairTypeTree;
    }
    const repairCategory = {
      name: 'woType',
      alias: '隐患类别',
      value: this.state.params.woType,
      valueType: 'tree',
      width: '110px',
      selectValues: repairCategoryTree,
    };
    woFields.push(repairCategory);

    // 表格分页
    const pagination = {
      total: parseInt(that.props.eventTotal, 10),
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getEventData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getEventData();
      },
      showTotal: function () {
        // 设置显示一共几条数据
        return <div style={{ marginRight: this.width }}>共 {this.total} 条数据</div>;
      },
    };

    // 处理组织
    let locCodeOptions = null;
    // 所属组织
    let locAreaOptions = null;
    if (!this.state.params.loc_area) {
      // 初始化
      this.props.fields.forEach((item) => {
        if (item.name === 'loc_code') {
          if (item.selectValues.length > 0) {
            this.locCodeArr = item.selectValues;
            this.locCodeArr.unshift({ name: 'all', alias: '全部', selectValues: [{ name: 'all', alias: '全部' }] });
            this.locCode = item.selectValues[0];
          }
        }
      });
    }
    if (this.locCode.name) {
      locCodeOptions = this.locCodeArr.map(city => <Option key={city.name}>{city.alias}</Option>);
      if (this.locCode.selectValues.length > 0) {
        locAreaOptions = this.locCode.selectValues.map(city => <Option key={city.name}>{city.alias}</Option>);
      }
    }
    return (
      <PageHeaderLayout>
        <div style={{ width: '100%', minHeight: 'calc(100vh - 175px)' }}>
          {!this.state.isShowMap ?
            <div style={{ width: '100%', height: '100%' }}>
              <SelectPanel
                fieldName="事件状态"
                value={this.state.params.eventState}
                dataType="ddl"
                showMoreInfo={true}
                data={eventStateData}
                onclick={this.onChangeEventState}
              />
              <div style={{ marginTop: '5px' }}>
                <SearchPanel style={{ float: 'left' }} field={typeFields} onclick={this.onChangeRepairType.bind(this)} />
                <div style={{ float: 'left', marginLeft: '30px' }}>
                  <span>处理组织：</span>
                  <Select
                    value={this.locCode.name}
                    onChange={this.onChangelocCode.bind(this)}
                    style={{ width: 150 }}
                  >
                    {locCodeOptions}
                  </Select>
                </div>
                <div style={{ float: 'left', marginLeft: '10px' }}>
                  <span>所属组织：</span>
                  <Select
                    value={this.state.params.loc_area ? this.state.params.loc_area : this.locCode.name ? (this.locCode.selectValues[0] ? this.locCode.selectValues[0].name : '') : ''}
                    onChange={this.onChangelocArea.bind(this)}
                    style={{ width: 150 }}
                  >
                    {locAreaOptions}
                  </Select>
                </div>
                <span style={{ marginLeft: '30px', marginRight: '10px' }}>快速查询:</span>
                <Input style={{ width: '270px' }} placeholder="隐患编号/地点/现场描述/上报人/处理人/处理措施" onChange={this.onChangeCondition.bind(this)} />
                <div style={{ clear: 'both' }}></div>
              </div>
              <div style={{ marginTop: '5px' }}>
                <SearchPanel style={{ float: 'left', marginRight: '30px' }} field={woFields} onclick={this.onChangeWoType.bind(this)} />
                <SearchPanel style={{ float: 'left', marginRight: '10px' }} field={[{ name: 'time', alias: '时间过滤', valueType: 'ddl', value: this.state.params.timeFieldName, width: '150px', selectValues: [{ name: '上报时间', value: 'reporttime' }, { name: '要求完成时间', value: 'finishtime' }] }]} onclick={this.onChangeTimeField} />
                <RangePicker
                  style={{ width: '248px' }}
                  value={[this.state.params.stime, this.state.params.etime]}
                  onChange={this.onChangeTime}
                />
                <Button type="primary" style={{ marginLeft: '30px' }} onClick={this.getEventData.bind(this)}>查询</Button>
                <Button style={{ marginLeft: '10px' }} onClick={this.reset.bind(this)}>重置</Button>
                <Button type="primary" style={{ marginLeft: '40px' }} onClick={this.reportEventClick.bind(this, '15')}>
                  隐患上报
                </Button>
                <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.getEventData.bind(this, 'excel')}>
                  导出
                </Button>
              </div>
              <Table
                style={{ marginTop: '10px' }}
                rowKey={(record) => record.eventid}
                dataSource={this.props.eventData}
                columns={cols}
                pagination={pagination}
                showHeader={true}
                scroll={{ x: 1550 }}
                onRow={(record, index) => ({
                  onDoubleClick: () => {
                    this.getEventdetail(record);
                  },
                })}
              />
            </div> : null}
          <div style={{
            width: '100%',
            height: 'calc(100vh - 175px)',
            display: this.state.isShowMap ? 'block' : 'none',
          }}
          >
            <div style={{ width: '100%', height: '35px', paddingTop: '2px' }}>
              <Button onClick={this.backToForm}>返回</Button>
            </div>
            <EcityMap
              mapId="repairMap"
              onMapLoad={(aMap) => {
                this.map = aMap;
              }}
            />
          </div>
        </div>
        <Modal
          width="770px"
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          wrapClassName="web"
          footer={null}
          onOk={this.handleOk}
          title={this.state.showModal.taskName || this.props.startFormData.tableName || '编辑'}
        >
          <div style={{ display: 'block' }}>
            <SubmitForm
              data={this.props.startFormData.params}
              cascade={this.props.startFormData.cascade || []}
              getMap={this.getMap}
              geomSelectedPoint={this.geomSelectedPoint.bind(this)}
              geomHandleClick={this.onClickGeomBtn.bind(this)}
              column={2}
              ref="formRef_1"
            />
          </div>
          <div style={{ height: '30px', marginTop: '25px' }}>
            <Button
              style={{ float: 'right', marginLeft: '15px', marginRight: '30px' }}
              onClick={this.handleCancel.bind(this)}
            >
              取消
            </Button>
            <Button
              type="primary"
              style={{ float: 'right' }}
              loading={this.state.loading}
              onClick={this.handleOk.bind(this)}
            >
              确定
            </Button>
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
