import React, {PureComponent} from 'react';
import {Tabs, Table, Button, Icon, Row, Col, Switch, Radio, Form, Progress } from 'antd';
import classnames from "classnames";
import styles from "./ValveDetail.less";
import appEvent from '../../utils/eventBus';
import EcityMap from '../../components/Map/EcityMap';
const TabPane = Tabs.TabPane;
import {connect} from 'dva';
import moment from 'moment';
const FormItem = Form.Item;
const FormatStr = 'YYYY-MM-DD';

import { routerRedux } from 'dva/router';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import Equipment from "../../components/Taskdetail/Equipment";
import Taskfeedback from "../../components/Taskdetail/Taskfeedback";

@connect(state => ({
  functionName: state.taskdetail.functionName,
  data: state.taskdetail.data,
  detaildata: state.taskdetail.detaildata,
  eqdetail: state.taskdetail.eqdetail,
  fbdetail: state.taskdetail.fbdetail
}))

export default class TaskDetail extends PureComponent {
  constructor({taskdetail, props}) {
    super(props);


  }
   onMapLoad = () => {
    this.execMapDispEvent()
  };
  componentDidMount() {
      const carddata = this.props.location.state
      // const params = 'planId=' + carddata.planId + '&startTime=' + carddata.startTime + '&endTime=' + carddata.endTime
      const params = {
        planId: carddata.planId,
        startTime: carddata.startTime,
        endTime: carddata.endTime
      }
      this.props.dispatch({"type": "taskdetail/getFunction"});
      this.props.dispatch({"type": "taskdetail/getCardInfo"});
      this.props.dispatch({"type": "taskdetail/getCardDetail", "payload": params});
  }


  delHandler1(record){
    const params = {
      taskId: record.taskId
    }
    this.props.dispatch({"type": "taskdetail/getDetailinfo", "payload": params})
    this.refs.alve_feedback.style.right = 0 + "px";
  }
  delHandler(){
    this.refs.alve_feedback.style.right = -260 + "px";
  }

  execMapDispEvent(){
      let dots = [];
      const str = this.props.location.state.areaPolygon
      const ss = JSON.parse(str)
      ss.map((item)=>{
        return dots.push({x: item.x, y: item.y})
      })
      let addParams = {
        id: 'show_all_station_polygon_edit',
        layerId: 'show_all_station_polygon',
        dots: dots
      };
      let addPoint = {
        id: 'show_all_station_point_edit',
        layerId: 'show_all_station_point',
        dots: {x: 1000, y: 1000}
      }
      appEvent.emit('mapEvent.mapDisplay.polygon', addParams);
      // appEvent.emit('mapEvent.mapDisplay.point', addParams);

  }
  maxHandler(){
    appEvent.emit('mapEvent.mapOper.setzoomin')
  }
  minHandler(){
    appEvent.emit('mapEvent.mapOper.setzoomout')
  }
  render() {
    const  columns = [
              {
                title: '设备名称',
                dataIndex: 'eqName',
                width: 150,
                render: (text, record) => {
                    return <p><span style={{color: "skyblue"}}>{record.address}</span><br/>{text}</p>
                }
              },
              {
                title: '上次维护时间',
                dataIndex: 'lastChangeTime',
                width: 150,
                render: (text, record) => {

                }
              },
              {
                title: '到位情况',
                dataIndex: 'arriveTime',
                sorter: (a, b)=> a - b > 0,
                width: 100,
                render: (text, record) => {
                    if(text == null){
                      return <p><span style={{color: "red"}}>未到位</span></p>
                    }else{
                      return <p><span style={{color: "skyblue"}}>已到位</span>{" "}<span>{moment(text).format(FormatStr)}</span></p>
                    }
                }
              },
              {
                title: '反馈情况',
                dataIndex: 'feedbackTime',
                sorter: (a, b)=> a - b > 0,
                width: 100,
                render: (text, record) => {
                  if(text == null){
                       return <p style={{"color": "red"}}>未反馈</p>
                  }else{
                     return <p style={{"color": "#379FFF", "cursor":"pointer" }} onClick={()=>{this.delHandler1(record)}}>已反馈</p>
                  }
                }
              }
              ]
      const detaildata = this.props.detaildata || [];
      const a = this.props.data;
      const cardData = this.props.location.state;

      const TaskType = cardData.taskType == 0 ? "临时" : "常规";
      const functionName = this.props.functionName || [];
      let funL = functionName.length
      const funN = funL > 0 ? functionName.filter((item)=>{
        return item.functionKey == "valve"
      }) : {}
      const f = funN[0] || []
      // const b = moment(a.startTime).format(FormatStr)
      //到位率
      const arrivalRate = (cardData.arriveCount / cardData.taskCount) * 100;
      //反馈率
      const feedbackRate = (cardData.feedBackCount / cardData.taskCount) * 100;
    return (
      <PageHeaderLayout>
        <div className={styles.valve}>
          <div className={styles.valve_map}>
            <EcityMap mapId='maintall' onMapLoad={this.onMapLoad}/>
          </div>
          <div className={styles.valve_detail}>
          <div className={styles.valve_Informationbox}>
            <span><b>区域：{cardData.regionName}</b></span>
            <br/>
            <span><b>责任人：{cardData.regionDutyName}</b></span>
          </div>
          <div className={styles.map_set}>
            <p><Icon type="plus-circle-o"  style={{fontSize: 30, marginRight: 30}} onClick={this.maxHandler}/><Icon type="minus-circle-o" style={{fontSize: 30}}  onClick={this.minHandler}/></p>
          </div>
            <Row span={6}>
              <div className={styles.valve_situation}>
              <Row style={{height: 35, textAlign: "center", marginTop: 15}}>
                <Col span={5}>
                  <img src="/images/task-detail/person.png" style={{width: 35}}/>
                  <span style={{marginLeft: 10, color: "skyblue"}}>{cardData.assigneeName}</span>
                </Col>
                <Col span={10}>
                  <p><b>{moment(cardData.startTime).format(FormatStr)} 至 {moment(cardData.endTime).format(FormatStr)}</b></p>
                  <p><b><span style={{color: "skyblue"}}>{TaskType}{" "}{cardData.len}{" "}{cardData.cycleName}</span> {cardData.regionName} {f.functionName}</b></p>
                </Col >
                <Col span={2} offset={6}>
                    <a href="/#/query/task-summary"><Icon type="close" style={{width: 60}}/></a>
                </Col>
              </Row>
              <Row span={18}>
                <div style={{ width: 250 }}>
                  <Row>
                    <Col span={8} style={{textAlign: "right"}}>
                      <img src="images/homePageImages/绿.png" alt=""/>{" "}到位率：
                    </Col>
                    <Col span={12}>
                      <Progress percent={arrivalRate} strokeWidth={5} showInfo={false}/>
                    </Col>
                    <Col span={4} style={{textAlign: "center"}}>
                      <p><span style={{color: "blue"}}>{cardData.arriveCount}</span>/{cardData.taskCount}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8} style={{textAlign: "right"}}>
                      <img src="images/homePageImages/黄.png" alt=""/>{" "}反馈率：
                    </Col>
                    <Col span={12}>
                      <Progress percent={feedbackRate} strokeWidth={5} showInfo={false}/>
                    </Col>
                    <Col span={4}>
                      <p><span style={{color: "blue"}}>{cardData.feedBackCount}</span>/{cardData.taskCount}</p>
                    </Col>
                  </Row>
                </div>
              </Row>
            </div>
            </Row>
            <Row>
              <div className={styles.valve_table}>
                <Table
                  columns={columns}
                  dataSource={detaildata}
                  rowKey= "taskId"
                  scroll={{ y: 320 }}
                  pagination={{
                    total: detaildata.length,
                    showTotal:(total) => {return `共 ${total} 条数据`},
                    defaultPageSize: 6,
                    showSizeChanger:true,
                    showQuickJumper: true,
                    pageSizeOptions: ["6", "12", "20", "50", "100"]
                  }}
                />
              </div>
            </Row>
          </div>
          <div className={styles.valve_feedback} ref="alve_feedback">
              <div className={styles.valve_back}>
                <Icon type="close" style={{width: 60}} onClick={()=>{this.delHandler()}}/>
              </div>
              <Tabs defaultActiveKey="1">
                <TabPane tab="设备信息" key="1">
                  <Equipment></Equipment>
                </TabPane>
                <TabPane tab="任务反馈" key="2">
                  <Taskfeedback></Taskfeedback>
                </TabPane>
              </Tabs>
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
