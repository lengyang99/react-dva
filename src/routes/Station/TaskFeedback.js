import React, {PureComponent} from 'react';
import {Tabs, message, Pagination, Collapse, Button, Icon, Col, Row, Input, DatePicker  } from 'antd';
import parseValues from '../../utils/utils';
import {connect} from 'dva';
import _ from 'lodash';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SubmitForm from '../../components/SubmitForm/SubmitForm';
import {routerRedux, Router, Route, Link} from 'dva/router';
import styles from './CheckData/style.less';
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

@connect(({station, login}) => ({
  planTasks: station.planTasks,
  taskDetailData: station.taskDetailData,
  planTaskTotal: station.planTaskTotal,
  eqUnit: station.eqUnit,  //设备单元
  user: login.user,
}))
export default class TaskFeedback extends PureComponent {
  stationId = '';
  areaId = '';
  
  constructor(props) {
    super(props);
    this.state = {
      taskData: [],
      nowStartTime: moment().add(-1, 'hour').format('YYYY-MM-DD HH:00:00'),  //当前时间前一小时
      nowEndTime: moment().add(-1, 'hour').format('YYYY-MM-DD HH:59:59'),  //当前时间
      eqUnitId: '',
      pageno: 1,
      pagesize: 10,
      feedbackData: [], //反馈数据；
    }
    this.initParams();
    this.fetchData();
    // this.queryTaskDetail()
  }

  fetchData=()=> {
    const {dispatch, location} = this.props;
    console.log(this.props, 'propssssss')
    dispatch({
      type: 'station/queryCheckEq',
      payload: {
        areaId: location.params.areaId
      },
      callback: (data) => {
        const eqUnitId = data && data.length > 0 ? data[0].gid : '';
        this.setState({eqUnitId}, () => {
          this.queryTaskDetail();
        })
      }
    });
  };

  initParams = () => {
    const {location: {search}} = this.props;
    const {stationId, areaId} = parseValues(search) || {};
    this.stationId = stationId ? stationId : '';
    this.areaId = areaId ? areaId : '';
  };
  queryTaskDetail = () => {
    const {nowStartTime, nowEndTime, eqUnitId} = this.state;
    this.props.dispatch({
      type: 'station/getTaskDetail',
      payload: {
        stationId: this.props.location.params.stationId,
        areaId: this.props.location.params.areaId,
        equipmentUnitId: eqUnitId,
        startTime: nowStartTime,
        endTime: nowEndTime,
        // function: 'station_patrol'
      },
      callback: (data) => {
        this.setState({
          taskData: data || [],
        }, () => {
          let params = [];
          data && data.map((item) =>{
            item && item.tasksInfo.map((item1, index1) => {
              const defaultFeedback = [...this.state.feedbackData];
              if(!_.some(defaultFeedback, {'taskId': item1.taskInfo.taskId})){
                if(item1.feedbackInfo.items[0].type === 'DATE' && item1.feedbackInfo.items[0].value === ''){
                  params.push({
                    properties: {[item1.feedbackInfo.alias]: moment().format('YYYY-MM-DD')},
                    taskId: item1.taskInfo.taskId,
                  })
                }else if(item1.feedbackInfo.items[0].type === 'DATETIME' && item1.feedbackInfo.items[0].value === ''){
                  params.push({
                    properties: {[item1.feedbackInfo.alias]: moment().format('YYYY-MM-DD HH:mm:ss')},
                    taskId: item1.taskInfo.taskId,
                  })
                }
              }
            })
          })
          this.setState({feedbackData: params})
        });
      }
    });
  };

  showBack = () => {
    this.setState({
      pageno: 1,
      pagesize: 10
    })
    const path = {
      pathname: "/station/task",
      state: this.props.location.state,
    };
    this.props.dispatch(routerRedux.push(path));
    // this.props.history.push(`/station/task?planId=${this.planId}`);
  };

  reloadFile = () => {
    this.pagesize = 10
    this.pageno = 1
    this.fetchData();

  };

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      pageno: 1,
      pagesize: pageSize,
    })
  };

  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
    })
  };

  tabChangeHandle = (key) => {
    this.setState({
      nowStartTime: moment().add(-1, 'hour').format('YYYY-MM-DD HH:00:00'),
      nowEndTime: moment().add(-1, 'hour').format('YYYY-MM-DD HH:59:59'),
      eqUnitId: key,
      pageno: 1,
      pagesize: 10
    }, () => {
      this.queryTaskDetail()
    })
  };
  //上一个小时任务
  prevHour = () => {
    this.setState({
      nowStartTime: moment(this.state.nowStartTime).add(-1, 'hour').format('YYYY-MM-DD HH:00:00'),
      nowEndTime: moment(this.state.nowEndTime).add(-1, 'hour').format('YYYY-MM-DD HH:59:59')
    }, () => {
      this.queryTaskDetail()
    })
  };
  //下一个小时任务
  nextHour = () => {
    if(moment().format('YYYY-MM-DD HH:00:00') > moment(this.state.nowStartTime).format('YYYY-MM-DD HH:00:00')){
      this.setState({
        nowStartTime: moment(this.state.nowStartTime).add(1, 'hour').format('YYYY-MM-DD HH:00:00'),
        nowEndTime: moment(this.state.nowEndTime).add(1, 'hour').format('YYYY-MM-DD HH:59:59')
      }, () => {
        this.queryTaskDetail()
      })
    }else{
      message.warn('下一个任务反馈时间没到，不能反馈！');
      return
    }
  };
  feedbackHandler = (e, item, fileName) => {
    let val = ''
    if(fileName === 'DATE'){
      if(e === null){
        val = null
      }else{
        val = e.format('YYYY-MM-DD')
      }
    }else if(fileName === 'DATETIME'){
      if(e === null){
        val = null
      }else{
        val =e.format('YYYY-MM-DD HH:mm:ss')
      }
    }else{
      val = e.target.value;
    }
    console.log(val, e, 'usergggggg')
    const params = [...this.state.feedbackData];
    if(_.some(params, {'taskId': item.taskInfo.taskId})){
      params.map((item1, index) => {
        if(item1.taskId === item.taskInfo.taskId){
          return params[index].properties[item.feedbackInfo.alias] = val
        }
      })
    }else{
      params.push({
        properties: {[item.feedbackInfo.alias]: val},
        taskId: item.taskInfo.taskId,
      })
    }
    this.setState({ feedbackData: params})
    console.log(val, item,params, 'vallllll')
  }
  handleSubmit = () => {
    const {feedbackData} = this.state;
    this.props.dispatch({
      type: 'station/feedbackSubmit',
      payload: {
        userName: this.props.user.trueName,
        userId: this.props.user.gid,
        tasks: JSON.stringify(feedbackData),
      },
      callback: ({success, msg}) => {
        if (success) {
          message.success('创建成功！');
          this.showBack();
        } else {
          message.warn(msg);
        }
      },
    });
  }

  render() {
    const {planTasks, taskDetailData, planTaskTotal, eqUnit} = this.props;
    const { taskData, pageno, pagesize } = this.state;
    console.log(taskData, 'taskdata')

    const panes = eqUnit && eqUnit.map(item => (
      <TabPane tab={item.name} key={item.gid}>
        {(taskData && taskData.length > 0) ?
          taskData.map((item, index) => {
            return (<div style={{ marginBottom: 50}} key={index}>
                      <Row style={{ marginBottom: 15}}>
                        <Col span={8} style={{borderLeft: '3px solid #1890ff', paddingLeft: 10}}>
                          <span >{item.checkTargetName}: </span>
                        </Col>
                        <Col span={2} style={{textAlign: 'center'}}>
                          <span>单位</span>
                        </Col>
                        <Col span={4}>
                          <span>开始时间</span>
                        </Col>
                        <Col span={4}>
                          <span>反馈时间</span>
                        </Col>
                        <Col span={3}>
                          <span>反馈人</span>
                        </Col>
                        <Col span={3}>
                          <span>周期</span>
                        </Col>
                      </Row>
                      {
                        item.tasksInfo && item.tasksInfo.length > 0 ?
                        item.tasksInfo.slice((pageno-1)*pagesize, pageno*pagesize).map((item1, index1) => 
                          <Row style={{ marginBottom: 6}}>
                            <Col span={3}>
                              <span >{item1.feedbackInfo.alias} </span>
                            </Col>
                            <Col span={5}>
                              {
                                item1.feedbackInfo.items.length > 0 && item1.feedbackInfo.items[0].value ? 
                                  <span>{item1.feedbackInfo.items[0].value}</span>
                                :
                                  (item1.feedbackInfo.items[0].type === 'DATE' ?
                                  <DatePicker
                                    format='YYYY-MM-DD'
                                    defaultValue={moment()}
                                    onChange={(e) => this.feedbackHandler(e, item1, 'DATE')} />
                                  :
                                  (item1.feedbackInfo.items[0].type === 'DATETIME' ?
                                  <DatePicker
                                    format='YYYY-MM-DD HH:mm:ss'
                                    defaultValue={moment()}
                                    onChange={(e) => this.feedbackHandler(e, item1, 'DATETIME')} />
                                  :
                                  <Input placeholder='点击输入' onChange={(e) => this.feedbackHandler(e, item1)}/>))
                              }
                            </Col>
                            <Col span={2} style={{textAlign: 'center'}}>
                              <span>{item1.taskInfo.unit}</span>
                            </Col>
                            <Col span={4}>
                              <span>{item1.taskInfo.startTime}</span>
                            </Col>
                            <Col span={4}>
                              <span>{item1.taskInfo.endTime}</span>
                            </Col>
                            <Col span={3}>
                              <span>{item1.taskInfo.feedbackUserName}</span>
                            </Col>
                            <Col span={3}>
                              <span>{item1.taskInfo.cycleName}</span>
                            </Col>
                          </Row>
                        )
                        : '暂无数据'
                      }
                      <Row type="flex" justify='end'>
                        <Col>
                          <Pagination
                            showSizeChanger
                            style={{marginTop: 15}}
                            current={pageno}
                            pageSize={pagesize}
                            onShowSizeChange={this.onShowSizeChange}
                            onChange={this.pageChange}
                            defaultCurrent={1}
                            total={item.tasksInfo.length}
                            showTotal={(total, range) => {
                                return (<div>
                                  共 {total} 条数据 第{pageno}/{Math.ceil(total / pagesize)}页
                                </div>);
                              }
                            } 
                          />
                        </Col>
                      </Row>
                  </div>)
          })
          : <div style={{textAlign: 'center', fontSize: 20}}><b>没有反馈内容</b></div>
        }
      </TabPane>
    ));
    return (
      <PageHeaderLayout showBack={this.showBack}>
        <div>
          <div className={styles['field-block']} style={{fontSize: 20, margin: '15px 0 15px 15px'}}>
              <span style={{cursor: 'pointer'}} onClick={() => this.prevHour()}><Icon type="left-circle-o" style={{color: '#1890ff'}}/>上一个任务</span>
              <span style={{margin: '0 25px'}}>{this.state.nowStartTime}</span> 
              <span style={{cursor: 'pointer'}} onClick={() => this.nextHour()}>下一个任务<Icon type="right-circle-o" style={{color: '#1890ff'}}/></span> 
          </div>
          <div style={{ backgroundColor: "#fff" }}>
            <Tabs
              defaultActiveKey={this.state.indexKey}
              onChange={this.tabChangeHandle}
            >
              {panes}
            </Tabs>
          </div>
          {taskData && taskData.length > 0 ?
            <div style={{width: '100%', textAlign: 'center',paddingBottom: 15}}>
              <Button type="button" onClick={this.showBack} style={{marginRight: 20}}>
              返回
              </Button>
              <Button type="primary" onClick={this.handleSubmit}>
              提交
              </Button>
            </div>: ''
          }
        </div>  
      </PageHeaderLayout>
    )
  }
}