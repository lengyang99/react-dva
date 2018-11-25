import React, { PureComponent } from 'react';
import { Select, Button } from 'antd';
import { connect } from 'dva';

import styles from './Toolbar.less';

const Option = Select.Option;

@connect(state => ({
  tempTypeList: state.messageTemplate.tempTypeList,
  process: state.messageTemplate.process,
}))
export default class Toolbar extends PureComponent {
  static propTypes = {

  };
  componentDidMount() {
    this.props.dispatch({
      type: 'messageTemplate/fetchTempTypeList',
    });
  }
  handleChange = value => {
    this.props.dispatch({
      type: 'messageTemplate/setProcess',
      payload: value,
    });
  };
  handleClick = () => {
    this.props.dispatch({
      type: 'messageTemplate/fetchTempList',
      payload: {process: this.props.process},
    });
  };
  render() {
    const { tempTypeList, process } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.items}>
          <div className={styles.item}>
            <label className={styles.label} htmlFor="type">模版类型: </label>
            <Select
              allowClear
              value={process}
              className={styles.input}
              id="type"
              placeholder="请输入模版类型"
              onChange={this.handleChange}
            >
              {tempTypeList.map(option => <Option key={option} value={option}>{option}</Option>)}
            </Select>
          </div>
        </div>
        <div className={styles.btns}>
          <Button type="primary" onClick={this.handleClick}>搜索</Button>
        </div>
      </div>
    );
  }
}
