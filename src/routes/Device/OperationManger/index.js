import React, { Component } from 'react';
import { Button} from 'antd';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import SearchPanel from './SearchPanel';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TablePlan from './TablePlan';

@connect(({operationStandard, login}) => ({
  user: login.user,
  dataList: operationStandard.dataList, // 作业标准列表
  taskTypeData: operationStandard.taskTypeData, // 任务类型
  paginationMsg: operationStandard.paginationMsg, // 分页参数
  searchStandardParams: operationStandard.searchStandardParams, // 搜索条件
  rowIndex: operationStandard.rowIndex,
}))
export default class OperationManger extends Component {
  state = {
    clearModal: true,
  }
  componentDidMount() {
    const {taskTypeData} = this.props;
    // 获取任务类型
    if (taskTypeData && taskTypeData.length === 0) {
      this.props.dispatch({
        type: 'operationStandard/getTaskType',
      });
    }
    this.reloadPage();
  }
  componentWillUnmount() {
    if (this.state.clearModal) {
      this.props.dispatch({
        type: 'operationStandard/clearAll',
      });
    }
  }
    // 按条件查询作业标准列表
    queryOperaStandardList = (params = {}) => {
      const {paginationMsg} = this.props;
      const {pagesize} = paginationMsg || {};
      const searchParams = {pageno: 1, pagesize};
      this.props.dispatch({
        type: 'operationStandard/queryOperaStandardList',
        payload: {...searchParams, ...params},
      });
    }
    // 分页查询
    handleTableChange = (pagination) => {
      const params = {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
      };
      this.queryOperaStandardList(params);
    };
    // 查询
    handleOnSearch = () => {
      this.queryOperaStandardList();
    }
    // 刷新页面保留分页数据
    reloadPage = () => {
      const {paginationMsg} = this.props;
      const {pageno, pagesize} = paginationMsg || {};
      const searchParams = {pageno, pagesize};
      this.queryOperaStandardList(searchParams);
    }
    // 跳转
    handleNewPlan =() => {
      const path = {
        data: {action: 'add'},
        pathname: '/equipment/operation-add',
        historyPageName: '/equipment/operation-Manger',
      };
      this.props.dispatch(routerRedux.push(path));
    }
    // 不清空分页参数和搜索条件
    editOperaStandard = (record) => {
      const path = {
        data: {action: record.action, gid: record.gid},
        pathname: '/equipment/operation-edit',
        historyPageName: '/equipment/operation-Manger',
      };
      this.setState({ clearModal: false }, () => {
        this.props.dispatch(routerRedux.push(path));
      });
    }
    render() {
      const {dataList, paginationMsg} = this.props;
      const {pageno, pagesize, total} = paginationMsg || {};
      // 表格分页
      const pagination = {
        total: total || 0,
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
        <PageHeaderLayout>
          <div>
            <SearchPanel
              {...this.props}
              handleOnSearch={this.handleOnSearch}
            />
            <div >
              <Button
                className={styles.button}
                type="primary"
                onClick={this.handleNewPlan}
              >
                             +新建作业标准
              </Button>
            </div>
            <TablePlan
              {...this.props}
              dataSource={dataList || []}
              pagination={pagination}
              editOperaStandard={(record) => this.editOperaStandard(record)}
              handleTableChange={this.handleTableChange}
              queryOperaStandardList={this.reloadPage}
            />
          </div>
        </PageHeaderLayout>
      );
    }
}
