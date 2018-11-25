import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Input, Button, Checkbox, message, Collapse, DatePicker, Spin, Icon, Row, Col } from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import EmerSquibAnalysis from '../controllPlan/emerSquibAnalysis.jsx';
import EmerDialog from '../../../components/EmerDialog';
import styles from '../css/emerMonitor.css';
const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;
const { RangePicker } = DatePicker;

const MyCheckboxGroup = ({ options, value, onChange }) => {
  let checkboxs = options.map((v) => (
    <Checkbox checked={value.indexOf(v.value) !== -1}>{v.label} {v.num}</Checkbox>
  ));
  return (<div>
    {checkboxs}
  </div>);
};

@connect(state => ({
  user: state.login.user,
  btLoading: state.emer.btLoading,
  map: state.emerLfMap.map,
  isShowControllPlan: state.emerLfMap.isShowControllPlan, // 是否展示控制方案(弹窗)
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
  flowPattern: state.emerLfMap.flowPattern, // 流程模式配置
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 事件列表所点击的事件
  currentEmerEventData: state.emerLfMap.currentEmerEventData,
}))
export default class ControllPlan extends React.Component {
  constructor(props) {
    super(props);
    this.isClickLine = false; // 是否处于点击管线状态
    this.mapTool = null; // 点击管线模块
    this.clickPipeData = null; // 点选的管段信息
    this.map = this.props.map; // 地图模块
    this.notification = '发送停气通知';
    this.state = {
      layerArr: ['closearea', 'closeLines', 'valves', 'users', 'gas', 'block'], // 显示的图层
      data: null, // 爆管分析所有数据
      firstData: null, //没有编辑过的爆管数据
      pointPanelShow: false,  // 控制添加堵点的页面显示
      isEdit: true,
      isModify: true, //是否可以修改控制方案
      isChange: false,  //控制方案是否改变
      clickPipeDataC: null,  // 点选的管段信息（实时变化）
    };
    this.handleClickClear();
  }

  componentDidMount = () => {
    // this.handleClickAnalysis();
    this.getSquibAnalysis();
  }

  componentWillUnmount = () => {
    this.props.map.getMapDisplay().removeLayer('valves');
    this.props.map.getMapDisplay().removeLayer('users');
    this.props.map.getMapDisplay().removeLayer('closearea');
    this.props.map.getMapDisplay().removeLayer('closeLines');
    this.setState = (state, callback) => { };
  };

  changeGroupCheck = (checkedValue) => {
    this.setState({
      data: { ...this.state.data, oper_method: checkedValue.join() },
      isChange: true,
    });
    for (let elem of checkedValue.values()) {
      if (elem === '1' || elem === '2') {
        this.setState({
          pointPanelShow: true,
        });
        return;
      }
    }
    this.setState({
      pointPanelShow: false,
    });
  };

  deletePoint = (record, index) => {
    let data = { ...this.state.data };
    data.blockPoints.results.splice(index, 1);
    this.setState({
      data,
      isChange: true,
    }, (data) => {
      this.map.getMapDisplay().removeLayer('block');
      this.handleShowSquibAnalysisResult(this.state.data.blockPoints.results, 'block');
    });
  };

  addPoint = () => {
    const mapTool = new DrawPointMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl(), (geom) => {
      mapTool.destroy();
      let data = { ...this.state.data };
      let blockParams = {
        id: `block_${this.state.data.blockPoints.results.length}`,
        layerId: 'block',
        src: '../../images/emer/pickPoint.png',
        width: 19,
        height: 27,
        angle: 0,
        x: geom.x,
        y: geom.y,
      };
      this.props.map.getMapDisplay().image(blockParams);
      this.props.geomToName({ x: geom.x, y: geom.y }, (res) => {
        data.blockPoints.results.push({ x: geom.x, y: geom.y, addr: res.result.pois[0].addr });
        this.setState({
          data,
          isChange: true,
        });
      });
    });
    this.props.map.switchMapTool(mapTool);
  }
  confirm = () => {
    let data = { ...this.state.data };
    if (!this.state.pointPanelShow) {
      data.blockPoints.results = [];
    }
    let fd = new FormData();
    fd.append('params', JSON.stringify(data));
    // fd.append('ecode', this.props.user.ecode);
    console.log('updateData', this.state.data); // ***************************************
    this.props.dispatch({
      type: 'emerLfMap/updateSceneControlPlan',
      payload: fd,
      callback: (res) => {
        this.setState({
          // isEdit: false,
          isChange: false,
        });
        message.info('控制方案修改成功');
      },
    });
  }
  onRangeChange = (value1, value2) => {
    this.setState({
      data: {
        ...this.state.data,
        gas_starttime: value1[0].format('YYYY-MM-DD HH:mm:ss'),
        gas_endtime: value1[1].format('YYYY-MM-DD HH:mm:ss')
      },
    });
  }

  // 处理“分析”事件
  handleClickAnalysis = (type = '') => {
    let that = this;
    const { currentEmerEvent, currentEmerEventData } = this.props;
    // 清除所有图层
    this.handleClickClear();
    let data = {};
    if (that.state.clickPipeDataC) {
      // 重新进行爆管分析
      this.getSquibAnalysis(that.state.clickPipeDataC.pipe.attributes.GID, type);
    } else {
      const pipeGid = currentEmerEvent ? currentEmerEvent.pipeGid : currentEmerEventData[0].pipeGid
      // 查询原始的爆管分析数据
      this.getSquibAnalysis(pipeGid);
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
      if (p.attributes['压力级制'] && (p.attributes['压力级制'].indexOf('中') > -1 || p.attributes['压力级制'].indexOf('高') > -1)) {
        pipeArr.push(p);
      }
      if (p.attributes['压力级别'] && (p.attributes['压力级别'].indexOf('中') > -1 || p.attributes['压力级别'].indexOf('高') > -1)) {
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
          that.map.popup(param);
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
          that.map.popup(param);
          // 画出被点击管线
          let paths = res.results[0].geometry.paths[0];
          that.map.getMapDisplay().polyline({
            id: 'paramLine',
            layerId: 'testlayer',
            width: 5,
            layerIndex: 10,
            dots: [{ x: paths[0][0], y: paths[0][1] }, { x: paths[1][0], y: paths[1][1] }],
          });
          // 保存点选管段信息
          const clickPipeDataC = {
            gid: res.results[0].attributes['编号'],
            pipe: res.results[0],
            geom,
          };
          this.setState({
            clickPipeDataC: clickPipeDataC,
          });
        }
      });
    });
    this.map.switchMapTool(this.mapTool);
  };

  // 获取爆管数据
  getSquibAnalysis = (objectId) => {
    let { currentEmerEvent, currentEmerEventData } = this.props;
    const eventId = currentEmerEvent ? currentEmerEvent.gid : currentEmerEventData[0].gid
    // const pipeGeom = currentEmerEvent ? currentEmerEvent.pipeGeom : currentEmerEventData[0].pipeGeom
    let data = {
      ecode: this.props.user.ecode,
      eventId: eventId,
    };
    if (this.state.clickPipeDataC) {
      data.pipeId = objectId;
      // data.pipeGeom = `${this.state.clickPipeDataC.geom.x},${this.state.clickPipeDataC.geom.y}`;
      data.isReanalysis = 1;
    } else {
      data.pipeId = objectId;
      // data.pipeGeom = pipeGeom;
    }
    this.props.dispatch({
      type: 'emer/getController',
      payload: data,
      callback: (res) => {
        console.log('updateData', res.data); // **************************************
        this.setState({
          data: res.data,
          isModify: Number(res.data.status) === 0 ? true : false  //是否可以修改控制方案
        });
        const oper_method = !res.data.oper_method ? [] : res.data.oper_method.split(',');
        for (let elem of oper_method) {
          if (elem === '1' || elem === '2') {
            this.setState({
              pointPanelShow: true,
            })
            break;
          } else {
            this.setState({
              pointPanelShow: false,
            });
          }
        }
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
    this.handleShowSquibAnalysisResult(res.blockPoints.results, 'block');
    this.handleShowSquibAnalysisResult(this.handleFilterPipe(res.closeLines.results), 'closeLines');
  };

  // 在地图上绘制爆管分析结果：1.影响区域；2.阀门；3.管段；4.影响用户
  handleShowSquibAnalysisResult = (data, type) => {
    const { currentEmerEvent, currentEmerEventData } = this.props;
    const pipegid = currentEmerEvent ? currentEmerEvent.gid : currentEmerEventData[0].gid
    if (type === 'closearea') {
      let areaParam = {
        id: `${pipegid}`,
        layerId: 'closearea',
        dots: data.map((v) => ({ x: v[0], y: v[1] })),
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
          dots: line.map((v) => ({ x: v[0], y: v[1] })),
        };
        this.map.getMapDisplay().polyline(pipeParam);
      }
    } else if (type === 'block') {
      for (let i = 0; i < data.length; i += 1) {
        let blockParams = {
          id: `block_${i}`,
          layerId: 'block',
          src: '../../images/emer/pickPoint.png',
          width: 19,
          height: 27,
          angle: 0,
          x: data[i].x,
          y: data[i].y,
        };
        this.map.getMapDisplay().image(blockParams);
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
      // isChange: true,
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

  handleSendStopGasNoticeTotal = (handleSendStopGasNotice, arr) => {
    if (arr.length === 0) {
      message.warning('没有用户');
      return;
    }
    for (let elem of arr.values()) {
      handleSendStopGasNotice(elem.attributes.电话, '由于管道泄露，今天12点暂停燃气供应');
    }
    message.info('停气通知信息发送成功');
    this.notification = '延长停气通知';
  }

  // 表格一行点击改变selected状态
  selectRow = (e) => {
    let that = this;
    let data = { ...this.state.data };
    data[e.target.tableName].results.filter((v, i) => {
      return v.attributes.gid === e.target.value.attributes.gid;
    })[0].selected = e.target.checked;
    this.setState({
      data,
      isChange: true,
    });
    that.map.getMapDisplay().displayGraphic(`${e.target.value.attributes.gid}`, e.target.tableName, e.target.checked);
  };

  // 修改控制方案
  alterControllPlan = () => {
    if (!this.state.data) {
      message.warn('未点选分析管段');
      return;
    }
    this.setState({
      // isEdit: !this.state.isEdit,
      isChange: false,
      data: firstData,
    });
  };

  makeSure = () => {
    const { currentEmerEvent, currentEmerEventData } = this.props;
    const alarmId = currentEmerEvent ? currentEmerEvent.alarmId : currentEmerEventData[0].alarmId
    this.props.dispatch({
      type: 'emerLfMap/makeSureSceneControlPlan',
      payload: {
        gid: this.state.data.gid,
        eventId: alarmId,
        userId: this.props.user.gid,
        userName: this.props.user.trueName,
      },
      callback: (res) => {
        this.setState({
          isModify: false,
        })
        message.info(res.msg);
      },
    });
  };

  render = () => {
    const that = this;
    const { onCancel, handleSendStopGasNotice } = this.props;
    const { isChange, isModify } = this.state;
    // 获取各个表格数据
    let valvesData = [];
    let gasData = [];
    let usersData = [];
    let housingData = [];
    let oper_method = [];
    let gas_starttime = null;
    let gas_endtime = null;
    let blockPointData = [];
    if (this.state.data) {
      valvesData = this.state.data.valves.results || [];
      gasData = (this.state.data.valves.results || []).filter((v, i) => v.attributes['有无应急气源接入点'] === '有');
      usersData = (this.state.data.users.results || []).filter((v, i) => v.attributes['组分类型'] === '工商户');
      housingData = (this.state.data.users.results || []).filter((v, i) => v.attributes['组分类型'] !== '工商户');
      oper_method = !this.state.data.oper_method ? [] : this.state.data.oper_method.split(',');
      gas_starttime = this.state.data.gas_starttime || null;
      gas_endtime = this.state.data.gas_endtime || null;
      blockPointData = this.state.data.blockPoints.results || [];
    }
    // 阀门
    const valveColumns = this.props.user.ecode === '0011' ? [{
      title: '#',
      width: 32,
      render: (text, record, index) => (
        <Checkbox value={record} tableName="valves" disabled={!isModify} checked={record.selected} onChange={that.selectRow} />
      ),
    }, {
      title: '阀门编号', dataIndex: 'attributes.eqptcode', width: 95,
    }, {
      title: '位置', dataIndex: 'attributes.location',
    }] : [{
      title: '#',
      width: 32,
      render: (text, record, index) => (
        <Checkbox value={record} tableName="valves" disabled={!isModify} checked={record.selected} onChange={that.selectRow} />
      ),
    }, {
      title: '阀门编号', dataIndex: 'attributes.编号', width: 95,
    }, {
      title: '位置', dataIndex: 'attributes.位置描述',
    }];
    // 气源接入点
    const gasColumns = [{
      title: '#',
      width: '9%',
      render: (text, record, index) => (
        <Checkbox value={record} tableName="valves" checked={record.selected} disabled={!isModify} onChange={that.selectRow} />
      ),
    }, {
      title: '点类型', dataIndex: 'type', width: '18%',
      render: () => {
        return '阀门';
      },
    }, {
      title: '编号', dataIndex: 'attributes.eqptcode', width: '30%',
    }, {
      title: '地址', dataIndex: 'attributes.location', width: '40%',
    }];
    // 影响工商用户
    const userColumns = [{
      title: '#',
      width: 32,
      render: (text, record, index) => (
        <Checkbox value={record} tableName="users" checked={record.selected} disabled={!isModify} onChange={that.selectRow} />
      ),
    }, {
      title: '用户名称', dataIndex: 'attributes[用户名称]', width: 110,
    }, {
      title: '地址', dataIndex: 'attributes.location',
    }, {
      title: '电话', dataIndex: 'attributes[电话]', width: 100,
    }];
    // 影响居民小区
    const housingColumns = [{
      title: '#',
      width: 32,
      render: (text, record, index) => (
        <Checkbox value={record} tableName="users" checked={record.selected} disabled={!isModify} onChange={that.selectRow} />
      ),
    }, {
      title: '用户名称', dataIndex: 'attributes[用户名称]', width: 110,
    }, {
      title: '地址', dataIndex: 'attributes.location',
    }, {
      title: '电话', dataIndex: 'attributes[电话]', width: 120,
    }];
    const blockColumns = [{
      title: '#',
      dataIndex: 'gid',
      key: 'gid',
      width: 32,
      render: (text, record, index) => index + 1,
    }, {
      title: '经度/纬度',
      dataIndex: 'x',
      key: 'x',
      render: (text, record) => (`${record.x}/${record.y}`),
    }, {
      title: '操作',
      key: 'operation',
      width: 60,
      render: (text, record, index) => (
        <div>
          {isModify ? <Button type="primary" size="small" onClick={this.deletePoint.bind(this, record, index)}>删除</Button> : null}
        </div>
      ),
    }];
    // 图层配置信息
    const plainOptions = [
      { label: '影响区域', value: 'closearea' },
      { label: '管段', value: 'closeLines' },
      { label: '阀门', value: 'valves' },
      { label: '影响用户', value: 'users' },
      { label: '气源接入点', value: 'gas' },
    ];
    const miniPlainOptions = [
      { label: '影响区域', value: 'closearea', num: 0 },
      { label: '需关阀门', value: 'valves', num: 1 },
      { label: '影响管段', value: 'closeLines', num: 2 },
      { label: '影响用户', value: 'users', num: 3 },
    ];
    if (this.state.pointPanelShow) {
      plainOptions.push({ label: '堵点', value: 'block' });
    } else {
      plainOptions.splice(plainOptions.length, 1);
    }
    return (
      <div>
        <div style={{ display: this.props.isShowControllPlan ? 'block' : 'none' }}>
          <Dialog
            title="控制方案"
            style={{ display: 'none' }}
            width={420}
            onClose={onCancel}
            position={{
              top: 90,
              left: 120,
            }}
          >
            <div style={{ margin: 10 }}>
              <div>
                <span>
                  <span>管道编号:</span>
                  <Input disabled value={this.state.clickPipeDataC ? this.state.clickPipeDataC.gid : (this.props.currentEmerEvent ? this.props.currentEmerEvent.pipeId : this.props.currentEmerEventData[0].pipeId)} style={{ width: 115 }} />&nbsp;&nbsp;&nbsp;
                </span>
                <span>
                  <Button type="primary" size="small" onClick={this.OnClickLine}>点选</Button>&nbsp;&nbsp;&nbsp;
                  <Button size="small" onClick={(layerIds) => this.handleClickClear()}>清除</Button>&nbsp;&nbsp;&nbsp;
                  <Button loading={this.props.btLoading} type="primary" size="small" onClick={() => this.handleClickAnalysis('bt')}>分析</Button>
                </span>
              </div>
              <div>
                <span>图层:</span>
                <div style={{ width: 350, marginLeft: 10, display: 'inline-block', verticalAlign: 'top' }}>
                  <CheckboxGroup options={plainOptions} value={this.state.layerArr} onChange={this.onChangeLayers} />
                </div>
              </div>
              <Collapse bordered={false} accordion>
                <Panel header={`阀门(${valvesData.length})`} key="1">
                  <Table
                    rowKey={record => record.attributes.gid}
                    bordered
                    columns={valveColumns}
                    dataSource={valvesData}
                    pagination={false}
                    scroll={{ x: false, y: 250 }}
                    onRowDoubleClick={(record, i) => { this.props.map.centerAt(record.geometry); }}
                  />
                </Panel>
                <Panel header={`气源接入点(${gasData.length})`} key="2">
                  <Table
                    rowKey={record => record.attributes.gid}
                    bordered
                    columns={gasColumns}
                    dataSource={gasData}
                    scroll={{ x: 360, y: 250 }}
                    pagination={false}
                    onRowDoubleClick={(record, i) => { this.props.map.centerAt(record.geometry); }}
                  />
                </Panel>
                <Panel header={`影响工商用户(${usersData.length})`} key="3">
                  <Table
                    rowKey={record => record.attributes.gid}
                    bordered
                    columns={userColumns}
                    dataSource={usersData}
                    scroll={{ x: false, y: 250 }}
                    pagination={false}
                  />
                </Panel>
                <Panel header={`影响居民小区(${housingData.length})`} key="4">
                  <Table
                    rowKey={record => record.attributes.gid}
                    bordered
                    columns={housingColumns}
                    dataSource={housingData}
                    scroll={{ x: false, y: 250 }}
                    pagination={false}
                  />
                </Panel>
              </Collapse>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <Button type="primary" size="small" onClick={this.handleSendStopGasNoticeTotal.bind(this, handleSendStopGasNotice, usersData)}>
                  {this.notification}
                </Button>
              </div>
              {
                // 东莞模式（mode=1）有现场控制方案的修改，其他模式暂时没有
                this.props.flowPattern.mode == "1" ?
                  (
                    this.state.isEdit ? <div>
                      <span>选择辅助控制措施：</span>
                      <div>
                        <Checkbox.Group style={{ width: '100%' }} value={oper_method} disabled={!isModify} onChange={this.changeGroupCheck}>
                          <Row>
                            <Col span={8}><Checkbox value="1">不停输封堵</Checkbox></Col>
                            <Col span={6}><Checkbox value="2">夹管器</Checkbox></Col>
                            <Col span={10}><Checkbox value="3">阀门控制降压</Checkbox></Col>
                          </Row>
                        </Checkbox.Group>
                      </div>
                      <div style={{ fontSize: '14px', marginTop: '15px' }}>
                        <Row>
                          <Col span={7}>预计停气时间：</Col>
                          <Col span={17}>
                            <RangePicker
                              onChange={this.onRangeChange}
                              disabled={!isModify}
                              size="small"
                              showTime
                              format="YYYY-MM-DD HH:mm"
                              style={{ width: '270px' }}
                              value={[gas_starttime ? moment(gas_starttime, 'YYYY-MM-DD HH:mm:ss') : gas_starttime, gas_endtime ? moment(gas_endtime, 'YYYY-MM-DD HH:mm:ss') : gas_endtime]}
                            />
                          </Col>
                        </Row>
                      </div>
                      {
                        this.state.pointPanelShow ?
                          <div>
                            <span style={{ fontSize: '14px', color: 'rgba(0, 0, 0, 0.45)' }}>{`堵点(${blockPointData.length})`}</span>
                            {isModify ? <Button type="primary" size="small" style={{ marginLeft: '270px' }} onClick={this.addPoint}>添加堵点</Button> : null}
                            <Table
                              dataSource={blockPointData}
                              bordered
                              columns={blockColumns}
                              pagination={false}
                              rowClassName={this.setRowClassName}
                              scroll={{ y: 180 }}
                              onRowDoubleClick={(record, i) => { this.props.map.centerAt(record); }}
                            />
                          </div> : ''
                      }
                      {isChange ?
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                          <Button type="primary" size="small" onClick={this.confirm}>保存控制方案修改</Button>
                        </div>
                        :
                        <div style={{ textAlign: 'center' }}>
                          <Button type="primary" size="small" style={{ marginRight: '20px' }} onClick={this.makeSure}>确认</Button>
                        </div>
                      }
                    </div> : <div style={{ textAlign: 'center' }}>
                        <Button type="primary" size="small" style={{ marginRight: '20px' }} onClick={this.makeSure}>确认</Button>
                        <Button type="primary" size="small" onClick={this.alterControllPlan}>修改控制方案</Button>
                      </div>
                  ) : ''
              }
            </div>
          </Dialog>
        </div>
        <div style={this.props.ecodePattern && this.props.ecodePattern.emerMonitor
          && this.props.ecodePattern.emerMonitor.isHasMonitor ? { position: 'absolute', top: 'calc(36% + 296px)', left: 10, width: 380 } : { position: 'absolute', top: 'calc(36% + 53px)', left: 10, width: 380 }}>
          <EmerDialog title="控制方案" width={380} height={195}>
            <div className={styles.SquibView}>
              <div className={styles.row1}>
                <div className={styles.title}>管道编号:</div>
                <div className={styles.input}>
                  <input
                    disabled
                    style={{ height: 30, border: 'none', borderRadius: 4, width: 110 }}
                    value={this.state.clickPipeDataC ? this.state.clickPipeDataC.gid : (this.props.currentEmerEvent ? this.props.currentEmerEvent.pipeId : this.props.currentEmerEventData[0].pipeId)}
                  />{}
                </div>
                <div className={styles.buttons} onClick={this.OnClickLine}>点选</div>
                <div className={styles.buttons} onClick={this.handleClickClear}>清除</div>
                {this.props.btLoading ? <Icon type='loading' /> : <div className={styles.buttons} onClick={() => this.handleClickAnalysis('bt')}>分析</div>}
              </div>
              <div id="c" className={styles.row2}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <MyCheckBox icon={styles.mycb_1_1} id='closearea' name='影响区域' value={null} checked={this.state.layerArr.indexOf('closearea') !== -1} onChange={this.checkboxChaged} style={{ marginRight: 20 }} />
                  <MyCheckBox icon={styles.mycb_1_2} id='valves' name='需关阀门' value={valvesData.length} checked={this.state.layerArr.indexOf('valves') !== -1} onChange={this.checkboxChaged} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                  <MyCheckBox icon={styles.mycb_1_3} id='closeLines' name='影响管段' value={this.state.data ? this.state.data.closeLines.results.length : 0} checked={this.state.layerArr.indexOf('closeLines') !== -1} onChange={this.checkboxChaged} style={{ marginRight: 20 }} />
                  <MyCheckBox icon={styles.mycb_1_4} id='users' name='影响用户' value={usersData.length} checked={this.state.layerArr.indexOf('users') !== -1} onChange={this.checkboxChaged} />
                </div>
              </div>
              <div className={styles.row4}>
                <div className={styles.buttons} onClick={() => this.props.details()}>
                  <img alt="收缩" style={{ width: 14, height: 14, marginRight: 7, marginTop: -4 }} src="../../../images/emer/收缩.png" />详情
                </div>
                <div className={styles.stopAir} onClick={this.handleSendStopGasNoticeTotal.bind(this, handleSendStopGasNotice, usersData)}>
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
            <input type="checkbox" checked={this.props.checked} id={this.props.id} className={styles.checkboxI} onChange={() => { }} />
            <span className={styles.checkboxR} />
          </span>
        </div>
      </div>
    );
  }
}
