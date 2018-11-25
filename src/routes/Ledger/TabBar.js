import React, { PureComponent } from 'react';
import { Tabs, Modal } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';

@connect(
  state => ({
    activeKey: state.ledger.activeKey,
    isEdit: state.ledger.eqDetail.isEdit,
    eqCustom: state.ledger.eqCustom,
  })
)
export default class TabBar extends PureComponent {
  static propTypes = {
    activeKey: propTypes.string.isRequired,
    isEdit: propTypes.bool,
    eqCustom: propTypes.object.isRequired,
  };
  static defaultProps = {
    isEdit: false,
  };
  /**
   * @desc tab 改变后修改 activeKey
   * @param {string} value
   */
  handleChange = value => {
    const { eqCustom } = this.props;
    // 判断当前处于 ledger 组件 && activeKey 不是 ledger && 表单未处于编辑状态 弹框提示
    if (this.props.activeKey === 'ledger' && this.props.activeKey !== value && this.props.isEdit) {
      Modal.confirm({
        title: '还有未保存的内容,确认要离开吗?',
        onOk: () => {
          this.props.dispatch({
            type: 'ledger/setEqActiveKey',
            payload: value,
          });
        },
      });
    } else {
      if (eqCustom && eqCustom.gid && eqCustom.eqCode) { // 判断当前设备是否存在
        switch (value) {
          case 'maintain':
            this.props.dispatch({
              type: 'ledger/fetchLedgerMaintain',
              payload: { equipmentId: eqCustom.gid, pageno: 1, pagesize: 10},
            });
            break;
          case 'history':
            this.props.dispatch({
              type: 'ledger/fetchHistoryList',
              payload: { eqCode: eqCustom.eqCode, pageno: 1, pagesize: 10 },
            });
            break;
          case 'record':
            this.props.dispatch({
              type: 'ledger/fetchRecordList',
              payload: { eqCode: eqCustom.eqCode, pageno: 1, pagesize: 10 },
            });
            break;
          default:
            break;
        }
      }
      this.props.dispatch({
        type: 'ledger/setEqActiveKey',
        payload: value,
      });
    }
  };

  render() {
    const { activeKey } = this.props;
    const tabBarStyle = { display: activeKey === 'list' ? 'none' : 'block' };

    return (
      <Tabs
        activeKey={activeKey}
        tabBarStyle={tabBarStyle}
        onChange={this.handleChange}
      >
        {this.props.children}
      </Tabs>
    );
  }
}
