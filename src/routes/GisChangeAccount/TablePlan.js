import React from 'react';
import { Table, Tooltip} from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

const TablePlan = (props) => {
  const { dataSource, handleTableChange, eqTypeData, handleGisLedger, handleClick, searchLedgerParams} = props;
  const {pageno, pagesize, eq_type: clsGids} = searchLedgerParams || {};
  const eqType = (eqTypeData || []).map(item => ({text: item, value: item}));
  const pagination = {
    total: dataSource.total || 0,
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
  const columns = [
    {
      title: '事件编码',
      dataIndex: 'eventid',
      width: '10%',
    }, {
      title: '设备编码',
      dataIndex: 'eqCode',
      render: (text, record) => (<Tooltip title={record.eqCode}><a onClick={() => handleClick(record)}>{record.eqCode}</a></Tooltip>),
      width: '20%',
    }, {
      title: '设备分类',
      dataIndex: 'eqtype',
      filters: eqType,
      filteredValue: clsGids ? clsGids.split(',') : clsGids,
      width: '10%',
    },
    {
      title: '申请原因',
      dataIndex: 'remark',
      width: '15%',
    },
    {
      title: '上报人',
      dataIndex: 'reporter',
      width: '10%',
    },
    {
      title: '上报时间',
      dataIndex: 'reporttime',
      width: '15%',
    },
    {
      title: '处理状态',
      dataIndex: 'state',
      width: '10%',
      render: (text) => {
        if (text === 0) {
          return <span>处理中</span>;
        } else {
          return <span>已处理</span>;
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: '10%',
      render: (text, record) => (
        <span>
          <a onClick={() => { handleGisLedger({...record, action: 'read'}); }}>详情</a>
        </span>
      ),
    },
  ];
  return (
    <Table
      className={styles.table}
      columns={columns}
      dataSource={dataSource.data}
      pagination={pagination}
      onChange={handleTableChange}
      rowKey={record => `${record.gid}_${record.name}`}
      onRow={(record) => ({
        onDoubleClick: () => {
          handleGisLedger({...record, action: 'read'});
        },
      })}
    />
  );
};
TablePlan.defaultProps = {
  dataSource: [],
  handleClick: (f) => f,
  handleGisLedger: (f) => f,
  handleTableChange: (f) => f,
};
TablePlan.propTypes = {
  dataSource: PropTypes.array,
  handleClick: PropTypes.func,
  handleGisLedger: PropTypes.func,
  handleTableChange: PropTypes.func,
};
export default TablePlan;
