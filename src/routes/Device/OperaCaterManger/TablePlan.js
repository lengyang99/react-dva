import React, { PureComponent } from 'react';
import { Table, Modal, message} from 'antd';
import styles from './index.less';

const confirm = Modal.confirm;
class TablePlan extends PureComponent {
  // 编辑
  editCatergory = (record) => {
    this.props.editModal(record);
  }
  // 删除
  delCatergory = (record, title) => {
    const that = this;
    confirm({
      title,
      onOk() {
        that.props.dispatch({
          type: 'operationStandard/delCatergoryData',
          payload: { parentFunctionId: record.gid },
          callback: ({ msg, success }) => {
            if (success) {
              message.success(msg);
              that.props.queryCatergoryData();
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
  // 删除前验证
  validateDelCatergoryData = (record) => {
    this.props.dispatch({
      type: 'operationStandard/validateDelCatergoryData',
      payload: {parentFunctionId: record.gid},
      callback: (res) => {
        if (res.success) {
          if (res.data && res.data.length !== 0) {
            this.delCatergory(record, '该类型分类已被使用,是否仍需要删除?');
          } else {
            this.delCatergory(record, '是否删除该类型分类?');
          }
        } else {
          message.warn(res.msg);
        }
      },
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
    },
      {
        title: '类型分类',
        dataIndex: 'functionName',
      },
      // {
      //   title: '应用场景',
      //   dataIndex: 'functionGroup',
      // },
      {
        title: '创建人',
        dataIndex: 'createrName',
      },
      {
        title: '操作',
        dataIndex: 'actions',
        render: (text, record) => (
          <span>
          <a onClick={() => { this.editCatergory({...record, action: 'edit'}); }}>编辑</a>
          <span style={{color: 'e8e8e8'}}> | </span>
          <a onClick={() => { this.validateDelCatergoryData(record); }}>删除</a>
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
        onRow={(record) => ({
          onDoubleClick: () => {
            this.editCatergory({...record, action: 'read'});
          },
        })}
      />
    );
  }
}
export default TablePlan;
