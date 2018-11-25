import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs,Button, Row, Col, Input, Select, Checkbox} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';
import SearchPanel from './SearchPanel';
// import AlarmRecord from './AlarmRecord';   //报警记录
// import HistoryReads from './HistoryReads'; //历史读数
const TabPane =Tabs.TabPane;
const Option = Select.Option;

//阀门设置；
const valveName = [
    ['报警上限', '作业上限', '上限作业计划', '上限作业计划名称'],
    ['报警下限', '作业下限', '下限作业计划', '下限作业计划名称'],
];
//监测设置；
const monitorName = ['源测点编号', '源测点名称', '源计量单位', '转换系数']

@connect(({equipmentMonitor}) => ({
  dataList: equipmentMonitor.dataList,
}))

export default class DeviceProbing extends Component{
    state={
        
    }
    componentDidMount(){
        const {dispatch}=this.props;
        if(false){
            dispatch({
                type:'odorization/queryOdorList',
                payload:{userId:user.userid}
            });
            dispatch({
                type:'odorization/getStationData',
            });
            dispatch({
                type:'odorization/queryOdorMacList',
                payload:{stationId:58}
            });
            dispatch({
                type:'odorization/queryOperType',
            });
        }
    }

    handleTabChange = (key) => {
        console.log(123);
        if (key === '1') {
            this.props.dispatch(routerRedux.push(`monitorList`));
        }
    }
    render(){
        const {pageno,pagesize}=this.state;
        return (
            <PageHeaderLayout>
                <Tabs
                    defaultActiveKey='2'
                    onChange={this.handleTabChange}
                >
                    <TabPane tab='列表' key='1' />
                    <TabPane tab='设备检测点' key='2'>
                        <div>
                            <h3>基本信息</h3>
                            <Row style={{marginBottom: 20}}>
                                <Col span={12}>
                                    <Row style={{marginBottom: 8}}>* 监测点</Row>
                                    <Row>
                                        <Input value='10010' style={{display: 'inline-block', width: 100, marginRight: 8}}/>
                                        <Input style={{display: 'inline-block', width: 300}}/>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>*所属站点</Row>
                                    <Row>
                                        <Select placeholder="请选择站点" style={{ width: 120 }} allowClear>
                                          <Option value="lucy">永唐秦站</Option>
                                          <Option value="tom">开发区所</Option>
                                        </Select>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>所属组织</Row>
                                    <Row>
                                        <Input disabled style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: 20}}>
                                <Col span={12}>
                                    <Col span={6} style={{marginRight: 8}}>
                                        <Row style={{marginBottom: 8}}>计量单位</Row>
                                        <Row>
                                            <Input value='10010'/>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row style={{marginBottom: 8}}>值类型</Row>
                                        <Row>
                                            <Col span={8} style={{marginRight: 8}}>
                                                <Select style={{width: 120 }} allowClear>
                                                  <Option value="lucy">特征值</Option>
                                                  <Option value="tom">数值</Option>
                                                  <Option value="tom">工况</Option>
                                                </Select>
                                            </Col>
                                            <Col span={8}><Input placeholder="定义特征值" style={{width: 120}}/></Col>
                                        </Row>
                                    </Col>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>表纲号</Row>
                                    <Row>
                                        <Input style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>活动？</Row>
                                    <Row>
                                        <Checkbox></Checkbox>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: 20}}>
                                <Col span={12}>
                                    <Col span={6} style={{marginRight: 8}}>
                                        <Row style={{marginBottom: 8}}>关联计量设备</Row>
                                        <Row>
                                            <Input value='10010'/>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row style={{marginBottom: 8}}>设备名称</Row>
                                        <Row>
                                            <Input style={{display: 'inline-block'}}/>
                                        </Row>
                                    </Col>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>上次读数</Row>
                                    <Row>
                                        <Input style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>上次读数日期</Row>
                                    <Row>
                                        <Input style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: 20}}>
                                <Col span={12}>
                                    <Col span={6} style={{marginRight: 8}}>
                                        <Row style={{marginBottom: 8}}>监测设备</Row>
                                        <Row>
                                            <Input value='10010'/>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row style={{marginBottom: 8}}>设备名称</Row>
                                        <Row>
                                            <Input style={{display: 'inline-block'}}/>
                                        </Row>
                                    </Col>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>上次报警值</Row>
                                    <Row>
                                        <Input disabled style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>上次报警日期</Row>
                                    <Row>
                                        <Input disabled style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                            </Row>
                            <Row style={{marginBottom: 20}}>
                                <Col span={12}>
                                    <Col span={6} style={{marginRight: 8}}>
                                        <Row style={{marginBottom: 8}}>所属位置</Row>
                                        <Row>
                                            <Input value='10010'/>
                                        </Row>
                                    </Col>
                                    <Col span={12}>
                                        <Row style={{marginBottom: 8}}>设备名称</Row>
                                        <Row>
                                            <Input style={{display: 'inline-block'}}/>
                                        </Row>
                                    </Col>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>更改人</Row>
                                    <Row>
                                        <Input disabled style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                                <Col span={6}>
                                    <Row style={{marginBottom: 8}}>更改日期</Row>
                                    <Row>
                                        <Input disabled style={{ width: 120 }}/>
                                    </Row>
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <h3>阈值设置</h3>
                            {valveName.map(item1 =>
                                <Row style={{marginBottom: 20}}>
                                    {item1.map((item2, index) =>
                                        <Col span={index === 3 ? 9 : 3} offset={index === 2 || index === 1 ? 1 : 0} style={{marginRight: 8}}>
                                            <Row style={{marginBottom: 8}}>{item2}</Row>
                                            <Row><Input /></Row>
                                        </Col>
                                    )}
                                </Row>
                            )}
                        </div>
                        <div style={{marginBottom: 20}}>
                            <h3>监测设置</h3>
                            <Row style={{marginBottom: 20}}>
                                {monitorName.map((item, index) =>
                                    <Col span={index === 1 ? 7 : 3} offset={index === 0 ? 0 : 1}>
                                        <Row style={{marginBottom: 8}}>{item}</Row>
                                        <Row><Input /></Row>
                                    </Col>
                                )}
                            </Row>
                            <Row>
                                <Col span={3}>
                                    <Row style={{marginBottom: 8}}>数据来源</Row>
                                    <Row><Input /></Row>
                                </Col>
                                <Col span={7} offset={1}>
                                    <Col span={12} style={{marginRight: 8}}>
                                        <Row style={{marginBottom: 8}}>监测频率(秒)</Row>
                                        <Row><Input /></Row>
                                    </Col>
                                    <Col span={6}>
                                        <Row style={{marginBottom: 8}}>启用监测？</Row>
                                        <Row><Checkbox /></Row>
                                    </Col>
                                </Col>
                                <Col span={3} offset={1}>
                                    <Row style={{marginBottom: 8}}>本地存储？</Row>
                                    <Row><Checkbox /></Row>
                                </Col>
                            </Row>
                        </div>
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