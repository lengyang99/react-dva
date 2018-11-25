import React from 'react';
import { Button, DatePicker, Input } from 'antd';
import moment, {isMoment} from 'moment';
import PropTypes from 'prop-types';
import styles from './index.less';

const RangePicker = DatePicker.RangePicker;
const SearchPanel = (props) => {
  const {data, searchLedgerParams, exportGisLedgerList, reset, queryGisLedgerList, timeValue, showRange, handleSearchParamsChange, handleTimeChange} = props;
  const {param, state, startTime, endTime} = searchLedgerParams || {};
  const time1 = startTime ? moment(startTime) : null;
  const time2 = endTime ? moment(endTime) : null;
  const State = ({ datas, value, onChange }) => {
    const items = datas.map(item => (
      <label
        className={styles['state-item']}
        style={{ color: item.name === value ? '#1C8DF5' : 'default' }}
        onClick={() => { onChange(item); }}
        key={item.name}
      ><span >{item.alias}</span></label>
    ));
    return (
      <div style={{ display: 'inline-block' }}>
        {items}
      </div>
    );
  };
  const selectValues = [
    { alias: '今日', name: 'today' },
    { alias: '昨日', name: 'yesterday' },
    { alias: '本月', name: 'month' },
    { alias: '上月', name: 'lastMonth'},
    { alias: '自定义', name: 'custom' },
  ];
  const selectStatus = [
    { alias: `全部(${data.count || 0})`, name: null },
    { alias: `处理中(${data.count_0 || 0})`, name: 0 },
    { alias: `已处理(${data.count_1 || 0})`, name: 1 },
  ];
  return (
    <div className={styles.panel}>
      <div>
        <div className={styles['field-block2']}>
          <label>快速搜索：</label>
          <Input
            className={styles.input}
            placeholder="设备编码、设备名称、地址、上报人"
            value={param}
            onChange={(e) => handleSearchParamsChange({param: e.target.value})}
          />
        </div>
      </div>
      <div className={styles['field-block']}>
        <label><b>处理状态：</b></label>
        <State
          datas={selectStatus}
          onChange={(item) => queryGisLedgerList({state: item.name})}
          value={state}
        />
      </div>
      <div className={styles['field-block']}>
        <Button
          className={styles['search-button']}
          type="primary"
          onClick={() => queryGisLedgerList()}
        >查询</Button>
        <Button
          onClick={() => reset()}
        >重置</Button>
        <Button
          type="primary"
          style={{marginLeft: 10}}
          onClick={() => exportGisLedgerList()}
        >导出</Button>
      </div>
      <div>
        <div className={styles['field-block']}>
          <label><b>上报时间：</b></label>
          <State
            datas={selectValues}
            onChange={(val) => {
                        handleTimeChange(val);
                    }}
            value={timeValue}
          />
        </div>
        {showRange ? <RangePicker
          format="YYYY-MM-DD HH:mm:ss"
          showTime={{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}}
          value={[time1, time2]}
          onChange={(time) => {
                const stime = isMoment(time[0]) ? time[0].format('YYYY-MM-DD HH:mm:ss') : null;
                const etime = isMoment(time[1]) ? time[1].format('YYYY-MM-DD HH:mm:ss') : null;
                queryGisLedgerList({startTime: stime, endTime: etime});
              }}
        /> : null}
      </div>
    </div>
  );
};
SearchPanel.defaultProps = {
  timeValue: 'month',
  showRange: false,
  searchLedgerParams: {},
  handleTimeChange: (f) => f,
  reset: (f) => f,
  queryGisLedgerList: (f) => f,
  exportGisLedgerList: (f) => f,
  handleSearchParamsChange: (f) => f,
};
SearchPanel.propTypes = {
  timeValue: PropTypes.string,
  showRange: PropTypes.bool,
  searchLedgerParams: PropTypes.object,
  handleTimeChange: PropTypes.func,
  reset: PropTypes.func,
  queryGisLedgerList: PropTypes.func,
  exportGisLedgerList: PropTypes.func,
  handleSearchParamsChange: PropTypes.func,
};
export default SearchPanel;

