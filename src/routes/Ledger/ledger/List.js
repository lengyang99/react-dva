import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';

@connect(
  state => ({
    list: state.ledger.eqChildList,
  })
)
export default class List extends PureComponent {
  static propTypes = {
    list: propTypes.array.isRequired,
  };

  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: 'gid',
      },
      {
        title: '(设备)编号',
        dataIndex: 'eqCode',
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
      },
    ];
    return (
      <div>
        <p className="title">子级设备</p>
        <Table columns={columns} dataSource={this.props.list} rowKey="gid" />
      </div>
    );
  }
}
