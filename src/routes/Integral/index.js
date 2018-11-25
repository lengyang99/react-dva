import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';

import TabContent from './TabContent';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const TabPane = Tabs.TabPane;

@connect(state => ({
  activeKey: state.integral.activeKey,
}))
export default class Integral extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'integral/fetchIntegralList',
      payload: this.props.activeKey,
    });
  }
  handleChange = activeKey => {
    this.props.dispatch({
      type: 'integral/setActiveKey',
      payload: activeKey,
    });
    this.props.dispatch({
      type: 'integral/fetchIntegralList',
      payload: activeKey,
    });
    this.props.dispatch({
      type: 'integral/setSearch',
      payload: '',
    });
  };
  render() {
    const { activeKey } = this.props;
    return (
      <PageHeaderLayout>
        <div>
          <Tabs activeKey={activeKey} onChange={this.handleChange}>
            <TabPane tab="上报积分" key="report"><TabContent /></TabPane>
            <TabPane tab="配置积分" key="config"><TabContent /></TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}
