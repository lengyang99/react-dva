import React, { PureComponent } from 'react';
import { Table, Tooltip } from 'antd';
import moment from 'moment';
import styles from './index.less';

const FormatStr = 'YYYY-MM-DD HH:mm ';
class TableTask extends PureComponent {
  rowClassName = (record, index) => {
    return index === this.props.rowIndex ? styles.selectRow : '';
  };
  handleClick = (record, index) => {
    this.props.dispatch({
      type: 'device/rowIndexSave',
      payload: index,
    }, () => {
      this.rowClassName();
    });
  }
  render() {
    const { isGsh, sendBtn, dataSource, workObjectType, activitiCode, pagination, handleTableChange, lookHandler, onSelectChange, selRows, selectedRowKeys } = this.props;
    const workColums = [
      {
        title: '任务编号',
        dataIndex: 'gid',
        key: 'gid',
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
        key: 'eqName',
        render: (text, record) => {
          const eqNames = [];
          (record.eqList || []).forEach(item => {
            eqNames.push(item.eqName);
          });
          const eqName = eqNames.length !== 0 ? eqNames[0] : '';
          return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
        },
      },
      {
        title: '设备位置',
        dataIndex: 'posDesc',
        key: 'posDesc',
        render: (text, record) => {
          const posDescs = [];
          (record.eqList || []).forEach(item => {
            posDescs.push(item.posDesc);
          });
          const posDesc = posDescs.length !== 0 ? posDescs[0] : '';
          return <Tooltip title={posDesc}><span>{posDesc}</span></Tooltip>;
        },
      },
      {
        title: '设备编码',
        dataIndex: 'eqCode',
        key: 'eqCode',
        render: (text, record) => {
          const eqCodes = [];
          (record.eqList || []).forEach(item => {
            eqCodes.push(item.eqCode);
          });
          const eqCode = eqCodes.length !== 0 ? eqCodes[0] : '';
          return <Tooltip title={eqCode}><span>{eqCode}</span></Tooltip>;
        },
      },
      {
        title: '任务生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '要求完成时间',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '完成状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          switch (text) {
            case 0: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>未完成</span>;
            case 1: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>已完成</span>;
            case 2: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>已超期</span>;
            default: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>超期已完成</span>;
          }
        },
      },
      {
        title: '工单状态',
        dataIndex: 'stateName',
        key: 'stateName',
      },
      {
        title: '操作项',
        dataIndex: 'actions',
        key: 'actions',
        render: (text, record) => {
          if (record.processInstanceId) {
            const actionDivs = (record.items || []).map((item, idx) => (
              <span>
                <a style={{ display: idx === 0 ? 'none' : 'inline', color: 'e8e8e8' }}> | </a>
                <a onClick={() => { this.props.getTaskFormData(item); }} style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>{item.taskName}</a>
              </span>
            ));
            actionDivs.push(<span>
              <a style={{ display: actionDivs.length === 0 ? 'none' : 'inline', color: 'e8e8e8' }}> | </a>
              <a onClick={() => { this.props.lookHandler(record); }} style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>详情</a>
            </span>);
            return actionDivs;
          } else {
            return (sendBtn ? <a
              onClick={() => { lookHandler({ ...record, action: 'do' }); }}
              style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}
            >派单</a> : null);
          }
        },
      },
    ];
    // 计划性维护任务
    const taskColumns = [
      {
        title: '任务编号',
        dataIndex: 'gid',
        key: 'gid',
        render: (text, record) => {
          return (<span>
            <div style={{ color: record.taskType === 2 ? 'red' : '#379FFF' }}>
              {record.taskType === 2 ? '临时' : '常规'}</div>
            <div>{`${record.gid}`}</div>
          </span>);
        },
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
        key: 'eqName',
        render: (text, record) => {
          const eqNames = [];
          (record.eqList || []).forEach(item => {
            eqNames.push(item.eqName);
          });
          const eqName = eqNames.length !== 0 ? eqNames[0] : '';
          return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
        },
      },
      {
        title: '设备位置',
        dataIndex: 'posDesc',
        key: 'posDesc',
        render: (text, record) => {
          const posDescs = [];
          (record.eqList || []).forEach(item => {
            posDescs.push(item.posDesc);
          });
          const posDesc = posDescs.length !== 0 ? posDescs[0] : '';
          return <Tooltip title={posDesc}><span>{posDesc}</span></Tooltip>;
        },
      },
      {
        title: '设备编码',
        dataIndex: 'eqCode',
        key: 'eqCode',
        render: (text, record) => {
          const eqCodes = [];
          (record.eqList || []).forEach(item => {
            eqCodes.push(item.eqCode);
          });
          const eqCode = eqCodes.length !== 0 ? eqCodes[0] : '';
          return <Tooltip title={eqCode}><span>{eqCode}</span></Tooltip>;
        },
      },
      {
        title: '任务生成时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '要求完成时间',
        dataIndex: 'endTime',
        key: 'endTime',
        render: (text) => (text ? moment(text).format(FormatStr) : text),
      },
      {
        title: '完成时间',
        dataIndex: 'feedbackTime',
        key: 'feedbackTime',
        render: (text, record) => {
          if (record.isFeedbackRequired === 1) {
            return <span>{text ? moment(text).format(FormatStr) : text}</span>;
          } else {
            return <span>{record.arriveTime ? moment(record.arriveTime).format(FormatStr) : record.arriveTime}</span>;
          }
        },
      },
      {
        title: '处理时长',
        dataIndex: 'timecost',
        key: 'timecost',
      },
      {
        title: '完成状态',
        dataIndex: 'status',
        key: 'status',
        render: (text) => {
          switch (text) {
            case 0: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>未完成</span>;
            case 1: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>已完成</span>;
            case 2: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>已超期</span>;
            default: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>超期已完成</span>;
          }
        },
      },
      {
        title: '处理人',
        dataIndex: 'assigneeNames',
        key: 'assigneeNames',
      },
      {
        title: '协助人',
        dataIndex: 'assistMenNames',
        key: 'assistMenNames',
      },
      {
        title: '操作项',
        dataIndex: 'actions',
        key: 'actions',
        render: (text, record) => {
          return (
            <a
              onClick={() => { lookHandler({ ...record, action: 'edit' }); }}
              style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}
            >详情</a>);
        },
      },
    ];
    // 工商户任务(3:工商户制定计划，其他：设备制定计划)
    const gshTaskColumns = workObjectType === 3 ?
      [
        {
          title: '任务编号',
          dataIndex: 'gid',
          key: 'gid',
          width: 80,
          render: (text, record) => {
            return (<span>
              <div style={{ color: record.taskType === 2 ? 'red' : '#379FFF' }}>
                {record.taskType === 2 ? '临时' : '常规'}</div>
              <div>{`${record.gid}`}</div>
            </span>);
          },
        },
        {
          title: '客户名称',
          dataIndex: 'customerDesc',
          key: 'customerDesc',
          width: 140,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].customer_desc : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '客户号',
          dataIndex: 'customerNum',
          key: 'customerNum',
          width: 140,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].customer_num : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '合同账号',
          dataIndex: 'contractAccount',
          key: 'contractAccount',
          width: 140,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].contract_account : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '用户状态',
          dataIndex: 'customerStatus',
          key: 'customerStatus',
          width: 80,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].customer_status : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '用户类型',
          dataIndex: 'customerType',
          key: 'customerType',
          width: 120,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].customer_type : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '地址',
          dataIndex: 'addrContract',
          key: 'addrContract',
          width: 200,
          render: (text, record) => {
            const customerDesc = record.gshList && record.gshList.length !== 0 && record.gshList[0] ? record.gshList[0].addr_contract : '';
            return <Tooltip title={customerDesc}><span>{customerDesc}</span></Tooltip>;
          },
        },
        {
          title: '任务生成时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 140,
          render: (text) => (text ? moment(text).format(FormatStr) : text),
        },
        {
          title: '要求完成时间',
          dataIndex: 'endTime',
          key: 'endTime',
          width: 140,
          render: (text) => (text ? moment(text).format(FormatStr) : text),
        },
        {
          title: '完成时间',
          dataIndex: 'feedbackTime',
          key: 'feedbackTime',
          width: 140,
          render: (text, record) => {
            if (record.isFeedbackRequired === 1) {
              return <span>{text ? moment(text).format(FormatStr) : text}</span>;
            } else {
              return <span>{record.arriveTime ? moment(record.arriveTime).format(FormatStr) : record.arriveTime}</span>;
            }
          },
        },
        {
          title: '处理时长',
          dataIndex: 'timecost',
          key: 'timecost',
          width: 80,
        },
        {
          title: '完成状态',
          dataIndex: 'status',
          key: 'status',
          width: 80,
          render: (text) => {
            switch (text) {
              case 0: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>未完成</span>;
              case 1: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>已完成</span>;
              case 2: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>已超期</span>;
              default: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>超期已完成</span>;
            }
          },
        },
        {
          title: '处理人',
          dataIndex: 'assigneeNames',
          key: 'assigneeNames',
          width: 120,
        },
        {
          title: '协助人',
          dataIndex: 'assistmenNames',
          key: 'assistmenNames',
          width: 120,
        },
        {
          title: '操作项',
          dataIndex: 'actions',
          key: 'actions',
          width: 100,
          render: (text, record) => {
            return (
              <a
                onClick={() => { lookHandler({ ...record, action: 'edit' }); }}
                style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}
              >详情</a>);
          },
        },
      ] :
      [
        {
          title: '任务编号',
          dataIndex: 'gid',
          key: 'gid',
          width: 80,
          render: (text, record) => {
            return (<span>
              <div style={{ color: record.taskType === 2 ? 'red' : '#379FFF' }}>
                {record.taskType === 2 ? '临时' : '常规'}</div>
              <div>{`${record.gid}`}</div>
            </span>);
          },
        },
        {
          title: '设备编码',
          dataIndex: 'eqCode',
          key: 'eqCode',
          width: 180,
          render: (text, record) => {
            const eqCodes = [];
            (record.eqList || []).forEach(item => {
              eqCodes.push(item.eqCode);
            });
            const eqCode = eqCodes.length !== 0 ? eqCodes[0] : '';
            return <Tooltip title={eqCode}><span>{eqCode}</span></Tooltip>;
          },
        },
        {
          title: '用户名称',
          dataIndex: 'houseHoldName',
          key: 'houseHoldName',
          width: 140,
          render: (text, record) => {
            const houseHoldNames = [];
            (record.eqList || []).forEach(item => {
              houseHoldNames.push(item.houseHoldName);
            });
            const houseHoldName = houseHoldNames.length !== 0 ? houseHoldNames[0] : '';
            return <Tooltip title={houseHoldName}><span>{houseHoldName}</span></Tooltip>;
          },
        },
        {
          title: '客户号',
          dataIndex: 'houseHoldCode',
          key: 'houseHoldCode',
          width: 140,
          render: (text, record) => {
            const houseHoldCodes = [];
            (record.eqList || []).forEach(item => {
              houseHoldCodes.push(item.houseHoldCode);
            });
            const houseHoldCode = houseHoldCodes.length !== 0 ? houseHoldCodes[0] : '';
            return <Tooltip title={houseHoldCode}><span>{houseHoldCode}</span></Tooltip>;
          },
        },
        {
          title: '合同号',
          dataIndex: 'contractNum',
          key: 'contractNum',
          width: 140,
          render: (text, record) => {
            const contractNums = [];
            (record.eqList || []).forEach(item => {
              contractNums.push(item.contractNum);
            });
            const contractNum = contractNums.length !== 0 ? contractNums[0] : '';
            return <Tooltip title={contractNum}><span>{contractNum}</span></Tooltip>;
          },
        },
        {
          title: '表钢号',
          dataIndex: 'eqName',
          key: 'eqName',
          width: 160,
          render: (text, record) => {
            const eqs = [];
            (record.eqList || []).forEach(item => {
              eqs.push(item.eqName);
            });
            const eqName = eqs.length !== 0 ? eqs[0] : '';
            return <Tooltip title={eqName}><span>{eqName}</span></Tooltip>;
          },
        },
        {
          title: '地址',
          dataIndex: 'posDesc',
          key: 'posDesc',
          width: 180,
          render: (text, record) => {
            const posDescs = [];
            (record.eqList || []).forEach(item => {
              posDescs.push(item.posDesc);
            });
            const posDesc = posDescs.length !== 0 ? posDescs[0] : '';
            return <Tooltip title={posDesc}><span>{posDesc}</span></Tooltip>;
          },
        },
        {
          title: '任务生成时间',
          dataIndex: 'createTime',
          key: 'createTime',
          width: 160,
          render: (text) => (text ? moment(text).format(FormatStr) : text),
        },
        {
          title: '要求完成时间',
          dataIndex: 'endTime',
          key: 'endTime',
          width: 160,
          render: (text) => (text ? moment(text).format(FormatStr) : text),
        },
        {
          title: '完成时间',
          dataIndex: 'feedbackTime',
          key: 'feedbackTime',
          width: 160,
          render: (text, record) => {
            if (record.isFeedbackRequired === 1) {
              return <span>{text ? moment(text).format(FormatStr) : text}</span>;
            } else {
              return <span>{record.arriveTime ? moment(record.arriveTime).format(FormatStr) : record.arriveTime}</span>;
            }
          },
        },
        {
          title: '处理时长',
          dataIndex: 'timecost',
          key: 'timecost',
          width: 80,
        },
        {
          title: '完成状态',
          dataIndex: 'status',
          key: 'status',
          width: 80,
          render: (text) => {
            switch (text) {
              case 0: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>未完成</span>;
              case 1: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>已完成</span>;
              case 2: return <span style={{ textAlign: 'center', 'color': 'red', cursor: 'pointer' }}>已超期</span>;
              default: return <span style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}>超期已完成</span>;
            }
          },
        },
        {
          title: '处理人',
          dataIndex: 'assigneeNames',
          key: 'assigneeNames',
          width: 120,
        },
        {
          title: '协助人',
          dataIndex: 'assistmenNames',
          key: 'assistmenNames',
          width: 120,
        },
        {
          title: '操作项',
          dataIndex: 'actions',
          key: 'actions',
          width: 80,
          render: (text, record) => {
            return (
              <a
                onClick={() => { lookHandler({ ...record, action: 'edit' }); }}
                style={{ textAlign: 'center', 'color': '#379FFF', cursor: 'pointer' }}
              >详情</a>);
          },
        },
      ];
    const columns = activitiCode ? workColums : isGsh ? gshTaskColumns : taskColumns;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys2, selectedRows) => {
        const newSelRows = { ...selRows };
        newSelRows[`${pagination.current}行`] = selectedRows;
        onSelectChange({ selectedRowKeys2, newSelRows });
      },
    };
    return (
      <Table
        className={styles.table}
        columns={columns}
        dataSource={dataSource || []}
        pagination={pagination}
        onChange={handleTableChange}
        rowClassName={this.rowClassName}
        rowKey={record => `${record.gid}_${record.status}`}
        rowSelection={rowSelection}
        scroll={{ x: 1800 }}
        onRow={(record, index) => ({
          onClick: this.handleClick.bind('', record, index),
          onDoubleClick: () => {
            if (record.processInstanceId || !record.activitiCode) {
              lookHandler({ ...record, action: 'edit' });
            }
          },
        })}
      />
    );
  }
}
export default TableTask;
