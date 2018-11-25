import React from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import utils from '../../utils/utils';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Modal, Button, Spin, Select, Input, Icon, DatePicker, Dropdown, Menu, message, Tooltip, Table } from 'antd';
import SelectPanel from '../commonTool/SelectPanelTool/SelectPanel';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel';
import SearchTablePanel from '../commonTool/SearchTablePanel/SearchTablePanel';
import SubmitForm from '../commonTool/SubmitFormModal/SubmitFormModal.js';
import styles from './FaultList.less';

const {RangePicker} = DatePicker;
const confirm = Modal.confirm;

const defaultParams = {
  eventState: '', // 事件状态
  eventType: '6', // 事件类型
  department: '', // 上报部门
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', // 快速索引
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  eventTotal: state.czmanage.eventTotal,
  eventData: state.czmanage.eventData,
  // eventTypeData: state.event.eventTypeData,
  checkNum: state.czmanage.checkNum,
  stationData: state.patrolPlanList.stationData,
  startFormData: state.czmanage.startFormData,
  // stations:state.event.stations,
}))

export default class DangerList extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    let params = this._tool.params ? {...this._tool.params} : {...defaultParams};

    // this.pageType = 'CZManager';
    // let pathname = this.props.location.pathname;
    // if (pathname === '/equipment/danger-mnmg') {
    //   this.pageType = 'CHManager';
    // }
    this.pageType = 'CHManager';
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      // 参数
      params: {...params},
      // 状态值
      isShowStation: true,
      showModal: false, // 是否展示模态框
      ModelData: {}, // 相关按钮内的值
      // isExpand: false, // 是否展开
      // tableHieght: window.innerHeight - 370,
      loading: false,
    };
  }

  componentDidMount() {
    // this.getEventTypeData();
    this.getstationData();
    this.getEventData();
    // this.getStations();
  }

  componentWillUnmount() {

  }

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
          this.getEventData();
        }
      },
    });
  };

  // 获取事件数据
  getEventData = () => {
    let data = {};
    let params = this.state.params;
    if (this.props.user.gid !== '') {
      data.userid = this.props.user.gid;
    }
    if (params.eventState !== '') {
      data.eventstate = params.eventState;
    }
    if (params.eventType !== '') {
      data.eventtype = params.eventType;
    }
    if (params.department !== '') {
      data.stationcode = params.department;
    }
    if (params.stime !== null && params.etime !== null) {
      data.reporttime = params.stime.format('YYYY-MM-DD') + ' 00:00:00~' + params.etime.format('YYYY-MM-DD') + ' 23:59:59';
    }
    if (params.condition !== '') {
      data.ext = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno !== '') {
      data.pageno = params.pageno;
    }
    if (params.pagesize !== '') {
      data.pagesize = params.pagesize;
    }
    this.props.dispatch({
      type: 'czmanage/getEventData',
      payload: data,
    });
  };

  startProcess = (data, flag) => {
    let that = this;
    if (this.pageType === 'CHManager') {
      this.props.dispatch({
        type: 'czmanage/getWoPlanStartFormData',
        payload: {
          processDefinitionKey: 'woPlan',
          userid: this.props.user.gid,
          eventid: data.eventid,
        },
        callback: () => {
          this.setState({
            ModelData: data,
            showModal: true,
          });
        },
      });
    } else {
      if ('zzRole'.indexOf(flag) > -1) {
        this.props.dispatch({
          type: 'czmanage/getCZStartFormData',
          payload: {
            processDefinitionKey: data.process,
            userid: this.props.user.gid,
            eventid: data.eventid,
            flag: flag,
          },
          callback: () => {
            this.setState({
              ModelData: data,
              showModal: true,
            });
          },
        });
      } else {
        this.props.dispatch({
          type: 'czmanage/getCZStartFormData',
          payload: {
            processDefinitionKey: data.process,
            userid: this.props.user.gid,
            eventid: data.eventid,
          },
          callback: () => {
            this.setState({
              ModelData: data,
              showModal: true,
            });
          },
        });
      }
    }
  };

  // 事件状态改变
  onChangeEventState = (valueObj) => {
    let params = this.state.params;
    params.eventState = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
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
    this.getEventData();
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
    this.getEventData();
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
    this.getEventData();
  };

  // 查询改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.condition;
    this.setState({
      params: params,
    });
  };

  closeEvent = (event) => {
    let that = this;
    confirm({
      title: '是否关闭事件?',
      onOk() {
        that.props.dispatch({
          type: 'czmanage/closeEvent',
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
  };

  // 查询
  search = () => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  reportEventClick = (value) => {
    this.props.history.push(`/query/report-eventform?eventtype=${value}`);
  }

  // 重置
  reset = () => {
    let params = this.state.params;
    params.eventState = '';
    params.eventType = '6';
    params.department = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.getEventData();
  };

  getWorkOrderDetail=(record) => {
    let path = {
      pathname: '/order/workOrder-list-detail',
      processInstanceId: record.processinstanceid,
      formid: record.formid,
      workOrderNum: record.wocode,
      params: this.state.params,
      historyPageName: '/station/CZdanger',
    };
    this.props.dispatch(routerRedux.push(path));
  };

  getEventdetail=(record) => {
    let path = {
      pathname: '/event-list-detail',
      eventid: record.eventid,
      eventtype: record.typeid,
      record: record,
      params: this.state.params,
      historyPageName: '/station/CZdanger',
    };
    this.props.dispatch(routerRedux.push(path));
  };

  getDetail=(record) => {
    if (record.processinstanceid) {
      let path = {
        pathname: '/order/workOrder-list-detail',
        processInstanceId: record.processinstanceid,
        formid: record.formid,
        workOrderNum: record.wocode,
        params: this.state.params,
        historyPageName: '/station/CZdanger',
      };
      this.props.dispatch(routerRedux.push(path));
    } else {
      let path = {
        pathname: '/event-list-detail',
        eventid: record.eventid,
        eventtype: record.typeid,
        params: this.state.params,
        historyPageName: '/station/CZdanger',
      };
      this.props.dispatch(routerRedux.push(path));
    }
  };

  handleCancel = () => {
    this.clearFormData();
  };

  clearFormData = () => {
    this.setState({showModal: false});
    this.getEventData();
    this.geom = {};
    this.props.dispatch({
      type: 'czmanage/changeStartFormData',
      payload: {
        params: [],
      },
    });
  };

  handleOk = () => {
    let that = this;
    let paramsObj = {};
    let paramsAttArray = [];
    let validate = this.refs['formRef_1'].validateRequired();
    if (validate) {
      message.warning('字段【' + validate + '】为空！');
      return;
    }
    let params = this.refs['formRef_1'].getValues();
    for (let key in params) {
      const param='accept_userid';
      if (params.hasOwnProperty(key)) {
        if(key.indexOf(param)>-1){
          paramsObj[param] = params[key];
        }else{
          paramsObj[key] = params[key];
        }
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
    if (this.pageType === 'CHManager') {
      this.submitWoProcess(paramsObj);
    } else {
      this.submitCZProcess(paramsObj);
    }
  };

  submitCZProcess = (paramsObj) => {
    let data = this.state.ModelData;
    this.props.dispatch({
      type: 'czmanage/startCZProcess',
      payload: {
        processDefinitionKey: data.process,
        userid: this.props.user.gid,
        user: this.props.user.username,
        properties: JSON.stringify({eventid: data.eventid, event_type: data.typeid, ...paramsObj}),
      },
      callback: (res) => {
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
          });
          this.getEventData();
        } else {
          message.info(res.msg);
        }
      },
    });
  }

  submitWoProcess = (paramsObj) => {
    let that = this;
    this.props.dispatch({
      type: 'czmanage/startWoProcess',
      payload: {
        userid: this.props.user.gid,
        user: this.props.user.trueName,
        username: this.props.user.trueName,
        properties: JSON.stringify({eventid: this.state.ModelData.eventid, event_type: this.state.ModelData.typeid, ...paramsObj}),
        processDefinitionKey: 'woPlan',
      },
      callback: (res) => {
        if (res.success) {
          message.success('处理成功');
          this.setState({
            loading: false,
            ModelData: {},
            showModal: false,
          });
          that.getEventData();
        } else {
          message.error(res.msg);
        }
      },
    });
  }

  onClickGeomBtn = (name) => {
  };

  render() {
    const that = this;
    const eventStateData = this.props.checkNum.map((oneState) => (
      {name: oneState.name, value: oneState.state, more: oneState.count || 0, showDot: true}
    ));

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: '上报人/隐患情况/隐患位置',
      valueType: 'input',
      width: '200px',
    }];

    // 事件类型配置
    const departmentConfig = [{
      name: 'department',
      alias: '所属站点',
      valueType: 'ddl',
      value: this.state.params.department,
      selectValues: this.props.stationData,
      width: '150px',
    }];
    const column = [{
      field: 'reportername',
      width: '300px',
      render: (record) => {
        return (
          <span style={{fontWeight: 'bold'}}>
            <span
              style={{marginRight: 20}}
            >上报人:&nbsp;{record.reportername}</span>工单类型:&nbsp;{record.typename}</span>);
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
    const action = (dd )=> {
      let dobtn = '';
      if (dd.btn) {
        //有站长权限的  处理
        dobtn = dd.btn.map((btn, i) => (
          <span
            key={btn.key}
            style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
            onClick={that.startProcess.bind(that, dd, 'zzRole')}
          >处理</span>
        ));
        dobtn.push(<span key={`${dd.eventid}_close`} style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}} onClick={that.closeEvent.bind(that, dd)}>关闭</span>);
      } else {
        //其他用户的  处理（直接处理）
        dobtn = (
          <span
            style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
            onClick={that.startProcess.bind(that, dd)}
          >处理</span>
        );
      }
      return (
        <span style={{float: 'left'}}>
          <span style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}} onClick={that.getEventdetail.bind(that, dd)}>详情</span>
          {dd.status === '0' ? dobtn : ''}
        </span>);
    };

    const cols = [
      {
        title: '上报人',
        dataIndex: 'reportername',
        fixed: 'left',
        width: 90,
        key: 'reportername',
      },

      {
        title: '隐患编号',
        width: 140,
        fixed: 'left',
        dataIndex: 'eventid',
        key: 'eventid',
      },
      {
        title: '所属站点',
        width: 100,
        fixed: 'left',
        dataIndex: 'locname',
        key: 'locname',
      },
      {
        title: '隐患位置',
        dataIndex: 'address',
        width: 120,
        key: 'address',
        render: (text, record, index) => {
          let textValue = text;
          if (text.indexOf('{') >= 0 && text.indexOf('}') >= 0) {
            let tmpJson = JSON.parse(text);
            textValue = tmpJson.name;
          }
          return <span title={textValue}>{textValue}</span>;
        },
      },
      {
        title: '隐患情况',
        width: 120,
        dataIndex: 'remark',
        key: 'remark',
        render: (text, record, index) => <span title={text}>{text}</span>,
      },
      {
        title: '发生时间',
        width: 180,
        // dataIndex:'occurrenttime',
        key: 'occurrenttime',
        render: (text, record, index) => <span>{record.occurrenttime}</span>,
      },
      {
        title: '严重程度',
        dataIndex: 'degree',
        width: 90,
        key: 'degree',
      },
      {
        title: '要求完成时间',
        // dataIndex:'requiretime',
        width: 180,
        key: 'repair_askfinishtime',
        render: (text, record, index) => <span>{record.requiretime}</span>,
      },
      {
        title: '实际处理时间',
        dataIndex: 'repair_actualtime',
        width: 180,
        key: 'repair_actualtime',
      },
      {
        title: '整改情况',
        width: 140,
        dataIndex: 'repair_memo',
        key: 'repair_memo',
      },
      {
        title: '关联工单',
        // dataIndex:'wocode',
        width: 140,
        key: 'wocode',
        render: (text, record) => {
          return (<a onClick={that.getWorkOrderDetail.bind(that, record)} >{record.wocode}</a>);
        },
      },
      {
        title: '状态',
        dataIndex: 'statename',
        key: 'statename',
      },
      {
        title: '操作',
        fixed: 'right',
        width: 157,
        render: (text, record) => {
          return <span>{action(record)}</span>;
        },
      },
    ];

    const columns = [{
      key: '1',
      width: '7%',
      render: (text, record) => {
        let imgUrl = ['第三方施工', '故障上报', '隐患上报', '应急上报', '碰接申请'][record.typeid.toString() ? record.typeid % 5 : Math.floor(Math.random() * 5)];
        let imgBackColor = ['#1890ff', '#bd85cd', '#f8d473', '#6dcaec', '#abd275'][record.typeid.toString() ? record.typeid % 5 : Math.floor(Math.random() * 5)];
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
              <span style={{marginRight: 20}}>{record.reportername}</span>{record.typename}
            </div>
            <div className={styles.textOverflow}>隐患位置:&nbsp;
              <Tooltip placement="topLeft" title={record.address}>{record.address}</Tooltip>
            </div>
            <br />
            <div className={styles.textOverflow}>隐患情况:&nbsp;
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
            <span>隐患编号:&nbsp;{record.eventid}</span>
            <br />
            <span>隐患状态:&nbsp;{record.statename}</span>
            <br />
            <span>上报时间:&nbsp;{record.reportertime.toString().substring(0, 16)}</span>
              <span></span>
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
        let params = that.state.params;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getEventData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getEventData();
      },
      showTotal: function () {
        // 设置显示一共几条数据
        return <div style={{marginRight: this.width}}>共 {this.total} 条数据</div>;
      },
    };

    const field = {
      searchWidth: '850px',
      search: [
        <SelectPanel
          fieldName="事件状态"
          value={this.state.params.eventState}
          dataType="ddl"
          showMoreInfo={true}
          data={eventStateData}
          onclick={this.onChangeEventState}
        />,
        <div>
          <Button
            type='primary'
            onClick={this.reportEventClick.bind(this, '6')}
          >
            隐患上报
          </Button>
        </div>,
      ],
      extra: [
        <div>
          <span style={{marginRight: '15px'}}>上报时间 :</span>
          <RangePicker
            style={{width: 195, marginTop: 2}}
            value={[this.state.params.stime, this.state.params.etime]}
            onChange={this.onChangeTime}
          />
        </div>,
        this.state.isShowStation ? <SearchPanel field={departmentConfig} onclick={this.onChangeDepartment}/> : null,
        <SearchPanel
          ref="searchpanel"
          field={queryData}
          onclick={this.onChangeCondition}
        />,
      ],

      table: <Table
        rowKey={(record) => record.eventid}
        dataSource={this.props.eventData}
        columns={cols}
        pagination={pagination}
        showHeader={true}
        scroll={{ x: 1720}}
        onRow={(record, index) => ({
          onDoubleClick: () => {
            this.getEventdetail(record);
          },
        })}
      />,
    };

    return (
      <PageHeaderLayout>
        <div style={{width: '100%', minHeight: 'calc(100vh - 175px)'}}>
          <SearchTablePanel field={field} onSearch={this.search} onReset={this.reset} />
        </div>
        <Modal
          width="770px"
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          wrapClassName="web"
          footer={null}
          onOk={this.handleOk}
          title={this.pageType === 'CHManager' ? '处理' : '分派'}
        >
          <div style={{display: 'block'}}>
            {this.state.showModal ?
              <SubmitForm
                data={this.props.startFormData.params}
                geomHandleClick={this.onClickGeomBtn}
                column={2}
                cascade={this.props.startFormData.cascade}
                ref='formRef_1'
              /> : ''}
          </div>
          <div style={{height: '30px', marginTop: '25px'}}>
            <Button
              style={{float: 'right',marginLeft: '15px', marginRight: '30px'}}
              onClick={this.handleCancel.bind(this)}
            >
              取消
            </Button>
            <Button
              type="primary"
              style={{float: 'right'}}
              loading={this.state.loading}
              onClick={this.handleOk.bind(this)}
            >
              确定
            </Button>
          </div>
        </Modal>
      </PageHeaderLayout>
    );
  }
}
