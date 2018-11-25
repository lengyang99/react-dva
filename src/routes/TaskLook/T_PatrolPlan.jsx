import React, { Component } from 'react';
import { DatePicker, message, Input, Select, Button, TreeSelect } from 'antd';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SelectPanel from '../commonTool/SelectPanelTool/SelectPanel';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel';
import CardList from '../../components/CardList/CardList';
import SearchTablePanel from '../commonTool/SearchTablePanel/SearchTablePanel';
import moment from 'moment';
import Dialog from '../../components/yd-gis/Dialog/Dialog';

const Option = Select.Option;

const RangePicker = DatePicker.RangePicker;

const defaultParams = {
  checkid: '', // 任务状态
  stationid: '', // 站点
  stime: null, // 开始时间
  etime: null, // 结束时间
  condition: '', //  快速索引 编号 计划名称 区域名称 备注
  pageno: 1,
  pagesize: 9,
  checkTime: '', // 任务时间
  checkType: '', // 任务类型
};

const TransferTaskDialog = ({ taskInfo, taskReceiverList, onCancel, onSure, onChangeTaskReceiver, currentTaskReceiver,  onChangeTime, onPatrolorChange, userids}) => {
  let taskReceiverOps = [];
  // taskReceiverList.map((item, index) => {
  //   taskReceiverOps.push(<Option key={`${index}`} value={`${item.userid}`} tname={`${item.truename}`}>{item.truename}</Option>);
  // });
  const spanStyle = {
      paddingLeft: 6,
      color: 'red',
  }
  return (
    <Dialog
      title={'转交任务'}
      width={300}
      position={{ top: 255, left: 660 }}
      onClose={onCancel}
    >
      <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8, paddingLeft: 14 }}>
        <span>任务名称:</span>
        <Input style={{ width: 185, marginLeft: 8 }} type={'text'} value={`${taskInfo.name}`} />
        <span style={spanStyle}>*</span>
      </div>
      <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8 }}>
        <span>任务接收人:</span>
        {/* <Select
          mode="multiple"
          value={currentTaskReceiver}
          onChange={onChangeTaskReceiver}
          style={{ width: 185, marginLeft: 8 }}
        >
          {taskReceiverOps}
        </Select> */}
        <TreeSelect
          style={{width: 185, height:'calc(100%)', maxHeight: 'calc(100vh - 628px)', minHeight: 33, marginLeft: 8}}
          treeData={taskReceiverList}
          dropdownStyle={{maxHeight: 300, overflow: 'auto'}}
          value={currentTaskReceiver}
          onChange={onPatrolorChange}
          multiple={true}
          treeCheckable={true}
          placeholder='请选择'
          filterTreeNode={(inputValue, treeNode)=>{
            if (treeNode.props.title.indexOf(inputValue) >= 0) {
              return true;
            }else {
              return false; 
            }
          }}>
        </TreeSelect>
        <span style={spanStyle}>*</span>
      </div>
      <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8, paddingLeft: 14 }}>
        <span>开始日期:</span>
        <DatePicker onChange={(date, dateString) => onChangeTime(date, dateString, 'startDate')} style={{ width: 185, marginLeft: 8 }}/>
        <span style={spanStyle}>*</span>
      </div>
      <div style={{ marginTop: 8, marginLeft: 14, marginBottom: 8, paddingLeft: 14 }}>
        <span>结束日期:</span>
        <DatePicker onChange={(date, dateString) => onChangeTime(date, dateString, 'endDate')} style={{ width: 185, marginLeft: 8 }}/>
        <span style={spanStyle}>*</span>
      </div>
      <div style={{ marginLeft: 175 }}>
        <Button size={'small'} onClick={onCancel}>取消</Button>
        <Button size={'small'} onClick={onSure} style={{ marginLeft: 8 }}>确定</Button>
      </div>
    </Dialog>
  );
}

@connect(state => ({
  user: state.login.user,
  patrolTaskData: state.patrolTaskList.patrolTaskList,
  taskTotal: state.patrolTaskList.taskTotal,
  checkNum: state.patrolTaskList.checkNum,
  stationData: state.patrolPlanList.stationData,
  patrolLayerInfo: state.patrolTaskList.patrolLayerInfo,
  authorityMenu: state.patrolTaskList.authorityMenu,
  taskReceiverList: state.patrolTaskList.taskReceiverList,
}))

export default class T_PatrolPlan extends Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    let params = { ...defaultParams };
    this.isExpand = false; // 展开和收起
    if (this._tool.params) {
      params = { ...this._tool.params };
      this.isExpand = this._tool.isExpand;
    }
    if (this._tool.planid) {
      params = { ...defaultParams, planid: this._tool.planid, condition: this._tool.name, stime: this._tool.stime, etime: this._tool.etime };
      this.isExpand = true;
    }
    this.state = {
      // 数据
      // tData: [], // 任务数据
      // stationData: [{name: '全部', value: ''}], // 站点数据
      // checkNum: {allNum: 0, notCompleteNum: 0, completeNum: 0, overdueNum: 0},
      // 参数
      Patrolparams: { ...params },
      isShowStation: true,
      tableHieght: window.innerHeight - 191, // 表格高
      stationColor: {},//所的颜色配置
      transferTaskInfo: {}, // 要进行转交的任务的详情
      showTransferTask: false, // 是否展示任务转交
      currentTaskReceiver: [], // 转交任务接收人编号
      currentTaskReceiverName: this.props.user.trueName, // 转交任务接收人名称
      startDate: null,
      endDate: null,
      subUserids: '',
      signUser: 0,
    };
  }
  componentDidMount() {
    this.queryStationData();
    this.getPatrolLayerInfo();
    this.getSearchValue();
    window.addEventListener('resize', this.onWindowResize);
    window.addEventListener('keydown', this.onKeyDownEvent); 
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onWindowResize);
    window.removeEventListener('keydown', this.onKeyDownEvent); 
    
  }

  onWindowResize = () => {
    this.setState({
      tableHieght: window.innerHeight - 191
    });
  };

  onKeyDownEvent = (ev) => {
    var ev = ev || window.event;
    let params = this.state.Patrolparams;
    if (params.planid) {
      delete params.planid;
    }
    let searchArr = []
    Object.values(this.state.Patrolparams).map(item => {
      if(item !== "" && item !== null && item !== undefined ){
        searchArr.push(item)
      }
    })
    console.log(searchArr, 'searchArr')
    if (ev.keyCode == 13 && searchArr.length > 2) { // Esc
      this.search();
    }
  }

  // ******************************************************查询状态改变
  // 任务状态改变
  checkidChange = (valueObj) => {
    let params = this.state.Patrolparams;
    params.checkid = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  };

  // 时间改变
  timeChange = (value) => {
    let params = this.state.Patrolparams;
    params.stime = value[0];
    params.etime = value[1];
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  };

  // 站点改变
  searchChange = (searchObj) => {
    let params = this.state.Patrolparams;
    params.stationid = searchObj.stationid;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  };

  // 快速搜索改变
  onChangeCondition = (searchObj) => {
    let params = this.state.Patrolparams;
    params.condition = searchObj.queryIndex;
    this.setState({
      Patrolparams: params,
    });
  };

  // ******************************************************数据获取
  // 获取站点数据
  queryStationData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload: {
        stationType: 'A',
      },
      callback: ({ stationList: res, stationObj }) => {
        this.setState({ stationColor: stationObj });
        if (res.length === 0) {
          this.setState({
            isShowStation: false,
          });
        } else if (res.length === 1) {
          let params = this.state.Patrolparams;
          params.stationid = res[0].value;
          this.setState({
            Patrolparams: params,
          });
          this.getSearchValue();
        }
      }
    });
  };

  filterStationData = (datas) => {
    let stationConfigs = [];
    if (!datas) {
      return stationConfigs;
    }
    if (datas.length !== 1) {
      stationConfigs = [{ name: '全部', value: '' }];
    }
    for (let i = 0; i < datas.length; i++) {
      stationConfigs.push({
        name: datas[i].locName,
        value: datas[i].locCode + '',
      });
    }
    return stationConfigs;
  };

  // 获取任务数据
  getSearchValue = () => {

    let paramdata = {};
    // let planid = utils(this.props.location.search).planid;
    // 计划id
    // if (planid !== undefined) {
    //   paramdata.planid = planid;
    // }
    if (this.state.Patrolparams.planid !== undefined) {
      paramdata.planid = this.state.Patrolparams.planid;
    }
    if (this.props.user.gid !== '') {
      paramdata.userid = this.props.user.gid;
    }
    // 任务状态
    if (this.state.Patrolparams.checkid !== '') {
      paramdata.checkid = this.state.Patrolparams.checkid;
    }
    // 开始时间
    if (this.state.Patrolparams.stime !== null && this.state.Patrolparams.stime !== undefined) {
      paramdata.startTime = this.state.Patrolparams.stime.format('YYYY-MM-DD');
    }
    // 结束时间
    if (this.state.Patrolparams.etime !== null && this.state.Patrolparams.stime !== undefined) {
      paramdata.endTime = this.state.Patrolparams.etime.format('YYYY-MM-DD');
    }
    // 站点
    if (this.state.Patrolparams.stationid !== '') {
      paramdata.stationid = this.state.Patrolparams.stationid;
    }
    // 快速索引——编号、区域名称、计划名称
    if (this.state.Patrolparams.condition !== '') {
      paramdata.condition = this.state.Patrolparams.condition.replace(/(^\s*)|(\s*$)/g, "");
    }
    if (this.state.Patrolparams.pageno !== '') {
      paramdata.pageno = this.state.Patrolparams.pageno;
    }
    if (this.state.Patrolparams.pagesize !== '') {
      paramdata.pagesize = this.state.Patrolparams.pagesize;
    }
    // 任务类型
    if (this.state.Patrolparams.type !== '') {
      paramdata.type = this.state.Patrolparams.type;
    }
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolTaskData',
      payload: paramdata,
    });
  };

  // 查询
  search = () => {
    let params = this.state.Patrolparams;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    if (params.planid) {
      delete params.planid;
    }
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  };

  // 重置
  reset = () => {
    let params = this.state.Patrolparams;
    params.checkid = '';
    params.stationid = '';
    params.stime = null;
    params.etime = null;
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    params.checkTime = '';
    params.checkType = '';
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  };

  // 查看 gid usernames name startTime endTime arriveNum totalNum feedbackNum
  lookClick = (record, taskStateInfo) => {
    let path = {
      pathname: '/query/patrol-task-detail',
      data: {
        gid: record.gid,
        usernames: record.usernames,
        name: record.name,
        startTime: record.startTime,
        endTime: record.endTime,
        arriveNum: record.arriveNum,
        totalNum: record.totalNum,
        feedbackNum: record.feedbackNum,
        totalLine: record.totalLine,
        arriveLine: record.arriveLine,
        totalKeyline: record.totalKeyline,
        arriveKeyline: record.arriveKeyline,
        layerids: record.layerids,
        taskInfoArrive: record.taskInfoArrive,
      },
      state: { test: 'test' },
      params: this.state.Patrolparams,
      isExpand: this.isExpand,
      taskStateInfo: taskStateInfo,
      patrolLayerInfo: this.props.patrolLayerInfo,
    };
    this.props.dispatch(routerRedux.push(path));
  };

  // 统计任务的时间区间改变
  taskTimeChange = (valueObj) => {
    let params = this.state.Patrolparams;
    params.checkTime = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    switch (valueObj.value) {
      case 'w':
        params.stime = moment().startOf('week');
        params.etime = moment().endOf('week');
        break;
      case 'm':
        params.stime = moment().startOf('month');
        params.etime = moment().endOf('month');
        break;
      case 'y':
        params.stime = moment().startOf('year');
        params.etime = moment().endOf('year');
        break;
      default:
        params.stiem = null;
        params.etime = null;
        break;
    }
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  }

  // 任务类型改变
  taskTypeChange = (valueObj) => {
    let params = this.state.Patrolparams;
    params.checkType = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    switch (valueObj.value) {
      case '':
        params.type = '';
        break;
      case '0':
      case '1':
        params.type = valueObj.value;
        break;
      default:
        break;
    }
    this.setState({
      Patrolparams: params,
    });
    this.getSearchValue();
  }

  // 获取区域巡检对象的元数据列表
  getPatrolLayerInfo = () => {
    this.props.dispatch({
      type: 'patrolTaskList/getPatrolLayerInfo',
    });
  }

  // 删除任务
  delTask = (taskGid) => {
    this.props.dispatch({
      type: 'patrolTaskList/delTaskByGid',
      gid: taskGid,
    });
    this.getSearchValue();
  }

  // 转交任务
  transferTask = (taskInfo) => {
    const {taskReceiverList, user} = this.props;
    console.log(this.state.signUser, user.gid, 'user.gid')
    let useridsArr = [];
    const userArr = taskInfo.userids.split(',');
    userArr && userArr.length > 0 && userArr.map(item => {
      const stationid = taskInfo.stationid ? taskInfo.stationid : ''
      useridsArr.push('u' + item.toString() + '_' + stationid)
    });
    if(this.state.signUser !== user.gid || taskReceiverList.length === 0){
      this.props.dispatch({
        type: 'patrolTaskList/getUserInfoByStationCode',
        stationCode: user.gid,
        callback: (res) => {
          console.log(res, 'res')
          if(res.success){
            this.setState({
              currentTaskReceiver: useridsArr,
              currentTaskReceiverName: taskInfo.usernames,
            })
          }
        }
      });
    }else{
      this.setState({
        currentTaskReceiver: useridsArr,
        currentTaskReceiverName: taskInfo.usernames,
      })
    }
    this.setState({
      transferTaskInfo: taskInfo,
      showTransferTask: true,
      signUser: user.gid,
    });
  }

  handleTransferTask = () => {
    const {currentTaskReceiverName, subUserids, startDate, endDate} = this.state;
    if(!currentTaskReceiverName || !subUserids || !startDate || !endDate){
      message.warn("请填写完整信息！")
      return 
    }
    this.props.dispatch({
      type: 'patrolTaskList/transferTask',
      payload: {
        taskId: this.state.transferTaskInfo.gid,
        newUserId: this.state.subUserids,
        newUserName: this.state.currentTaskReceiverName,
        startDate,
        endDate,
      },
      callback: () => {
        this.getSearchValue();
        this.setState({ showTransferTask: false });
      },
    });
  }

  closeTransferTask = () => {
    this.setState({
      showTransferTask: false,
      transferTaskInfo: {},
      currentTaskReceiver: ['0'],
      currentTaskReceiverName: '',
    });
  }

  onChangeTaskReceiver = (value, option) => {
    let tmpnames = [];
    option.map((item) => {
      tmpnames.push(item.props.tname);
    });
    this.setState({
      currentTaskReceiver: value,
      currentTaskReceiverName: tmpnames.join(','),
    });
  };

  onChangeTime = (date, dateString, fieldName) => {
    console.log(date, dateString, fieldName, 'datechange' )
    this.setState({
      [fieldName]: dateString
    })
  };

  //选择转交人
  onPatrolorChange = (value, label, object) => {
    let checknode = object.allCheckedNodes;
    let userid = [];
    this.getSelectPersonData(checknode, userid);
    console.log(userid, '11111')
    this.setState({
      currentTaskReceiver: value,
      currentTaskReceiverName: label.toString(),
      subUserids: userid.toString()
    });
  };

  getSelectPersonData = (checknode, userid) => {
    for (let i = 0; i < checknode.length; i++) {
      if (checknode[i].node  && checknode[i].node.key.indexOf('s') < 0) {
        userid.push(checknode[i].node.props.attributes.userid);
      }else if(!checknode[i].node  && checknode[i].key.indexOf('s') < 0){
        userid.push(checknode[i].props.attributes.userid);
      }
      if (checknode[i].children && checknode[i].children.length > 0) {
        this.getSelectPersonData(checknode[i].children, userid);
      }
    }
  };

  render() {
    let that = this;
    // const stationData = this.filterStationData(this.props.stationData);
    // 站点下拉配置
    const stationConfig = [{
      name: 'stationid',
      alias: '所属组织',
      valueType: 'ddl',
      value: this.state.Patrolparams.stationid,
      selectValues: this.props.stationData,
      width: '200px'
    }];

    // 查询配置
    const queryData = [{
      name: 'queryIndex',
      alias: '查询',
      value: this.state.Patrolparams.condition,
      placeholder: '巡检员，计划名称',
      valueType: 'input',
      width: '260px'
    }];

    // 任务状态配置
    const TaskStateData = [{
      name: '全部', value: '', more: this.props.checkNum.allNum, showDot: true
    }, {
      name: '未完成', value: '1', more: this.props.checkNum.notCompleteNum, showDot: true
    }, {
      name: '完成', value: '2', more: this.props.checkNum.completeNum, showDot: true
    },
    {
      name: '超期', value: '3', more: this.props.checkNum.overdueNum, showDot: true
    }];

    // 表格分页
    const pagination = {
      total: parseInt(that.props.taskTotal, 10),
      current: that.state.Patrolparams.pageno,
      pageSize: that.state.Patrolparams.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      onChange(page, pageSize) {
        let params = that.state.Patrolparams;
        params.pageno = page;
        params.pagesize = pageSize;
        that.setState({
          Patrolparams: params,
        });
        that.getSearchValue();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.Patrolparams;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          Patrolparams: params,
        });
        that.getSearchValue();
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      }
    };

    // 任务时间配置：本周、本月、本年
    const TaskTimeData = [
      { name: '本周', value: 'w', more: '', showDot: true },
      { name: '本月', value: 'm', more: '', showDot: true },
      { name: '本年', value: 'y', more: '', showDot: true }
    ];

    // 任务类型配置
    const TaskTypeData = [
      { name: '全部', value: '', more: '', showDot: true },
      { name: '常规', value: '1', more: '', showDot: true },
      { name: '临时', value: '0', more: '', showDot: true },
    ];

    // 任务页面配置
    const field = {
      searchWidth: '725px',
      search: [
        <SelectPanel fieldName="任务状态" value={this.state.Patrolparams.checkid} dataType="ddl" showMoreInfo={true}
          data={TaskStateData} onclick={this.checkidChange} />,
        <SelectPanel fieldName="任务时间" value={this.state.Patrolparams.checkTime} dataType="ddl" showMoreInfo={false}
          data={TaskTimeData} onclick={this.taskTimeChange} />,
        <SelectPanel fieldName="任务类型" value={this.state.Patrolparams.checkType} dataType="ddl" showMoreInfo={false}
          data={TaskTypeData} onclick={this.taskTypeChange} />,
        this.state.isShowStation ? <SearchPanel field={stationConfig} onclick={this.searchChange} /> : null
      ],
      extra: [
        <RangePicker style={{ width: 230, marginTop: -5, marginLeft: 20 }}
          value={[this.state.Patrolparams.stime, this.state.Patrolparams.etime]}
          onChange={this.timeChange} />,
        <SearchPanel ref="searchpanel" field={queryData} onclick={this.onChangeCondition} />
      ],
      table: <CardList data={this.props.patrolTaskData}
        stationData={this.state.stationColor}
        moreHandleClick={this.onChangePage}
        detailClick={this.lookClick}
        title="assigneeName"
        // titleExtra={(dd) =>
        //   dd.checkid === 1 ?
        //     <span style={{ color: '#f00' }}>{`${dd.checkState}(${dd.totalNum - dd.arriveNum})`}</span> :
        //     <span style={{ color: '#333' }}>{dd.checkState}</span>
        // }
        titleExtra={(dd) =>
          dd.checkid === 1 ?
            <span>{dd.checkState}</span> :
            <span>{dd.checkState}</span>
        }
        progressOption={
          {
            arrive: 'arriveNum',
            feedback: 'feedbackNum',
            total: 'totalNum',
          }
        }
        pagination={pagination}
        patrolLayerInfo={this.props.patrolLayerInfo}
        authorityMenu={this.props.authorityMenu}
        delTask={this.delTask}
        transferTask={this.transferTask}
      />,
    };
    return (
      <PageHeaderLayout>
        <div style={{ width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)' }}>
          <SearchTablePanel field={field} isDefaultExpand={this.isExpand} onSearch={this.search} onReset={this.reset} />
        </div>
        {
          this.state.showTransferTask ?
            <TransferTaskDialog
              taskInfo={this.state.transferTaskInfo}
              taskReceiverList={this.props.taskReceiverList}
              onSure={this.handleTransferTask}
              onCancel={this.closeTransferTask}
              onChangeTime={(date, dateString, fieldName) => this.onChangeTime(date, dateString, fieldName)}
              onPatrolorChange={this.onPatrolorChange}
              onChangeTaskReceiver={this.onChangeTaskReceiver}
              currentTaskReceiver={this.state.currentTaskReceiver}
              userids={this.state.userids}
            /> : null
        }
      </PageHeaderLayout >
    )
  }
}
