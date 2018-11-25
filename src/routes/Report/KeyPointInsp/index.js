import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import { Spin } from 'antd';
import SearchPanel from './SearchPanel';
import TableList from './TableList';

const inspect_bustype = 1; // 区域分组：巡视

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({ statistics, login, regionalManage, patrolTaskList }) => ({
  total: statistics.total,
  user: login.user,
  stationList: regionalManage.stationList,
  stationListNoInspect: regionalManage.stationListNoInspect,
  areaTree: regionalManage.areaTree,
  areaTreeNoInspect: regionalManage.areaTreeNoInspect,
  patrolTaskStatisticInfo: statistics.patrolTaskStatisticInfo,
  patrolTaskTotal: statistics.patrolTaskTotal,
  patrolLayerInfo: patrolTaskList.patrolLayerInfo,
  authData: login.datas,
  patrolCycleData: patrolTaskList.patrolCycleData,
}))

export default class KeyPointInsp extends Component {
  state = {
    ...pageParams,
    searchParams: {}, // 查询参数
    downLoading: false,
  }
  componentDidMount() {
    const { dispatch } = this.props;
    this.queryKeyPonitList();
    dispatch({
      type: 'regionalManage/getStationInfo',
    });
    dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: '',
      code: inspect_bustype, // 默认查询巡检业务下所有的区域
      callback: this.dealAreaData,
    });
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolLayerInfo',
    });
    this.props.dispatch({
      type: 'patrolTaskList/queryPatrolCycle',
    })
  }
  // 查询
  queryKeyPonitList = (params = {}) => {
    this.props.dispatch({
      type: 'statistics/getPatrolTaskAnalysis',
      payload: { ...pageParams, ...params },
    });
    if (!params.pageno) {
      this.setState(pageParams);
    }
  }
  // 分页查询
  handleTableChange = (pagination) => {
    const params = {
      ...this.state.searchParams,
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    };
    this.setState({
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    });
    this.queryKeyPonitList({ ...params });
  };
  // 搜索
  handleOnSearch = (params) => {
    this.setState({ searchParams: { ...this.state.searchParams, ...params } });
    this.queryKeyPonitList({
      ...this.state.searchParams,
      ...params,
    });
  }
  // 重置
  handleOnRest = () => {
    this.setState({ searchParams: {}, patrolLayer: '' });
    this.setState(pageParams);
    this.queryKeyPonitList();
  };
  loadingHandler = (val) => {
    this.setState({ downLoading: val })
  };
  // 站点信息返回结果处理
  dealAreaData = (areaTree, data) => {
    areaTree.forEach((item) => {
      const tmp = {
        name: item.name,
        value: `${item.gid}`,
        key: item.gid,
        attr: { stationid: item.stationid, station: item.station, ecode: item.ecode, username: item.usernames },
        type: item.parentid ? 2 : 1,
        orgcode: item.orgCode,
        orgUserid: item.userid,
      };
      data.push(tmp);
      if (item.children && item.children.length > 0) {
        tmp.children = [];
        this.dealAreaData(item.children, tmp.children);
      }
    });
  }

  resetPagination = () => {
    this.setState({
      ...pageParams,
    });
  }

  handlePatrolLayerChange = (patrolLayer) => {
    this.setState({ patrolLayer });
  }

  render() {
    const { pageno, pagesize } = this.state;
    const pagination = {
      current: pageno,
      pageSize: pagesize,
      total: this.props.patrolTaskTotal,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => {
        return (<div className={styles.pagination}>
          共 {this.props.patrolTaskTotal} 条记录
          </div>);
      },
    };
    return (
      <PageHeaderLayout>
        <SearchPanel
          {...this.props}
          pageno={this.state.pageno}
          pagesize={this.state.pagesize}
          handleOnSearch={this.handleOnSearch}
          handleOnRest={this.handleOnRest}
          loading={(value) => { this.loadingHandler(value) }}
          dealAreaInfo={this.dealAreaData}
          defaultPageParam={pageParams}
          resetPagination={this.resetPagination}
          bustype={inspect_bustype}
          total={this.props.patrolTaskTotal}
          handlePatrolLayerChange={this.handlePatrolLayerChange}
          patrolLayer={this.state.patrolLayer}
        />
        <TableList
          {...this.props}
          handleTableChange={this.handleTableChange}
          pagination={pagination}
          patrolLayerInfo={this.props.patrolLayerInfo}
          patrolLayer={this.state.patrolLayer}
        />
        <div className={styles['loading']} style={{ display: this.state.downLoading ? 'block' : 'none' }}>
          <Spin size="large" />
        </div>
      </PageHeaderLayout>
    );
  }
}
