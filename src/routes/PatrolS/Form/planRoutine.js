import React from 'react';
import styles from './index.less';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, message, Icon, InputNumber, Table, Popconfirm, Tooltip, Spin, Tabs  } from 'antd';
import moment from 'moment';
import utils, { getCurrTk }  from '../../../utils/utils';
import fetch from 'dva/fetch';
import _ from 'lodash';
import EcityMap from '../../../components/Map/EcityMap';
import { DrawRectangleMapTool } from '../../../components/Map/common/maptool/DrawRectangleMapTool';
import { DrawPolygonMapTool } from '../../../components/Map/common/maptool/DrawPolygonMapTool';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import appEvent from '../../../utils/eventBus';
//import QueryFilter from './QueryFilter';

const TabPane = Tabs.TabPane;
@connect(state => ({
  user: state.login.user,
  areaData: state.patrolPlanList.areaData,
  usernamesData: state.patrolPlanList.usernamesData,
  patrolCycle: state.patrolPlanList.patrolCycle,
}))

export default class PlanRoutine extends React.Component {
  constructor(props) {
    super(props);
    this.map = null; // 类ArcGISMap的实例
    this.state = {
      sLoading: false,
      feedbackData: [],  //反馈项名称
      isShowDetail: false, //是否展示详情
      routinepoint: [], //关键点
      pathPolygon: [],  //关键线
      isShowRoutine: props.isShowRoutine,  //展示框
      areaName: '',
      selectedRowKeys: [], //勾选的设备对象gid
      selectedRows: [], //勾选的设备对象
      routineMapShow: props.routineMapShow, //常规计划地图展示的数据
      routineShow: props.routineShow, //常规计划方框展示的数据
      pipeDocts: [], //管道数据
    };

  }

  componentDidMount = () => {
    this.props.onRef(this);
    const {routineShow, routineMapShow} = this.props;
    // this.setState({routineShow, routineMapShow})
  };

  componentWillUnmount = () => {
    if(this.keydownEvent){
      window.removeEventListener('keydown',this.keydownEvent);
    }
  };



  // 展示点
  showPoint = (taskPoints, key) => {
    let that = this;
    const {map} = this.props
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
        layerId: `layeridPoint_${key}`,
        layerIndex: 10,
        attr: taskPoints[i],
        markersize: 8,
        linecolor: [255, 0, 0],
        fillcolor: [135, 206, 235],
        x: position.x,
        y: position.y,
      };
      map.getMapDisplay().point(param);
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
    const {map} = this.props
    const paramLine = {
      id: `paramLine_${ids}`,
      layerId: `testlayer_${ids}`,
      width: 5,
      layerIndex: 10,
      dots: lines,
    };
    map.getMapDisplay().polyline(paramLine);
  }

  //全区查询
  areaSelect = (val, name, layerid, filter) => {
    const areaPoint = [];
    const that = this;
    const {map, areaPoints} = this.props;
    areaPoints && areaPoints.length > 0 &&  areaPoints.map(item => {
      areaPoint.push([item.x, item.y])
    })
    if(val === '管段'){
      let where = ''
      if(name === '高压管段'){
        where = 'pressurerating' + '=' + "'高'"
      }else if(name === '中压管段'){
        where = 'pressurerating' + '=' + "'中'"
      }else if(name === '低压管段'){
        where = 'pressurerating' + '=' + "'低'"
      }
      console.log(where, 'where')
      const params = {
        geometry: JSON.stringify({
          rings: areaPoint,
          spatialReference: {wkid: 3857},
          type: 'polygon'
        }),
        returnGeometry:'true',
        // outFields: 'gid,stnod,ednod,eqptcode,pipelength,pressurerating,pipematerial,pipediam',
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        where: `(${where})`,
        ecode: this.props.user.ecode,
      }
      this.setState({sLoading: true})
      let routineMapShow = [...that.state.routineMapShow]
      let routineShow = [...that.state.routineShow]
      this.props.dispatch({
        type: 'patrolPlanList/querypipeData',
        layerid,
        payload: params,
        callback: (res) => {
          if(res.error || res.success === false){
            message.error("查询管段失败！")
            this.setState({sLoading: false})
            return
          }
          let pipeDocts = [...this.state.pipeDocts];
          this.setState({sLoading: false})
          let pipelength = 0;
          if(res && res.features && res.features.length > 0){
            for(let i = 0; i < res.features.length; i++){
              let docts = [
                {x: res.features[i].geometry.paths[0][0][0], y: res.features[i].geometry.paths[0][0][1]},
                {x: res.features[i].geometry.paths[0][1][0], y: res.features[i].geometry.paths[0][1][1]},
              ];
              const id = res.features[i].attributes.gid
              const pl = res.features[i].attributes.pipelength ? res.features[i].attributes.pipelength : res.features[i].attributes.pipeLength
              pipelength += Number(pl)
              pipeDocts.push({name: name, doct: docts, id: id})
              that.showPath(docts, id)
            }
          }
          routineMapShow.push({[name]: pipeDocts});
          routineShow.push({data: pipelength.toFixed(3), unit: 'm', alise: name, visible: true});
          this.setState({
            pipeDocts,
            routineMapShow,
            routineShow,
          })
        }
      });
    }else if(val === '设备'){
      let filterArr = [];
      let where = '';
      if(filter){
        filterArr = JSON.parse(filter);
        where = filterArr[0] + " " + filterArr[1] + " " + filterArr[2];
      }else{
        where = '1=1';
      }

      // for(let i =0; i < filterArr.length; i += 3){
      //   where = filterArr[i] + " " + filterArr[i + 1] + " " + filterArr[i + 2]
      // }

      console.log(filter, typeof filter, where, 'filter')
      const params1 = {
        geometry: JSON.stringify({
          rings: areaPoint,
          spatialReference: {wkid: 3857},
          type: 'polygon'
        }),
        returnGeometry:'true',
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        where: `(${where})`,
        ecode: this.props.user.ecode,
      }
      this.setState({sLoading: true,})
      this.props.dispatch({
        type: 'patrolPlanList/queryEqData',
        layerid,
        payload: params1,
        callback: (res) => {
          if(res.error || res.success === false){
            message.error("查询管段失败！")
            this.setState({sLoading: false})
            return
          }
          this.setState({sLoading: false})
          let routineMapShow = [...that.state.routineMapShow]
          let routineShow = [...that.state.routineShow]
          let pointParams = [];
          if(res && res.features.length > 0){
            for(let i = 0; i < res.features.length; i++){
              pointParams.push({
                gid: res.features[i].attributes.gid,
                geometry: JSON.stringify({
                  x: res.features[i].geometry.x,
                  y: res.features[i].geometry.y
                }),
                remark: '',
              });
            }
            routineMapShow.push({[name]: pointParams});
            routineShow.push({data: res.features.length, unit: '个', alise: name, visible: true});
            that.showPoint(pointParams, name)
            this.setState({
              routineShow,
              routineMapShow
            })
          }
          if(res && res.features.length === 0){
            routineMapShow.push({[name]: []});
            routineShow.push({data: res.features.length, unit: '个', alise: name, visible: true});
            this.setState({
              routineShow,
              routineMapShow
            })
          }
        }
      });
    }
  };
  //详情框显隐
  detailShow = (name, unit, visible) => {
    let routineShow = [...this.state.routineShow];
    const evens = _.remove(routineShow, function(n) {
      return n.alise === name;
    });
    routineShow.push({data: evens[0].data, unit: unit, alise: name, visible: visible})
    this.setState({routineShow})
  }


  rowSelection =  {
    onChange: (keys, rows) => {
      console.log(keys, selectedRows);
      const that = this;
      const { routinepoint, map, layeridAll, pathPoint} = that.props;
      const {selectedRowKeys, selectedRows} = that.state;
      const layerName = [];
      let routineMapShow = [...that.state.routineMapShow]
      let routineShow = [...that.state.routineShow]
      const currentId = (_.xor(keys, selectedRowKeys))[0];
      const currentRow = (_.xor(rows, selectedRows));
      console.log(currentRow, 'currentRow')
      if(keys && keys.length > 0){
        this.setState({
          isShowRoutine: true
        })
      }else{
        this.setState({
          isShowRoutine: false,
        })
      }
      rows && rows.length > 0 && rows.map(item => {layerName.push(item.name)})
        if(currentRow && currentRow.length > 0){
          currentRow.map(item => {
            if(item.type === '关键点'){
              if(keys.length > that.state.selectedRowKeys.length){
                if(!_.some(routineMapShow, item.name)){
                  routineMapShow.push({[item.name]: routinepoint})
                  routineShow.push({data: routinepoint.length, unit: '个', alise: item.name, visible: true})
                  this.setState({routineShow, routineMapShow})
                  that.showPoint(routinepoint, item.name)
                }else{
                  this.detailShow(item.name, '个', true)
                  const ii = _.filter(routineMapShow, item.name)[0]
                  that.showPoint(ii[item.name], item.name)
                }
              }else{
                this.detailShow(item.name, '个', false)
                map.getMapDisplay().removeLayer(`layeridPoint_${item.name}`);
              }
            }
            if(item.type === '关键线'){
              if(keys.length > that.state.selectedRowKeys.length){
                if(!_.some(routineMapShow, item.name)){
                  routineMapShow.push({[item.name]: pathPoint})
                  let lineLength = 0
                  pathPoint && pathPoint.length > 0 && pathPoint.map((item1, index) => {
                    lineLength += Math.sqrt( Math.pow(item1.x,2) + Math.pow(item1.y,2) )
                    that.showPath(item1, `关键线_${index}`)
                  })
                  routineShow.push({data: lineLength, unit: 'm', alise: item.name, visible: true})
                  this.setState({routineMapShow, routineShow})
                }else{
                  this.detailShow(item.name, 'm', true)
                  pathPoint && pathPoint.length > 0 && pathPoint.map((item1, index) => {
                    that.showPath(item1, `关键线_${index}`)
                  })
                }
              }else{
                this.detailShow(item.name, 'm', false)
                pathPoint && pathPoint.length > 0 && pathPoint.map((item1, index) => {
                  map.getMapDisplay().removeLayer(`layeridPoint_关键线_${index}`);
                })
              }
            }
            if(item.type === '设备'){
              if(keys.length > that.state.selectedRowKeys.length){
                if(!_.some(routineMapShow, item.name)){
                  const layerid = _.find(layeridAll, ['name', item.name])
                  if(layerid && layerid.layerid){
                    that.areaSelect(item.type, item.name, layerid.layerid, layerid.filter)
                  }else{
                    routineMapShow.push({[item.name]: []});
                    routineShow.push({data: 0, unit: '个', alise: item.name, visible: true});
                    this.setState({routineMapShow, routineShow})
                  }
                }else{
                  this.detailShow(item.name, '个', true)
                  const ii = _.filter(routineMapShow, item.name)[0]
                  that.showPoint(ii[item.name], item.name)
                }
              }else{
                this.detailShow(item.name, '个', false)
                map.getMapDisplay().removeLayer(`layeridPoint_${item.name}`);
              }
            }
            // if(item.type === '管段'){
            //   if(keys.length > that.state.selectedRowKeys.length){
            //     if(!_.some(routineMapShow, item.name)){
            //       const layerid = _.find(layeridAll, ['name', item.name])
            //       that.areaSelect(item.type, item.name, layerid.layerid, layerid.filter)
            //     }else{
            //       this.detailShow(item.name, 'm', true)
            //       const {pipeDocts} = that.state
            //       pipeDocts.length > 0 && pipeDocts.map(item1 => {
            //         if(item1.name === item.name){
            //           that.showPath(item1.docts, item1.id)
            //         }
            //       })
            //     }
            //   }else{
            //     this.detailShow(item.name, 'm', false)
            //     const {pipeDocts} = that.state
            //     pipeDocts.length > 0 && pipeDocts.map(item1 => {
            //       if(item1.name === item.name){
            //         map.getMapDisplay().removeLayer(`testlayer_${item1.id}`);
            //       }
            //     })
            //   }
            // }
          })

        }

      this.setState({
        selectedRowKeys: keys,
        selectedRows: rows,
      })
      that.props.eqObject(keys, layerName)
    },
    getCheckboxProps: record => {
      const that = this;
      return {defaultChecked : that.props.oldLayerids.some(item => Number(item) === Number(record.gid))}
    },
  };

  showDetail = (record) => {
    console.log(record, 'record')
    this.setState({
      feedbackData: record.formFields || [],
      isShowDetail: true,
    })
  };

  cancelHandler = () => {
    const oldLayerName = []
    const {oldLayerids, layeridAll, map} = this.props;
    const {routineMapShow, routineShow} = this.state;
    layeridAll && layeridAll.map(item => {
      if(oldLayerids.includes(item.id)){
        oldLayerName.push(item.name)
      }
    })
    routineMapShow && routineMapShow.map(item1 => {
      if(!oldLayerName.includes(Object.keys(item1)[0])){
        map.getMapDisplay().removeLayer(`layeridPoint_${Object.keys(item1)[0]}`);
      }
    })
    this.props.cancelHandler()
  };

  clearselectedRow = () => {
    this.setState({
        selectedRowKeys: [],
        selectedRows: [],
    })
  }

  showInfo = (routineMapShow, routineShow) => {
    this.setState({routineMapShow, routineShow})
  }


  handOk = () =>{
    const {routineMapShow, routineShow, isShowRoutine} = this.state;
    this.props.handOk(routineMapShow, routineShow, isShowRoutine)
  };
  cancelDetail = () => {
    this.setState({isShowDetail: false});
  };


  render() {
    const { feedbackData, isShowRoutine, routineShow} = this.state;
    const { user, patrolEqData, areaName, oldLayerids, areaPoint, routinepoint} = this.props;
    let areaTemp = Object.assign([], this.props.areaData || []);

    const that = this
    // 表格列
    const columns = [
      {
        title: '设备名称', dataIndex: 'name', key: 'name',
      }, {
        title: '设备类型', dataIndex: 'type', key: 'type',
      }, {
        title: '反馈项', dataIndex: 'feedback', key: 'feedback',
        render(text, record) {
          return <div onClick={() => that.showDetail(record)} style={{display: record.isfeedback === 1 ? 'block' : 'none'}}><Icon type="profile" /></div>;
        }
      }
    ];
    const columnsD = [
      {
        title: '反馈项名称', dataIndex: 'alias', key: 'alias',
        render(text, record) {
          return (<div className={styles['textOverflow']}>
                    <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
              </div>)
        }
      }
    ];



    return (
      <div style={{width: '100%', height: 'calc(100vh - 120px)'}}>
          <Dialog title='设备对象选择' width={620} onClose={this.cancelHandler}>
              {/* <Tabs defaultActiveKey="1">
                <TabPane tab="设备对象" key="1"> */}
                  <div style={{verticalAlign: 'top'}}>
                    <div style={{width: this.state.isShowDetail ? '70%' : '100%', display: 'inline-block'}}>
                      <Table
                        rowKey={(record) => record.gid}
                        columns={columns}
                        dataSource={patrolEqData}
                        rowSelection={this.rowSelection}
                        pagination={false}
                      />
                    </div>
                    <div style={{width: this.state.isShowDetail ? '30%' : 0, display: this.state.isShowDetail ? 'inline-block': 'none', verticalAlign: 'top'}} id='table_r'>
                      <Table
                        rowKey={(record) => record.gid}
                        columns={columnsD}
                        dataSource={feedbackData}
                        pagination={false}
                        scroll={{y: patrolEqData.length * 41}}
                      />
                    </div>
                    <div style={{textAlign: 'center', margin: '10px 0'}}>
                      <Button type="ghost" style={{width: '70px', height: '28px', marginRight: '5px'}}onClick={this.cancelHandler}>取消</Button>
                      <Button type="primary" style={{width: '70px', height: '28px'}} onClick={this.handOk}>确定</Button>
                      <Button type="ghost" style={{width: '70px', height: '28px', display: this.state.isShowDetail ? 'inline-block': 'none', marginLeft: 275}} onClick={this.cancelDetail}>收起<Icon type="double-right" /></Button>
                    </div>
                  </div>
                {/* </TabPane>
                <TabPane tab="筛选条件" key="2">
                  123
                  {/* <QueryFilter key="MapQuery" mapTarget={this.props.map} onClose={() => this.setState({queryVisible: false})} /> */}
                {/* </TabPane> */}
              {/* </Tabs> */}
              
          </Dialog>
        <div style={{display: isShowRoutine ? 'block' : 'none'}} className={styles.routine}>
          <p style={{marginTop: 4}}>区域：{areaName}</p>
          <p>责任人：{user.trueName}</p>
          {routineShow.length > 0 && routineShow.map((item, index) =>
            <p key={index} style={{display: item.visible ? 'block' : 'none'}}>{item.alise}:{' '}{item.data}{item.unit}</p>
          )}
        </div>
        <Spin size="large" spinning={this.state.sLoading}/>
      </div>
    )
  }
}
