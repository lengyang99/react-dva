import React, {PureComponent} from 'react';
import { message, Pagination, Button, Icon, Col, Row, Input, Spin, Alert, DatePicker, Select, Card, Table, Tooltip  } from 'antd';
import parseValues from '../../utils/utils';
import {connect} from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SubmitForm from '../../components/SubmitForm/SubmitForm';
import {routerRedux, Router, Route, Link} from 'dva/router';
import { getCurrTk } from '../../utils/utils.js';
import styles from './CheckData/style.less'
import {stringify} from 'qs';
const { MonthPicker, RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
const Option = Select.Option;

@connect(({station, login}) => ({
  planTasks: station.planTasks,
  taskDetailData: station.taskDetailData,
  planTaskTotal: station.planTaskTotal,
  user: login.user,
}))
export default class TaskDetail extends PureComponent {
  areaId = '';
  startTime = '';
  endTime = '';
  stationId = '';
  ecode = '';
  equipmentUnitId = '';
  stationName = '';
  pageno = 1;
  pagesize = 10;
  stateValues = [
    {name: 0, alias: '未完成'},
    {name: 1, alias: '完成'},
    {name: 2, alias: '超期'}
  ];
  isTitle = 'false';
  isSpace = 'false';

  constructor(props) {
    super(props);
    this.state = {
      taskData: [],
      loading: true,
      unit: '全部',
      startTime: '',
      endTime: '',
      others: '',
    }
    this.initParams();
    this.fetchData();
  }
  taskdata = [];
  fetchData=()=> {
    const {dispatch} = this.props;
    // dispatch({
    //   type: 'station/queryPlanTasks',
    //   payload: {
    //     areaId: this.areaId,
    //     startTime: this.st,
    //     endTime: this.et,
    //     stationId: this.stationId,
    //     ecode: this.ecode,
    //     equipmentUnitId: this.equipmentUnitId,
    //     pageno: this.pageno,
    //     pagesize: this.pagesize,
    //   },
    //   callback: (key) => {
    //     if(!this.props.taskDetailData){
    //       this.queryTaskDetail(key);
    //     }
    //   }
    // });

  };

  componentDidMount(){
    this.queryTaskDetail()
  }
  componentWillReceiveProps(nextProps) {
    const {location: {search}} = nextProps;
    // if(search!==this.props.location.search){
    //   const {planId, st, et} = parseValues(search) || {};
    //   this.planId = planId;
    //   this.startTime = st;
    //   this.endTime = et;
    //   this.fetchData();
    // }
  }

  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state,callback)=>{
      return;
    };
  }

  initParams = () => {
    const {location: {search}} = this.props;
    const {areaId, st, et, stationId, ecode, equipmentUnitId, stationName} = parseValues(search) || {};
    this.areaId = areaId;
    this.stationId = stationId;
    this.ecode = ecode;
    this.startTime = st;
    this.endTime = et;
    this.equipmentUnitId = equipmentUnitId;
    this.stationName = stationName;

    this.setState({
      startTime: st,
      endTime: et,
    })
  };
  queryTaskDetail = (params) => {
    const {unit, startTime, endTime, others} = this.state
    this.props.dispatch({
      type: 'station/getTaskDetail',
      payload: {
        // taskId: taskId,
        areaId: this.areaId,
        startTime: startTime ? startTime : this.startTime,
        endTime: endTime ? endTime : this.endTime,
        stationId: this.stationId,
        equipmentUnitId: this.equipmentUnitId,
        unit: unit ? (unit === '全部' ? null : unit) : null,
        others: others ? others : null,
        // function: 'station_patrol'
      },
      callback: (data) => {
        this.setState({
          taskData: data || [],
        });
      }
    });
  };
  panelChangeHandle = (key) => {
    if(key !== undefined){
      this.queryTaskDetail(key);
    }
  };
  showBack = () => {
    this.pagesize = 10
    this.pageno = 1
    const {history} = this.props
    this.props.history.push(`/station/task?groupName=${this.areaId}&stationId=${this.stationId}&stationName=${this.stationName}`);
    // history.goBack();
  };

  reloadFile = () => {
    this.pagesize = 10
    this.pageno = 1
    this.fetchData();

  };

  onShowSizeChange = (current, pageSize) => {
    this.pagesize = pageSize
    this.pageno = 1
    this.fetchData()
  };

  pageChange = (current, pageSize) => {
    this.pageno = current
    this.fetchData()
  };

  checkHandler = () => {
    const {unit, startTime, endTime} = this.state;
    console.log(unit, startTime, endTime);

    this.queryTaskDetail({unit, startTime, endTime})
  };

  changeUnitHandler = (val) => {
    console.log(val);
    // const value = val === '全部' ? null : val;
    this.setState({unit: val})
  };

  timeHandler = (value) => {
    this.setState({
      startTime: moment(value[0]).format('YYYY-MM-DD 00:00:00'),
      endTime: moment(value[1]).format('YYYY-MM-DD 23:59:59'),
    })
  };

  quikCheck = (val) => {
    console.log(val, "val");
    this.setState({
      others: val,
    })
  };
  handleTableChange = (pagination) => {
    this.setState({
        current: pagination.current,
    });
  }
  render() {
    const {planTasks, taskDetailData, planTaskTotal} = this.props;
    const { taskData, unit, startTime, endTime, others } = this.state;
    console.log(this.state, 'state');
    const options = ['全部', '随时', '小时', '日', '月', '周', '年']
    const columns = (
      [{
         title: '检查项',
         dataIndex: 'alias',
         render: (text, record) => {
            return <p>{record.feedbackInfo.alias}</p>
         }
      }, {
         title: '反馈内容',
         dataIndex: 'value',
         render: (text, record) => {
            const val = record.feedbackInfo.items ? record.feedbackInfo.items[0].value : null;
            return (<div className={styles['textOverflow']}>
                <Tooltip placement="topLeft" title={val}>{val}</Tooltip>
            </div>);
         }
      }, {
         title: '开始时间',
         dataIndex: 'startTime',
         render: (text, record) => {
          return <p>{record.taskInfo.startTime}</p>
         }
      }, {
         title: '结束时间',
         dataIndex: 'endTime',
         render: (text, record) => {
          return <p>{record.taskInfo.endTime}</p>
         }
      }, {
         title: '频率',
         width: '10%',
         dataIndex: 'frequency',
         render: (text, record) => {
            const val = record.feedbackInfo.items ? record.feedbackInfo.items[0].defaultvalue : null;
              if(record.taskInfo.frequency && record.taskInfo.unit){
                return <p>{`${record.taskInfo.frequency}${record.taskInfo.unit}/次`}</p>
              }
         }
      },{
         title: '反馈时间',
         dataIndex: 'feedbackTime',
         render: (text, record) => {
          return <p>{record.taskInfo.feedbackTime}</p>
         }
      }, {
         title: '反馈人',
         dataIndex: 'feedbackUserName',
         render: (text, record) => {
          return <p>{record.taskInfo.feedbackUserName}</p>
         }
      }]
    )

    return (
      <PageHeaderLayout showBack={this.showBack}>
        <div style={{minWidth: 1300, minHeight: 120}}>
          <div style={{ height: 40, margin: '20px 20px', padding: '20px 0'}}>
            <div className={styles['field-block']}>
              <RangePicker
                defaultValue={[moment(new Date(), dateFormat), moment(moment(new Date()).add('days', 2), dateFormat)]}
                format={dateFormat}
                onChange={(value) => this.timeHandler(value)}
              />
            </div>
            <div className={styles['field-block']}>
              <label>单位：</label>
              <Select defaultValue="全部"
                style={{ width: 120 }}
                value={this.state.unit}
                onSelect={this.changeUnitHandler}>
                {options.map((item, index) =>
                  <Option
                    value={item}
                    key={index}
                  >{item}</Option>
                )}
              </Select>
            </div>
            <div className={styles['field-block']}>
              <span>快速查询：</span>
              <Input placeholder="检查对象、上报人" style={{width: 140}} value={this.state.others} onChange={(e) => this.quikCheck(e.target.value)}/>
            </div>
            <div className={styles['field-block']}><Button type='primary' onClick={this.checkHandler}>查询</Button></div>
            <div className={styles['field-block']}>
            <Button type="primary">
                <Icon type="download" />
                <a href={`${window.location.origin}/proxy/station/pad/summary/detail/export/excel?${stringify({unit, startTime, endTime, others, ecode: this.props.user.ecode, token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
            </Button>
        </div>
          </div>
          {
            taskDetailData.length > 0 ? taskDetailData.map((item) =>
              <Card title={item.checkTargetName} style={{margin: '0px 20px 20px 20px'}} key={item.checkTargetId}>
                <Table
                  columns={columns}
                  dataSource={item.tasksInfo}
                  size="small"
                  rowKey={record => record.taskInfo.taskId}
                  pagination={{
                    total: item.tasksInfo.length,
                    showTotal: (total,range)=>{
                        return (<div> 共 {total} 条记录 </div>);
                    }
                  }}
                />
              </Card>
            ):
            (<div style={{borderTop: '1px solid #ccc', marginTop: 40, width: '100%', height: 30, textAlign: 'center'}}>
              <span style={{fontSize: 18}}>暂没数据</span>
            </div>)
          }
        </div>
      </PageHeaderLayout>
    )
  }


}
