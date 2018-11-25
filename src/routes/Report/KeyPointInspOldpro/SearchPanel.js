import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon} from 'antd';
import {stringify} from 'qs';
import moment from 'moment';
import fetch from 'dva/fetch';
import { getCurrTk } from '../../../utils/utils.js';
import styles from './index.less';

const Option = Select.Option;
const FormatStr = 'YYYY-MM-DD';
const defaultState = {
  stationId: '全部', // 站点id
  time: moment().subtract(1, 'days'), // 时间(当前天的前一天)
  likeValue: '', // 关键字：操作人
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
  handleLikeValueChange = (e) => {
    this.setState({
      likeValue: e.target.value,
    });
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { stationId, time, likeValue } = this.state;
    const params = {
      stationid: stationId === '全部' ? '' : stationId,
      name: likeValue,
      date: time ? moment(time).format(FormatStr) : moment().subtract(1, 'days').format(FormatStr),
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
  };
  downLoadData =() => {
    this.props.loading(true)
    const url = `${window.location.origin}/proxy/statistics/keypointExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk()})}`
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
    const { stationData, pageno, pagesize} = this.props;
    const { time} = this.state;
    const stationOptions = (stationData || []).map(item =>
      (<Option key={item.locCode}>
        {item.locName}
      </Option>));
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
        <div className={styles['field-block3']}>
          <label>日期：</label>
          <DatePicker
            className={styles.rangePicker}
            value={time ? moment(time, FormatStr) : moment().subtract(1, 'days').format(FormatStr)}
            onChange={this.handleDataChange}
            allowClear={false}
          />
        </div>
        <div className={styles['field-block3']}>
          <label>搜索： </label>
          <Input
            className={styles.input}
            value={this.state.likeValue}
            placeholder="巡线员姓名"
            onChange={this.handleLikeValueChange}
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
        >
          <Icon type="download" />
          {/* <a
            href={`${window.location.origin}/proxy/statistics/keypointExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk()})}`}
            style={{ color: 'white', paddingLeft: 8 }}
          >导出</a> */}
          <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
        </Button>
      </div>
    );
  }
}

