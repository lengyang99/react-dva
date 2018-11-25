import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, message, Tabs, Icon, Spin } from 'antd';
import { isMoment } from 'moment';
import { stringify } from 'qs';
import update from 'immutability-helper';
import { routerRedux } from 'dva/router';
import SearchPanel from './SearchPanel';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import EditModal from './EditModal';
import TableTask from './TableTask';
import WorkListModal from './WorkListModal';
import { getCurrTk } from '../../../utils/utils.js';

const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;
const defaultSearchParams = {
  pageno: 1,
  pagesize: 10,
  stationId: null, // 站点
  others: null, // 关键字
  workOrderStatus: null,
  status: null,
  createTime1: null, // 创建开始时间
  createTime2: null, // 创建结束时间
  startTime: null, // 要求到位时间
  endTime: null,
  activitiCode: null,
};
@connect(({ device, workOrder, login }) => ({
  taskPaginations: device.taskPaginations, // 任务 分页
  taskData: device.taskData, // 任务列表
  workStatus: device.workStatus, // 工单状态
  functionData: device.functionData, // tab页
  stationData: device.stationData, // 一级站点列表
  activeKey: device.activeKey, // 计划tab页key
  functionKey: device.functionKey, // 作业类型key
  funcList: device.funcList, // 作业类型数组
  userInfo: device.userInfo, // 企业下用户信息
  searchTaskParams: device.searchTaskParams, // 搜索條件
  taskFormData: workOrder.taskFormData, // 工单表单数据
  rowIndex: device.rowIndex,
  user: login.user,
  funs: login.funs,
}))
export default class TaskPandect extends Component {
  constructor(props) {
    super(props);
    this.isGsh = props.location.pathname === '/ichmanager/ichAccount-taskManager';
    let sendBtn = false;
    for (let i = 0; i < this.props.funs.length; i++) {
      if (this.props.funs[i].code === 'planManageAssignee') {
        sendBtn = true;
        break;
      }
    }
    this.state = {
      sendBtn,
      record: { action: 'edit' },
      selectedRows: {},
      selectedRowKeys: [],
      taskIds: [],
      downLoading: false,
    };
  }
  resetFuc = true;
  form = null;
  form2 = null;
  componentDidMount() {
    const { functionKey, functionData } = this.props;
    if (!this.props.stationData || this.props.stationData.length === 0) {
      this.props.dispatch({
        type: 'device/getStationListByType',
      });
    }
    // 根据ecode查用户列表
    this.props.dispatch({
      type: 'device/getStationUserByEcode',
    });
    if (!functionData || functionData.length === 0) {
      this.props.dispatch({
        type: 'device/getFunctionData',
        payload: { functionGroup: this.isGsh ? 'household' : 'prev_maintain' },
        callback: (data) => {
          if (data && data.length !== 0) {
            const funcList = data[0].children;
            const funcKey = funcList && funcList.length !== 0 ? funcList[0].functionKey : null;
            if (funcKey) {
              this.queryTasks({functionKey: funcKey });
            }
          }
        },
      });
    } else if (functionKey) {
      this.queryTasks();
    }
  }
  componentWillUnmount() {
    if (this.resetFuc) {
      this.onChangeDataByURL([], 'functionDataSave');
      this.onChangeDataByURL(defaultSearchParams, 'searchTaskParamsSave');
      this.onChangeDataByURL(null, 'rowIndexSave');
    }
  }
  // 查询任务列表
  queryTasks(params = {}) {
    const newParams = update(this.props.searchTaskParams,
      {$merge: {pageno: 1, activitiCode: null, workOrderStatus: null, ...params}});
    this.props.dispatch({
      type: 'device/queryTasks',
      payload: newParams,
    });
  }
  // 批量编辑
  handleEditTask = (action) => {
    if (this.state.selectedRowKeys.length === 0) {
      message.warn(`请先勾选所需要${action}的任务`);
      return;
    }
    const newSelRows = { ...this.state.selectedRows };
    const taskIds = [];
    const selectedRows = this.getSelecedRows(newSelRows);
    selectedRows.forEach(item => {
      taskIds.push(item.gid);
    });
    if (action === '删除') {
      const that = this;
      confirm({
        title: '是否批量删除任务?',
        onOk() {
          that.props.dispatch({
            type: 'device/delTasks',
            payload: { taskIds: taskIds.toString() },
            callback: ({ msg, success }) => {
              if (success) {
                that.queryTasks();
                that.setState({ selectedRowKeys: [], selectedRows: {} });
                message.success(msg);
              } else {
                message.warn(msg);
              }
            },
          });
        },
        onCancel() {
        },
      });
    }
    if (this.form && action === '编辑') {
      this.setState({ taskIds });
      this.form.showModal();
    }
  }
  onSelectChange = ({ selectedRowKeys2, newSelRows }) => {
    const eqCodes = [];
    const selectedRows = this.getSelecedRows(newSelRows);
    selectedRows.forEach(item => {
      if (item.eqList && item.eqList.length !== 0) {
        item.eqList.forEach(item2 => {
          eqCodes.push(item2.eqCode);
        });
      }
    });
    const gidList = { action: 'edit', eqCodes: eqCodes.toString() };
    this.setState({ selectedRowKeys: selectedRowKeys2, selectedRows: newSelRows, record: gidList });
  }
  getSelecedRows = (selRows) => {
    let selectEq = [];
    const data = Object.values(selRows);
    (data || []).forEach(item => {
      selectEq = [...new Set([...selectEq, ...item])];
    });
    return selectEq;
  }
  // tab页切换
  onTabsChange = (activeKey) => {
    const { functionData } = this.props;
    const target = (functionData || []).filter(item => (item.functionKey === activeKey))[0];
    if (target) {
      const functionKey = target.children && target.children.length !== 0 ? target.children[0].functionKey : null;
      const activitiCode = target.children && target.children.length !== 0 ? target.children[0].activitiCode : null;
      this.onChangeDataByURL(functionKey, 'functionKeySave');
      this.onChangeDataByURL(activeKey, 'activeKeySave');
      if (functionKey) {
        this.queryTasks({functionKey});
        if (activitiCode) {
          this.queryWorkStatus(activitiCode);
        }
      }
    }
  }
  // 作业类型切换
  onFunctionChange = (item) => {
    this.onChangeDataByURL(item.functionKey, 'functionKeySave');
    this.queryTasks({functionKey: item.functionKey});
    // 查询工单状态
    if (item.activitiCode) {
      this.queryWorkStatus(item.activitiCode);
    }
  }
  onChangeDataByURL = (params, url) => {
    this.props.dispatch({
      type: `device/${url}`,
      payload: params,
    });
  }
  // 查询工单状态
  queryWorkStatus = (type) => {
    this.props.dispatch({
      type: 'device/getWorkStatus',
      payload: { type },
    });
  }
  // 查询工单流程表单数据
  getTaskFormData = (data) => {
    this.props.dispatch({
      type: 'workOrder/getTaskFormData',
      payload: {
        taskId: data.taskId,
        taskType: data.taskType,
        taskCode: '',
        userid: this.props.user.gid,
      },
      callback: () => {
        if (this.form2) {
          this.form2.onChangeState(data);
        }
      },
    });
  };
  handleSubFormData = () => {
    const { taskIds } = this.state;
    this.form.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { endTime, assigneeIds } = values;
        const userIds = [];
        const userNames = [];
        const subData = [];
        (assigneeIds || []).forEach(item => {
          userIds.push(item.key);
          userNames.push(item.label);
        });
        (taskIds || []).forEach(item => {
          subData.push({
            taskId: item,
            endTime: isMoment(endTime) ? endTime.format('YYYY-MM-DD hh:mm:ss') : null,
            assigneeIds: assigneeIds ? userIds.toString() : '',
            assigneeNames: assigneeIds ? userNames.toString() : '',
          });
        });
        this.props.dispatch({
          type: 'device/editTasks',
          payload: subData,
          callback: (res) => {
            if (res.success) {
              this.queryTasks();
              this.setState({ selectedRowKeys: [] });
              this.form.showModal();
              message.success('批量编辑任务成功');
            } else {
              message.warn(res.msg);
            }
          },
        });
      }
    });
  }
  // 分页查询
  handleTableChange = (pagination) => {
    this.queryTasks({pageno: pagination.current, pagesize: pagination.pageSize});
  };
  // 模糊查询
  handleOnSearch = (type) => {
    if (type === 0) {
      this.queryTasks(defaultSearchParams);
    } else if (type === 1) {
      this.queryTasks();
    }
  }
  // 查看详情
  lookHandler = (record) => {
    this.resetFuc = false;
    if (record.activitiCode && !record.processInstanceId) {
      this.props.dispatch(routerRedux.push(`/query/report-eventform?eventtype=${record.activitiCode}&taskId=${record.gid}`));
    }
    if (record.activitiCode && record.processInstanceId) {
      const { funcList, activeKey, functionKey } = this.props;
      const { formId } = funcList[`${activeKey}_${functionKey}`] || {};
      const path = {
        pathname: '/order/workOrder-list-detail',
        processInstanceId: record.processInstanceId,
        workOrderNum: record.workOrderCode,
        formid: formId,
        params: { taskId: record.gid },
        //  historyPageName: '/workOrder-list',
      };
      this.props.dispatch(routerRedux.push(path));
    }
    if (!record.activitiCode) {
      const path = {
        data: {
          taskId: record.gid,
          action: 'edit',
        },
        pathname: this.isGsh ? '/ichmanager/task-detaile' : '/equipment/task-detaile',
        historyPageName: this.isGsh ? '/ichmanager/ichAccount-taskManager' : '/equipment/task-Pandect',
      };
      this.props.dispatch(routerRedux.push(path));
    }
  }
  // 任务导出
  exportTask = () => {
    const pageInfo = {
      pageno: 1,
      pagesize: this.props.taskPaginations.total,
    };
    let excelName = null;
    this.props.functionData.map((item) => {
      item.children.map((iitem) => {
        if (iitem.functionKey === this.props.functionKey) {
          excelName = iitem.functionName;
        }
      });
    });
    let taskType = null;
    const isOrder = this.props.taskData.length > 0 && this.props.taskData[0].activitiCode;
    if (!isOrder) {
      taskType = 1;
      excelName = `${excelName}任务统计表`;
    } else {
      taskType = 2;
      excelName = `${excelName}工单统计表`;
      message.warning('暂不支持工单数据导出');
      return;
    }
    this.loadingHandler(true);
    const url = `${window.location.origin}/proxy/task/exportTaskData?${stringify({ ...this.props.searchTaskParams, ...pageInfo, taskType, excelName, ecode: this.props.user.ecode, token: getCurrTk() })}`;
    const header = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
    location.href = url;
    return fetch(url, {
      method: 'GET',
      headers: header,
    }).then((response) => response.blob())
      .then((responseData) => {
        console.log('res:', url, responseData);
        if (responseData) {
          this.loadingHandler(false);
        }
      })
      .catch((err) => {
        console.log('err:', url, err);
      });
  }
  loadingHandler = (val) => {
    this.setState({ downLoading: val });
  };
  render() {
    const { taskPaginations: paginations, taskData, functionData, funcList, functionKey, activeKey } = this.props;
    const { activitiCode, workObjectType } = funcList[`${activeKey}_${functionKey}`] || {};
    const { record} = this.state;
    // 表格分页
    const pagination = {
      current: paginations.current,
      pageSize: paginations.pageSize,
      total: paginations.total,
      pageSizeOptions: ['10', '20', '30', '40'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (totals) => {
        const { current, pageSize } = paginations;
        return (<div className={styles.pagination}>
          共 {totals} 条记录 第{current}/{Math.ceil(totals / pageSize)}页
        </div>);
      },
    };
    const State = ({ datas, value, onChange }) => {
      const items = datas.map(item =>
        (<label
          className={styles['state-item']}
          style={{ color: item.functionKey === value ? '#1C8DF5' : 'default' }}
          onClick={() => { onChange(item); }}
          key={item.functionKey}
        >
          <span>{item.functionName}</span></label>));
      return (
        <div style={{ display: 'inline-block' }}>
          {items}
        </div>
      );
    };
    const pans = (functionData || []).map(ele => (
      <TabPane tab={ele.functionName} key={ele.functionKey}>
        {ele.children && ele.children.length !== 0 ?
          <div>
            <div className={styles['field-block']}>
              <label><b>作业类型：</b></label>
              <State
                datas={ele.children}
                value={functionKey}
                onChange={(item) => {
                  this.onFunctionChange(item);
                }}
              />
            </div>
            <SearchPanel
              {...this.props}
              handleEditTask={(action) => { this.handleEditTask(action); }}
              activitiCode={activitiCode}
              isGsh={this.isGsh}
              workObjectType={workObjectType}
              queryTasks={(params) => { this.queryTasks(params); }}
              handleOnSearch={this.handleOnSearch}
              handleExportTask={this.exportTask}
            />
            <TableTask
              {...this.props}
              sendBtn={this.state.sendBtn}
              dataSource={taskData || []}
              lookHandler={this.lookHandler}
              activitiCode={activitiCode}
              pagination={pagination}
              isGsh={this.isGsh}
              workObjectType={workObjectType}
              getTaskFormData={this.getTaskFormData}
              handleTableChange={this.handleTableChange}
              selectedRowKeys={this.state.selectedRowKeys}
              selRows={this.state.selectedRows}
              onSelectChange={this.onSelectChange}
            />
          </div> : <div className={styles.noData}>
            <Icon type="frown-o" />
            暂无数据
          </div>}
      </TabPane>));
    return (
      <PageHeaderLayout>
        <Tabs
          activeKey={activeKey}
          onChange={(key) => { this.onTabsChange(key); }}
        >
          {pans}
        </Tabs>
        <EditModal record={record} userInfo={this.props.userInfo} handleOk={() => { this.handleSubFormData(); }} resetRecord={this.resetRecord} wrappedComponentRef={ref => { this.form = ref; }} />
        <WorkListModal
          searchTaskParams={this.props.searchTaskParams}
          taskFormData={this.props.taskFormData}
          queryTasks={(params) => { this.queryTasks(params); }}
          dispatch={this.props.dispatch}
          user={this.props.user}
          ref={ref => { this.form2 = ref; }}
        />
        <div className={styles.loading} style={{ display: this.state.downLoading ? 'block' : 'none' }}>
          <Spin size="large" />
        </div>
      </PageHeaderLayout>
    );
  }
}
