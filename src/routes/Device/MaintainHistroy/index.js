import React, { Component } from 'react';
import { connect } from 'dva';
import update from 'immutability-helper';
import SearchPanel from './SearchPanel';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TablePlan from './TablePlan';

const defaultSearchParams = {
  others: null, // 模糊关键字
  startTime: null, // 维护开始时间
  endTime: null,
  pageno: 1, // 页码
  pagesize: 10, // 每页数
};
@connect(({login, planMaintainLedger}) => ({
  user: login.user,
  searchMaintainParams: planMaintainLedger.searchMaintainParams,
  historyData: planMaintainLedger.historyData, // 维护历史
  detailinfo: planMaintainLedger.detailinfo, // 歷史維護詳情
  paginationMsg2: planMaintainLedger.paginationMsg2, // 分页信息
}))
export default class MaintainHistroy extends Component {
  constructor(props) {
    super(props);
    this.pathVariable = this.props.location;
    if (this.pathVariable.data) {
      localStorage.setItem('ledgerMsg', JSON.stringify(this.pathVariable));
    } else {
      this.pathVariable = JSON.parse(localStorage.getItem('ledgerMsg'));
    }
  }
  componentDidMount() {
    Object.assign(defaultSearchParams, {functionKey: '7.5类型'});
    this.queryMaintainHistoryList(defaultSearchParams);
  }
    // 按条件查询维护历史
    queryMaintainHistoryList = (params = {}) => {
      this.props.dispatch({
        type: 'planMaintainLedger/queryMaintainHistoryList',
        payload: params,
      });
    }
    getDetailinfo = (params = {}) => {
      this.props.dispatch({
        type: 'planMaintainLedger/getDetailinfo',
        payload: params,
      });
    }
    // 分页查询
    handleTableChange = (pagination) => {
      const newParams = update(this.props.searchMaintainParams, {$merge: {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
      }});
      this.queryMaintainHistoryList(newParams);
    };
    // 模糊查询
    handleOnSearch = (type) => {
      if (type === 0) {
        this.queryMaintainHistoryList(defaultSearchParams);
      } else if (type === 1) {
        const newParams = update(this.props.searchMaintainParams, {$merge: {pageno: 1}});
        this.queryMaintainHistoryList(newParams);
      }
    }
    goBack = () => {
      this.props.history.goBack();
    }
    render() {
      const {historyData, searchMaintainParams} = this.props;
      const {pageno, pagesize} = searchMaintainParams || {};
      // 表格分页
      const pagination = {
        total: historyData.total || 0,
        current: pageno,
        pageSize: pagesize,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (totals) => {
          return (<div className={styles.pagination}>
                 共 {totals} 条记录 第{pageno}/{Math.ceil(totals / pagesize)}页
          </div>);
        },
      };
      return (
        <PageHeaderLayout showBack={this.goBack}>
          <div>
            <SearchPanel
              {...this.props}
              ledgerMsg={this.pathVariable.data}
              handleOnSearch={this.handleOnSearch}
            />
            <TablePlan
              {...this.props}
              getDetailinfo={this.getDetailinfo}
              dataSource={historyData.data || []}
              pagination={pagination}
              handleTableChange={this.handleTableChange}
            />
          </div>
        </PageHeaderLayout>
      );
    }
}
