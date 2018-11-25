import React, {PureComponent} from 'react';
import { Tabs, Button, message} from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TotalUpdate from "../../../components/MakeWeek/WeekUpdate/TotalUpdate.js";
import DetailUpdate from "../../../components/MakeWeek/WeekUpdate/DetailUpdate.js";
import styles from '../style.less';
const TabPane = Tabs.TabPane;
@connect(
  state => ({
    success: state.weekMake.success,
    msg: state.weekMake.msg,
}))
export default class MakeWeekUpdate extends PureComponent {
  constructor(props) {
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.week = this.getWeek();
    this.state = {
      planId: props.location.state.planId,
      total: [],
      detail: [],
      gasAnalysis: "",//城燃分析
      vehicleAnalysis: "",//车用分析
      deliverAnalysis: "",//外输分析
      disable: false,
      activeKey: "1",
    }
  }
  //获取下周七天日期，并格式化为“yyyy-mm-dd”放入数组中
  getWeek() {
    const week = [];
    for (let i = 0; i < 7; i++) {
      let Stamp = new Date();
      let number;
      if (Stamp.getDay() == 0) {
        number = 7;
      } else {
        number = Stamp.getDay();
      }
      let num = 7-number + 1 + i;
      Stamp.setDate(Stamp.getDate() + num);

      let year = Stamp.getFullYear();
      let month = Stamp.getMonth() + 1;
      let date = Stamp.getDate();
      if (month < 10) {
          month = `0${month}`;
      }
      if (date < 10) {
        week.push(`${year}-${month}-0${date}`);        
      } else {
        week.push(`${year}-${month}-${date}`);
      }
    }
    return week;
  }

  handleTotal = (data) => {
    this.setState({total: data});
  }

  handleDetail = (data) => {
    this.setState({detail: data});
  }

  handledWeekMakeTotalAnalysis = (value,index) => {
    switch (index) {
      case 1:
        this.setState({
          gasAnalysis: value,
        });
        break;
      case 2:
        this.setState({
          vehicleAnalysis: value,
        });
        break;
      case 3:
        this.setState({
          deliverAnalysis: value,
        });
        break;
    }
  }

  handleReport = (state) => {
    this.setState({
      activeKey: "2",
    });
    let weekMakeTotalAnalysis = {
      planid: this.state.planId,
      gasAnalysis: this.state.gasAnalysis,
      vehicleAnalysis: this.state.vehicleAnalysis,
      deliverAnalysis: this.state.deliverAnalysis,
    }
    let param = {
      gid: this.state.planId,
      state: state,
      state2: state,
      weekMakeTotalAnalysis: weekMakeTotalAnalysis,
      weekMakeTotals: this.state.total,
      weekMakeDetails: this.state.detail,
    };
    if (this.state.activeKey == "2") {
      this.props.dispatch({
        type: 'weekMake/updateWeekMake',
        params: param,
        callback: ({msg,success})=>{
          if (success) {
            message.success(msg,8);
            //返回计划制定列表
            const path = {
              pathname: '/distribution/weekPlan',
            }
            this.props.dispatch(routerRedux.push(path));
          }
        }
      });
    }
  }

  handleTabChange = (activeKey) => {
    this.setState({
      activeKey: activeKey,
    });
  }

  render() {
    return (
      <PageHeaderLayout>
        <Tabs activeKey={this.state.activeKey} onChange={this.handleTabChange}>
          <TabPane tab="总体情况" key="1">
            <h3>每周气量预测</h3>
            <h3>单位：方</h3>
            <TotalUpdate planId={this.state.planId} handleTotal={this.handleTotal.bind(this)} handledWeekMakeTotalAnalysis={this.handledWeekMakeTotalAnalysis.bind(this)}></TotalUpdate>
          </TabPane>
          <TabPane tab="详细情况" key="2">
            <h3>每周气量上报计划</h3>
            <h3>单位：万方</h3>
            <DetailUpdate planId={this.state.planId} totalUpdate={this.state.total} handleDetail={this.handleDetail.bind(this)}></DetailUpdate>
          </TabPane>
        </Tabs>
        <div className={styles.btn}>
          <Button style={{display: this.state.activeKey == "1"?"none":"inline"}} disabled={this.state.disable} type="primary" onClick={() => {this.handleReport(1)}}>生成</Button>
          <Button disabled={this.state.disable} style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
          {/* <Button disabled={this.state.disable} style={{marginLeft: '25px'}} onClick={() => {message.info("此功能暂未开放，敬请期待！")}}>导出</Button> */}
          <Button style={{marginLeft: '25px'}}><Link to={'/distribution/weekPlan'}>返回</Link></Button>
        </div>
      </PageHeaderLayout>
    );
  }
}



