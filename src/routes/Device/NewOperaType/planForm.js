import React, { Component } from 'react';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import update from 'immutability-helper';
import { Form, Input, Row, Col, Select, Radio, Button, message} from 'antd';
import EqConfig from './EqConfig';
import NewCaterModal from '../OperaCaterManger/NewCaterModal';

import styles from './index.less';

const Option = Select.Option;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const check = (value) => {
  if (value === '' || (value !== 0 && !value)) {
    return 0;
  }
  return 1;
};
@connect(({ operationStandard, login }) => ({
  typeDetailData: operationStandard.typeDetailData, // 作业类型详情
  operaData: operationStandard.operaData, // 作业标准
  eqTypeData: operationStandard.eqTypeData, // 设备类型
  catergoryData: operationStandard.catergoryData, // 类型分类
  cacheFormData: operationStandard.cacheFormData, // 暂存表单
  areaTypeData: operationStandard.areaTypeData, // 区域分组
  functionGroup: operationStandard.functionGroup, // 应用场景
  eventList: operationStandard.eventList, // 作业流程
  user: login.user,
}))
@Form.create()
export default class PlanForm extends Component {
  constructor(props) {
    super(props);
    this.pathVariable = this.props.location;
    if (this.pathVariable.data) {
      localStorage.setItem('workType', JSON.stringify(this.pathVariable));
    } else {
      this.pathVariable = JSON.parse(localStorage.getItem('workType'));
    }
    this.state = {
      functionName: '',
      functionKey: '',
      delEqIds: '',
      workTypeData: [{gid: 1, name: '设备'}, {gid: 3, name: '工商户'}],
      record: {action: 'new'},
    };
  }
  feed = null ;
  eqConfigForm = null ;
  clearFormData = false;
  componentDidMount() {
    const {eventList, functionGroup, areaTypeData, cacheFormData, eqTypeData} = this.props;
    const { action, workStandardName} = this.pathVariable.data || {};
    // 获取作业标准
    this.props.dispatch({
      type: 'operationStandard/getOperationData',
      callback: (data) => {
        if (data && workStandardName) {
          const target = data.filter(item => item.workStandardName === workStandardName)[0] || {};
          this.props.form.setFieldsValue({workStandardId: target.gid});
        }
      },
    });
    // 获取作业流程
    if (!eventList || eventList.length === 0) {
      this.props.dispatch({
        type: 'operationStandard/getEventList',
        payload: {type: 'wb'},
      });
    }
    // 获取类型分类
    this.props.dispatch({
      type: 'operationStandard/getCatergoryData',
    });
    // 获取应用场景
    if (functionGroup || functionGroup.length === 0) {
      this.props.dispatch({
        type: 'operationStandard/getFunctionGroup',
      });
    }
    // 获取区域类型
    if (!areaTypeData || areaTypeData.length === 0) {
      this.props.dispatch({
        type: 'operationStandard/getAreaType',
      });
    }
    // 获取设备设置条件
    if (!eqTypeData || eqTypeData.length === 0) {
      this.props.dispatch({
        type: 'operationStandard/getEqTypeData',
      });
    }
    if (action === 'edit' || action === 'copy' || action === 'read') {
      this.initFormData();
    }
    const {params} = cacheFormData || {};
    if (params && Object.keys(params).length !== 0) {
      this.restore();
    }
  }
  componentWillUnmount() {
    if (!this.clearFormData) {
      this.cacheFormData();
      this.saveTypeDetailData();
    }
  }
  // 初始化表单数据
  initFormData = () => {
    // functionKey为作业类型的key 前台给出 parentName为类型分类的名称
    this.props.dispatch({
      type: 'operationStandard/readOperaType',
      payload: {
        functionId: this.pathVariable.data.gid,
      },
      callback: (data) => {
        if (data) {
          const {functionKey, parentName, functionEquipmentTypes} = this.props.typeDetailData || {};
          const delEquipmentTypeIds = [];
          (functionEquipmentTypes || []).forEach(item => {
            delEquipmentTypeIds.push(item.gid);
          });
          const delEqIds = delEquipmentTypeIds.toString();
          this.setState({functionName: parentName, functionKey, delEqIds});
        }
      },
    });
  }
  // 查询作业表准详情
  queryOperationStandard = (value) => {
    this.props.dispatch({
      type: 'operationStandard/readOperaStandard',
      payload: {
        workStandardId: value,
      },
    });
  }
  // 选择作业标准
  onWorkStandSelect = (value) => {
    // this.queryOperationStandard(value);
  }
  // 新建 或者 预览
  onOperateWorkStandard = (action) => {
    const {form} = this.props;
    const cacheFormData = form.getFieldsValue();
    this.clearFormData = true;
    this.cacheFormData({params: cacheFormData, cacheState: {...this.state}});
    const path = {
      data: {
        action,
        power: this.pathVariable.data.action,
        gid: form.getFieldValue('workStandardId') || null,
      },
      pathname: `/equipment/operation-${action === 'read' ? 'edit' : action}`,
      historyPageName: `/equipment/operaType-${this.pathVariable.data.action}`,
    };
    this.props.dispatch(routerRedux.push(path));
  }
  restore = () => {
    const {form, cacheFormData} = this.props;
    const {cacheState, params} = cacheFormData || {};
    form.setFieldsValue(params);
    this.setState(cacheState);
  }
  onOperaCater = () => {
    if (this.modal) {
      this.modal.handleCancel();
    }
  }
  // 缓存表单
  cacheFormData = (params = {}) => {
    this.props.dispatch({
      type: 'operationStandard/cacheFormData',
      payload: params,
    });
  }
  //  清空详情数据
  saveTypeDetailData = (params = {}) => {
    this.props.dispatch({
      type: 'operationStandard/saveTypeDetailData',
      payload: params,
    });
  }
  // 校检
  handleCheckAlias = (rule, value, callback2, type) => {
    // 如果处于编辑状态下的校检名称，当前名称不会作为重名依据
    const pattern = /^[A-Za-z]+$/;
    if (value === '') {
      callback2(`请输入作业类型${type === 'name' ? '名称' : '英文名'}`);
    } else if (type === 'key' && !pattern.test(value)) {
      callback2('请输入英文名称');
    } else {
      const params = type === 'name' ? { functionName: value } : { functionKey: value };
      if (this.pathVariable.data.action === 'edit') {
        Object.assign(params, { gid: this.pathVariable.data.gid });
      }
      this.props.dispatch({
        type: 'operationStandard/validateFunction',
        payload: params,
        callback: (res) => {
          if (res.data && res.data.length !== 0) {
            callback2(`已经存在该作业类型${type === 'name' ? '名称' : '英文名'},请重新输入`);
          } else {
            callback2();
          }
        },
      });
    }
    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    // callback();
  }
  // 提交表单
  subFormData=(subData) => {
    if (this.pathVariable.data.action === 'edit') {
      Object.assign(subData, {gid: parseInt(this.pathVariable.data.gid, 10)});
    }
    this.props.dispatch({
      type: `operationStandard/${this.pathVariable.data.action === 'edit' ? 'edit' : 'add'}OperaType`,
      payload: subData,
      callback: ({ msg, success }) => {
        if (success) {
          message.success(msg);
          this.handleBack();
        } else {
          message.warn(msg);
        }
      },
    });
  }
  // 获取表单
  handleSubmit = (e) => {
    const {gid, trueName, ecode, cCompany} = this.props.user;
    const {functionName} = this.state;
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const {isSetEquipment} = values;
        let equipmentChoices = null;
        let delEqIds = null;
        let flag = true;
        if (isSetEquipment === 1 && this.eqConfigForm) {
          const {eqData: eq, delPropertyIds, delParameterIds, delEquipmentTypeIds} = this.eqConfigForm.state;
          const eqData = [];
          let delEqProIds = null;
          let delEqParamIds = null;
          delEqIds = delEquipmentTypeIds.toString();
          eq.forEach((item, index) => {
            if (item.uuid) {
              delete item.uuid;
            }
            if (item.gid && delPropertyIds[item.gid]) {
              delEqProIds = delPropertyIds[item.gid].toString();
            } else {
              delEqProIds = null;
            }
            if (item.gid && delParameterIds[item.gid]) {
              delEqParamIds = delParameterIds[item.gid].toString();
            } else {
              delEqParamIds = null;
            }
            if (item.equipmentType === '' || !item.equipmentType) {
              flag = false;
            }
            const properData = [];
            const parametersData = [];
            (item.properties || []).forEach((item2, index2) => {
              if (item2.ugid) {
                delete item2.ugid;
              }
              const sum = check(item2.propertyName) + check(item2.propertyValue) + check(item2.isUse);
              if (sum > 0 && sum < 3) {
                flag = false;
              }
              if (sum === 3) {
                properData.push(item2);
              }
              if (sum === 0) {
                delEqProIds = delEqProIds ? delEqProIds + item2.gid ? `${item2.gid}` : '' : item2.gid ? `${item2.gid}` : null;
              }
            });
            (item.parameters || []).forEach((item3, index3) => {
              if (item3.ugid) {
                delete item3.ugid;
              }
              const sum = check(item3.parameterName) + check(item3.parameterValue) + check(item3.isUse);
              if (sum > 0 && sum < 3) {
                flag = false;
              }
              if (sum === 3) {
                parametersData.push(item3);
              }
              if (sum === 0) {
                delEqParamIds = delEqParamIds ? delEqParamIds + item3.gid ? `${item3.gid}` : '' : item3.gid ? `${item3.gid}` : null;
              }
            });
            const eqList = {
              ...item,
              properties: properData,
              parameters: parametersData,
              delPropertyIds: delEqProIds,
              delParameterIds: delEqParamIds,
            };
            eqData.push(eqList);
          });
          equipmentChoices = eqData;
        } else {
          delEqIds = this.state.delEqIds;
        }
        if (flag) {
          if (values.eqConfig) {
            delete values.eqConfig;
          }
          const subData = {
            ...values,
            isSetEquipment: isSetEquipment || 0,
            activitiCode: values.activitiCode || null,
            ecode,
            ename: cCompany,
            createrId: gid,
            functionKey: this.pathVariable.data.action === 'edit' ? this.state.functionKey : values.functionName,
            createrName: trueName,
            parentName: functionName,
            equipmentChoices: equipmentChoices ? JSON.stringify(equipmentChoices) : null,
          };
          if (delEqIds && delEqIds !== '') {
            Object.assign(subData, {delEquipmentTypeIds: delEqIds});
          }
          this.subFormData(subData);
        } else {
          message.warn('请将设备条件设置信息填写完整');
        }
      }
    });
  }
  // 返回
  handleBack = () => {
    // this.props.history.goBack();
    this.props.dispatch(routerRedux.push('operaType-Manger'));
  }
  callbackFunc = (functionName, functionGroup) => {
    const {form} = this.props;
    // 获取类型分类
    this.props.dispatch({
      type: 'operationStandard/getCatergoryData',
      callback: (data) => {
        if (data) {
          const target = data.filter(item => item.functionName === functionName)[0] || {};
          if (target) {
            form.setFieldsValue({functionGroup, parentKey: target.functionKey});
            this.setState({functionName});
          }
        }
      },
    });
  }
  // 设置设备分类为否时清空设置的设备分类
  onSetEquipmentChange = (value) => {
    if (value === 0) {
      const newTypeDetailData = {...this.props.typeDetailData};
      newTypeDetailData.functionEquipmentTypes = [];
      this.saveTypeDetailData(newTypeDetailData);
    }
  }
  onChange = (value, option) => {
    const {form} = this.props;
    if (value) {
      const {functionName, functionGroup} = option.props.dataRef;
      if (functionGroup === 'household') {
        this.setState({workTypeData: [{gid: 1, name: '设备'}, {gid: 3, name: '工商户'}]});
      } else {
        this.setState({workTypeData: [{gid: 1, name: '设备'}]});
      }
      form.setFieldsValue({functionGroup});
      this.setState({functionName});
    } else {
      form.setFieldsValue({functionGroup: ''});
      this.setState({functionName: ''});
    }
    form.setFieldsValue({workObjectType: null});
  }
  render() {
    const { form, operaData, catergoryData, submitting, functionGroup: funcData, areaTypeData, typeDetailData, eventList} = this.props;
    const { getFieldDecorator, getFieldValue} = form;
    const {areaCode, activitiCode, functionName, functionGroup, parentKey, allowRoutineTask, allowTempTask,
      isSetEquipment, isSyncEquipment, functionEquipmentTypes, workStandardId, workObjectType} = typeDetailData || {};
    const feedData = functionEquipmentTypes && functionEquipmentTypes.length !== 0 ? functionEquipmentTypes : [];
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
        sm: { span: 10 },
      },
      wrapperCol: {
        span: 12,
      },
    };
    const properties = [{ ugid: 'pr_0', propertyName: '', propertyValue: '', isUse: '' }];
    const parameters = [{ ugid: 'pr_0', parameterName: '', parameterValue: '', isUse: '' }];
    const eqConfig = this.pathVariable.data.action === 'add' || feedData.length === 0 ? [{ uuid: 'pr_0', equipmentType: '', properties, parameters}] : feedData;
    const AppliyOptions = (funcData || []).map(item =>
      <Option key={item.logmark} value={item.logmark}>{item.alias}</Option>
    );
    const operaOptions = (operaData || []).map(item =>
      <Option key={item.gid} value={item.gid} title={item.workStandardName} >{item.workStandardName}</Option>
    );
    const workTypeOptions = (this.state.workTypeData || []).map(item =>
      <Option key={item.gid} value={item.gid} >{item.name}</Option>
    );
    const catergoryOptions = (catergoryData || []).map(item =>
      <Option key={item.functionKey} value={item.functionKey} title={item.functionName} dataRef={item}>{item.functionName}</Option>
    );
    const areaTypeOptions = (areaTypeData || []).map(item =>
      <Option key={item.gid} value={item.gid} dataRef={item}>{item.businessname}</Option>
    );
    const eventListOptions = (eventList || []).map(item =>
      <Option key={`${item.eventtype}`} value={`${item.eventtype}`} title={item.eventname} dataRef={item}>{item.eventname}</Option>
    );
    const dayOption = [];
    for (let i = 1; i <= 31; i += 1) {
      dayOption.push(<Option key={`${i}`} value={`${i}`} >{i}</Option>);
    }
    return (
      <div >
        <Form >
          <div className={styles['span-button']}>
            <div className={styles.order2} />
            <span style={{ fontSize: 16 }}>{`${this.pathVariable.data.action === 'add' ? '新建' : '编辑'}作业类型`}</span>
          </div>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              <FormItem label="作业类型名称" {...layout2}>
                {getFieldDecorator('functionName', {
                  validateTrigger: ['onBlur'],
                  rules: [
                    { validator: (rule, value, callback2) => this.handleCheckAlias(rule, value, callback2, 'name') },
                  ],
                  initialValue: functionName })(<Input disabled={this.pathVariable.data.action === 'read'} placeholder="作业标准名称" />)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="类型分类" {...layout2}>
                <Col span={17}>
                  <FormItem>
                    {getFieldDecorator('parentKey', {rules: [{ required: true, message: '请选择或新建类型分类'}], initialValue: parentKey })(
                      <Select allowClear filterOption={false} disabled={this.pathVariable.data.action !== 'add'} onChange={this.onChange}>{catergoryOptions}</Select>)}
                  </FormItem>
                </Col>
                <Col span={7}>
                  { getFieldValue('parentKey') ? null :
                  <Button onClick={() => { this.onOperaCater('new'); }} type="prmary">新建</Button>}
                </Col>
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="应用场景" {...layout}>
                {getFieldDecorator('functionGroup', {initialValue: functionGroup })(<Select disabled>{AppliyOptions}</Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              <FormItem label="作业标准" {...layout2}>
                <Col span={18}>
                  <FormItem>
                    {getFieldDecorator('workStandardId', {rules: [{ required: true, message: '请选择或新建作业标准'}], initialValue: workStandardId })(
                      <Select allowClear disabled={this.pathVariable.data.action === 'read'} onChange={this.onWorkStandSelect}>{operaOptions}</Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={6}>
                  { getFieldValue('workStandardId') ? <Button onClick={() => { this.onOperateWorkStandard('read'); }} type="prmary">预览</Button> :
                  <Button onClick={() => { this.onOperateWorkStandard('add'); }} type="prmary">新建</Button>}
                </Col>
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="作业对象类型" {...layout2}>
                {getFieldDecorator('workObjectType', {rules: [{ required: true, message: '请选择作业对象类型'}], initialValue: workObjectType})(
                  <Select disabled={this.pathVariable.data.action !== 'add'} >{workTypeOptions}</Select>)}
              </FormItem>
            </Col>
            <Col span={8} >
              <FormItem label="作业流程" {...layout}>
                {getFieldDecorator('activitiCode', {initialValue: activitiCode})(
                  <Select allowClear disabled={this.pathVariable.data.action !== 'add'} >{eventListOptions}</Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={9}>
              <FormItem label="区域分组" {...layout2}>
                {getFieldDecorator('areaCode', {rules: [{ required: true, message: '请选择区域分组'}], initialValue: areaCode ? parseInt(areaCode, 10) : null})(
                  <Select disabled={this.pathVariable.data.action === 'read'} >{areaTypeOptions}</Select>)}
              </FormItem>
            </Col>
          </Row>
          <Row type="flex" justify="space-between">
            <Col span={9}>
              <FormItem label="是否支持常规计划" {...layout2}>
                {getFieldDecorator('allowRoutineTask',
                  {initialValue: allowRoutineTask === 0 ? 0 : 1})(
                    <RadioGroup disabled={this.pathVariable.data.action === 'read'}>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>)}
              </FormItem>
            </Col>
            <Col span={7}>
              <FormItem label="是否支持临时计划" {...layout2}>
                {getFieldDecorator('allowTempTask',
                  {initialValue: allowTempTask === 0 ? 0 : 1})(
                    <RadioGroup style={{marginLeft: 2}} disabled={this.pathVariable.data.action === 'read'}>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>)}
              </FormItem>
            </Col>
            <Col span={8}>
              <FormItem label="新增设备是否立即生成工单" {...layout}>
                {getFieldDecorator('isSyncEquipment',
                  {initialValue: isSyncEquipment === 0 ? 0 : 1})(
                    <RadioGroup disabled={this.pathVariable.data.action === 'read'}>
                      <Radio value={1}>是</Radio>
                      <Radio value={0}>否</Radio>
                    </RadioGroup>)}
              </FormItem>
            </Col>
          </Row>
          {getFieldValue('workObjectType') && (getFieldValue('workObjectType') === 1 || getFieldValue('workObjectType') === 4) ? <Row>
            <Col span={9}>
              <FormItem label="是否设置设备分类" {...layout2}>
                {getFieldDecorator('isSetEquipment',
                  {initialValue: isSetEquipment === 0 ? 0 : 1})(
                    <Select disabled={this.pathVariable.data.action === 'read'} onChange={this.onSetEquipmentChange}>
                      <Option value={1}>是</Option>
                      <Option value={0}>否</Option>
                    </Select>)}
              </FormItem>
            </Col>
          </Row> : null}
          <FormItem >
            {getFieldValue('workObjectType') && (getFieldValue('workObjectType') === 1 || getFieldValue('workObjectType') === 4) && getFieldValue('isSetEquipment') === 1 ?
              <FormItem>
                {getFieldDecorator('eqConfig', {initialValue: eqConfig})(
                  <EqConfig
                    ref={preComponent => {
                      this.eqConfigForm = preComponent;
                    }}
                    action={this.pathVariable.data.action}
                    eqTypeData={this.props.eqTypeData}
                  />)}
              </FormItem>
              : null}
            <Button
              type="button"
              style={this.pathVariable.data.action === 'read' ? { left: '46%' } : { left: '42%' }}
              onClick={this.handleBack}
            >
              返回</Button>
            <Button
              type="primary"
              htmlType="submit"
              onClick={(e) => { this.handleSubmit(e); }}
              style={this.pathVariable.data.action === 'read' ? { display: 'none' } : { left: '43%', marginTop: 20 }}
              loading={submitting}
            >提交</Button>
          </FormItem>
        </Form>
        <NewCaterModal
          wrappedComponentRef={ref => { this.modal = ref; }}
          record={this.state.record}
          dispatch={this.props.dispatch}
          user={this.props.user}
          functionGroup={this.props.functionGroup}
          callbackFunc={this.callbackFunc}
        />
      </div >
    );
  }
}
