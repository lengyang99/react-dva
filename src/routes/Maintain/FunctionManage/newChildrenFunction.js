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
import NewAttribute from './newAttribute';
import styles from './index.less';
import parseValues from '../../../utils/utils';

const FormItem = Form.Item;
const {Option} = Select;

const PeriodFormat = 'HH:00';

@connect(({maintain, login}) => ({
  user: login.user,
  funcGroup: maintain.funcGroup,
}))
@Form.create()
export default class newFunction extends PureComponent {
  constructor() {
    super();

    this.state = {
      submitting: false,
    };
  }
  parentKey = '';
  functionGroup = '';

  componentWillMount() {
    this.initParams();
  }
  componentDidMount() {
    const {stations, groups, dispatch} = this.props;
    // dispatch({
    //   type: 'station/fetchCycleUnit',
    // });
    // if (!stations || stations.length === 0) {
    //   dispatch({
    //     type: 'station/getStationData',
    //   });
    // }
  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { parentKey, functionGroup} = parseValues(search) || '';
    this.parentKey = parentKey;
    this.functionGroup = functionGroup;

  };

  handleBack = () => {
    this.props.dispatch(routerRedux.push(`function-child?parentFunctionKey=${this.parentKey}&functionGroup=${this.functionGroup}`));
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {user, form, dispatch, history} = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { functionKey, functionName, allowRoutineTask, allowTempTask, equipmentTypes, isArriveRequired, isFeedbackRequired, propertyName, propertyValue, items = [], attribute = []} = values;

        const Params = {
          ecode: this.props.user.ecode,
          functionKey,
          functionName,
          allowRoutineTask,
          allowTempTask,
          equipmentTypes,
          parentKey: this.parentKey,
          functionGroup: this.functionGroup,
          isArriveRequired,
          isFeedbackRequired,
          properties: [...attribute],
          params: JSON.stringify({
            title: '',
            fields: [...items]
          })
        };
        console.log(Params, 'params★')
        this.setState({submitting: true});
        dispatch({
          type: 'maintain/newFunction',
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

    render() {
      const {funcGroup, form} = this.props;
      const {getFieldDecorator} = this.props.form;
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
                  initialValue: '0',
              })(
                <Radio.Group>
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
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
                  initialValue: '0',
                })(
                <Radio.Group>
                  <Radio value="1">是</Radio>
                  <Radio value="0">否</Radio>
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
              <NewAttribute />
            )}
            </Card>
            <hr />
            <Card className={styles.card} bordered={false}>
              {getFieldDecorator('items', {
            })(
              <NewTableForm />
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
