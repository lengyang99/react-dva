import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Modal, Button, DatePicker, message, Tooltip, Table, Menu, Dropdown, Icon } from 'antd';

import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SearchTablePanel from '../../commonTool/SearchTablePanel/SearchTablePanel';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal.js';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import EcityMap from '../../../components/Map/EcityMap';
import styles from './eventOverview.less';

const { RangePicker } = DatePicker;
const confirm = Modal.confirm;

const defaultParams = {
  eventState: '', // 事件状态
  eventType: '', // 事件类型
  department: '', // 上报部门
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  eventTotal: state.event.eventTotal,
  eventData: state.event.eventData,
  eventTypeData: state.event.eventTypeData,
  checkNum: state.event.checkNum,
  stationData: state.patrolPlanList.stationData,
  startFormData: state.event.startFormData,
}))

export default class eventOverview extends React.Component {
  constructor(props) {
    super(props);
    this.tool = this.props.location;
    this.map = null;
    let params = this.tool.params ? { ...this.tool.params } : { ...defaultParams };
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      // 参数
      params: { ...params },
      // 状态值
      isShowStation: true,
      showSearchTable: true, // 是否显示搜索数据页面
      showModal: false, // 是否展示模态框
      showModalFrame: false, // 是否移除表单
      isShowMap: false, // 是否显示地图
      ModelData: {}, // 表单处理按钮内的值
      loading: false,
    };
  }

  componentDidMount() {
    this.getEventTypeData();
    this.getstationData();
    this.getEventData();
  }

  componentWillUnmount() {

  }

  // 事件类型数据字典
  getEventTypeData = () => {
    this.props.dispatch({
      type: 'event/getEventTypeData',
      payload: { type: 'gw' },
    });
  }

  filterEventTypeData = (datas) => {
    let stationConfigs = [{ name: '全部', value: '' }];
    if (!datas) {
      return stationConfigs;
    }
    for (let i = 0; i < datas.length; i += 1) {
      if (datas[i].eventtype === '0' || datas[i].eventtype === 0
        || datas[i].eventtype === '4' || datas[i].eventtype === 4) { // 暂时去除第三方施工和管网保压事件
        continue;
      }
      stationConfigs.push({
        name: datas[i].eventname,
        value: `${datas[i].eventtype}`,
      });
    }
    return stationConfigs;
  }

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
  }

  // 上报部门数据字典
  getstationData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload: { stationType: 'A' },
      callback: (res) => {
        if (res.length === 0) {
          this.setState({
            isShowStation: false,
          });
        } else if (res.length === 1) {
          let params = this.state.params;
          params.department = res[0].value;
          this.setState({
            params: { ...params },
          });
          this.getEventData();
        }
      },
    });
  }

  // 获取事件数据
  getEventData = () => {
    let data = {};
    let params = this.state.params;
    if (this.props.user.gid) {
      data.userid = this.props.user.gid;
    }
    if (params.eventState) {
      data.eventstate = params.eventState;
    }
    if (params.eventType) {
      data.eventtype = params.eventType;
    }
    if (params.department) {
      data.stationcode = params.department;
    }
    if (params.stime && params.etime) {
      data.reporttime = `${params.stime.format('YYYY-MM-DD')} 00:00:00~${params.etime.format('YYYY-MM-DD')} 23:59:59`;
    }
    if (params.condition) {
      data.ext = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno) {
      data.pageno = params.pageno;
    }
    if (params.pagesize) {
      data.pagesize = params.pagesize;
    }
    data.evttype = 'gw';
    this.props.dispatch({
      type: 'event/getEventData',
      payload: data,
    });
  }

  startProcess = (data, btn) => {
    let that = this;
    if (btn) {
      this.props.dispatch({
        type: 'event/getStartFormData',
        payload: {
          processDefinitionKey: btn.key,
          userid: this.props.user.gid,
        },
        callback: () => {
          this.setState({
            ModelData: { ...btn, eventid: data.eventid, typeid: data.typeid },
            showModal: true,
            showModalFrame: true,
          });
        },
      });
    } else {
      this.props.dispatch({
        type: 'event/getCZStartFormData',
        payload: {
          processDefinitionKey: data.process,
          userid: this.props.user.gid,
          eventid: data.eventid,
        },
        callback: () => {
          this.setState({
            ModelData: data,
            showModal: true,
            showModalFrame: true,
          });
        },
      });
    }


    // confirm({
    //   title: '是否处理事件?',
    //   onOk() {
    //     that.props.dispatch({
    //       type: 'event/startProcess',
    //       payload: {
    //         processDefinitionKey: data.btn[0].key,
    //         userid: that.props.user.gid,
    //         user: that.props.user.username,
    //         properties: JSON.stringify({eventid: data.eventid, event_type: data.typeid}),
    //       },
    //       callback: (res) => {
    //         if (res.success) {
    //           message.success('处理成功');
    //           that.getEventData();
    //         }
    //       }
    //     });
    //   },
    //   onCancel() {
    //   }
    // });
  }

  // 获取GIS更新表单
  getGisForm = (obj, btn) => {
    let that = this;
    this.props.dispatch({
      type: 'event/getFormFields',
      payload: {
        formid: '100400080001',
      },
      callback: () => {
        this.setState({
          ModelData: { ...btn, eventid: obj.eventid, typeid: obj.typeid },
          showModal: true,
          showModalFrame: true,
        });
      },
    });
  }

  // 查询条件改变
  onChangeQuery = (type, valueObj) => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    switch (type) {
      case 'state': // 事件状态改变
        params.eventState = valueObj.value;
        break;
      case 'type': // 事件类型改变
        params.eventType = valueObj.eventType;
        break;
      case 'depart': // 上报部门改变
        params.department = valueObj.department;
        break;
      case 'time': // 上报时间改变
        params.stime = valueObj[0];
        params.etime = valueObj[1];
        break;
      default:
        break;
    }

    this.setState({
      params: { ...params },
    });
    this.getEventData();
  }

  // 查询改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.condition;
    this.setState({
      params: { ...params },
    });
  }

  closeEvent = (event) => {
    let that = this;
    confirm({
      title: '是否关闭事件?',
      onOk() {
        that.props.dispatch({
          type: 'event/closeEvent',
          payload: {
            eventid: event.eventid,
            status: '3',
          },
          callback: (res) => {
            if (res.success) {
              message.success('事件已关闭');
              that.getEventData();
            }
          },
        });
      },
      onCancel() {
      },
    });
  }

  onClickMaintainBack = (data, btn) => {
    let that = this;
    this.props.dispatch({
      type: 'event/getFormFields',
      payload: {
        formid: '3410',
      },
      callback: () => {
        this.setState({
          ModelData: { ...btn, eventid: data.eventid, typeid: data.typeid },
          showModal: true,
          showModalFrame: true,
        });
      },
    });
  }
  onClickReplace = (data, eventData) => {
    const url = `&eventid=${data.eventid}&eventtype=${data.typeid}&where=${encodeURI(JSON.stringify({ eventid: data.eventid }))}`;
    this.props.dispatch({
      type: 'event/getEventDetailData',
      payload: {
        eventtype: data.typeid,
        eventid: data.eventid,
        plat: 'web',
        btn: true,
      },
      urlExtra: url,
      callback: (res) => {
        // btn=1 来区分 首页的户内置换 碰接工单的跳转 和 这里的跳转， 首页的跳转不用 查询详情带值
        this.props.history.push(`/query/report-eventform?eventtype=${eventData}&eventid=${data.eventid}`);
      },
    });
  }

  // 重置
  reset = () => {
    let params = this.state.params;
    params.eventState = '';
    params.eventType = '';
    params.department = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: { ...params },
    });
    this.getEventData();
  }

  handleCancel = () => {
    this.clearFormData();
  }

  clearFormData = () => {
    this.setState({ showModal: false, showModalFrame: false });
    this.getEventData();
    this.geom = {};
    this.props.dispatch({
      type: 'event/changeStartFormData',
      payload: {
        params: [],
      },
    });
  }

  handleOk = () => {
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs.formRef.validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    let params = this.refs.formRef.getValues();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }
    paramsObj = { ...paramsObj, ...this.geom };

    let paramsAtt = this.refs.formRef.getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({ name: key, value: paramsAtt[key] });
      }
    }
    let data = this.state.ModelData;
    this.setState({
      loading: true,
    });
    if (data.taskId === 'repairRectify') {
      this.submitRepairData(paramsObj, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    } else if (data.taskId === 'zhiding') {
      this.submitZhiDingData(paramsObj, (res) => {
        this.submitAttach(res, paramsAttArray, paramsObj);
      });
    } else if (data.taskId === 'repairPatrol' || data.taskId === 'repairNew' || data.taskId === 'rescueEmer'
      || data.taskId === 'changetube' || data.taskId === 'pengjiezhihuan'
      || data.taskId === 'zhihuan' || data.taskId === 'patrolTGCS' || data.taskId === 'patrolTGCSFK') {
      this.submitWoProcess(paramsObj);
    } else if (data.key !== 'updateGis' && data.key !== 'maintainBack') {
      this.submitTaskFormData(data, params);
    } else if (data.key === 'maintainBack') {
      this.submitmaintainBackData(data, params);
    } else if (data.key === 'updateGis') {
      this.submitGisUpdate(data, params);
    }
  }

  // 事件转工单
  submitWoProcess = (paramsObj) => {
    let that = this;
    this.props.dispatch({
      type: 'event/reportFormEvent',
      payload: {
        userid: this.props.user.gid,
        eventtype: this.transferType,
        properties: JSON.stringify({ eventid: this.state.ModelData.eventid, event_type: this.state.ModelData.typeid, ...paramsObj }),
      },
      callback: (res) => {
        this.transferType = '';
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
            showModalFrame: false,
          });
          that.getEventData();
        } else {
          message.error(res.msg);
        }
      },
    });
  }

  // 上报事件表单信息
  submitTaskFormData = (data, params) => {
    params.eventid = data.eventid;
    params.event_type = data.typeid;
    this.setState({
      loading: true,
    });
    this.props.dispatch({
      type: 'event/startProcess',
      payload: {
        processDefinitionKey: data.key,
        userid: this.props.user.gid,
        user: this.props.user.username,
        properties: JSON.stringify({ eventid: data.eventid, event_type: data.typeid, ...params }),
      },
      callback: (res) => {
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
            showModalFrame: false,
          });
          this.getEventData();
        }
      },
    });
  }

  // 更新GIS事件
  submitGisUpdate = (data, params) => {
    this.props.dispatch({
      type: 'event/updateGisInfo',
      payload: {
        userid: this.props.user.gid,
        user: this.props.user.username,
        gisInfo: JSON.stringify({ eventid: data.eventid, ...params }),
      },
      callback: (res) => {
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
            showModalFrame: false,
          });
          this.getEventData();
        }
      },
    });
  }

  // 退回维修工单
  submitmaintainBackData = (data, params) => {
    this.props.dispatch({
      type: 'event/submitmaintainBackData',
      payload: {
        userid: this.props.user.gid,
        eventid: data.eventid,
        ...params,
      },
      callback: (res) => {
        if (res.success) {
          message.success('退回成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
            showModalFrame: false,
          });
          this.getEventData();
        }
      },
    });
  }
  // 获取隐患方案制定表单
  getZhiDingFormData = (record) => {
    this.props.dispatch({
      type: 'event/getZhiDingFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.zhiDingId = record.eventid;
        this.setState({
          loading: false,
          ModelData: { taskName: '隐患方案制定', taskId: 'zhiding' },
          showModal: true,
          showModalFrame: true,
        });
      },
    });
  }

  // 获取整改反馈表单
  getRepairFormData = (record) => {
    this.props.dispatch({
      type: 'event/getRepairFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.eventid = record.eventid;
        this.setState({
          loading: false,
          ModelData: { taskName: '整改反馈', taskId: 'repairRectify' },
          showModal: true,
          showModalFrame: true,
        });
      },
    });
  }
  submitZhiDingData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'event/submitZhiDingFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: this.zhiDingId,
        params: JSON.stringify(paramsObj),
      },
      callback: (res) => {
        callback && callback(res);
      },
    });
  }

  submitRepairData = (paramsObj, callback) => {
    this.props.dispatch({
      type: 'event/submitRepairFormData',
      payload: {
        userid: this.props.user.gid,
        eventid: this.eventid,
        params: JSON.stringify(paramsObj),
      },
      callback: (res) => {
        callback && callback(res);
      },
    });
  }

  submitAttach = (res, paramsAttArray, paramsObj) => {
    // 上报成功之后再上报附件
    // 当存在附件字段提交附件
    if (paramsAttArray.length > 0) {
      this.props.dispatch({
        type: 'event/submitAttach',
        formData: paramsAttArray,
        attInfo: res.data,
        userInfo: this.props.user,
        callback: (resAtt) => {
          if (resAtt) {
            message.info('上报成功');
            this.setState({ showModal: false, showModalFrame: false, loading: false });
          }
        },
      });
    } else {
      message.info('上报成功');
      this.setState({ showModal: false, showModalFrame: false, loading: false });
    }
  }

  onClickGeomBtn = (name) => {
    let that = this;
    that.geom = {};
    const mapTool = new DrawPointMapTool(that.map.getMapObj(), that.map.getApiUrl(), (geom) => {
      let pointParams = {
        id: 'reportPoint',
        layerId: 'report_point_layer',
        markersize: 8,
        linecolor: [226, 130, 34],
        fillcolor: [255, 255, 255, 0.4],
        x: geom.x,
        y: geom.y,
      };
      this.map.getMapDisplay().point(pointParams);
      that.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
      let title = `x:${geom.x},y:${geom.y}`;
      // that.refs.formRef.setGeomTitle(name, title);

      this.setState({
        showModal: true,
        showModalFrame: true,
        showSearchTable: true,
        isShowMap: false,
      });
    });
    this.map.switchMapTool(mapTool);
    that.setState({
      showModal: false,
      showModalFrame: true,
      showSearchTable: false,
      isShowMap: true,
    });
  }

  getWoStartFormData = (record, btn) => {
    if (!btn.eventtype) {
      return;
    }
    this.transferType = btn.eventtype;
    this.props.dispatch({
      type: 'event/getFormData',
      payload: {
        eventtype: btn.eventtype,
        eventid: record.eventid,
      },
      callback: (res) => {
        this.setState({
          loading: false,
          ModelData: {
            taskName: btn.value,
            taskId: btn.key,
            eventid: record.eventid,
            typeid: record.typeid,
          },
          showModal: true,
          showModalFrame: true,
        });
      },
    });
  }

  onChangePage = (pageno, pagesize) => {
    let params = this.state.params;
    params.pageno = pageno;
    params.pagesize = pagesize;
    this.setState({
      params: { ...params },
    });
    this.getEventData();
  }

  getMap = () => {
    return this.map;
  }

  backToForm = () => {
    this.setState({
      isShowMap: false,
      showModal: true,
      showModalFrame: true,
    });
  }

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      showModal: true,
      showModalFrame: true,
      isShowMap: false,
    });
  }

  render() {
    const that = this;
    const eventTypeData = this.filterEventTypeData(this.props.eventTypeData);
    // const stationData = this.filterstationData(this.props.stationData);
    // 事件状态配置

    const eventStateData = (this.props.checkNum || []).map((oneState) => (
      { name: oneState.name, value: oneState.state, more: oneState.count || 0, showDot: true }
    ));

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/描述/地址/事件编号',
      valueType: 'input',
      width: '263px',
    }];

    // 事件类型配置
    const eventTypeConfig = [{
      name: 'eventType',
      alias: '事件类型',
      valueType: 'ddl',
      value: this.state.params.eventType,
      selectValues: eventTypeData,
      width: '150px',
    }];

    // 事件类型配置
    const departmentConfig = [{
      name: 'department',
      alias: '处理站点',
      valueType: 'ddl',
      value: this.state.params.department,
      selectValues: this.props.stationData,
      width: '150px',
    }];
    // 1200
    const column = [{
      field: 'reportername',
      width: '300px',
      render: (record) => {
        return (
          <span style={{ fontWeight: 'bold' }}>
            <span style={{ marginRight: 20 }}>
              上报人:&nbsp;{record.reportername}
            </span>工单类型:&nbsp;{record.typename}
          </span>);
      },
    }, {
      field: 'statename',
      width: '230px',
      render: (record) => {
        return (<span>处理环节:&nbsp;{record.statename}</span>);
      },
    }, {
      field: 'address',
      width: '300px',
      render: (record) => {
        return (
          <div className={styles.textOverflow}>地址:&nbsp;
            <Tooltip placement="topLeft" title={record.address}>{record.address}</Tooltip>
          </div>
        );
      },
    }, {
      field: 'reportertime',
      width: '230px',
      render: (record) => {
        return (<spna>上报时间:&nbsp;{record.reportertime.substring(0, 16)}</spna>);
      },
    }, {
      field: 'remark',
      width: '400px',
      render: (record) => {
        return (<div className={styles.textOverflow}>描述:&nbsp;
          <Tooltip placement="topLeft" title={record.remark}>{record.remark}</Tooltip>
        </div>);
      },
    }];

    const action = (dd) => {
      if (!dd.btn) {
        return '';
      }

      let maintainBack = null;
      let btns = dd.btn.map((btn, i) => {
        if (dd.typeid === '3') { // GIS错误类型显示更新按钮
          return (<span
            key={btn.key}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.getGisForm.bind(that, dd, btn)}
          >{btn.value}</span>);
        } else if (dd.typeid === '9' && btn.key === 'maintainBack') {
          maintainBack = btn;
          // 维修工单去除多余的处理按钮
        } else {
          return (<span
            key={btn.key}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.startProcess.bind(that, dd, btn)}
          >处理</span>);
        }
      });
      if (dd.typeid === '9' && maintainBack) {
        btns.push(
          <span
            key={`${dd.eventid}_maintainBack`}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.onClickMaintainBack.bind(that, dd, maintainBack)}
          >{maintainBack.value}</span>);
      } else {
        btns.push(
          <span
            key={`${dd.eventid}_close`}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.closeEvent.bind(that, dd)}
          >关闭</span>);
      }
      if (dd.typeid === '99' && dd.status === '0') { // wxj
        btns.push(
          <span
            key={`${dd.eventid}_hnzh`}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.onClickReplace.bind(that, dd, 10)}
          >户内置换</span>);
      }
      if (dd.typeid === '98' && dd.status === '0') {
        btns.push(
          <span
            key={`${dd.eventid}_pjgd`}
            style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
            onClick={that.onClickReplace.bind(that, dd, 25)}
          >碰接工单</span>);
      }
      if (dd.typeid === '0') {
        btns = [];
        const menus = [];
        for (let i = 0; i < dd.btn.length; i++) {
          menus.push(
            <Menu.Item key={i}>
              <a href="javascript:void(0)" onClick={this.getWoStartFormData.bind(this, dd, dd.btn[i])}>{dd.btn[i].value}</a>
            </Menu.Item>
          );
        }
        if (menus.length > 0) {
          const menuDiv = (<Menu>{menus}</Menu>);
          btns.push(
            <Dropdown overlay={menuDiv} trigger={['click']}>
              <a style={{ 'marginRight': '5px', textDecoration: 'none' }} className="ant-dropdown-link" href="javascript:void(0)">
                处理 <Icon type="down" />
              </a>
            </Dropdown>
          );
        }
      } else if (dd.typeid === '15') {
        btns = [];
        if (dd.btn.length === 1) {
          if (dd.btn[0].key === 'rectifyFeedback') {
            btns = (
              <span
                style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                onClick={that.getRepairFormData.bind(that, dd)}
              >{dd.btn[0].value}</span>
            );
          } else if (dd.btn[0].key === '') {
            btns.push(
              <span
                style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                onClick={that.startProcess.bind(that, dd)}
              >巡视跟踪</span>
            );
          }
        } else if (dd.btn.length > 1) {
          const menus = [];
          for (let i = 0; i < dd.btn.length; i++) {
            if (dd.btn[i].key === 'zhiding') {
              btns.push(
                <span
                  style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                  onClick={this.getZhiDingFormData.bind(this, dd)}
                >{dd.btn[i].value}</span>);
            } else if (dd.btn[i].key === 'rectifyFeedback') {
              btns.push(
                <span
                  style={{ marginRight: 20, cursor: 'pointer', color: '#1890ff' }}
                  onClick={that.getRepairFormData.bind(that, dd)}
                >{dd.btn[i].value}</span>
              );
            } else {
              menus.push(
                <Menu.Item key={i}>
                  <a href="javascript:void(0)" onClick={this.getWoStartFormData.bind(this, dd, dd.btn[i])}>{dd.btn[i].value}</a>
                </Menu.Item>
              );
            }
          }
          if (menus.length > 0) {
            const menuDiv = (<Menu>{menus}</Menu>);
            btns.push(
              <Dropdown overlay={menuDiv} trigger={['click']}>
                <a style={{ 'marginRight': '5px', textDecoration: 'none' }} className="ant-dropdown-link" href="javascript:void(0)">
                  隐患处理 <Icon type="down" />
                </a>
              </Dropdown>
            );
          }
        }
        return (<span style={{ float: 'right' }}>
          {btns}
        </span>);
      }
      return (<span style={{ float: 'right' }}>
        {dd.status === '0' || dd.typeid === '0' ? btns : ''}
      </span>);
    };

    const columns = [{
      key: '1',
      width: '7%',
      render: (text, record) => {
        let imgUrl = ['第三方施工', '故障上报', '隐患上报', '应急上报', '碰接申请'][record.typeid.toString() ? record.typeid % 5 : Math.floor(Math.random() * 5)];
        let imgBackColor = ['#1890ff', '#bd85cd', '#f8d473', '#6dcaec', '#abd275'][record.typeid.toString() ? record.typeid % 5 : Math.floor(Math.random() * 5)];
        return (<div className={styles.metaAvatar}>
          <span className={styles.avatarImage} style={{ backgroundColor: imgBackColor }}>
            <img alt="" src={`../images/eventOverview/${imgUrl}.png`} />
          </span>
        </div>);
      },
    }, {
      key: '2',
      width: '40%',
      render: (text, record) => {
        return (
          <span>
            <div style={{ fontWeight: 'bold' }}>
              <span style={{ marginRight: 20 }}>{record.reportername}</span>{record.typename}
            </div>
            <div className={styles.textOverflow}>地址:&nbsp;
              <Tooltip placement="topLeft" title={record.address}>{record.address}</Tooltip>
            </div>
            <br />
            <div className={styles.textOverflow}>描述:&nbsp;
              <Tooltip placement="topLeft" title={record.remark}>{record.remark}</Tooltip>
            </div>
          </span>
        );
      },
    }, {
      key: '3',
      width: '30%',
      render: (text, record) => {
        return (
          <span>
            <span>事件编号:&nbsp;{record.eventid}</span>
            <br />
            <span>事件状态:&nbsp;{record.statename}</span>
            <br />
            <span>上报时间:&nbsp;{record.reportertime.toString().substring(0, 16)}</span>
          </span>);
      },
    }, {
      key: '4',
      render: (text, record) => {
        return <span>{action(record)}</span>;
      },
    }];

    // 表格分页
    const pagination = {
      total: parseInt(that.props.eventTotal, 10),
      current: that.state.params.pageno,
      pageSize: that.state.params.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        that.onChangePage(page, pageSize);
      },
      onShowSizeChange(page, pageSize) {
        that.onChangePage(page, pageSize);
      },
      showTotal: (total, pageInfo) => { // 设置显示一共几条数据
        return `共${total}条数据`;
      },
    };

    const field = {
      searchWidth: '620px',
      search: [
        <SelectPanel
          fieldName="事件状态"
          value={this.state.params.eventState}
          dataType="ddl"
          showMoreInfo={true}
          data={eventStateData}
          onclick={this.onChangeQuery.bind(this, 'state')}
        />,
      ],
      extra: [
        <SearchPanel field={eventTypeConfig} onclick={this.onChangeQuery.bind(this, 'type')} />,
        <div>
          <span style={{ marginRight: '15px' }}>上报时间 :</span>
          <RangePicker
            style={{ width: 235, marginTop: 2 }}
            value={[this.state.params.stime, this.state.params.etime]}
            onChange={this.onChangeQuery.bind(this, 'time')}
          />
        </div>,
      ],
      extra1: [
        this.state.isShowStation ? <SearchPanel field={departmentConfig} onclick={this.onChangeQuery.bind(this, 'depart')} /> : null,
        <SearchPanel ref="searchpanel" field={queryData} onclick={this.onChangeCondition} />,
      ],
      table: <Table
        rowKey={(record) => record.eventid}
        dataSource={this.props.eventData}
        columns={columns}
        pagination={pagination}
        showHeader={false}
        onRow={(record, index) => ({
          onDoubleClick: () => {
            if (record.processinstanceid) {
              let path = {
                pathname: '/order/workOrder-list-detail',
                processInstanceId: record.processinstanceid,
                formid: record.formid,
                workOrderNum: record.wocode,
                params: this.state.params,
                historyPageName: '/event-list',
              };
              this.props.dispatch(routerRedux.push(path));
            } else {
              let path = {
                pathname: '/event-list-detail',
                eventid: record.eventid,
                eventtype: record.typeid,
                params: this.state.params,
                historyPageName: '/event-list',
              };
              this.props.dispatch(routerRedux.push(path));
            }
          },
        })}
      />,
    };
    return (
      <PageHeaderLayout>
        {this.state.showSearchTable ? <div style={{ width: '100%', height: 'calc(100% - 175px)' }}>
          <SearchTablePanel field={field} onSearch={this.onChangeQuery.bind(this, '')} onReset={this.reset} />
        </div> : null}
        <div
          style={{
            width: '100%',
            height: 'calc(100vh - 175px)',
            display: this.state.isShowMap ? 'block' : 'none',
          }}
        >
          <div style={{ width: '100%', height: '35px', paddingTop: '2px' }}>
            <Button onClick={this.backToForm}>返回</Button>
          </div>
          <EcityMap
            mapId="eventOverview"
            onMapLoad={(aMap) => {
              this.map = aMap;
            }}
          />
        </div>
        {this.state.showModalFrame ?
          <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName="web"
            footer={null}
            onOk={this.handleOk}
            title="处理"
          >
            <div style={{ display: 'block' }}>
              <SubmitForm
                data={this.props.startFormData.params}
                geomHandleClick={this.onClickGeomBtn}
                geomSelectedPoint={this.geomSelectedPoint}
                getMap={this.getMap}
                column={2}
                cascade={this.props.startFormData.cascade}
                ref="formRef"
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
      </PageHeaderLayout>
    );
  }
}
