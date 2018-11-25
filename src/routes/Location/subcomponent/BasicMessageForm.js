import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'dva';
import { Form, Input, Select, Col, Row, DatePicker, Upload, Icon, Button, TreeSelect, notification } from 'antd';
import { uploadAttachmentList, deleteAttachmentList, fetchLocationTree, addAndEditLocationmsg, getCompanyCode } from '../../../services/eqLocation';
import { getUserInfoByEcode, getGroupsTree, fetchImportantLevel, fetchLocationStatus, fetchSiteType, fetchSiteList, fetchPositionType } from '../../../services/eqLedger';
import MarkImg from '../../../assets/TwoDimentionalMark.jpg';
import OrgTree from './OrgTree';

const FormItem = Form.Item;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
let allParentId = [];
const loop = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children')) {
      allParentId.push(ele.id);
      return <TreeNode value={`${ele.id}`} title={`${ele.name}`} key={ele.id.toString()} />;
    } else {
      allParentId.push(ele.id);
      return (
        <TreeNode value={`${ele.id}`} title={`${ele.name}`} key={ele.id.toString()}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};
const loopUserInfoList = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    return <TreeNode value={`${ele.truename}`} title={`${ele.truename}`} key={ele.gid} />;
  });
};
const getOptions = options => options.map(ele => (ele.text === '执行区域' ? null : <Option value={ele.value} key={ele.kid}>{ele.text}</Option>));

@connect(
  state => ({
    ecode: state.login.user.ecode, // 公司代码
    token: state.login.token,
    funs: state.login.funs,
    userInfo: state.login.user,
  })
)
class BasicMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      statusList: [],
      importantList: [], // 重要等级列表
      groupsTreeList: [], // 获取所属组织列表
      userInfoList: [], // 获取责任人列表
      siteTypeList: [],
      siteList: [],
      positionTypeList: [],
      name: '', // 上传附件的名称
      fileList: [], // 上传附件列表
      oldAttachmentListArr: [], // 是否要加载过已上传的附件
      companyCodes: [], // 公司编码
    };
  }
  componentDidMount() {
    this.getGroupsTree();
    this.getUserInfoByEcode();
    this.fetchImportantLevel();
    this.fetchStatusList();
    this.fetchSiteTypeList();
    this.fetchSite();
    this.fetchPositionTypeList();
    this.fetchCompanyCode();
  }
  // 获取责任人列表
  getUserInfoByEcode = () => {
    getUserInfoByEcode({"ecode": this.props.ecode}).then(data => {
      if (data.success) {
        this.setState({ userInfoList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '责任人获取失败',
        });
      }
    });
  };
  // 获取所属组织列表
  getGroupsTree = () => {
    getGroupsTree({'userid': this.props.userInfo.id, 'isfilter': false}).then(data => {
      if (data.success) {
        this.setState({ groupsTreeList: Array.isArray(data.items) ? data.items : [] });
      } else {
        notification.error({
          message: '所属组织获取失败',
        });
      }
    });
  };
  // 获取重要等级列表
  fetchImportantLevel = () => {
    fetchImportantLevel().then(data => {
      if (data.success) {
        this.setState({ importantList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '重要程度获取失败',
        });
      }
    });
  };
  fetchStatusList = () => {
    fetchLocationStatus().then(data => {
      if (data.success) {
        this.setState({ statusList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  };
  fetchSiteTypeList = () => {
    fetchSiteType().then(data => {
      if (data.success) {
        this.setState({ siteTypeList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  };
  fetchSite = () => {
    fetchSiteList().then(data => {
      if (data.success) {
        this.setState({ siteList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  };
  fetchPositionTypeList = () => {
    fetchPositionType().then(data => {
      if (data.success) {
        this.setState({ positionTypeList: Array.isArray(data.data) ? data.data : [] });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  };
  fetchCompanyCode = () => {
    getCompanyCode().then((data) => {
      if (data.success) {
        this.setState({
          companyCodes: data.data,
        });
      } else {
        notification.error({
          message: '获取公司编码失败',
        });
      }
    });
  };
  selectTimes = () => {

  };
  //  提交
  handleSubmit = (e) => {
    e.preventDefault();
    const { fileList } = this.state;
    const { ecode } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const params = Object.assign(values, { gid: this.props.BasicMessageValue.gid });
        params.changedbyTime = undefined;
        params.changedby = undefined;
        params.gmtModified = undefined;
        params.gmtCreate = undefined;
        params.ecode = ecode;
        params.orgCode = values.orgCode || '';
        if (values.parentId === undefined) {
          params.parentId = 0;
        } else {
          const parentid = Number(values.parentId);
          if (isNaN(parentid)) {
            params.parentId = this.props.BasicMessageValue.parentId;
          } else {
            params.parentId = values.parentId;
          }
        }
        addAndEditLocationmsg(params).then((response) => {
          if (response.success) {
            if (fileList.length === 0) { // 无附件有添加，不需要上传附件
              notification.success({
                message: '提交成功',
              });
              this.props.reloadData();
            } else if (!fileList[fileList.length - 1].url) { // 有附件改动，需要上传附件
              const formData = new FormData();
              fileList.forEach(file => formData.append('files[]', file));
              formData.append('gid', response.data);
              uploadAttachmentList(formData).then((data) => {
                if (data.success) {
                  notification.success({
                    message: '提交成功',
                  });
                  this.props.reloadData();
                } else {
                  notification.error({
                    message: '提交失败',
                  });
                }
              });
            } else { // 无附件改动，不需要上传附件
              notification.success({
                message: '提交成功',
              });
              this.props.reloadData();
            }
          } else {
            notification.error({
              message: '提交失败',
            });
          }
        });
      }
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { attachmentListArr, BasicMessageValue, funs, edit, treeData } = this.props;
    const { userInfoList, groupsTreeList, name, fileList, oldAttachmentListArr, statusList, importantList, siteTypeList, siteList, positionTypeList, companyCodes } = this.state;
    let location_add = true; // 设备位置添加
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code === 'location_add') {
        location_add = false;
      }
    }
    const formItemLayout = (x, y) => {
      return {
        labelCol: { span: x },
        wrapperCol: { span: y, push: 1 },
      };
    };
    if (JSON.stringify(attachmentListArr) !== JSON.stringify(oldAttachmentListArr)) {
      this.setState({ fileList: attachmentListArr });
      this.setState({ oldAttachmentListArr: attachmentListArr });
    }
    if (BasicMessageValue.isNewAttachmentList === 1) {
      this.props.BasicMessageValue.isNewAttachmentList = 0;
      this.setState({ fileList: [] });
    }
    const props = {
      name, // 发到后台的文件参数名
      fileList, // 已经上传的文件列表
      multiple: true, // 是否支持多选文件，ie10+ 支持。开启后按住 ctrl 可选择多个文件。
      onRemove: (file) => {
        const status = file.status;
        if (status === 'removed' && file.url) {
          deleteAttachmentList(file.uid).then((data) => {
            if (data.success) {
              notification.success({
                message: '删除成功',
              });
            }
          });
        }
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      // 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。注意：IE9 不支持该方法。
      beforeUpload: (file) => {
        this.setState({ name: file.name || '' });
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
    };
    allParentId = [];
    return (
      <div>
        <div className="title">基础信息</div>
        <Form
          onSubmit={this.handleSubmit}
        >
          <Row gutter={{xs: 0, sm: 8, md: 16}} >
            <Col span={7} key="1">
              <FormItem label="位置类型" {...formItemLayout(7, 16)} >
                {getFieldDecorator('locType', {
                  rules: [{ required: true, message: '位置类型不能为空' }],
                })(
                  <Select
                    placeholder="请选择类型"
                    disabled={!edit}
                  >
                    {getOptions(positionTypeList)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={7} key="2">
              <FormItem label="位置名称" {...formItemLayout(7, 16)} >
                {getFieldDecorator('locName', {
                  rules: [{ required: true, message: '位置名称不能为空' }],
                })(
                  <Input placeholder="请输入名称" disabled={!edit} />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{xs: 0, sm: 8, md: 16}} >
            <Col span={7} key="3">
              <FormItem label="位置编号" {...formItemLayout(7, 16)} >
                {getFieldDecorator('locCode', {
                  rules: [{ required: true, message: '位置名称不能为空' }],
                })(
                  <Input placeholder="编号自动生成" disabled />
                )}
              </FormItem>
            </Col>
            <Col span={7} key="4">
              <FormItem label="站点类型" {...formItemLayout(7, 16)} >
                {getFieldDecorator('stationType', {
                  rules: [{ required: true, message: '站点类型不能为空' }],
                })(
                  <Select
                    placeholder="请选择类型"
                    disabled={!edit}
                  >
                    {getOptions(siteTypeList)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{xs: 0, sm: 8, md: 16}} >
            <Col span={7} key="5">
              <FormItem label="所属站点" {...formItemLayout(7, 16)} >
                {getFieldDecorator('stationId', {
                  initialValue: BasicMessageValue.stationName,
                })(
                  <Select placeholder="请选择站点" disabled={!edit}>
                    {getOptions(siteList)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={7} key="6">
              <FormItem label="父级位置" {...formItemLayout(7, 16)} >
                {getFieldDecorator('parentId', {
                  initialValue: BasicMessageValue.parentName,
                })(
                  <TreeSelect
                    disabled={!edit}
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="请选择父级"
                    allowClear
                    treeDefaultExpandAll
                    filterTreeNode={(inputValue, treeNode) => treeNode.props.value.indexOf(inputValue) > -1 || treeNode.props.title.indexOf(inputValue) > -1}
                  >
                    {loop(treeData)}
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={5} key="7">
              <FormItem label="状态" {...formItemLayout(9, 14)} >
                {getFieldDecorator('locStatus')(
                  <Select placeholder="请选择状态" disabled={!edit}>
                    {getOptions(statusList)}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={5} key="8">
              <FormItem label="重要程度" {...formItemLayout(9, 14)} >
                {getFieldDecorator('impDegree')(
                  <Select placeholder="请选择重要程度" allowClear disabled={!edit}>
                    {importantList.map(ele => <Option value={ele.value} key={ele.kid}>{ele.text}</Option>)}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{xs: 0, sm: 8, md: 16}} >
            <Col span={7} key="9">
              <FormItem label="所属机构" {...formItemLayout(7, 16)} >
                {getFieldDecorator('orgCode')(
                  <OrgTree
                    disabled={!edit}
                    id="orgCode"
                    dataSource={groupsTreeList}
                    placeholder="请选择组织"
                    searchPlaceholder="请输入需要索引的组织"
                  />
                )}
              </FormItem>
            </Col>
            <Col span={7} key="10">
              <FormItem label="所属公司" {...formItemLayout(7, 16)} >
                {getFieldDecorator('ccode')(
                  <Select placeholder="请选择公司" disabled={!edit}>
                    {companyCodes.map(item => (
                      <Option key={item.bwkey}>{item.name}</Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={5} key="11">
              <FormItem label="责任人" {...formItemLayout(9, 14)} >
                {getFieldDecorator('responsible')(
                  <TreeSelect
                    showSearch
                    placeholder="请输入责任人"
                    allowClear
                    treeDefaultExpandAll
                    disabled={!edit}
                  >
                    {loopUserInfoList(userInfoList)}
                  </TreeSelect>
                )}
              </FormItem>
            </Col>
            <Col span={5} key="12">
              <FormItem label="变更人" {...formItemLayout(9, 14)} >
                {getFieldDecorator('changedby')(
                  <Input disabled />
                )}
              </FormItem>
            </Col>
            <Col span={7} key="13">
              <FormItem label="变更日期" {...formItemLayout(7, 16)} >
                {getFieldDecorator('changedbyTime')(
                  <DatePicker disabled style={{ width: '100%' }} onChange={this.selectTimes} />
                )}
              </FormItem>
            </Col>
            <Col span={7} key="14">
              <FormItem label="附件  " {...formItemLayout(7, 16)} >
                <Upload {...props}><Button disabled={location_add}><Icon type="upload" />上传文件</Button></Upload>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={2} offset={20} key="15">
              <FormItem>
                {
                  edit ?
                    (<Button
                      type="primary"
                      htmlType="submit"
                      disabled={location_add}
                    >
                      保存
                    </Button>) :
                    null
                }
              </FormItem>
            </Col>
          </Row>
          <div style={{ width: 100, height: 100, backgroundColor: '#778899', position: 'absolute', right: '150px', top: '100px' }}>
            <img style={{ width: '100%', height: '100%' }} src={MarkImg} alt="QR Code" />
          </div>
        </Form>
      </div>
    );
  }
}

const BasicMessageForm = Form.create({
  mapPropsToFields: (props) => {
    console.log(props);
    // console.log(allParentId.find(item => item === `${props.BasicMessageValue.parentId}`));
    return {
      locType: Form.createFormField({
        value: props.BasicMessageValue.locType,
      }),
      locName: Form.createFormField({
        value: props.BasicMessageValue.locName,
      }),
      locCode: Form.createFormField({
        value: props.BasicMessageValue.locCode,
      }),
      stationId: Form.createFormField({
        value: (props.BasicMessageValue.stationId === '0' ||
        props.BasicMessageValue.stationId === 0 ||
        props.BasicMessageValue.stationId === undefined ||
        props.BasicMessageValue.stationId === null) ?
          undefined :
          props.BasicMessageValue.stationId,
      }),
      parentId: Form.createFormField({
        value: props.BasicMessageValue.parentId === 0 ?
          undefined :
          (allParentId.find(item => item === props.BasicMessageValue.parentId) ?
            `${props.BasicMessageValue.parentId}` : props.BasicMessageValue.parentName),
      }),
      stationType: Form.createFormField({
        value: props.BasicMessageValue.stationType === null ?
          undefined :
          props.BasicMessageValue.stationType,
      }),
      locStatus: Form.createFormField({
        value: props.BasicMessageValue.locStatus,
      }),
      impDegree: Form.createFormField({
        value: props.BasicMessageValue.impDegree === null ?
          undefined :
          props.BasicMessageValue.impDegree,
      }),
      responsible: Form.createFormField({
        value: props.BasicMessageValue.responsible,
      }),
      changedby: Form.createFormField({
        value: props.BasicMessageValue.changedby,
      }),
      changedbyTime: Form.createFormField({
        value: props.BasicMessageValue.changedbyTime === null ? undefined : moment(props.BasicMessageValue.changedbyTime),
      }),
      orgCode: Form.createFormField({
        value: props.BasicMessageValue.orgCode,
      }),
      ccode: Form.createFormField({
        value: props.BasicMessageValue.ccode,
      }),
    };
  },
  onValuesChange: (props, value) => {
    props.onValueChange(props, value);
  },
})(BasicMessage);

export default BasicMessageForm;
