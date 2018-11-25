import React, {Component} from 'react';
import {Button, message, DatePicker, Input} from 'antd';

import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import moment from 'moment';
import PlanTable from './PlanTable';
import State from './State';
import styles from './index.less';
import MakeModal from './MakeModal';

const {RangePicker} = DatePicker;

const STATES = {
  // 0: '未启用',
  1: '启用',
  2: '停用'
};

const LEAK_TYPES = [
  {name: 'check_leak_car', alias: '巡检车'},
  {name: 'check_leak_device', alias: '检漏仪'}
];

const stateArr = [
  {name: '', alias: '全部'},
  ...Object.keys(STATES).map(ii => ({name: ii, alias: STATES[ii]}))
];

const defState = {
  pState: null,
  pFunction: 'check_leak_device',
  pRange: [null, null],
  likeValue: null,
};

@connect(({leak, login}) => ({
  loading: leak.loading,
  data: leak.data,
  uStation: login.datas,
  visible: leak.visible,
  user: login.user,
  submitLoading: leak.submitLoading,
  stationUsers: leak.stationUsers
}))

export default class LeakPlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...defState
    }
  }

  componentDidMount() {
    const {data: {list}} = this.props;
    if (list.length === 0) {
      this.queryPlanData();
    }
  }

  handleTableChange = ({current, pageSize}) => {
    this.queryPlanData({
      pageno: current,
      pagesize: pageSize,
    });
  };
  // queryHandle = () => {
  //   this.queryPlanData();
  // };
  queryPlanData = (params = {}) => {
    const {uStation} = this.props;
    // const stId = (uStation && uStation.length > 0) ? uStation[0].gid : 0;
    const {pFunction, pState, likeValue, pRange} = this.state;
    const st = moment(pRange[0]).format('YYYY-MM-DD') + " " + "00:00:00";
    const et = moment(pRange[1]).format('YYYY-MM-DD') + " " + "23:59:59";
    const data = {
      // stationId: stId,
      functionKey: pFunction,
      pageno: 1,
      pagesize: 10,
      startTime: pRange[0] ? st : null,
      endTime: pRange[1] ? et : null,
      status: pState,
      others: likeValue,
      ...params
    };
    this.props.dispatch({
      // type: 'leak/queryPlanData',
      type: 'leak/queryLeakPlanData',
      payload: data
    })
  };
  resetHandle = () => {
    this.setState(defState, () => {
      this.queryPlanData();
    });
  };
  expOnChange = (fld, val) => {
    this.setState({[fld]: val});
  };
  toggleMakeModal = () => {
    const {dispatch, visible} = this.props;
    dispatch({
      type: 'leak/changeVisible',
      payload: !visible
    });

  };


  okHandle = (formData, station, callback) => {
    const {gid, loc_name} = station;
    const {userid, truename, planName, rangeTime: [st, et], status} = formData;
    const {user} = this.props;
    const leakType = LEAK_TYPES.filter(item => item.name === this.state.pFunction)
    const data = {
      functionKey: this.state.pFunction,
      functionName: leakType[0].alias,
      stationName: loc_name,
      startTime: st.format('YYYY-MM-DD 00:00:00'),
      endTime: et.format('YYYY-MM-DD 23:59:59'),
      name: planName,
      status,
      assigneeIds: userid,
      assigneeNames: truename,
      equipments: '',
      params: JSON.stringify({}),
      ecode: user.ecode,
      ename: user.company,
      stationId: gid,
      createrId: user.id,
      createrName: user.trueName
    };
    this.props.dispatch({
      type: 'leak/addLeakTempPlan',
      payload: data,
      callback: ({success, msg}) => {
        if (!success) {
          message.error(msg);
          return;
        }
        message.success('添加成功');
        callback && callback();
        this.queryPlanData();
        this.toggleMakeModal();
      }
    });
  };

  cancelHandle = () => {
    this.toggleMakeModal();
  };

  render() {
    const {loading, data, visible, uStation, submitLoading, stationUsers} = this.props;
    const userStation = uStation.filter((item)=>{
      return item.loc_type === 'SITE'
    })
    return (
      <PageHeaderLayout>
        <div className={styles.panel}>
          <div className={styles['field-block']}>
            <label>检漏方式：</label>
            <State
              datas={LEAK_TYPES}
              onChange={(d) => {
                this.expOnChange('pFunction', d);
              }}
              value={this.state.pFunction}
            />
          </div>
          <div className={styles['field-block']}>
            <label>计划状态：</label>
            <State datas={stateArr} onChange={(d) => {
              this.expOnChange('pState', d);
            }} value={this.state.pState}/>
          </div>
          <div className={styles['field-block']}>
            <Button type="primary" onClick={this.toggleMakeModal}>添加计划</Button>
          </div>
          <br/>
          <div className={styles['field-block']}>
            <RangePicker
              style={{width: 200}}
              value={this.state.pRange}
              onChange={(range) => {
                this.expOnChange('pRange', range);
              }}
            />
          </div>
          <div className={styles['field-block']}>
            <label>快速查询：</label>
            <Input placeholder="计划名称、责任人" value={this.state.likeValue} onChange={(e) => {
              this.expOnChange('likeValue', e.target.value);
            }} style={{width: 210}}/>
          </div>
          <div className={styles['field-block']}>
            <Button style={{marginRight: 20}} type="primary" onClick={() => {this.queryPlanData()}}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
          </div>
        </div>
        <PlanTable
          loading={loading}
          data={data}
          onTableChange={this.handleTableChange}
          leakTypes={LEAK_TYPES}
        />
        <MakeModal
          visible={visible}
          stations={userStation}
          loading={submitLoading}
          stationUsers={stationUsers}
          cancelHandle={this.cancelHandle}
          okHandle={this.okHandle}
          dispatch={this.props.dispatch}
        />
      </PageHeaderLayout>
    );
  }
}
