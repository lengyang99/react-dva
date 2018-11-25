import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs,Button, Row, Col, Input, Select, Checkbox, DatePicker, message } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';
import SearchPanel from './SearchPanel';
import moment from 'moment';
// import AlarmRecord from './AlarmRecord';   //报警记录
// import HistoryReads from './HistoryReads'; //历史读数
import NewDeviceModal from '../Device/NewModalForm/NewDeviceModal';
import NewLocationModal from '../Device/NewModalForm/NewLocationModal';
const TabPane =Tabs.TabPane;
const Option = Select.Option;

//基本信息；
const basicName = [
    [{name: '上次报警值', alise: 'lastWarnValue'},{name: '上次报警日期', alise: 'lastWarnTime' }],
    [{name: '更改人', alise: 'modifierName'},{name: '更改日期', alise: 'modifyTime'}]
]

//设备关联；
const eqName = [
    [{name: '监测设备', alise: 'equipmentCode'},{name: '设备名称', alise: 'equipmentName' }],
    [{name: '所属位置', alise: 'locationCode'},{name: '位置名称', alise: 'locationName'}]
]

//阀门设置；
const valveName = [
    [{name: '报警上限', alise: 'maxThreshold'},{name: '是否生成隐患', alise: 'createMaxEvent' }],
    // [{name: '报警下限', alise: 'minThreshold'}]
    [{name: '报警下限', alise: 'minThreshold'},{name: '是否生成隐患', alise: 'createMinEvent'}]
]

//监测设置；
const monitorName = [{name: '源测点编号', alise: 'deviceid'}, {name: '源测点名称', alise: 'sourceDetectionName'}, {name: '源计量单位', alise: 'sourceUnit'}, {name: '转换系数', alise: 'conversionCoefficient'}]

@connect(({equipmentMonitor, station, device, login}) => ({
    monitorData: equipmentMonitor.monitorData,
    detailData: equipmentMonitor.detailData,
    dataType: equipmentMonitor.dataType,
    dataSource: equipmentMonitor.dataSource,
    unitData: equipmentMonitor.unitData,
    stations: station.stations,
    user: login.user,
}))

export default class DeviceProbing extends Component{
    state={
        detectionId: '',                // 监测点编号
        jcdnamec: '',                   // 监测点名称
        stationId: '',                  // 站点
        ecode: '',                      // 所属组织
        unit: '',                       // 计量单位
        valueType: '',                  // 值类型
        valueSource: '',                // 特征值
        lastWarnValue: '',              // 上次报警值
        lastWarnTime: null,             // 上次报警时间
        modifierId: '',                 // 更改人id
        modifierName: '',               // 更改人名称
        modifyTime: null,               // 更改日期
        equipmentId: '',                // 设备id
        equipmentCode: '',              // 设备编码
        equipmentName: '',              // 设备名称
        devtype: '',                    // 设备类型
        devnamec: '',                   // 设备名称2
        locationId: '',                 // 位置id
        locationCode: '',               // 位置编码
        locationName: '',               // 位置名称
        maxThreshold: '',               // 报警上限
        createMaxEvent: '',             // 上限是否生成隐患
        minThreshold: '',               // 报警下限
        createMinEvent: '',             // 下限是否生成隐患
        deviceid: '',                   // 源测点编号1
        metric: '',                     // 源测点编号2
        sourceDetectionName: '',        // 源测点名称
        sourceUnit: '',                 // 源单位
        conversionCoefficient: '',      // 转换系数
        dataSource: '',                 // 数据来源
        status: '',                     // 是否启用检测点
        eqVisible: false,
        locVisible: false,
    }
    ecodeName = '' ; // 组织名称
    locGid = '';

    componentDidMount(){
        const { dispatch, stations, dataSource, dataType, user,  detailData}=this.props;
        this.setState({
            ecode: user.ecode
        })
        this.ecodeName = user.cCompany;
        if(stations.length === 0){
            dispatch({
                type: 'station/getStationData'
            })
        }
        if(Object.keys(dataSource).length === 0){
            dispatch({
                type: 'equipmentMonitor/getDataSource'
            })
        }
        if(Object.keys(dataType).length === 0) {
            dispatch({
                type: 'equipmentMonitor/getDataType'
            })
        }
        dispatch({
            type: 'equipmentMonitor/getDataUnit'
        })
        console.log(this.props, 'this.prosp');
        if (this.props.location.search) {
            const modifyTime = detailData.modifyTime === null ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss') : detailData.modifyTime
            console.log(modifyTime, 'modifyTime');
            this.setState({
                detectionId:            detailData.gid,
                jcdnamec:               detailData.jcdnamec,
                stationId:              detailData.stationId,
                ecode:                  detailData.ecode,
                unit:                   detailData.unit,
                valueType:              detailData.valueType,
                valueSource:            detailData.valueSource,
                lastWarnValue:          detailData.lastWarnValue,
                lastWarnTime:           detailData.lastWarnTime,
                modifierId:             user.gid,
                modifierName:           user.trueName,
                modifyTime:             modifyTime,
                equipmentId:            detailData.equipmentId,
                equipmentCode:          detailData.equipmentCode,
                equipmentName:          detailData.equipmentName,
                devtype:                detailData.devtype,
                devnamec:               detailData.devnamec,
                locationId:             detailData.locationId,
                locationCode:           detailData.locationCode,
                locationName:           detailData.locationName,
                maxThreshold:           detailData.maxThreshold,
                createMaxEvent:         detailData.createMaxEvent,
                minThreshold:           detailData.minThreshold,
                createMinEvent:         detailData.createMinEvent,
                deviceid:               detailData.deviceid,
                metric:                 detailData.metric,
                sourceDetectionName:    detailData.sourceDetectionName,
                sourceUnit:             detailData.sourceUnit,
                conversionCoefficient:  detailData.conversionCoefficient,
                dataSource:             detailData.dataSource,
                status:                 detailData.status,
            })
        }
    }

    handleTabChange = (key) => {
        if (key === '1' || key === 'back') {
            this.props.dispatch(routerRedux.push(`monitorList`));
        }
    };
    submitHandler = () => {
        const params = {...this.state}
        delete params.eqVisible
        delete params.locVisible
        console.log(params, 'params');
        this.props.dispatch({
            type: 'equipmentMonitor/newPlan',
            payload: params,
            callback: ({success, msg}) => {
                if (success) {
                  message.success('提交成功！');
                  this.handleTabChange('back')
                } else {
                  message.warn(msg);
                }
            }
        })
    };

    changeHandler = (val, fileName) => {
        this.setState({
          [fileName]: val,
        })
    };
    // 设备、位置彈出框
    showModal = (type) => {
      if (type === 'equipmentCode') {
        this.setState({ eqVisible: true });
      }
      if (type === 'locationCode') {
        this.setState({locVisible: true});
      }
    };
    // 单击选择一行设备
    handleClickRow = (val, index) => {
        console.log(val, index, 'handleClickRow');
        this.setState({
            equipmentId: val.gid,
            equipmentCode: val.eqCode,
            equipmentName: val.eqName,
            devtype: val.eqTypeName,
            devcname: val.eqName,
        })
    };
     // 选择位置
    handleSelectLocation = (selectRowKeys) => {
       this.locGid = selectRowKeys[0];
    }
    // 根据gid查询位置信息
    queryLocation = () => {
      this.props.dispatch({
        type: 'device/queryLocation',
        payload: {
          pageNum: 1,
          pageSize: 10,
          parentId: this.locGid,
        },
        callback: (res) => {
          if (res.success && res.data.list.length !== 0) {
            const {locCode, locName, gid} = res.data.list[0];
            console.log(res.data.list[0], 'locCode');
            this.setState({
                locationId: gid,
                locationCode: locCode,
                locationName: locName,
            });
          }
        },
      });
    }
    render(){
        const {pageno,pagesize}=this.state;
        const { dataType: {detection_value_type}, dataSource: {detection_data_source}, stations, unitData: {detection_unit} } = this.props;
        console.log(this.state, 'state');
        console.log(this.props, 'props');
        return (
            <PageHeaderLayout>
                <Tabs
                    defaultActiveKey='2'
                    onChange={this.handleTabChange}
                >
                    <TabPane tab='列表' key='1' />
                    <TabPane tab='设备检测点' key='2' style={{marginLeft: 20}}>
                        <div style={{minWidth: 1170}}>
                            <h3><b>基本信息</b></h3>
                            <Row style={{marginBottom: 20}}>
                                <Col span={10}>
                                    <label>监测点：</label>
                                    <Input style={{ width: 100, marginRight:3}} disabled value={this.state.detectionId}/>
                                    <Input
                                        style={{display: 'inline-block', width: 300}}
                                        value={this.state.jcdnamec}
                                        onChange={(e) => {this.changeHandler(e.target.value, 'jcdnamec')}}
                                    />
                                </Col>
                                <Col span={10}>
                                    <div style={{display: 'inline-block'}}>
                                        <label>所属站点：</label>
                                        <Select
                                            placeholder="请选择站点"
                                            style={{ width: 150, marginRight: 45}}
                                            value={this.state.stationId}
                                            allowClear
                                            onSelect={(val, node) => {this.changeHandler(val, 'stationId')}}
                                        >
                                           {
                                                stations && stations.map((item) =>
                                                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                                                )
                                            }
                                        </Select>
                                    </div>
                                    <div style={{display: 'inline-block'}}>
                                        <label>所属组织：</label>
                                        <Input value={this.ecodeName} style={{ width: 150}} disabled/>
                                    </div>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: 20}}>
                                <Col span={10}>
                                    <label>计量单位：</label>
                                    <Select
                                        placeholder="请选择计量单位"
                                        style={{ width: 150}}
                                        value={this.state.unit}
                                        allowClear
                                        onSelect={(val) => {this.changeHandler(val, 'unit')}}
                                    >
                                        {
                                            detection_unit && detection_unit.map((item) =>
                                                <Option key={item.name} value={item.alias} dataRef={item}>{item.alias}</Option>
                                            )
                                        }
                                    </Select>
                                </Col>
                                <Col span={10}>
                                    <div style={{display: 'inline-block'}}>
                                        <label>值类型：</label>
                                        <Select
                                            placeholder="请选择"
                                            style={{ width: 150, marginRight: 45}}
                                            value={this.state.valueType}
                                            allowClear
                                            onSelect={(val) => {this.changeHandler(val, 'valueType')}}
                                        >
                                            {
                                                detection_value_type && detection_value_type.map((item) =>
                                                    <Option key={item.name} value={item.alias} dataRef={item}>{item.alias}</Option>
                                                )
                                            }
                                        </Select>
                                    </div>
                                    <div style={{display: 'inline-block'}}>
                                        <Input
                                            style={{ width: 150}}
                                            value={this.state.valueSource}
                                            onChange={(e) => {this.changeHandler(e.target.value, 'valueSource')}}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            {basicName.map((item, index) =>
                                <Row style={{marginBottom: 20}}>
                                    <Col span={10}>
                                        <label>{item[0].name}：</label>
                                        <Input
                                            style={{ width: 150}}
                                            disabled={index === 1 ? true : false}
                                            value={this.state[item[0].alise]}
                                            onChange={(e) => {this.changeHandler(e.target.value, item[0].alise)}}
                                        />
                                    </Col>
                                    <Col span={10}>
                                        <label>{item[1].name}：</label>
                                        <DatePicker
                                            style={{width: 200}}
                                            disabled={index === 1 ? true : false}
                                            value={this.state[item[1].alise] ? moment(this.state[item[1].alise]) : null}
                                            onChange={(data, dataString) => {this.changeHandler(dataString, item[1].alise)}}
                                            format='YYYY-MM-DD HH:mm:ss'
                                        />
                                    </Col>
                                </Row>
                            )}
                        </div>
                        <div>
                            <h3><b>设备关联</b></h3>
                            {eqName.map((item) =>
                                <Row style={{marginBottom: 20}}>
                                    <Col span={10}>
                                        <label>{item[0].name}：</label>
                                        <Input
                                            style={{ width: 300}}
                                            value={this.state[item[0].alise]}
                                            onClick={() => {this.showModal(item[0].alise); }}
                                            placeholder={item[0].name}
                                        />
                                    </Col>
                                    <Col span={10}>
                                        <label>{item[1].name}：</label>
                                        <Input
                                            style={{ width: 300}}
                                            disabled
                                            value={this.state[item[1].alise]}
                                            placeholder={item[1].name}
                                        />
                                        </Col>
                                </Row>
                            )}
                        </div>
                        <div>
                            <h3><b>阈值设置</b></h3>
                            {valveName.map((item) =>
                                <Row style={{marginBottom: 20}}>
                                    <Col span={10}>
                                        <label>{item[0].name}：</label>
                                        <Input
                                            style={{ width: 150}}
                                            value={this.state[item[0].alise]}
                                            onChange={(e) => {this.changeHandler(e.target.value, item[0].alise)}}
                                        />
                                    </Col>
                                    {item.length > 1 ?
                                        <Col span={10}>
                                            <label>{item[1].name}：</label>
                                            <Select
                                                placeholder="请选择"
                                                style={{ width: 150}}
                                                value={this.state[item[1].alise]}
                                                allowClear
                                                onSelect={(val) => {this.changeHandler(val, item[1].alise)}}
                                            >
                                                <Option value="是">是</Option>
                                                <Option value="否">否</Option>
                                            </Select>
                                        </Col> : null
                                    }
                                </Row>
                            )}
                        </div>
                        <div style={{marginBottom: 20}}>
                            <h3><b>监测设置</b></h3>
                            <Row style={{marginBottom: 20}}>
                                {monitorName.map((item, index) =>
                                    <Col span={index === 0 || index === 1 ? 5 : 3} offset={index === 0 ? 0 : 1}>
                                        <Row style={{marginBottom: 8}}>{item.name}</Row>
                                        <Row>
                                            <Col span={index === 0 ? 8 : 24 }>
                                                { index === 2 ?
                                                    <Select
                                                        placeholder="请选择源计量单位"
                                                        style={{ width: '100%'}}
                                                        value={this.state.sourceUnit}
                                                        allowClear
                                                        onSelect={(val) => {this.changeHandler(val, 'sourceUnit')}}
                                                    >
                                                        {
                                                            detection_unit && detection_unit.map((item) =>
                                                                <Option key={item.name} value={item.alias} dataRef={item}>{item.alias}</Option>
                                                            )
                                                        }
                                                    </Select>
                                                    :
                                                    <Input
                                                        value={this.state[item.alise]}
                                                        onChange={(e) => {this.changeHandler(e.target.value, item.alise)}}
                                                    />
                                                }
                                            </Col>
                                            <Col span={index === 0 ? 16 : 0 }>
                                                <Input
                                                    value={this.state.metric}
                                                    style={{display: index === 0 ? 'inline-block' : 'none', marginLeft: 3}}
                                                    onChange={(e) => {this.changeHandler(e.target.value, 'metric')}}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                <Col span={3}>
                                    <Row style={{marginBottom: 8}}>数据来源</Row>
                                    <Row>
                                        <Select
                                            placeholder="请选择"
                                            style={{ width: 150}}
                                            value={this.state.dataSource}
                                            allowClear
                                            onSelect={(val) => {this.changeHandler(val, 'dataSource')}}
                                        >
                                            {
                                                detection_data_source && detection_data_source.map((item) =>
                                                    <Option key={item.name} value={item.alias} dataRef={item}>{item.alias}</Option>
                                                )
                                            }
                                        </Select>
                                    </Row>
                                </Col>
                                <Col span={7} offset={1}>
                                    <Row style={{marginBottom: 8}}>启用监测</Row>
                                    <Row>
                                        <Checkbox
                                            checked={this.state.status === 1 ? true : false}
                                            onChange={(e) => {this.changeHandler(e.target.checked ? 1: 2, 'status')}}
                                        />
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                        <div style={{margin: '20px 50%'}}><Button type="primary" onClick={this.submitHandler}>提交</Button></div>
                        <NewDeviceModal
                          visible={this.state.eqVisible}
                          handleClickRow={this.handleClickRow}
                          handleOk={() => {
                            this.setState({ eqVisible: false });
                          }}
                          handleCancel={() => {
                            this.setState({ eqVisible: false });
                          }}
                        />
                        <NewLocationModal
                          visible={this.state.locVisible}
                          handleOk={() => {
                            this.queryLocation();
                            this.setState({ locVisible: false });
                          }}
                          handleCancel={() => {
                            this.setState({ locVisible: false });
                          }}
                          handleSelectLocation={this.handleSelectLocation}
                        />
                    </TabPane>
                    <TabPane tab='历史读数' key='3'>
                        <div style={{textAlign: 'center'}}><b>该功能暂未开通，敬请期待！</b></div>
                    </TabPane>
                    <TabPane tab='报警记录' key='4'>
                        <div style={{textAlign: 'center'}}><b>该功能暂未开通，敬请期待！</b></div>
                    </TabPane>
                </Tabs>
            </PageHeaderLayout>
        )
    }
}