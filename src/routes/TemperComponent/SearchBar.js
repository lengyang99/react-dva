import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon} from 'antd';
import {stringify} from 'qs';
import moment from 'moment';
import { getCurrTk } from '../../utils/utils.js';
import styles from './index.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const FormatStr = 'YYYY-MM-DD hh:mm';
const defaultState = {
  date: [null, null], // 时间
  adjustDate: [null, null], // 调整时间
};
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { date, adjustDate} = this.state;
    const params = {
      startDDTime: date[0] ? date[0].format(FormatStr) : '',
      endDDTime: date[1] ? date[1].format(FormatStr) : '',
      startTZTime: adjustDate[0] ? adjustDate[0].format(FormatStr) : '',
      endTZTime: adjustDate[1] ? adjustDate[1].format(FormatStr) : '',
    };
    return params;
  }
  onDateChange = (value) => {
    this.setState({date: value});
  }
  onAdjustDateChange = (value) => {
    this.setState({adjustDate: value});
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
  // 提交
  onSubmit = () => {

  }
  render() {
    const {showMore, needSub, canAdd, onSubmit} = this.props;
    return (
      <div className={styles.panel}>
        <div className={styles['field-block3']}>
          <label>日期：</label>
          <RangePicker
            className={styles.rangePicker}
            value={this.state.date}
            format={FormatStr}
            onChange={this.onDateChange}
          />
        </div>
        <div className={styles['field-block3']}>
          <label>调整日期：</label>
          <RangePicker
            className={styles.rangePicker}
            value={this.state.adjustDate}
            format={FormatStr}
            onChange={this.onAdjustDateChange}

          />
        </div>
        <Button
          type="primary"
          className={styles.button}
          onClick={this.onSearch}
        >查询</Button>


        {needSub ? <Button
          type="primary"
          className={styles.button2}
          onClick={onSubmit}
        >提交</Button> : null}
        {!showMore && canAdd ? <Button
          type="primary"
          className={styles.button2}
          onClick={() => this.props.editPlan({action: '添加'})}
        >添加</Button> : null}
        {/* <Button
          type="primary"
          className={styles.button}
        >
          <Icon type="download" />
          <a
            href={`${window.location.origin}/proxy/statistics/keypointExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk()})}`}
            style={{ color: 'white', paddingLeft: 8 }}
          >导出</a>
        </Button> */}
      </div>
    );
  }
}

