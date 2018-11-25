import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Modal, Button, DatePicker, message, Tooltip, Table} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel';
import styles from './index.less';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal';

const {RangePicker} = DatePicker;

const defaultParams = {
  // eventState: '', // 事件状态
  eventType: '', // 事件类型
  department: '', // 上报部门
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  pageno: 1, //
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  fieldList: state.thirdWorkOrder.fieldList,
  workOrderList: state.thirdWorkOrder.workOrderList,
  workOrderTotal: state.thirdWorkOrder.workOrderTotal,
  eventTypeData: state.event.eventTypeData,
  taskFormData: state.thirdWorkOrder.taskFormData, // 模态框表单配置信息
  // checkNum: state.event.checkNum,
  stationData: state.patrolPlanList.stationData,
}))

export default class workOrderOverview extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    let params = this.tool.params ? {...this.tool.params} : {...defaultParams};
    this.map = null;
    this.geom = {}; // 记录上报坐标信息
    this.processinstanceKey = '';
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      checkNum: {allNum: 0, notCompleteNum: 0, completeNum: 0, overdueNum: 0}, // 事件数
      // 参数
      params: {...params},

      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      showSearchTable: true, // 是否显示数据列表
      ModelData: {}, // 相关按钮内的值
      loading: false,
    };
  }

  componentDidMount() {
    this.getEventTypeData();
    this.getstationData();
    this.getWorkOrderData();
  }

  componentWillUnmount() {

  }

  // 事件类型数据字典
  getEventTypeData = () => {
    this.props.dispatch({
      type: 'event/getEventTypeData',
      payload: {type: 'gw'},
    });
  };

  filterEventTypeData = (datas) => {
    let stationConfigs = [{name: '全部', value: ''}];
    if (!datas) {
      return stationConfigs;
    }
    for (let i = 0; i < datas.length; i += 1) {
      if (datas[i].eventtype === 3) {
        continue;
      }
      stationConfigs.push({
        name: datas[i].eventname,
        value: `${datas[i].eventtype}`,
      });
    }
    return stationConfigs;
  };

  filterstationData = (datas) => {
    let stationConfigs = [];
    if (!datas) {
      return stationConfigs;
    }
    if (datas.length !== 1) {
      stationConfigs = [{name: '全部', value: ''}];
    }
    for (let i = 0; i < datas.length; i += 1) {
      stationConfigs.push({
        name: datas[i].locName,
        value: `${datas[i].locCode}`,
      });
    }
    return stationConfigs;
  };

  // 上报部门数据字典
  getstationData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload: {stationType: 'A'},
      callback: (res) => {
        let params = this.state.params;
        params.department = res[0].value;
        this.setState({
            params: params,
        });
        this.getWorkOrderData();
      },
    });
  };

  // 获取事件数据
  getWorkOrderData = () => {
    let formId = '2020';
    let formName = 'patrolTgList';

    let data = {formid: formId, funName: formName, where:{ whereSql: '1=1' }};
    let params = this.state.params;
    if (this.props.user) {
      data.userid = this.props.user.gid;
      data.ecode = this.props.user.ecode;
    }
    if (params.department) {
      data.where.whereSql += ` and loc_code = '${params.department}'`;
    }
    if (params.stime) {
      const stime = `${params.stime.format('YYYY-MM-DD')} 00:00:00`;
      data.where.whereSql += ` and report_time >= '${stime}'`;
    }
    if (params.etime) {
      const etime = `${params.etime.format('YYYY-MM-DD')} 23:59:59`;
      data.where.whereSql += ` and report_time <= '${etime}'`;
    }
    if (params.pageno) {
      data.pageNum = params.pageno;
    }
    if (params.pagesize) {
      data.pageSize = params.pagesize;
    }

    data.where = JSON.stringify(data.where);
    this.props.dispatch({
      type: 'thirdWorkOrder/getWorkorderList',
      payload: data,
    });
  };

  getTaskFormData = (data) => {
    this.props.dispatch({
      type: 'thirdWorkOrder/getTaskFormData',
      payload: {
        taskId: data.taskId,
        taskType: data.taskType,
        taskCode: '',
        userid: this.props.user.gid,
      },
      callback: () => {
        this.setState({
          ModelData: data,
          showModal: true,
        });
      },
    });
  };

  handleCancel = () => {
    this.clearFormData();
  };

  reportEventFormData = () => {
    this.props.history.push('/query/report-eventform?eventtype=0');
  }

  getStartFormData = () => {
    this.props.dispatch({
      type: 'thirdWorkOrder/getStartFormData',
      payload: {
        processDefinitionKey: 'patrolTG',
        // ecode: this.props.user.ecode,
        userid: this.props.user.gid,
      },
      callback: (res) => {
        this.processinstanceKey = res.processDefinitionId;
        this.setState({
          ModelData: {taskName: '新建', taskId: 'newWo'},
          showModal: true,
        });
      },
    });
  }

  handleOk = () => {
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs['formRef_1'].validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    let params = this.refs['formRef_1'].getValues();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }
    paramsObj = {...paramsObj, ...this.geom};

    let paramsAtt = this.refs['formRef_1'].getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({name: key, value: paramsAtt[key]});
      }
    }
    this.setState({
      loading: true,
    });
    if (this.state.ModelData.taskId === 'newWo') {
      this.props.dispatch({
        type: 'thirdWorkOrder/submitStartFormData',
        payload: {
          processDefinitionId: this.processinstanceKey,
          userid: this.props.user.gid,
          user: this.props.user.trueName,
          properties: JSON.stringify(paramsObj),
        },
        callback: (res) => {
          if (paramsAttArray.length > 0) {
            this.props.dispatch({
              type: 'thirdWorkOrder/submitAttach',
              formData: paramsAttArray,
              attInfo: res,
              user: this.props.user,
              callback: (resAtt) => {
                if (resAtt) {
                  message.info('提交成功');
                  this.clearFormData();
                }
              },
            });
          } else {
            message.info('提交成功');
            this.clearFormData();
          }
        },
      });
    }else{
      this.props.dispatch({
        type: 'thirdWorkOrder/submitTaskFormData',
        payload: {
          taskId: this.state.ModelData.taskId,
          taskType: this.state.ModelData.taskType,
          taskCode: '',
          userid: this.props.user.gid,
          user: this.props.user.trueName,
          properties: JSON.stringify(paramsObj),
          isSave: 0,
        },
        callback: (res) => {
          if (paramsAttArray.length > 0) {
            this.props.dispatch({
              type: 'thirdWorkOrder' +
              '' +
              '' +
              '/submitAttach',
              formData: paramsAttArray,
              attInfo: res,
              user: this.props.user,
              callback: (resAtt) => {
                if (resAtt) {
                  message.info('提交成功');
                  this.clearFormData();
                }
              },
            });
          } else {
            message.info('提交成功');
            this.clearFormData();
          }
        },
      });
    }
  };

  clearFormData = () => {
    this.setState({showModal: false, loading: false});
    this.getWorkOrderData();
    this.geom = {};
    this.props.dispatch({
      type: 'workOrder/changeTaskFormData',
      payload: {
        params: [],
      },
    });
  };

  onClickGeomBtn = (name) => {
    this.setState({
      showModal: false,
      showSearchTable: false,
      isShowMap: true,
    });
  };

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      showModal: true,
      showSearchTable: true,
      isShowMap: false,
    });
  }

  // onChangeIsShowMap = () => {
  //   this.setState({
  //     isShowMap: !this.state.isShowMap,
  //   });
  // }


  // 事件状态改变
  // onChangeEventState = (valueObj) => {
  //   let params = this.state.params;
  //   params.eventState = valueObj.value;
  //   params.pageno = defaultParams.pageno;
  //   params.pagesize = defaultParams.pagesize;
  //   this.setState({
  //     params: params,
  //   });
  //   this.getWorkOrderData();
  // };

  // 事件类型改变
  onChangeEventType = (searchObj) => {
    let params = this.state.params;
    params.eventType = searchObj.eventType;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  // 上报部门改变
  onChangeDepartment = (searchObj) => {
    let params = this.state.params;
    params.department = searchObj.department;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  // 上报时间改变
  onChangeTime = (value) => {
    let params = this.state.params;
    params.stime = value[0];
    params.etime = value[1];
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  // 查询改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.condition;
    this.setState({
      params: params,
    });
  };

  // 查询
  search = () => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  // 重置
  reset = () => {
    let params = this.state.params;
    // params.eventState = '';
    params.eventType = '';
    params.department = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

  getMap = () => {
    return this.map;
  }

  backToForm = () => {
    this.setState({
      showModal: true,
      showSearchTable: true,
      isShowMap: false,
    });
  }

  getFields = () => {
    const that = this;
    const result = [];
    // if (this.props.fieldList.length === 0) {
    //   return result;
    // }

    const fieldList = [
      {name: '工单编号', alise: 'base_code', width: 150},
      // {name: '类型', alise: 'type'},
      {name: '地址', alise: 'address', width: 300},
      {name: '创建人', alise: 'reporter', width: 150},
      {name: '创建时间', alise: 'create_time', width: 170},
      {name: '责任人', alise: 'accept_userid', width: 150},
      {name: '最新更新时间', alise: 'base_updatetime', width: 170},
      {name: '工单状态', alise: 'base_substate', width: 150},
    ]
    fieldList.forEach((item, index) => {
      const params = {
        key: item.alias ? item.alias : index,
        // fixed: index > 1 ? '' : 'left',
        width: item.width,
        title: item.name,
        dataIndex: item.alise,
      };
      result.push(params);
    });
    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => (
        <span
          key={i}
          style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getTaskFormData.bind(that, btn)}
        >
          {btn.taskName}
        </span>
      ));
      return (<span style={{float: 'left'}}>
        {btns}
      </span>);
    };
    result.push({
      key: 'opt',
      fixed: 'right',
      width: 270,
      title: '操作',
      dataIndex: 'opt',
      render: (index, record) => {
        return <span>{action(record)}</span>;
      },
    });
    return result;
  }

  render() {
    const that = this;
    const eventTypeData = this.filterEventTypeData(this.props.eventTypeData);
    // const stationData = this.filterstationData(this.props.stationData);
    // 事件状态配置
    const eventStateData = [
      {name: '全部', value: '', more: this.state.checkNum.allNum, showDot: true},
      {name: '我的代办', value: '1', more: this.state.checkNum.completeNum, showDot: true},
      {name: '待处理', value: '0', more: this.state.checkNum.notCompleteNum, showDot: true},
      {name: '超期', value: '2', more: this.state.checkNum.overdueNum, showDot: true},
      {name: '已处理', value: '3', more: this.state.checkNum.overdueNum, showDot: true}];

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '快速搜索',
      value: this.state.params.condition,
      placeholder: '上报人/处理人/处理环节',
      valueType: 'input',
      width: '220px',
    }];

    // 事件类型配置
    const eventTypeConfig = [{
      name: 'eventType',
      alias: '工单类型',
      valueType: 'ddl',
      value: this.state.params.eventType,
      selectValues: eventTypeData,
      width: '150px',
    }];

    // 处理人部门
    const eventDepartment = [{
      name: 'department',
      alias: '处理人部门',
      valueType: 'ddl',
      value: this.state.params.eventType,
      selectValues: eventTypeData,
      width: '150px',
    }];

    // 上报部门配置
    const departmentConfig = [{
      name: 'department',
      alias: '处理组织',
      valueType: 'ddl',
      value: this.state.params.department,
      selectValues: this.props.stationData,
      width: '150px',
    }];
    const columns = this.getFields();

    // 表格分页
    const pagination = {
      total: parseInt(that.props.workOrderTotal, 10),
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getWorkOrderData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getWorkOrderData();
      },
      showTotal: (total, pageInfo) => { // 设置显示一共几条数据
        return <div style={{marginRight: this.width}}>共 {total} 条数据</div>;
      },
    };

    return (
      <PageHeaderLayout>
        <div style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)'}}>
          {this.state.showSearchTable ?
            <div>
              <div style={{height: '40px', marginLeft: 14, marginBottom: 10}}>
                <SelectPanel
                  fieldName="处理状态"
                  value={this.state.params.eventState}
                  dataType="ddl"
                  showMoreInfo={true}
                  data={eventStateData}
                  onclick={this.onChangeEventState}
                />
              </div>
              <div style={{ height: '40px', marginLeft: 14, marginBottom: 10 }}>
                <div style={{ float: 'left', marginRight: '20px' }}>
                  <SearchPanel field={eventTypeConfig} onclick={this.onChangeDepartment} />
                </div>
                <div style={{ float: 'left', marginRight: '20px' }}>
                  <SearchPanel ref="searchpanel" field={queryData} onclick={this.onChangeCondition} />
                </div>
                <Button type="primary" onClick={this.getWorkOrderData.bind(this)}>查询</Button>
                <Button style={{ marginLeft: '20px' }}>重置</Button>
              </div>
              <div style={{ height: '40px', marginBottom: 10}}>
                <div style={{ float: 'left', marginRight: '20px' }}>
                  <SearchPanel field={eventDepartment} onclick={this.onChangeDepartment} />
                </div>
                <div style={{ float: 'left' }}>
                  <span>上报时间:</span>
                  <RangePicker
                    style={{width: 220, marginTop: 2, marginLeft: 20}}
                    value={[this.state.params.stime, this.state.params.etime]}
                    onChange={this.onChangeTime}
                  />
                </div>
              </div>
              <Table
                rowKey={(record) => record.processinstanceid}
                dataSource={this.props.workOrderList}
                columns={columns}
                pagination={pagination}
                scroll={{ x: 1400 }}
                onRow={(record, index) => ({
                  onDoubleClick: () => {
                    let path = {
                      pathname: '/order/workOrder-list-detail',
                      processInstanceId: record.processinstanceid,
                      // formid: webcfg.woList.patrolTG.woFormId,
                      workOrderNum: record.base_patrol_id,
                      params: this.state.params,
                      historyPageName: '../third-workOrder-list',
                    };
                    this.props.dispatch(routerRedux.push(path));
                  },
                })}
              />
            </div> : null}
          <div style={{
            width: '100%',
            height: 'calc(100vh - 175px)',
            // position: 'fixed',
            // left: 0,
            // top: 0,
            display: this.state.isShowMap ? 'block' : 'none',
            // backgroundColor: '#fff',
            // zIndex: 10000
            }}
          >
            <div style={{width: '100%', height: '35px', paddingTop: '2px'}}>
              <Button onClick={this.backToForm}>返回</Button>
            </div>
            <EcityMap
              mapId="workOrderOverview"
              onMapLoad={(aMap) => {
              this.map = aMap;
              }}
            />
          </div>
          <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName="web"
            footer={null}
            // onOk={this.handleOk}
            title={this.state.ModelData.taskName}
          >
            <div style={{display: 'block'}}>
              <SubmitForm
                data={this.props.taskFormData.params}
                cascade={this.props.taskFormData.cascade}
                getMap={this.getMap}
                geomHandleClick={this.onClickGeomBtn.bind(this)}
                geomSelectedPoint={this.geomSelectedPoint.bind(this)}
                column={2}
                ref="formRef_1"
              />
            </div>
            <div style={{height: '30px', marginTop: '25px'}}>
              <Button
                style={{float: 'right', marginLeft: '15px', marginRight: '30px'}}
                onClick={this.handleCancel.bind(this)}
              >取消</Button>
              <Button
                type="primary"
                style={{float: 'right'}}
                loading={this.state.loading}
                onClick={this.handleOk.bind(this)}
              >确定</Button>
            </div>
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}

