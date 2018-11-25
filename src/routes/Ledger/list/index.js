import React, { PureComponent } from 'react';
import { Button, Icon } from 'antd';
import classnames from 'classnames';
import { connect } from 'dva';
import update from 'immutability-helper';
import propTypes from 'prop-types';
import styles from './index.less';
import { initOption } from './initOption';
import Side from '../../../components/Equipment/Side';
import ToolBar from './Toolbar';
import EQList from './EqList';

@connect(
  state => ({
    filterOption: state.ledger.filterOption,
  })
)
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      folder: false,
    };
  }
  static propTypes = {
    filterOption: propTypes.object.isRequired,
  };
  /**
   * @desc 组织树选择
   * @param {[]} selectKeys - 选择树后返回的 key
   * @param {string} type - 树的类型 ['position', 'classify']
   */
  handleSelect = (selectKeys, type) => {
    if (type === 'position') {
      this.props.dispatch({
        type: 'ledger/fetchLedger',
        payload: update(this.props.filterOption, {
          $set: {
            ...initOption,
            locGid: selectKeys[0],
            clsGid: undefined,
            pageNum: this.props.filterOption.pageNum,
            pageSize: this.props.filterOption.pageSize,
          },
        }),
      });
    } else {
      this.props.dispatch({
        type: 'ledger/fetchLedger',
        payload: update(this.props.filterOption, {
          $set: {
            ...initOption,
            locGid: undefined,
            clsGid: selectKeys[0],
            pageNum: this.props.filterOption.pageNum,
            pageSize: this.props.filterOption.pageSize,
          },
        }),
      });
    }
  };
  handleFold = () => {
    const { folder } = this.state;
    this.setState({
      folder: !folder,
    });
  };
  render() {
    const { folder } = this.state;
    return (
      <div className={classnames(styles.list, 'clearfix')}>
        <Side
          sideStyle={{ width: 250, height: '100%', display: folder ? 'block' : 'none' }}
          sideClass={classnames(styles.list__side, 'pull-left')}
          handleSelect={this.handleSelect}
        />
        <Icon
          className={folder ? styles.folder : styles.unfolder}
          type={`double-${folder ? 'left' : 'right'}`}
          onClick={this.handleFold}
        />
        <div className={classnames(folder ? styles.list__folder : styles.list__unfolder, styles.list__table, 'pull-left')}>
          <ToolBar />
          <EQList />
        </div>
      </div>
    );
  }
}
