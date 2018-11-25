import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { Modal, Button, DatePicker, message, Tooltip, Table } from 'antd';
import { getCurrTk } from '../../../utils/utils.js';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel';
import styles from './thirdWorkOrderList.less';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal';

const { RangePicker } = DatePicker;

const defaultParams = {
  woState: '', // 工单状态
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
  checkNum: state.thirdWorkOrder.checkNum,
  stationData: state.patrolPlanList.stationData,
}))

export default class workOrderOverview extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    let params = this.tool.params ? { ...this.tool.params } : { ...defaultParams };
    this.map = null;
    this.geom = {}; // 记录上报坐标信息
    this.processinstanceKey = '';
    this.eventtype = ''; // 记录当前工单对应的eventtype
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      // 参数
      params: { ...params },
      isModalFlag: true, // 地图返回时是否让显示modal
      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      showSearchTable: true, // 是否显示数据列表
      ModelData: {}, // 相关按钮内的值
      loading: false,
      modalDisplay: false,
      filters: [],
    };
  }

  componentDidMount() {
    if (this.tool.boolea) {
      this.routerMap();
      this.tool.boolea = false;
    } else {
      this.getEventTypeData();
      this.getstationData();
      this.getWorkOrderData();
    }
  }
  routerMap = () => {
    this.setState({
      isModalFlag: false,
      showSearchTable: false,
      isShowMap: true,
    });
  }

  componentWillUnmount() {

  }

  // 事件类型数据字典
  getEventTypeData = () => {
    this.props.dispatch({
      type: 'event/getEventTypeData',
      payload: { type: 'gw' },
    });
  };

  filterEventTypeData = (datas) => {
    let stationConfigs = [{ name: '全部', value: '' }];
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
      stationConfigs = [{ name: '全部', value: '' }];
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
      payload: { stationType: 'A' },
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
  getWorkOrderData = (f, type, callback) => {
    let formId = '2020';
    let formName = 'patrolTgList';
    const filters = this.state.filters;

    let data = {
      formid: formId,
      funName: formName,
      processKey: 'patrolTG',
      where: { whereSql: '1=1' },
    };
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
      data.where.whereSql += ` and tg.create_time >= '${stime}'`;
    }
    if (params.etime) {
      const etime = `${params.etime.format('YYYY-MM-DD')} 23:59:59`;
      data.where.whereSql += ` and tg.create_time <= '${etime}'`;
    }
    if (params.condition) {
      data.where.whereSql += ` and (reporter like '%${params.condition}%'`
        + ` or address like '%${params.condition}%' or base_code like '%${params.condition}')`;
    }
    if (params.woState) {
      data.woState = params.woState;
    }
    if (type !== 'all') {
      if (params.pageno) {
        data.pageNum = params.pageno;
      }
      if (params.pagesize) {
        data.pageSize = params.pagesize;
      }
    } else {
      data.isReturnListOnly = true;
      data.pageNum = 0;
      data.pageSize = 0;
    }

    data.where = JSON.stringify(data.where);
    if (f === 'excel') {
      data.token = getCurrTk();
      data.f = 'excel';
      let url = window.location.origin + `/proxy/fieldwork/query/getWorkorderListByFunName?${stringify(data)}`;
      window.open(url);
      return url;
    } else {
      data.f = 'json';
    }
    if (filters.length > 0) {
      data.queryWhere = `and sg_process IN (${filters.join(',')})`;
    }
    this.props.dispatch({
      type: 'thirdWorkOrder/getWorkorderList',
      queryType: type,
      payload: data,
      callback: callback,
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
          modalDisplay: true,
        });
      },
    });
  };

  getCopyWoFormData = (data) => {
    this.props.dispatch({
      type: 'thirdWorkOrder/getWorkorderFormData',
      payload: {
        processinstanceid: data.processinstanceid,
      },
      callback: (res) => {
        this.eventtype = res.eventtype;
        this.setState({
          ModelData: { taskId: 'copyWo', taskName: '工单复制' },
          showModal: true,
          modalDisplay: true,
        });
      },
    });
  }

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
          ModelData: { taskName: '新建', taskId: 'newWo' },
          showModal: true,
          modalDisplay: true,
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
    paramsObj = { ...paramsObj, ...this.geom };

    let paramsAtt = this.refs['formRef_1'].getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({ name: key, value: paramsAtt[key] });
      }
    }
    this.setState({
      loading: true,
    });
    if (this.state.ModelData.taskId === 'newWo') {
      this.submitStartFormData(paramsObj, paramsAttArray);
    } else if (this.state.ModelData.taskId === 'copyWo') {
      this.reportEvent(paramsObj, paramsAttArray);
    } else {
      this.submitTaskFormData(paramsObj, paramsAttArray);
    }
  };

  submitStartFormData = (paramsObj, paramsAttArray) => {
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
  }

  submitTaskFormData = (paramsObj, paramsAttArray) => {
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
  }
  reportEvent = (paramsObj, paramsAttArray) => {
    this.props.dispatch({
      type: 'thirdWorkOrder/reportEventFormData',
      payload: {
        userid: this.props.user.gid,
        user: this.props.user.trueName,
        properties: JSON.stringify(paramsObj),
        eventtype: this.eventtype,
      },
      callback: (res) => {
        if (paramsAttArray.length > 0) {
          this.props.dispatch({
            type: 'thirdWorkOrder/submitAttach',
            formData: paramsAttArray,
            attInfo: res.data,
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

  clearFormData = () => {
    this.setState({ showModal: false, modalDisplay: false, loading: false });
    this.getWorkOrderData();
    this.geom = {};
    this.props.dispatch({
      type: 'thirdWorkOrder/changeTaskFormData',
      payload: {
        params: [],
      },
    });
  };

  onClickGeomBtn = (name) => {
    this.map.getMapDisplay().clear();
    this.setState({
      modalDisplay: true,
      showModal: false,
      showSearchTable: false,
      isShowMap: true,
    });
  };

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      showModal: true,
      modalDisplay: true,
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
  onChangeEventState = (valueObj) => {
    let params = this.state.params;
    params.woState = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getWorkOrderData();
  };

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

  showMapPoint = () => {
    this.map.getMapDisplay().clear();
    this.setState({
      isModalFlag: false,
      showSearchTable: false,
      isShowMap: true,
    });
    // this.getWorkOrderData('json', 'all', (data) => {
    //   console.log(data);
    //   console.log(data);
    //   console.log(data);
    //   for (let i = 0; i < data.length; i++) {
    //     let point = [];
    //     const addressGeom = data[i].address_geom;
    //     if (addressGeom) {
    //       point = addressGeom.split(',');
    //     }
    //     let srcImg = '../../images/map/graphic/construction.png';
    //     if (data[i].control_level && data[i].control_level == '11050001') {
    //       srcImg = '../../images/map/graphic/construction2.png';
    //     }
    //     if (point.length > 1 && point[0] > 0 && point[1] > 0) {
    //       let param = {
    //         id: `wo_point${i}`,
    //         layerId: 'wo_point',
    //         layerIndex: 15,
    //         src: srcImg,
    //         width: 30,
    //         height: 30,
    //         angle: 0,
    //         x: point[0],
    //         y: point[1],
    //         attr: { ...data[i] },
    //         click: this.pointClick,
    //       };
    //       this.map.getMapDisplay().image(param);
    //     }
    //   }
    // });
  }
  pointClick = (e) => {
    const content = [];
    for (const [key, value] of Object.entries(e.attributes)) {
      for (const elem of this.props.fieldList.values()) {
        if (elem.name === key && elem.visible) {
          const con = {};
          con.name = elem.alias;
          con.value = value;
          content.push(con);
        }
      }
    }
    let link = {
      param: JSON.stringify({ eventid: e.attributes.id }),
      linkText: '工单详情',
      click: (params) => {
        this.LinkOrderList(params);
      },
    };
    const param = {
      x: e.geometry.x,
      y: e.geometry.y,
      info: {
        title: '第三方施工属性',
        content,
        link,
      },
      size: {
        height: 200,
        width: 300,
      },
      onCloseHandle: () => null,
    };
    this.map.popup(param);
  }
  LinkOrderList = (params) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      // processInstanceId: record.processInstancedId,
      // formid: record.formid,
      workOrderNum: params.eventid,
      // params: this.state.params,
      historyPageName: '/workOrder-list',
    };
    this.props.dispatch(routerRedux.push(path));
  }
  // 重置
  reset = () => {
    let params = this.state.params;
    params.woState = '';
    params.eventType = '';
    params.department = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    }, () => {
      this.getWorkOrderData();
    });
  };

  getMap = () => {
    return this.map;
  }

  backToForm = () => {
    this.setState({
      showModal: this.state.isModalFlag,
      showSearchTable: true,
      isShowMap: false,
      modalDisplay: this.state.isModalFlag,
    }, () => {
      this.setState({
        isModalFlag: true,
      });
    });
  }

  getFields = () => {
    const that = this;
    const result = [];
    if (this.props.fieldList.length === 0) {
      return result;
    }
    this.props.fieldList.forEach((item, index) => {
      if (item.visible == 1) {
        let width = 150;
        const params = {
          key: item.name ? item.name : index,
          fixed: index >= 1 ? '' : 'left',
          width,
          title: item.alias,
          dataIndex: item.name ? item.name : index,
        };
        if (item.name === 'sg_process') {
          const arr = [];
          for (const elem of item.selectValues.values()) {
            arr.push({
              text: elem.alias,
              value: elem.name,
            });
          }
          params.filters = arr;
        }
        result.push(params);
      }
    });
    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => (
        <span
          key={i}
          style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
          onClick={that.getTaskFormData.bind(that, btn)}
        >
          {btn.taskName}
        </span>
      ));
      if (this.props.user.ecode === '0611') {
        btns.push(
          <span
            key="copyWo"
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.getCopyWoFormData.bind(that, dd)}
          >工单复制</span>
        );
      }
      return (<span style={{ float: 'left' }}>
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
      { name: '全部', value: '', more: this.props.checkNum.allCount || 0, showDot: true },
      // {name: '我的代办', value: '0', more: this.props.checkNum.hasFinishCount|| 0, showDot: true},
      { name: '待处理', value: 'waitDeal', more: this.props.checkNum.noFinishCount || 0, showDot: true },
      { name: '已处理', value: 'hasDeal', more: this.props.checkNum.hasFinishCount || 0, showDot: true },
      { name: '超期', value: 'overtime', more: this.props.checkNum.overCount || 0, showDot: true }];

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/地址/工单编号',
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
        // if (pageSize === undefined) {
        //   return;
        // }
        // let params = that.state.params;
        // params.pageno = page;
        // params.pagesize = pageSize;
        // that.setState({
        //   params: params,
        // }, () => {
        //   that.getWorkOrderData();
        // });
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
        return <div style={{ marginRight: this.width }}>共 {total} 条数据</div>;
      },
    };

    return (
      <PageHeaderLayout>
        <div style={{ width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)' }}>
          {this.state.showSearchTable ?
            <div>
              <SelectPanel
                fieldName="工单状态"
                value={this.state.params.woState}
                dataType="ddl"
                showMoreInfo={true}
                data={eventStateData}
                onclick={this.onChangeEventState}
              />
              <div style={{ height: '40px' }}>
                <div style={{ float: 'left' }}>
                  <span style={{ marginRight: '15px' }}>上报时间:</span>
                  <RangePicker
                    style={{ width: 235, marginTop: 2 }}
                    value={[this.state.params.stime, this.state.params.etime]}
                    onChange={this.onChangeTime}
                  />
                </div>
                <div style={{ float: 'left', marginLeft: '20px' }}>
                  <SearchPanel field={departmentConfig} onclick={this.onChangeDepartment} />
                </div>
                <div style={{ float: 'left', marginLeft: '20px' }}>
                  <SearchPanel ref="searchpanel" field={queryData} onclick={this.onChangeCondition} />
                </div>
                <Button type="primary" style={{ marginLeft: '20px' }} onClick={this.getWorkOrderData.bind(this)}>查询</Button>
                <Button style={{ marginLeft: '20px' }} onClick={this.reset.bind(this)}>重置</Button>
              </div>
              <div>
                <Button type="primary" style={{ marginLeft: '10px' }} onClick={this.reportEventFormData.bind(this)}>新增第三方施工</Button>
                <Button type="primary" style={{ marginLeft: '20px' }} onClick={this.getWorkOrderData.bind(this, 'excel')}>导出</Button>
                <Button type="primary" style={{ marginLeft: '20px' }} onClick={this.showMapPoint.bind(this)}>地图展示</Button>
              </div>
              <Table
                rowKey={(record) => record.processinstanceid}
                dataSource={this.props.workOrderList}
                columns={columns}
                pagination={pagination}
                scroll={{ x: (columns.length * 150 + 50) }}
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
                onChange={(page, filters, sorter) => {
                  let params = that.state.params;
                  params.pageno = page.current;
                  params.pagesize = page.pageSize;
                  that.setState({
                    params,
                    filters: filters.sg_process || [],
                  }, () => {
                    that.getWorkOrderData();
                  });
                }}
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
            <div style={{ width: '100%', height: '35px', paddingTop: '2px' }}>
              <Button onClick={this.backToForm.bind(this, )}>返回</Button>
            </div>
            <EcityMap
              mapId="workOrderOverviewShow"
              onMapLoad={(aMap) => {
                this.map = aMap;
              }}
            />
          </div>
          {this.state.modalDisplay ? <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName="web"
            footer={null}
            // onOk={this.handleOk}
            title={this.state.ModelData.taskName}
          >
            <div style={{ display: 'block' }}>
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
            <div style={{ height: '30px', marginTop: '25px' }}>
              <Button
                style={{ float: 'right', marginLeft: '15px', marginRight: '30px' }}
                onClick={this.handleCancel.bind(this)}
              >取消</Button>
              <Button
                type="primary"
                style={{ float: 'right' }}
                loading={this.state.loading}
                onClick={this.handleOk.bind(this)}
              >确定</Button>
            </div>
          </Modal> : null
          }
        </div>
      </PageHeaderLayout>
    );
  }
}

