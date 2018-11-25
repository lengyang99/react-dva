import React, { Component } from 'react';
import { connect } from 'dva';
import { Spin } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchPanel from './SearchPanel';
import TableList from './TableList';
import styles from './index.less';

@connect(({ statistics, login }) => ({
  stationData: statistics.stationData,
  user: login.user,
  pThirdConData: statistics.pThirdConData,
}))

export default class ThirdConstruction extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchParams: {}, // 查询参数
      reportData: {
        nameData: [], // 站点列表
        zdData: [], // 重点施工
        ybData: [], // 一般施工
        rgData: [], // 人工开挖
        jxData: [], // 机械开挖
        dgData: [], // 穿越顶管
        cjData: [], // 拆建
        qtData: [], // 其他
        newData: [], // 新增
        totalData: [], // 总数
        downLoading: false,
      },
      stationNames: [], // 站点列表
    };
  }
  componentDidMount() {
    const { dispatch } = this.props;
    this.queryThridConList();
    const stationNames = [];
    dispatch({
      type: 'statistics/getStationData',
      callback: (data) => {
        if (data) {
          data.forEach(item => {
            stationNames.push(item.locName);
          });
          this.setState({ stationNames });
        }
      },
    });
  }
  // 查询
  queryThridConList = (params = {}) => {
    this.props.dispatch({
      type: 'statistics/getPDSFReport',
      payload: { ...{ date: moment().format('YYYY-MM') }, ...params },
      callback: (data) => {
        if (data) {
          const nameData = [];
          const zdData = [];
          const ybData = [];
          const jxData = [];
          const dgData = [];
          const cjData = [];
          const rgData = [];
          const qtData = [];
          const newData = [];
          const totalData = [];
          data.forEach(item => {
            nameData.push(item.station || '');
            zdData.push(item.controlKey);
            ybData.push(item.controlNormal);
            newData.push(item.newNum || 0);
            jxData.push(item.jxNum);
            rgData.push(item.rgNum);
            dgData.push(item.dgNum);
            qtData.push(item.qtNum);
            cjData.push(item.cjNum);
            totalData.push(item.totalNum);
          });
          const reportData = {
            nameData,
            zdData,
            ybData,
            jxData,
            dgData,
            rgData,
            qtData,
            cjData,
            newData,
            totalData,
          };
          this.setState({ reportData });
        }
      },
    });
  }
  // 搜索
  handleOnSearch = (params) => {
    this.setState({ searchParams: { ...this.state.searchParams, ...params } });
    this.queryThridConList({
      ...this.state.searchParams,
      ...params,
    });
  }
  // 重置
  handleOnRest = () => {
    this.setState({ searchParams: {} });
    this.queryThridConList();
  };
  loadingHandler = (val) => {
    this.setState({ downLoading: val })
  };
  render() {
    return (
      <PageHeaderLayout>
        <SearchPanel
          {...this.props}
          pageno={this.state.pageno}
          pagesize={this.state.pagesize}
          handleOnSearch={this.handleOnSearch}
          handleOnRest={this.handleOnRest}
          loading={(value) => { this.loadingHandler(value) }}
        />
        <TableList
          {...this.props}
          stationNames={this.state.stationNames}
          reportData={this.state.reportData}
        />
        <div className={styles['loading']} style={{ display: this.state.downLoading ? 'block' : 'none' }}>
          <Spin size="large" />
        </div>
      </PageHeaderLayout>
    );
  }
}
