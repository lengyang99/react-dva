import React, { PureComponent } from 'react';
import { Tabs } from 'antd';
import TabBar from './TabBar';
import List from './list';
import Ledger from './ledger';
import Param from './param';
import History from './histroy';
import Maintain from './maintain';
import Record from './record';
import Map from './map';
import styles from './index.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import DragTable from '../../components/DragTable';

const TabPane = Tabs.TabPane;
const tabBarData = [
  { name: '列表', key: 'list', component: List },
  { name: '台账信息', key: 'ledger', component: Ledger },
  { name: '技术参数', key: 'param', component: Param },
  { name: '历史工单', key: 'history', component: History },
  { name: '计划性维护', key: 'maintain', component: Maintain },
  { name: '隐患记录', key: 'record', component: Record },
  { name: '地图', key: 'map', component: Map },
];

export default class Equipment extends PureComponent {
  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.ledger}>
          <TabBar>
            {tabBarData.map((ele) => {
              const Component = ele.component;
              return <TabPane tab={ele.name} key={ele.key}><Component /></TabPane>;
            })}
          </TabBar>
        </div>
      </PageHeaderLayout>
    );
  }
}
