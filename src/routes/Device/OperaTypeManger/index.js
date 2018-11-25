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
  operaTypeData: operationStandard.operaTypeData, // 作业类型列表
  typeTotal: operationStandard.typeTotal, //  作业类型总数
  catergoryData: operationStandard.catergoryData, // 类型分类
  paginationMsg: operationStandard.paginationMsg, // 分页参数
  searchStandardParams: operationStandard.searchStandardParams, // 搜索条件
  rowIndex: operationStandard.rowIndex,
}))
export default class OperaTypeManger extends Component {
    state = {
      clearModal: true,
    }
    componentDidMount() {
      this.props.dispatch({
        type: 'operationStandard/getCatergoryData',
      });
      this.queryOperaTypeList();
    }
    componentWillUnmount() {
      if (this.state.clearModal) {
        this.props.dispatch({
          type: 'operationStandard/clearAll',
        });
      }
    }
    // 按条件查询作业类型
    queryOperaTypeList = () => {
      this.props.dispatch({
        type: 'operationStandard/queryOperaTypeList',
      });
    }
    // 分页改变时回调(暂无分页)
    handleTableChange = (pagination) => {
      const params = {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        total: pagination.total,
      };
      this.props.dispatch({
        type: 'operationStandard/paginationSave',
        payload: params,
      });
    };
    // 查询
    handleOnSearch = () => {
      this.queryOperaTypeList();
    }
  // 不清空分页参数和搜索条件
  clearModal = () => {
    this.setState({ clearModal: false });
  }
    // 跳转
    handleNewPlan =() => {
      const path = {
        data: {action: 'add'},
        pathname: '/equipment/operaType-add',
        historyPageName: '/equipment/operaType-Manger',
      };
      this.props.dispatch(routerRedux.push(path));
    }
    render() {
      const {operaTypeData, paginationMsg} = this.props;
      const {pageno, pagesize} = paginationMsg || {};
      // 表格分页
      const pagination = {
        total: operaTypeData.length || 0,
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
                             +新建作业类型
              </Button>
            </div>
            <TablePlan
              {...this.props}
              dataSource={operaTypeData || []}
              pagination={pagination}
              clearModal={this.clearModal}
              handleTableChange={this.handleTableChange}
              queryOperaTypeList={this.queryOperaTypeList}
            />
          </div>
        </PageHeaderLayout>
      );
    }
}
