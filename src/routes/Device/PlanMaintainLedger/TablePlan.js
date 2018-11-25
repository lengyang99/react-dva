import React from 'react';
import PropTypes from 'prop-types';
import { Table, Tooltip } from 'antd';
import styles from './index.less';

const TablePlan = (props) => {
  const {ledgerData, tableConfig, eqTypeData, operaTypeData, searchLedgerParams, readMaintainHistory, editPlanLedger, onRowClick} = props;
  const eqType = (eqTypeData || []).map(item => ({text: item.name, value: item.id}));
  const functionKeys = (operaTypeData || []).map(item => ({text: item.functionName, value: item.functionKey}));
  const {clsGids, functionKeys: funcKey, pageno, pagesize} = searchLedgerParams || {};
  (ledgerData.data || []).forEach((item, index) => {
    Object.assign(item, {findex: (pageno - 1) * pagesize + index + 1});
  });
  // 表格分页
  const pagination = {
    total: ledgerData.total || 0,
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
      title: '设备编码',
      dataIndex: 'eqCode',
      width: 160,
      fixed: 'left',
    }, {
      title: '设备名称',
      dataIndex: 'eqName',
      width: 200,
      render: (text, record) => (<Tooltip title={record.eqName}><span>{record.eqName}</span></Tooltip>),
    },
    {
      title: '设备分类',
      dataIndex: 'clsName',
      filters: eqType,
      filteredValue: clsGids ? clsGids.split(',') : clsGids,
      width: 120,
    },
    {
      title: '地址',
      dataIndex: 'posDesc',
      width: 200,
    },
    {
      title: '作业类型',
      dataIndex: 'functionName',
      filters: functionKeys,
      filteredValue: funcKey ? funcKey.split(',') : funcKey,
      width: 120,
    },
    {
      title: '历史维护次数',
      dataIndex: 'historyCount',
      width: 140,
    },
    {
      title: '上次维护时间',
      dataIndex: 'lastBearTime',
      width: 140,
    },
    {
      title: '上次维护人',
      dataIndex: 'lastFeedBackName',
      width: 140,
    },
    {
      title: '下次维护时间',
      dataIndex: 'createrName3',
      width: 200,
      render: (text, record) => (<Tooltip title={`${record.nextStartTime}~${record.nextEndTime}`}><span>{`${record.nextStartTime}~${record.nextEndTime}`}</span></Tooltip>),
    },
    {
      title: '下次维护人',
      dataIndex: 'nextAssigneeNames',
      width: 140,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        <span>
          <a onClick={() => { readMaintainHistory(record); }}>维护历史</a>
          <span style={{ color: 'e8e8e8' }}> | </span>
          <a onClick={() => { editPlanLedger(record); }}>编辑</a>
        </span>
      ),
    },
  ];
  return (
    <Table
      {...tableConfig}
      dataSource={ledgerData.data || []}
      pagination={pagination}
      columns={columns}
      rowKey={record => `${record.gid}`}
      onRow={(record, index) => ({
            onClick: () => (onRowClick(record, index)),
            onDoubleClick: () => (readMaintainHistory(record)),
          })}
    />
  );
};
TablePlan.defaultProps = {
  tableConfig: {},
  eqTypeData: [],
  operaTypeData: [],
  editPlanLedger: (f) => f,
  onRowClick: (f) => f,
  readMaintainHistory: (f) => f,
};
TablePlan.propTypes = {
  tableConfig: PropTypes.object,
  eqTypeData: PropTypes.array,
  operaTypeData: PropTypes.array,
  editPlanLedger: PropTypes.func,
  onRowClick: PropTypes.func,
  readMaintainHistory: PropTypes.func,
};
export default TablePlan;
