import React, { PureComponent } from 'react';
import { Table } from 'antd';

const dataSource = [{
  contract_account_desc: '账户描述',
  contract_account: '5012256',
  contact_num: '201908',
  eq_name: 'A000p9090',
  install_pos: '地址',
  plan_name: '计划时间',
  customer_desc: '执行人',
  replace_time: '置换时间',
}];
class RecordList extends PureComponent {
  handleConfirm = (record) => {
    console.log(record);
  }
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
      dataIndex: 'contact_num',
      key: 'contact_num',
    }, {
      title: '表钢号',
      dataIndex: 'eq_name',
      key: 'eq_name',
    }, {
      title: '地址',
      dataIndex: 'install_pos',
      key: 'install_pos',
    }, {
      title: '计划时间',
      dataIndex: 'plan_name',
      key: 'plan_name',
    }, {
      title: '执行人',
      dataIndex: 'customer_desc',
      key: 'customer_desc',
    }, {
      title: '置换时间',
      dataIndex: 'replace_time',
      key: 'replace_time',
    }, {
      title: '碰瓷记录',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={this.handleConfirm.bind('', record)}>详情</a>
        </span>
      ),
    }];
    return (
      <Table
        dataSource={dataSource}
        columns={columns}
        rowSelection={{
          onSelect: this.handleSelectRows,
          onSelectAll: this.handleSelectAll,
        }}
      />
    );
  }
}

export default RecordList;
