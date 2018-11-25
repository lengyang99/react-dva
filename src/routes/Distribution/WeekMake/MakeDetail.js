import React, {PureComponent} from 'react';
import { Tabs } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TotalCondition from "../../../components/MakeWeek/MakeDetail/TotalCondition.js";
import DetailCondition from "../../../components/MakeWeek/MakeDetail/DetailCondition.js";
const TabPane = Tabs.TabPane;

export default class MakeDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      planId: props.location.state.planId,
    }
  }

  render() {
    return (
      <PageHeaderLayout>
        <Tabs defaultActiveKey="1">
          <TabPane tab="总体情况" key="1">
            <h3>每周气量预测</h3>
            <h3>单位：方</h3>
            <TotalCondition planId={this.state.planId}></TotalCondition>
          </TabPane>
          <TabPane tab="详细情况" key="2">
            <h3>每周气量上报计划</h3>
            <h3>单位：万方</h3>
            <DetailCondition planId={this.state.planId}></DetailCondition>
          </TabPane>
        </Tabs>
      </PageHeaderLayout>
    );
  }
}



