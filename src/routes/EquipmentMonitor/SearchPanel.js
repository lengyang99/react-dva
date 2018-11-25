import React, { PureComponent } from 'react';
import {connect} from 'dva';
import { Button, Select, Input, DatePicker, Icon } from 'antd';
import moment from 'moment';
import styles from './index.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const FormatStr = 'YYYY-MM-DD';
const defaultState = {
  detectionName: '', // 监测点名称
  equipmentName: '', // 设备名称
  stationId: '', // 站点id
  valueType: '', // 值类型
  isLinkEquipment: '', // 是否关联设备
  dataSource: '', // 数据来源
};

@connect(({equipmentMonitor, station}) => ({
  dataType: equipmentMonitor.dataType,
  dataSource: equipmentMonitor.dataSource,
  stations: station.stations,
}))
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
    };
  }

    changeHandler = (val, fileName) => {
      this.setState({
        [fileName]: val,
      });
    }
    // 获取搜索参数
    getSearchValue = () => {
      const { detectionName, equipmentName, stationId, valueType, isLinkEquipment, dataSource } = this.state;
      const params = {
        detectionName,
        equipmentName,
        stationId,
        valueType,
        isLinkEquipment,
        dataSource,

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
      const { dataType: {detection_value_type}, dataSource: {detection_data_source}, stations } = this.props;
      console.log(this.props, 'props');
      const {detectionName, equipmentName, stationId, valueType, isLinkEquipment, dataSource} = this.state;
      const stationOptions = (stations || []).map(item =>
        (<Option key={item.gid} value={item.gid}>
          {item.name}
        </Option>));

      const odorMacOptions = (detection_data_source || []).map(item =>
        (<Option key={item.name} value={item.alias}>
          {item.alias}
        </Option>));

      const operTypeOptions = (detection_value_type || []).map(item =>
        (<Option key={item.name} value={item.alias}>
          {item.alias}
        </Option>));

      return (
        <div className={styles.panel}>
          <div>
            <div className={styles['field-block']}>
              <label>设备名称: </label>
              <Input
                className={styles.input}
                value={equipmentName}
                placeholder="设备名称"
                onChange={(e) => this.changeHandler(e.target.value, 'equipmentName')}
              />
            </div>
            <div className={styles['field-block']}>
              <label>检测点名称: </label>
              <Input
                className={styles.input}
                value={detectionName}
                placeholder="检测点名称"
                onChange={(e) => this.changeHandler(e.target.value, 'detectionName')}
              />
            </div>
            <div className={styles['field-block']}>
              <label>所属站点：</label>
              <Select
                className={styles.select}
                value={stationId}
                allowClear
                onChange={(val) => this.changeHandler(val, 'stationId')}
              >
                {stationOptions || null}
              </Select>
            </div>
            <Button
              className={styles.button}
              onClick={this.onSearch}
            >查询</Button>
            <Button
              onClick={this.onRest}
            >重置</Button>
          </div>
          <div>
            <div className={styles['field-block']}>
              <label>数据来源：</label>
              <Select
                className={styles.select2}
                value={dataSource}
                onChange={(val) => this.changeHandler(val, 'dataSource')}
                allowClear
              >
                {odorMacOptions || null}
              </Select>
            </div>
            <div className={styles['field-block']}>
              <label>值类型：</label>
              <Select
                className={styles.select2}
                value={valueType}
                onChange={(val) => this.changeHandler(val, 'valueType')}
                allowClear
              >
                {operTypeOptions || null}
              </Select>
            </div>
            <div className={styles['field-block']}>
              <label>是否关联设备：</label>
              <Select
                placeholder="请选择"
                className={styles.select}
                value={isLinkEquipment}
                allowClear
                onChange={(val) => this.changeHandler(val, 'isLinkEquipment')}
              >
                <Option value="1">是</Option>
                <Option value="2">否</Option>
              </Select>
            </div>
          </div>
        </div>
      );
    }
}

