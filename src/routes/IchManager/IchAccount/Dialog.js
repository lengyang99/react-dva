import React, { PureComponent } from 'react';
import { Modal, Table, message } from 'antd';
import { connect } from 'dva';
import isEmpty from 'lodash/isEmpty';
import update from 'immutability-helper';
import Toolbar from './Toolbar';

@connect(state => ({
  dialogVisible: state.ichAccount.dialogVisible,
  regulatorData: state.ichAccount.regulatorData,
  selectedIchAccount: state.ichAccount.selectedIchAccount,
  filterOption: state.ichAccount.filterOption,
  regulatorFilter: state.ichAccount.regulatorFilter,
}))
export default class Dialog extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [], // Check here to configure the default column
    };
  }
  handleConfirm = (type) => {
    const { selectedIchAccount } = this.props;
    const { selectedRowKeys } = this.state;
    if (type === 'cancel') {
      this.props.dispatch({
        type: 'ichAccount/setDialogVisible',
        payload: false,
      });
    } else {
      if (!selectedRowKeys) {
        message.warn('请选择要关联的调压器');
        return;
      }
      this.props.dispatch({
        type: 'ichAccount/saveRegulator',
        payload: {
          gshId: selectedIchAccount.gid,
          eqGIds: selectedRowKeys,
        },
      });
    }
  };
  handleRowsChange = (selectedRowKeys) => {
    this.setState({
      selectedRowKeys,
    });
  };
  handleTableChange = (pagination, filters, sorter) => {
    if (sorter && sorter.field) {
      // const sortField = sorter.field.split('').map(letter => (/[A-Z]/.test(letter) ? `_${letter.toLowerCase()}` : letter)).join('');
      // const sortRule = sorter.order.replace('end', '');
      // this.props.dispatch({
      //   type: 'ledger/fetchLedger',
      //   payload: update(this.props.filterOption, { $merge: { sortField, sortRule }}),
      // });
    } else if (!isEmpty(filters)) {
      this.props.dispatch({
        type: 'ichAccount/fetchRegulatorList',
        payload: update(this.props.filterOption, {
          $merge: {
            ...this.props.filterOption,
            eqStatus: Array.isArray(filters.eqStatus) ? filters.eqStatus.join(',') : '',
            eqType: Array.isArray(filters.eqTypeName) ? filters.eqTypeName.join(',') : '',
            pageNum: 1,
            pageSize: 10,
          },
        }),
      });
    } else {
      this.props.dispatch({
        type: 'ichAccount/fetchRegulatorList',
        payload: {
          pageOption: { pageNum: pagination.current, pageSize: pagination.pageSize },
        },
      });
    }
  };
  handleShowTotal = (total, range) => {
    return `共${total}条记录 第${range[0]}/${range[1]}页`;
  };
  arrayFormat = (arr) => {
    return (arr || []).map(item => {
      return { value: item.text, text: item.text };
    });
  };
  render() {
    const { dialogVisible, regulatorData, regulatorFilter } = this.props;
    const { selectedRowKeys } = this.state;
    const columns = [
      {
        title: '设备编码',
        dataIndex: 'eqCode',
        width: 164,
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        title: '规格型号',
        dataIndex: 'model',
      },
      {
        title: '生产厂家',
        dataIndex: 'manufacturer',
      },
      {
        title: '位置',
        dataIndex: 'posDesc',
      },
      {
        title: '状态',
        dataIndex: 'eqStatus',
        filters: this.arrayFormat(regulatorFilter.status),
        onFilter: (value, record) => {
          return record.eqStatus === value;
        },
      },
      {
        title: '分类',
        dataIndex: 'clsName',
        filters: this.arrayFormat(regulatorFilter.cls),
        onFilter: (value, record) => {
          return record.clsName === value;
        },
      },
      {
        title: '类型',
        dataIndex: 'eqTypeName',
        filters: this.arrayFormat(regulatorFilter.type),
        onFilter: (value, record) => {
          return record.eqTypeName === value;
        },
      },
      {
        title: '所属站点',
        dataIndex: 'stationName',
      }];
    return (
      <Modal
        onOk={this.handleConfirm.bind(this, 'ok')}
        onCancel={this.handleConfirm.bind(this, 'cancel')}
        okText="关联"
        cancelText="取消"
        visible={dialogVisible}
        title="关联调压器"
        width={1200}
      >
        <Toolbar />
        <Table
          rowKey={record => record.gid}
          dataSource={regulatorData.list}
          columns={columns}
          rowSelection={{
            selectedRowKeys,
            onChange: this.handleRowsChange,
          }}
          pagination={{
            showTotal: this.handleShowTotal,
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '40'],
            pageSize: regulatorData.pageSize,
            current: regulatorData.pageNum,
            total: regulatorData.total,
          }}
          onChange={this.handleTableChange}
        />
      </Modal>
    );
  }
}
