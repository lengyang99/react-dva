import React, {Component} from 'react';
import { Modal, message} from 'antd';
import update from 'immutability-helper';
import {routerRedux} from 'dva/router';
import styles from './index.less';

const confirm = Modal.confirm;

const WithFunctionGroup = functionGroup => WrapperComonent => class extends Component {
  resetFuc = true; // 是否清空作业类型数据
  componentDidMount() {
    const { functionKey, functionData } = this.props;
    if (!this.props.stationData || this.props.stationData.length === 0) {
      this.props.dispatch({
        type: 'device/getStationListByType',
      });
    }
    if (!functionData || functionData.length === 0) {
      this.props.dispatch({
        type: 'device/getFunctionData',
        payload: { functionGroup },
        callback: (data) => {
          if (data && data.length !== 0) {
            const funcList = data[0].children;
            const funcKey = funcList && funcList.length !== 0 ? funcList[0].functionKey : null;
            if (funcKey) {
              this.queryPrePlanList({ functionKey: funcKey });
            }
          }
        },
      });
    } else if (functionKey) {
      this.queryPrePlanList({ functionKey });
    }
  }
  componentWillUnmount() {
    if (this.resetFuc) {
      this.onChangeDataByURL([], 'functionDataSave');
      this.onChangeDataByURL(null, 'rowIndexSave');
      this.onChangeDataByURL({ pageno: 1, pagesize: 10, stationId: null, others: null, functionKey: null }, 'searchPlanParamsSave');
    }
  }
  // 按条件查询计划列表
  queryPrePlanList = (params = {}) => {
    const newParams = update(this.props.searchPlanParams, { $merge: { pageno: 1, ...params } });
    this.props.dispatch({
      type: 'device/queryPrePlanData',
      payload: newParams,
    });
  }
  // tab页切换
  onTabsChange = (activeKey) => {
    const { functionData } = this.props;
    const target = (functionData || []).filter(item => (item.functionKey === activeKey))[0];
    if (target) {
      const functionKey = target.children && target.children.length !== 0 ? target.children[0].functionKey : null;
      this.onChangeDataByURL(functionKey, 'functionKeySave');
      this.onChangeDataByURL(activeKey, 'activeKeySave');
      if (functionKey) {
        this.queryPrePlanList({ functionKey });
      }
    }
  }
  // 作业 类型切换
  onFunctionChange = (item) => {
    this.onChangeDataByURL(item.functionKey, 'functionKeySave');
    this.queryPrePlanList({ functionKey: item.functionKey });
  }
  // 通过url修改model数据
  onChangeDataByURL = (params, url) => {
    this.props.dispatch({
      type: `device/${url}`,
      payload: params,
    });
  }
  // 分页改变时回调
  handleTableChange = (pagination) => {
    this.queryPrePlanList({ pageno: pagination.current, pagesize: pagination.pageSize });
  };
  handleSearchParamsChange = (params = {}) => {
    const newParams = update(this.props.searchPlanParams, { $merge: params });
    this.props.dispatch({
      type: 'device/searchPlanParamsSave',
      payload: newParams,
    });
  };
  rowClassName = (record, index) => {
    return index === this.props.rowIndex ? styles.selectRow : '';
  };
  handleClick = (record, index) => {
    this.props.dispatch({
      type: 'device/rowIndexSave',
      payload: index,
    }, () => {
      this.rowClassName();
    });
  }
  // 编辑计划
  operationPlan = (record) => {
    this.resetFuc = false;
    Object.assign(record, {functionGroup});
    const path = {
      data: record,
      pathname: functionGroup === 'prev_maintain' ? `/equipment/plan-${record.action}` : `/ichmanager/plan-${record.action}`,
      historyPageName: functionGroup === 'prev_maintain' ? '/equipment/pre-mainten' : 'ichAccount-planManager',
    };
    this.props.dispatch(routerRedux.push(path));
  }
  // 停止，开启，删除 计划
  planHandler = (record) => {
    if (record.taskType === 2) {
      message.info('临时计划状态无需更改');
      return;
    }
    const { pageno } = this.props.searchPlanParams;
    const that = this;
    confirm({
      title: `是否${record.title}计划?`,
      onOk() {
        that.props.dispatch({
          type: `device/${record.action}plan`,
          payload: { planId: record.gid },
          callback: ({ msg, success }) => {
            if (success) {
              message.success(msg);
              that.queryPrePlanList({ pageno });
            } else {
              message.warn(msg);
            }
          },
        });
      },
      onCancel() {
      },
    });
  };
  // 跳转
  handleNewPlan = (taskType) => {
    const { activeKey, functionKey, funcList } = this.props;
    const { functionName, workStandardId, workObjectType, areaCode } = funcList[`${activeKey}_${functionKey}`];
    this.resetFuc = false;
    this.props.dispatch({
      type: 'operationStandard/getOperationData',
      callback: (data) => {
        if (data && workStandardId) {
          const target = data.filter(item => item.gid === workStandardId)[0] || {};
          const workStandardName = target.workStandardName;
          const params = {
            action: 'add',
            taskType,
            workObjectType,
            areaCode,
            functionGroup,
            functionName,
            functionKey,
            workStandardId,
            workStandardName };
          const path = {
            data: params,
            pathname: functionGroup === 'prev_maintain' ? '/equipment/plan-add' : '/ichmanager/plan-add',
            historyPageName: functionGroup === 'prev_maintain' ? '/equipment/pre-mainten' : 'ichAccount-planManager',
          };
          this.props.dispatch(routerRedux.push(path));
        }
      },
    });
  }
  render() {
    const {planTotal, paginations} = this.props;
    // 表格分页
    const pagination = {
      current: paginations.current,
      pageSize: paginations.pageSize,
      total: planTotal || 0,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (totals) => {
        const { current, pageSize } = this.props.paginations;
        return (<div className={styles.pagination}>
          共 {totals} 条记录 第{current}/{Math.ceil(totals / pageSize)}页
        </div>);
      },
    };
    const configProps = {
      functionGroup,
      pagination,
      queryPrePlanList: this.queryPrePlanList,
      onTabsChange: this.onTabsChange,
      onFunctionChange: this.onFunctionChange,
      handleTableChange: this.handleTableChange,
      handleSearchParamsChange: this.handleSearchParamsChange,
      operationPlan: this.operationPlan,
      planHandler: this.planHandler,
      rowClassName: this.rowClassName,
      handleClick: this.handleClick,
      handleNewPlan: this.handleNewPlan,
    };
    return (
      <WrapperComonent
        {...this.props}
        {...configProps}
      />);
  }
};
export default WithFunctionGroup;
