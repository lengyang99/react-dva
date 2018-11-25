import React, {PureComponent} from 'react';
import { stringify } from 'qs';
import {connect} from 'dva';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import AccTable from './AccTable';
import {exportStationAccount} from '../../../services/station';

@connect(({login}) => {
  return {
    user: login.user
  }
})
export default class Account extends PureComponent {

  exportAccount = (params, path) => {

    const {user} = this.props;
    const data = {
      ...params,
      ecode: user.ecode,
      stationid: user.locGid || 0,
    };

    return exportStationAccount(data,path)

  };

  render() {
    return (
      <PageHeaderLayout>
        <AccTable
          exportAccount={this.exportAccount}
        />
      </PageHeaderLayout>

    )

  }
}
