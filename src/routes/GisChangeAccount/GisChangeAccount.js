import React, { Component } from 'react';
import { connect } from 'dva';
import {Spin} from 'antd';
import {stringify} from 'qs';
import { routerRedux } from 'dva/router';
import isEmpty from 'lodash/isEmpty';
import update from 'immutability-helper';
import moment from 'moment';
import SearchPanel from './SearchPanel';
import TablePlan from './TablePlan';
import { getCurrTk } from '../../utils/utils.js';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

const dataFormat = data => ({
  gid: data.gid,
  id: data.eqCode,
  name: data.eqName,
  classify: data.clsGid ? data.clsGid.toString() : undefined,
  classifyName: data.clsName,
  organization: data.ecode,
  organizationName: data.orgName,
  site: data.stationId ? data.stationId.toString() : undefined,
  area: data.workZone ? data.workZone.toString() : undefined,
  position: data.posId ? data.posId.toString() : undefined,
  positionName: data.posDesc,
  type: data.eqType ? data.eqType.toString() : undefined,
  perfect: data.goodGrads ? data.goodGrads.toString() : undefined,
  isSpecial: data.isSpclEq,
  parentId: data.parentId,
  parentName: data.parentName,
  model: data.model,
  company: data.instalUnit,
  manufacturer: data.manufacturer,
  installDate: data.instalDate,
  person: data.responsible,
  importantLevel: data.impDegree ? data.impDegree.toString() : undefined,
  user: data.changedby,
  productionDate: data.prodDate,
  code: data.serialNum,
  malfunction: data.failCode ? data.failCode.toString() : undefined,
  changedTime: data.changedbyTime ? moment(data.changedbyTime) : undefined,
  material: data.material,
  provider: data.supplier,
  qualityDate: data.qltyExp,
  fixedCode: data.fixAstsCode,
  status: data.eqStatus ? data.eqStatus.toString() : undefined,
  ewCodeUUID: data.ewCodeUUID,
  nextRepairDate: data.nextRepairDate,
  nextRepairLevel: data.nextRepairLevel,
  proDefineNumber: data.proDefineNumber,
  spareParts: data.spareParts,
  sparePartsAmount: data.sparePartsAmount,
  oldEqCode: data.oldEqCode,
  ccode: data.ccode,
});
// 计划性台帐
const defalutSearchParams = {
  param: null, // 模糊关键字
  state: null, // 处理状态
  eq_type: null, // 设备分类
  startTime: `${moment().startOf('month').format('YYYY-MM-DD')} 00:00:00`, // 开始时间
  endTime: `${moment().endOf('month').format('YYYY-MM-DD')} 23:59:59`, // 结束时间
  pageno: 1, // 页码
  pagesize: 10, // 每页数
};
@connect(({ GisChangeAccount, login}) => ({
  user: login.user, // 用户登录信息
  searchLedgerParams: GisChangeAccount.searchLedgerParams, // 搜索條件
  ledgerData: GisChangeAccount.ledgerData,
  eqTypeData: GisChangeAccount.eqTypeData,
}))
export default class GisChangeAccount extends Component {
  state ={
    timeValue: 'month',
    showRange: false,
    downLoading: false,
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'GisChangeAccount/getEqType',
    });
    this.queryGisLedgerList();
  }
  // 按条件查询计划性维护台帐
  queryGisLedgerList = (params = {}) => {
    const newParams = update(this.props.searchLedgerParams, {$merge: {pageno: 1, ...params}});
    this.props.dispatch({
      type: 'GisChangeAccount/queryGisLedgerList',
      payload: newParams,
    });
  }
  // 搜索條件改變
  handleSearchParamsChange = (params) => {
    const newParams = update(this.props.searchLedgerParams, {$merge: {...params}});
    this.props.dispatch({
      type: 'GisChangeAccount/searchLedgerParamsSave',
      payload: newParams,
    });
  }
  handleTimeChange = (st) => {
    let startTime = '';
    let endTime = '';
    let showRange = false;
    switch (st.name) {
      case 'today':
        startTime = `${moment().startOf('day').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().endOf('day').format('YYYY-MM-DD')} 23:59:59`;
        break;
      case 'yesterday':
        startTime = `${moment().subtract(1, 'days').startOf('day').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().subtract(1, 'days').endOf('day').format('YYYY-MM-DD')} 23:59:59`;
        break;
      case 'month':
        startTime = `${moment().startOf('month').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().endOf('month').format('YYYY-MM-DD')} 23:59:59`;
        break;
      case 'lastMonth':
        startTime = `${moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD')} 23:59:59`;
        break;
      default:
        startTime = null;
        endTime = null;
        showRange = true;
    }
    this.setState({
      timeValue: st.name,
      showRange,
    });
    if (startTime && endTime) {
      this.queryGisLedgerList({ startTime, endTime });
    }
  };
  reset = () => {
    this.queryGisLedgerList(defalutSearchParams);
    this.setState({ timeValue: 'month' });
  }
  // 分页查询
  handleTableChange = (pagination, filters) => {
    const newParams = update(this.props.searchLedgerParams, {
      $merge: {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        eq_type: !isEmpty(filters) && Array.isArray(filters.eqtype) ? filters.eqtype.join(',') : null,
      },
    });
    this.queryGisLedgerList(newParams);
  };
  exportGisLedgerList = () => {
    this.setState({downLoading: true});
    const newParams = {...this.props.searchLedgerParams, isPage: false, ecode: this.props.user.ecode, token: getCurrTk()};
    const url = `${window.location.origin}/proxy/gis/gisbutt/exportTaskData?${stringify(newParams)}`;
    const header = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    location.href = url;
    return fetch(url, {
      method: 'GET',
      headers: header,
    }).then((response) => response.blob())
      .then((responseData) => {
        if (responseData) {
          this.setState({downLoading: false});
        }
      })
      .catch((err) => {
      });
  }
  handleClick = (record) => {
    this.props.dispatch({
      type: 'ledger/setDisabled',
      payload: false,
    });
    this.props.dispatch({
      type: 'ledger/setErcodeImage',
      payload: 'block',
    });
    this.props.dispatch({
      type: 'ledger/fetchLedgerDetail',
      payload: record.gid,
      callback: (data) => {
        this.props.dispatch({
          type: 'ledger/editLedger',
          payload: {
            eqDetail: dataFormat(data),
            eqGid: data.gid,
            activeKey: 'ledger',
            isNewLedger: false,
          },
        });
        this.props.dispatch({
          type: 'ledger/setGis',
          payload: {
            gisId: data.gisCode,
            x: data.longitude,
            y: data.latitude,
          },
        });
      },
    });
    this.props.dispatch(routerRedux.push('/equipment/ledger'));
  }
  handleGisLedger = (record) => {
    const path = {
      pathname: '/event-list-detail',
      eventid: record.eventid,
      eventtype: '24',
      params: {},
      historyPageName: '/GIS',
    };
    this.props.dispatch(routerRedux.push(path));
  }
  render() {
    return (
      <PageHeaderLayout>
        <SearchPanel
          timeValue={this.state.timeValue}
          data={this.props.ledgerData || {}}
          showRange={this.state.showRange}
          handleTimeChange={this.handleTimeChange}
          reset={this.reset}
          searchLedgerParams={this.props.searchLedgerParams}
          handleSearchParamsChange={this.handleSearchParamsChange}
          queryGisLedgerList={this.queryGisLedgerList}
          exportGisLedgerList={this.exportGisLedgerList}
        />
        <TablePlan
          eqTypeData={this.props.eqTypeData}
          searchLedgerParams={this.props.searchLedgerParams}
          handleClick={this.handleClick}
          handleGisLedger={this.handleGisLedger}
          dataSource={this.props.ledgerData || {}}
          handleTableChange={this.handleTableChange}
        />
        <div style={{display: this.state.downLoading ? 'block' : 'none'}}>
          <Spin size="large" />
        </div>
      </PageHeaderLayout>
    );
  }
}
