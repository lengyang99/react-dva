import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import update from 'immutability-helper';
import isEmpty from 'lodash/isEmpty';
import SearchPanel from './SearchPanel';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import TablePlan from './TablePlan';
import EditLedgerModal from './EditLedgerModal';

const defaultSearchParams = {
  others: null, // 模糊关键字
  startTime: null, // 维护开始时间
  endTime: null,
  clsGids: null, // 设备分类
  functionKeys: null, // 作业类型
  pageno: 1, // 页码
  pagesize: 10, // 每页数
};
@connect(({ login, planMaintainLedger, operationStandard, device}) => ({
  user: login.user,
  searchLedgerParams: planMaintainLedger.searchLedgerParams,
  ledgerData: planMaintainLedger.ledgerData, // 计划性维护台帐
  eqTypeData: operationStandard.eqTypeData,
  operaTypeData: operationStandard.operaTypeData, // 作业类型列表
  tableIndex: planMaintainLedger.tableIndex,
  userInfo: device.userInfo,
}))
export default class PlanMaintainLedger extends Component {
    state = {
      visible: false,
      record: {}, // 台帐记录
      clear: true,
    }
    modal = null;
    componentDidMount() {
      const {eqTypeData, operaTypeData, searchLedgerParams, userInfo} = this.props;
      // 获取设备设置条件
      if (!eqTypeData || eqTypeData.length === 0) {
        this.props.dispatch({
          type: 'operationStandard/getEqTypeData',
        });
      }
      if (!operaTypeData || operaTypeData.length === 0) {
        this.props.dispatch({
          type: 'operationStandard/queryOperaTypeList',
        });
      }
      if (!userInfo || userInfo.length === 0) {
        // 根据ecode查用户列表
        this.props.dispatch({
          type: 'device/getStationUserByEcode',
        });
      }
      this.queryPlanMaintainLedgerList(searchLedgerParams);
    }
    componentWillUnmount() {
      if (this.state.clear) {
        this.props.dispatch({
          type: 'operationStandard/searchMaintainParamsSave',
          payload: defaultSearchParams,
        });
        this.tableIndexSave();
      }
    }
    tableIndexSave = (record = null, index = null) => {
      this.props.dispatch({
        type: 'planMaintainLedger/tableIndexSave',
        payload: index,
      }, () => {
        this.rowClassName(record, index);
      });
    }
    // 按条件查询计划性维护台帐
    queryPlanMaintainLedgerList = (params = {}) => {
      this.props.dispatch({
        type: 'planMaintainLedger/queryPlanMaintainLedgerList',
        payload: params,
      });
    }
    // 分页查询
    handleTableChange = (pagination, filters) => {
      const newParams = update(this.props.searchLedgerParams, {$merge: {
        pageno: pagination.current,
        pagesize: pagination.pageSize,
        clsGids: !isEmpty(filters) && Array.isArray(filters.clsName) ? filters.clsName.join(',') : null,
        functionKeys: !isEmpty(filters) && Array.isArray(filters.functionName) ? filters.functionName.join(',') : null,
      }});
      this.queryPlanMaintainLedgerList(newParams);
    };
    // 模糊查询
    handleOnSearch = (type) => {
      if (type === 0) {
        this.queryPlanMaintainLedgerList(defaultSearchParams);
      } else if (type === 1) {
        const newParams = update(this.props.searchLedgerParams, {$merge: {pageno: 1}});
        this.queryPlanMaintainLedgerList(newParams);
      }
    }
    handleOk = () => {
      this.modal.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const {user, time} = values;
          console.log(user, time, 'sdasd');
          const subData = {
            gid: this.state.record.gid,
            nextStartTime: null,
            nextEndTime: null,
            nextAssigneeIds: null,
            nextAssigneeNames: null,
          };
          this.props.dispatch({
            type: 'planMaintainLedger/editPlanMaintainLedger',
            payload: subData,
          });
        }
      });
      this.setState({visible: !this.state.visible});
    }
    handleCancel = () => {
      this.setState({visible: !this.state.visible});
    }
    editPlanLedger = (record) => {
      this.setState({visible: !this.state.visible, record});
    }
    readMaintainHistory = (record) => {
      const path = {
        pathname: '/equipment/maintain-histroy',
        data: {
          workStandardName: record.workStandardName,
          taskCategory: record.taskCategory,
        },
      };
      this.setState({clear: false}, () => {
        this.props.dispatch(routerRedux.push(path));
      });
    }
    rowClassName = (record, index) => {
      return index === this.props.tableIndex ? styles.selectRow : '';
    };
    onRowClick = (record, index) => {
      this.tableIndexSave(record, index);
    }
    render() {
      const tableConfig = {
        className: styles.table,
        scroll: {x: 1700},
        onChange: this.handleTableChange,
        rowClassName: this.rowClassName,
      };
      return (
        <PageHeaderLayout>
          <SearchPanel
            {...this.props}
            handleOnSearch={this.handleOnSearch}
          />
          <TablePlan
            {...this.props}
            tableConfig={tableConfig}
            editPlanLedger={this.editPlanLedger}
            onRowClick={this.onRowClick}
            readMaintainHistory={this.readMaintainHistory}
          />
          <EditLedgerModal
            ref={ref => { this.modal = ref; }}
            userInfo={this.props.userInfo}
            visible={this.state.visible}
            record={this.state.record}
            handleOk={this.handleOk}
            handleCancel={this.handleCancel}
          />
        </PageHeaderLayout>
      );
    }
}
