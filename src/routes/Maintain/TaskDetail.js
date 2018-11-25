import React, {PureComponent} from 'react';
import {Tabs, Table, Icon, Row, Col, Form, Tooltip } from 'antd';
import { routerRedux } from 'dva/router';
import styles from './TaskDetail.less';
import appEvent from '../../utils/eventBus';
import EcityMap from '../../components/Map/EcityMap';
import { connect } from 'dva';
import moment from 'moment';
const mapEvent = 'mapEvent';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const FormatStr = 'YYYY-MM-DD';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import TrackInfo from '../positionAndTrace/TraceInfo.js';
import Equipment from '../../components/Taskdetail/Equipment';
import Taskfeedback from '../../components/Taskdetail/Taskfeedback';
import MaterielInfo from '../../components/Taskdetail/MaterielInfo';

const cardNull = {
  TaskType: '',
  arriveCount: '',
  taskCount: '',
  feedBackCount: '',
  functionKey: '',
  planName: '',
  regionName: '',
  assigneeName: '',
  startTime: '',
  endTime: '',
  timeCost: '',
};

@connect(state => ({
  functionName: state.taskdetail.functionName,
  data: state.taskdetail.data,
  detaildata: state.taskdetail.detaildata,
  eqTotal: state.taskdetail.eqTotal,
  eqdetail: state.taskdetail.eqdetail,
  token: state.login.token,
  eqPoint: state.taskdetail.eqPoint,
}))

export default class TaskDetail extends PureComponent {
  constructor({props}) {
    super(props);
    this.state = {
      isShowMap: false,
      isShowDetail: false,
      showTraceDialog: false,
      isShowInfo: false,
      visible: false,
      pageno: 1,
      pagesize: 10,
      detaildata: [],
      filter: '',
    };
    this.map = null;
    this.onMapLoad = this.onMapLoad.bind(this);
  }

  componentDidMount() {
    if (!this.props.location.state) {
      alert('页面没有数据！');
      this.props.dispatch(routerRedux.push('/query/task-summary'));
      return;
    }
    this.props.dispatch({'type': 'taskdetail/getFunction'});
    // this.props.dispatch({"type": "taskdetail/getCardInfo"});
    this.getCardData();
  }

  getCardData = () => {
    const carddata = this.props.location.state;
    const params = {
      planId: carddata.planId,
      startTime: carddata.startTime,
      endTime: carddata.endTime,
      function: carddata.functionKey,
      pageno: this.state.pageno,
      pagesize: this.state.pagesize,
      // isFinished: this.state.filter,
    };

    this.props.dispatch({
      'type': 'taskdetail/getCardDetail',
      'payload': params,
      callback: (data) => {
        this.setState({
          detaildata: data,
        });
      },
    });
  };

  // 定位
  location = () => {
    const cardDataPoint = this.props.location.state;
    const params = {
      planId: cardDataPoint.planId,
      startTime: cardDataPoint.startTime,
      endTime: cardDataPoint.endTime,
      function: cardDataPoint.functionKey,
    };
    this.props.dispatch({
      type: 'taskdetail/getCardDetailPoint',
      payload: params,
      callback: () => {
        this.setState({
          isShowMap: !this.state.isShowMap,
        });
      },
    });
  };

  onMapLoad(arcGISMap) {
    this.map = arcGISMap;
    arcGISMap.getMapDisplay().clear();
    // this.showArea(this.props.patrolTaskDetailData.planArea.areaPolygon);
    this.showArea(this.props.location.state.areaPolygon);


    // this.showPath(this.props.patrolTaskDetailData.planArea.pathPolygon);


    // this.showPoint(this.props.patrolTaskDetailData.taskPoints);
    this.showPoint(this.props.eqPoint);
    // this.showPoint(this.props.detaildata);
    this.setState({
      showTraceDialog: true,
    });
  }

  // 展示点
  showPoint = (taskPoints) => {
    if (!taskPoints) {
      return;
    }
    const cardData = this.props.location.state ? this.props.location.state : cardNull;
    this.map.getMapDisplay().image({x: 0, y: 0});
    for (let i = 0; i < taskPoints.length; i++) {
      // let img = taskPoints[i].arriveTime != null &&  taskPoints[i].feedbackTime !=  null ? '已到位.png' : '未到位.png';
      let img = '';
      if (taskPoints[i].arriveTime && taskPoints[i].feedbackTime === null) {
        img = 'blue.png'; // 蓝色(到位未反馈)
      } else if (taskPoints[i].feedbackTime) {
        img = 'green.png'; // 绿色(已反馈)
      } else if (taskPoints[i].arriveTime === null && taskPoints[i].feedbackTime === null) {
        img = 'red.png'; // 红色(未到位未反馈)
      }
      const position = {x: taskPoints[i].longitude, y: taskPoints[i].latitude} || {};
      // let position = JSON.parse({x: taskPoints[i].latitude, y: taskPoints[i].longitude} || {});
      // let positionX = JSON.parse(taskPoints[i].latitude || {});
      // let positionY = JSON.parse(taskPoints[i].longitude || {});
      // appEvent.emit('mapEvent.mapOper.centerAt', position);
      const param = {
        id: taskPoints[i].taskId,
        layerId: 'testlayer0',
        layerIndex: 6,
        src: `/images/task-detail/${img}`,
        width: 20,
        height: 39,
        angle: 0,
        attr: taskPoints[i],
        x: position.x,
        y: position.y,
        click: (point) => {
          this.map.popup({
            x: point.geometry.x,
            y: point.geometry.y,
            info: {
              title: cardData.planName,
              content: [
                {name: '设备编号', value: point.attributes.code},
                {name: '上次维护时间', value: point.attributes.lastChangeTime || ''},
                {name: '本次反馈时间', value: point.attributes.feedbackTime || ''},
                {name: '到位情况', value: point.attributes.arriveTime === null ? '未到位' : '已到位'},
                {name: '反馈情况', value: point.attributes.feedbackTime === null ? '未反馈' : '已反馈'},
                {name: '设备地址', value: point.attributes.address},
              ],
            },
          });
        },
      };
      this.map.getMapDisplay().image(param);
    }
  };

  // 展示面
  showArea = (planArea) => {
    if (!planArea) {
      return;
    }
    const dots = [];
    const ss = JSON.parse(planArea);
    ss.map((item) => {
      return dots.push({x: item.x, y: item.y});
    });
    const paramArea = {
      id: 'paramArea1',
      layerId: 'testlayer2',
      layerIndex: 1,
      dots,
    };
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
  };

  // 展示线
  showPath = (planPath) => {
    if (!planPath) {
      return;
    }
    const lines = JSON.parse(planPath);
    for (let i = 0; i < lines.length; i++) {
      const paramLine = {id: 'paramLine' + i, layerId: 'testlayer2', layerIndex: 2, dots: lines[i]};
      appEvent.emit('mapEvent.mapDisplay.polyline', paramLine);
    }
  };

  locationHandler = () => {
    this.setState({
      isShowMap: !this.state.isShowMap,
    });

  };
  detailHandler = (record) => {
    this.setState({
      isShowDetail: !this.state.isShowDetail,
    });
    const params = {
      taskId: record.taskId,
    };
    this.props.dispatch({'type': 'taskdetail/getDetailinfo', 'payload': params});
  };
  delHandler = () => {
    this.setState({
      isShowDetail: !this.state.isShowDetail,
    });
    this.props.dispatch({
      'type': 'taskdetail/getDetailinfo',
    });
  };
  backHandler = () => {
    if (this.props.location.backpath) {
      this.props.dispatch(routerRedux.push({pathname: this.props.location.backpath}));
    } else {
      if (this.state.isShowMap) {
        this.setState({
          isShowMap: false,
          showTraceDialog: false,
        });
        return;
      }
      const path = {
        pathname: '/query/task-summary',
        filterData: this.props.location,
      };
      // this.props.dispatch(routerRedux.push(`/query/task-summary?planId=${this.props.location.state.planId}`))
      this.props.dispatch(routerRedux.push(path));
      this.setState({
        pageno: 1,
      });
    }
  };

  clickRow = (record) => {
    if (record.feedbackTime == null) {
      this.setState({
        isShowInfo: false,
        isShowDetail: true,
      });
    } else {
      this.setState({
        isShowInfo: true,
        isShowDetail: true,
      });
    }
    const params = {
      taskId: record.taskId,
      function: this.props.location.state.functionKey
    };
    this.props.dispatch({'type': 'taskdetail/getDetailinfo', 'payload': params});
  };

  pageHandler = (pagenation, filters) => {
    this.setState({
      pageno: pagenation.current,
      pagesize: pagenation.pageSize,
    });
    const carddata = this.props.location.state;
    const params = {
      planId: carddata.planId,
      startTime: carddata.startTime,
      endTime: carddata.endTime,
      function: carddata.functionKey,
      isFinished: filters && filters.arriveTime ? filters.arriveTime[0] : '',
      pageno: pagenation.current,
      pagesize: pagenation.pageSize,
    };
    this.props.dispatch({
      'type': 'taskdetail/getCardDetail',
      'payload': params,
      callback: (data) => {
        this.setState({
          detaildata: data,
        });
      },
    });
  };

  filterHandler = (val) => {
    console.log(val, "vvv");
    this.setState({
      filter: val
    }, () => {
      this.getCardData()
    })
  }

  render() {
    // if(!this.props.location.state){
    //   alert('页面没有数据！')
    //   this.props.dispatch(routerRedux.push(`/query/task-summary`))
    //     return
    //   }
    
    const cardData = this.props.location.state ? this.props.location.state : cardNull;

    const TaskType = cardData ? (cardData.taskType === 2 ? '临时' : '常规') : '';

    const functionName = (key) => {
      switch (key) {
        case 'valve':
          return '阀门养护';
        case 'regulator_a':
        case 'regulator_b':
        case 'regulator_c':
        case 'regulator_debug_qieduan':
        case 'regulator_debug_fangsan':
          return '调压器养护';
        case 'safety_check':
          return '工商户安检';
        case 'meter_read':
          return '工商户抄表';
        case 'meter_check':
          return '工商户表具检定';
        case 'negative_stub_check':
          return '阴极桩电位检测';
      }
    };
    const columns = [
      {
        title: '设备编号',
        dataIndex: 'code',
      },
      {
        title: '设备地址',
        dataIndex: 'address',
        render: (text) => {
          return (
            <span style={{color: 'skyblue', display: 'inline-block', width: 280, overflow: 'hidden', textOverflow: 'ellipsis', wordBreak: 'breakAll', whiteSpace: 'nowrap'}}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </span>)
        },
      },
      {
        title: '上次维护时间',
        dataIndex: 'lastChangeTime',
      },
      {
        title: '本次养护时间',
        dataIndex: 'feedbackTime',
      },
      functionName(cardData.functionKey) === '阀门养护' || functionName(cardData.functionKey) === '调压器养护' ?
      {
        title: '处理时长',
        dataIndex: 'timeCost',
        render: (text, record) => {
          let time = ''
          if(record.feedbackTime !== null){
            time = Math.ceil(Number(text) / 60) + '分钟'
          }
          return <span>{time}</span>
        }
      }:{},
      {
        title: '反馈人',
        dataIndex: 'assigneeName',
      },
      {
        title: '到位情况',
        dataIndex: 'arriveTime',
        filters: [
          { text: '全部', value: ' ' },
          { text: '未到位', value: '0' },
          { text: '到位未反馈', value: '1' },
          { text: '已反馈', value: '2' },
        ],
        filterMultiple: false,
        // filteredValue: filteredInfo.address || null,
        // onFilter: (value) => {
        //   return this.filterHandler(value);
        // },
        render: (text) => {
          if (text == null) {
            return <span style={{color: 'red'}}>未到位</span>;
          } else {
            return <span style={{color: 'skyblue'}}>已到位</span>;
          }
        },
      },
      {
        title: '反馈情况',
        dataIndex: 'feedbackTimes',
        // sorter: (a, b)=> a - b > 0,
        render: (text, record) => {
          if (record.feedbackTime === null) {
            return <span style={{'color': 'red'}}>未反馈</span>;
          } else {
            return <span style={{'color': '#379FFF'}}>已反馈</span>;
          }
        },
      },
    ];
    // const detaildata = this.props.detaildata || [];

    // 到位率
    const arrivalRate = (cardData.arriveCount / cardData.taskCount) * 100;
    // 反馈率
    const feedbackRate = (cardData.feedBackCount / cardData.taskCount) * 100;

    return (
      <PageHeaderLayout showBack={this.backHandler.bind(this)}>
        <div
          className={styles.task}
          style={{
          width: '100%',
          height: 'calc(100% - 120px)',
          minHeight: 'calc(100vh - 120px)',
          position: 'relative',
        }}
        >
          <div style={{display: !this.state.isShowMap?'block':'none'}}>
            <div className={styles.task_detail}>
              <Row>
                <Col span={3}>
                  <div style={{textAlign: 'left', marginTop: 45, marginLeft: 8}}>
                    <img src="/images/task-detail/person.png" style={{width: 35}} alt="#" />
                    <span style={{marginLeft: 10}}>{cardData.assigneeName}</span>
                  </div>
                </Col>
                <Col span={7}>
                  <div style={{textAlign: 'left', marginTop: 30}} className={styles.task_fl}>
                    <div>
                      <p style={{marginBottom: 10}}>
                        <b>{cardData.regionName}{' '}{functionName(cardData.functionKey)}{' '}{TaskType}</b></p>
                      <p style={{marginBottom: 10}}>{cardData.planName || []}</p>
                      <p>{moment(cardData.startTime).format(FormatStr)} 至 {moment(cardData.endTime).format(FormatStr)}</p>
                    </div>
                    <div style={{marginLeft: 20, cursor: 'pointer', marginTop: 25}}>
                      <span onClick={this.location}><img
                        src="/images/task-detail/location.png"
                        alt="#"
                        style={{
                        width: 35,
                        marginLeft: 26,
                        verticalAlign: 'center',
                      }} />
                      </span>
                    </div>
                  </div>
                </Col>
                <Col span={10} offset={4}>
                  <div className={styles.task_situationI}>
                    <div className={styles.task_situation}>
                      <Col span={10}>
                        <img src="/images/task-detail/rili.png" style={{width: 30, marginTop: 16}} alt="#" />
                      </Col>
                      <Col span={14}>
                        <div style={{textAlign: 'left', marginTop: 15}}>
                          <span style={{color: 'blue'}}><b>{cardData.arriveCount}</b></span>/<b>{cardData.taskCount}</b>
                          <br />
                          <span><b>到位率</b></span>
                        </div>
                      </Col>
                    </div>
                    <div className={styles.task_situation}>
                      <Col span={10}>
                        <img src="/images/task-detail/edit.png" style={{width: 30, marginTop: 20}} alt="#" />
                      </Col>
                      <Col span={14}>
                        <div style={{textAlign: 'left', marginTop: 15}}>
                          <span style={{color: 'blue'}}><b>{cardData.feedBackCount}</b></span>/<b>{cardData.taskCount}</b>
                          <br />
                          <span><b>反馈率</b></span>
                        </div>
                      </Col>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className={styles.task_detailShow}>
            <Row>
              <Col span={this.state.isShowDetail ? 16 : 24}>
                <div className={styles.div_inline + ' ' + styles.div1}>
                  <Table
                    columns={columns}
                    dataSource={this.state.detaildata}
                    rowKey={record => record.equipmentId}
                    onRow={(record) => ({
                      onClick: () => {this.clickRow(record)},
                    })}
                    pagination={{
                      current: this.state.pageno,
                      pageSize: this.state.pagesize,
                      total: this.props.eqTotal,
                      showTotal: (total) => {
                        return `共 ${total} 条数据`;
                      },
                      defaultPageSize: 10,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '30', '40'],
                    }}
                    style={{cursor: 'pointer'}}
                    onChange={this.pageHandler}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{display: this.state.isShowDetail ? 'block' : 'none', marginLeft: 15}}
                  className={styles.div_inline + ' ' + styles.div2}
                >
                  <div className={styles.valve_back}>
                    <Row>
                      <Col span={20}></Col>
                      <Col span={4}>
                        <b><Icon
                          type="close"
                          style={{width: 60, color: '#000'}}
                          onClick={() => {
                          this.delHandler();
                          }}
                        /></b>
                      </Col>
                    </Row>
                  </div>
                  {this.state.isShowInfo ?
                    <Tabs defaultActiveKey="1" size='small'>
                      <TabPane tab="任务反馈" key="1" >
                        <Taskfeedback token={this.props.token} detaildata={this.props.eqdetail} />
                      </TabPane>
                      <TabPane tab="设备信息" key="2">
                        <Equipment />
                      </TabPane>
                      <TabPane tab="物料信息" key="3">
                        <MaterielInfo />
                      </TabPane>
                    </Tabs>
                    :
                    <Tabs defaultActiveKey="1" >
                      <TabPane tab="任务反馈" key="1">
                        <Taskfeedback token={this.props.token} detaildata={this.props.eqdetail} />
                      </TabPane>
                      <TabPane tab="设备信息" key="2">
                        <Equipment />
                      </TabPane>
                    </Tabs>
                  }
                </div>
              </Col>
            </Row>
          </div>
          </div>
          {this.state.isShowMap ?
            <div style={{width: '100%', height: '100%',left: 0, top: 0,position:'absolute',zIndex: 98}}>
              <EcityMap mapId="taskDetailYh" onMapLoad={this.onMapLoad} />
            </div> : null}
          {this.state.showTraceDialog ?
            <TrackInfo
              persons={[{id: cardData.assigneeId, name: cardData.assigneeName, online: 1}]}
              queryDate={{startTime: cardData.startTime, endTime: cardData.endTime}}
              map={this.map}
              onClose={this.backHandler}
            />
             : null}
        </div>

      </PageHeaderLayout>
    );
  }
}
