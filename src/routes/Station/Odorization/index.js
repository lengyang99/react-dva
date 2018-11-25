import React, { Component } from 'react';
import {connect} from 'dva';
import {Button} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import SearchPanel from './SearchPanel';
import TableList from './TableList';

const pageParams = {
  pageno: 1,
  pagesize: 10,
};// 分页参数
@connect(({login, odorization}) => ({
  dataList: odorization.dataList,
  detailDtata: odorization.detailDtata,
  stationData: odorization.stationData,
  odorMacData: odorization.odorMacData,
  operType: odorization.operType,
  total: odorization.total,
  user: login.user,
}))

export default class Odorization extends Component {
    state={
      ...pageParams,
      searchParams: {}, // 查询参数
    }
    componentDidMount() {
      const {dispatch} = this.props;
      this.queryOdorList();
      dispatch({
        type: 'odorization/getStationData',
      });
      dispatch({
        type: 'odorization/queryOdorMacList',
      });
      dispatch({
        type: 'odorization/queryOperType',
      });
    }
    // 查询
    queryOdorList = (params = {}) => {
      this.props.dispatch({
        type: 'odorization/queryOdorList',
        payload: {...pageParams, ...params},
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
      this.queryOdorList({...params });
    };
    // 搜索
    handleOnSearch = (params) => {
      this.setState({ searchParams: { ...this.state.searchParams, ...params } });
      this.queryOdorList({
        ...this.state.searchParams,
        ...params,
      });
    }
    // 重置
    handleOnRest = () => {
      this.setState({searchParams: {}});
      this.setState(pageParams);
      this.queryOdorList();
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
