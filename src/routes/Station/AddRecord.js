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
  objManage: station.objManage,
  noticeData: station.noticeData,
  user: login.user,
  userDatas: login.datas ||[],
}))
@Form.create()
export default class NewForm extends PureComponent {
  constructor(props){
    super(props)

    this.state = {
      submitting: false,
      eqUnitName: '',
      isNotice: false,
      checkObj: [],
      isEdit: false,
      num: '',
      stationId: '',
      ecode: '',
      stationName: '',
      adjustPressureTargetName: '',
      adjustPressureTargetId: '', //调压对象id
      checkObjId: [],   //调压对象gid
      adjustWay: '',  //调压方式；

    };
    this.initParams()
  }

  adjustPressureRecordId = '';
  adjustPressureTargetId = '';
  adjustTime = '';
  adjustType = '';

  componentWillMount(){
    this.props.dispatch({
      type: 'station/getStationData'
    });

    if(this.props.location.search){
      this.setState({isNotice: true})
      this.props.dispatch({
        type: 'station/queryNotice',
        payload: {
          adjustPressureRecordId: this.adjustPressureRecordId
        },
        callback: ({data}) => {
          console.log(data, 'dataaaa');
          if(data[0].status === 1){
            this.setState({isEdit: false})
          }else{
            this.setState({isEdit: true})
          }
          this.setState({
            stationId: data[0].stationId,
            ecode: data[0].ecode,
            adjustPressureTargetName: data[0].adjustPressureTargetName,
            stationName: data[0].stationName,
            adjustWay: data[0].adjustType,
          })
          if(data[0].adjustType === '总' || !data[0].adjustType){
            this.props.form.setFieldsValue({
              noticeManName: data[0].noticeManName,
              // starus: data[0].status,
              adjustTime: data[0].adjustTime ? moment(data[0].adjustTime) : null,
              afterAdjustPressure: data[0].afterAdjustPressure,
              stationId:data[0].stationName,
              adjustWay:data[0].adjustType,
              adjustPressureTargetId:data[0].adjustPressureTargetName,
              trueAdjustPressure: data[0].trueAdjustPressure,
              beforeAdjustPressure: data[0].beforeAdjustPressure,
              remark2: data[0].remark2,
            });
          }else if (data[0].adjustType === '分'){
            this.props.form.setFieldsValue({
              noticeManName: data[0].noticeManName,
              // starus: data[0].status,
              adjustTime: data[0].adjustTime ? moment(data[0].adjustTime) : null,
              afterAdjustPressure: data[0].afterAdjustPressure,
              stationId:data[0].stationName,
              adjustWay:data[0].adjustType,
              adjustPressureTargetId:data[0].adjustPressureTargetName,
              remark2: data[0].remark2,
            });
          }
        }
      });
      if(this.adjustType === '分'){
        this.props.dispatch({
          type: 'station/queryCheckObjList',
          payload: {
            adjustPressureRecordId: this.adjustPressureRecordId,
          },
          callback: (data) => {
            // console.log(data, '★★');
            this.setState({checkObj: data})
          }
        })
      }
    }
  }

  componentDidMount() {
    // const {stations, groups, dispatch} = this.props;

      //检查对象详情；
    if(this.props.location.search){
      this.props.dispatch({
        type: 'station/queryCheckObjListData',
        payload: {
          adjustPressureRecordId: this.adjustPressureRecordId,
        },
        callback: (data) => {
          console.log(data, '★★');
          if(data && data.adjustPressureCheckTargets.length > 0 && this.state.adjustWay === '分'){
            const params = {};
            const checkObjId = [];
            for (var i = 0; i < data.adjustPressureCheckTargets.length; i++) {
              params[`afterAdjustPressure_${i}`]=data.adjustPressureCheckTargets[i].afterAdjustPressure;
              params[`beforeAdjustPressure_${i}`]=data.adjustPressureCheckTargets[i].beforeAdjustPressure;
              params[`status_${i}`]= data.adjustPressureCheckTargets[i].status;
              checkObjId.push(data.adjustPressureCheckTargets[i].gid)
            }
            this.setState({checkObjId})
            this.state.checkObj && this.props.form.setFieldsValue(params);
          }
        }
      })
    }
  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { adjustPressureRecordId, adjustPressureTargetId, adjustTime, adjustType} = parseValues(search) || '';
    this.adjustPressureRecordId = adjustPressureRecordId;
    this.adjustPressureTargetId = adjustPressureTargetId;
    this.adjustTime = adjustTime;
    this.adjustType = adjustType;
  };

  handleBack = ()=>{
    const {noticeData} = this.props;
    console.log(noticeData, this.adjustTime, '★★★');
    if(noticeData.length > 0){
      this.props.dispatch(routerRedux.push(`/station/notice?adjustTime=${this.adjustTime}&stationId=${noticeData[0].stationId}&operator=${noticeData[0].noticeManId}&areaObj=${noticeData[0].adjustPressureTargetId}`));
    }else{
      this.props.dispatch(routerRedux.push(`/station/notice`))
    }
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
    const {checkObj} = this.state;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { status, noticeManName, adjustTime, trueAdjustPressure, beforeAdjustPressure,afterAdjustPressure, adjustPressureTargetId, remark2} = values;
        const {stations} = this.props;
        const {stationId, ecode, stationName, adjustPressureTargetName, checkObjId, adjustWay} = this.state;
        console.log(stations, "stations");
        console.log(values, 'values');
        const Targets = [];
        let isDone = false;
        let isDoneL = 0
        if(adjustWay === '总'){
          if(beforeAdjustPressure && trueAdjustPressure){
            isDone = true;
          }
        }
        
        checkObj.length > 0 && checkObj.map((item, index) => {
          if(this.state.adjustWay === '分'){
            if(values['beforeAdjustPressure_' + index] && values['afterAdjustPressure_' + index] && values['status_' + index]){
              // this.isDone = true;
              isDoneL++
            }
          }
          Targets.push({
            gid: checkObjId.length > 0 ? checkObjId[index] : null,
            adjustPressureRecordId: this.adjustPressureRecordId,
            adjustPressureTargetId: this.adjustPressureTargetId,
            equipmentUnitId:item.equipmentUnitId,
            checkTargetId: item.gid,
            beforeAdjustPressure: values['beforeAdjustPressure_' + index],
            afterAdjustPressure: values['afterAdjustPressure_' + index],
            status: values['status_' + index],
          })
        })
        const params = {
          stationId,
          stationName,
          adjustPressureTargetName,
          ecode,
          adjustType: adjustWay,
          status: isDone ||  (isDoneL === checkObj.length && isDoneL !== 0) ? 2 : 1,
          // noticeManName,
          operatorId: this.props.user.gid,
          operatorName: this.props.user.trueName,
          // adjustTime: adjustTime.format('YYYY-MM-DD'),
          trueAdjustPressure,
          trueAdjustTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          adjustPressureRecordId : this.adjustPressureRecordId ? this.adjustPressureRecordId : null,
          adjustPressureTargetId: this.adjustPressureTargetId ? this.adjustPressureTargetId : adjustPressureTargetId,
          beforeAdjustPressure,
          // afterAdjustPressure,
          remark2,
          targets: JSON.stringify(Targets),
        };
        this.setState({submitting: true});
              console.log(params, "params");
              console.log(this.isDone, "this.isDone");
        dispatch({
          type: 'station/addNotice',
          payload: params,
          callback: ({success, msg}) => {
            this.setState({submitting: false});
            if (success) {
              message.success('创建成功！');
              this.handleBack()
            } else {
              message.warn(msg);
            }
          }
        });
      }
    });
  };

  disabledDate = (current) => {
    return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
  };
  numCheck = (e) => {
    const { value } = e.target;
    console.log(value,'valueeeee');
    const reg = /^-?\d+(\.\d{1,3})?$/;
    if ((!isNaN(value) && reg.test(value)) || value === '' || value === '-') {
      console.log(value, 'rest');
      // this.setState({num: value})
      // this.props.form.setFieldsValue({
      //   trueAdjustPressure: '123',
      // })

      // const temp = {}
      // temp[`trueAdjustPressure`] = '0'
      // this.props.form.setFieldsValue(temp);
    }
  };
  checkeqHandler = (key, node) => {
    const {dataRef} = node.props;
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
    this.setState({
      stationId: key,
      stationName: dataRef.name,
      ecode: dataRef.ecode,
    })
  };
  handleFieldChange = (value, node) => {
    const {dataRef} = node.props;
    console.log(value,dataRef, "fff");
    this.adjustPressureTargetId = value;
    this.setState({
      adjustPressureTargetName: dataRef.name,
    });
    if(this.state.adjustWay === '分'){
      this.props.dispatch({
        type: 'station/queryCheckObjectList',
        payload: {
          adjustPressureTargetId: value,
        },
        callback: (data) => {
          // console.log(data, '★★');
          this.setState({checkObj: data})
        }
      })
    }
  };
  handleWayChange = (val, node) => {
    if(val === '总'){
      this.setState({
        checkObj: [],
      });
    }else if (val === '分'){
      this.props.dispatch({
        type: 'station/queryCheckObjectList',
        payload: {
          adjustPressureTargetId: this.adjustPressureTargetId,
        },
        callback: (data) => {
          this.setState({checkObj: data})
        }
      })
    }
    this.setState({
      adjustWay: val,
    });
  }
  render() {
    const { stations, form, objManage} = this.props;
    const {getFieldDecorator} = this.props.form;
    const { checkObj } = this.state;
    console.log(this.props.noticeData, 'isDone');
    // console.log(this.table.edit, "this");
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 8},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
        md: {span: 8},
      },
    };
    return (
      <PageHeaderLayout showBack={this.state.isNotice}>
        <Card bordered={false} style={{minWidth: 1300}}>
          <Form
            onSubmit={this.handleSubmit}
          >
            <FormItem
              {...formItemLayout}
              label="通知时间"
            >
              {getFieldDecorator('adjustTime', {
                initialValue: null
              })(
                <DatePicker
                  disabled
                  format="YYYY-MM-DD HH:mm"
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="通知人"
            >
              {getFieldDecorator('noticeManName', {
              })(
                <Input
                  disabled
                  style={{width: 120}}
                />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="通知调整压力"
            >
              {getFieldDecorator('afterAdjustPressure', {

              })(
                <Input disabled />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="站点"
            >
              {getFieldDecorator('stationId', {
                rules: [{
                    required: !this.state.isNotice,
                    message: '请选择站点'
                  },
                ],
              })(
                <Select
                  placeholder="请选择站点"
                  disabled={this.state.isNotice}
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
              label="调压类型"
            >
              {getFieldDecorator('adjustWay', {
                rules: [{
                  required: true,
                  message: '请选择调压方式类型',
                }],
              })(
                <Select
                  placeholder="请选择调压方式类型"
                  disabled={this.state.isEdit}
                  onSelect={this.handleWayChange}
                >
                  <Option key='1' value='总'>汇管</Option>
                  <Option key='2' value='分'>分路</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="调压对象"
            >
              {getFieldDecorator('adjustPressureTargetId', {
                rules: [{
                  required: !this.state.isNotice,
                  message: '请选择调压对象',
                }],
              })(
                <Select
                  placeholder="请选择调压对象"
                  disabled={this.state.isNotice}
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
            {this.state.adjustWay === '总'|| !this.state.adjustWay?
            <FormItem>
              <FormItem
                {...formItemLayout}
                label="调压前压力"
              >
                {getFieldDecorator('beforeAdjustPressure', {
                  rules: [{
                    required: false,
                    pattern: /^-?\d+(\.\d{1,3})?$/,
                    message: '请填写数字(最多三位小数)！',
                  }],
                })(
                  <Input disabled={this.state.isEdit}/>
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="调压后整体压力"
              >
                {getFieldDecorator('trueAdjustPressure', {
                  rules: [{
                    required: false,
                    pattern: /^-?\d+(\.\d{1,3})?$/,
                    message: '请填写数字(最多三位小数)！',
                  }],
                })(
                  <Input
                    disabled={this.state.isEdit}
                    onChange={this.numCheck}
                  />
                )}
              </FormItem>
            </FormItem> : null
            }
            {
              checkObj && checkObj.map((item, index)=>
                <div>
                  <div style={{margin: '15px 0 10px 29%'}}><b>{item.name}</b></div>
                <FormItem
                  {...formItemLayout}
                  label="运行状态"
                >
                  {getFieldDecorator(`status_${index}`, {
                    initialValue: 1
                  })(
                    <Select
                      placeholder="请选择运行状态"
                      disabled={this.state.isEdit}
                    >
                      <Option key='1' value={1}>运行</Option>
                      <Option key='2' value={2}>停止</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label="调压前压力"
                  >
                    {getFieldDecorator(`beforeAdjustPressure_${index}`, {
                      rules: [{
                        required: false,
                        pattern: /^-?\d+(\.\d{1,3})?$/,
                        message: '请填写数字(最多三位小数)！',
                      }],
                    })(
                      <Input disabled={this.state.isEdit}/>
                    )}
                  </FormItem>
                  <FormItem
                    {...formItemLayout}
                    label="调压后压力"
                  >
                    {getFieldDecorator(`afterAdjustPressure_${index}`, {
                      rules: [{
                        required: false,
                        pattern: /^-?\d+(\.\d{1,3})?$/,
                        message: '请填写数字(最多三位小数)！',
                      }],
                    })(
                      <Input disabled={this.state.isEdit}/>
                    )}
                  </FormItem>
                </div>
              )
            }
            <FormItem
              {...formItemLayout}
              label="备注"
            >
              {getFieldDecorator('remark2', {
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
              {this.state.isNotice ?
                <Button type="button" style={{marginRight:10}} onClick={this.handleBack}>
                  返回
                </Button>
                : null
              }
              {!this.state.isEdit ?
                <Button type="primary" onClick={this.handleSubmit} loading={this.state.submitting}>
                  提交
                </Button>
                : null
              }
            </div>
          </Col>
        </Card>
      </PageHeaderLayout>
    );
  }
}
