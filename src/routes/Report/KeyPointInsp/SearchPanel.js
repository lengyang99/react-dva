import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon } from 'antd';
import { stringify } from 'qs';
import moment from 'moment';
import fetch from 'dva/fetch';
import { getCurrTk } from '../../../utils/utils.js';
import styles from './index.less';

const Option = Select.Option;
const FormatStr = 'YYYY-MM-DD';
const defaultState = {
  stationId: '', // 站点id
  likeValue: null, // 关键字：操作人
  areaId: '', // 区域id
  stime: null,
  etime: null,
  taskName: null,
  patrolCycle: '', // 巡视周期
};
const RangePicker = DatePicker.RangePicker;

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
    const { dealAreaInfo } = this.props;
    this.props.dispatch({
      type: 'regionalManage/getAreaByStationid',
      stationid: stationId,
      code: this.props.bustype,
      callback: dealAreaInfo,
    });
    this.setState({
      areaId: '',
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
    const { defaultPageParam, patrolLayer } = this.props;
    const { stationId, areaId, stime, etime, likeValue, taskName, patrolCycle } = this.state;
    const params = {
      stationid: stationId === '' ? null : stationId,
      areaid: areaId === '' ? null : areaId,
      usernames: likeValue,
      stime: stime ? moment(stime).format(FormatStr) : null,
      etime: etime ? moment(etime).format(FormatStr) : null,
      pageno: defaultPageParam.pageno,
      pagesize: defaultPageParam.pagesize,
      name: taskName,
      layerId: patrolLayer,
      cycle: patrolCycle,
    };
    return params;
  }
  // 搜索
  onSearch = () => {
    this.props.resetPagination();
    this.props.handleOnSearch(this.getSearchValue());
  }
  // 重置
  onRest = () => {
    this.setState(defaultState);
    this.props.handleOnRest();
  };
  // 旧有的关键点统计数据导出
  downLoadData = () => {
    const pageInfo = {
      pageno: 1,
      pagesize: this.props.total
    };
    this.props.loading(true)
    const url = `${window.location.origin}/proxy/statistics/patrolTaskStatisticExportExcel?${stringify({ ...this.getSearchValue(), ecode: this.props.user.ecode, ...pageInfo, token: getCurrTk() })}`
    let header = {
      "Content-Type": "application/json;charset=UTF-8",
    };
    location.href = url;
    return fetch(url, {
      method: 'GET',
      headers: header,
    }).then((response) => response.blob())
      .then((responseData) => {
        console.log('res:', url, responseData);
        if (responseData) {
          this.props.loading(false)
        }
      })
      .catch((err) => {
        console.log('err:', url, err);
      });

  }

  handleAreaChange = (areaId) => {
    this.setState({
      areaId
    });
  }

  handleDateChange = (d) => {
    this.setState({
      stime: d[0],
      etime: d[1],
    });
  }

  handleTaskNameChange = (e) => {
    this.setState({
      taskName: e.target.value,
    });
  }

  handlePatrolLayerChange = (patrolLayer) => {
    this.props.handlePatrolLayerChange(patrolLayer);
  }

  handlePatrolCycleChange = (patrolCycle) => {
    this.setState({ patrolCycle });
  }

  render() {
    const { stationList, areaTree, authData, patrolLayerInfo, patrolCycleData, patrolLayer } = this.props;
    const { stime, etime } = this.state;
    // 站点列表
    const stationOptions = [];
    stationList.map((item) => {
      authData.map((authItem) => {
        if (authItem.parent_id !== '0' && authItem.station_type === 'A' && `${authItem.gid}` === `${item.gid}`) {
          stationOptions.push(
            <Option key={item.id} value={item.id}>{item.name}</Option>
          );
        }
      });
    });
    // 区域列表
    const areaOptions = areaTree[0].children.map(item => (
      (item.children || []).map(iitem => (
        <Option key={iitem.value} value={iitem.value}>
          {iitem.name}
        </Option>
      ))
    ));
    // 巡视对象
    const patrolLayerOpts = [];
    patrolLayerInfo.map((layer) => {
      patrolLayerOpts.push(
        <Option key={layer.gid} value={layer.gid}>
          {layer.name}
        </Option>
      );
    });
    // 巡视周期
    const patrolCycleOpts = [];
    patrolCycleData.map((cycle) => {
      patrolCycleOpts.push(
        <Option key={cycle.name} value={cycle.name}>
          {cycle.name}
        </Option>
      );
    });
    return (
      <div className={styles.panel}>
        <div className={styles['field-block']}>
          <label>组织：</label>
          <Select
            className={styles.select}
            value={this.state.stationId}
            onChange={this.handleStationChange}
          >
            <Option key='1_first' value='' >全部</Option>
            {stationOptions || null}
          </Select>
          <span style={{ display: 'inline-block' }}>
            <span style={{ display: 'inline-block', marginLeft: 5, marginRight: 5 }}>~</span><label>执行区域：</label>
          </span>
          <Select
            className={styles.select}
            value={this.state.areaId}
            onChange={this.handleAreaChange}
          >
            <Option key='1_first' value='' >全部</Option>
            {areaOptions || null}
          </Select>
        </div>
        <div className={styles['field-block3']}>
          <label>执行任务： </label>
          <Input
            className={styles.input}
            value={this.state.taskName}
            placeholder="任务名称"
            onChange={this.handleTaskNameChange}
          />
        </div>
        <div className={styles['field-block3']}>
          <label>执行人： </label>
          <Input
            className={styles.input}
            value={this.state.likeValue}
            placeholder="巡线员姓名"
            onChange={this.handleLikeValueChange}
          />
        </div>
        <div className={styles['field-block3']}>
          <label>日期：</label>
          <RangePicker
            className={styles.rangePicker}
            value={[stime, etime]}
            onChange={this.handleDateChange}
          />
        </div>
        <div className={styles['field-block']}>
          <label>巡视对象：</label>
          <Select
            className={styles.select}
            value={patrolLayer}
            onChange={this.handlePatrolLayerChange}
          >
            {patrolLayerOpts || null}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label>巡视周期：</label>
          <Select
            className={styles.select}
            value={this.state.patrolCycle}
            onChange={this.handlePatrolCycleChange}
          >
            {patrolCycleOpts || null}
          </Select>
        </div>
        <div className={styles.searchButton}>
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
              href={`${window.location.origin}/proxy/statistics/patrolTaskStatisticExportExcel?${stringify({ ...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk() })}`}
              style={{ color: 'white', paddingLeft: 8 }}
            >导出</a> */}
            <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
          </Button>
        </div>
      </div>
    );
  }
}

