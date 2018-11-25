import React, {Component} from 'react';
import {Table, Menu, Icon, Dropdown, Modal, Tooltip} from 'antd';
import SelectPanel from '../commonTool/SelectPanelTool/SelectPanel.js';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel.js';
import SearchTablePanel from '../commonTool/SearchTablePanel/SearchTablePanel.js';
import styles from './PatrolSPlan.less';
const confirm = Modal.confirm;
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';

const defaultParams = {
  isstoped: '',   // 计划状态
  type: '',        // 计划类型
  stationid: '',  // 站点id
  condition: '',  // 快速索引
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  patrolPlanData: state.patrolPlanList.patrolPlanList,
  planTotal: state.patrolPlanList.planTotal,
  stationData: state.patrolPlanList.stationData,
}))

export default class P_PlanInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 参数
      Patrolparams: {
        ...defaultParams,
      },
      // 状态值
      isShowStation: true,
      presentRowId: '', // 当前行gid
      tableHieght: window.innerHeight - 370,
      stationColor:{},//所对应的颜色
    };
    this.queryStationidData();
    this.queryPlanData();
  }

  componentDidMount() {
    // 获取行走方式
    this.props.dispatch({
      type: 'patrolPlanList/getWalkWay',
    })

  }

  componentWillUnmount() {

  }

  conponentDidUpdate() {

  }

  // ********************************************查询改变
  // 计划状态改变
  onChangeState = (valueObj) => {
    let params = this.state.Patrolparams;
    params.isstoped = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.queryPlanData();
  };

  // 计划类型改变
  onChangeType = (valueObj) => {
    let params = this.state.Patrolparams;
    params.type = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.queryPlanData();
  };

  // 站点id改变
  onChangeStationid = (searchObj) => {
    let params = this.state.Patrolparams;
    params.stationid = searchObj.stationid;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.queryPlanData();
  };

  // 快速搜索改变
  onChangeCondition = (searchObj) => {
    let params = this.state.Patrolparams;
    params.condition = searchObj.queryIndex;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
  };

  // 获取站点数据
  queryStationidData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload:{
        stationType: 'A',
      },
      callback: ({stationList:res,stationObj}) => {
        this.setState({stationColor:stationObj});
        if(res.length === 0){
          this.setState({
            isShowStation: false,
          });
        }else if(res.length === 1){
          let params = this.state.Patrolparams;
          params.stationid = res[0].value;
          this.setState({
            Patrolparams: params,
          });
          this.queryPlanData();
        }
      }
    });
  };

  filterStationData = (datas) => {
    let stationConfigs = [];
    if (!datas) {
      return stationConfigs;
    }
    if(datas.length !== 1){
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

  // 获取计划数据
  queryPlanData = () => {
    let data = {};
    // if (this.props.user.userid !== '') {
    //   data.userid = this.props.user.gid;
    // }
    if (this.state.Patrolparams.isstoped !== '') {
      data.isstoped = this.state.Patrolparams.isstoped; // 计划状态
    }
    if (this.state.Patrolparams.type !== '') {
      data.type = this.state.Patrolparams.type; // 计划状态
    }
    if (this.state.Patrolparams.stationid !== '') {
      data.stationid = this.state.Patrolparams.stationid; // 站点stationid
    }
    if (this.state.Patrolparams.condition !== '') {
      data.condition = this.state.Patrolparams.condition.replace(/(^\s*)|(\s*$)/g, "");// 快速索引
    }
    if (this.state.Patrolparams.pageno !== '') {
      data.pageno = this.state.Patrolparams.pageno;
    }
    if (this.state.Patrolparams.pagesize !== '') {
      data.pagesize = this.state.Patrolparams.pagesize;
    }
    this.props.dispatch({
      type: 'patrolPlanList/getPatrolPlanData',
      payload: data,
    });
  };

  filterPlanData = (datas) => {
    if (!datas) {
      return [];
    }
    for (let i = 0; i < datas.length; i++) {
      let patrolLayer = [];
      let layerids = [];
      if(datas[i].patrolLayerList && datas[i].patrolLayerList.length > 0){
        for (let j = 0; j < datas[i].patrolLayerList.length; j++) {
          patrolLayer.push(datas[i].patrolLayerList[j].name);
          layerids.push(datas[i].patrolLayerList[j].gid);
        }
        datas[i].patrolLayer = patrolLayer.toString();
        datas[i].layerids = layerids.toString();
      }
    }
    return datas;
  };

  // 启用计划
  startPlan = (plan) => {
    let that = this;
    confirm({
      title: '是否开启计划?',
      onOk() {
        that.props.dispatch({
          type: 'patrolPlanList/channgePatrolPlanState',
          payload: {
            gid: plan.gid,
            isStoped: 0,
          },
          callback: () => {
            that.queryPlanData();
          }
        });
      },
      onCancel() {
      }
    });
  };

  // 停用计划
  stopPlan = (plan) => {
    let that = this;
    confirm({
      title: '是否停用计划?',
      onOk() {
        that.props.dispatch({
          type: 'patrolPlanList/channgePatrolPlanState',
          payload: {
            gid: plan.gid,
            isStoped: 1,
          },
          callback: () => {
            that.queryPlanData();
          }
        });
      },
      onCancel() {
      }
    });
  };

  // 编辑计划
  editPlan = (record) => {
    //userids usernames areaid stationid station layerids cycleid speedid name planArea.areaPolygon planArea.pathPolygon
    // this.props.dispatch(routerRedux.push('/query/patrol-plan-add?actionType=updatePlan' + '&type=' + plan.type  + '&gid=' + plan.gid + '&userids=' + plan.userids + '&usernames=' + plan.usernames
    //   + '&areaid=' + plan.areaid + '&stationid=' + plan.stationid + '&station=' + plan.station + '&layerids=' + plan.layerids + '&cycleid=' + plan.cycleid
    //   + '&speedid=' + plan.speedid + '&name=' + plan.name + '&areaPolygon=' + plan.planArea.areaPolygon + '&pathPolygon=' + plan.planArea.pathPolygon
    //   + '&startTime=' + plan.startTime+ '&endTime=' + plan.endTime));

    let path = {
      pathname: '/query/patrolS-plan-edit',
      data: {
        gid: record.gid,
        type: record.type,
        usernames: record.usernames,
        userids: record.userids,
        name: record.name,
        areaid: record.areaid,
        areaName: record.planArea.name,
        station: record.station,
        stationid: record.stationid,
        startTime: record.startTime,
        endTime: record.endTime,
        layerids: record.layerids,
        patrolLayer: record.patrolLayer,
        creator: record.creator,
        creatorid: record.creatorid,
        planCycle: record.planCycle,
        planSpeed: record.planSpeed,
        isschedule: record.isschedule,
        speedid: record.speedid,
        cycleid: record.cycleid,
      },
    };
    this.props.dispatch(routerRedux.push(path));
  };

  // 删除计划
  deletePlan = (plan) => {
    let that = this;
    confirm({
      title: '是否删除计划?',
      onOk() {
        that.props.dispatch({
          type: 'patrolPlanList/deletePatrolPlan',
          payload: {
            gid: plan.gid,
          },
          callback: () => {
            that.queryPlanData();
          },
        });
      },
      onCancel() {
      },
    });
  };
  // 生成任务
  generatePlan = (plan) => {
    this.props.dispatch({
      type: 'patrolPlanList/generatePlansForNow',
      payload: {
        planid: plan.gid,
      },
    });
  };

  // 新建计划
  insertPlan = () => {
    this.props.dispatch(routerRedux.push({pathname: '/query/patrolS-plan-add', type: 1}));
  };

  // 新建临时计划
  insertTempPlan = () => {
    this.props.dispatch(routerRedux.push({pathname: '/query/patrolS-plan-add', type: 0}));
  };

  // 历史计划
  historyPlan = (plan) => {
    this.setState({
      presentRowId: plan.gid,
    });
  };

  // 重置
  reset = () => {
    let params = this.state.Patrolparams;
    params.isstoped = '';
    params.type = '';
    params.stationid = '';
    params.condition = '';
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.queryPlanData();
  };

  // 查询
  search = () => {
    let params = this.state.Patrolparams;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
    this.queryPlanData();
  };

  render() {
    let that = this;
    const patrolPlanData = this.filterPlanData(this.props.patrolPlanData);
    // const stationData = this.filterStationData(this.props.stationData);
    const {stationColor}=this.state;
    // 计划状态
    const planStateData = [{
      name: '全部', value: '', showDot: true
    }, {
      name: '开启', value: '0', showDot: true
    }, {
      name: '停用', value: '1', showDot: true
    }];

    // 计划类型
    const planTypeData = [{
      name: '全部', value: '', showDot: true
    }, {
      name: '临时', value: '0', showDot: true
    }, {
      name: '常规', value: '1', showDot: true
    }];

    // 站点下拉配置
    const stationConfig = [{
      name: 'stationid',
      alias: '所属组织',
      valueType: 'ddl',
      value: this.state.Patrolparams.stationid,
      selectValues: this.props.stationData,
      width: '200px'
    }];

    // 快速搜索配置
    const queryData = [{
      name: 'queryIndex',
      alias: '快速搜索',
      value: this.state.Patrolparams.condition,
      valueType: 'input',
      placeholder: '巡检员，计划名称',
      width: '150px'
    }];

    // 表格列
    const columns = [
      {
        title: '计划名称', dataIndex: 'name', key: 'name', width: '15%',
        render(text, record) {
          return <div>
            {record.type === 0 ? <p style={{color: 'red'}}>临时</p> : <p style={{color: '#1890ff'}}>常规</p>}
            <div>{record.name}</div>
          </div>;
        }
      }, {
        title: '执行人员', dataIndex: 'usernames', key: 'usernames', width: '10%',
        render(text, record) {
          let id = stationColor[record.stationid] || record.gid;
          let patrolorImg = ['橙', '黄', '蓝', '绿', '紫'][id ? id % 5 : Math.floor(Math.random() * 5)];
          return <div>
            <img src={`../images/${patrolorImg}.png`}/>
            <span className={styles['textOverflow']}>
              <Tooltip placement="topLeft" title={record.usernames} >{record.usernames}</Tooltip>
            </span>
          </div>
        }
      }, {
        title: '巡检对象', dataIndex: 'patrolLayer', key: 'patrolLayer', width: '15%',
        render(text, record) {
          return <div>
            <div>{record.planArea.name}</div>
            <div className={styles['textOverflow']}>
              <Tooltip placement="topLeft" title={record.patrolLayer} >{record.patrolLayer}</Tooltip>
            </div>
          </div>
        }
      }, {
        title: '是否排班', dataIndex: 'isschedule', key: 'isschedule', width: '10%',
        render(text, record) {
          return <span>{Number(record.isschedule) === 0 ? '否' : '是'}</span>;
        }
      },{
        title: '巡检周期', dataIndex: 'planCycle.name', key: 'planCycle.name', width: '10%',
        render(text, record) {
          return <span>{record.planCycle ? record.planCycle.name : '----'}</span>;
        }
      }, {
        title: '创建时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: '15%',
        render(text) {
          return text.substring(0, 16);
        }
      }, {
        title: '状态', dataIndex: 'isstoped', key: 'isstoped', width: '10%',
        render(text, record) {
          return (text === 0 ?
            <span style={{color: '#1890ff', cursor: 'pointer'}} value={record}
                  onClick={that.stopPlan.bind(that, record)}>
                            <Icon type="check-circle-o"/>启用
                        </span> :
            <span style={{color: '#f00', cursor: 'pointer'}} value={record}
                  onClick={that.startPlan.bind(that, record)}>
                            <Icon type="cross-circle-o"/> 停用
                        </span>);
        }
      }, {
        title: '操作', dataIndex: 'operate', key: 'operate', width: '15%',
        render(text, record) {
          const path = {
            pathname: '/query/patrol-task-list',
            planid: record.gid,
            name: record.name,
          }
          return <div>
            <Link style={{color: that.state.presentRowId === record.gid ? '#bd85cd' : '#1890ff'}}
                  onClick={that.historyPlan.bind(that, record)}
                  to={path}>任务</Link>
            <span style={{color: 'e8e8e8'}}> | </span>
            <Dropdown overlay={menu(record)} trigger={['click']}>
              <a className="ant-dropdown-link" href="#">更多 <Icon type="down"/></a>
            </Dropdown>
          </div>;
        }
      },
    ];

    // 表格更多操作
    const menu = (data) => (
      <Menu>
        {/* {data.type === 0 ? null :  */}
        <Menu.Item key="0" style={{ display: data.type === 1 ? 'block' : 'none' }}>
          <span style={{cursor: 'pointer'}} onClick={that.editPlan.bind(that, data)}>
              编辑
          </span>
        </Menu.Item>
        <Menu.Item key="1">
          <span style={{cursor: 'pointer'}} onClick={that.deletePlan.bind(that, data)}>
            删除
          </span>
        </Menu.Item>
        <Menu.Item key="2">
          <span style={{cursor: 'pointer'}} onClick={that.generatePlan.bind(that, data)}>
            生成任务
          </span>
        </Menu.Item>
      </Menu>
    );


    // 表格分页
    const pagination = {
      total: parseInt(that.props.planTotal, 10),
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
        that.queryPlanData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.Patrolparams;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          Patrolparams: params,
        });
        that.queryPlanData();
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      }
    };

    // 页面框架结构配置
    const field = {
      searchWidth: '600px',
      search: [
        <SelectPanel ref="selectpanel1" fieldName="计划状态" dataType="ddl"
                     value={this.state.Patrolparams.isstoped}
                     data={planStateData} onclick={this.onChangeState}/>,
        <SelectPanel ref="selectpanel2" fieldName="计划类型" dataType="ddl"
                     value={this.state.Patrolparams.type}
                     data={planTypeData} onclick={this.onChangeType}/>
      ],
      extra: [
        // this.state.isShowStation ? <SearchPanel ref="stationpanel" fieldName='search' field={stationConfig}
        //              onclick={this.onChangeStationid}/> : null,

        <div style={{display: this.state.isShowStation ? 'block' : 'none', marginRight: 13}}>
          <SearchPanel field={stationConfig} ref="stationpanel" fieldName='search' onclick={this.onChangeStationid}/>
        </div>,
        <SearchPanel ref="searchpanel" fieldName='search' field={queryData} onclick={this.onChangeCondition}/>
      ],
      table: <Table
          rowKey={(record) => record.gid}
          columns={columns}
          dataSource={patrolPlanData}
          bordered={false}
          pagination={pagination}
          onchange={this.tableChange}
        />
    };


    return (
      <PageHeaderLayout>
      <div style={{width: '100%', height: 'calc(100% - 175px)',minHeight: 'calc(100vh - 175px)'}}>
        <SearchTablePanel field={field} onSearch={this.search} onReset={this.reset}
                          onAdd={this.insertPlan} onAddTemp={this.insertTempPlan}/>
      </div>
      </PageHeaderLayout>
    );
  }
}

