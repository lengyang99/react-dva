import React, { Component } from 'react';
import { Button} from 'antd';
import { connect } from 'dva';
import SearchPanel from './SearchPanel';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TablePlan from './TablePlan';
import NewCaterModal from './NewCaterModal';

@connect(({operationStandard, login}) => ({
  user: login.user,
  typeTotal: operationStandard.typeTotal, // 类型分类列表总数
  catergoryData: operationStandard.catergoryData, // 类型分类列表
  functionGroup: operationStandard.functionGroup, // 应用场景
}))
export default class OperaCaterManger extends Component {
    state = {
      record: {}, // 弹框初始数据
    }
    modal = null;
    componentDidMount() {
      // 获取类型分类
      this.queryCatergoryData();
      // 获取应用场景
      this.props.dispatch({
        type: 'operationStandard/getFunctionGroup',
      });
    }
    // 按类型查询类型分类
    queryCatergoryData = (params = {}) => {
      this.props.dispatch({
        type: 'operationStandard/getCatergoryData',
        payload: {
          ...params,
        },
      });
    }
    // 分页改变时回调
    handleTableChange = (pagination) => {
      // const params = {
      //   pageno: pagination.current,
      //   pagesize: pagination.pageSize,
      //   ...this.state.searchParams,
      // };
      // this.queryCatergoryData(params);
      // this.setState({pageno: params.pageno, pagesize: params.pagesize});
    };
    // 查询
    handleOnSearch = (params = {}) => {
      this.queryCatergoryData({
        ...params,
      });
    }
    // 重置
    handleOnRest =() => {
      this.queryCatergoryData();
    }
    // 新建
    handleNewPlan =() => {
      if (this.modal) {
        this.modal.showModal();
      }
    }
    // 编辑
    editModal = (record) => {
      if (this.modal) {
        this.modal.showModal();
      }
      this.setState({record});
    }
    // 清空表单
    resetRecord = () => {
      this.setState({record: {}});
    }
    render() {
      const {catergoryData, typeTotal} = this.props;
      // 表格分页
      const pagination = {
        total: typeTotal || 0,
        showQuickJumper: true,
        showSizeChanger: true,
        showTotal: (totals) => {
          return (<div className={styles.pagination}>
                 共 {totals} 条记录
          </div>);
        },
      };
      return (
        <PageHeaderLayout>
          <div>
            <SearchPanel
              {...this.props}
              handleOnRest={this.handleOnRest}
              handleOnSearch={this.handleOnSearch}
              handleFuncChange={this.handleFuncChange}
              handleStateChange={this.handleStateChange}
            />
            <div >
              <Button
                className={styles.button}
                type="primary"
                onClick={() => this.handleNewPlan()}
              >
                             +新建类型分类
              </Button>
            </div>
            <TablePlan
              {...this.props}
              dataSource={catergoryData || []}
              pagination={pagination}
              editModal={this.editModal}
              queryCatergoryData={this.queryCatergoryData}
              handleTableChange={this.handleTableChange}
            />
          </div>
          <NewCaterModal
            wrappedComponentRef={ref => { this.modal = ref; }}
            {...this.props}
            queryCatergoryData={this.queryCatergoryData}
            resetRecord={this.resetRecord}
            record={this.state.record}
          />
        </PageHeaderLayout>
      );
    }
}
