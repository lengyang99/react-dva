import React, { PureComponent } from 'react';
import { Table, Modal, message, Tooltip} from 'antd';
import { routerRedux } from 'dva/router';
import styles from './index.less';

const confirm = Modal.confirm;

class TablePlan extends PureComponent {
  // 删除 作业类型
  delOperaType = (record, title) => {
    const that = this;
    confirm({
      title,
      onOk() {
        that.props.dispatch({
          type: 'operationStandard/delOperaType',
          payload: {functionId: record.gid},
          callback: ({ msg, success }) => {
            if (success) {
              message.success(msg);
              that.props.queryOperaTypeList();
            } else {
              message.warn(msg);
            }
          },
        });
      },
      onCancel() {
      },
    });
  }
  validateDelOperaType = (record) => {
    this.props.dispatch({
      type: 'operationStandard/validateDelOperaType',
      payload: {functionId: record.gid},
      callback: (res) => {
        if (res.success) {
          if (res.data && res.data.length !== 0) {
            this.delOperaType(record, '该作业类型已被使用,是否仍需要删除?');
          } else {
            this.delOperaType(record, '是否删除该作业类型?');
          }
        } else {
          message.warn(res.msg);
        }
      },
    });
  }
  // 编辑作业类型
  editOperaType = (record) => {
    const path = {
      data: {
        gid: record.gid,
        action: record.action,
      },
      pathname: '/equipment/operaType-edit',
      historyPageName: '/equipment/operaType-Manger',
    };
    this.props.dispatch(routerRedux.push(path));
    this.props.clearModal();
  }
  rowClassName = (record, index) => {
    return index === this.props.rowIndex ? styles.selectRow : '';
  };
  handleClick = (record, index) => {
    this.props.dispatch({
      type: 'operationStandard/rowIndexSave',
      payload: index,
    }, () => {
      this.rowClassName();
    });
  }
  render() {
    const { dataSource, pagination, handleTableChange} = this.props;
    dataSource.forEach((item, index) => {
      Object.assign(item, {findex: index + 1});
    });
    const columns = [{
      title: '序号',
      dataIndex: 'findex',
    }, {
      title: '作业类型',
      dataIndex: 'functionName',
      render: (text, record) => (<Tooltip title={record.functionName}><span>{record.functionName}</span></Tooltip>),
    },
    {
      title: '类型分类',
      dataIndex: 'parentName',
    },
    {
      title: '创建人',
      dataIndex: 'createrName',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      render: (text, record) => (
        <span>
          <a onClick={() => { this.editOperaType({...record, action: 'edit'}); }}>编辑</a>
          <span style={{color: 'e8e8e8'}}> | </span>
          <a onClick={() => { this.validateDelOperaType(record); }}>删除</a>
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
        rowKey={record => `${record.gid}`}
        rowClassName={this.rowClassName}
        onRow={(record, index) => ({
          onClick: this.handleClick.bind('', record, index),
          onDoubleClick: () => {
            this.editOperaType({...record, action: 'read'});
          },
        })}
      />
    );
  }
}
export default TablePlan;
