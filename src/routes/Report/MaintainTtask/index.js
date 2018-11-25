import React, { Component } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import { Spin } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import SearchPanel from './SearchPanel';
import TableList from './TableList';

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({statistics, login}) => ({
  maintaceData: statistics.maintaceData,
  stationData: statistics.stationData,
  functionData: statistics.functionData,
  total: statistics.total,
  user: login.user,
}))

export default class MaintainTtask extends Component {
    state={
      ...pageParams,
      searchParams: {}, // 查询参数
      downLoading: false,
    }
    componentWillMount() {
      const {dispatch} = this.props;
      this.queryMaintaceList();
      dispatch({
        type: 'statistics/getStationData',
      });
      dispatch({
        type: 'statistics/getFunctionData',
        payload: {group: 'net'},
      });
    }
    // 查询
    queryMaintaceList = (params = {}) => {
      this.props.dispatch({
        type: 'statistics/queryMaintaceList',
        payload: {...{date: moment().format('YYYY-MM')}, ...pageParams, ...params},
      });
      // 除分页查询外每次条件查询后分页参数重置为默认
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
      this.queryMaintaceList({...params });
    };
    // 搜索
    handleOnSearch = (params) => {
      this.setState({ searchParams: { ...this.state.searchParams, ...params } });
      this.queryMaintaceList({
        ...this.state.searchParams,
        ...params,
      });
    }
    // 重置
    handleOnRest = () => {
      this.setState({searchParams: {}});
      this.setState(pageParams);
      this.queryMaintaceList();
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
