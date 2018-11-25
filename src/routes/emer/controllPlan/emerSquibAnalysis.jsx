/**
 * 爆管分析  物质
 */

import React from 'react';
import {Table, Input, Button, Checkbox, message, Tabs} from 'antd';
import {connect} from 'dva';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import styles from '../css/emerMonitor.css';
//  爆管影响的用户
import drillSquibUserData from '../data/squibAnalysisUser.js';
// import resData from '../data/res.js';
import EmerOneContent from '../leftPlane/emerOneContent.jsx';
import layerManagementStyles from '../css/emerLayerManagement.css';

const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

@connect(state => ({
  user: state.login.user,
  token: state.login.token,
  map: state.emerLfMap.map, // 地图
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))
export default class EmerSquibAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.isClickLine = false; // 是否处于点击管线状态
    this.mapTool = null; // 点击管线模块
    this.clickPipeData = null; // 点选的管段信息
    this.map = this.props.map; // 地图模块
    this.state = {
      layerArr: ['area', 'pipe', 'valve', 'user'], // 显示的图层
      valvesData: [], // 阀门数据
      usersData: [], // 工商户数据
      dataColu: [
        {id: 'pipe', name: '影响管段', value: 0},
        {id: 'area', name: '影响区域', value: 0},
        {id: 'valve', name: '需关阀门', value: 0},
        {id: 'user', name: '影响用户', value: 0},
      ],
    };
  }

  componentDidMount = () => {
    this.handleClickAnalysis();
    // let cbs = $('#c > div > label > span');
    // let keys = Object.keys(cbs).filter((key) => Number(key) >= 0);
    // keys.forEach((k) => cbs[k].style.color = 'white');
  }

  componentWillUnmount = () => {
    this.handleClickClear();
    this.setState = (state, callback) => {};
  }

  // 处理“分析”事件
  handleClickAnalysis = () => {
    let that = this;
    const {currentEmerEvent} = this.props;
    // 清除所有图层
    this.handleClickClear();
    if (!this.clickPipeData) {
      if (currentEmerEvent && currentEmerEvent.isDrill) {
        this.getSquibAnalysis('132057');
      }
    } else {
      this.getSquibAnalysis(this.clickPipeData.pipe.value);
    }
    if (this.isClickLine) {
      that.mapTool.destroy();
      this.map.getMapDisplay().removeLayer('testlayer');
      this.isClickLine = false;
    }
  }

  // 爆管分析的管段筛选
  handleFilterPipe = (pipeData) => {
    let pipeArr = [];
    for (let i = 0; i < pipeData.length; i += 1) {
      let p = pipeData[i];
      if (p.attributes['压力级别'].indexOf('中') > -1 || p.attributes['压力级别'].indexOf('高') > -1) {
        pipeArr.push(p);
      }
    }
    return pipeArr;
  }

  // 获取点击的管线
  getLine = (geometry, callback) => {
    let mapExtent = this.map.getMapDisplay().getExtend();
    this.props.dispatch({
      type: 'emerLfMap/identify',
      payload: {
        tolerance: 10,
        returnGeometry: true,
        imageDisplay: '1280,800,96',
        geometry: `${geometry.x},${geometry.y}`,
        geometryType: 'esriGeometryPoint',
        mapExtent: `${mapExtent.xmin},${mapExtent.ymin},${mapExtent.xmax},${mapExtent.ymax}`,
        layers: 'visible',
        f: 'json',
      },
      callback: (res) => {
        callback(res);
      },
    });
  };

  // 点选  选取管段
  OnClickLine = () => {
    let that = this;
    if (this.isClickLine) {
      that.mapTool.destroy();
      this.map.getMapDisplay().removeLayer('testlayer');
      this.isClickLine = false;
      return;
    }
    this.isClickLine = true;
    this.map.getMapDisplay().removeLayer('testlayer');
    this.mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geom) => {
      that.getLine(geom, (res) => {
        if (res.results && res.results.length === 0) {
          message.warn('管线或管点未找到');
          return;
        }
        if (res.results[0].geometryType === 'esriGeometryPoint') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管点信息',
              content: [{
                name: '编号', value: res.results[0].attributes.编号,
              }, {
                name: '种类', value: res.results[0].attributes.种类,
              }, {
                name: '施工单位', value: res.results[0].attributes.施工单位,
              }, {
                name: '埋深', value: `${res.results[0].attributes.埋深}米`,
              }, {
                name: '位置', value: res.results[0].attributes.位置,
              }],
            },
          };
          that.map.popup(param);
        } else if (res.results[0].geometryType === 'esriGeometryPolyline') {
          let param = {
            x: geom.x,
            y: geom.y,
            info: {
              title: '管段信息',
              content: [{
                name: '编号', value: res.results[0].attributes.编号,
              }, {
                name: '管长', value: res.results[0].attributes.管长,
              }, {
                name: '管径', value: res.results[0].attributes.管径,
              }, {
                name: '管材', value: res.results[0].attributes.管材,
              }, {
                name: '压力级别', value: res.results[0].attributes.压力级别,
              }, {
                name: '敷设方式', value: res.results[0].attributes.敷设方法,
              }, {
                name: '防腐方法', value: res.results[0].attributes.防腐方法,
              }],
            },
          };
          that.map.popup(param);
          // 画出被点击管线
          let paths = res.results[0].geometry.paths[0];
          that.map.getMapDisplay().polyline({
            id: 'paramLine',
            layerId: 'testlayer',
            width: 5,
            layerIndex: 10,
            dots: [{x: paths[0][0], y: paths[0][1]}, {x: paths[1][0], y: paths[1][1]}],
          });
          // 保存点选管段信息
          this.clickPipeData = {
            gid: res.results[0].attributes['编号'],
            pipe: res.results[0],
            geom,
          };
        }
      });
    });
    this.map.switchMapTool(this.mapTool);
  };

  // 获取爆管数据
  getSquibAnalysis = (objectId) => {
    let {currentEmerEvent} = this.props;
    let data = {
      ecode: this.props.user.ecode,
      eventId: currentEmerEvent.gid,
      wk: 'baidu',
    };
    if (this.clickPipeData) {
      data.pipeId = objectId;
      data.pipeGeom = `${this.clickPipeData.geom.x},${this.clickPipeData.geom.y}`;
    }
    this.props.dispatch({
      type: 'emer/getController',
      payload: data,
      callback: (res) => {
        this.setState({
          valvesData: res.data.valves,
          usersData: res.data.users,
          dataColu: [
            {id: 'pipe', name: '影响管段', value: res.data.closeLines.results.length},
            {id: 'area', name: '影响区域', value: 0},
            {id: 'valve', name: '需关阀门', value: res.data.valves.results.length},
            {id: 'user', name: '影响用户', value: res.data.users.results.length},
          ],
          // usersData: res.users.results,
        });
        // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
        this.showAllLayers(res.data);
      },
    });
    // this.setState({
    //     valvesData: resData.data.valves,
    //     usersData: resData.data.users,
    //     // usersData: res.users.results,
    // });
    // // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
    // this.showAllLayers(resData.data);
  };

  // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
  showAllLayers = (res) => {
    this.handleShowSquibAnalysisResult(res.closearea.rings[0], 'area');
    this.handleShowSquibAnalysisResult(res.valves.results, 'valve');
    this.handleShowSquibAnalysisResult(res.users.results, 'user');
    this.handleShowSquibAnalysisResult(this.handleFilterPipe(res.closeLines.results), 'pipe');
  };

  // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
  handleShowSquibAnalysisResult = (data, type) => {
    const {currentEmerEvent} = this.props;
    if (type === 'area') {
      let areaParam = {
        id: `${currentEmerEvent.gid}`,
        layerId: 'area',
        dots: data.map((v) => ({x: v[0], y: v[1]})),
        fillcolor: [255, 0, 0, 0.2],
      };
      this.map.getMapDisplay().polygon(areaParam);
    } else if (type === 'valve') {
      for (let i = 0; i < data.length; i += 1) {
        let param = {
          id: `${data[i].attributes.gid}`,
          layerId: 'valve',
          src: './images/emer/valve.png',
          width: 30,
          height: 30,
          angle: 0,
          x: data[i].geometry.x,
          y: data[i].geometry.y,
        };
        this.map.getMapDisplay().image(param);
      }
    } else if (type === 'user') {
      for (let i = 0; i < data.length; i += 1) {
        let param = {
          id: `${data[i].attributes.gid}`,
          layerId: 'user',
          src: './images/emer/layerIcon/business.png',
          width: 42,
          height: 42,
          angle: 0,
          x: data[i].geometry.x,
          y: data[i].geometry.y,
        };
        this.map.getMapDisplay().image(param);
      }
    } else if (type === 'pipe') {
      // 筛选出中、高压管段
      for (let i = 0; i < data.length; i += 1) {
        let line = data[i].geometry.paths[0];
        let pipeParam = {
          id: `pipeId_${i}`,
          layerId: 'pipe',
          dots: line.map((v) => ({x: v[0], y: v[1]})),
        };
        this.map.getMapDisplay().polyline(pipeParam);
      }
    }
  };

  // “清除”按钮，清除所有图层
  handleClickClear = () => {
    this.state.layerArr.forEach((v) => {
      this.map.getMapDisplay().removeLayer(v);
    });
  };

  // 显示图层改变1
  onChangeLayers = (checkedValues) => {
    let currentLayers = this.state.layerArr;
    if (currentLayers.length < checkedValues.length) {
      let layer = checkedValues.filter((v) => {
        return currentLayers.indexOf(v) === -1;
      })[0];
      this.map.getMapDisplay().show(layer);
    } else {
      let layer = currentLayers.filter((v) => {
        return checkedValues.indexOf(v) === -1;
      })[0];
      this.map.getMapDisplay().hide(layer);
    }
    this.setState({
      layerArr: checkedValues,
    });
  };

  checkboxChaged = (id, checked) => {
    if (checked) {
      this.map.getMapDisplay().show(id);
    } else {
      this.map.getMapDisplay().hide(id);
    }
  }

  handleSendStopGasNoticeTotal = (handleSendStopGasNotice) => {
    let arr = this.state.usersData.results || [];
    for (let elem of arr.values()) {
      handleSendStopGasNotice(elem.attributes.电话, '由于管道泄露，今天12点暂停燃气供应');
    }
  }

  render() {
    let dataColu = this.state.dataColu;
    return (
      <EmerOneContent
        style={{width: '100%', height: 190}}
        title="控制方案"
        body={<div className={styles.SquibView}>
          <div className={styles.row1}>
            <div className={styles.title}>管道编号:</div>
            <div className={styles.input}>
              <input
                disabled
                style={{height: 30, border: 'none', borderRadius: 4, width: 100}}
                value={this.clickPipeData ? this.clickPipeData.gid : this.props.currentEmerEvent.pipeId}
              />{}
            </div>
            <div className={styles.buttons} onClick={this.OnClickLine}>点选</div>
            <div className={styles.buttons} onClick={this.handleClickClear}>清除</div>
            <div className={styles.buttons} onClick={this.handleClickAnalysis}>分析</div>
          </div>
          <div id="c" className={styles.row2}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <MyCheckBox icon={styles.mycb_1_1} id={dataColu[1].id} name={dataColu[1].name} value={null} checked onChange={this.checkboxChaged} style={{marginRight: 20}} />
              <MyCheckBox icon={styles.mycb_1_2} id={dataColu[2].id} name={`${dataColu[2].name}:`} value={dataColu[2].value} checked onChange={this.checkboxChaged} />
            </div>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <MyCheckBox icon={styles.mycb_1_3} id={dataColu[0].id} name={`${dataColu[0].name}:`} value={dataColu[0].value} checked onChange={this.checkboxChaged} style={{marginRight: 20}} />
              <MyCheckBox icon={styles.mycb_1_4} id={dataColu[3].id} name={`${dataColu[3].name}:`} value={dataColu[3].value} checked onChange={this.checkboxChaged} />
            </div>
          </div>
          <div className={styles.row4}>
            <div className={styles.buttons} onClick={() => this.props.details()}>
              <img alt="收缩" style={{width: 14, height: 14, marginRight: 7, marginTop: -4}} src="../../../images/emer/收缩.png" />详情
            </div>
            <div className={styles.stopAir} onClick={this.handleSendStopGasNoticeTotal.bind(this, this.props.sendMsg)}>
              停气通知
            </div>
          </div>
        </div>
        }
      />
    );
  }
}

class MyCheckBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
    };
  }

  componentDidMount = () => {
    if (this.props.checked) {
      this.setState({checked: true});
    }
  }

  render = () => {
    return (
      <div className={styles.mycb} style={this.props.style}>
        <div className={this.props.icon} />
        <div className={styles.mycb_2}>{this.props.name}</div>
        <div className={styles.mycb_3}>{this.props.value}</div>
        <div className={styles.mycb_4}>
          <span
            className={styles.checkboxL}
            onClick={() => {
              const flag = this.state.checked;
              this.setState({checked: !flag});
              this.props.onChange(this.props.id, !flag);
            }}
          >
            <input type="checkbox" checked={this.state.checked} id={this.props.id} className={styles.checkboxI}/>
            <span className={styles.checkboxR} />
          </span>
        </div>
      </div>
    );
  }
}

