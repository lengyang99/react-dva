import React from 'react';
import styles from './index.less';
import {Form, Input, Button, Checkbox, Radio, Row, Col, Select, DatePicker, TreeSelect, message, Icon} from 'antd';
import moment from 'moment';
import utils from '../../utils/utils';
import EcityMap from '../../components/Map/EcityMap';
import {DrawPolygonMapTool} from '../../components/Map/common/maptool/DrawPolygonMapTool';
import {EditPolygonMapTool} from '../../components/Map/common/maptool/EditPolygonMapTool';
import {DrawPolylineMapTool} from '../../components/Map/common/maptool/DrawPolylineMapTool';
import {DrawPointMapTool} from '../../components/Map/common/maptool/DrawPointMapTool';
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
  usernamesData: state.patrolPlanList.usernamesData,
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
      extraPoints: [], // 临时添加的关键点
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
      name: {validate: true, message: '计划名称为空'}, // 模板名称
      areaid: {validate: true, message: '区域名称为空'}, // 区域id
      // layerids: {validate: true, message: '巡检对象为空'}, // 巡检对象id
      userids: {validate: true, message: '巡检员为空'}, // 巡检员id
      sTime: {validate: true, message: '开始时间为空'}, // 开始时间
      eTime: {validate: true, message: '结束时间为空'}, // 结束时间
      speedid: {validate: true, message: '行走方式为空'}, // 行走方式
    };
  }

  componentDidMount = () => {
    this.areaDataDictionary();
    this.getLayerDataDictionary();
    this.getUsernamesDataDictionary();
    if (this._tool.type === 1) {
      this.setState({
        cycleid: '4',
        speedid: '1',
      });
    }
    if (this._tool.type === 0) {
      this.setState({
        speedid: '1',
      });
    }
  };

  componentWillUnmount = () => {
    if(this.keydownEvent){
      window.removeEventListener('keydown',this.keydownEvent);
    }
  };

  // 巡检周期改变
  cycleChange = (value) => {
    this.setState({
      cycleid: value,
    });
  };

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
        click: function (point) {
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
    this.map.centerAt(paramArea.dots[0]);
    this.map.getMapDisplay().polygon(paramArea);
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
    }
  }

  // 区域名称数据字典
  areaDataDictionary = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getAreaData',
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
    let newLayer = [...this.state.layersData];
    for (let i = 0; i < newLayer.length; i++) {
      if (newLayer[i].gid === keyPointId) {
        newLayer[i].num = area.keypoints.length;
        newLayer[i].points = area.keypoints;
        newLayer[i].visibility = true;
      } else {
        newLayer[i].visibility = false;
        this.getPoint(value, newLayer[i].gid, (res) => {
          newLayer[i].num = res.length;
          newLayer[i].points = res;
        });
      }
    }
    this.map.getMapDisplay().removeLayer('extra_keyPoints');
    this.setState({
      areaid: value,
      extraPoints: [],
      userids: ['u' + area.userid.toString()],
      usernames: [area.usernames],
      layerids: [keyPointId],
      layersData: newLayer,
      stationid: area.stationid,
      station: area.station,
    });
    if (!this.state.hasName) {
      this.setState({
        name: label + '_' + moment().format('YYYY-MM-DD'),
      });
    }
    // this.map.getMapDisplay().removeLayer(`layerId_${keyPointId}`);
    this.map.getMapDisplay().clear();
    this.showPoint(keyPointId, area.keypoints);
    // this.getPoint(value, keyPointId, (res) => {
    //   this.showPoint(keyPointId, res);
    // });
    this.showArea(area.areaPolygon);
    this.showPath(area.pathPolygon);
  };

  // 巡检对象改变
  onLayeridsChange = (e) => {
    let newLayers = [...this.state.layersData];
    let layerids = this.state.layerids;
    if (layerids.indexOf(e.target.value) === -1) {
      layerids.push(e.target.value);
      this.showPoint(e.target.value, newLayers.filter((layer, i) => {return layer.gid === e.target.value})[0].points);
    }
    else {
      for (let i = 0; i < layerids.length; i++) {
        if (layerids[i] === e.target.value) {
          layerids.splice(i, 1);
        }
      }
      this.map.getMapDisplay().removeLayer(`layerId_${e.target.value}`);
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

  addKeyPoints = () => {
    let that = this;
    message.info('ESC键取消新建点');
    const mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geom) => {
      that.extraKeyPointIndex++;
      let pointParams = {
        id: `extra_keyPoints_${that.extraKeyPointIndex}`,
        layerId: 'extra_keyPoints',
        x: geom.x,
        y: geom.y
      };
      that.map.getMapDisplay().point(pointParams);
      let extraPoints = [...this.state.extraPoints];
      extraPoints.push({type: 0, geometry: {x: geom.x, y: geom.y}});
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
            {datas[i].num + this.state.extraPoints.length}
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
    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlan',
      payload: data,
      callback: (res) => {
        if (!res.success) {
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
    let keyPoints = [...this.state.extraPoints];
    let layerids = this.state.layerids;
    let layersData = [...this.state.layersData];
    if (layerids.indexOf(keyPointId) !== -1) {
      layersData.filter((layer, i)=>{ return layer.gid === keyPointId})[0].points.map((keypoint, i) => {
        keyPoints.push({type: keypoint.type, geometry: JSON.parse(keypoint.geometry)});
      });
    }
    if(keyPoints.length === 0){
      if(layerids.length === 0){
        message.error('巡检对象为空');
        return;
      }
    }else {
      if(layerids.indexOf(keyPointId) === -1){
        layerids.push(keyPointId);
      }
    }

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
    data.layerids = layerids.toString();// 巡检对象id
    data.userids = this.state.userids.toString().substring(1);// 巡检员id
    data.usernames = this.state.usernames.toString();// 巡检员
    data.speedid = this.state.speedid;// 行走方式
    data.name = this.state.name;// 模板名称
    data.keyPoints = keyPoints;
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
        this.props.dispatch(routerRedux.push('/query/patrol-plan-list'));
      }
    });
  };

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

    let button = () => {
    };
    if (this._tool.type === 1) {
      button = this.insertPlan;
    }
    else if (this._tool.type === 0) {
      button = this.insertTempPlan;
    }

    const checkboxGroup = this.getLayerDiv(layersData, this.state.layerids);

    const formItemLayout = {
      labelCol: {span: 6},
      wrapperCol: {span: 17},
      style: {marginBottom: '10px'}
    };

    const isShowCycle = this._tool.type === 1;

    const isShowRangeTime = this._tool.type === 0;

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
                       disabled={false} onChange={this.getPlanName}/>
                <span className={styles.starSpan}>*</span>
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="区域名：">
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
              label="巡检对象：">
              {checkboxGroup}
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="巡检员：">
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
                }}>>
              </TreeSelect>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{marginBottom: 10, display: isShowRangeTime ? 'block' : 'none'}}
              label="添加关键点：">
              <Button type='primary' size='small'  style={{marginRight: 10}} onClick={this.addKeyPoints}>新建</Button>
              {/*<Button type='primary' size='small' onClick={this.editKeyPoints}>编辑</Button>*/}
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
              label="巡检周期：">
              <Select style={{width: '95%'}} value={this.state.cycleid} searchPlaceholder="请选择"
                      onChange={this.cycleChange}>
                {/* <Option value='1'>年/次</Option>*/}
                <Select.Option value='2'>月/次</Select.Option>
                <Select.Option value='3'>周/次</Select.Option>
                <Select.Option value='4'>日/次</Select.Option>
              </Select>
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
              label="行走方式：">
              <Select style={{width: '95%'}} value={this.state.speedid} placeholder="请选择"
                      onChange={this.onCycleChange.bind(this)}>
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
