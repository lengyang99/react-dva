import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs,Button, Row, Col, Input, Select, Checkbox, DatePicker, message, Radio, TreeSelect  } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import parseValues from '../../../utils/utils';
import styles from './index.less';
const TreeNode = TreeSelect.TreeNode;
const TabPane =Tabs.TabPane;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const task = [{gid: 1, name: '常规'}, {gid: 2, name: '临时'}]
const cycle= [1, 2, 3, 4, 5]
@connect(({maintain, station, login}) => ({
  stations: station.stations,
  regions: station.regions,
  areaData: maintain.areaData,
  functionData: maintain.functionData,
  funcModuleDetail: maintain.funcModuleDetail,
  user: login.user,
}))

export default class DeviceProbing extends Component{
    state={
        gid: '',                       
        name: '',                       // 模板名称
        ecode: '',                      // 企业编码
        stationId: '',                  // 站点
        zoneId: '',                     // 网格所
        regionId: '',                   // 区域
        stationName: '',                // 站点名
        stationType: '',                // 站点类型
        taskType: '',                   // 任务类型
        cycleId: '',                    // 周期id
        isArriveRequired: '',           // 是否要求到位
        isFeedbackRequired: '',         // 是否要求反馈
        status: '',                     // 状态
        formId: '',                     // 表单Id
        functionKey: '',                // 功能名称
        areaData: [],                   // 区域数据
    }
    ecodeName = '' ; // 组织名称
    locGid = '';
    planTemplateId = '';
    componentWillMount() {
        this.initParams()
    }
    componentDidMount(){
        const { dispatch, stations, user, functionData, funcModuleDetail }=this.props;
        this.setState({
            ecode: user.ecode
        })
        this.ecodeName = user.cCompany
        if(stations.length === 0){
            dispatch({
                type: 'station/getStationData'
            })
            
        }
        if(functionData.length === 0){
            this.props.dispatch({
                type: "maintain/getFunction",
                callback: data => {
                  console.log(data, "functionKey");
                }
            });
        }
        
        console.log(this.props, 'this.prosp');
        if (this.props.location.search) {
            let stationCode = '';
            console.log(funcModuleDetail, 'funcModuleDetail★')
            const DATA = {...funcModuleDetail}
            delete DATA.startTime
            delete DATA.endTime
            delete DATA.cycleName
            delete DATA.assigneeId
            delete DATA.startTime

            if(DATA.stationId && this.props.regions.length === 0){
                this.props.dispatch({
                    type: 'station/getRegionData',
                    callback: (data) => {
                        data && data.map(item => {
                            if(Number(item.gid) === Number(DATA.zoneId)){
                                stationCode = item.stationCode
                            }
                        })
                    },
                });
            }
            if(DATA.stationId && DATA.zoneId && this.state.areaData.length === 0){
                this.props.dispatch({
                    type: "maintain/queryModuleAreaData",
                    payload: {stationid: stationCode},
                    callback: (data) => {
                        this.setState({areaData: data})
                    },
                });
            }
            this.setState({
                ...DATA
            })
        }
    }

    initParams = () => {
        const { location: { search } , dispatch, form, user, funcDetail} = this.props;
        const { planTemplateId } = parseValues(search) || '';
        this.planTemplateId = planTemplateId; 
    };
    submitHandler = () => {
        const params = {...this.state}
        delete params.areaData;
        console.log(params, 'params');
        this.props.dispatch({
            type: 'maintain/newModule',
            payload: params,
            callback: ({success, msg}) => {
                if (success) {
                  message.success('提交成功！');
                  this.backHandler()
                } else {
                  message.warn(msg);
                }
            }
        })
    };

    changeHandler = (val, fileName, node) => {
      const {dispatch, regions, areaData} = this.props;
      if(fileName === 'stationId'){
        const {dataRef} = node.props;
        this.props.dispatch({
            type: 'station/getRegionData',
        });
        this.setState({
            stationName: dataRef.name,
            stationType: dataRef.type,
            zoneId: '',
            regionId: '',
        })
      }
      if(fileName === 'zoneId'){
        const {dataRef} = node.props;
        this.props.dispatch({
            type: "maintain/queryModuleAreaData",
            payload: {stationid: dataRef.stationCode},
            callback: (data) => {
                this.setState({areaData: data})
            },
        });
        this.setState({
          regionId: '',
        })
      }

      if(fileName === 'functionKey'){
        const {dataRef} = node.props;
        console.log(val, dataRef, 'dataRef')
        if (dataRef.children && dataRef.children.length > 0 && val === dataRef.functionKey) {
        message.error(`请选择 ${dataRef.functionName} 下的任务类型！`);
        return;
        }
        this.setState({
            formId: dataRef.formId,
        });
      }
        this.setState({
          [fileName]: val,
        })
    };

    backHandler = () => {
      console.log('返回')
      this.props.dispatch(routerRedux.push(`function-template`));
    };
     // 填充数据至区域
     renderTreeNodes = (data) => {
        return data.map((item) => {
          if (item.children && item.children.length > 0) {
            return (
              <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item}>
                {renderTreeNodes(item.children)}
              </TreeNode>
            );
          }
          return <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item} />;
        });
      };

    render(){
        // const {pageno,pagesize}=this.state;
        const {  stations, regions, functionData} = this.props;
        const {areaData} = this.state;
        console.log(this.state, 'state');
        console.log(this.props, 'props');
        return (
            <PageHeaderLayout>
              <Row style={{marginBottom: 20, paddingTop: 20}}>
                  <Col span={8}>
                      <label>模板名称：</label>
                      <Input
                        style={{ width: 150}}
                        value={this.state.name}
                        onChange={(e) => {this.changeHandler(e.target.value, 'name')}}
                        />
                  </Col>
                  <Col span={8}>
                      <div style={{display: 'inline-block'}}>
                          <label>所属企业：</label>
                          <Input value={this.ecodeName} style={{ width: 150}} disabled/>
                      </div>
                  </Col>
              </Row>
              <Row style={{marginBottom: 20}}>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>所属站点：</label>
                        <Select
                            placeholder="请选择站点"
                            style={{ width: 150}}
                            value={this.state.stationId}
                            onSelect={(val, node) => {this.changeHandler(val, 'stationId', node)}}
                        >
                            {
                                stations && stations.map((item) =>
                                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                                )
                            }
                        </Select>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>网格所：</label>
                        <Select
                            placeholder="请选择网格所"
                            style={{ width: 150, marginLeft: 15}}
                            value={this.state.zoneId}
                            allowClear
                            onSelect={(val, node) => {this.changeHandler(val, 'zoneId', node)}}
                        >
                            {
                                regions && regions.map((item) =>
                                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                                )
                            }
                        </Select>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>区域：</label>
                        <Select
                            placeholder="请选择区域"
                            style={{ width: 150}}
                            value={this.state.regionId}
                            allowClear
                            onSelect={(val, node) => {this.changeHandler(val, 'regionId')}}
                        >
                            {
                                areaData && areaData.map((item) => {
                                    if(item.children && item.children.length > 0){
                                       return item.children.map((item1) =>
                                            <Option key={item1.eqlocation.gid} value={item1.eqlocation.gid} dataRef={item1}>{item1.name}</Option>
                                        )
                                    }
                                })
                                
                            }
                        </Select>
                    </div>
                  </Col>
              </Row>
              <Row style={{marginBottom: 20}}>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>功能名称：</label>
                        <TreeSelect
                            placeholder="请选择任务类型"
                            style={{width: 150}}
                            dropdownStyle={{maxHeight: 180, overflow: 'auto', width:150}}
                            value={this.state.functionKey}
                            onSelect={(val, node) => {this.changeHandler(val, 'functionKey', node)}}
                        >
                            {
                            functionData && functionData.map((item) => {
                                if (item.children && item.children.length > 0) {
                                    return (
                                    <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item}>
                                        {this.renderTreeNodes(item.children)}
                                    </TreeNode>
                                    );
                                }
                                return <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item} />;
                            })
                        }
                        </TreeSelect>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>周期：</label>
                        <Select
                            placeholder="请选择周期"
                            style={{ width: 150, marginLeft: 28}}
                            value={this.state.cycleId}
                            allowClear
                            onSelect={(val, node) => {this.changeHandler(val, 'cycleId')}}
                        >
                            {
                                cycle && cycle.map((item) =>
                                    <Option key={item} value={item} dataRef={item}>{item}</Option>
                                )
                            }
                        </Select>
                    </div>
                  </Col>
              </Row>
              <Row style={{marginBottom: 20}}>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>是否要求到位：</label>
                        <Radio.Group
                          value={this.state.isArriveRequired}
                          onChange={e => {
                            this.changeHandler(e.target.value, 'isArriveRequired')
                          }}
                        >
                          <Radio value={1}>是</Radio>
                          <Radio value={0}>否</Radio>
                        </Radio.Group>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>是否要求反馈：</label>
                        <Radio.Group
                          value={this.state.isFeedbackRequired}
                          onChange={e => {
                            this.changeHandler(e.target.value, 'isFeedbackRequired')
                          }}
                        >
                          <Radio value={1}>是</Radio>
                          <Radio value={0}>否</Radio>
                        </Radio.Group>
                    </div>
                  </Col>
              </Row>
              <Row style={{marginBottom: 20}}>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>状态：</label>
                        <Radio.Group
                          value={this.state.status}
                          onChange={e => {
                            this.changeHandler(e.target.value, 'status')
                          }}
                        >
                          <Radio value={0}>在用</Radio>
                          <Radio value={1}>未用</Radio>
                          <Radio value={2}>删除</Radio>
                        </Radio.Group>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>任务类型：</label>
                        <Select
                            placeholder="请选择任务类型"
                            style={{ width: 150}}
                            value={this.state.taskType}
                            allowClear
                            onSelect={(val, node) => {this.changeHandler(val, 'taskType')}}
                        >
                            {
                                task && task.map((item) =>
                                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                                )
                            }
                        </Select>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div style={{display: 'inline-block'}}>
                        <label>表单：</label>
                        <Input value={this.state.formId} style={{ width: 150}} disabled/>
                    </div>
                  </Col>
              </Row>
              <div style={{width: '100%', textAlign: 'center', paddingBottom: 20}}>
                <Button type="button" onClick={this.backHandler} style={{marginRight: 20}}>
                返回
                </Button>
                <Button type="button" onClick={this.submitHandler}>
                提交
                </Button>
              </div>
            </PageHeaderLayout>
        )
    }
}