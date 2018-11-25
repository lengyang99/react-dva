import React, { PureComponent } from 'react';
import { Modal, Table } from 'antd';
import update from 'immutability-helper';
import { connect } from 'dva';

@connect(
  state => ({
    eqDetail: state.ledger.eqDetail,
    sparePartsList: state.ledger.sparePartsList,
    sparePartsTotal: state.ledger.sparePartsTotal,
  })
)
class SparePartsModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRow: {},
      pageno: 1,
      pagesize: 10,
    };
  }
  handleConfirm = (type) => {
    this.props.toggleModal(false);
    switch (type) {
      case 'ok':
        this.props.dispatch({
          type: 'ledger/setEqDetail',
          payload: update(this.props.eqDetail, { $merge: { spareParts: this.state.selectedRow.des, sparePartsAccount: this.state.selectedRow.number } }),
        });
        break;
      case 'cancel':
        break;
      default:
        break;
    }
  };
  /*
   @desc 批量选择(单选)监听
   @param record: 被操作的行数据, selected: 选中状态, selectedRows: 被选中的数据集合
   */
  handleSelectRows = (record, selected, selectedRows) => {
    console.log(record);
    this.setState({
      selectedRow: record,
    });
  };
  handleRowsChange = (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  };
  /*
   @desc 每页显示条数
   @param current: 当前页, size: 每页显示条数
   */
  pageSizeChange= (current, size) => {
    console.log('每页条数:', size);
    this.setState({
      pagesize: size,
    });
  };
  /*
   @desc 每页显示条数
   @param total: 总数, range: 当前页-range[0], 总页数-range[1]
   */
  handleShowTotal = (total, range) => {
    // return `共${total}条记录 第${range[0]}/${range[1]}页`;
    return `共${total}条记录 第${this.state.pageno}页`;
  };
  /*
      分页、排序、筛选变化时触发
   */
  handleTableChange = (pagination) => {
    this.setState({
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    });
    this.props.dispatch({
      type: 'ledger/fetchSpareParts',
      payload: {factoryCode: this.props.eqDetail.organization, pageno: pagination.current, pagesize: pagination.pageSize},
    });
  };
  // handleCurrentPageChange = (page, pageSize) => {
  //   console.log(page, pageSize);
  // };
  render() {
    const columns = [
      {title: '物料编码', dataIndex: 'code' },
      {title: '物料名称', dataIndex: 'des' },
      {title: '数量', dataIndex: 'number' },
    ];
    return (
      <Modal
        width={600}
        visible={this.props.visible}
        title="请选择备品备件"
        onOk={this.handleConfirm.bind('', 'ok')}
        onCancel={this.handleConfirm.bind('', 'cancel')}
        okText="确定"
        cancelText="取消"
      >
        <Table
          pagination={{
            showTotal: this.handleShowTotal,
            total: this.props.sparePartsTotal,
            current: this.state.pageno,
            // onChange: this.handleCurrentPageChange,
            pageSize: this.state.pagesize,
            // showSizeChanger: true,
            // pageSizeOptions: ['10', '20', '30', '40'],
            // onShowSizeChange: this.pageSizeChange,
            showQuickJumper: true,
          }}
          dataSource={this.props.sparePartsList}
          columns={columns}
          rowSelection={{
            type: 'radio',
            onSelect: this.handleSelectRows,
            onChange: this.handleRowsChange,
          }}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}

export default SparePartsModal;
