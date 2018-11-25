import React from 'react';
import {Steps, Tabs, Button, Modal, message, Icon, Table} from 'antd';
const Step = Steps.Step;
const TabPane = Tabs.TabPane;
import utils from '../../../utils/utils';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import EcityMap from '../../../components/Map/EcityMap';
import appEvent from '../../../utils/eventBus';
import Tab from '../../commonTool/Tab/Tab';

const OneDom = (name, value, width, extra) => (
  <div style={{width: width || '50%', display: 'inline-block', padding: 10}}>
    <div style={{width: 150, display: 'inline-block', verticalAlign: 'top'}}>
      <span style={{float: 'right'}}>{name}：</span>
    </div>
    <div style={{width: 'calc(100% - 150px)', display: 'inline-block', verticalAlign: 'top'}}>
      {value}{extra}
    </div>
  </div>);

@connect(state => ({
  meterDetail: state.ichMeterAccount.meterDetail,
  meterDetailTable: state.ichMeterAccount.meterDetailTable,
  meterDetailTableTotal: state.ichMeterAccount.meterDetailTableTotal,
  meterDetailDetail: state.ichMeterAccount.meterDetailDetail,
}))

export default class IchMeterDetail extends React.Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    this.map = null; // 类ArcGISMap的实例
    this.tableIndex = 1;
    this.state = {
      params: {
        pageno: 1,
        pagesize: 10,
      },
      isShowMap: false, // 是否展示地图
      isShowDetail: false,
    };
    this.getIchMeterDetail();
  }

  onMapCreated = (arcGISMap) => {
    this.map = arcGISMap;
  };

  getIchMeterDetail = () => {
    this.props.dispatch({
      type: 'ichMeterAccount/getIchMeterDetail',
      payload: {
        vstelle: this._tool.record.vstelle,
      },
    });
  };

  closeMap = () => {
    this.setState({
      isShowMap: !this.state.isShowMap,
    });
  };

  closeDetail = () => {
    this.setState({
      isShowDetail: false,
    });
  };

  onChangeTab = (active) => {
    if(active !== 'detail'){
      this.getDetailTable(active);
      this.setState({
        isShowDetail: false,
      });
    }
  };

  goBack = () => {
    this.props.dispatch(routerRedux.push({pathname: '/query/ichMeterAccount', params: this._tool.params}));
  };

  getDetailTable = (active) => {
    this.props.dispatch({
      type: 'ichMeterAccount/getIchMeterDetailTable', // getIchMeterDetailDetail
      payload: {
        pageno: this.state.params.pageno,
        pagesize: this.state.params.pagesize,
        equipmentId: 10413/*this._tool.record.equnr*/,// 000000001000220028
        functionKey: active,
      }
    });
  };

  getDetailDetail = (taskId, functionKey) => {
    this.props.dispatch({
      type: 'ichMeterAccount/getIchMeterDetailDetail',
      payload: {
        taskId: taskId,
        function: functionKey,
      },
      callback: () => {
        this.setState({isShowDetail: true})
      }
    });
  };

  showDetailDivs = () => {
    let meterDetailDetail = [...this.props.meterDetailDetail];
    let tabPanes = [];
    for(let i = 0; i < meterDetailDetail.length; i++){
      let oneTab = [];
      let items = meterDetailDetail[i].items;
        for(let j = 0; j < items.length; j++) {
          oneTab.push(<div key={j} style={{margin: '10px'}}>{`${items[j].alias} : ${items[j].value}`}</div>);
        }
      tabPanes.push(<TabPane tab={meterDetailDetail[i].alias} key={i}>{oneTab}</TabPane>);
    }
    return (<Tabs style={{minHeight: 'calc(100vh - 280px)'}} animated={false}
                  tabBarExtraContent={<Icon type="close" onClick={this.closeDetail}/>}>
      {tabPanes}
    </Tabs>);
  };

  getTabDiv1 = (data) => {
    // const map = (<Icon style={{marginLeft: 10}} type="environment"
    //                    onClick={this.onChangeIsShowMap.bind(this, "470000,4370000")}/>);
    let meterDetail = this.props.meterDetail;
    return (<div>
      <p style={{fontWeight: 'bold', fontSize: 15}}>用户信息</p>
      <div>
        {OneDom('用户名', data.partnerTxt)}
        {OneDom('联系电话', data.telNumber)}
        {OneDom('用户地址', data.addr)}
        {/*{OneDom('用户地址', data.partnerTxt, '100%', map)}*/}
        {OneDom('责任人', '责任人')}
        {OneDom('责任人站点', '责任人站点')}
      </div>
      <p style={{fontWeight: 'bold', fontSize: 15}}>表具信息</p>
      <div>
        {OneDom('合同号', data.vertrag)}
        {OneDom('表刚号', data.serge)}
        {OneDom('表类型', '表类型')}
        {OneDom('铅封号', '铅封号')}
        {OneDom('状态', data.yhStatTxt)}
        {OneDom('能用设备', `${meterDetail.length}台${meterDetail.length === 0? '': meterDetail[0].eqartTxt}`)}
      </div>
    </div>);
  };

  getTabDiv2 = (columns, data, functionKey) => {
    let that = this;
    // 表格分页
    const pagination = {
      total: this.props.meterDetailTableTotal,
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
        that.getDetailTable(functionKey);
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.getDetailTable(functionKey);
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      }
    };
    return (<div>
      <div style={{verticalAlign: 'top', display: 'inline-block', width: this.state.isShowDetail ? '60%' : '100%'}}>
        <Table rowKey='taskId' columns={columns} dataSource={data} bordered={false} pagination={pagination}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              that.getDetailDetail(record.taskId, functionKey);;
            },
          })}
        />
      </div>
      <div style={{marginLeft: '3%', verticalAlign: 'top', display: this.state.isShowDetail ? 'inline-block' : 'none', width: '37%'}}>
        {this.state.isShowDetail ? this.showDetailDivs() : ''}
      </div>
    </div>);
  };

  render() {
    const columns1 = [
      {
        title: '序号', dataIndex: 'index', key: 'index', width: '20%',
        render: (text, record) => this.tableIndex++,
      }, {
        title: '抄表人', dataIndex: 'assigneeName', key: 'assigneeName', width: '20%',
      }, {
        title: '抄表时间', dataIndex: 'feedbackTime', key: 'feedbackTime', width: '20%',
      }, {
        title: '类型', dataIndex: 'taskType', key: 'taskType', width: '20%',
        render: (text, record) => (text === 1 ? '常规任务': '临时任务')
      }, {
        title: '抄表读数', dataIndex: 'bcjbdushu', key: 'bcjbdushu', width: '20%',
      }];
    const columns2 = [
      {
        title: '序号', dataIndex: 'index', key: 'index', width: '10%',

      }, {
        title: '安检人', dataIndex: 'assigneeName', key: 'assigneeName', width: '20%',
      }, {
        title: '安检时间', dataIndex: 'feedbackTime', key: 'feedbackTime', width: '20%',
      }, {
        title: '类型', dataIndex: 'byanjian', key: 'byanjian', width: '20%',
      }, {
        title: '是否停用', dataIndex: 'sftingyong', key: 'sftingyong', width: '15%',
      }, {
        title: '有无隐患', dataIndex: 'ywyinhuan', key: 'ywyinhuan', width: '15%',
      }];
    const columns3 = [
      {
        title: '序号', dataIndex: 'index', key: 'index', width: '20%',
      }, {
        title: '拆表人', dataIndex: 'assigneeName', key: 'assigneeName', width: '20%',
      }, {
        title: '拆表时间', dataIndex: 'feedbackTime', key: 'feedbackTime', width: '20%',
      }, {
        title: '装表人', dataIndex: 'assigneeName', key: 'assigneeName1', width: '20%',
      }, {
        title: '装表时间', dataIndex: 'feedbackTime', key: 'feedbackTime1', width: '20%',
      }];
    return (
      <PageHeaderLayout showBack={this.goBack}>
        <div
          style={{width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)', position: 'relative'}}>
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: this.state.isShowMap ? 'block' : 'none',
            backgroundColor: '#fff',
            left: 0,
            top: 0,
            zIndex: 10000
          }}>
            <EcityMap mapId="ichMeterDetail" onMapLoad={this.onMapCreated}/>
          </div>
          <div style={{
            position: 'absolute',
            display: this.state.isShowMap ? 'block' : 'none',
            zIndex: 10001,
            top: 20,
            right: 40
          }}>
            <Button type='primary' onClick={this.closeMap}><Icon type="left"/>返回</Button>
          </div>
          <Tabs style={{marginLeft: 20, marginRight: 20, minHeight: 'calc(100vh - 280px)'}} animated={false}
                onChange={this.onChangeTab}>
            <TabPane tab="表具信息" key="detail">
              {this.getTabDiv1(this._tool.record)}
              </TabPane>
            <TabPane tab="抄表记录" key="meter_read">
              {this.getTabDiv2(columns1, this.props.meterDetailTable, 'meter_read')}
              </TabPane>
            <TabPane tab="安检记录" key="safety_check">
              {this.getTabDiv2(columns2, this.props.meterDetailTable, 'safety_check')}
            </TabPane>
            <TabPane tab="检定记录" key="check_calibration">
              {this.getTabDiv2(columns3, this.props.meterDetailTable, 'check_calibration')}
            </TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}
