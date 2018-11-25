import React, {Component} from 'react';
import {Table, Menu, Icon, Dropdown, Modal} from 'antd';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel.js';
import SearchPanel from '../../commonTool/SelectPanelTool/SearchPanel.js';
import SearchTablePanel from '../../commonTool/SearchTablePanel/SearchTablePanel.js';
const confirm = Modal.confirm;
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './IchMeterAccount.less';
import utils from '../../../utils/utils';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';

const defaultParams = {
  status: '',   // 运行状态
  classifyName: '',        // 表类型
  stationid: '',  // 站点id
  condition: '',  // 快速索引
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  meterData: state.ichMeterAccount.meterData,
  meterTotal: state.ichMeterAccount.meterTotal,
  classifyNameData: state.ichMeterAccount.classifyNameData,
  stationData: state.patrolPlanList.stationData,
}))

export default class IchMeterAccount extends Component {
  constructor(props) {
    super(props);
    this._tool = this.props.location;
    let params = this._tool.params ? {...this._tool.params}: {...defaultParams};
    this.state = {
      // 参数
      params: {...params},
      // 状态值

    };
    // this.queryStationidData();
    // this.queryClassifyNameData();
    this.queryMeterData();
  }

  // ********************************************查询改变
  // 运行状态改变
  onChangeStatus = (valueObj) => {
    let params = this.state.params;
    params.status = valueObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.queryMeterData();
  };

  // 站点id改变
  onChangeStationid = (searchObj) => {
    let params = this.state.params;
    params.stationid = searchObj.stationid;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.queryMeterData();
  };

  // 站点id改变
  onChangeClassifyName= (searchObj) => {
    let params = this.state.params;
    params.classifyName = searchObj.classifyName;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.queryMeterData();
  };

  // 快速搜索改变
  onChangeCondition = (searchObj) => {
    let params = this.state.params;
    params.condition = searchObj.queryIndex;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
  };

  // 获取站点数据
  queryStationidData = () => {
    this.props.dispatch({
      type: 'patrolPlanList/getStationData',
      payload:{
        stationType: 'A',
      }
    });
  };

  // 获取表类型数据
  queryClassifyNameData = () => {
    this.props.dispatch({
      type: 'ichMeterAccount/getClassifyName',
      payload:{
        stationType: 'A',
      }
    });
  };

  // 获取计划数据
  queryMeterData = () => {
    let data = {};
    // if (this.state.params.status !== '') {
    //   data.status = this.state.params.status; // 计划状态
    // }
    // if (this.state.params.classifyName !== '') {
    //   data.classifyName = this.state.params.classifyName; // 计划状态
    // }
    // if (this.state.params.stationid !== '') {
    //   data.stationid = this.state.params.stationid; // 站点stationid
    // }
    // if (this.state.params.condition !== '') {
    //   data.msg = this.state.params.condition.replace(/(^\s*)|(\s*$)/g, "");// 快速索引
    // }else{
      // data.msg = 'A010612719'; // 真实表刚号serge
      // data.vstelle = 5000228689; // 房产vstelle
    // }
    if (this.state.params.pageno !== '') {
      data.pageno = this.state.params.pageno;
    }
    if (this.state.params.pagesize !== '') {
      data.pagesize = this.state.params.pagesize;
    }
    // data.ecode = '0011';
    this.props.dispatch({
      type: 'ichMeterAccount/getIchMeterAccount',
      payload: data,
    });
  };

  // 重置
  reset = () => {
    this.setState({
      params: defaultParams,
    });
    this.queryMeterData();
  };

  // 查询
  search = () => {
    let params = this.state.params;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      params: params,
    });
    this.queryMeterData();
  };

  render() {
    let that = this;

    // 计划状态
    const planStatusData = [{
      name: '全部', value: '', showDot: true
    }, {
      name: '运行', value: '0', showDot: true
    }, {
      name: '停用', value: '1', showDot: true
    }];

    // 站点下拉配置
    const stationConfig = [{
      name: 'stationid',
      alias: '站点',
      valueType: 'ddl',
      value: this.state.params.stationid,
      selectValues: this.props.stationData,
      width: '200px'
    }];

    // 表类型下拉配置
    const classifyNameConfig = [{
      name: 'classifyName',
      alias: '表类型',
      valueType: 'ddl',
      value: this.state.params.classifyName,
      selectValues: this.props.classifyNameData,
      width: '200px'
    }];

    // 快速搜索配置
    const queryData = [{
      name: 'queryIndex',
      alias: '快速搜索',
      value: this.state.params.condition,
      valueType: 'input',
      placeholder: '用户名称，编码，地址',
      width: '200px'
    }];

    // 表格列
    const columns = [
      {
        title: '用户名称', dataIndex: 'partnerTxt', key: 'partnerTxt', width: 220,
        render: (text, record) => (<span className={styles.textOverflow}>{text}</span>)
      }, {
        title: '表钢号', dataIndex: 'serge', key: 'serge', width: 150,
      }, {
        title: '合同号', dataIndex: 'vertrag', key: 'vertrag', width: 100,
      }, {
        title: '地址', dataIndex: 'addr', key: 'addr', width: 270,
        // render(text, record){
        //   return <span className={styles.textOverflow}>
        //     {`${record.city2}-${record.city1}-${record.mcStreet}-${record.strSuppl1}-${record.strSuppl3}`}
        //   </span>;
        // }
      }, {
        title: '类型', dataIndex: 'compCode', key: 'compCode', width: 50,
      },{
        title: '铅封号', dataIndex: 'partners', key: 'partners', width: 60,
      }, {
        title: '状态', dataIndex: 'yhStatTxt', key: 'yhStatTxt', width: 60,
      }, {
        title: '用气设备', dataIndex: 'eqtypTxt', key: 'eqtypTxt', width: 90,
      }];

    // 表格分页
    const pagination = {
      total: that.props.meterTotal,
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
        that.queryMeterData();
      },
      onShowSizeChange(current, pageSize) {
        let params = that.state.params;
        params.pageno = current;
        params.pagesize = pageSize;
        that.setState({
          params: params,
        });
        that.queryMeterData();
      },
      showTotal: function () {  // 设置显示一共几条数据
        return <div>共 {this.total} 条数据</div>;
      }
    };

    // 页面框架结构配置
    // const field = {
    //   searchWidth: '580px',
    //   search: [
    //     <SearchPanel ref="searchpanel" fieldName='search'
    //                  field={queryData} onclick={this.onChangeCondition}/>
    //   ],
    //   search: [
    //     <SelectPanel ref="selectpanel1" fieldName="运行状态" dataType="ddl" Swidth='280px'
    //                  value={this.state.params.status}
    //                  data={planStatusData} onclick={this.onChangeStatus}/>,
    //     <SearchPanel fieldName='search' field={classifyNameConfig}
    //                  onclick={this.onChangeClassifyName}/>,
    //   ],
    //   extra: [
    //     <SearchPanel fieldName='search' field={stationConfig}
    //                  onclick={this.onChangeStationid}/>,
    //     <SearchPanel ref="searchpanel" fieldName='search'
    //                  field={queryData} onclick={this.onChangeCondition}/>
    //   ],
    //   table: <Table
    //       rowKey={(record) => record.vstelle}
    //       columns={columns}
    //       dataSource={this.props.meterData}
    //       bordered={false}
    //       scroll={{x: 1000}}
    //       pagination={pagination}
    //       onchange={this.tableChange}
    //       onRow={(record, index) => ({
    //         onDoubleClick: () => {
    //           this.props.dispatch(routerRedux.push(`/query/ichMeterDetail?record=${JSON.stringify(record)}&params=${JSON.stringify(this.state.params)}`));
    //         },
    //       })}
    //     />
    // };


    return (
      <PageHeaderLayout>
      <div style={{width: '100%',minWidth: 1000, height: 'calc(100% - 175px)',minHeight: 'calc(100vh - 175px)'}}>
        {/*<SearchTablePanel field={field} onSearch={this.search} onReset={this.reset}/>*/}
        <Table
          rowKey={(record) => record.vstelle}
          columns={columns}
          dataSource={this.props.meterData}
          bordered={false}
          pagination={pagination}
          onchange={this.tableChange}
          onRow={(record, index) => ({
            onDoubleClick: () => {
              let path = {
                pathname: '/query/ichMeterDetail',
                record: record,
                params:this.state.params,
              };
              this.props.dispatch(routerRedux.push(path));
            },
          })}
        />
      </div>
      </PageHeaderLayout>
    );
  }
}

