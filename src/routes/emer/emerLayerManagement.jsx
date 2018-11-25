import React from 'react';
import {Icon, message} from 'antd';
import {connect} from 'dva';
import {DrawPointMapTool} from '../../components/Map/common/maptool/DrawPointMapTool';
import styles from './css/emerLayerManagement.css';

const mapEvent = 'mapEvent';
const layerArr = ['气源-gasSource', '管线-pipeLine', '应急物资点-emerMaterialPoint', '应急人员-emerUser',
  '应急事件-currentEmerEvent', '车辆-car', '监测点-monitorPoint'];

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))

export default class EmerLayerManagement extends React.Component {
  constructor(props) {
    super(props);
    this.isClickLine = false;
    this.mapTool = null;
  }

  componentDidMount = () => {
    this.handleSelectAllLayer();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };
  //  http://10.39.12.26:6080/arcgis/rest/services/xagis/lfgw_bd/MapServer
  // /ServiceEngine/rest/services/NetServer/bdgw/identify
  getLine = (geometry, mapExtent, callback) => {
    // let url = this.props.map.getMapCfg().map_service[0].maps[0].url.substring(24);
    this.props.dispatch({
      type: 'emerLfMap/identify',
      payload: {
        tolerance: 10,
        returnGeometry: true,
        imageDisplay: '1280,800,96',
        geometry: `${geometry.x},${geometry.y}`,
        geometryType: 'esriGeometryPoint',
        // sr: 2436,
        // mapExtent: '0.000000,0.000000,0.000000,0.000000',
        mapExtent: `${mapExtent.xmin},${mapExtent.ymin},${mapExtent.xmax},${mapExtent.ymax}`,
        layers: 'visible', // 管线
        f: 'json',
      },
      callback: (res) => {
        callback(res);
      },
    });
  };

  // localToBaidu = (paths, callback) => {
  //     http.get({
  //         svn: 'COOR_LOCAL_TO_BD',
  //         path: '/ServiceEngine/rest/services/TransDataServer/coortrans',
  //         data: {
  //             coors: paths[0][0] + ',' + paths[0][1] + ',' + paths[1][0] + ',' + paths[1][1],
  //             ecode: '0001',
  //             fromSRID: 'LOCAL',
  //             toSRID: 'BAIDU',
  //         },
  //     }).then((res) => {
  //         callback(res);
  //     }).catch((err) => {
  //         console.error(err);
  //     });
  // };
  //
  // baiduToLocal = (paths, callback) => {
  //     let coors = '';
  //     paths.map((path) => {
  //         coors = coors + ',' + path.x + ',' + path.y
  //     });
  //     http.get({
  //         svn: 'COOR_LOCAL_TO_BD',
  //         path: '/ServiceEngine/rest/services/TransDataServer/coortrans',
  //         data: {
  //             coors: coors.substring(1),
  //             ecode: '0001',
  //             fromSRID: 'BAIDU',
  //             toSRID: 'LOCAL',
  //         },
  //     }).then((res) => {
  //         callback(res);
  //     }).catch((err) => {
  //         console.error(err);
  //     });
  // };

  OnClickLine = () => {
    let that = this;
    if (this.isClickLine) {
      // that.props.appEvent.emit(mapEvent + '.DrawToolBar.deactivate');
      that.mapTool.destroy();
      // that.props.appEvent.emit(mapEvent + '.mapDisplay.clearLayer', 'testlayer');
      this.props.map.getMapDisplay().removeLayer('testlayer');
      this.isClickLine = false;
      return;
    }
    this.isClickLine = true;
    // that.props.appEvent.emit(mapEvent + '.mapDisplay.clearLayer', 'testlayer');
    this.props.map.getMapDisplay().removeLayer('testlayer');
    this.mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      // this.props.appEvent.emit('mapEvent.DrawToolBar.activate', 'POINT', function (geom, currentTarget) {
      let mapExtent = {};
      // let localGeom = {};
      mapExtent = that.props.map.getMapDisplay().getExtend();
      // that.props.appEvent.emit('mapEvent.mapDisplay.getExtend', (res) => {
      //     mapExtent = res;
      // });
      // that.baiduToLocal([{x: mapExtent.xmin, y: mapExtent.ymin}, {x: mapExtent.xmax, y: mapExtent.ymax}, geom], (res) => {
      // mapExtent.xmin = res[0].x;
      // mapExtent.ymin = res[0].y;
      // mapExtent.xmax = res[1].x;
      // mapExtent.ymax = res[1].y;
      // localGeom = res[2];
      that.getLine(geom, mapExtent, (res) => {
        if (res.results && res.results.length === 0) {
          message.warn('管线未找到');
          return;
        }
        if (res.results[0].geometryType === 'esriGeometryPoint') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管点信息',
              content: [{
                name: '编号', value: (!res.results[0].attributes.编号 || res.results[0].attributes.编号 === 'Null') ? '' : res.results[0].attributes.编号,
              }, {
                name: '种类', value: (!res.results[0].attributes.种类 || res.results[0].attributes.种类 === 'Null') ? '' : res.results[0].attributes.种类,
              }, {
                name: '施工单位', value: (!res.results[0].attributes.施工单位 || res.results[0].attributes.施工单位 === 'Null') ? '' : res.results[0].attributes.施工单位,
              }, {
                name: '埋深', value: (!res.results[0].attributes.埋深 || res.results[0].attributes.埋深) === 'Null' ? '' : `${res.results[0].attributes.埋深}米`,
              }, {
                name: '位置', value: (!res.results[0].attributes.位置描述 || res.results[0].attributes.位置描述 === 'Null') ? '' : res.results[0].attributes.位置描述,
              }],
            },
          };
          that.props.map.popup(param);
          // that.props.appEvent.emit(mapEvent + '.mapOper.popup', param);
          // that.props.appEvent.emit(mapEvent + '.mapDisplay.point', param);
        } else if (res.results[0].geometryType === 'esriGeometryPolyline') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管段信息',
              content: [{
                name: '编号', value: (!res.results[0].attributes.编号 || res.results[0].attributes.编号 === 'Null') ? '' : res.results[0].attributes.编号,
              }, {
                name: '管长', value: (!res.results[0].attributes.管道长度 || res.results[0].attributes.管道长度 === 'Null') ? '' : res.results[0].attributes.管道长度,
              }, {
                name: '管径', value: (!res.results[0].attributes.管径 || res.results[0].attributes.管径 === 'Null') ? '' : res.results[0].attributes.管径,
              }, {
                name: '管材', value: (!res.results[0].attributes.管材 || res.results[0].attributes.管材 === 'Null') ? '' : res.results[0].attributes.管材,
              }, {
                name: '压力级别', value: (!res.results[0].attributes.压力级制 || res.results[0].attributes.压力级制 === 'Null') ? '' : res.results[0].attributes.压力级制,
              }, {
                name: '敷设方式', value: (!res.results[0].attributes.管道敷设方法 || res.results[0].attributes.管道敷设方法 === 'Null') ? '' : res.results[0].attributes.管道敷设方法,
              }, {
                name: '防腐方法', value: (!res.results[0].attributes.防腐类型 || res.results[0].attributes.防腐类型 === 'Null') ? '' : res.results[0].attributes.防腐类型,
              }],
            },
          };
          that.props.map.popup(param);
          // that.props.appEvent.emit(mapEvent + '.mapOper.popup', param);
          let paths = res.results[0].geometry.paths[0];
          that.props.map.getMapDisplay().polyline({
            id: 'paramLine',
            layerId: 'testlayer',
            width: 5,
            layerIndex: 10,
            dots: [{x: paths[0][0], y: paths[0][1]}, {x: paths[1][0], y: paths[1][1]}],
          });
          // that.props.appEvent.emit(mapEvent + '.mapDisplay.polyline', {
          //     id: 'paramLine', layerId: 'testlayer', width: 5, layerIndex: 10,
          //     dots: [{x: paths[0][0], y: paths[0][1]}, {x: paths[1][0], y: paths[1][1]}]
          // });
        }
      });
      // });
    });
    this.props.map.switchMapTool(this.mapTool);
  };

  // 控制图层的显示和隐藏
  handleCancelSelect = (layerId) => {
    let ele = document.getElementById(layerId);
    if (ele.checked) {
      ele.checked = false;
      // 关闭图层
      if (layerId === 'pipeLine') {
        document.getElementById('emer_net_lfjsd').style.display = 'none';
        this.props.map.getMapDisplay().hide(layerId);
      } else if (layerId === 'emerUser' || layerId === 'car') {
        this.props.map.getMapDisplay().hide(layerId);
        this.props.map.getMapDisplay().hide(`${layerId}_name`);
        this.props.map.getMapDisplay().hide(`${layerId}_dispatch`);
        this.props.map.getMapDisplay().hide(`${layerId}_call`);
        this.props.map.getMapDisplay().hide(`${layerId}_radio`);
      } else {
        this.props.map.getMapDisplay().hide(layerId);
      }
    } else {
      ele.checked = true;
      // 开启图层
      if (layerId === 'pipeLine') {
        // this.props.map.getMapDisplay().show(layerId);
        document.getElementById('emer_net_lfjsd').style.display = 'block';
      } else if (layerId === 'emerUser' || layerId === 'car') {
        this.props.map.getMapDisplay().show(layerId);
        this.props.map.getMapDisplay().show(`${layerId}_name`);
        this.props.map.getMapDisplay().show(`${layerId}_dispatch`);
        this.props.map.getMapDisplay().show(`${layerId}_call`);
        this.props.map.getMapDisplay().show(`${layerId}_radio`);
      } else {
        this.props.map.getMapDisplay().show(layerId);
      }
    }
  }

  toPointer = () => {
    window.frames[0].document.getElementById('app').style.cursor = 'pointer';
  };

  // 默认选中所有图层
  handleSelectAllLayer = () => {
    for (let i = 0; i < layerArr.length; i += 1) {
      let layerId = layerArr[i].split('-')[1];
      document.getElementById(layerId).checked = true;
    }
  }

  render = () => {
    return (
      <div className={styles.leftView}>
        <div className={styles.leftViewTitle}>地图展示</div>
        <div id={styles.layerManagementItem}>
          <table>
            <tbody>
              <tr>
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('gasSource')}>
                    <input type="checkbox" id="gasSource" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>气源</span>
                  </label>
                </td>
                <td className={styles.spaceTd} />
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('pipeLine')}>
                    <input type="checkbox" id="pipeLine" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>管线</span>
                  </label>
                  <span style={{marginLeft: 5}} onClick={this.OnClickLine}><Icon type="global" /></span>
                </td>
                <td className={styles.spaceTd} />
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('emerMaterialPoint')}>
                    <input type="checkbox" id="emerMaterialPoint" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>应急物资点</span>
                  </label>
                </td>
              </tr>
              <tr className={styles.spaceTr} />
              <tr>
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('emerUser')}>
                    <input type="checkbox" id="emerUser" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>外勤人员</span>
                  </label>
                </td>
                <td className={styles.spaceTd} />
                {/* <td>
                 <label className={styles.checkboxWrapper}
                 onClick={(layerId) => this.handleCancelSelect('business')}>
                 <input type='checkbox' id='business' className={styles.checkboxInput}/>
                 <span className={styles.checkboxReplace}></span>
                 <span className={styles.layerName}>工商户</span>
                 </label>
                 </td>
                 <td className={styles.spaceTd}></td> */}
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('currentEmerEvent')}>
                    <input type="checkbox" id="currentEmerEvent" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>应急事件</span>
                  </label>
                </td>
                <td className={styles.spaceTd} />
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('car')}>
                    <input type="checkbox" id="car" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>车辆</span>
                  </label>
                </td>
              </tr>
              <tr className={styles.spaceTr} />
              <tr>
                {/* <td>
                 <label className={styles.checkboxWrapper}
                 onClick={(layerId) => this.handleCancelSelect('car')}>
                 <input type='checkbox' id='car' className={styles.checkboxInput}/>
                 <span className={styles.checkboxReplace}></span>
                 <span className={styles.layerName}>车辆</span>
                 </label>
                 </td>
                 <td className={styles.spaceTd}></td> */}
                <td>
                  <label className={styles.checkboxWrapper} onClick={(layerId) => this.handleCancelSelect('monitorPoint')}>
                    <input type="checkbox" id="monitorPoint" className={styles.checkboxInput} />
                    <span className={styles.checkboxReplace} />
                    <span className={styles.layerName}>监测点</span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}
