import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Col, TimePicker, message
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import parseValues from '../../utils/utils';

const FormItem = Form.Item;
const {Option} = Select;
const { TextArea } = Input;

const PeriodFormat = 'HH:00';

@connect(({station, login}) => ({
  stations: station.stations,
  groups: station.groups,
  objManage: station.objManage,
  user: login.user,
  userDatas: login.datas ||[],
}))
@Form.create()
export default class NewForm extends PureComponent {
  state = {
    submitting: false,
    eqUnitName: '',
    stationName: '',
    adjustPressureTargetName: '',
    ecode: '',
    adjustData: [],
  };
  groupName = '';
  cardData = '';
  existPlan= false;
  table=null;

  componentDidMount() {
    this.props.dispatch({
      type: 'station/getStationData'
    });
    //上调下调；
    this.props.dispatch({
      type: 'station/getAdjustWay',
      callback: ({data}) => {
        console.log(data, 'dataaaaaa');
        const {adjust_pressure_oper_type} = data
        this.setState({adjustData: adjust_pressure_oper_type})
      }
    });

    this.props.form.setFieldsValue({
      noticeManName: this.props.user.trueName,
    })
  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { groupName } = parseValues(search) || '';
    this.groupName = groupName;
  };

  handleBack = ()=>{
    // this.props.dispatch(routerRedux.push('/station/plan'));
  };

  //数字验证；
  checkNumber = (theObj) => {
    var reg = /^\d+([,，]\d+)*$/;
    if (reg.test(theObj)) {
      return true;
    }
    return false;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {user, form, dispatch, history} = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { stationId, noticeManName, adjustTime, adjustPressureTargetId, beforeAdjustPressure,afterAdjustPressure, remark1, adjustWay} = values;
        const { stationName, adjustPressureTargetName, ecode } = this.state;
        // if(this.checkNumber(beforeAdjustPressure) && this.checkNumber(afterAdjustPressure)){
        //   message.warning('压力值为数字！');
        //   return
        // }
        const params = {
          stationId,
          stationName,
          ecode,
          status: '1',
          adjustWay,
          noticeManName,
          noticeManId: this.props.user.gid,
          adjustTime: adjustTime.format('YYYY-MM-DD HH:mm:00'),
          adjustPressureTargetId,
          adjustPressureTargetName,
          beforeAdjustPressure,
          afterAdjustPressure,
          remark1,
        };
        this.setState({submitting: true});
              console.log(params, "params");
        dispatch({
          type: 'station/addNotice',
          payload: params,
          callback: ({success, msg}) => {
            this.setState({submitting: false});
            if (success) {
              message.success('创建成功！');
              history.goBack();
            } else {
              message.warn(msg);
            }
          }
        });
      }
    });
  };

  checkeqHandler = (key, node) => {
    const {dataRef} = node.props
    this.props.form.setFieldsValue({
      adjustPressureTargetId: ""
    });
    this.props.dispatch({
      type: 'station/queryObjManage',
      payload: {
        ecode: dataRef.ecode,
        stationId: key,
      },
    });
  };
  handleFieldChange = (value, node) => {
    const {dataRef} = node.props;
    console.log(value,dataRef, "fff");
    if(dataRef.name)
    this.setState({
      adjustPressureTargetName: dataRef.name,
      stationName: dataRef.stationName,
      ecode: dataRef.ecode,
    })
  };
  disabledDate = (current) => {
    return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
  }
  render() {
    const { stations, form, objManage} = this.props;
    const {getFieldDecorator} = this.props.form;
    const {adjustData} = this.state
    console.log(adjustData, "this");
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 9},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
        md: {span: 6},
      },
    };
    return (
      <PageHeaderLayout showBack={true}>
        <Card bordered={false} style={{minWidth: 1300}}>
          <Form
            onSubmit={this.handleSubmit}
          >
            <FormItem
              {...formItemLayout}
              label="通知人"
            >
              {getFieldDecorator('noticeManName', {
                rules: [{
                  required: true, message: '请填写通知人',
                }],
              })(
                <Input
                  disabled
                  style={{width: 120}}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="调压时间"
            >
              {getFieldDecorator('adjustTime', {
                initialValue: moment()
              })(
                <DatePicker
                  showTime
                  // disabledTime={() => {
                  //   return {disabledSeconds:() => _.range(0, 60)}}
                  // }
                  disabledDate={this.disabledDate}
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="站点"
            >
              {getFieldDecorator('stationId', {
                rules: [
                  {required: true, message: '请选择站点'},
                ],
              })(
                <Select
                  placeholder="请选择站点"
                  onSelect={this.checkeqHandler}
                >
                  {
                    stations && stations.map((item) =>
                      <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                    )
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="调压对象"
            >
              {getFieldDecorator('adjustPressureTargetId', {
                rules: [{
                  required: true, message: '请选择调压对象',
                }],
              })(
                <Select
                  placeholder="请选择调压对象"
                  onSelect={this.handleFieldChange}
                >
                  {
                    objManage && objManage.map(item =>
                      <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                    )
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="压力调整为"
            >
              {getFieldDecorator('adjustWay', {
                rules: [{
                  required: true, message: '请选择',
                }],
              })(
                <Select
                  placeholder="请选择"
                >
                  {
                    adjustData && adjustData.map(item =>
                      <Option key={item.name} value={item.alias} dataRef={item}>{item.alias}</Option>
                    )
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="通知调整压力"
            >
              {getFieldDecorator('afterAdjustPressure', {
                rules: [{
                  required: true,
                  pattern: /^-?\d+(\.\d{1,3})?$/,
                  message: '请填写数字(最多三位小数)！',
                }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="备注"
            >
              {getFieldDecorator('remark1', {
              })(
                <TextArea rows={4} />
              )}
            </FormItem>
          </Form>
          <Col span={24}>
            <div style={{
              width: '100%',
              textAlign: 'center'
            }}>
              <Button type="primary" onClick={this.handleSubmit} loading={this.state.submitting}>
                提交
              </Button>
            </div>
          </Col>
        </Card>
      </PageHeaderLayout>
    );
  }
}
