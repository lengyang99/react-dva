import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs, Button, Row, Col, Input, Select, Checkbox, InputNumber, Table} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from "./index.less";
import EarlyWarning from "./newPlan/EarlyWarning";
import Average from "./newPlan/Average";
import Mintain from "./newPlan/Mintain";

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
// 液位预警
const earlyWarning = {
  smellyMachineId: '',
  smellyMachineName: '',
  warnLevel: '',
  operatorId: '',
  operatorName: '',
  remark: '',
  ecode: '',
};
@connect(({ odorization, login, station }) => ({
  detailDtata: odorization.detailDtata,
  odorMacData: odorization.odorMacData,
  user: login.user,
  groups: station.groups,
  eqUnit: station.eqUnit
}))
export default class OdorManage extends Component {
  state = {
    isChange: false,
  };

  handleTabChange = key => {
    this.setState({
      isChange: !this.state.isChange,
    })
  };

  render() {
    return <PageHeaderLayout>
        <Tabs defaultActiveKey="1" onChange={this.handleTabChange}>
          <TabPane tab="加臭机液位预警" key="1">
            <div className={styles.OdorManage}>
              <EarlyWarning isChange={this.state.isChange} />
            </div>
          </TabPane>
          <TabPane tab="加臭量平均值" key="2">
            <div className={styles.OdorManage}>
              <Average isChange={this.state.isChange}/>
            </div>
          </TabPane>
          <TabPane tab="管路维护" key="3">
            <div className={styles.OdorManage}>
              <Mintain isChange={this.state.isChange}/>
            </div>
          </TabPane>
        </Tabs>
      </PageHeaderLayout>;
  }
}
