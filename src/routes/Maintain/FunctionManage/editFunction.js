import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import range from 'lodash/range';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Col, TimePicker, message,
} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import NewTableForm from './newTableForm';
import styles from './index.less';
import parseValues from '../../../utils/utils';
import NewAttribute from './newAttribute';

const FormItem = Form.Item;
const {Option} = Select;

const PeriodFormat = 'HH:00';
const delPropertyIds = [];
@connect(({maintain, login}) => ({
  user: login.user,
  funcDetail: maintain.funcDetail,
  funcGroup: maintain.funcGroup,
}))
@Form.create()
export default class newFunction extends PureComponent {
  constructor() {
    super();

    this.state = {
      submitting: false,
      equipmentGid: '',
      formConfigId: '',
      propertyGid: '',
      attributeData: [], //属性数据
    };
  }
  table=null;
  functionId = '';
  who = '';
  parentKey = '';
  functionGroup = '';
    
  
  componentWillMount() {
   this.initParams()
  }

  initParams = () => {
    const { location: { search } , dispatch, form, user, funcDetail} = this.props;
    const { functionId, who} = parseValues(search) || '';
    this.functionId = functionId;
    this.who = who;
    dispatch({
      type: 'maintain/functionDetail',
      payload: {
        ecode: user.ecode,
        functionId,
      },
      callback: (data) => {
        if(data && data.function) {
          if(who === 'ff'){
            const {functionKey,functionName,functionGroup,allowRoutineTask, allowTempTask, isArriveRequired, isFeedbackRequired} = data.function;
            form.setFieldsValue({
              functionKey,
              functionName,
              functionGroup,
              allowRoutineTask,
              allowTempTask,
              isArriveRequired,
              isFeedbackRequired,
              equipmentTypes: data.function2EquipmentType ? data.function2EquipmentType.equipmentTypes : null,
              attribute: data.properties,
            })
            this.setState({
              equipmentGid: data.function2EquipmentType ? data.function2EquipmentType.gid : null,
              formConfigId: data.functionFormConfig ? data.functionFormConfig.gid : '',
              propertyGid: data.properties.length > 0 ? data.properties[0].gid : '',
              attributeData: data.properties,
            })
          }
          if(who === 'cf'){
            const {functionKey,functionName,functionGroup,allowRoutineTask,allowTempTask, isArriveRequired, isFeedbackRequired, parentKey} = data.function;
            form.setFieldsValue({
              functionKey,
              functionName,
              allowRoutineTask,
              allowTempTask,
              isArriveRequired,
              isFeedbackRequired,
              equipmentTypes: data.function2EquipmentType ? data.function2EquipmentType.equipmentTypes : null,
              attribute: data.properties,
            })
            this.setState({
              equipmentGid: data.function2EquipmentType ? data.function2EquipmentType.gid : null,
              formConfigId: data.functionFormConfig ? data.functionFormConfig.gid : '',
              propertyGid: data.properties.length > 0 ? data.properties[0].gid : '',
            })
            this.functionGroup = functionGroup
            this.parentKey = parentKey
          }
        }
      }
    });
    
  };

  handleBack = () => {
    if(this.who === 'ff'){
      this.props.dispatch(routerRedux.push('function-manage'));
    }else{
      this.props.dispatch(routerRedux.push(`function-child?parentFunctionKey=${this.parentKey}`));
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {user, form, dispatch, history} = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { functionKey, functionName, functionGroup, allowRoutineTask, allowTempTask, equipmentTypes, isArriveRequired, isFeedbackRequired, propertyName, propertyValue, attribute = []} = values;
        let Params = {};
        attribute.length > 0 && attribute.map((item, index) => {
          if(isNaN(Number(item.gid))) {
            delete attribute[index].gid
          }
        })
        if(this.who == 'ff'){
          Params = {
            ecode: this.props.user.ecode,
            gid: this.functionId,
            functionKey,
            functionName,
            functionGroup,
            allowRoutineTask,
            allowTempTask,
            function2EquipmentType: {
              equipmentTypes,
              gid: this.state.equipmentGid
            },
            formConfigId: this.state.formConfigId,
            delPropertyIds: delPropertyIds.join(","),
            isArriveRequired,
            isFeedbackRequired,
            properties: [...attribute],
          };
        }
        if(this.who == 'cf'){
          Params = {
            ecode: this.props.user.ecode,
            gid: this.functionId,
            functionKey,
            functionName,
            functionGroup: this.functionGroup,
            parentKey: this.parentKey,
            allowRoutineTask,
            allowTempTask,
            function2EquipmentType: {
              equipmentTypes,
              gid: this.state.equipmentGid
            },
            formConfigId: this.state.formConfigId,
            delPropertyIds: delPropertyIds.join(","),
            isArriveRequired,
            isFeedbackRequired,
            properties: [...attribute],
          };
        }
        console.log(Params, 'params★')
        this.setState({submitting: true});
        dispatch({
          type: 'maintain/editFunction',
          payload: Params,
          callback: ({success, msg}) => {
            this.setState({submitting: false});
            if (success) {
              message.success('创建成功！');
              history.goBack();
            } else {
              message.warn(msg);
            }
          },
        });
      }
    });
  };
    checkeqHandler = (val, node) => {
      const {dataRef} = node.props;
    };
    attributeDel = (del) => {
      console.log(del , 'del')
      delPropertyIds.push(del)
    }
    render() {
      const { funcGroup, form} = this.props;
      const {getFieldDecorator} = this.props.form;
      const eqValue = this.state.eqV;
      console.log(this.state, 'this');
      const formItemLayout = {
        labelCol: {
        // xs: {span: 24},
          sm: {span: 7},
        },
        wrapperCol: {
        // xs: {span: 24},
          sm: {span: 7},
        // md: {span: 10},
        },
      };
      return (
        <PageHeaderLayout>
          <Card bordered={false} style={{minWidth: 1200, overflowX: 'scroll'}}>
            <Form
              onSubmit={this.handleSubmit}
            >
              <FormItem
                {...formItemLayout}
                label="功能中文名"
              >
                {getFieldDecorator('functionName', {
                rules: [
                  {required: true, message: '请输入中文名'},
                ],
              })(
                <Input
                  placeholder="请输入中文名"
                />
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="功能英文名"
              >
                {getFieldDecorator('functionKey', {
                rules: [
                  {required: true, message: '请输入英文名'},
                ],
              })(
                <Input
                  placeholder="请输入英文名"
                />
              )}
              </FormItem>
              {this.who === 'ff' ?
                <FormItem
                {...formItemLayout}
                label="功能分组"
                >
                  {getFieldDecorator('functionGroup', {
                  rules: [
                    {required: true, message: '请选择功能'},
                  ],
                })(
                  <Select
                    placeholder="请选择功能"
                    allowClear
                    onSelect={this.checkeqHandler}
                  >
                    {
                      funcGroup && funcGroup.map((it, index) => {
                        return <Option key={it.name} value={it} dataRef={it.alias}>{it.alias}</Option>;
                      })
                    }
                  </Select>
                )}
                </FormItem>
                : null
              }
              <FormItem
                {...formItemLayout}
                label="设备类型"
              >
                {getFieldDecorator('equipmentTypes', {
                rules: [
                  {required: true, message: '请输入设备类型'},
                ],
              })(
                <Input
                  placeholder="请输入设备类型"
                />
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="是否支持常规计划"
              >
                {getFieldDecorator('allowRoutineTask', {
                  rules: [
                    {required: true, message: '请选择是否支持'},
                  ],
                  initialValue: 0,
              })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="是否支持临时计划"
              >
                {getFieldDecorator('allowTempTask', {
                  rules: [
                    {required: true, message: '请选择是否支持'},
                  ],
                  initialValue: 0,
                })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="是否要求到位"
              >
                {getFieldDecorator('isArriveRequired', {
                  rules: [
                    {required: true, message: '请选择是否支持'},
                  ],
                  initialValue: 0,
                })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="是否要求反馈"
              >
                {getFieldDecorator('isFeedbackRequired', {
                  rules: [
                    {required: true, message: '请选择是否支持'},
                  ],
                  initialValue: 0,
                })(
                <Radio.Group>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </Radio.Group>
              )}
              </FormItem>
            </Form>
            <Card className={styles.card} bordered={false}>
              {getFieldDecorator('attribute', {
            })(
              <NewAttribute attributedel={(del) => this.attributeDel(del)}/>
            )}
            </Card>
            <div style={{width: '100%', textAlign: 'center',}}>
              <Button type="button" onClick={this.handleBack} style={{marginRight: 20}}>
              返回
              </Button>
              <Button type="button" onClick={this.handleSubmit}>
              提交
              </Button>
            </div>
          </Card>
        </PageHeaderLayout>
      );
    }
}
