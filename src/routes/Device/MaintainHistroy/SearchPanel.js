import React, { PureComponent } from 'react';
import moment, { isMoment } from 'moment';
import { Button, Input, DatePicker } from 'antd';
import update from 'immutability-helper';
import styles from './index.less';

const RangePicker = DatePicker.RangePicker;
class SearchPanel extends PureComponent {
  handleSearchParamsChange = (params) => {
    const newParams = update(this.props.searchMaintainParams, {$merge: params});
    this.props.dispatch({
      type: 'planMaintainLedger/searchMaintainParamsSave',
      payload: newParams,
    });
  }
  // 搜索
  onSearch = () => {
    this.props.handleOnSearch(1);
  }
  // 重置
  onRest = () => {
    this.props.handleOnSearch(0);
  }
  render() {
    const {searchMaintainParams, ledgerMsg} = this.props;
    const {others, startTime, endTime} = searchMaintainParams || {};
    const time1 = startTime ? moment(startTime) : null;
    const time2 = endTime ? moment(endTime) : null;
    return (
      <div className={styles.panel}>
        <div>
          <div className={styles['field-block']}>
            <label>设备编码：</label>
            <span>{ledgerMsg.workStandardName || ''}</span>
          </div>
          <div className={styles['field-block']}>
            <label>设备名称：</label>
            <span>{ledgerMsg.taskCategory || ''}</span>
          </div>
        </div>
        <div>
          <div className={styles['field-block']}>
            <label>维护日期：</label>
            <RangePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]}}
              value={[time1, time2]}
              onChange={(time) => {
                const stime = isMoment(time[0]) ? time[0].format('YYYY-MM-DD HH:mm') : null;
                const etime = isMoment(time[1]) ? time[1].format('YYYY-MM-DD HH:mm') : null;
                this.handleSearchParamsChange({startTime: stime, endTime: etime});
              }}
            />
          </div>
          <div className={styles['field-block']}>
            <label>快速搜索：</label>
            <Input
              className={styles.input}
              placeholder="设备编码,设备名称,地址"
              value={others}
              onChange={(e) => this.handleSearchParamsChange({others: e.target.value})}
            />
          </div>
          <Button
            className={styles['search-button']}
            type="primary"
            onClick={this.onSearch}
          >查询</Button>
          <Button
            onClick={this.onRest}
          >重置</Button>
        </div>
      </div>
    );
  }
}
export default SearchPanel;

