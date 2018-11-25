import React, {PureComponent} from 'react';
import { Tabs, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import MonthTotal from "../../../components/MakePlan/Make/MonthTotal.js";
import MonthDetail from "../../../components/MakePlan/Make/MonthDetail.js";
import styles from '../style.less';
const TabPane = Tabs.TabPane;
@connect(
  state => ({
    success: state.make.success,
    msg: state.make.msg,
}))
export default class MakeMonth extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 2;
    if (this.month == 13) {
      this.year = parseInt(this.year) + 1;
      this.month = 1;
    }
    this.days = new Date(this.year, this.month, 0).getDate();
    if (this.month < 10) {
      this.month = `0${this.month}`;
    }
    this.state = {
      total: [],
      detail: [],
      disable: false,
      activeKey: "1",
    }
  }

  handleTotal = (data) => {
    this.setState({total: data});
    const dataSource = [];
    for (let i = 0; i < data.length; i++) {
      let date;
      if (i < 9) {
        date = `${this.year}-${this.month}-0${i+1}`;
      } else if (i < this.days) {
        date = `${this.year}-${this.month}-${i+1}`;
      } else {
        date = "合计";
      }
      dataSource.push({
        key: i+1,
        date: date,
        secondTrunk: 0,
        centralBranch: 0,
        gasStation: 0,
        unionStation: 0,
        huadu: 0,
        planningQuantity: 0,
        requirement: data[i].allForecast/10000,
      });
    }
    this.setState({
      detail: dataSource,
    });
  }

  handleDetail = (data) => {
    this.setState({detail: data});
  }

  handleReport = (state) => {
    this.setState({
      activeKey: "2",
    });
    const monthMakeTotals = [];
    const monthMakeDetails = [];
    for (let i = 0; i < this.days; i++) {
      monthMakeTotals.push(this.state.total[i]);
      monthMakeDetails.push(this.state.detail[i]);
    }
    //拼接发送至服务的月计划制定的参数
    let param = {
      startdate: monthMakeTotals[0].makeDate,
      enddate: monthMakeTotals[this.days-1].makeDate,
      state: state,
      state2: state,
      monthMakeTotals: monthMakeTotals,
      monthMakeDetails: monthMakeDetails,
    };
    if (this.state.activeKey == "2") {
      this.setState({
        disable: true,
      });
      this.props.dispatch({
        type: 'make/addMonthMake',
        params: param,
        callback: ({msg,success})=>{
          if (success) {
            message.success(msg,8);
            //返回月计划制定列表
            const path = {
              pathname: '/distribution/monthPlan',
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

  handleChangeButton = (flag) => {
    this.setState({
      disable: flag,
    });
  }

  render() {
    return (
      <PageHeaderLayout>
        <Tabs activeKey={this.state.activeKey} onChange={this.handleTabChange}>
          <TabPane disabled={this.state.disable} tab="总体情况" key="1">
            <h3>每月气量预测</h3>
            <h3>单位：方</h3>
            <MonthTotal handleTotal={this.handleTotal.bind(this)} handleChangeButton={this.handleChangeButton.bind(this)}></MonthTotal>
          </TabPane>
          <TabPane disabled={this.state.disable} tab="详细情况" key="2">
            <h3>每月气量上报计划</h3>
            <h3>单位：万方</h3>
            <MonthDetail detail={this.state.detail} allForecast={this.state.total} handleDetail={this.handleDetail.bind(this)}></MonthDetail>
          </TabPane>
        </Tabs>
        <div className={styles.btn}>
          <Button style={{display: this.state.activeKey == "1"?"none":"inline"}} disabled={this.state.disable} type="primary" onClick={() => {this.handleReport(1)}}>生成</Button>
          <Button disabled={this.state.disable} style={{marginLeft: '25px'}} onClick={() => {this.handleReport(0)}}>保存</Button>
          {/* <Button disabled={this.state.disable} style={{marginLeft: '25px'}} onClick={() => {message.info("此功能暂未开放，敬请期待！")}}>导出</Button> */}
          <Button style={{marginLeft: '25px'}}><Link to={'/distribution/monthPlan'}>返回</Link></Button>
        </div>
      </PageHeaderLayout>
    );
  }
}



