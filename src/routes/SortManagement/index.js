import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Layout, Tabs } from 'antd';
import SortTree from './SortTree';
import PropertyList from './PropertyList';
import PropertyEdit from './PropertyEdit';
import EquipmentList from './EquipmentList';
import EnumList from './EnumList';
import EnumEdit from './EnumEdit';
import styles from './Location.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

@connect()
class SortManagement extends PureComponent {
  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.location}>
          <Layout>
            <Sider className="sider" style={{ background: '#fff' }} width={300}>
              <SortTree />
            </Sider>
            <Content className={styles.backgroundColor}>
              <Tabs defaultActiveKey="1">
                <TabPane tab="属性列表" key="1">
                  <PropertyList />
                  <PropertyEdit />
                  <EnumList />
                  <EnumEdit />
                </TabPane>
                <TabPane tab="设备列表" key="2">
                  <EquipmentList />
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </div>
      </PageHeaderLayout>
    );
  }
}

export default SortManagement;
