import React, { Component } from 'react';
import {Tabs, message} from 'antd';
import { connect } from 'dva';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import History from './History';
import PlanForm from './PlanForm';
import styles from './index.less';

const TabPane = Tabs.TabPane;
@connect(({ device, login, operationStandard}) => ({
  stations: device.stations,
  cycleUnit: device.cycleUnit,
  user: login.user,
  taskData: device.taskData,
  taskList: device.taskList,
  taskPaginations: device.taskPaginations,
  detailinfo: device.detailinfo,
  rolesUser: device.rolesUser,
  areaData: device.areaData,
  cacheAreaData: device.cacheAreaData,
  userData: device.userData,
  functionData: device.functionData,
  stationList: device.stationList,
  stationData: device.stationData,
  activeKey: device.activeKey, // 计划tab页key
  functionKey: device.functionKey, // 作业类型key
  funcList: device.funcList, // 作业类型数组
  eqTypeData: operationStandard.eqTypeData,
  eqTableLoading: device.eqTableLoading,
}))
export default class PlanDetaileTab extends Component {
  constructor(props) {
    super(props);
    this.pathVariable = this.props.location;
    if (this.pathVariable.data) {
      localStorage.setItem('planList', JSON.stringify(this.pathVariable));
    } else {
      this.pathVariable = JSON.parse(localStorage.getItem('planList'));
    }
    this.state = {
      submitting: false,
      activeKey: '2',
      options: [],
      eqAreaData: [],
    };
    this.initParams();
  }
    preComponent=null;
    tabDisplay='inline-block';
    componentDidMount() {
      const { dispatch, functionData, eqTypeData} = this.props;
      // 获取设备设置条件
      if (!eqTypeData || eqTypeData.length === 0) {
        this.props.dispatch({
          type: 'operationStandard/getEqTypeData',
        });
      }
      // 所属站点
      dispatch({
        type: 'device/getStationListByType',
      });
      // 作业类型
      dispatch({
        type: 'operationStandard/queryOperaTypeList',
      });
      // 作业类型和类型分类
      if (!functionData || functionData.length === 0) {
        dispatch({
          type: 'device/getFunctionData',
          payload: { functionGroup: 'prev_maintain' },
        });
      }
    }
    // 初始化 获取区域数据
    initParams = () => {
      const { back, action} = this.pathVariable.data || {};
      if (back) {
        this.setState({activeKey: '3'});
      } else if (action === 'add') {
        this.setState({ activeKey: '2'});
        this.tabDisplay = 'none';
      }
    }
    // 根据任务id查任务详情
    lookHandler = (record) => {
      if (record.activitiCode && !record.processInstanceId) {
        this.props.dispatch(routerRedux.push(`/query/report-eventform?eventtype=${record.activitiCode}&taskId=${record.gid}`));
      }
      if (record.activitiCode && record.processInstanceId) {
        const {funcList, activeKey, functionKey} = this.props;
        const {formId} = funcList[`${activeKey}_${functionKey}`] || {};
        const path = {
          pathname: '/order/workOrder-list-detail',
          processInstanceId: record.processInstanceId,
          workOrderNum: record.workOrderCode,
          formid: formId,
          params: {taskId: record.gid},
        //  historyPageName: '/workOrder-list',
        };
        this.props.dispatch(routerRedux.push(path));
      }
      if (!record.activitiCode) {
        this.props.dispatch(routerRedux.push(`task-detaile?taskId=${record.gid}&formId=${record.formId}&action=${'edit'}&status=${record.status}`));
      }
    }
    handleBack =() => {
      this.props.dispatch(routerRedux.push(this.pathVariable.historyPageName));
    }
    handleTabChange = (key) => {
      this.setState({activeKey: key });
      if (key === '1') {
        this.handleBack();
      }
    }
    render() {
      const {funcList, functionKey, activeKey} = this.props;
      const { activitiCode} = funcList[`${activeKey}_${functionKey}`] || {};
      const { planId} = this.pathVariable.data || {};
      return (
        <PageHeaderLayout>
          <Tabs
            activeKey={this.state.activeKey}
            tabBarStyle={{ display: this.tabDisplay}}
            onChange={this.handleTabChange}
          >
            <TabPane
              tab="列表"
              key="1"
            />
            <TabPane
              tab="计划性维护计划"
              key="2"
            >
              <div className={styles.body}>
                <PlanForm
                  wrappedComponentRef={preComponent => {
                                this.preComponent = preComponent;
                            }}
                  {...this.props}
                  submitting={this.state.submitting}
                  options={this.state.options}
                  eqAreaData={this.state.eqAreaData}
                  handleBack={this.handleBack}
                />
              </div>
            </TabPane>
            <TabPane
              tab="历史记录"
              key="3"
            >
              <History
                {...this.props}
                planId={planId}
                lookHandler={this.lookHandler}
                activitiCode={activitiCode}
              />
            </TabPane>
          </Tabs>
        </PageHeaderLayout>
      );
    }
}

