import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';

@connect(
  state => ({
    eqCustom: state.ledger.eqCustom,
    data: state.ledger.historyList,
  })
)
export default class HistoryList extends PureComponent {
  static propTypes = {
    data: propTypes.object.isRequired,
    eqCustom: propTypes.object.isRequired,
  };
  handleChange = (current, pageSize) => {
    this.props.dispatch({
      type: 'ledger/fetchHistoryList',
      payload: {
        eqCode: this.props.eqCustom.eqCode,
        pageno: current,
        pagesize: pageSize,
      },
    });
  };
  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 50,
        render: (text, record, index) => {
          return index + 1;
        },
      },
      {
        title: '工单编号',
        dataIndex: 'baseCode',
        width: 200,
      },
      {
        title: '工单描述',
        dataIndex: 'remark',
        width: 250,
      },
      {
        title: '工单类型',
        dataIndex: 'typename',
        width: 80,
      },
      {
        title: '负责人',
        dataIndex: 'username',
        width: 100,
      },
      {
        title: '创建日期',
        dataIndex: 'reporttime',
        width: 100,
        render: (text, record) => {
          const date = record.reporttime;
          const dateStr = date.split(' ')[0];
          return dateStr;
        },
      },
      {
        title: '状态',
        dataIndex: 'statename',
      },
      {
        title: '所属站点',
        dataIndex: 'locName',
      },
      {
        title: '所属组织',
        dataIndex: 'companyName',
      },
    ];
    const { data } = this.props;
    return (
      <Table
        pagination={{
          total: data.total,
          onChange: this.handleChange,
          showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {data.total} </span>条</span>),
        }}
        columns={columns}
        dataSource={data && data.data ? data.data.map((item, index) => Object.assign(item, {index})) : []}
        rowKey="baseCode"
      />
    );
  }
}
