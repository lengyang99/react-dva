import React from 'react';
import {connect} from 'dva';
import {Table, Input, Button, Checkbox, message, Tabs} from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';
import EmerDialog from '../../../components/EmerDialog';
import styles from '../css/emerMonitor.css';

const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;

//  爆管影响的用户
import drillSquibUserData from '../data/squibAnalysisUser.js';

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  currentClickEvent: state.emerLfMap.currentClickEvent, // 事件列表所点击的事件
  isShowControllPlan: state.emerLfMap.isShowControllPlan, // 是否展示控制方案(弹窗)
}))
export default class SquibAnalysis extends React.Component {
  constructor(props) {
    super(props);
    this.isClickLine = false; // 是否处于点击管线状态
    this.mapTool = null; // 点击管线模块
    this.clickPipeData = null; // 点选的管段信息
    this.map = this.props.map; // 地图模块
    this.state = {
      layerArr: ['closearea', 'closeLines', 'valves', 'users'], // 显示的图层
      valvesData: [], // 阀门数据
      usersData: [], // 工商户数据
      data: null,
    };
    this.theEmerEvent = this.props.currentEmerEvent || this.props.currentClickEvent;
    // this.clickPipeData = {
    //   gid: res.results[0].attributes['编号'],
    //   pipe: res.results[0],
    //   geom,
    // };
  }

  componentDidMount = () => {
    this.handleClickAnalysis();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  }

  // 处理“分析”事件
  handleClickAnalysis = () => {
    let that = this;
    // 清除所有图层
    this.handleClickClear();
    if (!this.clickPipeData) {
      if (this.theEmerEvent.isDrill) {
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
    let data = {
      ecode: this.props.user.ecode,
      eventId: this.theEmerEvent.gid,
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
          data: res.data,
          valvesData: res.data.valves.results,
          usersData: res.data.users.results.map((e, i) => {
            return e.attributes;
          }),
          // usersData: res.users.results,
        });
        // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
        this.showAllLayers(res.data);
      },
    });
  };

  // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
  showAllLayers = (res) => {
    this.handleShowSquibAnalysisResult(res.closearea.rings[0], 'closearea');
    this.handleShowSquibAnalysisResult(res.valves.results, 'valves');
    this.handleShowSquibAnalysisResult(res.users.results, 'users');
    this.handleShowSquibAnalysisResult(this.handleFilterPipe(res.closeLines.results), 'closeLines');
  };

  // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
  handleShowSquibAnalysisResult = (data, type) => {
    if (type === 'closearea') {
      let areaParam = {
        id: `${this.theEmerEvent.gid}`,
        layerId: 'closearea',
        dots: data.map((v) => ({x: v[0], y: v[1]})),
        fillcolor: [255, 0, 0, 0.2],
      };
      this.map.getMapDisplay().polygon(areaParam);
    } else if (type === 'valves') {
      for (let i = 0; i < data.length; i += 1) {
        let param = {
          id: `${data[i].attributes.gid}`,
          layerId: 'valves',
          src: './images/emer/valve.png',
          width: 30,
          height: 30,
          angle: 0,
          x: data[i].geometry.x,
          y: data[i].geometry.y,
        };
        this.map.getMapDisplay().image(param);
      }
    } else if (type === 'users') {
      for (let i = 0; i < data.length; i += 1) {
        let param = {
          id: `${data[i].attributes.gid}`,
          layerId: 'users',
          src: './images/emer/layerIcon/business.png',
          width: 42,
          height: 42,
          angle: 0,
          x: data[i].geometry.x,
          y: data[i].geometry.y,
        };
        this.map.getMapDisplay().image(param);
      }
    } else if (type === 'closeLines') {
      // 筛选出中、高压管段
      for (let i = 0; i < data.length; i += 1) {
        let line = data[i].geometry.paths[0];
        let pipeParam = {
          id: `pipeId_${i}`,
          layerId: 'closeLines',
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

  // 显示图层改变
  onChangeLayers = (checkedValues) => {
    let currentLayers = this.state.layerArr;
    if (currentLayers.length < checkedValues.length) {
      let layer = checkedValues.filter((v) => { return currentLayers.indexOf(v) === -1; })[0];
      this.map.getMapDisplay().show(layer);
    } else {
      let layer = currentLayers.filter((v) => { return checkedValues.indexOf(v) === -1; })[0];
      this.map.getMapDisplay().hide(layer);
    }
    this.setState({
      layerArr: checkedValues,
    });
  };


  checkboxChaged = (id, checked) => {
    let currentLayers = [...this.state.layerArr];
    if (checked) {
      this.map.getMapDisplay().show(id);
      currentLayers.push(id);
    } else {
      this.map.getMapDisplay().hide(id);
      currentLayers = currentLayers.filter((v) => v !== id);
    }
    this.setState({
      layerArr: currentLayers,
    });
  }

  handleSendStopGasNoticeTotal = (handleSendStopGasNotice) => {
    let arr = this.state.usersData;
    for (let elem of arr.values()) {
      handleSendStopGasNotice(elem.电话, '由于管道泄露，今天12点暂停燃气供应');
    }
  }

  render = () => {
    const {onCancel, handleSendStopGasNotice} = this.props;
    console.log(this.props.currentEmerEvent, "★")
    // 阀门表columns
    const valveColumns = [{
      title: '#',
      width: 38,
      render: (text, record, index) => (
        <span>{index + 1}</span>
      ),
    }, {
      title: '阀门编号', dataIndex: 'attributes[编号]', width: 85,
    }, {
      title: '位置', dataIndex: 'attributes[位置]', width: 200,
    }, {
      title: '经度', dataIndex: 'geometry.x', width: 90,
    }, {
      title: '纬度', dataIndex: 'geometry.y', width: 90,
    }];
    // 影响用户表columns
    const userColumns = [{
      title: '#',
      width: 38,
      render: (text, record, index) => (
        <span>{index + 1}</span>
      ),
    }, {
      title: '用户名称', dataIndex: '用户名称', width: 110,
    }, {
      title: '地址', dataIndex: '用户地址', width: 200,
    }, {
      title: '电话', dataIndex: '电话', width: 120,
    }];
    // 图层配置信息
    const plainOptions = [
      { label: '影响区域', value: 'closearea' },
      { label: '管段', value: 'closeLines' },
      { label: '阀门', value: 'valves' },
      { label: '影响用户', value: 'users' },
    ];
    return (
      <div>
        <div style={{display: this.props.isShowControllPlan ? 'block' : 'none'}}>
          <Dialog
            title="控制方案"
            width={420}
            onClose={onCancel}
            position={{
              top: 61,
              left: 400,
            }}
          >
            <div style={{margin: 10}}>
              <div>
                <span>
                  <span>管道编号:</span>
                  <Input disabled value={this.clickPipeData ? this.clickPipeData.gid : ''} style={{width: 115}} />&nbsp;&nbsp;&nbsp;
                </span>
                <span>
                  <Button type="primary" size="small" onClick={this.OnClickLine}>点选</Button>&nbsp;&nbsp;&nbsp;
                  <Button size="small" onClick={(layerIds) => this.handleClickClear()}>清除</Button>&nbsp;&nbsp;&nbsp;
                  <Button type="primary" size="small" onClick={this.handleClickAnalysis}>分析</Button>
                </span>
              </div>
              <div>
                <span>图层:</span>
                <div style={{display: 'inline-block'}}>
                  <CheckboxGroup options={plainOptions} value={this.state.layerArr} onChange={this.onChangeLayers} />
                </div>
              </div>
              <Tabs defaultActiveKey="1">
                <TabPane tab="需要关闭的阀门" key="1">
                  <Table
                    rowKey={record => record.attributes.gid}
                    bordered={true}
                    columns={valveColumns}
                    dataSource={this.state.valvesData}
                    scroll={{x: 420, y: 156}}
                    pagination={false}
                    onRowDoubleClick={(record, i) => { this.props.map.centerAt(record.geometry); }}
                  /></TabPane>
                <TabPane tab="影响的用户" key="2">
                  <Table
                    rowKey={record => record.gid}
                    bordered={true}
                    columns={userColumns}
                    dataSource={this.state.usersData}
                    scroll={{x: 420, y: 156}}
                    pagination={false}
                  />
                </TabPane>
              </Tabs>
              <div style={{textAlign: 'right', marginTop: 8}}>
                <Button type="primary" size="small" onClick={this.handleSendStopGasNoticeTotal.bind(this, handleSendStopGasNotice)}>
                  发送停气通知
                </Button>
              </div>
            </div>
          </Dialog>
        </div>
        <div style={{position: 'absolute', top: 575, left: 10, width: 380}}>
          <EmerDialog title="控制方案" width={380} height={195}>
            <div className={styles.SquibView}>
              <div className={styles.row1}>
                <div className={styles.title}>管道编号:</div>
                <div className={styles.input}>
                  <input
                    disabled
                    style={{height: 30, border: 'none', borderRadius: 4, width: 110}}
                    value={this.clickPipeData ? this.clickPipeData.gid : (this.props.currentEmerEvent ? this.props.currentEmerEvent.pipeId : '')}
                  />
                </div>
                <div className={styles.buttons} onClick={this.OnClickLine}>点选</div>
                <div className={styles.buttons} onClick={this.handleClickClear}>清除</div>
                <div className={styles.buttons} onClick={this.handleClickAnalysis}>分析</div>
              </div>
              <div id="c" className={styles.row2}>
                {/*<MyCheckboxGroup options={miniPlainOptions} value={this.state.layerArr} onChange={this.onChangeLayers} />*/}
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                  <MyCheckBox icon={styles.mycb_1_1} id='closearea' name='影响区域' value={null} checked={this.state.layerArr.indexOf('closearea') !== -1} onChange={this.checkboxChaged} style={{marginRight: 20}} />
                  <MyCheckBox icon={styles.mycb_1_2} id='valves' name='需关阀门' value={this.state.valvesData.length} checked={this.state.layerArr.indexOf('valves') !== -1} onChange={this.checkboxChaged} />
                </div>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
                  <MyCheckBox icon={styles.mycb_1_3} id='closeLines' name='影响管段' value={this.state.data ? this.state.data.closeLines.results.length : 0} checked={this.state.layerArr.indexOf('closeLines') !== -1} onChange={this.checkboxChaged} style={{marginRight: 20}} />
                  <MyCheckBox icon={styles.mycb_1_4} id='users' name='影响用户' value={this.state.usersData.length} checked={this.state.layerArr.indexOf('users') !== -1} onChange={this.checkboxChaged} />
                </div>
              </div>
              <div className={styles.row4}>
                <div className={styles.buttons} onClick={() => this.props.details()}>
                  <img alt="收缩" style={{width: 14, height: 14, marginRight: 7, marginTop: -4}} src="../../../images/emer/收缩.png" />详情
                </div>
                <div className={styles.stopAir} onClick={this.handleSendStopGasNoticeTotal.bind(this, handleSendStopGasNotice, this.state.usersData)}>
                  停气通知
                </div>
              </div>
            </div>
          </EmerDialog>
        </div>
      </div>
    );
  }
}

class MyCheckBox extends React.Component {
  constructor(props) {
    super(props);
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
              const flag = this.props.checked;
              this.props.onChange(this.props.id, !flag);
            }}
          >
            <input type="checkbox" checked={this.props.checked} id={this.props.id} className={styles.checkboxI}/>
            <span className={styles.checkboxR} />
          </span>
        </div>
      </div>
    );
  }
}
