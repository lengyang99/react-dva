import React, { Component } from 'react';
import { Modal, Table, Input, Button} from 'antd';
import styles from '../TaskDetaile/index.less';

export default class NewWlModal extends Component {
  render() {
    const { visible, materialInfo, pagination, handleTableChange, handleCancel, handleOk, likeValue,
      onSearch, callback, selectedRowKeys, handleLikeValueChange } = this.props;
    const rowSelection = {
      selectedRowKeys,
      onChange: (rowKeys, selectedRows) => {
        callback(rowKeys, selectedRows);
      },
    };
    const columns = [{
      title: '物料编号',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
    },
    {
      title: '物料类别',
      dataIndex: 'groupdes',
      key: 'groupdes',
      width: '20%',
    },
    {
      title: '物料名称',
      dataIndex: 'des',
      key: 'des',
      width: '60%',
    }];

    return (
      <Modal
        visible={visible}
        title="选择物料"
        maskClosable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ top: 20 }}
        width={675}
        bodyStyle={{ height: 550 }}
      >
        <div className={styles['field-block3']}>
          <label>搜索：</label>
          <Input
            className={styles.input}
            placeholder="按物料编号/物料名称查询"
            value={likeValue}
            onChange={handleLikeValueChange}
          />
        </div>
        <Button className={styles.button3} onClick={onSearch}>
                查询</Button>
        <Table
          columns={columns}
          size="small"
          scroll={{ y: 400 }}
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={handleTableChange}
          dataSource={materialInfo || []}
          rowKey={record => record.gid}
        />
      </Modal>
    );
  }
}
