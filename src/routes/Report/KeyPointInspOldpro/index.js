import React, { Component } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import { Spin } from 'antd';
import SearchPanel from './SearchPanel';
import TableList from './TableList';

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({statistics, login}) => ({
  keyPonitData: statistics.keyPonitData,
  stationData: statistics.stationData,
  total: statistics.total,
  user: login.user,
}))

export default class KeyPointInsp extends Component {
    state={
      ...pageParams,
      searchParams: {}, // 查询参数
      downLoading: false,
    }
    componentDidMount() {
      const {dispatch} = this.props;
      this.queryKeyPonitList();
      dispatch({
        type: 'statistics/getStationData',
      });
    }
    // 查询
    queryKeyPonitList = (params = {}) => {
      this.props.dispatch({
        type: 'statistics/queryKeyPonitList',
        payload: {...pageParams, ...{date: moment().subtract(1, 'days').format('YYYY-MM-DD')}, ...params},
      });
      if (!params.pageno) {
        this.setState(pageParams);
      }
    }
    // 分页查询
    handleTableChange = (pagination) => {
      const params = {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        ...this.state.searchParams,
      };
      this.setState({
        pageno: pagination.current,
        pagesize: pagination.pageSize,
      });
      this.queryKeyPonitList({...params });
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
      this.setState({searchParams: {}});
      this.setState(pageParams);
      this.queryKeyPonitList();
    };
    loadingHandler = (val) => {
      this.setState({downLoading: val})
    };
    render() {
      const {pageno, pagesize} = this.state;
      const pagination = {
        current: pageno,
        pageSize: pagesize,
        total: this.props.total,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: () => {
          return (<div className={styles.pagination}>
                     共 {this.props.total} 条记录
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
            loading={(value) => {this.loadingHandler(value)}}
          />
          <TableList
            {...this.props}
            handleTableChange={this.handleTableChange}
            pagination={pagination}
          />
          <div className={styles['loading']} style={{display: this.state.downLoading ? 'block' : 'none'}}>
              <Spin size="large"/>
          </div>
        </PageHeaderLayout>
      );
    }
}
