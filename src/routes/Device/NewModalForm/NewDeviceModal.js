import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import Equipment from '../../../components/Equipment';

export default class NewDeviceModal extends PureComponent {
  eqModal = null;
  render() {
    const { visible, targetData, handleCancel, handleClickRow, selRows, callbackSave, selKeys, handleDoubleClickRow, rowClassName, handleOk} = this.props;

    let pageno = 1;
    if (this.eqModal) {
      const {state} = this.eqModal || {};
      const {filterOption: {pageNum}} = state || {};
      pageno = pageNum;
    }
    const rowSelection = {
      selectedRowKeys: selKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelRows = {...selRows};
        newSelRows[`${pageno}行`] = selectedRows;
        callbackSave({newSelRows, selectedRowKeys});
      },
      getCheckboxProps: records => ({
        disabled: targetData.find(item => item.eqCode === records.eqCode) !== undefined,
      }),
    };
    return (
      <Modal
        visible={visible}
        title="关联设备"
        maskClosable={false}
        onOk={handleOk}
        onCancel={handleCancel}
        style={{ top: 20 }}
        width={1100}
      >
        <Equipment
          ref={(ref) => { this.eqModal = ref; }}
          onClick={handleClickRow}
          onDoubleClick={handleDoubleClickRow}
          tableConfig={{
                         scroll: { x: 500 },
                        rowSelection,
                        rowClassName,
                        rowKey: 'eqCode',
                     }}
          sideStyle={{ height: 500, overflowY: 'auto' }}
        />
      </Modal>
    );
  }
}
