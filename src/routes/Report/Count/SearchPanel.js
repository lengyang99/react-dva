import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon } from 'antd';
import moment from 'moment';
import {stringify} from 'qs';
import { getCurrTk } from '../../../utils/utils.js';
import styles from './index.less';

const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const FormatStr = 'YYYY-MM';
const defaultState = {
  time: moment(), // 日期
  username: '', // 用户
};
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }
  handleDataChange = (time) => {
    this.setState({
      time,
    });
  }
  handleUserChange = (e) => {
    this.setState({
      username: e.target.value,
    });
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { time, username } = this.state;
    const params = {
      username,
      date: time ? time.format(FormatStr) : moment().format(FormatStr),
    };
    return params;
  }
  // 搜索
  onSearch = () => {
    this.props.handleOnSearch(this.getSearchValue());
  }
  // 重置
  onRest = () => {
    this.setState(defaultState);
    this.props.handleOnRest();
  }
  render() {
    const { time} = this.state;
    return (
      <div className={styles.panel}>
        <div>
          <div className={styles['field-block']}>
            <label>时间：</label>
            <MonthPicker
              className={styles.rangePicker}
              value={time ? moment(time, FormatStr) : moment()}
              onChange={this.handleDataChange}
              allowClear
            />
          </div>
          <div className={styles['field-block3']}>
            <label>搜索： </label>
            <Input
              className={styles.input}
              value={this.state.username}
              placeholder="用户姓名"
              onChange={this.handleUserChange}
            />
          </div>
          <Button
            type="primary"
            className={styles.button}
            onClick={this.onSearch}
          >查询</Button>
          <Button
            onClick={this.onRest}
          >重置</Button>
          <Button
            type="primary"
            className={styles.button}
            disabled
          >
            <Icon type="download" />
            <a href={`${window.location.origin}/proxy/statistics/maintenanceTaskReportExportExcel?${stringify({...this.getSearchValue(), pageno: 1, pagesize: 1000, token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
          </Button>
        </div>
      </div>
    );
  }
}

