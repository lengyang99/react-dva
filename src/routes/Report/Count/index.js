import React, { Component } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import SearchPanel from './SearchPanel';
import TableList from './TableList';

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({statistics}) => ({
  scoreData: statistics.scoreData,
  stationData: statistics.stationData,
  total: statistics.total,
}))

export default class Count extends Component {
    state={
      ...pageParams,
      searchParams: {}, // 查询参数
    }
    componentDidMount() {
      this.queryScoreCount();
    }
    // 查询
    queryScoreCount = (params = {}) => {
      this.props.dispatch({
        type: 'statistics/queryScoreCount',
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
      this.queryScoreCount({...params });
    };
    // 搜索
    handleOnSearch = (params) => {
      this.setState({ searchParams: { ...this.state.searchParams, ...params } });
      this.queryScoreCount({
        ...this.state.searchParams,
        ...params,
      });
    }
    // 重置
    handleOnRest = () => {
      this.setState({searchParams: {}});
      this.setState(pageParams);
      this.queryScoreCount();
    }
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
          />
          <TableList
            {...this.props}
            handleTableChange={this.handleTableChange}
            pagination={pagination}
          />
        </PageHeaderLayout>
      );
    }
}
