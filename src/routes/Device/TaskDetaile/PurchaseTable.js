import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'antd';

const PurchaseTable = (props) => {
  const {data, rowSelection} = props;
  const columns = [
    {
      title: '物料编号',
      dataIndex: 'matnr',
      key: 'matnr',
    },
    {
      title: '工厂',
      dataIndex: 'werks',
      key: 'werks',
    },
    {
      title: '净价',
      dataIndex: 'netpr',
      key: 'netpr',
    },
    {
      title: '数量',
      dataIndex: 'menge',
      key: 'menge',
    },
    {
      title: '税码',
      dataIndex: 'mwskz',
      key: 'mwskz',
    },
    {
      title: '成本中心',
      dataIndex: 'kostl',
      key: 'kostl',
    },
    {
      title: '业务范围',
      dataIndex: 'gsber',
      key: 'gsber',
    },
    {
      title: '描述',
      dataIndex: 'describes',
      key: 'describes',
    },
    {
      title: '库存地',
      dataIndex: 'lgort',
      key: 'lgort',
    },
    // {
    //   title: '操作',
    //   dataIndex: 'action',
    //   key: 'action',
    // },
  ];
  return (<Table columns={columns} rowSelection={rowSelection} rowKey={record => record.gid} dataSource={data || []} />);
};
PurchaseTable.defaultProps = {
  data: [],
  rowSelection: {},
};
PurchaseTable.propTypes = {
  data: PropTypes.array,
  rowSelection: PropTypes.object,
};

export default PurchaseTable;
