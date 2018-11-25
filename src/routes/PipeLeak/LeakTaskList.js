import React, {Component} from 'react';
import {Button, Input, DatePicker} from 'antd';

import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import moment from 'moment';
import TaskTable from './TaskTable';
import State from './State';
import styles from './index.less';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import SubmitForm from '../../components/SubmitForm/SubmitForm';

import parseUrlParams from '../../utils/utils';

const {RangePicker} = DatePicker;

const STATES = {
  // 0: '未启用',
  0: '未完成',
  1: '已完成',
  2: '已超期'
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
  pState: '',
  pFunction: 'check_leak_device',
  pRange: [null, null],
  likeValue:''
};

@connect(({leak, login}) => ({
  loading: leak.loading,
  taskData: leak.taskData,
  uStation: login.datas,
  visible: leak.visible,
  user: login.user,
  submitLoading: leak.submitLoading,
  stationUsers: leak.stationUsers,
  taskInfo: leak.taskInfo,
}))


export default class LeakTaskList extends Component {
  _param={};
  constructor(props) {
    super(props);
    this.state = {
      ...defState,
      showTask: false,
    };
    this._param=this.getUrlParams() ||{};
  }

  getUrlParams=()=>{
    const {location:{search}}=this.props ||'';
    return parseUrlParams(search)
  };
  componentWillMount(){
   if(this.props.location.search){
    const val = this.getUrlParams().function || {};
    this.expOnChange('pFunction', val);
   }
  };
  componentDidMount() {
    this.queryPlanData();
  }

  handleTableChange = ({current, pageSize}) => {
    this.queryPlanData({
      pageno: current,
      pagesize: pageSize,
    });
  };
  queryHandle = () => {
    this.queryPlanData();
  };
  queryPlanData = (params = {}) => {
    const {uStation} = this.props;
    const {planId} = this._param;
    // const stId = (uStation && uStation.length > 0) ? uStation[0].gid : 0;
    const {pFunction,likeValue,pState, pRange} = this.state;
    const st = moment(pRange[0]).format('YYYY-MM-DD') + " " + "00:00:00";
    const et = moment(pRange[1]).format('YYYY-MM-DD') + " " + "23:59:59";
    const data = {
      planId:planId,
      // stationId: stId,
      // function: pFunction,
      functionKey:pFunction,
      startTime: pRange[0] ? st : null,
      endTime: pRange[1] ? et : null,
      status: pState,
      others: likeValue,
      pageno: 1,
      pagesize: 10,
      ...params
    };
    this.props.dispatch({
      type: 'leak/queryTaskList',
      payload: data
    })
  };
  resetHandle = () => {
    this.setState(defState);
    const {pFunction,likeValue,pState, pRange} = defState;
    this.queryPlanData({function: pFunction, functionKey:pFunction, status: pState, others: likeValue, startTime: pRange[0], endTime: pRange[1]})
  };
  expOnChange = (fld, val) => {
    this.setState({[fld]: val});
  };

  showTaskInfo = (task) => {
    // const st = task.startTime.slice(0, 10)
    // const et = task.endTime.slice(0, 10)
    // let stime = moment(st).format('YYYYMMDDHHmmss');
    // let etime = moment(et).format('YYYYMMDDHHmmss');
    this.props.dispatch(routerRedux.push(`/query/leak-task/patrol-car-leak-point?startTime=${task.startTime}&endTime=${task.endTime}&userids=${task.assigneeIds}&functionKey=${task.functionKey}&userName=${task.assigneeNames}&taskId=${task.gid}`));
  };

  render() {
    const {loading, taskData} = this.props;
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
            <Input placeholder="责任人、任务名称" value={this.state.likeValue} onChange={(e) => {
              this.expOnChange('likeValue', e.target.value);
            }} style={{width: 154}}/>
          </div>
          <div className={styles['field-block']}>
            <Button style={{marginRight: 20}} type="primary" onClick={this.queryHandle}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
          </div>
        </div>
        <TaskTable
          loading={loading}
          data={taskData}
          onTableChange={this.handleTableChange}
          leakTypes={LEAK_TYPES}
          showTaskInfo={this.showTaskInfo}
        />
        {
          this.state.showTask ?
            <Dialog
              title="任务详情"
              onClose={()=>{
                this.setState({showTask:false});
              }}
            >
              <SubmitForm
                column={1}
                data={
                  this.props.taskInfo||[]
                }/>
            </Dialog> : null
        }
      </PageHeaderLayout>
    );
  }
}
