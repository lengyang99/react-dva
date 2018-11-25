import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Tabs, Button } from 'antd';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { IchBasicInfo, IchMeterTaskResult, SecurityCheckRecord, Regulator, Meter } from './TabDetail/index';


const TabPane = Tabs.TabPane;
@connect(state => ({
  funs: state.login.funs,
}))
class ichAccountDetail extends PureComponent {
  componentDidMount() {
    this.tool = this.props.location;
    if (this.tool.detailData) {
      localStorage.setItem('ichAccountDetail', JSON.stringify(this.tool));
    } else {
      const dataString = localStorage.getItem('ichAccountDetail');
      this.tool = JSON.parse(dataString);
    }
    this.props.dispatch({
      type: 'ichAccountDetail/getIchAccountDetail',
      payload: {
        gsh_gid: this.tool.detailData.gid,
      },
    });
  }
  goBack = () => {
    this.props.dispatch(routerRedux.push(this.tool.historyPageName));
  };
  onchanges = (key) => {
    if (key === '3') {
      const detailData = this.tool.detailData;
      this.props.dispatch({
        type: 'ichAccountDetail/fetchMeterData',
        payload: {
          contract_account: detailData.contract_account,
        },
      });
    }
  };
  render() {
    const { funs } = this.props;
    return (
      <PageHeaderLayout>
        <Tabs defaultActiveKey="1" onChange={this.onchanges}>
          <TabPane tab="基本信息" key="1">
            <Button
              style={{float: 'right', marginRight: '25px'}}
              onClick={this.goBack}
            >返回</Button>
            <IchBasicInfo />
          </TabPane>
          {
            funs.find(ele => ele.code === 'gsh_mount_regulator') ?
              (<TabPane tab="关联调压器" key="2">
                <Regulator />
              </TabPane>) :
              null
          }
          <TabPane tab="关联表具" key="3">
            <Meter />
          </TabPane>
          <TabPane tab="抄表记录" key="4">
            <IchMeterTaskResult />
          </TabPane>
          <TabPane tab="安检记录" key="5">
            <SecurityCheckRecord />
          </TabPane>
          <TabPane tab="检定记录" key="6">检定记录</TabPane>
          <TabPane tab="隐患整改记录" key="7">隐患整改记录</TabPane>
        </Tabs>
      </PageHeaderLayout>
    );
  }
}

export default ichAccountDetail;
