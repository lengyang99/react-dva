import React, { PureComponent } from 'react';
import { List, Checkbox } from 'antd';
import propTypes from 'prop-types';
import styles from './DropMenu.less';

const Item = List.Item;

export default class DropMenu extends PureComponent {
  static propTypes = {
    dataSource: propTypes.array.isRequired,
    onOk: propTypes.func,
    onCancel: propTypes.func,
  };
  static defaultProps = {
    onOk: f => f,
    onCancel: f => f,
  };
  state = {
    checkedArray: [],
  };
  handleChange = (e) => {
    const index = this.state.checkedArray.indexOf(e.target.value);
    this.setState({
      checkedArray: index > -1 ? this.state.checkedArray.filter(item => item !== e.target.value) : this.state.checkedArray.concat(e.target.value),
    });
  };
  handleClick = (type) => {
    if (type === 'ok') {
      this.props.onOk(this.state.checkedArray);
    } else {
      this.setState({ checkedArray: [] }, () => {
        this.props.onCancel([]);
      });
    }
  };
  render() {
    const { checkedArray } = this.state;
    return (
      <List
        size="small"
        bordered
        className={styles.dropMenu}
        dataSource={this.props.dataSource}
        footer={(
          <span>
            <a onClick={this.handleClick.bind('', 'ok')}>确定</a>
            <a onClick={this.handleClick.bind('', 'reset')} className="pull-right">重置</a>
          </span>
        )}
        renderItem={item => (
          <Item>
            <Checkbox onChange={this.handleChange} value={item.value} checked={checkedArray.indexOf(item.value) > -1} />
            <span>{item.text}</span>
          </Item>
        )}
      />
    );
  }
}
