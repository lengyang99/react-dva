import React from 'react';
import styles from './index.less';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, DatePicker, TreeSelect, message, Icon, InputNumber, Table, Popconfirm, Tooltip, Spin } from 'antd';
import moment from 'moment';
import utils, { getCurrTk }  from '../../../utils/utils';
import fetch from 'dva/fetch';
import _ from 'lodash';
import EcityMap from '../../../components/Map/EcityMap';
import { DrawRectangleMapTool } from '../../../components/Map/common/maptool/DrawRectangleMapTool';
import { DrawPolygonMapTool } from '../../../components/Map/common/maptool/DrawPolygonMapTool';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import PipeSelect from './PipeSelect';
import EqSelect from './EqSelect';
import PlanRoutine from './planRoutine';


const RadioGroup = Radio.Group;
const FormItem = Form.Item
const createForm = Form.create;
const CheckboxGroup = Checkbox.Group;
const RangePicker = DatePicker.RangePicker;

import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import appEvent from '../../../utils/eventBus';

const keyPointId = 5;

//巡视方式
let patrolMethods = [];

@connect(state => ({
  user: state.login.user,
  areaData: state.patrolPlanList.areaData,
  usernamesData: state.patrolPlanList.usernamesData,
  patrolCycle: state.patrolPlanList.patrolCycle,
  walkWay: state.patrolPlanList.walkWay,
}))

export default class planTemplate extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    this.map = null; // 类ArcGISMap的实例
    this.keydownEvent = null;
    this.extraKeyPointIndex = 0;
    this.state = {
      hasName: false,
      layersData: [],
      loading: false,
      name: '', // 计划名称
      areaid: '', // 区域ID
      layerids: [], // 巡检对象ids
      oldLayerids: [], //原勾选值
      layerName: [],
      userids: [], // 巡检员ids
      subUserids: '',      //提交的巡检员id
      usernames: [], // 巡检员
      speedid: '', // 行走方式id
      stationid: '', // 站点id
      station: '', // 站点
      cycleid: '', // 巡检周期
      cycleName: '', // 巡检周期（‘日’...）
      frequency: 1, //频率
      startTime: moment().add({days: 1}), // 开始时间
      sTime: '', // 开始时间
      eTime: '', // 结束时间
      extraPoints: [], // 临时添加的关键点
      patrolEqData: [],  //设备对象数据
      feedbackData: [],  //反馈项名称
      isShowPatrol: false,
      isShowDetail: false,
      isschedule: '1',
      isShowTempPatrol: false,
      patrolMethod: '3',
      pageno: 1,
      pagesize: 10,
      areaPoints: [], //所选区域
      gdFilter: [], //管道筛选条件
      pipeData: [],  //管道数据
      pipelength: 0,  //管道长度
      areaPolygon: [], //任意区域坐标数据
      eqFilter: [], //设备筛选条件
      eqData: [],  //设备数据
      eqlength: 0,
      pipeDocts: [], //管段坐标
      eqList: [], //设备的layerid;
      eqMetadata: {}, //管段的layerid;
      layeridAll: [],
      pointSubmit: [],
      pipeSubmit: [],
      eqSubmit: {},
      eqDataA: {}, //设备数据集合
      sLoading: false,
      selectedRowKeys: [], //关键点勾选的数据
      routineMapShow: [], //常规计划地图展示的数据
      routineShow: [], //常规计划方框展示的数据
      isShowRoutine: false,
      isVisible:true,// 行走方式是否显示
    };

    this.planValidate = {
      name: {validate: true, message: '计划名称为空'}, // 模板名称
      areaid: {validate: true, message: '区域名称为空'}, // 区域id
      layerids: {validate: true, message: '巡检对象为空'}, // 巡检对象id
      userids: {validate: true, message: '巡检员为空'}, // 巡检员id
      cycleid: {validate: true, message: '巡检周期为空'}, // 巡检周期
      // speedid: {validate: true, message: '行走方式为空'}, // 行走方式
      frequency: {validate: true, message: '巡检频率为空'}, // 巡检频率为空
    };

    this.taskValidate = {
      name: {validate: true, message: '计划名称为空'}, // 模板名称
      areaid: {validate: true, message: '区域名称为空'}, // 区域id
      // layerids: {validate: true, message: '巡检对象为空'}, // 巡检对象id
      userids: {validate: true, message: '巡检员为空'}, // 巡检员id
      sTime: {validate: true, message: '开始时间为空'}, // 开始时间
      eTime: {validate: true, message: '结束时间为空'}, // 结束时间
      // speedid: {validate: true, message: '行走方式为空'}, // 行走方式
    };
  }

  componentDidMount = () => {
    this.areaDataDictionary();
    // this.getLayerDataDictionary();
    this.getUsernamesDataDictionary();
    if (this._tool.type === 1) {
      this.setState({
        cycleid: '4',
        cycleName: '日'
      });
      this.props.dispatch({
        type: 'patrolPlanList/querypatrolCycle',
      })
    }

    const {walkWay}=this.props;
    if(walkWay&&walkWay.length>0){
      if(walkWay.length === 1 && walkWay[0].name.includes('车巡')){
        this.setState({
          speedid: walkWay[0].gid,
          isVisible:false,
        });
      }else{
        this.setState({
          speedid: walkWay[0].gid,
        });
      }
    }else {
      this.setState({
        speedid: '-1',
        isVisible:false,
      });
    }
  };

  componentWillUnmount = () => {
    if(this.keydownEvent){
      window.removeEventListener('keydown',this.keydownEvent);
    }
  };

  // 巡检周期改变,是否排班
  cycleChange = (value, fileName, node) => {
    if(value===undefined){
      this.setState({
        [fileName]: '',
      });
    }else{
      this.setState({
        [fileName]: value,
      });
    }

    switch (value) {
      case '年':
        this.setState({startTime: moment().add({years: 1})});
        break;
      case '季':
        this.setState({startTime: moment().add({months: 3})});
        break;
      case '月':
        this.setState({startTime: moment().add({months: 1})});
        break;
      case '周':
        this.setState({startTime: moment().add({weeks: 1})});
        break;
      case '日':
        this.setState({startTime: moment().add({days: 1})});
        break;
      default:
        this.setState({startTime: moment()});
        break;
    }
  };
  // 开始时间
  startTimeChange = (value, fileName) => {
    this.setState({
      [fileName]: value,
    });
  };

  // 巡检员改变
  onPatrolorChange = (value, label, object) => {
    let checknode = object.allCheckedNodes;
    let userid = [];
    this.getSelectPersonData(checknode, userid);
    this.setState({
      userids: value,
      usernames: label,
      subUserids: userid.toString()
    });
  };

  getSelectPersonData = (checknode, userid) => {
    for (let i = 0; i < checknode.length; i++) {
      if (checknode[i].node && checknode[i].node.key.indexOf('s') < 0) {
        userid.push(checknode[i].node.props.attribute.userid);
      }else if(!checknode[i].node  && checknode[i].key.indexOf('s') < 0){
        userid.push(checknode[i].props.attribute.userid);
      }
      if (checknode[i].children && checknode[i].children.length > 0) {
        this.getSelectPersonData(checknode[i].children, userid);
      }
    }
  }

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
    if (value.target.value === '') {
      this.setState({
        hasName: false,
      });
    } else {
      this.setState({
        hasName: true,
      });
    }
  };

  // 任务开始时间改变
  taskTimeChange = (value) => {
    this.setState({
      sTime: value[0].format('YYYY-MM-DD HH:mm:ss'),
      eTime: value[1].format('YYYY-MM-DD HH:mm:ss'),
    });
  };

  // 展示点
  showPoint = (taskPoints) => {
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
        layerId: `layeridPoint`,
        layerIndex: 10,
        attr: taskPoints[i],
        markersize: 8,
        linecolor: [255, 0, 0],
        fillcolor: [135, 206, 235],
        x: position.x,
        y: position.y,
        click: function (point) {
          let eqptcode = ''
          if(point.attributes.attributes){
            eqptcode = point.attributes.attributes.eqptcode ? point.attributes.attributes.eqptcode : point.attributes.attributes.eqptCode
          }else{
            eqptcode = point.attributes.eqptcode ? point.attributes.eqptcode : point.attributes.eqptCode
          }
          that.map.popup({
            x: point.geometry.x,
            y: point.geometry.y,
            info: {
              title: point.attributes.gid,
              content: [
                {name: '编号', value: eqptcode},
                // {name: '图层名称', value: point.attributes.dno},
                // {name: 'Gis编号', value: point.attributes.编号},
                {name: '状态', value: point.attributes.isArrive === 1 ? '已到位' : '未到位'},
              ]
            },
          });
        }
      };
      that.map.getMapDisplay().point(param);
    }
  };

  // 展示面
  showArea = (areaPolygon) => {
    if (!areaPolygon) {
      return;
    }
    const paramArea = {
      id: 'paramArea1',
      layerId: 'testlayer1',
      dots: JSON.parse(areaPolygon),
    };
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
  }

  // 展示线
  showPath = (pathPolygon, ids) => {
    if (!pathPolygon) {
      return;
    }
    // let lines = JSON.parse(pathPolygon);
    let lines = pathPolygon;
    const paramLine = {
      id: `paramLine_${ids}`,
      layerId: 'testlayer2',
      width: 5,
      layerIndex: 10,
      dots: lines,
    };
    this.map.getMapDisplay().polyline(paramLine);
  }

  //全区查询
  areaSelect = (val, layerid, filter, id) => {
    const areaPoint = [];
    const that = this;
    this.state.areaPoints.length > 0 &&  this.state.areaPoints.map(item => {
      areaPoint.push([item.x, item.y])
    })
    this.map.getMapDisplay().removeLayer('add_regional_layer_point_edit');
    if(val === 'pipe'){
      // const where = this.pipe.handokParams() + ' ' +'and'+ ' ' + 'pressurerating' + '=' + "'低'"
      const where = this.pipe.handokParams()
      const params = {
        geometry: JSON.stringify({
          rings: areaPoint,
          spatialReference: {wkid: 3857},
          type: 'polygon'
        }),
        pageno: 1,
        pagesize: 5000,
        withCount: true,
        returnGeometry:'true',
        outFields: 'gid,stnod,ednod,eqptcode,pipelength,pressurerating,pipematerial,pipediam',
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        where: `(${where})`,
        ecode: this.props.user.ecode,
      }
      this.setState({sLoading: true})
      this.props.dispatch({
        type: 'patrolPlanList/querypipeData',
        layerid: this.state.eqMetadata.id,
        payload: params,
        callback: (res) => {
          if(res.error || res.success === false){
            message.error('数据查询失败！')
            this.setState({
              sLoading: false,
            })
            return
          }
          let pipeDocts = [];
          this.setState({sLoading: false})
          that.map.getMapDisplay().removeLayer('testlayer2');
        if(res && res.features && res.features.length > 0){
          if(res.count > 5000){
            message.info("区域内数据太多，只展示前5000条数据，请手动框选较小区域查询！", 10)
          }
          for(let i = 0; i < res.features.length; i++){
            let paths = res.features[i].geometry.paths[0];
            if(paths.length >= 2){
              for(let j = 0; j < paths.length - 1; j++){
                let docts = [
                  {x: paths[j][0], y: paths[j][1]},
                  {x: paths[j+1][0], y: paths[j + 1][1]},
                ];
                const id = res.features[i].attributes.gid
                pipeDocts.push({doct: docts, id: id})
                this.showPath(docts, id + '_' + j)

              }
            }
          }
        }
          this.setState({
            pipeData: res.features || [],
            pipeDocts
          })
        }
      });
    }else if(val === 'eq'){
      let eqwhere = this.eq.handokParams();
      const where1 = this.eq.handokParams();
      if(filter){
        const filterArr = JSON.parse(filter);
        const where2 = filterArr[0] + " " + filterArr[1] + " " + filterArr[2];
        eqwhere = where1 + " " + "and" + " " + where2
      }
      const params1 = {
        geometry: JSON.stringify({
          rings: areaPoint,
          spatialReference: {wkid: 3857},
          type: 'polygon'
        }),
        returnGeometry:'true',
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        where: `(${eqwhere})`,
        ecode: this.props.user.ecode,
      }
      this.setState({sLoading: true,})
      this.props.dispatch({
        type: 'patrolPlanList/queryEqData',
        layerid,
        payload: params1,
        callback: (res) => {
          that.map.getMapDisplay().removeLayer('layeridPoint');
          this.setState({sLoading: false})
          this.state.eqList.map(item => {
            let eqDataA = Object.assign({}, this.state.eqDataA);
            if(Number(item.id) === Number(id)){
              let pointParams = []
              if(res && res.features.length > 0){
                for(let i = 0; i < res.features.length; i++){
                  const eqcode = res.features[i].attributes.eqptcode ? res.features[i].attributes.eqptcode : res.features[i].attributes.eqptCode;
                  pointParams.push({
                    gid: res.features[i].attributes.gid,
                    eqptcode: eqcode,
                    geometry: JSON.stringify({
                      x: res.features[i].geometry.x,
                      y: res.features[i].geometry.y
                    }),
                    remark: '',
                  });
                }
                eqDataA[item.name] = res.features;
                that.showPoint(pointParams)
                this.setState({
                  eqDataA,
                })
              }
            }
          })

        }
      });
    }

  }
  //画任意区域
  editAreaMapInfo = (val, layerid, filter, id) => {
    if (!this.map) {
      return;
    }
    let that = this;
    let mapTool = null;
    this.map.getMapDisplay().removeLayer('add_regional_layer_point_edit');
    mapTool = new DrawPolygonMapTool(this.map.getMapObj(), this.map.getApiUrl(),
      (geom) => {
      let dots = [];
      const areaPoint = [];
      for (let i = 0; i < geom.rings[0].length; i++) {
        dots.push({ x: geom.rings[0][i][0], y: geom.rings[0][i][1] });
        areaPoint.push([geom.rings[0][i][0], geom.rings[0][i][1]])
      }
      if(val === 'pipe'){
        const where = this.pipe.handokParams()
        const params = {
          geometry: JSON.stringify({
            rings: areaPoint,
            spatialReference: {wkid: 3857},
            type: 'polygon'
          }),
          pageno: 1,
          pagesize: 5000,
          withCount: true,
          returnGeometry:'true',
          outFields: 'gid,stnod,ednod,eqptcode,pipelength,pressurerating,pipematerial,pipediam',
          geometryType: 'esriGeometryPolygon',
          f: 'json',
          where: `(${where})`,
          ecode: this.props.user.ecode,
        }
        this.setState({sLoading: true,})
        this.props.dispatch({
          type: 'patrolPlanList/querypipeData',
          layerid: this.state.eqMetadata.id,
          payload: params,
          callback: (res) => {
            if(res.error || res.success === false){
              message.error('数据查询失败！')
              this.setState({
                sLoading: false,
              })
              return
            }
            this.setState({sLoading: false})
            let pipeDocts = [];
            if(res && res.features.length > 0){
              if(res.count > 5000){
                message.info("区域内数据太多，只展示前5000条数据，请手动框选较小区域查询！", 10)
              }
              this.map.getMapDisplay().removeLayer('testlayer2');
              for(let i = 0; i < res.features.length; i++){
                let paths = res.features[i].geometry.paths[0];
                if(paths.length >= 2){
                  for(let j = 0; j < paths.length - 1; j++){
                    let docts = [
                      {x: paths[j][0], y: paths[j][1]},
                      {x: paths[j+1][0], y: paths[j + 1][1]},
                    ];
                    const id = res.features[i].attributes.gid
                    pipeDocts.push({doct: docts, id: id})
                    this.showPath(docts, id + '_' + j)

                  }
                }
              }
            }

            this.setState({
              pipeData: res.features || [],
              pipeDocts
            })
          }
        });
      }else if(val === 'eq'){
        let eqwhere = this.eq.handokParams();
        const where1 = this.eq.handokParams();
        if(filter){
          const filterArr = JSON.parse(filter);
          const where2 = filterArr[0] + " " + filterArr[1] + " " + filterArr[2];
          eqwhere = where1 + " " + "and" + " " + where2
        }
        const params = {
          geometry: JSON.stringify({
            rings: areaPoint,
            spatialReference: {wkid: 3857},
            type: 'polygon'
          }),
          returnGeometry:'true',
          pageno: 1,
          pagesize: 10,
          geometryType: 'esriGeometryPolygon',
          f: 'json',
          where: `(${eqwhere})`,
          ecode: this.props.user.ecode,
        }
        this.setState({sLoading: true,})
        this.props.dispatch({
          type: 'patrolPlanList/queryEqData',
          layerid,
          payload: params,
          callback: (res) => {
            if(res.error || res.success === false){
              message.error('数据查询失败！')
              this.setState({
                sLoading: false,
              })
              return
            }
            that.map.getMapDisplay().removeLayer('layeridPoint');
            let eqDataA = Object.assign({}, this.state.eqDataA);
            this.setState({sLoading: false})
            this.state.eqList.map(item => {
              if(Number(item.id) === Number(id)){
                let pointParams = []
                if(res && res.features.length > 0){
                  for(let i = 0; i < res.features.length; i++){
                    const eqcode = res.features[i].attributes.eqptcode ? res.features[i].attributes.eqptcode : res.features[i].attributes.eqptCode;
                    pointParams.push({
                      gid: res.features[i].attributes.gid,
                      eqptcode: eqcode,
                      geometry: JSON.stringify({
                        x: res.features[i].geometry.x,
                        y: res.features[i].geometry.y
                      }),
                      remark: '',
                    });
                  }
                  eqDataA[item.name] = res.features;
                  that.showPoint(pointParams)
                  this.setState({
                    eqDataA,
                  })
                }
              }
            })
          }
        });
      }

      let addParams = {
        id: 'show_all_station_polygon_edit', // + that.drawIndex,
        layerId: 'show_all_station_polygon_edit',
        dots,
      };
      that.map.getMapDisplay().polygon(addParams);
    });
    if (mapTool) {
      this.map.switchMapTool(mapTool);
    }
  }

  //拉框查询
  rectangleArea = (val, layerName) => {
    if (!this.map) {
      return;
    }
    let that = this;
    let mapTool = null;
    mapTool = new DrawRectangleMapTool(this.map.getMapObj(), this.map.getApiUrl(),
      (geom) => {
      const dots = [
        {x: geom.xmin, y: geom.ymax},
        {x: geom.xmax, y: geom.ymax},
        {x: geom.xmax, y: geom.ymin},
        {x: geom.xmin, y: geom.ymin},
      ];
      const areaPoint = [
        [geom.xmin, geom.ymax],
        [geom.xmax, geom.ymax],
        [geom.xmax, geom.ymin],
        [geom.xmin, geom.ymin],
      ];
      if(val === 'pipe'){
        const {pipeData} = this.state;
        const features1 = []
        pipeData && pipeData.map(item => {
          if(Number(item.geometry.paths[0][0][0]) < Number(geom.xmin) && Number(item.geometry.paths[0][1][0]) < Number(geom.xmin)){
            features1.push(item)
          }else if(Number(item.geometry.paths[0][0][0]) > Number(geom.xmax) && Number(item.geometry.paths[0][1][0]) > Number(geom.xmax)){
            features1.push(item)
          }else if(Number(item.geometry.paths[0][0][1]) > Number(geom.ymax) && Number(item.geometry.paths[0][1][1]) > Number(geom.ymax)){
            features1.push(item)
          }else if(Number(item.geometry.paths[0][0][1]) < Number(geom.ymin) && Number(item.geometry.paths[0][1][1]) < Number(geom.ymin)){
            features1.push(item)
          }else{
            const a = {x: Number(item.geometry.paths[0][0][0]), y: Number(item.geometry.paths[0][0][1])};
            const b = {x: Number(item.geometry.paths[0][1][0]), y: Number(item.geometry.paths[0][1][1])};
            //左下
            const zx = {x: Number(geom.xmin), y: Number(geom.ymin)};
            //右下
            const yx = {x: Number(geom.xmax), y: Number(geom.ymin)};
            //左上
            const zs = {x: Number(geom.xmax), y: Number(geom.ymax)};
            //右上
            const ys = {x: Number(geom.xmax), y: Number(geom.ymax)};
            if(this.segmentsIntr(a, b, zx, zs) && this.segmentsIntr(a, b, zx, yx) && this.segmentsIntr(a, b, yx, ys) && this.segmentsIntr(a, b, zs, ys)){
              features1.push(item)
            }
          }
        })
        if(features1 && features1.length > 0){
          this.map.getMapDisplay().removeLayer('testlayer2');
          let pipeDocts = [];
          for(let i = 0; i < features1.length; i++){
            let docts = [
              {x: features1[i].geometry.paths[0][0][0], y: features1[i].geometry.paths[0][0][1]},
              {x: features1[i].geometry.paths[0][1][0], y: features1[i].geometry.paths[0][1][1]},
            ];
            const id = features1[i].attributes.gid
            pipeDocts.push({doct: docts, id: id})
            this.showPath(docts, id)
          }
          this.setState({
            pipeData: features1,
            pipeDocts,
          })
        }
      }else if(val === 'eq'){
        let eqDataA = Object.assign({}, this.state.eqDataA);
        const features = eqDataA[layerName].filter(item => {
          return Number(item.geometry.x) > Number(geom.xmax) || Number(item.geometry.x) < Number(geom.xmin) || Number(item.geometry.y) > Number(geom.ymax) || Number(item.geometry.y) < Number(geom.ymin)
        })
        let pointParams1 = []
        if(features && features.length > 0){
          this.map.getMapDisplay().removeLayer('layeridPoint');
          for(let i = 0; i < features.length; i++){
            const eqcode = features[i].attributes.eqptcode ? features[i].attributes.eqptcode : features[i].attributes.eqptCode;
            pointParams1.push({
              gid: features[i].attributes.gid,
              eqptcode: eqcode,
              geometry: JSON.stringify({
                x: features[i].geometry.x,
                y:  features[i].geometry.y
              }),
              remark: '',
            });
          }
          this.showPoint(pointParams1)
          eqDataA[layerName] = features
          this.setState({
            eqDataA,
          })
        }
      }else if(val === 'point'){
        const {extraPoints} = this.state;
        const features2 = extraPoints.filter(item => {
          return Number(JSON.parse(item.geometry).x) > Number(geom.xmax) || Number(JSON.parse(item.geometry).x) < Number(geom.xmin) || Number(JSON.parse(item.geometry).y) > Number(geom.ymax) || Number(JSON.parse(item.geometry).y) < Number(geom.ymin)
        })
        let point = []
        if(features2 && features2.length > 0){
          this.map.getMapDisplay().removeLayer('layeridPoint');
          this.map.getMapDisplay().removeLayer('extra_keyPoints');
          for(let i = 0; i < features2.length; i++){
            point.push({
              gid: features2[i].gid,
              geometry: JSON.stringify({
                x: JSON.parse(features2[i].geometry).x,
                y: JSON.parse(features2[i].geometry).y
              }),
              remark: '',
            });
          }
          this.showPoint(point)
          this.setState({
            extraPoints: features2,
          })
        }
      }

      // let addParams = {
      //   id: 'show_all_station_polygon_del',
      //   layerId: 'show_all_station_polygon_del',
      //   dots,
      // };
      // that.map.getMapDisplay().polygon(addParams);
    });
    if (mapTool) {
      this.map.switchMapTool(mapTool);
    }
  }
  //求差集
  arrXor = (arr, arrDel) => {
    const features = []
    for(let i = 0; i < arr.length; i++){
      // for(let j = 0; j < arrDel.length; j++){
        if(_.some(arrDel, ['attributes.gid', arr[i].attributes.gid])){
          features.push(arr[i])
        }
      // }
    }
    return features
  }
  //判断两条线段不相交
  segmentsIntr = (a, b, c, d) => {
    // 三角形abc 面积的2倍
    var area_abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);

    // 三角形abd 面积的2倍
    var area_abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
    if ( area_abc*area_abd >= 0 ) {
      return true;
    } else{
      return false
    }

    // 三角形cda 面积的2倍
    // var area_cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);

    // 三角形cdb 面积的2倍
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
    // var area_cdb = area_cda + area_abc - area_abd ;
    // if ( area_cda * area_cdb >= 0 ) {
    // return false;
    // }

    //计算交点坐标
    // var t = area_cda / ( area_abd- area_abc );
    // var dx= t*(b.x - a.x),
    // dy= t*(b.y - a.y);
    // return { x: a.x + dx , y: a.y + dy };
  }

  // 区域名称数据字典
  areaDataDictionary = () => {
    this.setState({sLoading: true})
    this.props.dispatch({
      type: 'patrolPlanList/getAreaData',
      // payload: {
      //   identity:1
      // }
      callback: (res) => {
        if(res && res.data){
          this.setState({sLoading: false})
        }
      }
    });
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

  // 巡检对象 数据字典
  getLayerDataDictionary = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getLayerData',
      callback: (res) => {
        this.setState({
          layersData: res,
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
    let area = object.triggerNode.props.area;
    const areaPoints = eval("(" + area.areaPolygon + ")")
    //const pathPolygon = eval("(" + area.pathPolygon + ")")
    this.map.getMapDisplay().removeLayer('extra_keyPoints');
    const userids = [];
    area.userid && area.userid.split(',').map(item => {
      const stationid = area.stationid ? area.stationid : ''
      userids.push('u' + item.toString() + '_' + stationid)
    })

    this.setState({
      areaid: value,
      userids: userids,
      subUserids: area.userid,
      usernames: area.usernames.split(','),
      stationid: area.stationid,
      station: area.station,
      extraPoints: area.keypoints,
      routinepoint: area.keypoints,
      areaPoints,
      //pathPolygon,
      areaName: label,
      //常规计划数据
      layerids: [],
      oldLayerids: [],
      layerName: [],
      routineMapShow: [],
      routineShow: [],
      isShowRoutine: false,
    });

    this.clearTempData()

    this.extraKeyPointIndex = area.keypoints.length
    if (!this.state.hasName) {
      this.setState({
        name: label + '_' + moment().format('YYYY-MM-DD'),
      });
    }
    this.map.getMapDisplay().clear();
    // this.showPoint(keyPointId, area.keypoints);
    this.showArea(area.areaPolygon);
    // this.showPath(area.pathPolygon);
  };

  // http://10.39.13.38:8022/ServiceEngine/rest/services/NetServer/lfgw_84/${layerid}/query
  // 获取对应 区域 和 巡检对象 的点
  getPoint = (areaid, layerid, callback) => {
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
  };
  //新建关键点
  addKeyPoints = () => {
    let that = this;
    message.info('ESC键取消新建点');
    const mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geom) => {
      that.extraKeyPointIndex++;
      let pointParams = {
        id: `extra_keyPoints_${that.extraKeyPointIndex}`,
        layerId: 'extra_keyPoints',
        layerIndex: 10,
        markersize: 8,
        linecolor: [255, 0, 0],
        fillcolor: [135, 206, 235],
        x: geom.x,
        y: geom.y
      };
      that.map.getMapDisplay().point(pointParams);
      let extraPoints = [...this.state.extraPoints];
      extraPoints.push({type: 0, geometry: JSON.stringify({x: geom.x, y: geom.y}), gid: `extra_keyPoints_${that.extraKeyPointIndex}`, remark: ''});
      that.setState({
        extraPoints: extraPoints,
      });
    });
    this.map.switchMapTool(mapTool);
    window.addEventListener('keydown', this.keydownEvent = (event)=>{
      if(event.keyCode == 27){
        mapTool.destroy();
        window.removeEventListener('keydown',this.keydownEvent);
      }
    });

  };

  editKeyPoints = () => {
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
    //删除userId中的u
    const reg = new RegExp('u', 'g')

    data.creatorid = this.props.user.gid;
    data.creator = this.props.user.username;
    data.areaid = this.state.areaid;// 区域ID
    data.stationid = this.state.stationid;// 站点ID
    data.station = this.state.station;// 站点
    data.layerids = this.state.layerids.toString();// 巡检对象id
    // data.userids = this.state.userids.toString().substring(1);// 巡检员id
    // data.userids = this.state.userids.toString().replace(reg,"");// 巡检员id
    data.userids = this.state.subUserids;// 巡检员id
    data.usernames = this.state.usernames.toString();// 巡检员
    // data.cycleid = this.state.cycleid;// 巡检周期
    data.unit = this.state.cycleName;// 巡检周期
    data.frequency = this.state.frequency; // 巡检频率
    data.startTime = this.state.startTime; // 开始时间
    data.speedid = this.state.speedid;// 行走方式
    data.name = this.state.name;// 模板名称
    data.isschedule = this.state.isschedule;//是否排班

    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlan',
      payload: data,
      callback: (res) => {
        if (!res.success) {
          message.error(res.msg);
          return;
        }
        message.success(res.msg);
        this.props.dispatch(routerRedux.push('/query/patrol-plan-s'));
      }
    });
  };
  // 插入临时计划
  insertTempPlan = () => {
    const {extraPoints, pipeData, layeridAll, pointSubmit, pipeSubmit, eqSubmit, eqList} = this.state
    let keyPoints = [];
    let pipePoints = [];
    let eqPoints = [];
    let layerids = []
    if(pointSubmit.length > 0){
      pointSubmit.map((item) => {
        keyPoints.push({
          type: layeridAll[_.findIndex(layeridAll, {name: '关键点'})].type,
          gid: isNaN(Number(item.gid)) ? '' : item.gid,
          layerid: layeridAll[_.findIndex(layeridAll, {name: '关键点'})].id,
          layername: '关键点',
          geometry: item.geometry,
        })
      })
      layerids.push(layeridAll[_.findIndex(layeridAll, {name: '关键点'})].id)
    }
    if(pipeSubmit.length > 0){
      const heigthPress = [];
      const mediumPress = [];
      const lowPress = [];
      pipeSubmit.map(item => {
        const pressure = item.attributes && item.attributes.pressurerating ? item.attributes.pressurerating : item.attributes.pressureRating
        if(pressure && pressure.includes('低')){
          lowPress.push(item)
          layerids.push(layeridAll[_.findIndex(layeridAll, {name: '低压管段'})].id)
        }else if(pressure && pressure.includes('中')){
          mediumPress.push(item)
          layerids.push(layeridAll[_.findIndex(layeridAll, {name: '中压管段'})].id)
        }else if(pressure && pressure.includes('高')){
          heigthPress.push(item)
          layerids.push(layeridAll[_.findIndex(layeridAll, {name: '高压管段'})].id)
        }
      })
      //管段
      if(lowPress.length > 0){
        pipePoints.push({
          type: layeridAll[_.findIndex(layeridAll, {name: '低压管段'})].type,
          layerid: layeridAll[_.findIndex(layeridAll, {name: '低压管段'})].id,
          layername: layeridAll[_.findIndex(layeridAll, {name: '低压管段'})].layername,
          features: lowPress
        })
      }
      if(mediumPress.length > 0){
        pipePoints.push({
          type: layeridAll[_.findIndex(layeridAll, {name: '中压管段'})].type,
          layerid: layeridAll[_.findIndex(layeridAll, {name: '中压管段'})].id,
          layername: layeridAll[_.findIndex(layeridAll, {name: '中压管段'})].layername,
          features: mediumPress
        })
      }
      if(heigthPress.length > 0){
        pipePoints.push({
          type: layeridAll[_.findIndex(layeridAll, {name: '高压管段'})].type,
          layerid: layeridAll[_.findIndex(layeridAll, {name: '高压管段'})].id,
          layername: layeridAll[_.findIndex(layeridAll, {name: '高压管段'})].layername,
          features: heigthPress
        })
      }
    }
    //设备
    eqList.length > 0 && eqList.map(item => {
      if(eqSubmit[item.name] && eqSubmit[item.name].length > 0){
        eqSubmit[item.name].map(item1 => {
          eqPoints.push({
            type: layeridAll[_.findIndex(layeridAll, {name: item.name})].type,
            gid: item1.gid,
            layerid: layeridAll[_.findIndex(layeridAll, {name: item.name})].id,
            equipid: item1.attributes.eqptcode,
            layername: item.layername,
            geometry: item1.geometry,
          })
          layerids.push(layeridAll[_.findIndex(layeridAll, {layername: item.layername})].id)
        })
      }
    })

    let data = {
      type: 0,
    };
    for (let key in this.taskValidate) {
      if (this.taskValidate[key].validate && (this.state[key].length === null || this.state[key] === '' || this.state[key].length === 0)) {
        message.error(this.taskValidate[key].message);
        return;
      }
    }

    //删除userId中的u
    const reg = new RegExp('u', 'g')
    data.creatorid = this.props.user.gid;
    data.creator = this.props.user.username;
    data.areaid = this.state.areaid;// 区域ID
    data.stationid = this.state.stationid;// 站点ID
    data.station = this.state.station;// 站点
    data.layerids = _.uniq(layerids).join(',');// 巡检对象id
    // data.userids = this.state.userids.toString().replace(reg,"");// 巡检员id
    data.userids = this.state.subUserids;// 巡检员id
    data.usernames = this.state.usernames.toString();// 巡检员
    data.speedid = this.state.speedid;// 行走方式
    data.name = this.state.name;// 模板名称
    data.keyPoints = keyPoints;
    data.pipesections = pipePoints;
    data.equipments = eqPoints;
    // data.remark = this.state.remark;// 备注
    data.startTime = this.state.sTime;// 开始时间
    data.endTime = this.state.eTime;// 结束时间
    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlan',
      payload: data,
      callback: (res) => {
        if (!res.success) {
          message.error(res.msg);
          return;
        }
        message.success(res.msg);
        this.props.dispatch(routerRedux.push('/query/patrol-plan-s'));
      }
    });
  };

  goback = () => {
    this.props.dispatch(routerRedux.push('/query/patrol-plan-s'));
  };

  showDetail = (record) => {
    this.setState({
      feedbackData: record.formFields || [],
      isShowDetail: true,
    })
  };
  //弹出巡视方式
  showPatrol = (val) => {
    if(!this.state.areaid){
      message.warn("请选择区域！")
      return
    }
    const {patrolEqData, eqMetadata, eqList, layeridAll} = this.state;
    const {ecode} = this.props.user
    let patrolData = [];
    patrolMethods = [];
    // if(patrolEqData.length === 0 || layeridAll.length === 0){
      this.props.dispatch({
        type: 'patrolPlanList/getLayerData',
        callback: (data, res) => {
          const layeridAll = [];
          res.data && res.data.length > 0 &&  res.data.map(item => {
            layeridAll.push({id: item.gid, name: item.name, type: item.isfeedback, filter: item.filter})
          })
          patrolData = Object.assign([], res.data)

          if(res.data && res.data.length > 0){
            if(_.some(res.data, ['type', '设备'])){
              patrolMethods.push({gid: '1', name: '设备'})
            }
            if(_.some(res.data, ['type', '关键点'])){
              patrolMethods.unshift({gid: '3', name: '关键点'})
            }
            if(_.some(res.data, ['type', '管段'])){
              patrolMethods.push({gid: '2', name: '管段'})
            }
          }
          this.setState({
            layeridAll,
            patrolEqData: res.data,
            patrolMethod: patrolMethods.length > 0 ? patrolMethods[0].gid : []
          })
        }
      });
    // }
    // if(eqMetadata.length === 0 || eqList.length === 0){
      this.setState({sLoading: true})
      this.props.dispatch({
        type: 'patrolPlanList/getMetadata',
        payload: {
          ecode,
        },
        callback: (res) => {
          if(res.error){
            message.error('查询数据失败！')
            this.setState({
              isShowTempPatrol: false,
              sLoading: false,
            })
            return
          }
          let eqMetadata = {};
          const eqList = [];
          const layeridAll = [...this.state.layeridAll];
          //墨卡托坐标
          const MER = res && res.metainfo && res.metainfo.length > 0 && res.metainfo.filter(item => {
            return item.code === `${ecode}_MER`
          })
          MER && MER.length > 0 && MER[0].net.map(item => {
            if(item.dname === '管段'){
              eqMetadata = {name: '管段', id: item.layerid}
            }
          })
          patrolData.length > 0 && patrolData.map((item, index) => {

            if(item.type === '设备'){
              const layerMER = _.find(MER[0].net, _.matchesProperty('dno', Number(item.layername)))
              if(layerMER) {
                eqList.push({name: item.name , id: item.gid, filter: item.filter, layername: layerMER.dno, layerid: layerMER.layerid})
              }
            }
            const layerMER = _.find(MER[0].net, _.matchesProperty('dno', Number(item.layername)))
            if(layerMER) {
              layeridAll[index].layerid = layerMER.layerid;
              layeridAll[index].layername = layerMER.dno;
            }
          })

          this.setState({layeridAll, eqList,eqMetadata})
        }
      });
    // }
    if(val){
      const oldLayerids = [...this.state.layerids];
      const oldLayerName = [...this.state.layerName];
      const {routineMapShow, routineShow} = this.state;
      this.setState({
        sLoading: false,
        oldLayerids,
        oldLayerName
      }, () => {
        this.setState({isShowPatrol: true})
      })
    }else{
      this.setState({
        sLoading: false,
      }, () => {
        this.setState({
          isShowTempPatrol: true,

        })
      })
    }
  };
  cancelHandler = () => {
    const {oldLayerids, oldLayerName} = this.state;
    this.setState({
      isShowPatrol: false,
      isShowDetail: false,
      layerids: oldLayerids,
      layerName: oldLayerName,
    })
  };
  cancelTempHandler = () => {
    this.setState({
      isShowTempPatrol: false,
    })
  }
  //重置
  resetHandler = () => {
    const {patrolMethod, eqFilter, gdFilter} = this.state;
    if(patrolMethod === '1'){
      this.eq.initState(this.state.eqFilter)
    }else if(patrolMethod === '2'){
      this.pipe.initState(this.state.gdFilter)
    }else if(patrolMethod === '3'){
      this.map.getMapDisplay().removeLayer('testlayer2');
      this.map.getMapDisplay().removeLayer('extra_keyPoints');
      this.setState({
        extraPoints: [],
      })
    }
  }
  handTempOk = () => {
    let layerName = [];
    const {eqData, extraPoints, pipeData, eqSubmit, pointSubmit, pipeSubmit, eqList} = this.state;
    eqList.length > 0 && eqList.map(item => {
      if(eqSubmit[item.name] && eqSubmit[item.name].length > 0){
        layerName.push('设备')
        return
      }
    })
    if(pointSubmit.length > 0){
      layerName.push('关键点')
    }
    if(pipeSubmit.length > 0){
      layerName.push('管段')
    }
    this.setState({
      isShowTempPatrol: false,
    }, () => {
      this.setState({layerName: _.uniq(layerName)})
    })
  }
  handOk = (routineMapShow, routineShow, isShowRoutine) =>{
    this.setState({
      isShowPatrol:false,
      routineMapShow,
      routineShow,
      isShowRoutine,
    })
  };
  cancelDetail = () => {
    this.setState({isShowDetail: false})
  };
  //切换巡视方式
  changeMethodHandler = (val, layerid, layerName) => {
    this.map.getMapDisplay().removeLayer('layeridPoint'); //清除点显示
    this.map.getMapDisplay().removeLayer('extra_keyPoints'); //新增点清除
    this.map.getMapDisplay().removeLayer('testlayer2'); //清除线显示
    this.map.getMapDisplay().removeLayer('testlayer_line'); //清除线显示
    this.map.getMapDisplay().removeLayer('layeridPoint_img'); //清除点显示
    this.map.getMapDisplay().removeLayer('show_all_station_polygon_edit'); //删除任意区域面
    // this.map.getMapDisplay().removeLayer('testlayer1'); //清除面显示
    if(val === '3'){
      const {extraPoints, pointSubmit} = this.state;
      this.showPoint(pointSubmit);
    }else if(val === '2'){
      //管段
      const areaPoint = [];
      const that = this;
      this.state.areaPoints.length > 0 &&  this.state.areaPoints.map(item => {
        areaPoint.push([item.x, item.y])
      })
      const params = {
        geometry: JSON.stringify({
          rings: areaPoint,
          spatialReference: {wkid: 3857},
          type: 'polygon'
        }),
        pageno: 1,
        pagesize: 5000,
        withCount: true,
        returnGeometry:'true',
        where: '(1>2)',
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        ecode: this.props.user.ecode,
      }
      // this.setState({sLoading: true})
      this.props.dispatch({
        type: 'patrolPlanList/querypipeData',
        layerid: this.state.eqMetadata.id,
        payload: params,
        callback: (res) => {
          if(res.error || res.success === false){
            message.error('数据查询失败！')
            this.setState({
              isShowTempPatrol: false,
              sLoading: false,
            })
            return
          }
          const gdFilter = []
          const values = Object.values(res.fieldAliases) || [];
          const keys = Object.keys(res.fieldAliases) || [];
          values.map((item, index) => {
            if (/^[\u4e00-\u9fa5]*$/.test(item)){
              if(keys[index] === 'pressureRating' || keys[index] === 'pressurerating'){
                gdFilter.unshift({name: keys[index], alise: item})
              }else{
                gdFilter.push({name: keys[index], alise: item})
              }
            }
          })
          this.setState({
            sLoading: false,
            gdFilter
          }, () => {
            if(this && gdFilter.length > 0){
              this.pipe.initState(gdFilter)
            }
          })
        }
      });
      //展示管段
      const { pipeDocts, pipeSubmit} = this.state;
      // if(pipeDocts.length > 0){
      //   pipeDocts.map(item => {
      //     this.showPath(item.doct, item.id)
      //   })
      // }
      for(let i = 0; i < pipeSubmit.length; i++){
        let paths = pipeSubmit[i].geometry.paths[0];
        if(paths.length >= 2){
          for(let j = 0; j < paths.length - 1; j++){
            let docts = [
              {x: paths[j][0], y: paths[j][1]},
              {x: paths[j+1][0], y: paths[j + 1][1]},
            ];
            const id = pipeSubmit[i].attributes.gid
            pipeDocts.push({doct: docts, id: id})
            this.showPath(docts, id + '_' + j)

          }
        }
      }
    }else if(val === '1'){
      //设备
      let areaPoint1 = [];
      const that = this;
      this.state.areaPoints.length > 0 &&  this.state.areaPoints.map(item => {
        areaPoint1.push([item.x, item.y])
      })
      const {eqList} = this.state;
      const params1 = {
        geometry: JSON.stringify({
          rings: areaPoint1,
          spatialReference: {wkid: 3857},
          type: 'polygon',
        }),
        returnGeometry:'true',
        where: "(1>2)",
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        ecode: this.props.user.ecode,
      }
      this.setState({sLoading: true})
      this.props.dispatch({
        type: 'patrolPlanList/queryEqData',
        layerid: layerid ? layerid : (eqList.length > 0 ? eqList[0].layerid : ''),
        payload: params1,
        callback: (res) => {
          if(res.error || res.success === false){
            message.error('数据查询失败！')
            this.setState({
              isShowTempPatrol: false,
              sLoading: false,
            })
            return
          }
          const eqFilter = []
          const values = Object.values(res.fieldAliases) || [];
          const keys = Object.keys(res.fieldAliases) || [];
          values.map((item, index) => {
            if (/^[\u4e00-\u9fa5]*$/.test(item)){
              eqFilter.push({name: keys[index], alise: item})
            }
          })
          this.setState({
            eqFilter
          }, () => {
            if(this && eqFilter.length > 0){
              this.eq.initState(eqFilter, eqList, layerid)
            }
          })
        }
      });
      //展示设备
      const {eqDataA, eqSubmit} = this.state;
      const layer = layerName ? layerName : (eqList.length > 0 ? eqList[0].name : '');
      if(eqDataA[layer] && eqDataA[layer].length > 0){
        this.showPoint(eqSubmit[layer])
      }
    }
    this.setState({
      patrolMethod: val,
      sLoading: false,
    })
  };
  pageChange = (current, pageSize) => {
    this.setState({
      pageno: current,
      pageSize,
    });
  };
  //关键点删除
  remove = (record) => {
    let tmpData = [];
    let keypoints = [...this.state.extraPoints];
    for (let i = 0; i < keypoints.length; i++) {
      if (keypoints[i].gid === record.gid) {
        continue;
      }
      tmpData.push(keypoints[i]);
    }
    let tmpEditTableData = Object.assign([], tmpData);
    let layername = (isNaN(Number(record.gid)) ? 'extra_keyPoints' : 'layeridPoint');
    this.map.getMapDisplay().removeGraphic(record.gid, layername);
    this.setState({
      extraPoints: tmpEditTableData,
    });
  };
  //删除巡视方式
  handleChange = (e, val) => {
    e.stopPropagation();
    const {layerName} = this.state;
    if(val === '设备'){
      this.map.getMapDisplay().removeLayer('layeridPoint');
      this.setState({
        eqDataA: [],
        eqSubmit: [],
      })
    }else if(val === '关键点'){
      this.map.getMapDisplay().removeLayer('testlayer2');
      this.map.getMapDisplay().removeLayer('extra_keyPoints');
      this.setState({
        extraPoints: [],
        pointSubmit: [],
      })
    }else if(val === '管段'){
      this.map.getMapDisplay().removeLayer('testlayer2');
      this.setState({
        pipeData: [],
        pipelength: 0,
        pipeDocts: [],
        pipeSubmit: [],
      })
    }
    this.setState({
      layerName: _.without(layerName, val)
    })
  };
  //勾选的提交数据；
  submitRow = (name, val, eqTypeName ) => {
    if(name === 'eqSubmit'){
      const eqSubmit = Object.assign({}, this.state.eqSubmit)
      eqSubmit[eqTypeName] = val
      this.setState({eqSubmit})
    }else if(name === 'pipeSubmit'){
      let pipelength = 0
      val && val.map(item => {
        const pl = item.attributes.pipelength ? item.attributes.pipelength : item.attributes.pipeLength
        pipelength += Number(pl)
      })
      this.setState({
        [name]: val,
        pipelength: pipelength.toFixed(3),
      })
    }
  };
  //切换区域、点击取消清除临时计划数据
  clearTempData = () => {
    this.setState({
      // extraPoints: [],
      pointSubmit: [],
      eqSubmit: {},
      pipeData: [],
      pipeDocts: [],
      eqDataA: [],
      pipeSubmit: [],
    })
  }

  //常规计划设备对象
  changeEqobject = (val ,name) => {
    this.setState({
      layerids: val,
      layerName: name,
    })
  };
  disabledDate = (current) => {
    // Can not select days before today and today
    return current && current < moment().subtract({days: 1}).endOf('day');
  };

   // 填充数据至区域
   renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.name} key={item.gid} value={item.name} dataRef={item} />;
    });
  };
  render() {
    const {patrolMethod, extraPoints, pageno, pagesize, gdFilter, areaPoints, pipeData, pipelength, patrolEqData,
      eqList, eqFilter, eqDataA, layerName, feedbackData, eqSubmit, pointSubmit, eqlength, areaName, oldLayerids, routinepoint, layeridAll, pathPolygon,
      routineMapShow, routineShow, isShowRoutine, selectedRowKeys} = this.state;
    const {patrolCycle, user} = this.props;
    let areaTemp = Object.assign([], this.props.areaData || []);
    let areaData = [];
    this.getTreeData(areaData, areaTemp);
    let usernamesData = this.getPatrolorTreeData(this.props.usernamesData || []);

    let button = () => {
    };
    if (this._tool.type === 1) {
      button = this.insertPlan;
    }
    else if (this._tool.type === 0) {
      button = this.insertTempPlan;
    }

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 17},
      style: {marginBottom: '10px'}
    };
    const formItemLayout1 = {
      labelCol: {span: 10},
      wrapperCol: {span: 13},
      style: {marginBottom: '10px'}
    };
    const formItemLayout2 = {
      labelCol: {span: 10},
      wrapperCol: {span: 13},
      style: {marginBottom: '1px'}
    };

    const isShowCycle = this._tool.type === 1;

    const isShowRangeTime = this._tool.type === 0;

    const dateFormat = 'YYYY-MM-DD HH:mm:ss';
    const that = this
     //关键点勾选
    const pointSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.map.getMapDisplay().removeLayer('layeridPoint');
        this.map.getMapDisplay().removeLayer('extra_keyPoints');
        this.showPoint(selectedRows)
        this.setState({pointSubmit: selectedRows, selectedRowKeys})
      },
      getCheckboxProps: record => {
        const that = this;
        const point = that.state.pointSubmit
        return {defaultChecked : point.length > 0 && point.some(item => Number(item.gid) === Number(record.gid))}
      },
      hideDefaultSelections: true,
        selections: [{
          key: 'all-data',
          text: '选择全部设备',
          onSelect: () => {
            const pointArr = [];
            extraPoints && extraPoints.map(item => {
              pointArr.push(item.gid)
            })
            this.showPoint(extraPoints)
            this.setState({
              pointSubmit: extraPoints,
              selectedRowKeys: pointArr,
            });
          },
        }, {
          key: 'none-data',
          text: '取消全部设备',
          onSelect: () => {
            this.map.getMapDisplay().removeLayer('layeridPoint');
            this.map.getMapDisplay().removeLayer('extra_keyPoints');
            this.setState({ pointSubmit: [],  selectedRowKeys: []});

          },
        }],
    }
    const columnPoint = [
      {
        title: '序号', dataIndex: 'findex', key: 'findex', width: '10%',
        render: (text, record, index) => {
          const findex = (index + 1) + pagesize * (pageno -1)
          return <span>{findex}</span>
        }
      }, {
        title: '横坐标', dataIndex: 'x', key: 'x', width: '35%',
        render: (text, record) => {
          const sX = record && record.geometry && !record.geometry.x ? JSON.parse(record.geometry).x : ''
          const x = record && record.geometry ? (record.geometry.x ? record.geometry.x  : sX) : '';
          return <span>{x}</span>
        }
      }, {
        title: '纵坐标', dataIndex: 'y', key: 'y', width: '35%',
        render: (text, record) => {
          const sY = record && record.geometry && !record.geometry.y ? JSON.parse(record.geometry).y : ''
          const y = record && record.geometry ? (record.geometry.y ? record.geometry.y  : sY) : '';
          return <span>{y}</span>
        }
      },{
        title: '备注', dataIndex: 'remarks', key: 'remark', width: '10%',
      }, {
        title: '操作',
        key: 'action',
        width: '10%',
        render: (text, record, index) => {
          return (
              <Popconfirm title="是否要删除此关键点？" onConfirm={() => this.remove(record)}>
                <a>删除</a>
              </Popconfirm>
          );
        },
    	},
    ];
    // 表格分页
    const pagination = {
      total: extraPoints.length,
      current: pageno,
      size: 'small',
      pageSize: pagesize,
      showTotal: (total, range) => {
        return (<div>
          共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
        </div>);
      },
      onChange: (current, pageSize) => {
        this.pageChange(current, pageSize);
      },
    };

    //行走方式
    const {walkWay}=this.props



    return (
      <div style={{width: '100%', height: 'calc(100vh - 120px)'}} className={styles['temp']}>
        <div style={{width: '100%', height: '100%'}}>
          <EcityMap mapId="patrolPlanList" onMapLoad={(arcGISMap) => {this.map = arcGISMap}}/>
        </div>
        <Dialog
          title='巡视计划制定'
          width={450}
          position={{top: 50}}
          onClose={this.goback}
        >
          <Form style={{marginTop: '20px'}}>
            <FormItem
              {...formItemLayout}
              id="control-input"
              label="计划名称：">
              <div>
                <Input id="control-input" style={{width: '95%'}} value={this.state.name} placeholder="请输入"
                       disabled={false} onChange={this.getPlanName}/>
                <span className={styles.starSpan}>*</span>
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="执行区域：">
              <TreeSelect
                style={{width: '95%'}}
                value={this.state.areaid}
                showSearch
                dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                treeData={areaData}
                placeholder="请选择"
                onChange={this.onAreaChange.bind(this)}
                filterTreeNode={(inputValue, treeNode)=>{
                  if (treeNode.props.title.indexOf(inputValue) >= 0) {
                    return true;
                  }else {
                    return false;
                  }
                }}>
              </TreeSelect>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="执行人员：">
              <TreeSelect
                style={{width: '95%',height:'calc(100%)',overflow: 'auto',maxHeight: 'calc(100vh - 628px)', minHeight: 33}}
                treeData={usernamesData}
                dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
                value={this.state.userids}
                onChange={this.onPatrolorChange.bind(this)}
                multiple={true}
                treeCheckable={true}
                placeholder='请选择'
                filterTreeNode={(inputValue, treeNode)=>{
                  if (treeNode.props.title.indexOf(inputValue) >= 0) {
                    return true;
                  }else {
                    return false;
                  }
                }}>
              </TreeSelect>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="巡视对象：">
              {
                isShowCycle ?
                <div>
                  <Input placeholder="请选择巡视对象" style={{width: '95%', cursor: 'pointer'}} value={layerName.join(',')} onClick={() => this.showPatrol(isShowCycle)}/>
                  <span className={styles.starSpan}>*</span>
                </div>
                :
                (layerName.length === 0 ?
                  <Input placeholder="请选择巡视对象" style={{width: '95%', cursor: 'pointer'}} value={layerName.join(',')} onClick={() => this.showPatrol(isShowCycle)}/>
                  :
                  <div
                    style={{width: '95%', padding: '0 4px', border: '1px solid rgba(0, 0, 0, 0.16)', borderRadius: 5, display: 'inline-block'}}
                    onClick={() => this.showPatrol(isShowCycle)}>
                    {layerName.map((item, index) =>
                      <span
                        key={index}
                        style={{marginRight: 4, cursor: 'pointer'}}
                        onClick={(e) => this.handleChange(e, item)}
                      >{item}<Icon type="close" />{'，'}</span>
                    )}
                  </div>
                )
              }
            </FormItem>
            <FormItem
              {...formItemLayout1}
              label="是否根据排班生成任务："
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
            >
              <Radio.Group
                value={this.state.isschedule}
                onChange={(e) => this.cycleChange(e.target.value, 'isschedule')}
              >
                <Radio value="1">是</Radio>
                <Radio value="0">否</Radio>
              </Radio.Group>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
            >
              <Col span={10}>
                <FormItem
                  {...formItemLayout2}
                  label="周期设置：">
                  <Select style={{width: 80}} value={this.state.cycleName} searchPlaceholder="请选择"
                          onChange={(val, node) => this.cycleChange(val, 'cycleName', node)}>
                      {
                        patrolCycle && patrolCycle.map((item, index) =>
                          <Option key={index} value={item.unit} dataRef={item}>{item.unit}</Option>
                        )
                      }
                  </Select>
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  {...formItemLayout2}
                  label="频率设置：">
                  <InputNumber
                    min={1}
                    max={10}
                    defaultValue={1}
                    style={{width: 80}}
                    value={this.state.frequency}
                    onChange={(val) => this.cycleChange(val, 'frequency')}
                  />
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem>
                  <span>{this.state.frequency}{' '}{this.state.cycleName}/次</span>
                  <span className={styles.starSpan} style={{marginRight: 10}}>*</span>
                </FormItem>
              </Col>
            </FormItem>


            <FormItem
              {...formItemLayout}
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
              label="开始时间："
            >
              <DatePicker
                style={{width: '95%', cursor: 'pointer'}}
                value={this.state.startTime}
                onChange={(val) => this.startTimeChange(val, 'startTime')}
                disabledDate={this.disabledDate}
              />
              <span className={styles.starSpan}>*</span>
            </FormItem>
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
              label="行走方式："
              style={{marginBottom: '10px', display: this.state.isVisible ? 'block' : 'none'}}>
              <Select style={{width: '95%'}} value={this.state.speedid} placeholder="请选择"
                      onChange={this.onCycleChange.bind(this)}>
                {/* <Select.Option value='1'>步巡</Select.Option>
                <Select.Option value='2'>电动车巡</Select.Option>
                <Select.Option value='3'>汽车巡</Select.Option> */}
                {
                  walkWay && walkWay.map((item,index)=>
                  <Select.Option key={index} value={ item.gid }>{ item.name }</Select.Option>
                  )
                }
              </Select>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              style={{margin: '20px 0px'}}
              wrapperCol={{ offset: 10}}>
              <Button type="ghost" style={{width: '70px', height: '28px', marginRight: '5px'}}
                      onClick={this.goback}>取消</Button>
              <Button type="primary" style={{width: '70px', height: '28px'}} onClick={button}>确定</Button>
            </FormItem>
          </Form>
        </Dialog>
        {this.state.isShowPatrol ?
          <PlanRoutine
            onRef={(ref) => { this.routine = ref; }}
            cancelDetail={this.cancelDetail}
            handOk={this.handOk}
            patrolEqData={patrolEqData}
            areaName={areaName}
            eqObject={(val, name) => this.changeEqobject(val, name)}
            oldLayerids={oldLayerids}
            cancelHandler={this.cancelHandler}
            routinepoint={routinepoint}
            pathPpint={pathPolygon}
            areaPoints={areaPoints}
            map={this.map}
            layeridAll={layeridAll}
            routineMapShow={routineMapShow}
            routineShow={routineShow}
            isShowRoutine={isShowRoutine}
          /> : null
        }
        {this.state.isShowTempPatrol ?
          <Dialog
            title='巡视对象选择'
            width={500}
            position={{top: 100}}
            onClose={this.cancelTempHandler}
          >
            <div style={{maxHeight: 500, overflowY: 'scroll'}}>
            <Row style={{margin: '10px 0' }}>
              <Col span={6} style={{textAlign: 'right' }}><label>巡视方式：</label></Col>
              <Col span={15}>
                <Select style={{ width: '100%' }} value={this.state.patrolMethod} onSelect={(val) => this.changeMethodHandler(val)}>
                    {
                      patrolMethods.map((item) =>
                        <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                      )
                    }
                </Select>
              </Col>
            </Row>
            {
              patrolMethod === '3'?
              <Row>
                <Row style={{marginBottom: 10 }}>
                  <Col span={6} style={{textAlign: 'right' }}><label>关键点：</label></Col>
                  <Col span={10}>{pointSubmit.length}个</Col>
                  <Col span={5}>
                    <Button type="primary" onClick={() => this.rectangleArea('point')}>框选删除</Button>
                  </Col>
                </Row>
                <Row style={{marginBottom: 10 }}>
                  <Col span={6} style={{textAlign: 'right' }}><label>添加关键点：</label></Col>
                  <Col span={5}>
                    <Button type="primary" onClick={this.addKeyPoints}>新建</Button>
                  </Col>
                </Row>
                <Row style={{marginBottom: 10 }}>
                  <Table
                    rowKey={(record) => record.gid}
                    columns={columnPoint}
                    dataSource={extraPoints}
                    pagination={pagination}
                    rowSelection={pointSelection}
                  />
                </Row>
              </Row>
            :
            (patrolMethod === '1'?
              <EqSelect
                onRef={(ref) => { this.eq = ref; }}
                eqList={eqList}
                gdFilter={eqFilter}
                changeMethodHandler={(val, layerid, layerName) => this.changeMethodHandler(val, layerid, layerName)}
                areaCheck={(layerid, filter, id) => this.areaSelect('eq', layerid, filter, id)}
                eqData={eqDataA}
                eqlength={eqlength}
                editArea={(layerid, filter, id) => this.editAreaMapInfo('eq', layerid, filter, id)}
                rectangleArea={(layerid) => this.rectangleArea('eq', layerid)}
                submitRow={(val, name) => this.submitRow('eqSubmit', val, name)}
                eqSubmit={this.state.eqSubmit}
                map={this.map}
              />
              :
              <PipeSelect
                onRef={(ref) => { this.pipe = ref; }}
                gdFilter={gdFilter}
                areaPoints={areaPoints}
                areaCheck={() => this.areaSelect('pipe')}
                pipeData={pipeData}
                editArea={() => this.editAreaMapInfo('pipe')}
                pipelength={pipelength}
                rectangleArea={() => this.rectangleArea('pipe')}
                loading={this.state.loading}
                submitRow={(val) => this.submitRow('pipeSubmit', val)}
                pipeSubmit={this.state.pipeSubmit}
                map={this.map}
              />
            )
            }
            <div style={{textAlign: 'center', margin: '10px 0'}}>
              <Button type="ghost" style={{ height: '28px', marginRight: '5px', display: 'inline-block'}}onClick={this.cancelTempHandler}>取消</Button>
              <Button type="ghost" style={{ height: '28px', marginRight: '5px', display: patrolMethod === 3 ? 'none' : 'inline-block'}}onClick={this.resetHandler}>重置</Button>
              <Button type="primary" style={{height: '28px', display: 'inline-block'}} onClick={this.handTempOk}>确定</Button>
            </div>
            </div>
          </Dialog>
          : null
        }
        <div className={styles['spin']}>
          <Spin size="large" spinning={this.state.sLoading}/>
        </div>
      </div>
    )
  }
}
