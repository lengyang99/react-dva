import React, { PureComponent } from 'react';
import { Tabs, message, Pagination, Collapse, Modal, Button, Select, Col } from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';
import moment from 'moment';
const Option = Select.Option;

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

import { connect } from 'dva';
import parseValues from '../../utils/utils';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import TaskCardList from '../../components/CardList/TaskCardList';
import TaskSearch from './SearchPanel/TaskSearch';


@connect(({ station, login }) => ({
  groups: station.groups,
  taskData: station.taskData,
  stations: station.stations,
  planLoading: station.planLoading,
  showTaskDlg: station.showTaskDlg,
  taskInfo: station.taskInfo,
  taskTotal: station.taskTotal,
  taskPaginations: station.taskPaginations,
  user: login.user || []
}))

export default class TaskList extends PureComponent {
  constructor(props) {
    super(props);
    // this.initParams();
  }
  state = {
    groups: [],
    currTab: '',
    searchParams: {},
    visible: false,
    stationName: '',
  };
  defaultPage = {
    pageno: 1,
    pagesize: 10,
  };
  stateValues = [
    { name: 0, alias: '未完成' },
    { name: 1, alias: '完成' },
  ];
  planId = '';
  groupName = ''
  stationId = '';
  ecode = '';
  stationName = '';

  componentWillMount(){
    if(this.props.location.search !== ""){
      this.initParams()
    }
  }
  componentDidMount() {
    if(this.props.location.search === ""){
      this.props.dispatch({
        type: 'station/getStationData',
        callback: (res) => {
          console.log(res.data, 'ews');
          const stationId = res.data ? res.data[0].gid : '';
          this.stationId = stationId;
          this.ecode = res.data ? res.data[0].ecode : '';
          this.setState({
            stationName: res.data ? res.data[0].name : '',
          })
          this.props.dispatch({
            type: 'station/queryGroups',
            payload:{stationId},
            callback: (data, key) => {
              this.setState({
                // currTab: key,
                groups: data,
              });
            this.groupName = key;
            this.queryTaskList({...this.defaultPage, areaId: key});
            },
          });
        }
      });
    }else{
      this.props.dispatch({
        type: 'station/queryGroups',
        payload: { stationId: this.stationId },
        callback: (data, key) => {
          this.setState({
            groups: data,
            stationName: this.stationName,
          })
        }
      })
      if(this.planId){
        this.setState({ currTab: this.groupName });
        const st = moment(new Date()).format('YYYY-MM-DD 00:00:00');
        const et = moment(new Date()).add('days', 2).format('YYYY-MM-DD 23:59:59')
        this.queryTaskList({...this.defaultPage, areaId: this.groupName, startTime: st, endTime: et})
      }else{
        // this.setState({ currTab: this.groupName });
        // this.queryTaskList({...this.defaultPage, group: this.groupName})
        this.tabChangeHandle(this.groupName)
      }
    }
  };

  componentWillUnmount(){
    //重写组件的setState方法，直接返回空
    this.setState = (state,callback)=>{
      return;
    };
  }
  initParams = () => {
    const { location: { search } } = this.props;
    const { equipmentUnitId, groupName, stationId, stationName, ecode } = parseValues(search) || '';
    this.planId = equipmentUnitId;
    this.groupName = groupName;
    this.stationId = stationId;
    this.stationName = stationName;
    this.ecode = ecode;
  };

  queryTaskList = (params) => {
    //点击任务后跳转 再去查询应包含planId,此处明天写
    if (this.planId !== '') {
      Object.assign(params, { equipmentUnitId: this.planId });
    }
    const { taskPaginations, dispatch} = this.props;
    const { current, pageSize } = taskPaginations;
    const { startTime, endTime } = params;
    const mon = moment();
    dispatch({
      type: 'station/queryTasks',
      payload: {
        stationId: this.stationId,
        pageno: current,
        pagesize: pageSize,
        function: 'station_patrol',
        areaId: params.areaId,
        ...params,
        startTime: startTime || mon.format('YYYY-MM-DD 00:00:00'),
        endTime: endTime || mon.format('YYYY-MM-DD 23:59:59'),
        // startTime: '2017-12-24 23:59:59',
        // endTime: '2018-12-24 23:59:59',
      }
    });
  };


  tabChangeHandle = (key) => {
    this.planId='';
    this.setState({ currTab: key, searchParams: {} });
    this.queryTaskList({ ...this.defaultPage, areaId: key });
  };

  detailHandle = (data) => {
    const { status } = data;
    if (status === 0) {
      message.warn('任务未开始', 3);
      return;
    }
    // this.props.dispatch({
    //   type: 'station/getTaskInfo',
    //   payload: {
    //     taskId: taskId
    //   }
    // });
    const { equipmentUnitId } = data;
    const startTime = moment(new Date()).format('YYYY-MM-DD 00:00:00');
    const endTime = moment(new Date()).add('days', 2).format('YYYY-MM-DD 23:59:59')
    const stationId = this.stationId;
    const ecode = this.ecode;
    const areaId = this.state.currTab;
    const stationName = this.state.stationName;
    console.log(stationId, ecode);

    // this.props.history.push(`/station/task-detail?planId=${planId}&st=${startTime}&et=${endTime}`);
    this.props.history.push(`/station/task-detail?areaId=${areaId}&equipmentUnitId=${equipmentUnitId}&stationId=${stationId}&st=${startTime}&et=${endTime}&stationName=${stationName}`);
  };

  onDialogClose = () => {
    this.props.dispatch({
      type: 'station/setTaskDialogVisible',
      payload: false
    });
  };

  onExpOnChange = (data) => {
    this.planId = ''
    this.queryTaskList({
      ...data,
      areaId: this.state.currTab,
    });
    this.setState({
      searchParams: data,
      pageno: 1
    });
  };

  onChange = (page, pageSize) => {
    this.setState({
      current: page,
      pageSize: pageSize
    })
    this.queryTaskList({
      ...this.state.searchParams,
      areaId: this.state.currTab,
      pageno: page,
      pagesize: pageSize
    });
  };
  showTotal = () => {
    const { pageSize, current, total } = this.props.taskPaginations;
    return <div>共 {total} 条记录</div>
    {/* 第{current}/{Math.ceil(total/pageSize)}页</div>; */ }
  };
  onShowSizeChange = (current, size) => {
    this.setState({
      current: current,
      pageSize: size
    });
    this.queryTaskList({ ...this.state.searchParams, areaId: this.state.currTab, pageno: current, pagesize: size });
  };
  // 调整顺序；
  changeIdx = () => {
    this.setState({
      visible: true,
    });
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  moveUpHandler = (val, key) => {
    const arr = [...this.state.groups]
    if(key === 0){
      return
    }
    const temp = arr[key];
    arr[key] = arr[key - 1];
    arr[key - 1] = temp;
    this.setState({
      groups: arr,
    });
  };

  moveDownHandler = (val, key) => {
    const arr = [...this.state.groups]
    if(key === arr.length - 1){
      return
    }
    const temp = arr[key];
    arr[key] = arr[key + 1];
    arr[key + 1] = temp;
    this.setState({
      groups: arr,
    });
  };

  changeHandler = (val, node) => {
    const {dataRef} = node.props;
    this.stationId = val;
    this.props.dispatch({
        type: 'station/queryGroups',
        payload: { stationId: val },
        callback: (data, key) => {
          this.setState({
            groups: data,
            stationName: dataRef.name,
          })
        }
      })
  };

  render() {
    const { taskData: data, showTaskDlg, taskInfo, taskTotal: total, taskPaginations } = this.props;
    const { groups } = this.state;
    const stations = [...this.props.stations];
    // stations.unshift({gid: '', name: '全部'})
    console.log(this.state.currTab, "planName");
    let tabs = (groups && groups.length < 1) ?
      ['　'] : groups;
    const panes = tabs.map((ii, index) => {
      return (<TabPane
        tab={ii.name}
        key={ii.gid}
      >
        <TaskSearch
          ref='childrenSearch'
          stateValues={this.stateValues}
          station={[]}
          expOnChange={this.onExpOnChange}
        >
        </TaskSearch>
        <div style={{ marginTop: 10, paddingRight: 10 }}>
          <TaskCardList
            stateValues={this.stateValues}
            // data={data[`${ii}${this.planId}`] || []}
            data={data[`${ii.gid}`] || []}
            detailClick={this.detailHandle}
          />
        </div>
        <div style={{ position: 'relative', left: '50%' }}>
          <Pagination
            total={total[ii] || 0}
            current={taskPaginations.current}
            pageSize={taskPaginations.pageSize}
            showQuickJumper={true}
            showSizeChanger={true}
            onShowSizeChange={this.onShowSizeChange}
            onChange={this.onChange}
            showTotal={this.showTotal}
          />
        </div>
      </TabPane>)
    }
      );
    return (
      <PageHeaderLayout>
        <div style={{ backgroundColor: '#fff', minHeight: '60vh' }}>
          <div style={{width: '80%', height: 30, margin: '30px 20px', paddingTop: 15}}>
              <label>站点：</label>
              <Select
                defaultValue="全部"
                style={{ width: 120 }}
                value={this.state.stationName}
                onSelect={this.changeHandler}>
                {
                  stations && stations.map((item) =>
                    <Option key={item.gid} value={item.gid} dataRef={item}>{item.name}</Option>
                  )
                }
              </Select>
          </div>
          {
            this.state.currTab ?
            <Tabs
              activeKey={this.state.currTab}
              onChange={this.tabChangeHandle}
              tabBarExtraContent={(<Button onClick={this.changeIdx} style={{marginRight:30}}>调整顺序</Button>)}
            >
              {panes}
            </Tabs> :
            <Tabs
              onChange={this.tabChangeHandle}
              tabBarExtraContent={(<Button onClick={this.changeIdx} style={{marginRight:30}}>调整顺序</Button>)}
            >
              {panes}
            </Tabs>
          }
          
          <Modal
            title="顺序调整"
            visible={this.state.visible}
            onOk={this.handleCancel}
            onCancel={this.handleCancel}
          >
            {
              groups && groups.map((item, index) => {
                return <div key={item.gid} style={{width: '100%', marginBottom: 5}}>
                  <span style={{marginRight: 15}}>{index + 1}</span>
                  <span >{item.name}</span>
                  <a onClick={() => this.moveUpHandler(item, index)}   style={{marginRight: 10, float: 'right'}}>上移</a>
                  <a onClick={() => this.moveDownHandler(item, index)} style={{float: 'right'}}>下移</a>
                </div>
              })
            }
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}
