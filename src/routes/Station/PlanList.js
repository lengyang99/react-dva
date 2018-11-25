import React, {PureComponent} from 'react';
import {Tabs, Button, message, Select, Col, Modal} from 'antd';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import PlanSearch from './SearchPanel/PlanSearch';
import NewPlanForm from './ModalForm/NewPlanForm';
import PlanTable from '../../components/PlanTable';
import parseValues from '../../utils/utils';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
@connect(({station, login}) => ({
  // funcList: station.funcList,
  groups: station.groups,
  data: station.data,
  stations: station.stations,
  templates: station.templates,
  planLoading: station.planLoading,
  paginations: station.paginations,
  total: station.total,
  user: login.user,
  userDatas: login.datas ||[]
}))

export default class PlanList extends PureComponent {
  constructor(){
    super()

    this.state = {
      visible: false,
      currTab: '',
      loading: false,
      searchParams: {},
      stationName: '',
      modalVisible: false,
      groups: [], //用于区域排序
    };

  };

  form = null;
  defaultPage = {
    pageno: 1,
    pagesize: 10,
  }
  stateValues = [
    // {name: 0, alias: '未启用'},
    {name: 1, alias: '开启'},
    {name: 2, alias: '停用'}
  ];
  stationId='';
  ecode='';
  areaId = '';

  componentWillMount(){
    if(this.props.location.search){
      this.initParams();
    }
  }
  componentDidMount() {
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
          console.log(data, key, 'kkkkk');
          this.setState({
            currTab: key,
            groups: data,
          });
          this.areaId = data ? data[0].gid : '';
          const areaId = data ? data[0].gid : '';
          this.queryPlanList({...this.defaultPage, areaId});
        },
      });
      }
    });
    if(this.props.location.search){
      const {current, pageSize} = this.props.paginations
      const params = {
        pageno: current,
        pagesize: pageSize,
      };
      this.queryPlanList({...params,...this.state.searchParams, areaId: this.state.currTab});
      return
    }
  };

  initParams = () =>{
    const {location: {search}} = this.props;
    const {areaId} = parseValues(search) || {};
    this.setState({
        currTab: areaId
    });
  };
  queryPlanList = (params = {}) => {
    this.props.dispatch({
      type: 'station/queryPlanData',
      payload: {
        stationId:this.stationId,
        ecode: this.ecode,
        areaId:this.state.currTab,
        ...params
      },
      callback: ({success, msg}) => {
        if (!success) {
          message.warn(msg);
        }
      }
    });
  };

  tabChangeHandle = (key) => {
    this.setState({
      currTab: key,
      searchParams: {}
    });
    // this.refs.serchChildren.resetStation()
    this.queryPlanList({...this.defaultPage, areaId: key})
    // if (!this.props.data[key] || this.props.data[key].length === 0) {
    //   this.queryPlanList({ ...this.defaultPage, group: key })
    // }
  };

  expOnChange = (params) => {
    this.queryPlanList({
      ...params,
      areaId: this.state.currTab
    });
    if(params){
      const {status, stationId, others} = params
      this.setState({searchParams: {status, stationId, others}});
    }
    
  };
  handleOk = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({loading: true});
      let params = {
        ...values,
        areaId: values.group.trim(),
        startTime: values.startTime.format('YYYY-MM-DD HH:mm:ss'),
        params: JSON.stringify({template: values.template}),
        function: 'station_patrol'
      };

      this.props.dispatch({
        type: 'station/addStationPlan',
        payload: params,
        callback: ({msg, success}) => {
          this.setState({
            loading: false,
            visible: !success
          });
          form.resetFields();
          message.success(msg);

          this.props.dispatch({
            type: 'station/queryGroups'
          });
        }
      });

    });
  };
  handleCancel = () => {
    this.setState({visible: false});
  };
  showNewModal = () => {
    this.setState({visible: true});
    const atraId = !this.state.currTab ? this.areaId : this.state.currTab;
    console.log(this.stationId, atraId, "★");
    this.props.dispatch(routerRedux.push(`/station/new?areaId=${atraId}&stationId=${this.stationId}`))
  };

  handlePlanTableChange = (pagination, filtersArg, sorter) => {
    const params = {
      pageno: pagination.current,
      pagesize: pagination.pageSize
    };
    this.queryPlanList({...params,...this.state.searchParams, areaId: this.state.currTab});
  };
  changeHandler = (val, node) => {
    const {dataRef} = node.props;
    this.stationId = val;
    this.props.dispatch({
      type: 'station/queryGroups',
      payload:{stationId:val},
      callback: (data, key) => {
        console.log(data,key, 'data');
        this.setState({
          currTab: key,
          stationName: dataRef.name
        });
        const areaId = data.length > 0 ? data[0].gid : null;
        this.queryPlanList({...this.defaultPage, areaId: areaId});
      },
    });
  };

  handleCancel = () => {
    this.setState({
      modalVisible: false,
    });
  };
  sortHandler = () => {
    console.log(123);
    this.setState({
      modalVisible: true,
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

  handleSortOk = () => {
    console.log(this.state.groups, '★');
    const {groups} = this.state;
    const params = [];
    groups && groups.map((item, index) => {
      params.push({
        ecode: item.ecode.toString(),
        stationId: item.stationId,
        areaId: item.gid,
        areaName: item.name,
        index,
      })
    })
    console.log(params);
    this.props.dispatch({
      type: 'station/changeSort',
      payload: {params},
      callback: ({success, msg}) => {
        if (success) {
          message.success('区域排序成功！');
          this.handleCancel()
          this.props.dispatch({
            type: 'station/queryGroups',
            payload:{stationId:this.stationId},
            callback: (data, key) => {
              this.setState({
                currTab: key,
                groups: data,
              });
              this.areaId = data[0].gid
              this.queryPlanList({...this.defaultPage, areaId: data[0].gid});
            },
          });
        } else {
          message.warn(msg);
        }
      }
    })
  }

  render() {
    const {groups, data, planLoading, total, paginations} = this.props;
    console.log(this.stationId,this.state.currTab,this.areaId, 'stations');
    const stations = [...this.props.stations];
    // stations.unshift({gid: '', name: '全部'})
    const pagination = {
      current: paginations.current,
      pageSize: paginations.pageSize,
      pageSizeOptions: ['10', '20', '30'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total, range) => {
        const {current, pageSize} = this.props.paginations;
        return <div style={{position: 'absolute', left: '2%'}}>
          共 {total} 条记录
          {/* 第{current}/{Math.ceil(total/pageSize)}页 */}
        </div>;
      }
    };
    let tabs = (groups && groups.length < 1) ?
      ['　'] : groups;
    const panes = tabs.map(ii =>
      (<TabPane
        tab={ii.name}
        key={ii.gid}
      >
        <PlanSearch
          ref='serchChildren'
          station={this.props.stations.map((item) => ({
            name: item.gid,
            alias: item.name
          }))}
          stationValue={this.props.user.locGid || ''}
          stateValues={this.stateValues}
          expOnChange={this.expOnChange}
          pagination={this.props.paginations}
        />
        <PlanTable
          key={ii.gid}
          loading={planLoading}
          data={{
            list: data[ii.gid] || [],
            pagination: {...pagination, total: total[ii] || 0}
          }}
          stateValues={this.stateValues}
          onTableChange={this.handlePlanTableChange}
          dispatch={this.props.dispatch}
          refreshData={this.queryPlanList}
          expOnChange={this.expOnChange}
        />
      </TabPane>));

      const button = (
        <div style={{float: 'right'}}>
          <Button type="primary" onClick={this.showNewModal} style={{marginRight: 10}}>新增计划</Button>
          <Button type="primary" onClick={this.sortHandler}>调整区域顺序</Button>
        </div>
      )

    return (
      <PageHeaderLayout>
        <div style={{width: '80%', height: 30, margin: '30px 20px', paddingTop: 15}}>
          <Col>
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
          </Col>
        </div>
        <div style={{minHeight: '60vh'}}>
          <Tabs
            onChange={this.tabChangeHandle}
            tabBarExtraContent={button}
          >
            {panes}
          </Tabs>
        </div>
        <NewPlanForm
          ref={form => {
            this.form = form;
          }}
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onCreate={this.handleOk}
          stations={this.props.stations}
          templates={this.props.templates}
          dispatch={this.props.dispatch}
          func={this.state.currTab}
          loading={this.state.loading}
        />
        <Modal
            title="区域顺序调整"
            visible={this.state.modalVisible}
            onOk={this.handleSortOk}
            onCancel={this.handleCancel}
          >
            {
              this.state.groups && this.state.groups.map((item, index) => {
                return <div key={item.gid} style={{width: '100%', marginBottom: 5}}>
                  <span style={{marginRight: 15}}>{index + 1}</span>
                  <span >{item.name}</span>
                  <a onClick={() => this.moveUpHandler(item, index)}   style={{marginRight: 10, float: 'right'}}>上移</a>
                  <a onClick={() => this.moveDownHandler(item, index)} style={{float: 'right'}}>下移</a>
                </div>
              })
            }
          </Modal>
      </PageHeaderLayout>
    );
  }
}
