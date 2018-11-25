import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Tabs, Input, Button, From, Modal, message} from 'antd';
import {routerRedux} from 'dva/router';
import moment from 'moment';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import parseValues from '../../../utils/utils';
import BasicForm from './BasicForm';
import PipeEqForm from './PipeEqForm';
import CurrencyForm from './CurrencyForm';
import GshEqForm from './GshEqForm';

const TabPane = Tabs.TabPane;

@connect(({device}) => ({

}))
export default class EqSynchronization extends PureComponent {
    state = {
    }
    render() {
      return (
        <PageHeaderLayout >
          <div>
            <BasicForm />
          </div>
          <div>
            <Tabs defaultActiveKey="1">
              <TabPane tab="管网设备同步" key="1">
                <PipeEqForm />
              </TabPane>
              <TabPane tab="通用设备入库" key="2">
                <CurrencyForm />
              </TabPane>
              <TabPane tab="工商户表具" key="3">
                <GshEqForm />
              </TabPane>
            </Tabs>
          </div>
        </PageHeaderLayout>
      );
    }
}
