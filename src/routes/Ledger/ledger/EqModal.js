import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';
import update from 'immutability-helper';
import { fetchLedger } from '../../../services/eqLedger';
import Equipment from '../../../components/Equipment';
import styles from './EqModal.less';

@connect(
  state => ({
    eqDetail: state.ledger.eqDetail,
  })
)
export default class EQModal extends PureComponent {
  static propTypes = {
    eqDetail: propTypes.object.isRequired,
    visible: propTypes.bool.isRequired,
    toggleModal: propTypes.func.isRequired,
  };

  state = {
    select: {
      index: null,
      record: {},
    },
  };
  /**
   * @desc table row 样式设置
   * @param {object} record
   * @param {number} index
   * @return {string}
   */
  rowClassName = (record, index) => {
    return index === this.state.select.index ? styles.select : '';
  };

  /**
   * @desc table row 点击
   * @param {object} record - table 数据
   * @param {number} index - 当前点击 row 的 index
   */
  handleClick = (record, index) => {
    this.setState({
      select: {
        record,
        index,
      },
    }, () => {
      this.rowClassName();
    });
  };

  doubleHandleClick = (record, index) => {
    this.props.dispatch({
      type: 'ledger/setEqDetail',
      payload: update(this.props.eqDetail, { $merge: { parentId: record.gid, parentName: record.eqName } }),
    });
    fetchLedger({ parentId: record.gid }).then(data => {
      this.props.dispatch({
        type: 'ledger/setChildList',
        payload: Array.isArray(data.list) ? data.list : [],
      });
    });
    this.props.toggleModal(false);
  };

  /**
   * @desc modal ok 事件
   */
  handleOk = () => {
    this.props.dispatch({
      type: 'ledger/setEqDetail',
      payload: update(this.props.eqDetail, { $merge: { parentId: this.state.select.record.gid, parentName: this.state.select.record.eqName } }),
    });
    fetchLedger({ parentId: this.state.select.record.eqCode }).then(data => {
      this.props.dispatch({
        type: 'ledger/setChildList',
        payload: Array.isArray(data.list) ? data.list : [],
      });
    });
    this.props.toggleModal(false);
  };

  render() {
    return (
      <Modal
        visible={this.props.visible}
        title="设备选择"
        width={1100}
        onOk={this.handleOk}
        onCancel={this.props.toggleModal.bind('', false)}
      >
        <Equipment
          onClick={this.handleClick}
          onDoubleClick={this.doubleHandleClick}
          tableConfig={{
            scroll: { x: 500 },
            rowClassName: this.rowClassName,
          }}
          sideStyle={{ height: 500, overflowY: 'auto' }}
        />
      </Modal>
    );
  }
}
