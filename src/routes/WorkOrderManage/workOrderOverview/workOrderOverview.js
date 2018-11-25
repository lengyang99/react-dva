import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Modal, Button, DatePicker, message, Tooltip, Table} from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel';
import SearchTablePanel from '../../commonTool/SearchTablePanel/SearchTablePanel';
import styles from './workOrderOverview.less';
import EcityMap from '../../../components/Map/EcityMap';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal';
import {DrawPointMapTool} from '../../../components/Map/common/maptool/DrawPointMapTool';

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
  workOrderList: state.workOrder.workOrderList,
  workOrderTotal: state.workOrder.workOrderTotal,
  eventTypeData: state.event.eventTypeData,
  taskFormData: state.workOrder.taskFormData, // 模态框表单配置信息
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
    this.copyWoInfo = {};
    this.state = {
      // 数据
      // edata: [], // 事件数据
      // eventTypeData: [{name: '全部', value: ''}], // 事件类型数据
      // stationData: [{name: '全部', value: ''}], // 上报部门数据
      checkNum: {allNum: 0, notCompleteNum: 0, completeNum: 0, overdueNum: 0}, // 事件数
      // 参数
      params: {...params},
      // 状态值
      isShowStation: true,
      isShowMap: false, // 是否展示地图
      showModal: false, // 是否展示模态框
      showModalMap: false, // 是否展示模态框
      showSearchTable: true, // 是否显示数据列表
      ModelData: {}, // 相关按钮内的值
      loading: false,
      tableloading: false,
      modalDisplay: false,
    };
  }

  componentWillMount() {
    this.getEventTypeData();
    this.getstationData();
  }
  componentDidMount() {
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
    if (this.props.user.gid) {
      data.userid = this.props.user.gid;
    }
    // if (params.eventState !== '') {
    //   data.eventstate = params.eventState;
    // }
    if (params.eventType) {
      data.eventtype = params.eventType;
    }
    if (params.department) {
      data.stationcode = params.department;
    }
    if (params.stime) {
      data.startTime = `${params.stime.format('YYYY-MM-DD')} 00:00:00`;
    }
    if (params.etime) {
      data.endTime = `${params.etime.format('YYYY-MM-DD')} 23:59:59`;
    }
    if (params.condition) {
      data.condition = params.condition.replace(/(^\s*)|(\s*$)/g, '');
    }
    if (params.pageno) {
      data.pageno = params.pageno;
    }
    if (params.pagesize) {
      data.pagesize = params.pagesize;
    }
    data.plat = 'web';
    data.evttype = 'gw';
    data.returnOnlyList = true;
    this.setState({tableloading: true})
    this.props.dispatch({
      type: 'workOrder/selectFieldworkList',
      payload: data,
      callback: ({success}) => {
        if (success) {
          this.setState({tableloading: false});
        }
      },
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
          modalDisplay: true,
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
    if (this.state.ModelData.taskId === 'copyWo') {
      this.reportEvent(paramsObj, paramsAttArray);
    } else {
      this.submitTaskFormData(paramsObj, paramsAttArray);
    }
  };

  reportEvent = (paramsObj, paramsAttArray) => {
    this.props.dispatch({
      type: 'workOrder/reportEventFormData',
      payload: {
        userid: this.props.user.gid,
        user: this.props.user.trueName,
        properties: JSON.stringify(paramsObj),
        eventtype: this.copyWoInfo.type,
      },
      callback: (res) => {
        if (paramsAttArray.length > 0) {
          this.props.dispatch({
            type: 'workOrder/submitAttach',
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

  submitTaskFormData = (paramsObj, paramsAttArray) => {
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
  }

  clearFormData = () => {
    this.setState({showModal: false, modalDisplay: false, loading: false});
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
    // const extent = this.map.mapCfg.extent;
    // this.map.centerAt({x: (extent.xmax + extent.xmin) / 2, y: (extent.ymax + extent.ymin) / 2});
    this.setState({
      showModal: false,
      modalDisplay: true,
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
      modalDisplay: true,
      showSearchTable: true,
      isShowMap: false,
    });
  };
  isWorkflowApproval = () => {
    console.log(this.state.ModelData, 'wocode')
    const {wocode, taskType, taskId} = this.state.ModelData
    this.setState({showModal: false, modalDisplay: false})
    this.props.dispatch(routerRedux.push(`/query/report-dangerwork?wocode=${wocode}&taskType=${taskType}&taskId=${taskId}`));
  }

  getCopyFormData = (data) => {
    this.copyWoInfo = data;
    this.props.dispatch({
      type: 'workOrder/getWorkorderFormData',
      payload: {
        processinstanceid: data.processInstancedId,
      },
      callback: () => {
        this.setState({
          ModelData: {taskId: 'copyWo', taskName: '工单复制'},
          showModal: true,
          modalDisplay: true,
        });
      },
    });
  }

  render() {
    const that = this;
    const eventTypeData = this.filterEventTypeData(this.props.eventTypeData);
    // const stationData = this.filterstationData(this.props.stationData);
    // 事件状态配置
    const eventStateData = [
      {name: '全部', value: '', more: this.state.checkNum.allNum, showDot: true},
      {name: '待处理', value: '0', more: this.state.checkNum.notCompleteNum, showDot: true},
      {name: '处理中', value: '1', more: this.state.checkNum.completeNum, showDot: true},
      {name: '已处理', value: '2', more: this.state.checkNum.overdueNum, showDot: true},
      {name: '关闭', value: '3', more: this.state.checkNum.overdueNum, showDot: true}];

    // 查询配置
    const queryData = [{
      name: 'condition',
      alias: '查询',
      value: this.state.params.condition,
      placeholder: this.state.params.eventType === '0' ? '上报人/描述/地址/工单编号/管控级别' : '上报人/描述/地址/工单编号',
      valueType: 'input',
      width: '235px',
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
      alias: '处理站点',
      valueType: 'ddl',
      value: this.state.params.department,
      selectValues: this.props.stationData,
      width: '150px',
    }];

    const action = (dd) => {
      let btns = (dd.items || []).map((btn, i) => {
        let btnN = Object.assign({}, btn);
        btnN.wocode = dd.wocode;
        return (<span
          key={i}
          style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getTaskFormData.bind(that, btnN)}
        >
          {btnN.taskName}
        </span>);
      });
      if (this.props.user.ecode === '0611' && dd.type == '0') {
        btns.push(<span
          key="copy"
          style={{marginRight: 20, cursor: 'pointer', color: '#1890ff'}}
          onClick={that.getCopyFormData.bind(that, dd)}
        >工单复制</span>);
      }
      return (<span style={{float: 'right', marginRight: 20}}>
        {btns}
      </span>);
    };

    const columns = [{
      key: '1',
      width: '7%',
      render: (text, record) => {
        let imgUrl = ['第三方施工', '故障上报', '隐患上报', 'GIS数据上报', '应急上报', '故障上报', '隐患上报', '碰接置换'][record.type.toString() ? record.type % 8 : Math.floor(Math.random() * 5)];
        let imgBackColor = ['#1890ff', '#bd85cd', '#f8d473', '#1890ff', '#1890ff', '#bd85cd', '#f8d473', '#abd275'][record.type.toString() ? record.type % 5 : Math.floor(Math.random() * 8)];
        return (<div className={styles.metaAvatar}>
          <span className={styles.avatarImage} style={{backgroundColor: imgBackColor}}>
            <img alt="" src={`../images/eventOverview/${imgUrl}.png`}/>
          </span>
        </div>);
      },
    }, {
      key: '2',
      width: '40%',
      render: (text, record) => {
        const eventType = parseInt(record.type, 10);
        return (
          <span>
            <div style={{fontWeight: 'bold'}}>
              <span style={{marginRight: 20}}>{record.accepter}</span>{record.typename}
            </div>
            <div className={styles.textOverflow}>地址:&nbsp;
              <Tooltip placement="topLeft" title={record.address} length={5}>{record.address}</Tooltip>
            </div>
            <br />
            { eventType === 0 || eventType === 30 || eventType === 31 ?
              (<div className={styles.textOverflow}>施工名称:&nbsp;
                <Tooltip placement="topLeft" title={record.sg_name}>{record.sg_name}</Tooltip>
              </div>) :
              (<div className={styles.textOverflow}>描述:&nbsp;
                <Tooltip placement="topLeft" title={record.remark}>{record.remark}</Tooltip>
              </div>)}
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
            <span>处理环节:&nbsp;{record.subStatename}</span>
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
      showTotal: (total, pageInfo) => { // 设置显示一共几条数据
        return <div style={{marginRight: this.width}}>共 {total} 条数据</div>;
      },
    };

    const field = {
      searchWidth: '700px',
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
        <div style={{display: this.state.isShowStation ? 'block' : 'none', marginRight: 13}}>
          <SearchPanel field={departmentConfig} onclick={this.onChangeDepartment} />
        </div>,
        <SearchPanel ref="searchpanel" field={queryData} onclick={this.onChangeCondition} />,
      ],
      table: <Table
        rowKey={(record) => record.gid}
        dataSource={this.props.workOrderList}
        columns={columns}
        loading={this.state.tableloading}
        pagination={pagination}
        showHeader={false}
        onRow={(record, index) => ({
          onDoubleClick: () => {
            let path = {
              pathname: '/order/workOrder-list-detail',
              processInstanceId: record.processInstancedId,
              type: record.type,
              formid: record.formid,
              workOrderNum: record.wocode,
              params: this.state.params,
              historyPageName: '/workOrder-list',
            };
            this.props.dispatch(routerRedux.push(path));
          },
        })}
      />,
    };


    return (
      <PageHeaderLayout>
        <div style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)'}}>
          {this.state.showSearchTable ?
            <SearchTablePanel field={field} onSearch={this.search} onReset={this.reset} /> : null}
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
          {this.state.modalDisplay && <Modal
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
                isWorkflowA={this.isWorkflowApproval}
                wocode={this.state.ModelData.wocode}
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
          </Modal>}
        </div>
      </PageHeaderLayout>
    );
  }
}
