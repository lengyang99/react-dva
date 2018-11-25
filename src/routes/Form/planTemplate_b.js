import React from 'react';
import styles from './index.less';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, DatePicker, TreeSelect, message, Icon} from 'antd';
import moment from 'moment';
import utils from '../../utils/utils';
import EcityMap from '../../components/Map/EcityMap';
import { DrawPolygonMapTool } from '../../components/Map/common/maptool/DrawPolygonMapTool';
import { EditPolygonMapTool } from '../../components/Map/common/maptool/EditPolygonMapTool';
import { DrawPolylineMapTool } from '../../components/Map/common/maptool/DrawPolylineMapTool';
import { DrawPointMapTool } from '../../components/Map/common/maptool/DrawPointMapTool';
import Dialog from '../../components/yd-gis/Dialog/Dialog';

const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const createForm = Form.create;
const CheckboxGroup = Checkbox.Group;
const RangePicker = DatePicker.RangePicker;

import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import appEvent from '../../utils/eventBus';

const keyPointId = 5;

@connect(state => ({
  user: state.login.user,
  areaData: state.patrolPlanList.areaData,
  // layersData: state.patrolPlanList.layersData,
  usernamesData: state.patrolPlanList.usernamesData,
}))

export default class planTemplate extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    this.map = null; // 类ArcGISMap的实例
    this.state = {
      hasName: false,
      layersData: [],
      // patrolPlanData: [],

      // showMonth: false, // 一年一次
      // showWeek: false, // 一月一次
      // showWeekday: false, // 一周一次
      // showDay: false, // 一日一次

      // 计划和任务公共
      name: '', // 计划名称
      areaid: '', // 区域ID
      layerids: [], // 巡检对象ids
      userids: [], // 巡检员ids
      usernames: [], // 巡检员
      speedid: '', // 行走方式id
      stationid: '', // 站点id
      station: '', // 站点
      cycleid: '', // 巡检周期
      sTime: '', // 开始时间
      eTime: '', // 结束时间

      startMonth: [], // 年份下选择
      startWeek: [], // 月份下选择
      startWeekday: [], // 星期下选择
      startTime: '',
    };

    this.planValidate = {
      name: {validate: true, message: '计划名称为空'}, // 模板名称
      areaid: {validate: true, message: '区域名称为空'}, // 区域id
      layerids: {validate: true, message: '巡检对象为空'}, // 巡检对象id
      userids: {validate: true, message: '巡检员为空'}, // 巡检员id
      cycleid: {validate: true, message: '巡检周期为空'}, // 巡检周期
      speedid: {validate: true, message: '行走方式为空'}, // 行走方式
    };

    this.taskValidate = {
      areaid: {validate: true, message: '区域名称为空'}, // 区域id
      layerids: {validate: true, message: '巡检对象为空'}, // 巡检对象id
      userids: {validate: true, message: '巡检员为空'}, // 巡检员id
      speedid: {validate: true, message: '行走方式为空'}, // 行走方式
      sTime: {validate: true, message: '开始时间为空'}, // 开始时间
      eTime: {validate: true, message: '结束时间为空'}, // 结束时间
      name: {validate: true, message: '计划名称为空'}, // 模板名称
    };
  }

  // 初始化，constructor后，render前
  componentDidMount = () => {
    this.areaDataDictionary();
    this.getLayerDataDictionary();
    this.getUsernamesDataDictionary();
    if (this._tool.actionType === 'insertPlan') {
      this.setState({
        cycleid: '4',
        speedid: '1',
      });
      // this.queryAllPlanData();
    }
    if (this._tool.actionType === 'insertTempPlan') {
      this.setState({
        speedid: '1',
      });
      // this.queryAllPlanData();
    }
    // if (this._tool.actionType === 'updatePlan') {
    //   let layerids = this.stringToNum(this._tool.layerids.split(','));
    //   let areaid = this._tool.areaid.toString();
    //   let userids = this._tool.userids.split(',').map((userid, i) => {
    //     return `u${userid}`;
    //   });
    //   this.setState({
    //     areaid: areaid, // 区域ID
    //     stationid: this._tool.stationid.toString(), // 站点ID
    //     station: this._tool.station.toString(), // 站点
    //     layerids: layerids, // 巡检对象ids
    //     userids: userids, // 巡检员ids
    //     usernames: this._tool.usernames.split(','), // 巡检员
    //     cycleid: this._tool.cycleid.toString(), // 巡检周期
    //     sTime: this._tool.startTime.toString(), // 开始时间
    //     eTime: this._tool.endTime.toString(), // 结束时间
    //     speedid: this._tool.speedid.toString(), // 行走方式
    //     name: this._tool.name, // 模板名称
    //   });
      // if (this.props._tool.params.startTime) {
      //     this.setState({
      //         showDay: true,
      //         startTime: this.props._tool.params.startTime,
      //     });
      // }
      // if (this.props._tool.params.startWeekday) {
      //     this.setState({
      //         showWeekday: true,
      //         startWeekday: this.stringToNum(
      //             this.props._tool.params.startWeekday.split(',')), // 星期下选择
      //     });
      // }
      // if (this.props._tool.params.startWeek) {
      //     this.setState({
      //         showWeek: true,
      //         startWeek: this.stringToNum(this.props._tool.params.startWeek.split(',')), // 月下选择
      //     });
      // }
      // if (this.props._tool.params.startMonth) {
      //     this.setState({
      //         showMonth: true,
      //         startMonth: this.stringToNum(this.props._tool.params.startMonth.split(',')), // 年下选择
      //     });
      // }
    // }
  };

  // 获取计划数据
  // queryAllPlanData = () => {
  //   this.props.dispatch({
  //     type: 'patrolPlanList/getPatrolPlanData',
  //     payload: {
  //       pageno: 1,
  //       pagesize:100000000,
  //     },
  //     callback: (datas) => {
  //       this.setState({
  //         patrolPlanData: datas,
  //       });
  //     }
  //   });
  // };

  // 初始化地图及区域
  // showMap = () => {
  //   if (this._tool.actionType === 'updatePlan') {
  //     this.showArea(this._tool.areaPolygon);
  //     this.showPath(this._tool.pathPolygon);
  //     let layerids = this.stringToNum(this._tool.layerids.split(','));
  //     let areaid = this._tool.areaid.toString();
  //     for (let i = 0; i < layerids.length; i++) {
  //       this.getPoint(areaid, layerids[i], (res) => {
  //         this.showPoint(layerids[i], res);
  //       });
  //     }
  //   }
  // };

  // array[string] --> array[num]
  stringToNum = (array) => {
    let arr = [];
    for (let i = 0; i < array.length; i++) {
      arr[i] = parseInt(array[i], 10);
    }
    return arr;
  };

  // 巡检周期改变
  cycleChange = (value) => {
    this.setState({
      cycleid: value,
    });
    // this.setState({
    //   showMonth: false, showWeek: false, showWeekday: false, showDay: false,
    //   startMonth: [], startWeek: [], startWeekday: [], startTime: '',
    // });
    // if (value === '1') {
    //   this.setState({
    //     showMonth: true, cycleid: '1',
    //   });
    // }
    // else if (value === '2') {
    //   this.setState({
    //     showWeek: true, cycleid: '2',
    //   });
    // }
    // else if (value === '3') {
    //   this.setState({
    //     showWeekday: true, cycleid: '3',
    //   });
    // }
    // else if (value === '4') {
    //   this.setState({
    //     showDay: true, cycleid: '4',
    //   });
    // }
    // else {
    //   message.error('日期出错');
    // }
  };

  // 日期初始化
  // initDdlPanel = (type, data) => {
  //   let panelData = [];
  //   for (let i = 1; i <= data.length; i++) {
  //     let dataInfo = data[i - 1];
  //     let bool = false;
  //     let array = [];
  //     if (type === 'Month') {
  //       array = this.state.startMonth;
  //     }
  //     else if (type === 'Week') {
  //       array = this.state.startWeek;
  //     }
  //     else if (type === 'Weekday') {
  //       array = this.state.startWeekday;
  //     }
  //     else {
  //       message.error('日期初始化失败');
  //     }
  //     for (let j = 0; j < 2; j++) {
  //       if (i === array[j]) {
  //         bool = true;
  //       }
  //     }
  //     let datadiv = (
  //       <div key={i}
  //            className={styles.select_panel_div}
  //            data-value={dataInfo}
  //            data-index={i}
  //            onClick={this.selectDdlClick.bind(this, array, type)}>
  //                       <span style={{cursor: 'pointer'}}
  //                             className={(bool ? styles.select_panel_span_selected : '') + ' ' + styles.select_panel_span}>
  //                          {dataInfo}
  //                       </span>
  //       </div>
  //     );
  //     panelData.push(datadiv);
  //   }
  //   return panelData;
  // };

  // 选择日期改变
  // selectDdlClick = (array, type, e) => {
  //   let getindex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
  //   if (array.length === 0) {
  //     array.push(getindex);
  //   }
  //   else if (array.length === 1) {
  //     if (getindex === array[0]) {
  //       array.splice(0, 1);
  //     }
  //     else {
  //       array.push(getindex);
  //       array.sort();
  //     }
  //   }
  //   else if (array.length === 2) {
  //     for (let j = 0; j < 2; j++) {
  //       if (getindex === array[j]) {
  //         array.splice(j, 1);
  //       }
  //     }
  //   }
  //   else {
  //     message.error('错误');
  //   }
  //
  //   if (type === 'Month') {
  //     this.setState({
  //       startMonth: array,
  //     });
  //   }
  //   else if (type === 'Week') {
  //     this.setState({
  //       startWeek: array,
  //     });
  //   }
  //   else if (type === 'Weekday') {
  //     this.setState({
  //       startWeekday: array,
  //     });
  //   }
  //   else {
  //     message.error('日期初始化失败');
  //   }
  // };

  // 巡检员改变
  onPatrolorChange = (value, label, object) => {
    this.setState({
      userids: value,
      usernames: label,
    });
  };

  // 行走方式改变
  onCycleChange = (value) => {
    this.setState({
      speedid: value,
    });
  };

  // 模板名称改变
  getPlanName = (value) => {
    this.setState({
      name: value.target.value,
    });
    if(value.target.value === ''){
      this.setState({
        hasName: false,
      });
    }else {
      this.setState({
        hasName: true,
      });
    }
  };

  // 计划开始事件改变
  // startTime = (value) => {
  //   this.setState({
  //     startTime: value,
  //   });
  // };

  // 任务开始时间改变
  taskTimeChange = (value) => {
    this.setState({
      sTime: value[0].format('YYYY-MM-DD HH:mm:ss'),
      eTime: value[1].format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  // 展示点
  showPoint = (layerid, taskPoints) => {
    let that = this;
    if (!taskPoints) {
      return;
    }
    for (let i = 0; i < taskPoints.length; i++) {
      let position = {};
      if (typeof taskPoints[i].geometry === 'string') {
        position = JSON.parse(taskPoints[i].geometry);
      } else {
        position = taskPoints[i].geometry;
      }
      const param = {
        id: taskPoints[i].gid,
        layerId: `layerId_${layerid}`,
        layerIndex: 10,
        attr: taskPoints[i],
        markersize: 8,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        x: position.x,
        y: position.y,
        click: function(point){
          // appEvent.emit('mapEvent.mapOper.popup', {
          that.map.popup({
            x: point.geometry.x,
            y: point.geometry.y,
            info: {
              title: point.attributes.gid,
              content: [
                {name: '#', value: point.attributes.gid},
                {name: '图层名称', value: point.attributes.dno},
                {name: 'Gis编号', value: point.attributes.编号},
                {name: '状态', value: point.attributes.isArrive === 1 ? '已到位' : '未到位'},
              ]
            },
          });
        }
      };
      that.map.getMapDisplay().point(param);
      // appEvent.emit('mapEvent.mapDisplay.point', param);
    }
  };

  // 展示面
  showArea = (areaPolygon) => {
    if (!areaPolygon) {
      return;
    }
    const paramArea = {
      id: 'paramArea1',
      layerId: 'testlayer2',
      dots: JSON.parse(areaPolygon),
    };
    // appEvent.emit('mapEvent.mapOper.centerAt', paramArea.dots[0]);
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
    // appEvent.emit('mapEvent.mapDisplay.polygon', paramArea);
  }

  // 展示线
  showPath = (pathPolygon) => {
    if (!pathPolygon) {
      return;
    }
    let lines = JSON.parse(pathPolygon);
    for (let i = 0; i < lines.length; i++) {
      const paramLine = {id: 'paramLine' + i, layerId: 'testlayer2', dots: lines[i]};
      this.map.getMapDisplay().polyline(paramLine);
      // appEvent.emit('mapEvent.mapDisplay.polyline', paramLine);
    }
  }

  // 区域名称数据字典
  areaDataDictionary = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getAreaData',
    });
    // http.get({
    //     svn: 'PATROL_MANAGER',
    //     path: '/area/getAreaListByStation',
    //     data: {
    //         // stationid: 8,
    //     },
    // }).then((res) => {
    //     if (!res.success) {
    //         message.error(res.msg);
    //         return;
    //     }
    //     let data = [];
    //     this.getTreeData(data, res.list, '');
    //     this.setState({
    //         areaDataDictionary: data
    //     });
    // }).catch((err) => {
    //     console.error(err);
    // });
  };

  // json数据递归遍历 区域
  getTreeData = (datas, array) => {
    for (let i = 0; i < array.length; i++) {
      let data = {};
      data.label = array[i].name.toString();
      data.value = array[i].gid.toString();
      data.key = array[i].name.toString() + array[i].gid.toString();
      if (array[i].children !== undefined) {
        data.children = [];
        this.getTreeData(data.children, array[i].children);
      }
      let area = Object.assign({}, array[i]);
      delete area.children;
      data.area = area;
      datas.push(data);
    }
  };

  // json数据递归遍历 ----- 巡检员
  getPatrolorTreeData = (array) => {
    let datas = [];
    for (let i = 0; i < array.length; i++) {
      let data = {};
      data.label = array[i].label.toString();
      data.key = array[i].label.toString() + array[i].value.toString();
      data.attribute = array[i].attributes;
      data.value = array[i].value.toString();
      if (array[i].children !== undefined) {
        data.children = this.getPatrolorTreeData(array[i].children);
      }
      datas.push(data);
    }
    return datas;
  };
  // getTreeData = (datas, array, parent) => {
  //   for (let i = 0; i < array.length; i++) {
  //     let data = {};
  //     data.label = array[i].name.toString();
  //     data.value = array[i].gid.toString();
  //     data.key = array[i].name.toString() + array[i].gid.toString();
  //     data.treeSelect = {
  //       label: array[i].station.toString(),
  //       value: array[i].stationid.toString(),
  //       key: array[i].station.toString() + array[i].stationid.toString(),
  //     };
  //     data.parent = parent;
  //     if (array[i].children !== undefined) {
  //       data.children = [];
  //       this.getTreeData(data.children, array[i].children, data.treeSelect);
  //       delete array[i].children;
  //     }
  //     data.area = array[i];
  //     datas.push(data);
  //   }
  // };

  // 巡检对象 数据字典
  getLayerDataDictionary = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getLayerData',
      callback: (res) => {
        let newLayer = res;
        // if (this._tool.actionType === 'updatePlan') {
        //   let layerids = this.stringToNum(this._tool.layerids.split(','));
        //   let areaid = this._tool.areaid.toString();
        //   for (let i = 0; i < newLayer.length; i++) {
        //     if (layerids.indexOf(newLayer[i].gid) !== -1) {
        //       this.getPoint(areaid, newLayer[i].gid, (res) => {
        //         newLayer[i].num = res.length;
        //         this.showPoint(newLayer[i].gid, res);
        //         this.setState({
        //           layersData: newLayer,
        //         });
        //       });
        //       newLayer[i].visibility = true;
        //     } else {
        //       newLayer[i].visibility = false;
        //     }
        //   }
        // }
        this.setState({
          layersData: newLayer,
        });
      }
    });
  };


  // 巡检员 数据字典
  getUsernamesDataDictionary = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getUsernamesData',
      payload: {
        userid: this.props.user.gid,
      }
    });
  };

  // 区域名称改变
  onAreaChange = (value, label, object) => {
    if (!value) {
      return;
    }
    let newLayer = this.state.layersData;
    for (let i = 0; i < newLayer.length; i++) {
      this.getPoint(value, keyPointId, (res) => {
        newLayer[i].num = res.length;
        let layer = newLayer;
        this.setState({
          layersData: layer,
        });
      });
      if (newLayer[i].gid === keyPointId) {
        newLayer[i].visibility = true;
      } else {
        newLayer[i].visibility = false;
      }
    }
    this.setState({
      areaid: value,
      userids: ['u' + object.triggerNode.props.area.userid.toString()],
      usernames: [object.triggerNode.props.area.usernames],
      layerids: [keyPointId],
      layersData: newLayer,
      stationid: object.triggerNode.props.area.stationid,
      station: object.triggerNode.props.area.station,
    });
    if (this._tool.actionType !== 'updatePlan' && !this.state.hasName) {
      this.setState({
        name: label + '_' + moment().format('YYYY-MM-DD'),
      });
    }
    this.map.getMapDisplay().removeLayer(`layerId_${keyPointId}`);
    // appEvent.emit('mapEvent.mapDisplay.removeLayer', `layerId_${keyPointId}`);
    this.getPoint(value, keyPointId, (res) => {
      this.showPoint(keyPointId, res);
    });
    // appEvent.emit('mapEvent.mapDisplay.clear');
    this.showArea(object.triggerNode.props.area.areaPolygon);
    this.showPath(object.triggerNode.props.area.pathPolygon);
  };

  // 巡检对象改变
  onLayeridsChange = (e) => {
    let layerids = this.state.layerids;
    if (layerids.indexOf(e.target.value) === -1) {
      layerids.push(e.target.value);
      this.getPoint(this.state.areaid, e.target.value, (res) => {
        this.showPoint(e.target.value, res);
      });
    }
    else {
      for (let i = 0; i < layerids.length; i++) {
        if (layerids[i] === e.target.value) {
          layerids.splice(i, 1);
        }
      }
      // this.map.getMapDisplay().removeLayer(`layerId_${e.target.value}`);
      // appEvent.emit('mapEvent.mapDisplay.removeLayer', `layerId_${e.target.value}`);
    }
    let layersDataDictionary = this.state.layersData;
    for (let i = 0; i < layersDataDictionary.length; i++) {
      if (layersDataDictionary[i].gid === e.target.value) {
        layersDataDictionary[i].visibility = e.target.checked;
      }
    }
    this.setState({
      layerids: layerids,
      layersData: layersDataDictionary,
    });
  };
// http://10.1.57.108:8022/ServiceEngine/rest/services/NetServer/lfgw/${layerid}/query
  // 获取对应 区域 和 巡检对象 的点
  getPoint = (areaid, layerid, callback) => {
    if (layerid === keyPointId) {
      this.props.dispatch({
        type: 'patrolPlanList/getKeypointsByAreaid',
        payload: {
          gid: areaid,
        },
        callback: (res) => {
          callback(res);
        }
      });
    } else {
      this.props.dispatch({
        type: 'patrolPlanList/queryPointsByAreaAndLayer',
        areaid: areaid,
        layerid: layerid,
        payload: {
          geometryType: 'esriGeometryPoint',
          spatialRel: 'esriSpatialRelIntersects',
          returnIdsOnly: false,
          returnCountOnly: false,
          returnGeometry: true,
          f: 'json',
        },
        callback: (res) => {
          callback(res.features);
        }
      });
    }
  };

  // 巡检对象div
  getLayerDiv = (datas, layerids) => {
    let divs = [];
    for (let i = 0; i < datas.length; i++) {
      let div = (
        <div key={i} style={{display: 'inline-block', width: 130}}>
          <Checkbox style={{marginRight: 5}} value={datas[i].gid} checked={layerids.indexOf(datas[i].gid) !== -1}
                    disabled={this.state.areaid === ''} onChange={this.onLayeridsChange}>
            {datas[i].name}
          </Checkbox>
          <span style={{color: '#1890ff', marginRight: '10px', visibility: datas[i].visibility ? 'visible' : 'hidden'}}>
            {datas[i].num}
          </span>
        </div>
      );
      divs.push(div);
    }
    return divs;
  };

  // 插入计划
  insertPlan = () => {
    let data = {
      type: 1,
    };
    for (let key in this.planValidate) {
      if (this.planValidate[key].validate && (this.state[key].length === null || this.state[key] === '' || this.state[key].length === 0)) {
        message.error(this.planValidate[key].message);
        return;
      }
    }
    data.creatorid = this.props.user.gid;
    data.creator = this.props.user.username;
    data.areaid = this.state.areaid;// 区域ID
    data.stationid = this.state.stationid;// 站点ID
    data.station = this.state.station;// 站点
    data.layerids = this.state.layerids.toString();// 巡检对象id
    data.userids = this.state.userids.toString().substring(1);// 巡检员id
    data.usernames = this.state.usernames.toString();// 巡检员
    data.cycleid = this.state.cycleid;// 巡检周期
    data.speedid = this.state.speedid;// 行走方式
    data.name = this.state.name;// 模板名称
    // if (this.state.startMonth.toString() !== '') {
    //   data.startMonth = this.state.startMonth.toString();// 年份下选择
    // }
    // if (this.state.startWeek.toString() !== '') {
    //   data.startWeek = this.state.startWeek.toString();// 月份下选择
    // }
    // if (this.state.startWeekday.toString() !== '') {
    //   data.startWeekday = this.state.startWeekday.toString();// 星期份下选择
    // }
    // if (this.state.startTime !== '') {
    //   data.startTime = new Date(this.state.startTime.format('YYYY-MM-DD'));// 日下选择
    // }
    // let isUnique = true;
    // this.state.patrolPlanData.map((oneData)=> {
    //   if(oneData.name === data.name){
    //     isUnique = false;
    //   }
    // });
    // if(!isUnique){
    //   message.warn('计划名称已存在');
    //   return;
    // }
    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlan',
      payload: data,
      callback: (res) => {
        if(!res.success){
          message.error(res.msg);
          return;
        }
        message.success(res.msg);
        this.props.dispatch(routerRedux.push('/query/patrol-plan-list'));
      }
    });
  };
  // 插入临时计划
  insertTempPlan = () => {
    let data = {
      type: 0,
    };
    for (let key in this.taskValidate) {
      if (this.taskValidate[key].validate && (this.state[key].length === null || this.state[key] === '' || this.state[key].length === 0)) {
        message.error(this.taskValidate[key].message);
        return;
      }
    }
    data.creatorid = this.props.user.gid;
    data.creator = this.props.user.username;
    data.areaid = this.state.areaid;// 区域ID
    data.stationid = this.state.stationid;// 站点ID
    data.station = this.state.station;// 站点
    data.layerids = this.state.layerids.toString();// 巡检对象id
    data.userids = this.state.userids.toString().substring(1);// 巡检员id
    data.usernames = this.state.usernames.toString();// 巡检员
    data.speedid = this.state.speedid;// 行走方式
    data.name = this.state.name;// 模板名称
    // data.remark = this.state.remark;// 备注
    data.startTime = this.state.sTime;// 开始时间
    data.endTime = this.state.eTime;// 结束时间
    // let isUnique = true;
    // this.state.patrolPlanData.map((oneData)=> {
    //   if(oneData.name === data.name){
    //     isUnique = false;
    //   }
    // });
    // if(!isUnique){
    //   message.warn('计划名称已存在');
    //   return;
    // }
    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlan',
      payload: data,
      callback: (res) => {
        if(!res.success){
          message.error(res.msg);
          return;
        }
        message.success(res.msg);
        this.props.dispatch(routerRedux.push('/query/patrol-plan-list'));
      }
    });
  };

  // 修改计划
  // updatePlan = () => {
  //   let data = {
  //     gid: this._tool.gid,
  //   };
  //   for (let key in this.planValidate) {
  //     if (this.planValidate[key].validate && (this.state[key] === '' || this.state[key].length === 0)) {
  //       message.error(this.planValidate[key].message);
  //       return;
  //     }
  //   }
  //   data.areaid = this.state.areaid;// 区域ID
  //   data.stationid = this.state.stationid;// 站点ID
  //   data.station = this.state.station;// 站点
  //   data.layerids = this.state.layerids.toString();// 巡检对象ids
  //   data.userids = this.state.userids.toString().substring(1);// 巡检员ids
  //   data.usernames = this.state.usernames.toString();// 巡检员
  //   if (this._tool.type === '0') {
  //     data.startTime = this.state.sTime;// 开始时间
  //     data.endTime = this.state.eTime;// 结束时间
  //   } else if (this._tool.type === '1') {
  //     data.cycleid = this.state.cycleid;// 巡检周期
  //   }
  //   data.speedid = this.state.speedid;// 行走方式
  //   data.name = this.state.name;// 模板名称
    // data.remark = this.state.remark;// 备注
    // if (this.state.startMonth.toString() !== '') {
    //   data.startMonth = this.state.startMonth.toString();// 年份下选择
    // }
    // if (this.state.startWeek.toString() !== '') {
    //   data.startWeek = this.state.startWeek.toString();// 月份下选择
    // }
    // if (this.state.startWeekday.toString() !== '') {
    //   data.startWeekday = this.state.startWeekday.toString();// 星期份下选择
    // }
    // if (this.state.startTime !== '') {
    //   data.startTime = new Date(this.state.startTime.format('YYYY-MM-DD'));// 日下选择
    // }
  //   this.props.dispatch({
  //     type: 'patrolPlanList/updatePatrolPlan',
  //     payload: data,
  //     callback: (res) => {
  //       if(!res.success){
  //         message.error(res.msg);
  //         return;
  //       }
  //       message.success(res.msg);
  //       this.props.dispatch(routerRedux.push('/query/patrol-plan-list'));
  //     }
  //   });
  // };

  goback = () => {
    this.props.dispatch(routerRedux.push('/query/patrol-plan-list'));
  };


  render() {
    let areaTemp = Object.assign([], this.props.areaData || []);
    let areaData = [];
    this.getTreeData(areaData, areaTemp);
    let usernamesData = this.getPatrolorTreeData(this.props.usernamesData || []);
    let layersData = this.state.layersData.map((item) => {
      return {gid: item.gid, name: item.name, visibility: item.visibility, num: item.num};
    });

    // let month = this.initDdlPanel('Month', ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']);
    // let week = this.initDdlPanel('Week', ['一周', '二周', '三周', '四周']);
    // let weekday = this.initDdlPanel('Weekday', ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']);

    let button = () => {};
    if (this._tool.actionType === 'insertPlan') {
      button = this.insertPlan;
    }
    else if (this._tool.actionType === 'insertTempPlan') {
      button = this.insertTempPlan;
    }
    // else if (this._tool.actionType === 'updatePlan') {
    //   button = this.updatePlan;
    // }
    else {
      message.error('type类型错误，只能是insertPlan，insertTempPlan');
    }

    const checkboxGroup = this.getLayerDiv(layersData, this.state.layerids);

    // **********************************************************************
    const formItemLayout = {
      labelCol: {span: 5},
      wrapperCol: {span: 18},
      style: {marginBottom: '10px'}
    };

    const isShowCycle = (this._tool.actionType === 'insertPlan' || (this._tool.actionType === 'updatePlan' && this._tool.type === '1'));

    const isShowRangeTime = (this._tool.actionType === 'insertTempPlan' || (this._tool.actionType === 'updatePlan' && this._tool.type === '0'));

    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    return (

      <div style={{width: '100%', height: 'calc(100vh - 120px)'}}>
        <div style={{width: '100%', height: '100%'}}>
          <EcityMap mapId="patrolPlanList" onMapLoad={(arcGISMap) => {this.map = arcGISMap}}/>
        </div>
        <Dialog title='巡检计划模板' width={400} onClose={this.goback}>
          <Form style={{marginTop: '20px'}}>
            <FormItem
              {...formItemLayout}
              id="control-input"
              label="计划名称：">
              <div>
                <Input id="control-input" style={{width: '95%'}} value={this.state.name} placeholder="请输入"
                       disabled={this._tool.actionType === 'updatePlan'} onChange={this.getPlanName}/>
                <span className={styles.starSpan}>*</span>
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="区域名：">
              <TreeSelect style={{width: '95%'}}
                          value={this.state.areaid}
                          dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                          treeData={areaData}
                          placeholder="请选择"
                          onChange={this.onAreaChange.bind(this)}>
              </TreeSelect>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="巡检对象：">
              {checkboxGroup}
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="巡检员：">
              <TreeSelect
                style={{width: '95%', maxHeight: 150, overflow: 'auto'}}
                treeData={usernamesData}
                dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                value={this.state.userids}
                onChange={this.onPatrolorChange.bind(this)}
                multiple={true}
                treeCheckable={true}
                placeholder='请选择'>
              </TreeSelect>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
              label="巡检周期：">
              <Select style={{width: '95%'}} value={this.state.cycleid} searchPlaceholder="请选择" onChange={this.cycleChange}>
                {/* <Option value='1'>年/次</Option>*/}
                <Select.Option value='2'>月/次</Select.Option>
                <Select.Option value='3'>周/次</Select.Option>
                <Select.Option value='4'>日/次</Select.Option>
              </Select>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            {/* <FormItem
             {...formItemLayout}
             label="起止日期：">
             <div style={{display: this.state.showWeek ? 'block' : 'none'}}>
             {week}
             {weekday}
             </div>
             <div style={{display: this.state.showWeekday ? 'block' : 'none'}}>
             {weekday}
             </div>
             <div style={{display: this.state.showDay ? 'block' : 'none'}}>
             <DatePicker style={{height: '100%', width: '100%'}} value={this.state.startTime} onChange={this.startTime}/>
             </div>
             </FormItem>*/}
            <FormItem
              {...formItemLayout}
              style={{marginBottom: 10, display: isShowRangeTime ? 'block' : 'none'}}
              label="起止日期：">
              <RangePicker style={{width: '95%', height: '100%'}}
                           value={this.state.sTime === '' ? [null, null] : [moment(this.state.sTime, dateFormat), moment(this.state.eTime, dateFormat)]}
                           showTime format="YYYY-MM-DD HH:mm" onChange={this.taskTimeChange}/>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="行走方式：">
              <Select style={{width: '95%'}} value={this.state.speedid} placeholder="请选择" onChange={this.onCycleChange.bind(this)}>
                <Select.Option value='1'>车巡</Select.Option>
                <Select.Option value='2'>徒步</Select.Option>
              </Select>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              style={{margin: '20px 0px'}}
              wrapperCol={{span: 9, offset: 14}}>
              <Button type="ghost" style={{width: '70px', height: '28px', marginRight: '5px'}}
                      onClick={this.goback}>取消</Button>
              <Button type="primary" style={{width: '70px', height: '28px'}} onClick={button}>确定</Button>
            </FormItem>
          </Form>
        </Dialog>
      </div>
    )
  }
}
