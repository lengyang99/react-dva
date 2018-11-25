import React from 'react';
import { Table, Button, Icon, Row, Col, Tabs } from 'antd';
import { routerRedux, Link } from 'dva/router';
import { connect } from 'dva';
import DetailPanel from '../commonTool/DetailPanel/DetailPanel';
import utils from '../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import EcityMap from '../../components/Map/EcityMap';
import TrackInfo from '../positionAndTrace/TraceInfo.js';
import PatrolTaskDeviceDetails from './PatrolTaskDeviceDetails.js';
import PatrolTaskFeedback from './PatrolTaskFeedback.js';
import TraceLegend from '../positionAndTrace/TraceLegend';
import _ from 'lodash';

const hideFeekBack = true;
const TabPane = Tabs.TabPane;
let starttime;
let starttime2;
@connect(state => ({
  patrolTaskDetailData: state.patrolPlanList.patrolTaskDetailData || {},
  patrolDeviceFeedbackInfo: (state.patrolTaskList && state.patrolTaskList.patrolDeviceFeedbackInfo) || {},
  patrolDeviceDetailsInfo: (state.patrolTaskList && state.patrolTaskList.patrolDeviceDetailsInfo) || {},
  patrolLayerInfo: state.patrolTaskList.patrolLayerInfo,
  patrolDetailAllData: state.patrolPlanList.patrolDetailAllData,
  user: state.login.user,
}))

export default class DialogTable extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    this.patrolLayerInfo = this.props.patrolLayerInfo;
    if (this.tool.data) {
      localStorage.setItem('patrolPlanListTD', JSON.stringify(this.tool));
      localStorage.setItem('patrolLayerInfo', JSON.stringify(this.props.patrolLayerInfo));
    } else {
      let dataString = localStorage.getItem('patrolPlanListTD');
      let patrolString = localStorage.getItem('patrolLayerInfo');
      this.tool = JSON.parse(dataString);
      this.patrolLayerInfo = JSON.parse(patrolString);
    }

    this.currentPointTimer = null;
    this.state = {
      isShowMap: false,
      showTraceDialog: false,
      tableHeight: window.innerHeight - 340,
      isShowDeviceInfo: false,

      //table数据
      dataSource: [],
      patroltotal: 0,
      currentTab: {},
      tabList: [],
      pageno: 1,
      pagesize: 10,
    };
    this.map = null;


    this.onMapLoad = this.onMapLoad.bind(this);

    this.taskInfo = {
      dataSourcePoint: [],
      dataSourceDevice: [],
      dataSourcePipeLine: [],
      dataSourceKeyLine: [],
    };
    this.tmpCounter = 1;
    this.tmpCounter2 = 1;
    this.pipeDataCount = 0;
    this.drawPipeCount = 0;
  }

  componentDidMount() {
    this.getSearchValue();
    window.addEventListener('resize', this.onWindowResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    if (this.map) {
      this.map.getMapDisplay().removeLayer('testlayer0');
      this.map.getMapDisplay().removeLayer('testlayer2');
      this.map.getMapDisplay().removeLayer('taskOverPipeLine');
      this.map.getMapDisplay().removeLayer('taskPipeLine');
    }
    clearTimeout(starttime);
    clearTimeout(starttime2);
  }

  onWindowResize = () => {
    this.setState({
      tableHeight: window.innerHeight - 370
    });
  };

  // 获取任务详情数据
  getSearchValue = () => {
    //查询任务基本信息
    this.props.dispatch({
      type: 'patrolPlanList/getPatrolTaskDetailData',
      payload: {
        gid: this.tool.data.gid,
        isShowDetail: 0,
        isShowArrive: 1,
      },
    });
    let tabList = []; //tab数据
    if (this.tool.data.layerids) {
      this.tool.data.layerids.split(',').map((ids) => {
        this.patrolLayerInfo.map((layers) => {
          if (ids === `${layers.gid}`) {
            if (!_.some(tabList, ['name', layers.type ])) {
              tabList.push({name: layers.type, dno: [layers.layername], layer: [{name: layers.name, id: ids}]});
            }else{
              const tablayers = [];
              let layersArr = [];
              let tablayersAll = [];
              tablayers.push(layers.layername);
              layersArr.push({name: layers.name, id: ids});
              tabList.map((item, index) => {
                if(item.name === layers.type){
                  tablayersAll = tablayers.concat(item.dno);
                  layersArr = layersArr.concat(item.layer);
                  const tabs = {name: layers.type, dno: tablayersAll, layer: layersArr};
                  tabList.splice(index, 1, tabs);
                }
              })
            }
          }
        });
      });
    }
    this.setState({
      currentTab: {name: tabList[0].name, dno: tabList[0].dno, layer: tabList[0].layer},
      tabList,
    })
    console.log(tabList, 'tabList')
    this.queryDetailData(tabList, '')
  };

  //查询任务管段、设备数据
  queryDetailData = (tabList, layerid, isArrive, isFeedback) => {
    if(tabList.length > 0){
      this.props.dispatch({
        type: 'patrolPlanList/queryPatrolDetailData',
        payload: {
          taskid: this.tool.data.gid,
          layerid,
          isArrive,
          isFeedback,
          layername: (tabList[0].dno).join(","), //dno
          pagesize: this.state.pagesize,
          pageno: this.state.pageno,
        },
        callback: (res) => {
          console.log(res)
          this.setState({
            dataSource: res.data,
            patroltotal: res.total
          })
        }
      });
    }
  }

  closeMap = () => {
    this.setState({
      isShowMap: false,
    });
  };

  // 定位
  location = () => {
    //查询任务全部信息
    this.props.dispatch({
      type: 'patrolPlanList/getPatrolTaskDetailAllData',
      payload: {
        gid: this.tool.data.gid,
      },
      callback: () => {
        this.setState({
          isShowMap: true,
        });
      }
    });
  };

  onMapLoad(arcGISMap) {
    console.log('this.taskInfo', this.taskInfo);
    this.map = arcGISMap;
    arcGISMap.getMapDisplay().clear();
    // 绘制关键点
    let mainPoinst = this.taskInfo.dataSourcePoint;
    mainPoinst.map((tp) => {
      tp.isArrivePic = 'isArrive.png';
      tp.noArrivePic = 'overTime.png';
    });
    // 绘制调压设备dno=2
    let pressureDevice = this.taskInfo.dataSourceDevice.filter((item) => { return item.layername === '2' });
    pressureDevice.map((tp) => {
      tp.noArrivePic = 'pressureDevice_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'pressureDevice_isArrive.png';
        tp.isFeedbackPic = 'pressureDevice_isFeedback.png';
      } else {
        tp.isArrivePic = 'pressureDevice_isArrive.png';
      }
    });
    // 绘制庭院点dno=14
    let housePoint = this.taskInfo.dataSourceDevice.filter((item) => { return item.layername === '14' });
    housePoint.map((tp) => {
      tp.noArrivePic = 'housePoint_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'housePoint_isArrive.png';
        tp.isFeedbackPic = 'housePoint_isFeedback.png';
      } else {
        tp.isArrivePic = 'housePoint_isArrive.png';
      }
    });
    // 绘制阀门dno=3
    //阀门
    let valve = this.taskInfo.dataSourceDevice.filter((item) => { return item.layername === '3' && !item.name.includes('高') && !item.name.includes('中') });
    valve.map((tp) => {
      tp.noArrivePic = 'valve_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'valve_isArrive.png';
        tp.isFeedbackPic = 'valve_isFeedback.png';
      } else {
        tp.isArrivePic = 'valve_isArrive.png';
      }
    });
    //中阀门
    let valve_m = this.taskInfo.dataSourceDevice.filter((item) => { return item.layername === '3' && item.name.includes('中') });
    valve_m.map((tp) => {
      tp.noArrivePic = 'm_valve_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'm_valve_isArrive.png';
        tp.isFeedbackPic = 'm_valve_isFeedback.png';
      } else {
        tp.isArrivePic = 'm_valve_isArrive.png';
      }
    });
    //高阀门
    let valve_h = this.taskInfo.dataSourceDevice.filter((item) => { return item.layername === '3' && item.name.includes('高') });
    valve_h.map((tp) => {
      tp.noArrivePic = 'h_valve_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'h_valve_isArrive.png';
        tp.isFeedbackPic = 'h_valve_isFeedback.png';
      } else {
        tp.isArrivePic = 'h_valve_isArrive.png';
      }
    });
    // 设备里的其他类型
    let otherDevice = this.taskInfo.dataSourceDevice.filter((item) => {
      return item.layername !== '2' && item.layername !== '3' && item.layername !== '14';
    });
    otherDevice.map((tp) => {
      tp.noArrivePic = 'pressureDevice_overTime.png';
      if (tp.type) {
        tp.isArrivePic = 'pressureDevice_isArrive.png';
        tp.isFeedbackPic = 'pressureDevice_isFeedback.png';
      } else {
        tp.isArrivePic = 'pressureDevice_isArrive.png';
      }
    });
    this.showArea(this.props.patrolDetailAllData.planArea.areaPolygon);
    this.showPoints(mainPoinst);
    this.showPoints(pressureDevice);
    this.showPoints(housePoint);
    this.showPoints(valve);
    // ******图标需要更新******
    this.showPoints(valve_m);
    // ******图标需要更新******
    this.showPoints(valve_h);
    // ******图标需要更新******
    this.showPoints(otherDevice);
    // 绘制管线
    this.pipeDataCount = this.taskInfo.dataSourcePipeLine.length;
    this.drawPipeCount = Math.floor(this.pipeDataCount / 100) + (this.pipeDataCount % 100 === 0 ? 0 : 1);
    this.showPipeLine(this.taskInfo.dataSourcePipeLine.slice(0, 100), 0);
    // 绘制关键线
    this.keyLineDataCount = this.taskInfo.dataSourceKeyLine.length;
    this.drawKeyLineCount = Math.floor(this.keyLineDataCount / 100) + (this.keyLineDataCount % 100 === 0 ? 0 : 1);
    this.showKeyLine(this.taskInfo.dataSourceKeyLine.slice(0, 100), 0);
    this.setState({
      showTraceDialog: true
    });
  }

  // 展示点
  showPoints = (taskPoints = []) => {
    this.map.getMapDisplay().image({ x: 0, y: 0 });
    for (let i = 0; i < taskPoints.length; i++) {
      this.showPoint(taskPoints[i]);
    }
  };

  showPoint = (taskPoint) => {
    let img = '';
    if (taskPoint.isFeedback === 1) {
      img = taskPoint.isFeedbackPic;
    } else {
      if (taskPoint.isArrive === 1) {
        img = taskPoint.isArrivePic;
      } else {
        img = taskPoint.noArrivePic;
      }
    }
    console.log('img', img);
    let position = JSON.parse(taskPoint.geom || {});
    const param = {
      id: taskPoint.gid,
      layerId: 'testlayer0',
      src: './images/task-detail/' + img,
      width: 20,
      height: 28,
      angle: 0,
      attr: taskPoint,
      x: position.x,
      y: position.y,
      layerIndex: 60,
      click: (point) => {
        console.log('point', point);
        this.map.popup({
          x: point.geometry.x,
          y: point.geometry.y,
          info: {
            title: point.attributes.name,
            content: [
              // { name: '#', value: point.attributes.gid },
              { name: '巡视人', value: point.attributes.arriveMan === '' ? '无' : point.attributes.arriveMan },
              { name: '到位时间', value: point.attributes.arriveTime === null ? '无' : point.attributes.arriveTime },
              { name: '名称', value: point.attributes.name },
              { name: '地址', value: point.attributes.position },
              { name: '图层名称', value: point.attributes.layername },
              { name: '图层类型', value: point.attributes.layertype },
              { name: 'x值', value: point.geometry.x },
              { name: 'y值', value: point.geometry.y },
              { name: 'Gis编号', value: point.attributes.taskid },
              { name: '编号', value: point.attributes.fieldvalue },
              { name: '状态', value: point.attributes.isFeedback === 1 ? '已反馈' : (point.attributes.isArrive === 1 ? '已到位' : '未到位') },
            ],
          },
        });
      },
    };
    this.map.getMapDisplay().image(param);
  };

  // 展示面
  showArea = (planArea) => {
    if (!planArea) {
      return;
    }
    const paramArea = {
      id: 'paramArea1',
      layerId: 'testlayer2',
      layerIndex: 10,
      dots: JSON.parse(planArea),
    };
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
  };

  // 展示线
  showPath = (planPath) => {
    if (!planPath) {
      return;
    }
    let lines = JSON.parse(planPath);
    for (let i = 0; i < lines.length; i++) {
      const paramLine = { id: 'paramLine' + i, layerId: 'testlayer2', layerIndex: 40, dots: lines[i] };
      this.map.getMapDisplay().polyline(paramLine);
    }
  };

  // 展示关键线
  showKeyLine = (pipeLine, index, stop) => {
    if (stop) { clearInterval(starttime2) }
    if (!pipeLine) {
      return;
    }
    for (let j = 0; j < pipeLine.length; j++) {
      // 已覆盖关键线
      let overPipeList = pipeLine[j].coverLineList;
      for (let i = 0; i < overPipeList.length; i++) {
        let overPipe = overPipeList[i].coverLine;
        if (overPipe) {
          let overPipes = JSON.parse(overPipe);
          for (let k = 0; k < overPipes.length; k++) {
            const op = overPipes[k];
            const oparamLine = {
              id: 'taskOverKeyLine' + j + i + k + index,
              layerId: 'taskOverKeyLine',
              layerIndex: 3,
              dots: op.map((coor) => ({ x: coor[0], y: coor[1] })),
              color: [5, 191, 101],
              width: 4,
            };
            this.map.getMapDisplay().polyline(oparamLine);
          }
        }
      }
      // 巡视关键线
      let pipe = pipeLine[j].geom;
      let pipes = JSON.parse(pipe);
      for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        const paramLine = {
          id: 'taskKeyLine' + j + i + index,
          layerId: 'taskKeyLine',
          dots: p.map((coor) => ({ x: coor[0], y: coor[1] })),
          color: [246, 123, 14],
          width: 4,
        };
        this.map.getMapDisplay().polyline(paramLine);
      }
    }
    const keyLineDataCount = this.keyLineDataCount;
    const drawKeyLineCount = this.drawKeyLineCount;
    if (this.tmpCounter2 < drawKeyLineCount) {
      starttime2 = setTimeout(() => {
        console.log(`tmpCounter2:${this.tmpCounter2}`);
        let end = 100 * (this.tmpCounter2 + 1);
        if (this.tmpCounter2 === drawKeyLineCount - 1) {
          end = 100 * this.tmpCounter2 + keyLineDataCount % 100;
        }
        console.log(`***定时绘制关键线，总次数${keyLineDataCount}，当前是第${this.tmpCounter2}次***`);
        console.log(`***绘制的关键线数据：***`);
        console.log(this.taskInfo.dataSourceKeyLine.slice(100 * this.tmpCounter2, end));
        this.showKeyLine(this.taskInfo.dataSourceKeyLine.slice(100 * this.tmpCounter2, end), this.tmpCounter2++);
      }, 2000);
    }
  }

  // 展示任务管线
  showPipeLine = (pipeLine, index, stop) => {
    if (stop) { clearInterval(starttime) }
    if (!pipeLine) {
      return;
    }
    for (let j = 0; j < pipeLine.length; j++) {
      // 已覆盖管线
      let overPipeList = pipeLine[j].coverLineList;
      for (let i = 0; i < overPipeList.length; i++) {
        let overPipe = overPipeList[i].coverLine;
        if (overPipe) {
          let overPipes = JSON.parse(overPipe);
          for (let k = 0; k < overPipes.length; k++) {
            const op = overPipes[k];
            const oparamLine = {
              id: 'taskOverPipeLine' + j + i + k + index,
              layerId: 'taskOverPipeLine',
              layerIndex: 2,
              dots: op.map((coor) => ({ x: coor[0], y: coor[1] })),
              color: [0, 255, 0],
              width: 4,
            };
            this.map.getMapDisplay().polyline(oparamLine);
          }
        }
      }
      // 巡视管线
      let pipe = pipeLine[j].geom;
      let pipes = JSON.parse(pipe);
      for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        const paramLine = {
          id: 'taskPipeLine' + j + i + index,
          layerId: 'taskPipeLine',
          dots: p.map((coor) => ({ x: coor[0], y: coor[1] })),
          width: 4,
        };
        this.map.getMapDisplay().polyline(paramLine);
      }
    }
    const pipeDataCount = this.pipeDataCount;
    const drawPipeCount = this.drawPipeCount;
    if (this.tmpCounter < drawPipeCount) {
      starttime = setTimeout(() => {
        console.log(`tmpCounter:${this.tmpCounter}`);
        let end = 100 * (this.tmpCounter + 1);
        if (this.tmpCounter === drawPipeCount - 1) {
          end = 100 * this.tmpCounter + pipeDataCount % 100;
        }
        console.log(`***定时绘制管线，总次数${drawPipeCount}，当前是第${this.tmpCounter}次***`);
        console.log(`***绘制的管线数据：***`);
        console.log(this.taskInfo.dataSourcePipeLine.slice(100 * this.tmpCounter, end));
        this.showPipeLine(this.taskInfo.dataSourcePipeLine.slice(100 * this.tmpCounter, end), this.tmpCounter++);
      }, 1000);
    }
  }

  // 勾选展示任务管线
  showCheckPipeLine = (pipeLine, index, stop) => {
    if (!pipeLine) {
      return;
    }
    if (stop) { clearInterval(starttime) }
    for (let j = 0; j < pipeLine.length; j++) {
      // 已覆盖管线
      let overPipeList = pipeLine[j].coverLineList;
      for (let i = 0; i < overPipeList.length; i++) {
        let overPipe = overPipeList[i].coverLine;
        if (overPipe) {
          let overPipes = JSON.parse(overPipe);
          for (let k = 0; k < overPipes.length; k++) {
            const op = overPipes[k];
            const oparamLine = {
              id: 'taskOverPipeLine' + j + i + k + index,
              layerId: 'taskOverPipeLine',
              layerIndex: 2,
              dots: op.map((coor) => ({ x: coor[0], y: coor[1] })),
              color: [255, 255, 255],
              width: 4,
            };
            this.map.getMapDisplay().polyline(oparamLine);
          }
        }
      }
      // 巡视管线
      let pipe = pipeLine[j].geom;
      let pipes = JSON.parse(pipe);
      for (let i = 0; i < pipes.length; i++) {
        const p = pipes[i];
        const paramLine = {
          id: 'taskPipeLine' + j + i + index,
          layerId: 'taskPipeLine',
          dots: p.map((coor) => ({ x: coor[0], y: coor[1] })),
          width: 4,
        };
        this.map.getMapDisplay().polyline(paramLine);
      }
    }
    const pipeDataCount = this.pipeDataCount;
    const drawPipeCount = this.drawPipeCount;
    if (this.tmpCounter < drawPipeCount) {
      starttime = setTimeout(() => {
        console.log(`tmpCounter:${this.tmpCounter}`);
        let end = 100 * (this.tmpCounter + 1);
        if (this.tmpCounter === drawPipeCount - 1) {
          end = 100 * this.tmpCounter + pipeDataCount % 100;
        }
        console.log(`***定时绘制管线，总次数${drawPipeCount}，当前是第${this.tmpCounter}次***`);
        console.log(`***绘制的管线数据：***`);
        console.log(this.taskInfo.dataSourcePipeLine.slice(100 * this.tmpCounter, end));
        this.showPipeLine(this.taskInfo.dataSourcePipeLine.slice(100 * this.tmpCounter, end), this.tmpCounter++);
      }, 1000);
    }
  }

  // 单击行
  clickTest = (record) => {
    // let position = JSON.parse(record.position);
    // this.props.appEvent.emit('mapEvent.mapOper.popup', {
    //     x: position.x,
    //     y: position.y,
    //     info: {
    //         title: record.layername,
    //         content: [
    //             {name: '#', value: record.gid},
    //             {name: '图层名称', value: record.layername},
    //             {name: 'Gis编号', value: record.taskid},
    //             {name: '状态', value: record.isArrive === 1 ? '已到位' : '未到位'},
    //         ]
    //     },
    // });
  };

  goBack = () => {
    if (!this.tool.params) {
      this.props.history.goBack();
    } else {
      if (this.state.isShowMap) {
        this.setState({
          isShowMap: false,
          showTraceDialog: false
        });
        return;
      }
      let path = {}
      if(this.tool.isOverview){
        path.pathname = '/query/keyPoint-inspection';
      }else{
        path.pathname = '/query/patrol-task-list';
        path.params = this.tool.params;
        path.isExpand = this.tool.isExpand;
      }
      this.props.dispatch(routerRedux.push(path));
    }
  };

  // 显示设备详情
  showDeviceDetails = (record) => {
    console.log(record);
    this.setState({
      isShowDeviceInfo: true,
    });
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolDeviceDetailsInfo',
      params: {
        ecode: this.props.user.ecode,
        layername: record.layername,
        eqptcode: record.fieldvalue,
      },
    });
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolDeviceFeedbackInfo',
      feedbackid: record.feedbackId,
      groupid: record.formid,
    });
  }

  // 隐藏设备详情
  isHideDeviceInfo = () => {
    this.setState({
      isShowDeviceInfo: false,
    });
  }

  //切换Tab
  onChangeTabs = (key) => {
    console.log(key, 'key')
    const {tabList} = this.state;
    const currentTab = tabList.filter(item => item.name === key);
    this.setState({
      dataSource: [],
      currentTab: currentTab[0],
      pageno: 1,
      pagesize: 10,
    }, () => {
      this.queryDetailData(currentTab, '')
    })
  };

  onChangePage = (current, pageSize, filters) => {
    console.log(current, 'current')
    this.setState({
      pageno: pageSize ? 1 : current,
      pagesize: pageSize ? pageSize : this.state.pagesize,
    }, () => {
      this.queryDetailData([this.state.currentTab], '')
    })
  }

  //table数据筛选
  handleTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter, 'pagination, filters, sorter')
    this.setState({
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    }, () => {
      const filter = filters && filters.name && filters.name.length > 0 ? filters.name[0] : ''
      const isArrive = filters && filters.isArrive && filters.isArrive.length > 0 ? filters.isArrive[0] : ''
      const isFeedback = filters && filters.isFeedback && filters.isFeedback.length > 0 ? filters.isFeedback[0] : ''
      this.queryDetailData([this.state.currentTab], filter, isArrive, isFeedback)
    })
  }

  render() {
    //把开始时间格式化为07：00：00
    // this.props.patrolTaskDetailData.startTime=this.props.patrolTaskDetailData.startTime.substr(0,11)+'07:00:00';
    // console.log('this.props.patrolTaskDetailData', this.props.patrolTaskDetailData);
    let starttime='';
    starttime=this.props.patrolTaskDetailData.startTime;
    starttime= starttime ? starttime.substring(0,11)+'07:00:00' : starttime;
    const {dataSource, currentTab, tabList, patroltotal, pagesize, pageno} = this.state;
    const that = this;
    // 防止多次刷新累积重复数据
    this.taskInfo = {
      dataSourcePoint: [],
      dataSourceDevice: [],
      dataSourcePipeLine: [],
      dataSourceKeyLine: [],
    };
    // 关键点
    const columns = [
      {
        title: '设备类型',
        dataIndex: 'name',
        key: 'name',
        width: '65'
      },
      {
        title: '设备编号',
        dataIndex: 'gid',
        key: 'gid',
        width: '80'
      },
      {
        title: '到位情况',
        dataIndex: 'isArrive',
        key: 'isArrive',
        width: '65',
        render(text) {
          return text === 1 ? <span style={{ 'color': '#379FFF' }}>已完成</span>
            : <span style={{ 'color': 'red' }}>未完成</span>;
        }
      },
      {
        title: '反馈情况',
        dataIndex: 'isFeedback',
        key: 'isFeedback',
        width: '65',
        sorter(a, b) {
          return a.isFeedback - b.isFeedback;
        },
        render(text) {
          return text === 1 ? '已反馈' : '--';
        }
      }
    ];

    const columnsHideFeedBack = [
      {
        title: '设备类型',
        dataIndex: 'name',
        key: 'name',
        width: '65'
      },
      {
        title: '到位情况',
        dataIndex: 'isArrive',
        key: 'isArrive',
        width: '65',
        render(text) {
          return text === 1 ?
            <span style={{ textAlign: 'center', 'color': '#379FFF' }}>已到位</span>
            : <span style={{ textAlign: 'center', 'color': 'red' }}>未到位</span>
        }
      },
      {
        title: '到位人',
        dataIndex: 'arriveMan',
        key: 'arriveMan',
        width: '65',
      },
      {
        title: '到位时间',
        dataIndex: 'arriveTime',
        key: 'arriveTime',
        width: '65',
      },
      {
        title: '精度(米)',
        dataIndex: 'accuracy',
        key: 'accuracy',
        width: '65',
      },
    ];

    // 管线、设备
    const pipeType = [];
    if(currentTab.layer && currentTab.layer.length > 1){
      currentTab.layer.map(item => {
        pipeType.push({text: item.name, value: item.id});
      })
    }

    const deviceColumns = [
      {
        title: '设备编码',
        dataIndex: 'fieldvalue',
        key: 'fieldvalue',
        width: '65',
      },
      {
        title: <span style={{ display: 'inline-block', height: '50px', lineHeight: '50px' }}>设备位置</span>,
        dataIndex: 'position',
        key: 'position',
        width: '250',
      },
      {
        title: <span style={{ display: 'inline-block', height: '50px', lineHeight: '50px' }}>设备类型</span>,
        dataIndex: 'name',
        key: 'name',
        width: '65',
        filters: pipeType,
        filterMultiple: false,
        // onFilter: (value, record) => {return this.queryDetailData([currentTab], value)},
      },
      {
        title: '到位人',
        dataIndex: 'arriveMan',
        key: 'arriveMan',
        width: '65',
      },
      {
        title: '到位时间',
        dataIndex: 'arriveTime',
        key: 'arriveTime',
        width: '65',
      },
      {
        title: '精度(米)',
        dataIndex: 'accuracy',
        key: 'accuracy',
        width: '65',
      },
      {
        title: '反馈人',
        dataIndex: 'feedbackMan',
        key: 'feedbackMan',
        width: '65',
      },
      {
        title: '反馈时间',
        dataIndex: 'feedbackTime',
        key: 'feedbackTime',
        width: '65',
      },
      {
        title: '到位情况',
        dataIndex: 'isArrive',
        key: 'isArrive',
        width: '65',
        render: (text) => {
          return text === 1 ?
            <span style={{ textAlign: 'center', 'color': '#379FFF' }}>已到位</span> :
            <span style={{ textAlign: 'center', 'color': 'red' }}>未到位</span>;
        },
        filters: [{ text: '已到位', value: '1' }, { text: '未到位', value: '0' }],
        filterMultiple: false,
      },
      {
        title: '反馈情况',
        dataIndex: 'isFeedback',
        key: 'isFeedback',
        width: '65',
        filters: [{ text: '已反馈', value: '1' }, { text: '未反馈', value: '0' }],
        filterMultiple: false,
        render: (text) => {
          return text === 1 ? '已反馈' : '--';
        },
      }
    ];

    const pipeColumns = [
      {
        title: '管段编号',
        dataIndex: 'gid',
        key: 'gid',
        width: '65',
      },
      {
        title: '管段类型',
        dataIndex: 'name',
        key: 'name',
        width: '65',
        filters: pipeType,
        filterMultiple: false,
        // onFilter: (value, record) => {return this.queryDetailData([currentTab], value)},
      },
      {
        title: '管段总长(米)',
        dataIndex: 'length',
        key: 'length',
        width: '65',
      },
      {
        title: '覆盖长度(米)',
        dataIndex: 'arriveLength',
        key: 'arriveLength',
        width: '65',
        render: (text, record, index) => {
          let arriveLen = 0;
          (record.coverLineList || []).map((item) => {
            arriveLen += item.coverLength;
          });
          return Math.round(100 * arriveLen) / 100 > record.length ? record.length : Math.round(100 * arriveLen) / 100;
        },
      },
      {
        title: '覆盖率(%)',
        dataIndex: 'fieldvalue',
        key: 'fieldvalue',
        width: '65',
        render: (text, record, index) => {
          let arriveLen = 0;
          (record.coverLineList || []).map((item) => {
            arriveLen += item.coverLength;
          });
          return arriveLen ? (Math.round(100 * 100 * arriveLen / record.length) / 100 > 100 ? 100 : Math.round(100 * 100 * arriveLen / record.length) / 100) : 0;
        },
      },
    ];

    // 关键线
    const keylineColumns = [
      {
        title: '关键线编号',
        dataIndex: 'gid',
        key: 'gid',
        width: '65',
      },
      {
        title: '关键线总长(米)',
        dataIndex: 'length',
        key: 'length',
        width: '65',
      },
      {
        title: '覆盖长度(米)',
        dataIndex: 'arriveLength',
        key: 'arriveLength',
        width: '65',
        render: (text, record, index) => {
          let arriveLen = 0;
          (record.coverLineList || []).map((item) => {
            arriveLen += item.coverLength;
          });
          return Math.round(100 * arriveLen) / 100 > record.length ? record.length : Math.round(100 * arriveLen) / 100;
        },
      },
      {
        title: '覆盖率(%)',
        dataIndex: 'fieldvalue',
        key: 'fieldvalue',
        width: '65',
        render: (text, record, index) => {
          let arriveLen = 0;
          (record.coverLineList || []).map((item) => {
            arriveLen += item.coverLength;
          });
          return arriveLen ? (Math.round(100 * 100 * arriveLen / record.length) / 100 > 100 ? 100 : Math.round(100 * 100 * arriveLen / record.length) / 100) : 0;
        },
      },
    ];

    // 分类统计：关键点(多类)、设备（多类）、管段（多类）、关键线
    const dataSourcePoint = [];
    const dataSourceDevice = [];
    const dataSourcePipe = [];
    const dataSourceKeyline = [];
    if(this.props.patrolDetailAllData && this.props.patrolDetailAllData.layertypes){
      this.props.patrolDetailAllData.layertypes.keypoint.map((item) => {
        dataSourcePoint.push(...item.datas);
        this.taskInfo.dataSourcePoint = dataSourcePoint;
      });
      this.props.patrolDetailAllData.layertypes.equipment.map((item) => {
        dataSourceDevice.push(...item.datas);
        this.taskInfo.dataSourceDevice = dataSourceDevice;
      });
      this.props.patrolDetailAllData.layertypes.pipesection.map((item) => {
        dataSourcePipe.push(...item.datas);
        this.taskInfo.dataSourcePipeLine.push(...item.datas);
      });
      this.props.patrolDetailAllData.layertypes.keyline.map((item) => {
        dataSourceKeyline.push(...item.datas);
        this.taskInfo.dataSourceKeyLine.push(...item.datas);
      });
    }

    const totalPoint = dataSourcePoint.length;
    const totalDevice = dataSourceDevice.length;
    const totalPipe = dataSourcePipe.length;
    const totalKeyline = dataSourceKeyline.length;

    // 表格分页
    let pagination = {
      pageSize: pagesize,
      current: pageno,
      total: patroltotal,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: function () {  // 设置显示一共几条数据
        return <div id='pageTotal'>共 {patroltotal} 条数据</div>;
      }
    };

    //关键点、关键线分页
    let Pointpagination = {
      pageSize: pagesize,
      current: pageno,
      total: patroltotal,
      showSizeChanger: true,
      showQuickJumper: true,
      onShowSizeChange(current, pageSize) {
        console.log('Current: ', current, '; PageSize: ', pageSize)
        that.onChangePage(current, pageSize)
      },
      onChange(current) {
        console.log('Current: ', current)
        that.onChangePage(current)
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div id='pageTotal'>共 {patroltotal} 条数据</div>;
      }
    };

    // 任务详情页面配置
    let field = {
      object: this.tool.data,
      location: this.location,
    };

    let fieldList = [];

    switch (currentTab.name) {
      case '关键点':
        let table1 = (<Table
          columns={hideFeekBack ? columnsHideFeedBack : columns}
          dataSource={dataSource}
          pagination={Pointpagination}
          rowKey={(record) => record.gid}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              this.location();
            },
          })}
        />);
        fieldList.push({ layerType: currentTab.name, table: dataSource ? table1 : null });
        break;
      case '设备':
        let table2 = (
          <Row>
            <Col id="equipmenttable" span={this.state.isShowDeviceInfo ? 17 : 24}>
              <Table
                columns={deviceColumns}
                dataSource={dataSource}
                pagination={pagination}
                onChange={this.handleTableChange}
                rowKey={(record) => record.gid}
                onRow={(record, index) => ({
                  // onDoubleClick: () => {
                  //   this.location();
                  // },
                  onClick: () => {
                    this.showDeviceDetails(record);
                  },
                })}
              />
            </Col>
            <Col span={this.state.isShowDeviceInfo ? 7 : 0}>
              <div style={{ display: this.state.isShowDeviceInfo ? 'inline-block' : 'none', marginLeft: 15 }}>
                <div>
                  <Row>
                    <Col span={6}>
                      <b><Icon
                        type="close"
                        style={{ width: 60, color: '#000', marginLeft: 265 }}
                        onClick={() => {
                          this.isHideDeviceInfo();
                        }}
                      /></b>
                    </Col>
                  </Row>
                </div>
                <div>
                  <Tabs defaultActiveKey="1" size='small'>
                    <TabPane tab="设备信息" key="1"><PatrolTaskDeviceDetails patrolDeviceDetailsInfo={this.props.patrolDeviceDetailsInfo} /></TabPane>
                    <TabPane tab="任务反馈" key="2"><PatrolTaskFeedback patrolDeviceFeedbackInfo={this.props.patrolDeviceFeedbackInfo} /></TabPane>
                  </Tabs>
                </div>
              </div>
            </Col>
          </Row>
        );
        fieldList.push({ layerType: currentTab.name, table: dataSource ? table2 : null });
        break;
      case '管段':
        let table3 = (<Table
          columns={pipeColumns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={this.handleTableChange}
          rowKey={(record) => record.gid}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              this.location();
            },
          })}
        />);
        fieldList.push({ layerType: currentTab.name, table: dataSource ? table3 : null });
        break;
      case '关键线':
        let table4 = (<Table
          columns={keylineColumns}
          dataSource={dataSource}
          pagination={Pointpagination}
          rowKey={(record) => record.gid}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              this.location();
            },
          })}
        />);
        fieldList.push({ layerType: currentTab.name, table: dataSource ? table4 : null });
        break;
      default:
        break;
    }
    // 任务执行人信息
    const taskPersons = [];
    const userids = this.props.patrolTaskDetailData && this.props.patrolTaskDetailData.userids && this.props.patrolTaskDetailData.userids.split(',').filter(item => item !== '');
    const usernames = this.props.patrolTaskDetailData && this.props.patrolTaskDetailData.usernames && this.props.patrolTaskDetailData.usernames.split(',').filter(item => item !== '');
    (userids || []).map((userid, index) => {
      taskPersons.push({
        id: userid,
        name: usernames[index],
        online: 1,
      });
    });

    return (
      <PageHeaderLayout showBack={this.goBack}>
        <div style={{ width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative' }}>
          <div style={{ display: !this.state.isShowMap ? 'block' : 'none' }}>
            <DetailPanel
              fieldList={fieldList}
              field={field}
              taskTypeList={this.tool.taskStateInfo}
              taskInfoArrive={this.props.patrolTaskDetailData}
              patrolTaskDetailData={this.props.patrolTaskDetailData}
              onChangeTabs={this.onChangeTabs}
              tabList={tabList}
            />
          </div>
          {this.state.isShowMap ?
            <div style={{ width: '100%', height: '100%', left: 0, top: 0, position: 'absolute', zIndex: 98 }}>
              <EcityMap mapId="taskDetail" onMapLoad={this.onMapLoad} />
            </div> : null}
          {this.state.showTraceDialog ? <TrackInfo
            persons={taskPersons}
            queryDate={{ startTime: starttime, endTime: this.props.patrolTaskDetailData.endTime }}
            map={this.map}
            onClose={this.goBack}
            mark='task_detail'
          >
          </TrackInfo> : null}
          {
            this.state.showTraceDialog ? <TraceLegend map={this.map} showPoint={this.showPoints} showPath={this.showPipeLine} checkPath={this.showCheckPipeLine} onClose={this.goBack} /> : null
          }
        </div>
      </PageHeaderLayout>
    );
  }
}

