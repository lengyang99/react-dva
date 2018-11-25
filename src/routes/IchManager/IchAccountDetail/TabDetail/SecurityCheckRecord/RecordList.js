import React, { PureComponent } from 'react';
import { Table } from 'antd';
import {connect} from 'dva';
import update from 'immutability-helper';

@connect(state => ({
  securityRecordList: state.ichAccountDetail.securityRecordList,
  securityRecordTotal: state.ichAccountDetail.securityRecordTotal,
  securityFilterOption: state.ichAccountDetail.securityFilterOption,
}))
class RecordList extends PureComponent {
  /*
   @desc 批量选择(单选)监听
   @param record: 被操作的行数据, selected: 选中状态, selectedRows: 被选中的数据集合
   */
  handleSelectRows = (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  };
  /*
   @desc 全选监听
   @param selected: 选中状态, selectedRows: 被选中的数据集合
   */
  handleSelectAll = (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  };
  handleShowTotal = (total, range) => {
    console.log(this.props.securityFilterOption);
    return `共${total}条记录 第${this.props.securityFilterOption.pageNum}页`;
  };
  handleTableChange = (pagination, filters, sorter) => {
    this.props.dispatch({
      type: 'ichAccountDetail/setSecurityFilterOption',
      payload: update(this.props.securityFilterOption, {$merge: {pageNum: pagination.current, pageSize: pagination.pageSize}}),
    });
    this.props.dispatch({
      type: 'ichAccountDetail/fetchSecurityRecordList',
      payload: Object.assign({}, {...this.props.securityFilterOption, pageNum: pagination.current, pageSize: pagination.pageSize}),
    });
  };
  render() {
    const columns = [{
      title: '合同账户描述',
      dataIndex: 'contract_account_desc',
      key: 'contract_account_desc',
    }, {
      title: '合同账户',
      dataIndex: 'contract_account',
      key: 'contract_account',
    }, {
      title: '合同号',
      dataIndex: 'contract_code',
      key: 'contract_code',
    }, {
      title: '表钢号',
      dataIndex: 'eq_name',
      key: 'eq_name',
    }, {
      title: '地址',
      dataIndex: 'pos_desc',
      key: 'pos_desc',
    }, {
      title: '安检日期',
      dataIndex: 'arrive_time',
      key: 'arrive_time',
    }, {
      title: '安检人',
      dataIndex: 'feedback_name',
      key: 'feedback_name',
    }, {
      title: '有无隐患',
      dataIndex: 'text',
      key: 'text',
    }];
    const { securityRecordTotal, securityFilterOption, securityRecordList } = this.props;
    console.log(securityRecordTotal);
    return (
      <Table
        dataSource={securityRecordList}
        columns={columns}
        onChange={this.handleTableChange}
        // rowSelection={{
        //   onSelect: this.handleSelectRows,
        //   onSelectAll: this.handleSelectAll,
        // }}
        pagination={{
          showTotal: this.handleShowTotal,
          total: securityRecordTotal,
          current: securityFilterOption.pageNum,
          pageSize: securityFilterOption.pageSize,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '30', '40'],
          showQuickJumper: true,
        }}
      />
    );
  }
}

export default RecordList;
