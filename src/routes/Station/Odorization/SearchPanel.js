import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon } from 'antd';
import moment from 'moment';
import styles from './index.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const FormatStr = 'YYYY-MM-DD';
const defaultState = {
  stationId: '', // 站点id
  stinkyMachine: '', // 加臭机
  operationMode: '', // 操作方式
  startTime: '', // 开始时间
  endTime: '', // 结束时间
  likeValue: '', // 关键字：操作人
};
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      expand: false,
    };
  }
  handleStationChange = (stationId) => {
    this.setState({
      stationId,
    });
  }
  handleOperModeChange = (operationMode) => {
    this.setState({
      operationMode,
    });
  }
  handleStMacChange = (stinkyMachine) => {
    this.setState({
      stinkyMachine,
    });
  }
  handleDataChange = (rangeValue, dataString) => {
    this.setState({
      startTime: dataString[0],
      endTime: dataString[1],
    });
  }
  handleLikeValueChange = (e) => {
    this.setState({
      likeValue: e.target.value,
    });
  }
  // 展开
  expand = () => {
    this.setState({expand: !this.state.expand});
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { stationId, stinkyMachine, operationMode, startTime, endTime, likeValue } = this.state;
    const params = {
      stationId,
      other: likeValue,
      machineId: stinkyMachine,
      operationType: operationMode,
      startTime,
      endTime,
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
    const { operType: {station_smelly_oper_type: type}, odorMacData, stationData } = this.props;
    const operData = type && type.length !== 0 ? type : [];
    const { expand, startTime, endTime} = this.state;
    const stationOptions = (stationData || []).map(item =>
      (<Option key={item.gid}>
        {item.name}
      </Option>));
    const odorMacOptions = (odorMacData || []).map(item =>
      (<Option key={item.gid}>
        {item.name}
      </Option>));
    const operTypeOptions = operData.map(item =>
      (<Option key={item.alias}>
        {item.alias}
      </Option>));
    return (
      <div className={styles.panel}>
        <div>
          <div className={styles['field-block']}>
            <label>站点：</label>
            <Select
              className={styles.select}
              value={this.state.stationId}
              onChange={this.handleStationChange}
              allowClear
            >
              {stationOptions || null}
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>加臭机：</label>
            <Select
              className={styles.select2}
              value={this.state.stinkyMachine}
              onChange={this.handleStMacChange}
              allowClear
            >
              {odorMacOptions || null}
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>操作方式：</label>
            <Select
              className={styles.select2}
              value={this.state.operationMode}
              onChange={this.handleOperModeChange}
              allowClear
            >
              {operTypeOptions || null}
            </Select>
          </div>
          <div
            className={styles['field-block2']}
            style={{
              position: 'relative',
              top: expand ? 42 : 0,
            }}
          >
            <Button
              className={styles.button}
              onClick={this.onSearch}
            >查询</Button>
            <Button
              onClick={this.onRest}
            >重置</Button>
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.expand}>
              {expand ? '收起' : '展开'}<Icon type={expand ? 'up' : 'down'} />
            </a>
          </div>
        </div>
        <div style={{ display: !expand ? 'none' : 'inline-block' }}>
          <div className={styles['field-block3']}>
            <label>日期：</label>
            <RangePicker
              className={styles.rangePicker}
              value={startTime === '' ? [null, null] : [moment(startTime, FormatStr), moment(endTime, FormatStr)]}
              onChange={this.handleDataChange}
              allowClear
            />
          </div>
          <div className={styles['field-block3']}>
            <label>搜索： </label>
            <Input
              className={styles.input}
              value={this.state.likeValue}
              placeholder="操作人"
              onChange={this.handleLikeValueChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

