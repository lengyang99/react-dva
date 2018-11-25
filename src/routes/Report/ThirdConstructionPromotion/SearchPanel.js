import React, { PureComponent } from 'react';
import { Button, Select, DatePicker, Icon } from 'antd';
import moment from 'moment';
import fetch from 'dva/fetch';
import {stringify} from 'qs';
import { getCurrTk } from '../../../utils/utils.js';
import styles from './index.less';

const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const FormatStr = 'YYYY-MM';
const defaultState = {
  stateValue: 2,
  stationId: '全部', // 站点id
  time: moment(), // 日期
};
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }
  handleStationChange = (stationId) => {
    this.setState({
      stationId,
    });
  }
  handleDataChange = (time) => {
    this.setState({
      time,
    });
  }
  stateChangeHandle = (val) => {
    this.setState({
      stateValue: val.name,
    });
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { stationId, time, stateValue} = this.state;
    const {pageno, pagesize} = this.props;
    let date = time.format(FormatStr);
    if (stateValue === 1) {
      date = moment().format(FormatStr);
    }
    if (stateValue === 0) {
      date = moment().subtract(1, 'months').format(FormatStr);
    }
    const params = {
      stationid: stationId === '全部' ? '' : stationId,
      date,
      pageno,
      pagesize,
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
  // 导出
  exportExcel = () => {
    this.props.dispatch({
      type: 'statistics/patrolExportExcel',
      payload: this.getSearchValue(),
    });
  };
  downLoadData =() => {
    this.props.loading(true)
    const url = `${window.location.origin}/proxy/statistics/patrolExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, token: getCurrTk()})}`
    let header = {
        "Content-Type": "application/json;charset=UTF-8",
    };
    location.href = url;
    return fetch(url, {
            method: 'GET',
            headers: header,
        }).then((response) => response.blob())
        .then((responseData) => {
            console.log('res:',url, responseData);
            if(responseData){
              this.props.loading(false)
            }
        })
        .catch( (err) => {
            console.log('err:',url, err);
        });

    }
  render() {
    const { stationData } = this.props;
    const { time } = this.state;
    const stationOptions = (stationData || []).map(item =>
      (<Option key={item.locCode}>
        {item.locName}
      </Option>));
    const State = ({datas, value, onChange}) => {
      const items = datas.map(item => (
        <label
          className={styles['state-item']}
          style={{ color: item.name === value ? '#1C8DF5' : 'default'}}
          onClick={() => { onChange(item); }}
          key={item.name}
        ><span >{item.alias}</span></label>
      ));
      return (
        <div style={{display: 'inline-block'}}>
          {items}
        </div>
      );
    };
    const selectValues = [
      { alias: '上月', name: 0 },
      { alias: '本月', name: 1 },
      { alias: '自定义', name: 2 },
    ];
    return (
      <div className={styles.panel}>
        <div className={styles['field-block']}>
          <label>站点：</label>
          <Select
            className={styles.select}
            value={this.state.stationId}
            onChange={this.handleStationChange}
          >
            <Option key="全部" value="全部">全部</Option>
            {stationOptions || null}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label><b>时间：</b></label>
          <State
            datas={selectValues}
            onChange={(val) => {
                        this.stateChangeHandle(val);
                    }}
            value={this.state.stateValue}
          />
        </div>
        <div style={{display: this.state.stateValue === 2 ? 'inline-block' : 'none'}}>
          <div className={styles['field-block3']}>
            <MonthPicker
              className={styles.rangePicker}
              value={time ? moment(time, FormatStr) : moment()}
              onChange={this.handleDataChange}
              allowClear={false}
            />
          </div>
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
        >
          <Icon type="download" />
          {/* <a href={`${window.location.origin}/proxy/statistics/patrolExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a> */}
          <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
        </Button>
      </div>
    );
  }
}

