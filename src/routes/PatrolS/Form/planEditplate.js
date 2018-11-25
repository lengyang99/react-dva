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
    this._tool = this.props.location && this.props.location.data ? this.props.location.data : false;
    if (this._tool) {
      localStorage.setItem('patrolPlanEdit', JSON.stringify(this._tool));
    } else {
      let dataString = localStorage.getItem('patrolPlanEdit');
      this._tool = JSON.parse(dataString);
    }
    this.map = null; // 类ArcGISMap的实例
    this.keydownEvent = null;
    this.state = {
      hasName: false,
      layersData: [],
      loading: false,
      areaid: this._tool.areaid, // 区域ID
      userids: [], // 巡检员ids
      usernames: this._tool.usernames.split(","), // 巡检员
      subUserids: this._tool.userids, // 提交的巡检员id
      cycleName: this._tool.planCycle ? this._tool.planCycle.unit : '', // 巡检周期（‘日’...）
      frequency: this._tool.planCycle ? this._tool.planCycle.frequency : '', //频率
      isVisible:true,
    };

    this.planValidate = {
      subUserids: {validate: true, message: '巡检员为空'}, // 巡检员id
      cycleName: {validate: true, message: '巡检周期为空'}, // 巡检周期
      frequency: {validate: true, message: '巡检频率为空'}, // 巡检频率为空
    };

    this.taskValidate = {
      subUserids: {validate: true, message: '巡检员为空'}, // 巡检员id
    };
  }

  componentWillMount(){
    const {userids, usernames, stationid} = this._tool;
    let useridsArr = []
    userids.split(",").map(item => {
      useridsArr.push(`u${item}_${stationid}`)
    })
    this.setState({userids: useridsArr})
  }
  componentDidMount() {
    this.getUsernamesDataDictionary();
    this.props.dispatch({
      type: 'patrolPlanList/querypatrolCycle',
    })

    const {walkWay}=this.props;
    if(walkWay&&walkWay.length>0){
      if(walkWay.length === 1 && walkWay[0].name.includes('车巡')){
        this.setState({
          isVisible:false,
        });
      }
    }else {
      this.setState({
        isVisible:false,
      });
    }
  };

  componentWillUnmount = () => {
    if(this.keydownEvent){
      window.removeEventListener('keydown',this.keydownEvent);
    }
  };


  // 巡检员改变
  onPatrolorChange = (value, label, object) => {
    let checknode = object.allCheckedNodes;
    let userid = [];
    this.getSelectPersonData(checknode, userid);
    console.log(userid, '11111')
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


  // 插入计划
  insertPlan = () => {
    let data = {};
    if(this._tool.type === 1){
      for (let key in this.planValidate) {
        if (this.planValidate[key].validate && (this.state[key] === undefined || this.state[key].length === null || this.state[key] === '' || this.state[key].length === 0)) {
          message.error(this.planValidate[key].message);
          return;
        }
      }
    }else if(this._tool.type === 0){
      for (let key in this.taskValidate) {
        if (this.taskValidate[key].validate && (this.state[key] === undefined || this.state[key].length === null || this.state[key] === '' ||  this.state[key].length === 0)) {
          message.error(this.taskValidate[key].message);
          return;
        }
      }
    }
    if(this._tool.type === 1){
      data.type = this._tool.type;
      data.gid = this._tool.gid;
      data.name = this._tool.name; // 巡检名称
      data.areaid = this._tool.areaid;// 区域ID
      data.cycleid = this._tool.cycleid; // 巡检频率
      data.userids = this.state.subUserids;// 巡检员id
      data.usernames = this.state.usernames.toString();// 巡检员
      data.unit = this.state.cycleName;// 巡检周期
      data.frequency = this.state.frequency; // 巡检频率
    }else if(this._tool.type === 0){
      data.type = this._tool.type;
      data.gid = this._tool.gid;
      data.name = this._tool.name; // 巡检名称
      data.areaid = this._tool.areaid;// 区域ID
      data.cycleid = this._tool.cycleid; // 巡检频率
      data.userids = this.state.subUserids;// 巡检员id
      data.usernames = this.state.usernames.toString();// 巡检员
    }

    this.props.dispatch({
      type: 'patrolPlanList/insertPatrolPlanEdit',
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
    console.log(record, 'record')
    this.setState({
      feedbackData: record.formFields || [],
      isShowDetail: true,
    })
  };

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

  // 巡检周期改变,是否排班
  cycleChange = (value, fileName, node) => {
    this.setState({
      [fileName]: value,
    });
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
  render() {
    const {patrolMethod, extraPoints, pageno, pagesize, gdFilter, areaPoints, pipeData, pipelength, patrolEqData,
      eqList, eqFilter, eqDataA, layerName, feedbackData, eqSubmit, pointSubmit, eqlength, areaName, oldLayerids, routinepoint, layeridAll, pathPolygon,
      routineMapShow, routineShow, isShowRoutine, selectedRowKeys} = this.state;
    const {patrolCycle, user ,walkWay} = this.props;
    let areaTemp = Object.assign([], this.props.areaData || []);
    let areaData = [];
    this.getTreeData(areaData, areaTemp);
    let usernamesData = this.getPatrolorTreeData(this.props.usernamesData || []);

    let button = () => {
      this.insertPlan();
    };

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

    return (
      <div style={{width: '100%', height: 'calc(100vh - 120px)'}} className={styles['temp']}>
        <div style={{width: '100%', height: '100%'}}>
          <EcityMap mapId="patrolPlanList" onMapLoad={(arcGISMap) => {this.map = arcGISMap}}/>
        </div>
        <Dialog
          title='巡视计划编辑'
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
                <Input style={{width: '95%'}} value={this._tool.name} disabled/>
                <span className={styles.starSpan}>*</span>
              </div>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="执行区域：">
              <Input style={{width: '95%'}} value={this._tool.areaName} disabled/>
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
                <Input style={{width: '95%'}} value={this._tool.patrolLayer} disabled/>
                <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout1}
              label="是否根据排班生成任务："
              style={{marginBottom: '10px', display: isShowCycle ? 'block' : 'none'}}
            >
              <Radio.Group value={this._tool.isschedule} disabled>
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
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
                    // defaultValue= {}
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
              <Input style={{width: '95%'}} value={this._tool.startTime} disabled/>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              style={{marginBottom: 10, display: isShowRangeTime ? 'block' : 'none'}}
              label="起止日期：">
              <Input style={{width: '95%'}} value={`${this._tool.startTime} - ${this._tool.endTime}`} disabled/>
              <span className={styles.starSpan}>*</span>
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="行走方式："
              style={{marginBottom: '10px', display: this.state.isVisible ? 'block' : 'none'}}>
              <Select style={{width: '95%'}} value={this._tool.speedid} disabled>
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
      </div>
    )
  }
}
