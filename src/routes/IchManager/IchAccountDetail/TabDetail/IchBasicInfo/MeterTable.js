import React, { PureComponent } from 'react';
import { Table, Button } from 'antd';
import { connect } from 'dva';
import styles from './MeterTable.less';

const dataSource = [{
  num: 123,
  type: 'abc',
  factory: 'zxc',
  total: 123,
}, {
  num: 123,
  type: 'abc',
  factory: 'zxc',
  total: 123,
}, {
  num: 123,
  type: 'abc',
  factory: 'zxc',
  total: 123,
}, {
  num: 123,
  type: 'abc',
  factory: 'zxc',
  total: 123,
}];
@connect(state => ({
  meterDetail: state.ichAccountDetail.meterDetail,
}))
class MeterTable extends PureComponent {
  handleConfirm = (record, status) => {
    switch (status) {
      case 'add':
        this.props.dispatch({
          type: 'ichAccountDetail/setDialogStatus',
          payload: {
            visible: true,
            status,
          },
        });
        break;
      case 'edit':
        this.props.dispatch({
          type: 'ichAccountDetail/setDialogStatus',
          payload: {
            visible: true,
            status,
          },
        });
        this.props.dispatch({
          type: 'ichAccountDetail/setIchMeterDetail',
          payload: record,
        });
        break;
      default:
        break;
    };
  };
  render() {
    const columns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 100,
    }, {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    }, {
      title: '厂商',
      dataIndex: 'factory',
      key: 'factory',
      width: 200,
    }, {
      title: '数量',
      dataIndex: 'total',
      key: 'total',
      width: 300,
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={this.handleConfirm.bind('', record, 'edit')}>编辑</a>
        </span>
      ),
    }];
    return (
      <div>
        <Button type="primary" onClick={this.handleConfirm('', 'add')} className={styles.btn} icon="plus">新建</Button>
        <Table dataSource={dataSource} columns={columns} />
      </div>
    );
  }
}

export default MeterTable;
