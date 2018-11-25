import React, {Component} from 'react';
import {Form, Select, DatePicker, Input} from 'antd';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import SearchPanel from './SearchPanel';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import ShiftTable from './ShiftTable';

@connect(({dutymanage, login}) => ({
  user: login.user,
  users: dutymanage.users,
  stations: dutymanage.stations,
  DutyList: dutymanage.DutyList,
  workTime: dutymanage.workTime,
  loading: dutymanage.loading,
}))
export default class DutyLog extends Component {
  constructor(props) {
    super(props);
    this.getStationData();
  }
  whereOption={};

  componentDidMount() {
    this.queryRecordList();
    console.log(this.props.user, '来来来');
    this.props.dispatch({
      type: 'dutymanage/queryWorkTime',
      payload: { group: 'net'},
    });
  }

  getStationData = () => {
    this.props.dispatch({
      type: 'dutymanage/getStationData',
    });
  };

  queryRecordList = (params) => {
    this.props.dispatch({
      type: 'dutymanage/queryDutyList',
      payload: {
        pageno: 1,
        pagesize: 10,
        ...params,
      },
    });
  };
  // 查询
  handOnSearch = (params = {}) => {
    this.queryRecordList(params);
  };
  // 上报
  handOnReport =({stationcode}) => {
    this.props.dispatch(routerRedux.push(`DutyDetail?action=add&station=${stationcode}`));
  }
  getStationUsers=(stationId) => {
    this.props.dispatch({
      type: 'dutymanage/queryUsersByStationId',
      payload: {
        stationId,
      },
    });
  }

  handleTableChange=({current, pageSize}) => {
    this.queryRecordList({
      pageno: current,
      pagesize: pageSize,
      ...this.whereOption,
    });
  };
  render() {
    const data = this.props.stations;
    const users = this.props.users;
    return (
      <PageHeaderLayout>
        <SearchPanel
          {...this.props}
          handOnReport={this.handOnReport}
          handOnSearch={this.handOnSearch}
          queryAllUsersBySation={this.getStationUsers}
        />
        <ShiftTable
          loading={this.props.loading}
          listdata={this.props.DutyList}
          onChange={this.handleTableChange}
        />
      </PageHeaderLayout>
    );
  }
}
