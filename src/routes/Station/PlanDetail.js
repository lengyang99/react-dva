import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import range from 'lodash/range';
import {
  Form, Input, DatePicker, Select, Button, Card, InputNumber, Radio, Col, TimePicker, message,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {routerRedux} from 'dva/router';
import NewTableForm from './ModalForm/NewTableForm';
import styles from './ModalForm/style.less';
import parseValues from '../../utils/utils';

const FormItem = Form.Item;
const {Option} = Select;

const PeriodFormat = 'HH:00';

@connect(({station, login}) => ({
  stations: station.stations,
  groups: station.groups,
  eqUnit: station.eqUnit,
  cycleUnit: station.cycleUnit,
  planDetaileData: station.planDetaileData,
  user: login.user,
}))
@Form.create()
export default class PlanDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.initParams();
    this.state = {
      submitting: false,
      eqUnitName: '',
      eqUnitId: '',
      eqV: {
        value: '',
      },
    };
  }
  planId='';
  groupId = '';
  cardData = '';
  delCheckItemIds= '';
  delCheckTargetIds= '';
  canSub = false;
  componentDidMount() {
    const {stations, groups, eqUnit, planDetaileData} = this.props;
    this.props.dispatch({
      type: 'station/fetchCycleUnit',
    });
    if (!stations || stations.length === 0) {
      this.props.dispatch({
        type: 'station/getStationData',
      });
    }

    if (!groups || groups.length === 0) {
      this.props.dispatch({
        type: 'station/queryGroups',
      });
    }

    if (!eqUnit || eqUnit.length === 0) {
      this.props.dispatch({
        type: 'station/queryCheckEq',
        payload: {areaId: this.groupId},
      });
    }

    if (Object.keys(planDetaileData).length > 0) {
      console.log(planDetaileData, '☆');
      this.getPlanDetail(planDetaileData);
    }
  }
  getPlanDetail = (planDetaileData) => {
    // const { stationId, groupId, name, status, anytime, startTime, cycleInfo:{frequency, unit, startTime: beginTime, endTime}, formInfo } = planDetaileData;
    const {ecode, createUserName, createUserId, stationId, name, startTime, areaId, equipmentUnitId, status} = planDetaileData.planInfo;
    // const { frequency, unit, startTime: beginTime, elendTime } = cycleInfo;

    // const dataSource = formInfo && formInfo.length !== 0 ? formInfo[0].items : [];
    // let data=[];
    // dataSource.forEach(ele => {
    //   let params={...ele,key:`EDIT_TEMP_ID_${ele.gid}`};
    //   data.push(params);
    // });
    this.setState({
      eqUnitName: name,
      eqUnitId: equipmentUnitId,
    });
    this.props.form.setFieldsValue({
      stationId,
      areaId,
      eqUnitId: name,
      status: status === 2 ? '2' : '0',
      startTime: startTime ? moment(startTime, 'YYYY-MM-DD') : moment(),
      // periodBegin: beginTime ? moment(beginTime, 'HH') : moment(),
      // periodEnd: endTime ? moment(endTime, 'HH') : moment().add(1, 'hours')
    });
  };

  initParams = () => {
    const {location: {search}} = this.props;
    const {planId, groupId} = parseValues(search) || {};
    this.planId = planId;
    this.groupId = groupId;
  }
  handleBack = () => {
    this.props.dispatch(routerRedux.push(`/station/plan?groupId=${this.groupId}`));
  };

  // 数字验证；
  checkNumber = (theObj) => {
    const reg = /^\d+([,，]\d+)*$/;
    // var reg = /^\d+(,\d+)*$/
    if (reg.test(theObj)) {
      return true;
    }
    return false;
  };
  handleFieldChange = (value) => {
    console.log('12345', value);
    this.props.dispatch({
      type: 'station/queryCheckObj',
      payload: {eqUnitId: value},
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    const {user, form, dispatch, history} = this.props;
    if (this.table.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    if (!this.canSub) {
      message.warn('请先保存表单内容');
      return;
    }
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { areaId, startTime, status, stationId, items = []} = values;
        const {eqUnitId, eqUnitName} = this.state;
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
          planId: this.planId,
          ecode: user.ecode,
          stationId,
          planName: eqUnitName,
          startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
          status,
          areaId,
          eqUnitId,
          delCheckItemIds: this.delCheckItemIds,
          delCheckTargetIds: this.delCheckTargetIds,
          checkTargets: JSON.stringify(this.cardData),
        };
        console.log(params, 'params');
        this.setState({submitting: true});
        dispatch({
          type: 'station/editStationRPlan',
          payload: params,
          callback: ({success, msg}) => {
            this.setState({submitting: false});
            if (success) {
              message.success('编辑成功！');

              history.goBack();
            } else {
              message.warn(msg);
            }
          },
        });
      }
    });
  };

  extraHandle = ({params, delCheckItemIds, delCheckTargetIds}) => {
    this.cardData = params;
    this.delCheckItemIds = delCheckItemIds;
    this.delCheckTargetIds = delCheckTargetIds;
    this.canSub = true;
    message.success('保存成功');
  };

   validatePrimeV = (val) => {
     if (val.replace(/[\u0391-\uFFE5]/g, 'aa').length > 40) {
       return {
         validateStatus: 'error',
         errorMsg: '设备单元名称长度不能超过20字!',
       };
     }
   };
    checkLength = (e) => {
      console.log(e.target.value, 'vvv');
      this.setState({
        eqV: {
          ...this.validatePrimeV(e.target.value),
          value: e.target.value,
        },
      });
    };
    checkEq = (value) => {
      console.log(value, 'eq');
    };

    disabledDate = (current) => {
      return current && current.valueOf() < new Date(new Date().getTime() - 86400000);
    }
  table=null;

  render() {
    const { stations, groups, cycleUnit, eqUnit, form} = this.props;
    const {getFieldDecorator, getFieldsValue} = form;
    const eqValue = this.state.eqV;
    const winWidth = window.innerWidth;
    console.log(winWidth, 'winWidth');
    console.log(this.props, 'props');
    console.log(this.state, 'state');
    const formItemLayout = {
      labelCol: {
        xs: {span: 24},
        sm: {span: 7},
      },
      wrapperCol: {
        xs: {span: 24},
        sm: {span: 12},
        md: {span: 10},
      },
    };

    return (
      <PageHeaderLayout showBack >
        <Card bordered={false} style={{minWidth: 1200, overflowX: 'visible'}}>
          <Form
            onSubmit={this.handleSubmit}
          >
            <FormItem
              {...formItemLayout}
              label="站点"
            >
              {getFieldDecorator('stationId', {
                rules: [
                  {required: true, message: '请选择站点'}],
              })(
                <Select disabled placeholder="请选择站点">
                  {
                    stations.map(st =>
                      <Option key={st.gid} value={st.gid}>{st.name}</Option>
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
                  disabled
                  placeholder="请选择区域"
                  allowClear
                  onSelect={this.checkEq}
                >
                  {
                    groups.map(it => {
                      const gidStr = it.gid.toString();
                     return <Option key={it.gid} value={it.gid}>{it.name}</Option>;
                    })
                  }
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="设备单元"
            >
              {getFieldDecorator('eqUnitId', {
                rules: [{
                  required: true, message: '请选择设备单元',
                }],
              })(
                <Select
                  disabled
                  placeholder="请选择设备单元"
                  allowClear
                  onSelect={this.handleFieldChange}
                >
                  <Option key="1" value={this.state.eqUnitName}>{this.state.eqUnitName}</Option>
                </Select>
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="是否启用"
            >
              {getFieldDecorator('status', {
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
              })(
                <DatePicker disabledDate={this.disabledDate} />
              )}
            </FormItem>
          </Form>
          <Card className={styles.card} bordered={false}>
            {getFieldDecorator('items', {
              initialValue: ['edit'],
            })(
              <NewTableForm
                wrappedComponentRef={table => { this.table = table; }}
                cycleUnit={cycleUnit}
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
              <Button type="button" style={{marginRight: 10}} onClick={this.handleBack}>
                返回
              </Button>
            </div>
          </Col>
        </Card>
      </PageHeaderLayout>
    );
  }
}
