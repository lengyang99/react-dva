import React from 'react';
import {connect} from 'dva';
import MD5 from 'md5';
import {Layout, message, Modal} from 'antd';
import EcityMap from '../../components/Map/EcityMap';

import {DrawPointMapTool} from '../../components/Map/common/maptool/DrawPointMapTool';
import baiduConvert from './baiduConvert.jsx';

// 引入应急监测图表
import EmerMonitor from './monitorPoint/emerMonitor.jsx';
import EmerTop from './top/emerTop.jsx';
import EmerTopInWar from './top/emerTopInWar.jsx';
import EmerRightNav from './navigation/emerRightNav.jsx';
import EmerRightNavInWar from './navigation/emerRightNavInWar.jsx';
import EmerLayerManagement from './emerLayerManagement.jsx';
import EmerEvent from './emerEvent/emerEvent.jsx';
import AemerHandleProcess from './handleProcess/aemerHandleProcess.jsx';
import EmerEventAdd from './emerEvent/emerEventAdd.jsx';
import EmerEventListDg from './emerEvent/emerEventListDg.jsx';
import EmerPlanList from './emerPlan/emerPlanList.jsx';
import EmerOrder from './emerOrder.jsx';
import SquibAnalysis from './controllPlan/squibAnalysis.jsx';
import ControllPlan from './controllPlan/ControllPlan.jsx';
import EmerCarDispatch from './resources/emerCarDispatch.jsx';
import EmerGoodsDispatch from './resources/emerGoodsDispatch.jsx';
import EmerStopOrder from './emerEvent/emerStopOrder.jsx';
import EmerReport from './emerReport.jsx';
import EmerReportDg from './emerReportDg.jsx';
import EmerRecoverGasSupply from './emerRecoverGasSupply.jsx';
import Resources from './resources/Resources.js';
import EmerReportW from './emerEvent/emerReportW';

// 加载图层数据
import gasSourceList from './data/gasSource.js';
import emerMaterialPointList from './data/emerMaterialPoint.js';
import emerUserList from './data/emerUser.js';
import emerEventList from './data/emerEvent.js';
import carList from './data/car.js';
import monitorPointList from './data/monitorPoints.js';

import EmerLeftPanel from './leftPlane/leftPanel.js';
import EmerMonitorPoint from './monitorPoint/emerMonitorPoint.jsx';
import EmerEventDisplayInMap from './leftPlane/emerEventDisplayInMap.jsx';

// 应急专家名单
import EmerExpertName from './emerExpert.jsx';
import { getEcodePattern } from './../../utils/conf';

@connect(state => ({
  user: state.login.user, // 登录用户
  map: state.emerLfMap.map, // 地图
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
  flowPattern: state.emerLfMap.flowPattern, // 流程模式配置
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  currentClickEvent: state.emerLfMap.currentClickEvent, // 事件列表所点击的事件
  isEmerStatus: state.emerLfMap.isEmerStatus, //  应急/平时状态
  isShowEmerWarn: state.emerLfMap.isShowEmerWarn, // 是否展示应急提醒(平时-右下)
  isShowEmerRep: state.emerLfMap.isShowEmerRep, // 是否展示上报提醒(平时-右下)
  isShowRightNavigation: state.emerLfMap.isShowRightNavigation, // 是否展示右侧导航栏(右)
  isShowGoodsDispatch: state.emerLfMap.isShowGoodsDispatch, // 是否展示物资调度(弹窗)
  isShowEmerEventAdd: state.emerLfMap.isShowEmerEventAdd, // 是否展示接警(弹窗)
  isShowEmerEventList: state.emerLfMap.isShowEmerEventList, // 是否展示应急事件列表(弹窗)
  isShowEmerEventPlan: state.emerLfMap.isShowEmerEventPlan, // 是否展示应急预案(弹窗)
  isShowEmerOrder: state.emerLfMap.isShowEmerOrder, // 是否展示应急指令(弹窗)
  isShowEmerReport: state.emerLfMap.isShowEmerReport, // 是否展示应急报告(弹窗)
  isShowEmerExpert: state.emerLfMap.isShowEmerExpert, // 是否展示应急专家(弹窗)
  isShowEmerStop: state.emerLfMap.isShowEmerStop, // 是否展示应急终止(弹窗)
  isShowRecoverGasSupply: state.emerLfMap.isShowRecoverGasSupply, // 是否展示恢复供气(弹窗)
}))

export default class LfMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerMonitorDatas: [], // 所有检测点数据
      emerCurrentMonitorId: '', // 当前检测点id
      emerEventRepData: {}, // 险情报告提示数据
    };
    this.carTimer = null;
    this.carEmerTimer = null;
    message.config({
      duration: 2,
    });
  }

  componentWillMount() {
    // 获取不同模式下组件配置（emerEcodecfg.json）
    getEcodePattern(this.props.user.ecode).then((ecodePattern) => {
      this.changeStatus({ecodePattern});
    });
    this.props.dispatch({
      type: 'emerLfMap/getEmerModeConf',
      payload: {},
    });
  }

  componentDidMount() {
    this.getUsers();
    this.getEmerTemplate('org-template');
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 获取应急模块配置的模版-应急组织机构批量导入模版
  getEmerTemplate = (templateName) => {
    const params = {
      ecode: this.props.user.ecode,
      templateName: templateName,
    };
    this.props.dispatch({
      type: 'emerLfMap/getEmerTemplateConf',
      payload: params,
    });
  }

  // 查询组织人员
  getUsers = (eventXY = {}) => {
    const params = {
      groupid: 0,
      date: new Date(),
    };
    if (eventXY.x && eventXY.y) {
      Object.assign(params, {eventX: eventXY.x, eventY: eventXY.y});
    }
    this.props.dispatch({
      type: 'emerLfMap/getUsers',
      payload: params,
    });
  };

  // 展示右侧导航栏
  showOrHideRightNavigation = () => {
    this.props.dispatch({
      type: 'emerLfMap/setFlag',
      payload: {
        isShowRightNavigation: !this.props.isShowRightNavigation,
      },
    });
  };

  // 设置全局的启动应急的事件
  handleSetGlobalEmerEvent = (emerEvent) => {
    this.props.dispatch({
      type: 'emerLfMap/changeCurrentEmerEvent',
      payload: emerEvent,
    });
  }

  // 弹出/关闭爆管分析窗口
  handleOpenSquibAnalysis = (op) => {
    if (op === 'open') {
      this.setState({
        squibAnalysis: true,
      });
    } else {
      this.setState({
        squibAnalysis: false,
      });
    }
  }

  // 弹出/关闭窗口
  openOrCloseDialog = (field, flag) => {
    this.setState({
      [field]: flag,
    });
  };

  // 显示或隐藏弹窗
  changeStatus = (fieldFlag) => {
    this.props.dispatch({
      type: 'emerLfMap/setFlag',
      payload: fieldFlag,
    });
  };

  // 发送停气通知
  handleSendStopGasNotice = (mobile, content) => {
    let times = new Date().getTime();
    let md5Code = MD5(`${mobile}AlL96h1tbgb/9r0jLOmdFjdg1F+YmTjetJ7H3YYuing=${times}`);
    let payload = new FormData();
    payload.append('mobile', mobile);
    payload.append('content', content);
    payload.append('smsType', 1);
    payload.append('appkey', '1482275021');
    payload.append('ct', times);
    payload.append('code', md5Code);
    this.props.dispatch({
      type: 'emerLfMap/send',
      payload,
      callback: (res) => {
        this.handleotherNotice();
      },
    });
  };

  handleotherNotice() {
    this.props.dispatch({
      type: 'emer/sendStopGasNotice',
      payload: {
        alarmId: this.props.currentClickEvent.alarmId,
        handlerId: this.props.user.gid,
        handler: this.props.user.trueName,
      },
      callback: (res) => {
        console.log('123');
      },
    });
  }

  // 应急启动
  handleOpenEmerStart = () => {
    message.info('应急启动成功');
    // 应急启动成功后，切换应急状态
    this.changeStatus({
      isEmerStatus: true,
      isShowEmerWarn: false,
    });
  };

  // 应急终止通知发送完毕，退出应急状态
  handleAbortEmer = () => {
    // 切换应急状态,
    this.changeStatus({
      isEmerStatus: false,
    });
    // 清除图层
    this.props.map.getMapDisplay().removeGraphic(`${this.props.currentEmerEvent.gid}`, 'currentEmerEvent');
    this.removeLayers();
    // 清除全局的应急事件
    this.changeStatus({
      currentEmerEvent: null,
    });
  };

  removeLayers = () => {
    this.props.map.getMapDisplay().removeLayer('valves');
    this.props.map.getMapDisplay().removeLayer('users');
    this.props.map.getMapDisplay().removeLayer('closearea');
    this.props.map.getMapDisplay().removeLayer('closeLines');
    this.props.map.getMapDisplay().removeLayer('emerUser');
    this.props.map.getMapDisplay().removeLayer('emerUser_name');
    this.props.map.getMapDisplay().removeLayer('emerUser_dispatch');
    this.props.map.getMapDisplay().removeLayer('emerUser_call');
    this.props.map.getMapDisplay().removeLayer('emerUser_radio');
    this.props.map.getMapDisplay().removeLayer('car');
    this.props.map.getMapDisplay().removeLayer('car_name');
    this.props.map.getMapDisplay().removeLayer('car_dispatch');
    this.props.map.getMapDisplay().removeLayer('car_call');
    this.props.map.getMapDisplay().removeLayer('car_radio');
    this.props.map.getMapDisplay().removeLayer('theDrillEmerUser');
    this.props.map.getMapDisplay().removeLayer('controllArea');
  };

  // 地图加载完毕:加载图层
  handleCreateLayer = (arcGISMap) => {
    const { ecodePattern } = this.props;
    this.props.dispatch({
      type: 'emerLfMap/setMap',
      payload: arcGISMap,
    });
    // 默认定位到地图中心
    this.props.map.centerAt(ecodePattern.index.location);
    // 缩放到地图默认大小
    this.props.map.zoomOut();
    // 气源点
    this.initEmerLayer(gasSourceList, 'gasSource');
    // 应急物资点
    this.initEmerLayer(emerMaterialPointList, 'emerMaterialPoint');
    // 应急事件
    this.initEmerLayer(emerEventList, 'emerEvent');
    // 监测点
    this.initEmerLayer(monitorPointList, 'monitorPoint');
  };

  getCarLastPosition = (Vehicles = []) => {
    let that = this;
    this.props.dispatch({
      type: 'emerLfMap/getcarlastposition',
      payload: {
        carnames: '冀RA5H08,冀RRL975',
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        if (this.props.currentEmerEvent && !!this.props.currentEmerEvent.isDrill) {
          res.data.splice(0, 0, carList.data[0]);
        }
        for (let i = 0; i < res.data.length; i += 1) {
          if (Vehicles.indexOf(res.data[i].Vehicle) === -1) {
            let data = res.data[i];
            data.x = data.Lat;
            data.y = data.Lon;
            data.gid = data.VehicleID;
            this.showOneElement(data, 'car');
            if (this.props.currentEmerEvent) {
              this.getBaiduWay([data, this.props.currentEmerEvent], (dis, dur) => {
                res.data[i].distance = `${dis}米`;
                res.data[i].duration = this.secondToTime(dur);
              });
            }
          }
        }
      },
    });
  };

  getMonitorLastPosition = () => {
    let that = this;
    this.props.dispatch({
      type: 'emer/getDetectionMessage',
      payload: {
        ecode: this.props.user.ecode,
        eventId: this.props.currentEmerEvent.alarmId,
      },
      callback: (res) => {
        this.setState({
          emerMonitorDatas: res.data,
        });
        for (let i = 0; i < res.data.length; i += 1) {
          this.showOneElement(res.data[i], 'monitorPoint');
        }
      },
    });
  };

  getEmerCarLastPosition = (Vehicles = []) => {
    let that = this;
    this.props.dispatch({
      type: 'emerLfMap/getcarlastposition',
      payload: {
        carnames: Vehicles.join(),
      },
      callback: (res) => {
        for (let i = 0; i < res.data.length; i += 1) {
          let data = res.data[i];
          data.x = data.Lat;
          data.y = data.Lon;
          data.gid = data.VehicleID;
          this.showEmerElement(data, 'car');
        }
      },
    });
  };

  getUserLastPosition = (userids = []) => {
    let that = this;
    this.props.dispatch({
      type: 'emerLfMap/getManyUserPosition',
      payload: {
        userIds: '26,64',
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        if (this.props.currentEmerEvent && this.props.currentEmerEvent.isDrill) {
          res.data.splice(0, 0, emerUserList.data[0]);
        }
        for (let i = 0; i < res.data.length; i += 1) {
          if (userids.indexOf(res.data[i].userid) === -1) {
            let data = res.data[i];
            data.x = data.lon;
            data.y = data.lat;
            data.gid = data.userid;
            this.showOneElement(data, 'emerUser');
            if (this.props.currentEmerEvent) {
              this.getBaiduWay([data, this.props.currentEmerEvent], (dis, dur) => {
                res.data[i].distance = `${dis}米`;
                res.data[i].duration = this.secondToTime(dur);
              });
            }
          }
        }
      },
    });
  };

  getEmerUserLastPosition = (userids = []) => {
    let that = this;
    this.props.dispatch({
      type: 'emerLfMap/getManyUserCurrentPosition',
      payload: {
        userIds: userids.join(),
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        for (let i = 0; i < res.data.length; i++) {
          let data = res.data[i];
          data.x = data.lon;
          data.y = data.lat;
          data.gid = data.userid;
          this.showEmerElement(data, 'emerUser');
        }
      },
    });
  };

  // 应急状态下获取人员车辆到应急点的距离
  getBaiduWay = (navigation, callback) => {
    let that = this;
    that.geomToName(navigation[0], (startPoint) => {
      if (startPoint.result.pois[0].name === []) {
        message.error('起点找不到');
        return;
      }
      that.geomToName(navigation[1], (endPoint) => {
        if (endPoint.result.pois[0].name === []) {
          message.error('终点找不到');
          return;
        }
        let mctGeom0 = baiduConvert.convertLL2MC({x: navigation[0].x, y: navigation[0].y});
        let mctGeom1 = baiduConvert.convertLL2MC({x: navigation[1].x, y: navigation[1].y});
        this.props.dispatch({
          type: 'emerLfMap/getBaiduWay',
          payload: {
            newmap: 1,
            reqflag: 'pcmap',
            biz: 1,
            from: 'webmap',
            da_par: 'direct',
            pcevaname: 'pc4.1',
            qt: 'walk',
            c: 191,
            sn: `1$$$$${mctGeom0.x},${mctGeom0.y}$$${startPoint.result.formatted_address}$$0$$$$`,
            en: `2$$$$$$${endPoint.result.formatted_address}$$1$$廊坊市广阳区$$`,
            sc: 191,
            ec: 191,
            pn: 0,
            rn: 5,
            version: 2.0,
            da_src: 'pcmappg.searchBox.button',
            tn: 'B_NORMAL_MAP',
            nn: 0,
            u_loc: `${mctGeom0.x},${mctGeom0.y}`,
            ie: 'utf-8',
            l: 15,
            b: '(12992500.800907714,4772809.7358547645;13000842.21376702,4778700.564145236)',
            t: '1515725832524',
          },
          callback: (res) => {
            if (!res.content) {
              return;
            }
            if (res.content.dis) {
              callback(res.content.dis, res.content.duration);
            } else {
              callback(res.content.routes[0].legs[0].distance, res.content.routes[0].legs[0].duration);
            }
          },
        });
      });
    });
  };

  // 初始化图层
  initEmerLayer = (layerData, layerId) => {
    let that = this;
    if (layerId === 'car') {
      clearInterval(this.carTimer);
      clearInterval(this.carEmerTimer);
      that.getCarLastPosition();
      that.getUserLastPosition();
      this.carTimer = setInterval(() => {
        that.getCarLastPosition();
        that.getUserLastPosition();
      }, 20000);
      return;
    }
    if (layerId === 'monitorPoint') {
      that.getMonitorLastPosition();
      return;
    }
    for (let i = 0; i < layerData.data.length; i += 1) {
      let p = layerData.data[i];
      this.showOneElement(p, layerId);
    }
  };

  showOneElement = (data, layerId) => {
    let param = {
      id: data.gid,
      layerId,
      src: `./images/emer/layerIcon/${layerId}.png`,
      width: 20,
      height: 20,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: (attr) => this.handleOpenTip(attr.attributes, layerId),
    };
    this.props.map.getMapDisplay().image(param);
  };

  showEmerElement = (data, layerId) => {
    let param = {
      id: data.gid,
      layerId: `${layerId}_emer`,
      src: `./images/emer/layerIcon/${layerId}.png`,
      width: 20,
      height: 20,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: (attr) => this.handleOpenTip(attr.attributes, layerId), // *********gan
    };
    this.props.map.getMapDisplay().image(param);
  };

  carsAndUsersEmer = () => {
    let that = this;
    clearInterval(this.carTimer);
    clearInterval(this.carEmerTimer);
    that.getCarLastPosition(['冀RRL975']);
    that.getUserLastPosition([5]);
    this.carTimer = setInterval(() => {
      that.getCarLastPosition(['冀RRL975']);
      that.getUserLastPosition([5]);
    }, 22000);
    if (this.props.currentEmerEvent.type === 2) {
      let carFakeTimer = null;
      let userFakeTimer = null;
      let emerCar = carList.data[1];
      let emerUser = emerUserList.data[1];
      let carIndex = 0;
      let userIndex = 0;
      this.showEmerElement(emerCar, 'car');
      this.showEmerElement(emerUser, 'emerUser');
      this.props.map.getMapDisplay().removeLayer('car');
      this.props.map.getMapDisplay().removeLayer('emerUser');
      carFakeTimer = setInterval(() => {
        if (carIndex >= emerCar.line.length) {
          clearInterval(carFakeTimer);
          return;
        }
        emerCar.x = emerCar.line[carIndex].x;
        emerCar.y = emerCar.line[carIndex].y;
        carIndex += 1;
        this.showEmerElement(emerCar, 'car');
      }, 5000);
      userFakeTimer = setInterval(() => {
        if (userIndex >= emerUser.line.length) {
          clearInterval(userFakeTimer);
          return;
        }
        emerUser.x = emerUser.line[userIndex].x;
        emerUser.y = emerUser.line[userIndex].y;
        userIndex += 1;
        this.showEmerElement(emerUser, 'emerUser');
      }, 5000);
      return;
    }
    that.getEmerCarLastPosition(['冀RA5H08']);
    that.getEmerUserLastPosition([1]);
    this.props.map.getMapDisplay().removeLayer('car');
    that.carEmerTimer = setInterval(() => {
      that.getEmerCarLastPosition(['冀RA5H08']);
      that.getEmerUserLastPosition([1]);
    }, 5000);
  };

  startNavigation = () => {
    let that = this;
    let navigation = [];
    let index = 0;
    this.props.map.getMapDisplay().removeLayer('navigation');
    const mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      navigation.push(geom);
      let startParams = {
        id: `navigation_${index}`,
        layerId: 'navigation',
        x: geom.x,
        y: geom.y,
      };
      that.props.map.getMapDisplay().point(startParams);
      index += 1;
      if (index === 2) {
        mapTool.destroy();
        that.geomToName(navigation[0], (startPoint) => {
          if (startPoint.result.pois[0].name === []) {
            message.error('起点找不到');
            return;
          }
          that.geomToName(navigation[1], (endPoint) => {
            if (endPoint.result.pois[0].name === []) {
              message.error('终点找不到');
              return;
            }
            let mctGeom = baiduConvert.convertLL2MC({x: navigation[1].x, y: navigation[1].y});
            that.setState({
              IsShowNavigation: true,
            });
            document.getElementById('navigationIframe').src = `http://map.baidu.com/?l=&s=nse%26wd%3D${endPoint.result.formatted_address}%26isSingle%3Dtrue%26t%3D1%26name%3D${startPoint.result.formatted_address}%26ptx%3D${mctGeom.x}%26pty%3D${mctGeom.y}%26poiType%3D0%26sn%3D1%24%24%24%24${mctGeom.x}%2C${mctGeom.x}%24%24${startPoint.result.formatted_address}%24%24%24%24%24%24%26sc%3D191%26ec%3D191&qq-pf-to=pcqq.c2c`;
          });
        });
      }
    });
    this.props.map.switchMapTool(mapTool);
  };

  geomToName = (geom, callback) => {
    this.props.dispatch({
      type: 'emerLfMap/v2',
      payload: {
        location: `${geom.y},${geom.x}`,
        output: 'json',
        pois: 1,
        ak: 'YNHIyHSShx4Q4MBwQLfh2Lb8HUBo9chm',
      },
      callback: (res) => {
        callback(res);
      },
    });
  };

  closeNavigation = () => {
    this.setState({
      IsShowNavigation: false,
    });
  };

  showVista = () => {
    let that = this;
    const mapTool2 = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      let mctGeom = baiduConvert.convertLL2MC({x: geom.x, y: geom.y});
      that.getVistaPid(mctGeom, (res) => {
        that.setState({
          IsShowVista: true,
        });
        mapTool2.destroy();
        let pid = res.content.id;
        document.getElementById('vistaIframe').src = `http://map.baidu.com/#panoid=${pid}&panotype=street&heading=348.6&pitch=0&l=12&tn=B_NORMAL_MAP&sc=0&newmap=1&shareurl=1&pid=${pid}`;
      });
    });
    this.props.map.switchMapTool(mapTool2);
  };

  getVistaPid = (mkcGeom, callback) => {
    this.props.dispatch({
      type: 'emerLfMap/baiduVista',
      payload: {
        udt: '20171214',
        qt: 'qsdata',
        x: mkcGeom.x,
        y: mkcGeom.y,
        l: 16.168349978559057,
        action: 0,
        mode: 'day',
        t: 1513316473014,
      },
      callback: (res) => {
        if (res.result.error === 404) {
          message.error('未选中街道');
          return;
        }
        callback(res);
      },
    });
  };

  closeVista = () => {
    this.setState({
      IsShowVista: false,
    });
    document.getElementById('vistaIframe').src = '';
  };

  // 点击地图标注弹出信息窗口
  handleOpenTip = (record, layerId) => {
    let info = {};
    switch (layerId) {
      case 'gasSource': // 气源点gasSourceList
        info = {
          title: '气源点信息',
          content: [{
            name: '编号', value: record.gid,
          }, {
            name: '名称', value: record.name,
          }, {
            name: '输入压力', value: record.ImpPressure,
          }, {
            name: '输出压力', value: record.ExpPressure,
          }],
        };
        break;
      case 'emerMaterialPoint': // 应急物资点emerMaterialPointList
        info = {
          title: '应急物资点信息',
          content: [{
            name: '编号', value: record.gid,
          }, {
            name: '名称', value: record.name,
          }, {
            name: '单位', value: record.ownerUnit,
          }, {
            name: '负责人', value: record.manager,
          }, {
            name: '电话号码', value: record.managerTel,
          }, {
            name: '地址', value: record.address,
          }],
        };
        break;
      case 'emerUser': // 应急人员emerUserList
        info = {
          title: '应急人员',
          content: [{
            name: '编号', value: record.userid,
          }, {
            name: '姓名', value: record.truename,
          }, {
            name: '电话', value: record.phone,
          }, {
            name: '速度', value: record.speed,
          }, {
            name: '电量', value: record.battery,
          }, {
            name: '时间', value: record.time,
          }],
        };
        break;
      case 'emerEvent': // 应急事件emerEventList
        info = {
          title: '应急事件',
          content: [{
            name: '编号', value: record.gid,
          }, {
            name: '事件说明', value: record.name,
          }],
        };
        break;
      case 'car': // 应急车辆carList
        info = {
          title: '应急车辆',
          content: [{
            name: '车牌号', value: record.Vehicle,
          }, {
            name: '纬度', value: record.Lat,
          }, {
            name: '经度', value: record.Lon,
          }, {
            name: '所在区', value: record.District,
          }, {
            name: '所在路段', value: record.RoadName,
          }, {
            name: '更新时间', value: record.GPSTime,
          }],
        };
        break;
      case 'monitorPoint': // 监测点monitorPointList
        let currentDatas = [...this.state.emerMonitorDatas].filter((data, i) => {
          return data.name === record.name;
        }).map((v, i) => {
          return {name: v.itemText, value: v.itemValue + v.unit};
        });
        info = {
          title: '监测点',
          content: [{
          name: '监测点名称', value: record.name,
          }, ...currentDatas],
        };
        this.setState({
          emerCurrentMonitorId: record.deviceId,
        });
        break;
      default:
        break;
    }
    let param = {
      x: record.x,
      y: record.y,
      onCloseHandle: (op) => this.changeStatus({'isShowEmerOrder': false}),
      info,
    };
    this.props.map.popup(param);
  }

  // 关闭应急提醒弹框
  openEmerWarning = () => {
    this.props.dispatch({
      type: 'emerLfMap/setFlag',
      payload: {
        isShowEmerWarn: false,
      },
    });
  }

  // 关闭上报提醒弹框
  openEmerRep = () => {
    this.props.dispatch({
      type: 'emerLfMap/setFlag',
      payload: {
        isShowEmerRep: false,
      },
    });
  }

  // 返回应急平时状态
  handleGoEmerInNormal = () => {
    // 切换应急状态
    this.changeStatus({
      isEmerStatus: false,
      isShowEmerWarn: false,
      currentEmerEvent: null,
    });
  }

  // 返回应急战时状态
  handleGoEmer = (event) => {
    if (event) {
      this.props.map.centerAt({
        x: event.x,
        y: event.y,
      });
      this.props.dispatch({
        type: 'emerLfMap/changeCurrentEmerEvent',
        payload: event,
        callback: () => {
          // 切换应急状态
          if (event.type) {
            this.changeStatus({
              isEmerStatus: true,
            });
            this.changeStatus({isShowEmerEventList: false}); // 关闭应急事件列表
            this.props.dispatch({
              type: 'emerLfMap/setFlag',
              payload: {
                isShowEmerWarn: false,
              },
            });
          }
        },
      });
    }
  }

  render = () => {
    console.log(this.props.isShowEmerRep, 'isShowEmerRep');
    let that = this;
    if (this.props.ecodePattern && this.props.flowPattern) {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1000,
          overflow: 'hidden',
        }}
        >
          <EcityMap
            mapId="emer"
            style={{width: '100%', height: '100%', position: 'relative'}}
            onMapLoad={this.handleCreateLayer}
            mapType={this.props.ecodePattern.index.mapcfgkey}
          />
          {/* 顶部组件 */}
          {this.props.map ? (!this.props.isEmerStatus ?
            <EmerTop
              handleShowRightNav={this.showOrHideRightNavigation}
            /> :
            <EmerTopInWar
              handleShowRightNav={this.showOrHideRightNavigation}
              handleGoEmerInNormal={this.handleGoEmerInNormal}
            />) : null
          }
          {/* 应急专家名单 */}
          {
            this.props.isShowEmerExpert ?
              <EmerExpertName
                onCancel={() => this.changeStatus({'isShowEmerExpert': false})}
              /> : ''
          }
          {/* 右侧导航组件 */}
          {
            !this.props.isEmerStatus ? (this.props.isShowRightNavigation ? <EmerRightNav
              changeStatus={this.changeStatus}
              navigation={this.startNavigation}
              vista={this.showVista}
            /> : null) :
              (this.props.isShowRightNavigation ? <EmerRightNavInWar
                changeStatus={this.changeStatus}
                openSquibAnalysis={() => this.openOrCloseDialog('isShowSquibAnalysis', true)}
              /> : null)
          }
          {/* 接警 */}
          {
            this.props.isShowEmerEventAdd ?
              <EmerEventAdd
                getBaiduWay={this.getBaiduWay}
                getEmerRep={(emerEventRepData) => {
                  this.setState({emerEventRepData})
                }}
                onCancel={() => this.changeStatus({'isShowEmerEventAdd': false})}
                getSceneController={(eventXY) => this.getUsers(eventXY)}
                openEmerRep={this.openEmerRep}
                changeStatus={() => this.changeStatus({isShowEmerRep: true})}
              /> : ''
          }
          {/* 应急指令 */}
          {
            this.props.isShowEmerOrder ?
              <EmerOrder
                onCancel={(op) => this.changeStatus({'isShowEmerOrder': false})}
                handleOpenSquibAnalysis={() => this.openOrCloseDialog('isShowSquibAnalysis', false)}
              /> : ''
          }
          {/* 控制方案 */}
          {
            this.props.isEmerStatus && this.props.map ?
              <ControllPlan
                currentEmerEvent={this.props.currentEmerEvent || this.props.currentClickEvent}
                handleSendStopGasNotice={this.handleSendStopGasNotice}
                geomToName={this.geomToName}
                details={(op) => this.changeStatus({'isShowControllPlan': true})}
                onCancel={() => this.changeStatus({'isShowControllPlan': false})}
              /> : ''
          }
          {/* 右侧导航：应急事件 */}
          {
            this.props.map ? 
              (<EmerEventListDg
                onCancel={(op) => this.changeStatus({'isShowEmerEventList': false})}
                openEmerReport={(op) => this.changeStatus({'isShowEmerReport': true})}
                handleSendStopGasNotice={this.handleSendStopGasNotice}
                handleGoEmer={this.handleGoEmer}
                emerEventListOpen={this.props.isShowEmerEventList}
                openEmerWarning={this.openEmerWarning}
                details={() => this.changeStatus({'isShowControllPlan': true})}
                changeStatus={this.changeStatus}
                removeLayers={this.removeLayers}
              />) : ''
          }
          {/* 右侧导航：应急预案 */}
          {
            this.props.isShowEmerEventPlan ?
              <EmerPlanList
                onCancel={() => this.changeStatus({'isShowEmerEventPlan': false})}
              /> : ''
          }
          {/* 资源准备情况 */}
          {
            this.props.map && this.props.isEmerStatus ? <div style={{position: 'absolute', top: 50, left: 10, height: '36%'}}>
              <Resources map={this.props.map} isWar={this.props.isEmerStatus} />
            </div> : null
          }
          {/* 表格展示监测点数据 */}
          {
            this.props.isEmerStatus && this.props.ecodePattern.emerMonitor.isHasMonitor ? <div style={{position: 'absolute', top: 'calc(36% + 53px)', left: 10, width: 380}}>
              <EmerMonitorPoint />
            </div> : null
          }
          {/* 日常模式地图展示应急事件 */}
          {
            !this.props.isEmerStatus && this.props.map ? 
            <EmerEventDisplayInMap
              handleEmerStart={this.handleOpenEmerStart}
              onCancel={this.openEmerWarning}
              handleGoEmer={this.handleGoEmer}
            /> : null
          }
          {/* 图层管理 */}
          {
            !this.props.isEmerStatus && this.props.map ? <EmerLayerManagement /> : null
          }
          {/* 应急统计/应急监测 */}
          {
            !this.props.isEmerStatus && this.props.map && this.props.ecodePattern.emerMonitor.isHasMonitor ? <EmerMonitor
              emerMonitorDatas={this.state.emerMonitorDatas}
              emerCurrentMonitorId={this.state.emerCurrentMonitorId}
            /> : null
          }
          {/* 应急事件 */}
          {
            !this.props.isEmerStatus ? <EmerEvent /> : <AemerHandleProcess />
          }
          {/* 物资调度 */}
          {
            this.props.isShowGoodsDispatch ?
              <EmerGoodsDispatch
                onCancel={(op) => this.changeStatus({'isShowGoodsDispatch': false})}
                getSceneController={(eventXY) => this.getUsers(eventXY)}
              /> : ''
          }
          {/* 应急终止 */}
          {
            this.props.isShowEmerStop ? <EmerStopOrder
              onCancel={() => this.changeStatus({'isShowEmerStop': false})}
              handleAbortEmer={this.handleAbortEmer}
            /> : ''
          }
          {/*  导航弹出框 */}
          <Modal
            title="导航"
            visible={this.state.IsShowNavigation}
            width="1040px"
            footer={null}
            mask={false}
            maskClosable={false}
            onCancel={this.closeNavigation}
          >
            <iframe id="navigationIframe" name="navigationIframe" width="1000px" height="450px"/>
          </Modal>
          {/* 街景弹出框 */}
          <Modal
            title="街景"
            visible={this.state.IsShowVista}
            width="1040px"
            footer={null}
            mask={false}
            maskClosable={false}
            onCancel={this.closeVista}
          >
            <iframe id="vistaIframe" name="vistaIframe" width="1000px" height="450px" />
          </Modal>
          {/* 生成应急报告 */}
          {
            this.props.isShowEmerReport ? (this.props.ecodePattern.mode === '1' ? <EmerReportDg
              onCancel={() => this.changeStatus({'isShowEmerReport': false})}
              emerEvent={this.props.currentEmerEvent || this.props.currentClickEvent}
              goControll={() => this.changeStatus({'isShowControllPlan': true})}
              changeStatus={this.changeStatus}
              handleGoEmer={this.handleGoEmer}
            /> : <EmerReport
              onCancel={() => this.changeStatus({'isShowEmerReport': false})}
              emerEvent={this.props.currentEmerEvent || this.props.currentClickEvent}
              goControll={() => this.changeStatus({'isShowControllPlan': true})}
              changeStatus={this.changeStatus}
              handleGoEmer={this.handleGoEmer}
            />) : ''
          }
          {/* 恢复供气 */}
          {
            this.props.isShowRecoverGasSupply ? <EmerRecoverGasSupply
              onCancel={(op) => this.changeStatus({'isShowRecoverGasSupply': false})}
            /> : ''
          }
          {/* 上报提示 */}
          {
            this.props.isShowEmerRep ? <EmerReportW
              emerEvent={this.state.emerEventRepData}
              onCancel={() => this.changeStatus({'isShowEmerRep': false})}
              openReport={() => this.changeStatus({'isShowEmerEventList': true})}
            /> : ''
          }
        </div>
      );
    } else {
      return '';
    }
  }
}

