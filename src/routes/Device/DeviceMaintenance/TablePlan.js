import React from 'react';
import { Table, Icon, Tooltip} from 'antd';
import PropTypes from 'prop-types';
import styles from './index.less';

const TablePlan = (props) => {
  const { dataSource, pagination, handleTableChange, planHandler, operationPlan, rowClassName, handleClick} = props;
  const columns = [
    {
      title: '编号',
      dataIndex: 'gid',
      width: '10%',
      render: (text, record) => {
        return (<span>
          <div style={{color: record.taskType === 2 ? 'red' : '#379FFF'}}>
            {record.taskType === 2 ? '临时' : '常规'}</div>
          <div>{`${record.gid}`}</div>
        </span>);
      },
    }, {
      title: '计划名称',
      dataIndex: 'name',
      render: (text, record) => (<Tooltip title={record.name}><span>{record.name}</span></Tooltip>),
      width: '20%',
    }, {
      title: '类型',
      dataIndex: 'functionName',
      width: '12%',
      render: (text, record) => (<Tooltip title={record.functionName}><span>{record.functionName}</span></Tooltip>),
    },
    {
      title: '周期描述',
      dataIndex: 'cycleName',
      width: '9%',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: '14%',
    },
    {
      title: '所属组织',
      dataIndex: 'stationName',
      width: '10%',
    },
    {
      title: '责任人',
      dataIndex: 'assigneeNames',
      width: '10%',
      render: (text, record) => (<Tooltip title={record.assigneeNames}><span>{record.assigneeNames}</span></Tooltip>),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: '5%',
      render: (text, record) => {
        switch (text) {
          case 2:
            return (<a
              style={{ 'color': 'red', 'pointer': 'cursor' }}
              onClick={() => {
                        planHandler({...record, action: 'start', title: '启动'});
                    }}
            ><Icon type="close-circle-o" />
                        停止</a>);
          default:
            return (<a
              style={{ 'color': '#379FFF', 'pointer': 'cursor' }}
              onClick={() => {
                        planHandler({...record, action: 'stop', title: '停止'});
                    }}
            ><Icon type="check-circle-o" />
                        启动</a>);
        }
      },
    },
    {
      title: '操作',
      dataIndex: 'actions',
      width: '10%',
      render: (text, record) => (
        <span>
          <a onClick={() => { operationPlan({...record, action: 'read'}); }}>详情</a>
          <span style={{color: 'e8e8e8'}}> | </span>
          <a onClick={() => { operationPlan({...record, action: 'edit'}); }}>编辑</a>
          {/* <a onClick={() => { this.planHandler(...record,{action:'del',title:'删除'} }}>删除</a>  */}
        </span>
      ),
    },
  ];
  return (
    <Table
      className={styles.table}
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      onChange={handleTableChange}
      rowClassName={rowClassName}
      rowKey={record => `${record.gid}_${record.name}`}
      onRow={(record, index) => ({
        onClick: handleClick.bind('', record, index),
        onDoubleClick: () => {
          operationPlan({...record, action: 'read'});
        },
      })}
    />
  );
};
TablePlan.defaultProps = {
  dataSource: [],
  pagination: {},
  planHandler: (f) => f,
  rowClassName: (f) => f,
  handleClick: (f) => f,
  operationPlan: (f) => f,
  handleTableChange: (f) => f,
};
TablePlan.propTypes = {
  dataSource: PropTypes.array,
  pagination: PropTypes.object,
  planHandler: PropTypes.func,
  rowClassName: PropTypes.func,
  handleClick: PropTypes.func,
  operationPlan: PropTypes.func,
  handleTableChange: PropTypes.func,
};
export default TablePlan;
