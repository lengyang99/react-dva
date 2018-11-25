import React, {PureComponent} from 'react';
import { Tabs, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TotalUpdate from "../../../components/MakePlan/MonthUpdate/TotalUpdate.js";
import DetailUpdate from "../../../components/MakePlan/MonthUpdate/DetailUpdate.js";
import styles from '../style.less';
const TabPane = Tabs.TabPane;
@connect(
  state => ({
    success: state.make.success,
    msg: state.make.msg,
}))
export default class MakeMonthUpdate extends PureComponent {
  constructor(props) {
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
      planId: props.location.state.planId,
      total: [],
      detail: [],
      disable: false,
      activeKey: "1",
    }
  }
  handleTotal = (data) => {
    this.setState({total: data});
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
      gid: this.state.planId,
      state: state,
      state2: state,
      monthMakeTotals: monthMakeTotals,
      monthMakeDetails: monthMakeDetails,
    };
    if (this.state.activeKey == "2") {
      this.props.dispatch({
        type: 'make/updateMonthMake',
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

  render() {
    return (
      <PageHeaderLayout>
        <Tabs activeKey={this.state.activeKey} onChange={this.handleTabChange}>
          <TabPane tab="总体情况" key="1">
            <h3>每月气量预测</h3>
            <h3>单位：方</h3>
            <TotalUpdate planId={this.state.planId}  handleTotal={this.handleTotal.bind(this)}></TotalUpdate>
          </TabPane>
          <TabPane tab="详细情况" key="2">
            <h3>每月气量上报计划</h3>
            <h3>单位：万方</h3>
            <DetailUpdate planId={this.state.planId} detail={this.state.detail} allForecastUpdate={this.state.total} handleDetail={this.handleDetail.bind(this)}></DetailUpdate>
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



