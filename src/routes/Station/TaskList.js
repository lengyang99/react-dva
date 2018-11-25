import React, { PureComponent } from 'react';
import {Link, routerRedux, Router, Route} from 'dva/router';
import { message, Button, Select, Col, DatePicker, Tooltip, Table, Icon, Spin } from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import moment from 'moment';
import fetch from 'dva/fetch';
import styles from './CheckData/style.less';
import { connect } from 'dva';
import parseValues from '../../utils/utils';
import { getCurrTk } from '../../utils/utils.js';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import TaskCardList from '../../components/CardList/TaskCardList';
import TaskSearch from './SearchPanel/TaskSearch';
import {stringify} from 'qs';
const { RangePicker } = DatePicker;
const Option = Select.Option;
const options = [ '随时', '小时', '日', '月', '周', '年'];
const dateFormat = 'YYYY-MM-DD';
let pageFilter = {};

const feedback_state = [
  {name: null, alias: '全部'},
  {name: 1, alias: '已反馈'},
  {name: 0, alias: '未反馈'}
];

@connect(({ station, login }) => ({
  groups: station.groups,
  taskData: station.taskData,
  stations: station.stations,
  planLoading: station.planLoading,
  showTaskDlg: station.showTaskDlg,
  taskInfo: station.taskInfo,
  taskTotal: station.taskTotal,
  taskPaginations: station.taskPaginations,
  taskNewData: station.taskNewData,
  taskTotal: station.taskTotal,
  feedbackUsers: station.feedbackUsers,
  user: login.user || []
}))

export default class TaskList extends PureComponent {
  constructor(props) {
    super(props);
    // this.initParams();
  }
  state = {
    stationId: '',
    areaId: '',
    startTime: null,
    endTime: null,
    unit: '',
    feedbackUserName: '',
    feedbackTime1: null,
    feedbackTime2: null,
    pageno: 1,
    pagesize: 20,
    downLoading: false,
    checkId: null,  //是否反馈
  };

  groupName = '';
  stationId = '';
  stationName = '';

  componentWillMount(){
    if(this.props.location.search !== ""){
      this.initParams()
    }
  }
  componentDidMount() {
    if(this.props.location.search === "" && this.props.location.state === undefined){
      this.props.dispatch({
        type: 'station/getStationData',
        callback: (res) => {
          const stationId = res.data ? res.data[0].gid : '';
          this.stationId = stationId;
          this.ecode = res.data ? res.data[0].ecode : '';
          this.setState({
            stationName: res.data ? res.data[0].name : '',
            stationId,
          })
          this.props.dispatch({
            type: 'station/queryFeedbackUsers',
            payload:{stationId},
          });
          this.props.dispatch({
            type: 'station/queryGroups',
            payload:{stationId},
            callback: (data, key) => {
            this.queryPlanList();
            },
          });

        }
      });
    }else if(this.props.location.search !== ""){
      this.setState({
        stationId: this.stationId,
        areaId: this.groupName || '',
        stationName: this.stationName,
      }, () => {
        this.props.dispatch({
          type: 'station/queryFeedbackUsers',
          payload:{stationId: this.stationId},
        });
        this.props.dispatch({
          type: 'station/getStationData',
        });
        this.props.dispatch({
          type: 'station/queryGroups',
          payload:{stationId: this.stationId},
          callback: (data) => {
            data && data.map(item => {
              if(Number(item.gid) === Number(this.groupName)){
                this.setState({areaName: item.name})
              }
            })
          }
        });
        pageFilter = {...this.state};        
        this.queryPlanList();
      })
    }else if(this.props.location.state !== undefined){
      this.setState({
        ...this.props.location.state
      }, () => {
        this.props.dispatch({
          type: 'station/queryFeedbackUsers',
          payload:{stationId: this.props.location.state.stationId},
        });
        this.props.dispatch({
          type: 'station/getStationData',
        });
        this.props.dispatch({
          type: 'station/queryGroups',
          payload:{stationId: this.props.location.state.stationId},
          callback: (data) => {
            data && data.map(item => {
              if(Number(item.gid) === Number(this.groupName)){
                this.setState({areaName: item.name})
              }
            })
          }
        });
        pageFilter = {...this.props.location.state};        
        this.queryPlanList();
      })
    }
  };

  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state,callback)=>{
      return;
    };
  }
  initParams = () => {
    const { location: { search } } = this.props;
    const { equipmentUnitId, groupName, stationId, stationName, ecode } = parseValues(search) || '';
    this.planId = equipmentUnitId;
    this.groupName = groupName;
    this.stationId = stationId;
    this.stationName = stationName;
    this.ecode = ecode;
  };

  queryTaskList = (params) => {
    if (this.planId !== '') {
      Object.assign(params, { equipmentUnitId: this.planId });
    }
    const { taskPaginations, dispatch} = this.props;
    const { current, pageSize } = taskPaginations;
    const { startTime, endTime } = params;
    const mon = moment();
    dispatch({
      type: 'station/queryTasks',
      payload: {
        stationId: this.stationId,
        pageno: current,
        pagesize: pageSize,
        function: 'station_patrol',
        areaId: params.areaId,
        ...params,
        startTime: startTime || mon.format('YYYY-MM-DD 00:00:00'),
        endTime: endTime || mon.format('YYYY-MM-DD 23:59:59'),
        // startTime: '2017-12-24 23:59:59',
        // endTime: '2018-12-24 23:59:59',
      }
    });
  };

  queryPlanList = () => {
    const params = {...this.state}
    delete params.stationName;
    delete params.areaName;
    const { taskPaginations, dispatch} = this.props;
    const mon = moment();
    dispatch({
      type: 'station/queryPlanList',
      payload: {
        ...params,
      }
    });
  };
  changeHandler = (val, fileName, node) => {
    console.log(val, 'check')
    if(fileName === 'stationId'){
      const {dataRef} = node.props;
      this.props.dispatch({
        type: 'station/queryGroups',
        payload: { stationId: val },
        callback: (data, key) => {
          this.setState({
            stationName: dataRef ? dataRef.name : '',
          })
        }
      })
    }
    if(fileName === 'areaId'){
      const {dataRef} = node.props;
      this.setState({
        areaName: dataRef ? dataRef.name : '',
      })
    }
    if(fileName === 'feedbackTime'){
      this.setState({
        feedbackTime1:  val.length > 0 ? moment(val[0]).format('YYYY-MM-DD 00:00:00') : null,
        feedbackTime2:  val.length > 0 ? moment(val[1]).format('YYYY-MM-DD 23:59:59') : null,
      })
    }else if(fileName === 'rangeTime'){
      this.setState({
        startTime: val.length > 0 ? moment(val[0]).format('YYYY-MM-DD 00:00:00') : null,
        endTime: val.length > 0 ? moment(val[1]).format('YYYY-MM-DD 23:59:59') : null,
      })
    }else{
      this.setState({
        [fileName]: val,
      })
    }
  };
  timeHandler = (value) => {
    this.setState({
      startTime: moment(value[0]).format('YYYY-MM-DD 00:00:00'),
      endTime: moment(value[1]).format('YYYY-MM-DD 23:59:59'),
    })
  };
  //查询
  checkHandler = () => {
    this.setState({
      pageno: 1,
      pagesize: 20
    }, () => {
      pageFilter = {...this.state}
      this.queryPlanList()
    })
  };
  //重置
  resetHandler = () => {
    this.setState({
      stationId: '',
      stationName: '',
      areaId: '',
      areaName: '',
      startTime: null,
      endTime: null,
      unit: '',
      feedbackUserName: '',
      feedbackTime: '',
      checkId: null,
      pageno: 1,
      pagesize: 20,
    }, () => {
      this.queryPlanList()
    })

  }
  pageChange = (pagination) => {
    const {current, pageSize} = pagination
    delete pageFilter.pageno;
    delete pageFilter.pagesize;
    this.setState({
      pageno: current,
      pagesize: pageSize,
    }, () => {
      this.props.dispatch({
        type: 'station/queryPlanList',
        payload: {
          ...pageFilter,
          pageno: current,
          pagesize: pageSize,
        }
      });
    });
  };

  downLoadData =() => {
    const { pageno, pagesize, stationId, areaId, startTime, endTime, unit, feedbackUserName, feedbackTime1, feedbackTime2} = this.state;
    this.setState({downLoading: true,});
    const url = `${window.location.origin}/proxy/station/task/summary/export/excel?${stringify({pageno, pagesize, unit, startTime, endTime, feedbackTime1, feedbackTime2, stationId, areaId, feedbackUserName, ecode: this.props.user.ecode, token: getCurrTk()})}`
    let header = {
        "Content-Type": "application/json;charset=UTF-8",
    };
    location.href = url;
    return fetch(url, {
            method: 'GET',
            headers: header,
        }).then((response) => response.blob())
        .then((responseData) => {
            console.log('res:',url, responseData);
            if(responseData){
                this.setState({
                    downLoading: false,
                })
            }
        })
        .catch( (err) => {
            console.log('err:',url, err);
        });
    };
    feedbackDetail = (record) => {
      console.log(record, 'record')
      const stationId = record.stationId ? record.stationId : '';
      const areaId = record.areaId ? record.areaId : '';
      const path = {
        pathname: '/station/task-feedback',
        state: this.state,
        params: {
          stationId,
          areaId
        }
      };
      this.props.dispatch(routerRedux.push(path));
    }

  render() {
    const {  taskNewData, taskTotal, groups, stations, feedbackUsers } = this.props;
    const { pageno, pagesize, stationId, areaId, startTime, endTime, unit, feedbackUserName, feedbackTime1, feedbackTime2} = this.state;

    const columns = (
      [{
         title: '区域',
         dataIndex: 'areaName',
         width: '15%',
      }, {
         title: '设备单元',
         dataIndex: 'equipmentUnitName',
         width: '10%',
      }, {
        title: '检查对象',
        dataIndex: 'checkTargetName',
        width: '10%',
      }, {
        title: '检查项',
        dataIndex: 'checkItemName',
        width: '10%',
      }, {
        title: '反馈内容',
        dataIndex: 'feedbackInfo',
        width: '10%',
        render: (text, record) => {
           return (<div className={styles['textOverflow']}>
               <Tooltip placement="topLeft" title={text}>{text}</Tooltip>
           </div>);
        }
      }, {
        title: '周期',
        dataIndex: 'unit',
        width: '4%',
      }, {
        title: '反馈时间',
        dataIndex: 'feedbackTime',
        width: '12%',
      }, {
        title: '开始时间',
        dataIndex: 'startTime',
        width: '12%',
      },{
        title: '结束时间',
        dataIndex: 'endTime',
        width: '12%',
      },{
         title: '反馈人',
         dataIndex: 'feedbackUserName',
         width: '10%',
      },
      {
        title: '操作',
        dataIndex: 'operation',
        width: '5%',
        render: (test, record) => {
          if(record.feedbackInfo === ''){
            return (
              // <div style={{width: 60}}><Link to={`task-feedback?stationId=${record.taskId}&areaId=${record.areaId}`}>任务反馈</Link></div>
              <div style={{width: 60}}><a onClick={() => this.feedbackDetail(record)}>任务反馈</a></div> 
            )
          }
        },
      },
    ]
    )

    // 表格分页
    const pagination = {
      total: taskTotal,
      current: pageno,
      pageSize: pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: 20,
      pageSizeOptions: ['20', '50', '100', '1000'],
      showTotal: (total, range) => {
        return (<div>
          共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
        </div>);
      },
    };

    const State = ({datas, value, onChange, defaultValue}) => {
      const items = datas.map(item =>
          <label className={styles['state-item']}
                 style={{
                   color: item.name === (value !== undefined ? value : defaultValue) ? '#1C8DF5' : '#272727'
                 }}
                 onClick={() => {
                   onChange(item.name);
                 }} key={item.name}
          ><span>{item.alias}</span></label>);
    
          return (
            <div style={{display: 'inline-block'}}>{items}</div>
          )
    }
    return (
      <PageHeaderLayout>
        <div style={{ backgroundColor: '#fff', minHeight: '60vh' }}>
          <div style={{paddingTop: 15}}>
          <div className={styles['field-block']}>
            <label>反馈状态：</label>
            <State
              datas={feedback_state}
              onChange={(val) => {
                this.changeHandler(val, 'checkId');
              }}
              value={this.state.checkId}
            />
          </div>
            <div className={styles['field-block']}>
                <label>站点：</label>
                <Select
                  defaultValue="全部"
                  style={{ width: 120 }}
                  value={this.state.stationName}
                  onSelect={(val, node) => this.changeHandler(val, 'stationId', node)}
                >
                  <Option key='全部' value=''>全部</Option>
                  {
                    stations && stations.map((item) =>
                      <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                    )
                  }
                </Select>
            </div>
            <div className={styles['field-block']} style={{marginLeft: 10}}>
              <label>区域：</label>
              <Select
                defaultValue="全部"
                style={{ width: 180 }}
                value={this.state.areaName}
                defaultValue="全部"
                onSelect={(val, node) => this.changeHandler(val, 'areaId', node)}
              >
              <Option key='全部' value=''>全部</Option>
                {
                  groups && groups.map((item) =>
                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                  )
                }
              </Select>
            </div>
            
            <div className={styles['field-block']}>
                <label>反馈人：</label>
                <Select
                  style={{width: 150}}
                  defaultValue="全部"
                  value={this.state.feedbackUserName}
                  onSelect={(val) => this.changeHandler(val, 'feedbackUserName')}
                >
                  <Option key='全部' value=''>全部</Option>
                  {
                    feedbackUsers && feedbackUsers.map((item) =>
                      <Option key={item.userid} value={item.truename} dataRef={item}>{item.truename}</Option>
                    )
                  }
                </Select>
            </div>
            <div className={styles['field-block']} style={{marginLeft: 28}}>
              <label>周期：</label>
              <Select defaultValue="全部"
                style={{ width: 120 }}
                value={this.state.unit}
                onSelect={(val) => this.changeHandler(val, 'unit')}
              >
                <Option key='全部' value=''>全部</Option>
                {options.map((item, index) =>
                  <Option
                    value={item}
                    key={index}
                  >{item}</Option>
                )}
              </Select>
            </div>
          </div>
          <div style={{margin: '15px 0'}}>
            <div className={styles['field-block']}>
              <label>起始时间：</label>
              <RangePicker
                value={startTime && endTime ? [moment(startTime, dateFormat), moment(endTime, dateFormat)] : [null, null]}
                onChange={(val) => this.changeHandler(val, 'rangeTime')}
              />
            </div>
            <div className={styles['field-block']}>
              <label>反馈时间：</label>
              <RangePicker
                value={feedbackTime1 && feedbackTime2 ? [moment(feedbackTime1, dateFormat), moment(feedbackTime2, dateFormat)] : [null, null]}
                onChange={(val) => this.changeHandler(val, 'feedbackTime')}
              />
            </div>
            <div className={styles['field-block']}><Button type='primary' onClick={this.checkHandler}>查询</Button></div>
            <div className={styles['field-block']}><Button type='primary' onClick={this.resetHandler}>重置</Button></div>
            <div className={styles['field-block']}>
              <Button type="primary">
                  <Icon type="download" />
                  {/* <a href={`${window.location.origin}/proxy/station/task/summary/export/excel?${stringify({pageno, pagesize, unit, startTime, endTime, feedbackTime1, feedbackTime2, stationId, areaId, feedbackUserName, ecode: this.props.user.ecode, token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a> */}
                  <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={taskNewData || []}
            rowKey={record => record.gid}
            pagination={pagination}
            scroll={{ x: 1800}}
            onChange={(pagination) => {this.pageChange(pagination)}}
          />
        </div>
        <div className={styles['loading']} style={{display: this.state.downLoading ? 'block' : 'none'}}>
            <Spin size="large"/>
        </div>
      </PageHeaderLayout>
    );
  }
}
