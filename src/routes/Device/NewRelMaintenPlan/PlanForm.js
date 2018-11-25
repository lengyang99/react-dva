import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import { Form, Input, Row, Col, Select, Radio, DatePicker, Button, TreeSelect, message } from 'antd';
import _ from 'lodash';
import ReleDeviceTable from './ReleDeviceTable';
import styles from './index.less';

const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const TreeNode = TreeSelect.TreeNode;
const loopStationList = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children') || ele.children.length === 0) {
      return <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.locName} key={`${ele.gid}`} />;
    } else {
      return (
        <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.locName} key={`${ele.gid}`}>
          {loopStationList(ele.children)}
        </TreeNode>
      );
    }
  });
};
@connect(({ device, login}) => ({
  planDetaileData: device.planDetaileData, // 计划详情
  cacheFormData: device.cacheFormData, // 暂存表单信息
  eqTotal: device.eqTotal, // 设备分页总数
  eqData: device.eqData,
  areaId: device.areaId, // 区域id
  areaEqData: device.areaEqData, // 设备数据
  user: login.user,
}))
@Form.create()
export default class PlanForm extends Component {
  constructor(props) {
    super(props);
    this.pathVariable = this.props.location;
    if (this.pathVariable.data) {
      localStorage.setItem('planForm', JSON.stringify(this.pathVariable));
    } else {
      this.pathVariable = JSON.parse(localStorage.getItem('planForm'));
    }
    this.state = {
      workStandardName: this.pathVariable.data.workStandardName, // 作业标准名称s
      stationName: this.pathVariable.data.stationName, // 站点信息
      userid: [], // 用户id信息
      wholeEq: [], // 编辑时当前所有设备
      isSyncEquipment: 0, // 是否按区域制定计划
    };
  }
  eq = null;
  clearFormData = false;
  shwoTree=true;
  componentDidMount() {
    if (this.pathVariable.data.action === 'edit' || this.pathVariable.data.action === 'read') {
      this.props.dispatch({
        type: 'device/getTaskListById',
        payload: {planId: this.pathVariable.data.gid, pageno: 1, pagesize: 10},
      });
      this.initFormData();
    } else {
      this.reduction();
    }
  }
  // 非预览则清空暂存德表单和设备数据
  componentWillUnmount() {
    if (!this.clearFormData) {
      const urlInfo = [
        {params: {}, url: 'cacheFormData'},
        {params: [], url: 'cacheDataSave'},
        {params: 0, url: 'eqTotalSave'},
        {params: [], url: 'userDataSave'},
        {params: '', url: 'areaIdChange'},
      ];
      this.onChangeDataByURLs(urlInfo);
    }
  }
  // 初始化表单数据
  initFormData = () => {
    this.props.dispatch({
      type: 'device/queryPlanDetaile',
      payload: {
        planId: this.pathVariable.data.gid,
      },
      callback: (data) => {
        if (data) {
          const { form} = this.props;
          const { equipmentsInfo, planInfo} = data;
          const { areaId, assigneeIds, assigneeNames, endTime, isSyncEquipment, isMergeTask, name, nextBeginTime, startTime
            , stationId, stationName, status, taskType, workStandardName} = planInfo || {};
          if (this.eq) {
            const targetData = equipmentsInfo && equipmentsInfo.length !== 0 ? equipmentsInfo : [];
            if (planInfo.workObjectType === 3) {
              const gshData = [];
              for (let i = 0; i < targetData.length; i++) {
                gshData.push({
                  gid: targetData[i].gid,
                  customer_desc: targetData[i].houseHoldName,
                  customer_num: targetData[i].houseHoldCode,
                  addr_contract: targetData[i].posDesc,
                  contract_code: targetData[i].contractNum,
                });
              }
              this.eq.targetDataChange(gshData);
              this.saveInitData(gshData);
            } else {
              this.eq.targetDataChange(targetData);
              this.saveInitData(targetData);
            }
          }
          this.initStationData(stationId);
          const fileds = {
            stationId,
            stationName,
            areaId: areaId || null,
            isMergeTask,
            status,
            name,
            assigneeNames: assigneeNames && assigneeNames !== '' ? assigneeNames.split(',') : [],
            endTime: endTime ? moment(endTime, 'YYYY-MM-DD HH:mm') : null,
          };
          if (taskType === 1) {
            Object.assign(fileds, { nextBeginTime: nextBeginTime ? moment(nextBeginTime, 'YYYY-MM-DD HH:mm') : null});
          } else if (taskType === 2) {
            Object.assign(fileds, { startTime: startTime ? moment(startTime, 'YYYY-MM-DD HH:mm') : null});
          }
          const userid = assigneeIds ? assigneeIds.split(',') : [];
          this.setState({workStandardName, userid, isSyncEquipment, stationName});
          form.setFieldsValue(fileds);
        }
      },
    });
  }
  // 还原预览前状态
  reduction = () => {
    const {cacheFormData, form} = this.props;
    if (Object.keys(cacheFormData).length !== 0) {
      const {params, cacheState} = cacheFormData;
      form.setFieldsValue(params);
      if (params.targetData && this.eq) {
        this.eq.targetDataChange(params.targetData);
      }
      this.setState(cacheState);
    }
  }
  // 编辑时暂存当前所有设备
  saveInitData = (data) => {
    const wholeEq = JSON.parse(JSON.stringify(data));
    this.setState({wholeEq});
  }
  // 初始化站点信息
  initStationData = (stationId) => {
    const { stationList } = this.props;
    const stationData = stationList.filter(item => parseInt(item.gid, 10) === stationId)[0] || {};
    this.getAreaTreeData(stationData);
    this.queryUserByStation({ stationId});
  }
  // 初始化设备信息
  getEquInfo = (equData) => {
    if (equData && equData.length !== 0) {
      equData.forEach((item, index) => {
        Object.assign(item, { findex: index + 1 });
      });
    }
  }
  // 获取区域列表
  loopAreaList = (list) => {
    return !Array.isArray(list) ? null : list.map(ele => {
      if (!ele.hasOwnProperty('children') || ele.children.length === 0) {
        return <TreeNode value={parseInt(ele.areaid, 10)} dataRef={ele} title={ele.name} key={`${ele.areaid}`} />;
      } else {
        return (
          <TreeNode value={parseInt(ele.areaid, 10)} dataRef={ele} title={ele.name} key={`${ele.areaid}`}>
            {this.loopAreaList(ele.children)}
          </TreeNode>
        );
      }
    });
  };
   // 根据站点id查用户列表
   queryUserByStation = (params = {}) => {
     this.props.dispatch({
       type: 'device/getUserDataByStation',
       payload: params,
     });
   }
   // 所属组织
  handleStationChange = (value, node) => {
    const stationList = node.props.dataRef;
    this.getAreaTreeData(stationList);
    this.queryUserByStation({ stationId: value});
    this.setState({stationName: stationList.locName});
  }
  // 获取站点下的二级站点
  getAreaTreeData = (stationList) => {
    const locCodes = [];
    let stationid = null;
    if (stationList.children && stationList.children.length !== 0) {
      stationList.children.forEach(item => {
        locCodes.push(item.locCode);
      });
      stationid = locCodes.toString();
    } else {
      stationid = stationList.locCode;
    }
    this.props.form.setFieldsValue({assigneeNames: []});
    this.getAreaData(stationid);
  }
  // 根据站点locode查询区域
  getAreaData = (stationid) => {
    const {functionKey, activeKey, funcList} = this.props;
    const {areaCode} = funcList[`${activeKey}_${functionKey}`] || {};
    this.props.dispatch({
      type: 'device/getAreaData',
      payload: {code: areaCode, identity: 1, stationid},
    });
  }
  // 责任人选择
  onUserChange = (value, option) => {
    const userid = [];
    option.forEach(item => {
      userid.push(item.props.dataRef.userid);
    });
    this.setState({userid});
  }
  // 预览
  preview = () => {
    if (this.state.workStandardName === '') {
      return;
    }
    const {workStandardId, action} = this.pathVariable.data;
    const {form} = this.props;
    const cacheFormData = form.getFieldsValue();
    this.clearFormData = true;
    const urlInfo = [{params: {params: cacheFormData, cacheState: {...this.state}}, url: 'cacheFormData'}];
    this.onChangeDataByURLs(urlInfo);
    const path = {
      data: {
        action: 'read',
        gid: workStandardId,
      },
      pathname: '/equipment/operation-edit',
      historyPageName: `/equipment/plan-${action}`,
    };
    this.props.dispatch(routerRedux.push(path));
  }
  //  批量改变model数据
  onChangeDataByURLs = (data = []) => {
    data.forEach(item => {
      this.props.dispatch({
        type: `device/${item.url}`,
        payload: item.params,
      });
    });
  }
  // 开始时间禁止
  disableStartTime = (startValue) => {
    const {getFieldValue} = this.props.form;
    const endValue = getFieldValue('endTime');
    if (!startValue) {
      return false;
    }
    if (!endValue) {
      return startValue.valueOf() <= moment().add(-1, 'days').valueOf();
    }
    return endValue.valueOf() <= startValue.valueOf() || startValue.valueOf() <= moment().add(-1, 'days').valueOf();
  }
  // 结束时间禁止(需要禁止当前之前时间)
  disableEndTime = (endValue) => {
    const {getFieldValue} = this.props.form;
    const startValue = this.pathVariable.data.taskType === 1 ? getFieldValue('nextBeginTime') : getFieldValue('startTime');
    if (!startValue || !endValue) {
      return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
  }
  // 编辑时 获取增删的设备
  getEqData = (nowEq, wholeEq) => {
    const result = _.intersectionBy(nowEq, wholeEq, 'gid');
    const delEq = _.xorBy(result, wholeEq, 'gid');
    const addEq = _.xorBy(result, nowEq, 'gid');
    const delEqIds = [];
    delEq.forEach(item => {
      delEqIds.push(item.gid);
    });
    return {delEqIds, addEq};
  }
  // 提交表单
  subFormData=(subData) => {
    const {action, gid, taskType} = this.pathVariable.data;
    if (action !== 'add') {
      Object.assign(subData, {gid: parseInt(gid, 10)});
    }
    this.props.dispatch({
      type: `device/${action === 'add' ? 'add' : 'edit'}${taskType === 2 && action === 'add' ? 'Temp' : ''}PreMaintenPlan`,
      payload: subData,
      callback: ({ msg, success }) => {
        if (success) {
          message.success(msg);
          this.props.handleBack();
        } else {
          message.warn(msg);
        }
      },
    });
  }
  // 获取表单
  handleSubmit = (e) => {
    e.preventDefault();
    const { gid, trueName, ecode, cCompany } = this.props.user;
    const {functionKey, functionName, workStandardId, functionGroup, taskType, action, workObjectType} = this.pathVariable.data;
    const { userid, stationName, wholeEq } = this.state;
    const {checked} = this.eq.state;
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {
          name, status, nextBeginTime, stationId, workStandardName, assigneeNames, isMergeTask,
          startTime, endTime, targetData } = values;
        const subData = {
          groupName: functionGroup,
          ecode,
          ename: cCompany,
          name,
          areaId: this.props.areaId || null,
          taskType,
          workObjectType,
          createrId: gid,
          createrName: trueName,
          functionKey,
          functionName,
          stationId,
          stationName,
          assigneeNames: assigneeNames.toString(),
          assigneeIds: userid.toString(),
          workStandardId,
          workStandardName,
          isMergeTask: 0,
          isSyncEquipment: checked ? 1 : 0,
          status: status || 1,
          nextBeginTime: nextBeginTime ? nextBeginTime.format('YYYY-MM-DD HH:mm:ss') : null,
          startTime: startTime ? startTime.format('YYYY-MM-DD HH:mm:ss') : null,
          endTime: endTime ? endTime.format('YYYY-MM-DD HH:mm:ss') : null,
        };
        if (functionGroup === 'household') {
          if (action !== 'add') {
            const { delEqIds, addEq } = this.getEqData(targetData, wholeEq);
            Object.assign(subData, {
              delEqIds: delEqIds.toString(),
              // 根据作业类中关联的是否是设备来设置不同的提交字段
              addEquipments: workObjectType === 3 ?
                JSON.stringify(addEq.map(item => ({
                  eqId: item.gid,
                  houseHoldName: item.customer_desc,
                  houseHoldCode: item.customer_num,
                  posDesc: item.addr_contract,
                  contractNum: item.contract_code,
                  isActive: item.isActive || 1,
                }))) :
                JSON.stringify(addEq.map(item => ({
                  eqId: item.gid,
                  houseHoldName: item.houseHoldName,
                  houseHoldCode: item.houseHoldCode,
                  posDesc: item.posDesc,
                  meterReader: item.meterReader,
                  eqCode: item.eqCode,
                  eqStatus: item.eqStatus,
                  eqName: item.eqName,
                  contractNum: item.contractNum,
                  isActive: item.isActive,
                }))),
            });
          } else {
            Object.assign(subData, {
              // 根据作业类中关联的是否是设备来设置不同的提交字段
              equipments: workObjectType === 3 ?
                JSON.stringify(targetData.map(item => ({
                  eqId: item.eqId ? item.eqId : item.gid,
                  houseHoldName: item.customer_desc,
                  houseHoldCode: item.customer_num,
                  posDesc: item.addr_contract,
                  contractNum: item.contract_code,
                  isActive: item.isActive || 1,
                }))) :
                JSON.stringify(
                  targetData.map(item => ({
                    eqId: item.eqId ? item.eqId : item.gid,
                    houseHoldName: item.houseHoldName,
                    houseHoldCode: item.houseHoldCode,
                    posDesc: item.posDesc,
                    meterReader: item.meterReader,
                    eqCode: item.eqCode,
                    eqStatus: item.eqStatus,
                    eqName: item.eqName,
                    contractNum: item.contractNum,
                    isActive: item.isActive,
                  }))
                ),
            });
          }
        } else if (action !== 'add') {
          const { delEqIds, addEq } = this.getEqData(targetData, wholeEq);
          Object.assign(subData, {
            delEqIds: delEqIds.toString(),
            addEquipments: JSON.stringify(addEq.map(item => ({
              eqId: item.gid,
              eqCode: item.eqCode,
              eqStatus: item.eqStatus,
              eqName: item.eqName,
              posDesc: item.posDesc,
              isActive: item.isActive,
            }))),
          });
        } else {
          Object.assign(subData, {
            equipments: JSON.stringify(
              targetData.map(item => ({
                eqId: item.gid,
                eqCode: item.eqCode,
                eqStatus: item.eqStatus,
                eqName: item.eqName,
                posDesc: item.posDesc,
                isActive: item.isActive,
              }))
            ),
          });
        }
        this.subFormData(subData);
      }
    });
  }
  render() {
    const { form, userData, cacheAreaData, submitting, handleBack, stationList } = this.props;
    const {action, functionGroup, workObjectType, taskType} = this.pathVariable.data;
    const { getFieldDecorator } = form;
    const layout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
      wrapperCol: {
        xs: { span: 28 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };
    const layout2 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        span: 14,
      },
    };
    const areaOptions = (cacheAreaData || []).map(item =>
      <Option key={item.areaid} value={item.areaid} dataRef={item}>{item.name}</Option>
    );
    const assigneeOptions = userData.map(item =>
      <Option value={item.truename} dataRef={item}>{item.truename}</Option>
    );
    return (
      <div >
        <Form >
          <div className={styles['span-button']}>
            <div className={styles.order2} />
            <span style={{ fontSize: 16 }}>基本信息</span>
          </div>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              <FormItem label="所属组织"{...layout2}>
                {getFieldDecorator('stationId', { rules: [{ required: true, message: '请选择所属组织' }], initialValue: null })(
                  <TreeSelect
                    disabled={action === 'read'}
                    showSearch
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="请选择"
                    allowClear
                    onSelect={this.handleStationChange}
                    treeDefaultExpandAll
                    filterTreeNode={(inputValue, treeNode) => treeNode.props.title.indexOf(inputValue) > -1}
                  >
                    {loopStationList(stationList)}
                  </TreeSelect>)}
              </FormItem>
            </Col>
            {/* <Col span={8}>
              <FormItem label="执行区域"{...layout2}>
                {getFieldDecorator('areaId', {
                  initialValue: null,
                })(
                  this.shwoTree ? <TreeSelect
                    disabled={action === 'read'}
                    allowClear
                    treeDefaultExpandAll
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    placeholder="请选择"
                    onSelect={this.onAreaSelect}
                    onChange={this.onAreaChange}
                    filterTreeNode={(inputValue, treeNode) => treeNode.props.title.indexOf(inputValue) > -1}
                  >
                    {this.loopAreaList(areaData)}
                  </TreeSelect> :
                  <Select allowClear disabled={action === 'read'} onChange={this.onAreaChange} onSelect={this.onAreaSelect}>
                    {areaOptions}
                  </Select>
                )}
              </FormItem>
            </Col> */}
            <Col span={8}>
              <FormItem label="责任人"{...layout2}>
                {getFieldDecorator('assigneeNames', { rules: [{ required: true, message: '请选择责任人' }] })(
                  <Select
                    disabled={action === 'read'}
                    mode="multiple"
                    onChange={this.onUserChange}
                  >{assigneeOptions}</Select>
                )}
              </FormItem>
            </Col>
            <Col span={7} />
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              <FormItem label="计划名称"{...layout2}>
                {getFieldDecorator('name', { rules: [{ required: true, message: '请输入计划名称' }], initialValue: '' })(
                  <Input disabled={action === 'read'} placeholder="计划名称" />)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="作业标准"{...layout2}>
                <Col span={18}>
                  <FormItem>
                    {getFieldDecorator('workStandardName', { initialValue: this.state.workStandardName })(
                      <Input readOnly />
                    )}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <Button onClick={this.preview} type="prmary">预览</Button>
                </Col>
              </FormItem>
            </Col>
            <Col span={7} >
              {taskType === 1 ?
                <FormItem label="计划是否启用" {...layout}>
                  {getFieldDecorator('status',
                    { initialValue: 1 })(
                      <RadioGroup disabled={action !== 'add'}>
                        <Radio value={1}>是</Radio>
                        <Radio value={2}>否</Radio>
                      </RadioGroup>)}
                </FormItem>
              : null
            }
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              {taskType === 1 ? <FormItem label="下次开始时间" {...layout2}>
                {getFieldDecorator('nextBeginTime', { rules: [{ required: true, message: '请选择下次开始时间' }], initialValue: null })(
                  <DatePicker
                    disabled={action === 'read'}
                    style={{ width: 270 }}
                    placeholder="下次开始时间"
                    showTime={{defaultValue: moment('00:00:', 'HH:mm')}}
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={this.disableStartTime}
                  />)}
              </FormItem> : <FormItem label="开始时间" {...layout2}>
                {getFieldDecorator('startTime', { rules: [{ required: true, message: '请选择任务类型' }], initialValue: null })(
                  <DatePicker
                    disabled={action === 'read'}
                    style={{ width: 270 }}
                    placeholder="开始时间"
                    showTime={{defaultValue: moment('00:00:', 'HH:mm')}}
                    format="YYYY-MM-DD HH:mm"
                    disabledDate={this.disableStartTime}
                  />)}
              </FormItem>}
            </Col>
            <Col span={8}>
              <FormItem label={taskType === 2 ? '结束时间' : '计划有效时间'}{...layout2}>
                {getFieldDecorator('endTime', { rules: [{ required: taskType === 2, message: '请选择结束时间' }], initialValue: null })(
                  <DatePicker
                    disabled={action === 'read'}
                    disabledDate={this.disableEndTime}
                    style={{ width: 243 }}
                    placeholder="结束时间"
                    showTime={{defaultValue: moment('00:00:', 'HH:mm')}}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={7} />
            {/* <Col span={7} >
               <FormItem label="是否合并生成任务" {...layout}>
                 {getFieldDecorator('isMergeTask',
                {initialValue: 0})(
                  <RadioGroup disabled={action === 'read'}>
                    <Radio value={1}>是</Radio>
                    <Radio value={0}>否</Radio>
                  </RadioGroup>)}
               </FormItem>
             </Col> */}
          </Row>
          <Row>
            <FormItem>
              {getFieldDecorator('targetData', { initialValue: [] })(
                <ReleDeviceTable
                  {...this.props}
                  ref={eq => { this.eq = eq; }}
                  disabled={action}
                  taskType={taskType}
                  workObjectType={workObjectType}
                  functionGroup={functionGroup}
                  isSyncEquipment={this.state.isSyncEquipment}
                />
              )}
            </FormItem>
          </Row>
          <FormItem >
            <Button
              type="button"
              style={action === 'read' ? { left: '46%' } : { left: '42%' }}
              onClick={handleBack}
            >
              返回</Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={(e) => this.handleSubmit(e)}
              style={action === 'read' ? { display: 'none' } : { left: '43%', marginTop: 20 }}
              loading={submitting}
            >提交</Button>
          </FormItem>
        </Form>
      </div >
    );
  }
}
