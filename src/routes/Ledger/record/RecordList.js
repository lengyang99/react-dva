import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';

@connect(
  state => ({
    eqCustom: state.ledger.eqCustom,
    data: state.ledger.recordList,
  })
)
export default class RecordList extends PureComponent {
  static propTypes = {
    data: propTypes.object.isRequired,
    eqCustom: propTypes.object.isRequired,
  };
  handleChange = (current, pageSize) => {
    this.props.dispatch({
      type: 'ledger/fetchRecordList',
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
      },
      {
        title: '隐患编号',
        dataIndex: 'eventid',
      },
      {
        title: '隐患名称',
        dataIndex: 'yhname',
      },
      {
        title: '隐患等级',
        dataIndex: 'degree',
      },
      {
        title: '隐患位置',
        dataIndex: 'address',
      },
      {
        title: '发生日期',
        dataIndex: 'reporttime',
      },
      {
        title: '状态',
        dataIndex: 'state',
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
        rowKey="eventid"
      />
    );
  }
}
