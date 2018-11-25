import React, { PureComponent } from 'react';
import { Table, Modal, Icon, message, Tooltip} from 'antd';
import { routerRedux } from 'dva/router';
import styles from './index.less';

const confirm = Modal.confirm;

class TablePlan extends PureComponent {
    // 启用 停用 作业标准
    operaStandardHandler = (record) => {
      const that = this;
      confirm({
        title: `是否${record.action === 'start' ? '启用' : '停用'}计划?`,
        onOk() {
          that.props.dispatch({
            type: `operationStandard/${record.action}Standard`,
            payload: {workStandardId: record.gid},
            callback: ({ msg, success }) => {
              if (success) {
                message.success(msg);
                that.props.queryOperaStandardList();
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
    // 编辑，复制, 应用作业表准
    editOperaStandard = (record) => {
      this.props.editOperaStandard(record);
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
      const {current, pageSize} = pagination;
      dataSource.forEach((item, index) => {
        Object.assign(item, {findex: (current - 1) * pageSize + index + 1});
      });
      const columns = [{
        title: '序号',
        dataIndex: 'findex',
      }, {
        title: '作业标准名称',
        dataIndex: 'workStandardName',
        render: (text, record) => (<Tooltip title={record.workStandardName}><span>{record.workStandardName}</span></Tooltip>),
      },
      {
        title: '任务类型',
        dataIndex: 'taskCategory',
        render: (text) => {
          switch (text) {
            case 1:
              return (<span>可变</span>);
            default:
              return (<span>可重复</span>);
          }
        },
      },
      {
        title: '作业标准状态',
        dataIndex: 'status',
        render: (text, record) => (record.status === 1 ? <a onClick={() => this.operaStandardHandler({...record, ...{action: 'stop'}})}><Icon type="check-circle-o" /> 在用</a> :
        <a style={{color: 'red'}}onClick={() => this.operaStandardHandler({...record, ...{action: 'start'}})}><Icon type="close-circle-o" />停用</a>),
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
            <a onClick={() => { this.editOperaStandard({...record, action: 'edit'}); }}>编辑</a>
            <span style={{color: 'e8e8e8'}}> | </span>
            <a onClick={() => { this.editOperaStandard({...record, action: 'copy'}); }}>复制</a>
            <span style={{color: 'e8e8e8'}}> | </span>
            <a>应用</a>
            {/* <a onClick={() => { this.operationPlan({...record, action: 'apply'}); }}>应用</a> */}
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
              this.editOperaStandard({...record, action: 'read'});
            },
          })}
        />
      );
    }
}
export default TablePlan;
