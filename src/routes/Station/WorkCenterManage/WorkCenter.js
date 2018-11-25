import React from 'react';
import {routerRedux, Link} from 'dva/router';
import {connect} from 'dva';
import {Modal, Button, Spin, Select, Input, Icon, DatePicker, Dropdown, Menu, message, Tooltip, Table} from 'antd';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SearchTablePanel from '../../commonTool/SearchTablePanel/SearchTablePanel';
import styles from '../../WorkOrderManage/workOrderOverview/workOrderOverview.less';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal.js';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const {RangePicker} = DatePicker;

const defaultParams = {
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
  workOrderList: state.workOrder.workOrderList,
  workOrderTotal: state.workOrder.workOrderTotal,
  eventTypeData: state.event.eventTypeData,
  taskFormData: state.workOrder.taskFormData, // 模态框表单配置信息
  // checkNum: state.event.checkNum,
  stationData: state.patrolPlanList.stationData,
  stations: state.event.stations,
}))

export default class WorkCenter extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    let params = this._tool.params ? {...this._tool.params} : {...defaultParams};
    this.map = null;
    this.setAddrTitle = null;
    this.state = {
      // 数据
      checkNum: {allNum: 0, notCompleteNum: 0, completeNum: 0, overdueNum: 0}, // 事件数
      // 参数
      params: {...params},
      // 状态值
      isShowStation: true,
      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      ModelData: {}, // 相关按钮内的值
      // isExpand: false, // 是否展开
      // tableHieght: window.innerHeight - 370,
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
      payload: {
        type: 'CZ',
      },
    });
  };

  filterEventTypeData = (datas) => {
    let stationConfigs = [{name: '全部', value: ''}];
    if (!datas) {
      return stationConfigs;
    }
    for (let i = 0; i < datas.length; i++) {
      stationConfigs.push({
        name: datas[i].eventname,
        value: datas[i].eventtype + '',
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
    for (let i = 0; i < datas.length; i++) {
      stationConfigs.push({
        name: datas[i].locName,
        value: datas[i].locCode + '',
      });
    }
    return stationConfigs;
  };

  // 上报部门数据字典
  getstationData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload: {stationType: 'B'},
      callback: (res) => {
        if (res.length === 0) {
          this.setState({
            isShowStation: false,
          });
        } else if (res.length === 1) {
          let params = this.state.params;
          params.department = res[0].value;
          this.setState({
            params: params,
          });
          this.getWorkOrderData();
        }
      },
    });
  };

  // 获取事件数据
  getWorkOrderData = () => {
    let data = {};
    let params = this.state.params;
    if (this.props.user.gid !== '') {
      data.userid = this.props.user.gid;
    }
    if (params.eventType !== '') {
      data.eventtype = params.eventType;
    }
    if (params.department !== '') {
      data.stationcode = params.department;
    }
    if (params.stime !== null) {
      data.startTime = params.stime.format('YYYY-MM-DD') + ' 00:00:00';
    }
    if (params.etime !== null) {
      data.endTime = params.etime.format('YYYY-MM-DD') + ' 23:59:59';
    }
    if (params.condition !== '') {
      data.condition = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno !== '') {
      data.pageno = params.pageno;
    }
    if (params.pagesize !== '') {
      data.pagesize = params.pagesize;
    }
    data.plat = 'web';
    data.evttype='cz';
    this.props.dispatch({
      type: 'workOrder/selectFieldworkList',
      payload: data,
    });
  };

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

  handleOk = () => {
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs.formRef_1.validateRequired();
    if (validate) {
      message.warning(`字段【${validate}】为空！`);
      return;
    }
    let params = this.refs.formRef_1.getValues();
    for (let key in params) {
      if (params.hasOwnProperty(key)) {
        paramsObj[key] = params[key];
      }
    }
    paramsObj = {...paramsObj, ...this.geom};

    let paramsAtt = this.refs.formRef_1.getAttValues();
    for (let key in paramsAtt) {
      if (paramsAtt.hasOwnProperty(key)) {
        paramsAttArray.push({name: key, value: paramsAtt[key]});
      }
    }
    this.setState({
      loading: true,
    });
    this.props.dispatch({
      type: 'workOrder/submitTaskFormData',
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
            type: 'workOrder/submitAttach',
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
  };

  clearFormData = () => {
    this.setState({showModal: false, loading: false});
    this.getWorkOrderData();
    this.geom = '';
    this.props.dispatch({
      type: 'workOrder/changeTaskFormData',
      payload: {
        params: [],
      },
    });
  };

  onClickGeomBtn = (callback) => {
    this.map.getMapDisplay().clear();
    this.setAddrTitle = callback;
    this.geom = '';
    this.setState({
      isShowMap: true,
    });
  };

  geomSelectedPoint = (name, geom) => {
    this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
    this.setState({
      isShowMap: false,
    });
  }

  mapLoad = (aMap) => {
    this.map = aMap;
    if (this.geom) {
      this.showPoint();
    }
    this.drawPoint();
  }

  showPoint = () => {
    let onePoint = this.geom.split(',');
    this.map.getMapDisplay().clear();
    const param = {
      id: 'testlayerid0',
      layerId: 'testlayer0',
      src: '../../images/woPoint.png',
      width: 19,
      height: 27,
      angle: 0,
      // attr: onePoint,
      x: parseFloat(onePoint[0]),
      y: parseFloat(onePoint[1]),
    };
    this.map.getMapDisplay().image(param);
    this.map.centerAt(param);
  }

  drawPoint = () => {
    let that = this;
    const mapTool = new DrawPointMapTool(this.map.getMapObj(), this.map.getApiUrl(), (geom) => {
      let pointParams = {
        id: 'address_point',
        layerId: 'query_address_point_layer',
        src: '../images/woPoint.png',
        width: 19,
        height: 27,
        angle: 0,
        x: geom.x,
        y: geom.y,
      };
      this.map.getMapDisplay().image(pointParams);

      this.geom[`${name}_geom`] = `${geom.x},${geom.y}`;
      this.setAddrTitle(geom);
      this.setState({
        isShowMap: false,
      });
    });
    this.map.switchMapTool(mapTool);
  }

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

  filterStations=(datas) => {
    let stationsConfig = [];
    if (!datas) {
      return stationsConfig;
    }
    if (datas.length !== 1) {
      stationsConfig = [{name: '全部', value: ''}];
    }
    for (let i = 0; i < datas.length; i++) {
      stationsConfig.push({
        name: datas[i].alias,
        value: datas[i].name,
      });
    }
    return stationsConfig;
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

  render() {
    const that = this;
    const eventTypeData = this.filterEventTypeData(this.props.eventTypeData);
    // const stationData = this.filterstationData(this.props.stationData);
    const stations = this.filterStations(this.props.stations);

    // 事件状态配置
    const eventStateData = [{
      name: '全部', value: '', more: this.state.checkNum.allNum, showDot: true,
    }, {
      name: '待处理', value: '0', more: this.state.checkNum.notCompleteNum, showDot: true,
    }, {
      name: '处理中', value: '1', more: this.state.checkNum.completeNum, showDot: true,
    }, {
      name: '已处理', value: '2', more: this.state.checkNum.overdueNum, showDot: true,
    }, {
      name: '关闭', value: '3', more: this.state.checkNum.overdueNum, showDot: true,
    }];

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/描述/地址/工单编号',
      valueType: 'input',
      width: '260px',
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
      alias: '所属站点',
      valueType: 'ddl',
      value: this.state.params.department,
      selectValues: this.props.stationData,
      width: '150px',
    }];

    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => (
        <span
          key={i}
          style={{ marginLeft: 20, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getTaskFormData.bind(that, btn)}
        >
          {btn.taskName}
        </span>
      ));
      return <span style={{float: 'left'}}>
        {btns}
      </span>;

    };

    const cols = [
      {
        title: '工单编号',
        dataIndex: 'wocode',
        width: 140,
        fixed: 'left',
        key: 'wocode',
      },
      {
        title: '所属站点',
        fixed: 'left',
        width: 100,
        dataIndex: 'locname',
        key: 'locname',
      },
      {
        title: '位置信息',
        width: 120,
        dataIndex: 'address',
        key: 'address',
        render: (text, record, index) => {
          let resultText = text;
          if (text.indexOf('{') >= 0 && text.indexOf('}') >= 0) {
            let tmpObj = JSON.parse(text);
            resultText = tmpObj.name;
          }
          return (<span title={resultText}>{resultText}</span>);
        },
      },
      {
        title: '上报情况',
        width: 120,
        dataIndex: 'remark',
        key: 'remark',
        render: (text, record, index) => <span title={text}>{text}</span>,
      },
      {
        title: '发生时间',
        // dataIndex:'occurrenttime',
        width: 180,
        key: 'occurrenttime',
        render: (text, record, index) => <span>{record.occurrenttime}</span>,
      },
      {
        title: '要求完成时间',
        // dataIndex:'requiretime',
        width: 180,
        key: 'requiretime',
        render: (text, record, index) => <span>{record.requiretime}</span>,
      },
      {
        title: '实际处理时间',
        width: 180,
        dataIndex: 'repair_actual_dealtime',
        key: 'repair_actual_dealtime',
      },
      {
        title: '整改情况',
        width: 140,
        dataIndex: 'repair_memo',
        key: 'repair_memo',
      },
      {
        title: '操作',
        width: 185,
        fixed: 'right',
        render: (text, record) => {
          let tmpspan = action(record);
          return <span>{tmpspan}</span>;
        },
      },
    ];

    const columns = [{
      key: '1',
      width: '7%',
      render: (text, record) => {
        let imgUrl = ['第三方施工', '故障上报', '隐患上报', 'GIS数据上报', '应急上报', '故障上报', '隐患上报', '碰接置换'][record.type.toString() ? record.type % 8 : Math.floor(Math.random() * 5)];
        let imgBackColor = ['#1890ff', '#bd85cd', '#f8d473', '#1890ff', '#6dcaec', '#bd85cd', '#f8d473', '#abd275'][record.type.toString() ? record.type % 5 : Math.floor(Math.random() * 8)];
        return
        <div className={styles.metaAvatar}>
          <span className={styles.avatarImage} style={{backgroundColor: imgBackColor}}>
            <img src={`../images/eventOverview/${imgUrl}.png`} />
          </span>
        </div>;
      },
    }, {
      key: '2',
      width: '40%',
      render: (text, record) => {
        return (
          <span>
            <div style={{fontWeight: 'bold'}}>
              <span style={{marginRight: 20}}>{record.reporter}</span>{record.typename}
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
      width: '28%',
      render: (text, record) => {
        return (
          <span>
            <span>工单编号:&nbsp;{record.wocode || ''}</span>
            <br />
            <span>处理环节:&nbsp;{record.statename}</span>
            <br />
            <span>更新时间:&nbsp;{(record.updatetime || '').toString().substring(0, 16)}</span>
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
      showTotal: function () {
        // 设置显示一共几条数据
        return <div style={{marginRight: this.width}}>共 {this.total} 条数据</div>;
      },
    };

    const field = {
      searchWidth: '600px',
      search: [
        <SearchPanel field={eventTypeConfig} onclick={this.onChangeEventType} />,
        <div>
          <span style={{marginRight: '15px'}}>更新时间 :</span>
          <RangePicker
            style={{width: 235, marginTop: 2}}
            value={[this.state.params.stime, this.state.params.etime]}
            onChange={this.onChangeTime}
          />
        </div>,
      ],
      extra: [
        this.state.isShowStation ? <SearchPanel field={departmentConfig} onclick={this.onChangeDepartment} /> : null,
        <SearchPanel
          ref="searchpanel"
          field={queryData}
          onclick={this.onChangeCondition}
        />,
      ],
      table: <Table
        rowKey={(record) => record.processInstancedId}
        dataSource={this.props.workOrderList}
        columns={cols}
        scroll={{ x: 1347}}
        pagination={pagination}
        showHeader={true}
        onRow={(record, index) => ({
          onDoubleClick: () => {
            let path = {
              pathname: '/order/workOrder-list-detail',
              processInstanceId: record.processInstancedId,
              formid: record.formid,
              workOrderNum: record.wocode,
              params: this.state.params,
              historyPageName: '/equipment/workCenter',
            };
            this.props.dispatch(routerRedux.push(path));
          },
        })}
      />,
    };

    return (
      <PageHeaderLayout>
        <div style={{width: '100%', height: 'calc(100% - 175px)',minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          <SearchTablePanel field={field} onSearch={this.search} onReset={this.reset}/>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'fixed',
            left: 0,
            top: 0,
            display: this.state.isShowMap ? 'block' : 'none',
            backgroundColor: '#fff',
            zIndex: 10000,
          }}
          >
            <EcityMap mapId="workOrderOverview" onMapLoad={this.mapLoad}/>
          </div>
          <Modal
            width="770px"
            visible={this.state.showModal}
            onCancel={this.handleCancel}
            wrapClassName={'web'}
            footer={null}
            title={this.state.ModelData.taskName}
          >
            <div style={{display: 'block'}}>
              {this.state.showModal ?
                <SubmitForm
                  data={this.props.taskFormData.params}
                  cascade={this.props.taskFormData.cascade}
                  geomHandleClick={this.onClickGeomBtn.bind(this)}
                  geomSelectedPoint={this.geomSelectedPoint.bind(this)}
                  column={2}
                  ref='formRef_1'
                /> : ''}
            </div>
            <div style={{height: '30px', marginTop: '25px'}}>
              <Button style={{float: 'right', marginLeft: '15px', marginRight: '30px'}} onClick={this.handleCancel.bind(this)}>取消</Button>
              <Button type="primary" style={{float: 'right'}} loading={this.state.loading} onClick={this.handleOk.bind(this)}>确定</Button>
            </div>
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}
