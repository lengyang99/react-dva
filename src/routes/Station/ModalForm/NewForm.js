import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import range from 'lodash/range';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Col, TimePicker, message,
} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import NewTableForm from './NewTableForm';
import styles from './style.less';
import parseValues from '../../../utils/utils';
import { checkObjArr } from '../../../services/station';

const FormItem = Form.Item;
const {Option} = Select;

const PeriodFormat = 'HH:00';

@connect(({station, login}) => ({
  stations: station.stations,
  groups: station.groups,
  eqUnit: station.eqUnit,
  cycleUnit: station.cycleUnit,
  user: login.user,
}))
@Form.create()
export default class NewForm extends PureComponent {
  constructor() {
    super();

    this.state = {
      submitting: false,
      eqUnitName: '',
      fixedCheckObj: [], // 不变的检查对象 用于过滤
      eqV: {
        value: '',
      },
      areaName: '',
      stationName: '',
      isChagneTime: false,  //生效日期
    };
  }
  groupName = '';
  cardData = '';
  existPlan= false;
  table=null;
  checkObjArr =[];
  areaId = '';
  stationId = '';
  canSub = false;
  componentWillMount() {
    this.initParams();
  }
  componentDidMount() {
    const {stations, groups, dispatch} = this.props;
    dispatch({
      type: 'station/fetchCycleUnit',
    });
    if (!stations || stations.length === 0) {
      dispatch({
        type: 'station/getStationData',
      });
    }

    const stationName = stations.filter(item =>
      item.gid === Number(this.stationId)
    );
    const areaName = groups.filter(item =>
      item.gid === Number(this.areaId)
    );
    this.props.form.setFieldsValue({
      stationId: stationName.length > 0 ? stationName[0].name : '',
      areaId: areaName.length > 0 ? areaName[0].name : '',
    });
    console.log(stationName, areaName);
    this.setState({
      stationName: stationName.length > 0 ? stationName[0].name : '',
      areaName: areaName.length > 0 ? areaName[0].name : '',
    });

    dispatch({
      type: 'station/queryGroups',
      payload: {stationId: this.stationId},
    });
    dispatch({
      type: 'station/queryCheckEq',
      payload: {areaId: this.areaId},
    });
  }

  initParams = () => {
    const { location: { search } } = this.props;
    const { areaId, stationId } = parseValues(search) || '';
    this.areaId = areaId;
    this.stationId = stationId;
  };

  handleBack = () => {
    this.props.dispatch(routerRedux.push('/station/plan'));
  };

  // 数字验证；
  checkNumber = (theObj) => {
    const reg = /^\d+([,，]\d+)*$/;
    if (reg.test(theObj)) {
      return true;
    }
    return false;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const {user, form, dispatch, history} = this.props;
    if (!this.canSub) {
      message.warn('请先保存表单内容');
      return;
    }
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { eqUnitId, areaId, startTime, status, stationId, items = []} = values;
        const {state: {checkData, eqUnitArr}} = this.table;
        if (this.cardData === '' || this.cardData.length === 0) {
          message.warning('请至少填加一项检查对象并保存！');
          return;
        }
        let flag = true;
        if (flag && checkData && checkData.length !== 0) {
          checkData.forEach((item, index) => {
            if (flag && Array.isArray(item) && item.length === 0) {
              message.warn(`检查对象【${eqUnitArr[index]}】下未添加检查项`);
              flag = false;
            }
          });
          if (!flag) {
            return;
          }
        }
        const params = {
          function: 'station_patrol',
          ecode: user.ecode,
          createUserName: user.trueName,
          createUserId: user.gid,
          stationId: !isNaN(Number(stationId)) ? stationId : this.stationId,
          planName: this.state.eqUnitName,
          startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
          areaId: !isNaN(Number(areaId)) ? areaId : this.areaId,
          eqUnitId,
          status,
          checkTargets: JSON.stringify(this.cardData),
        };
        this.setState({submitting: true});
        console.log(params, 'params');
        dispatch({
          type: 'station/makeStationPlanNew',
          payload: params,
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


  checkStation = (value, node) => {
    const {dispatch, groups} = this.props;
    const {dataRef} = node.props;
    console.log(dataRef, 'dataRef');
    if (groups !== '') {
      this.props.form.setFieldsValue({
        areaId: '',
        eqUnitId: '',
      });
    }
    this.setState({
      stationName: dataRef.name,
    });
    dispatch({
      type: 'station/queryGroups',
      payload: {stationId: value},
    });
    // 清空设备单元
    this.table.onChangeEqUnit([]);
    // 清空检查对象
    this.table.onChangeCheckObj([]);
    // 清空检查项
    this.table.resetTables();
  };
    validatePrimeV = (val) => {
      if (val.replace(/[\u0391-\uFFE5]/g, 'aa').length > 40) {
        return {
          validateStatus: 'error',
          errorMsg: '设备单元名称长度不能超过20字!',
        };
      }
    }
    checkLength = (e) => {
      this.setState({
        eqV: {
          ...this.validatePrimeV(e.target.value),
          value: e.target.value,
        },
      });
    };
    checkeqHandler = (val, node) => {
      const {dataRef} = node.props;
      console.log(dataRef, 'eq');
      this.props.form.setFieldsValue({
        eqUnitId: '',
      });
      this.setState({
        areaName: dataRef.name,
      });
      this.props.dispatch({
        type: 'station/queryCheckEq',
        payload: {areaId: val},
      });
      // 清空检查对象
      this.table.onChangeCheckObj([]);
      // 清空检查项
      this.table.resetTables();
    };
    handleFieldChange = (value, node) => {
      const {dataRef} = node.props;
      this.setState({eqUnitName: dataRef.name});
      console.log(this, 'wwwww', this.table);
      this.table.resetTables();
      this.props.dispatch({
        type: 'station/CheckEqData',
        payload: {eqUnitId: value},
        callback: (data) => {
          console.log(data, 'data');
          if (data && data.length > 0) {
            this.table.onChangeCheckObj([]);
            message.warn('该设备单元下已有检查任务！');
          } else {
            this.props.dispatch({
              type: 'station/queryCheckObj',
              payload: {eqUnitId: value},
              callback: (checkObj) => {
                this.setState({fixedCheckObj: checkObj});
              },
            });
          }
        },
      });
    }
    extraHandle = ({params}) => {
      this.cardData = params;
      message.success('保存成功！');
      this.canSub = true;
    };

    disabledDate = (current) => {
      return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
    }
    render() {
      const { stations, groups, cycleUnit, form, eqUnit} = this.props;
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
          sm: {span: 12},
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
                label="站点"
              >
                {getFieldDecorator('stationId', {
                rules: [
                  {required: true, message: '请选择站点'},
                ],
              })(
                <Select
                  placeholder="请选择站点"
                  value={this.state.stationName}
                  onSelect={this.checkStation}
                >
                  {
                    stations.map(st =>
                      <Option key={st.gid} value={st.gid} dataRef={st}>{st.name}</Option>
                    )
                  }
                </Select>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="区域"
              >
                {getFieldDecorator('areaId', {
                rules: [
                  {required: true, message: '请选择区域'},
                ],
              })(
                <Select
                  placeholder="请选择区域"
                  allowClear
                  value={this.state.areaName}
                  onSelect={this.checkeqHandler}
                >
                  {
                    groups.map((it) => {
                      const gidStr = it.gid.toString();
                      return <Option key={it.gid} value={it.gid} dataRef={it}>{it.name}</Option>;
                    })
                  }
                </Select>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="设备单元"
                validateStatus={eqValue.validateStatus}
                help={eqValue.errorMsg || ''}
              >
                {getFieldDecorator('eqUnitId', {
                rules: [{
                  required: true, message: '请选择设备单元',
                }],
              })(
                <Select
                  placeholder="请选择设备单元"
                  allowClear
                  onSelect={this.handleFieldChange}
                >
                  {
                    eqUnit.map(item =>
                      <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                    )
                  }
                </Select>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="是否启用"
              >
                {getFieldDecorator('status', {
                initialValue: '0',
              })(
                <Radio.Group>
                  <Radio value="0">启用</Radio>
                  <Radio value="2">停用</Radio>
                </Radio.Group>
              )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label="生效日期"
              >
                {getFieldDecorator('startTime', {
                initialValue: moment(),
              })(
                <DatePicker disabledDate={this.disabledDate} disabled={this.state.isChangeTime}/>
              )}
              </FormItem>
            </Form>
            <Card className={styles.card} bordered={false}>
              {getFieldDecorator('items', {
              initialValue: ['newPlan'],
            })(
              <NewTableForm
                wrappedComponentRef={table => { this.table = table; }}
                fixedCheckObj={this.state.fixedCheckObj}
                cycleUnit={cycleUnit}
                isChangeTime={(val) => {console.log(val); this.setState({isChangeTime: val}); val === true ? this.props.form.setFieldsValue({'startTime': moment()}) : ''}}
                onChangeSubStatus={() => {
                  this.canSub = false;
                }}
                extraHandle={(params) => { this.extraHandle(params); }}
                handleSubmit={(e) => { this.handleSubmit(e); }}
                submitting={this.state.submitting}
              />
            )}
            </Card>
            <Col span={24}>
              <div style={{
              width: '100%',
              textAlign: 'center',
            }}
              >
                <Button type="button" onClick={this.handleBack}>
                返回
                </Button>
              </div>
            </Col>
          </Card>
        </PageHeaderLayout>
      );
    }
}
