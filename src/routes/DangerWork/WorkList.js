import React, {Component} from 'react';
import {Table, Menu, Icon, Dropdown, Modal, Tooltip, Divider} from 'antd';
import SelectPanel from '../commonTool/SelectPanelTool/SelectPanel.js';
import SearchPanel from '../commonTool/SelectPanelTool/SearchPanel.js';
import SearchTablePanel from '../commonTool/SearchTablePanel/SearchTablePanel.js';
import styles from './index.less';
const confirm = Modal.confirm;
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {connect} from 'dva';
import moment from 'moment';
import {routerRedux, Link} from 'dva/router';

const defaultParams = {
  applyName: '',  //申请人
  orderNumber: '',  //工单编号
  applyst: '',  // 申请开始时间
  applyet: '',  // 申请结束时间
  applyStatus: '', //申请状态
  pageno: 1,
  pagesize: 10,
};

@connect(state => ({
  user: state.login.user,
  workList: state.dangerWork.dangerWorkList,
  workTotal: state.dangerWork.dangerWorkTotal,
  
}))

export default class WorkList extends Component {
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
    this.queryPlanData();
  }

  componentDidMount() {

  }



  // ********************************************查询改变


  // 申请人搜索
  onChangeApplyName = (searchObj) => {
    let params = this.state.Patrolparams;
    params.applyName = searchObj.queryApplyName;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
  };
  // 申请时间搜索
  onChangeApplyTime = (val) => {
    console.log(val)
    let params = this.state.Patrolparams;
    params.applyst = val[0];
    params.applyet = val[1];
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
  };
  // 工单编号
  onChangeOrderNumber = (searchObj) => {
    let params = this.state.Patrolparams;
    params.orderNumber = searchObj.queryOrderNumber;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
  };
  //申请状态
  onChangeApplyStatus = (searchObj) => {
    let params = this.state.Patrolparams;
    params.applyStatus = searchObj.value;
    params.pageno = defaultParams.pageno;
    params.pagesize = defaultParams.pagesize;
    this.setState({
      Patrolparams: params,
    });
  }


  // 获取计划数据
  queryPlanData = () => {
    let data = {};
    if (this.state.Patrolparams.applyName !== '') {
      data.proposer = this.state.Patrolparams.applyName.replace(/(^\s*)|(\s*$)/g, "");// 申请人
    }
    if (this.state.Patrolparams.applyst !== '') {
      data.startTime = this.state.Patrolparams.applyst;// 申请开始时间
    }
    if (this.state.Patrolparams.applyet !== '') {
      data.endTime = this.state.Patrolparams.applyet;// 申请结束时间
    }
    if (this.state.Patrolparams.applyStatus !== '') {
      data.opnion = this.state.Patrolparams.applyStatus;// 申请状态
    }
    if (this.state.Patrolparams.orderNumber !== '') {
      data.sqdno = this.state.Patrolparams.orderNumber.replace(/(^\s*)|(\s*$)/g, "");// 工单编号
    }
    if (this.state.Patrolparams.pageno !== '') {
      data.pageno = this.state.Patrolparams.pageno;
    }
    if (this.state.Patrolparams.pagesize !== '') {
      data.pagesize = this.state.Patrolparams.pagesize;
    }
    // data.ecode = '0031'
    this.props.dispatch({
      type: 'dangerWork/dangerWorkList',
      payload: data,
    });
  };


  // 新建计划
  insertPlan = () => {
    this.props.dispatch(routerRedux.push(`/query/report-dangerwork?newplan=newplan`));
  };

  //编辑计划
  handleEdit = (record) => {
    console.log('编辑')
    if(record.opnion === '同意'){
      message.worn()
    }
    this.props.dispatch(routerRedux.push(`/query/report-dangerwork?sqdno=${record.sqdno}&gid=${record.gid}&newplan=editplan`));
  }


  // 重置
  reset = () => {
    let params = this.state.Patrolparams;
    params.applyName = '';
    params.applyTime = '';
    params.orderNumber = '';
    params.applyStatus = '';
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

  //查看详情
  handleDetail = (record) => {
    console.log(record, 'record')
    this.props.dispatch(routerRedux.push(`query/report-dangerwork-detail?sqdno=${record.sqdno}`))
  };

  render() {
    let that = this;
    const {stationColor, Patrolparams: {pageno, pagesize}} = this.state;
    const {workList, workTotal} = this.props;
    // 申请人
    const queryApplyName = [{
      name: 'queryApplyName',
      alias: '申请人',
      value: this.state.Patrolparams.applyName,
      valueType: 'input',
      placeholder: '申请人',
      width: '150px'
    }];

    // 关联工单编号
    const queryOrderNumber = [{
      name: 'queryOrderNumber',
      alias: '关联工单编号',
      value: this.state.Patrolparams.orderNumber,
      valueType: 'input',
      placeholder: '工单编号',
      width: '150px'
    }];

    // 申请时间
    const queryApplyTime = [{
      name: 'queryApplyTime',
      alias: '申请时间',
      value: this.state.Patrolparams.applyTime,
      valueType: 'rangeDate',
      placeholder: '申请时间',
      width: '200px'
    }];

     // 申请状态
    const applyStatus = [{
      name: '全部', value: '', showDot: true
    }, {
      name: '审核中', value: '审核中', showDot: true
    }, {
      name: '已通过', value: '同意', showDot: true
    }, {
      name: '不通过', value: '驳回', showDot: true
    }, {
      name: '取消', value: '取消', showDot: true
    }];

    // 表格列
    const columns = [
      {
        title: '序号', dataIndex: 'findex', key: 'findex', width: '4%',
        render(text, record, index) {
          const findex = (index + 1) +  (pageno - 1) * pagesize
          return <div>{findex}</div>
        }
      },
      {
        title: '申请人', dataIndex: 'proposer', key: 'proposer', width: '10%',
        render(text, record) {
          let id = stationColor[record.stationid] || record.gid;
          let patrolorImg = ['橙', '黄', '蓝', '绿', '紫'][id ? id % 5 : Math.floor(Math.random() * 5)];
          return <div>
            <img src={`../images/${patrolorImg}.png`}/>
            <span className={styles['textOverflow']}>
              <Tooltip placement="topLeft" title={text} >{text}</Tooltip>
            </span>
          </div>
        }
      }, {
        title: '申请时间', dataIndex: 'applytime', key: 'applytime', width: '15%',
        render(text, record) {
          return <div>{text}</div>
        }
      }, {
        title: '所关联工单编号', dataIndex: 'sqdno', key: 'sqdno', width: '10%',
        render(text, record) {
          return <div>{text}</div>;
        }
      },{
        title: '审核状态', dataIndex: 'opnion', key: 'opnion', width: '10%',
        render(text, record) {
          return <div>{text}</div>;
        }
      }, 
      // {
      //   title: '更新时间', dataIndex: 'eap_time', key: 'eap_time', width: '15%',
      //   render(text) {
      //     return <div>{text ? text : '---'}</div>;
      //   }
      // },
       {
        title: '操作', dataIndex: 'detaitl', key: 'detaitl', width: '10%',
        render(text, record) {
          return record.opnion === '同意' ? <span>
                    <a onClick={that.handleDetail.bind(that, record)}>查看详情</a>
                </span>
                :
                <span>
                    <a onClick={that.handleDetail.bind(that, record)}>查看详情</a>
                    <Divider type="vertical"/>
                    <a onClick={that.handleEdit.bind(that, record)}>编辑</a>
                </span>

        }
      }
    ];



    // 表格分页
    const pagination = {
      total: workTotal,
      current: pageno,
      pageSize: pagesize,
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
      searchWidth: '900px',
      search: [
        <SelectPanel ref="selectpanel1" fieldName="申请状态" dataType="ddl"
                     value={this.state.Patrolparams.applyStatus}
                     data={applyStatus} onclick={this.onChangeApplyStatus}/>,
        <SearchPanel ref="searchpanel1" fieldName='search' field={queryApplyName} onclick={this.onChangeApplyName}/>,
        <SearchPanel ref="searchpanel3" fieldName='search' field={queryOrderNumber} onclick={this.onChangeOrderNumber}/>,
      ],
      extra: [
        <SearchPanel ref="searchpanel2" fieldName='search' field={queryApplyTime} onclick={this.onChangeApplyTime}/>,
      ],
      table: <Table
          rowKey={(record) => record.gid}
          columns={columns}
          dataSource={workList}
          bordered={false}
          pagination={pagination}
          onchange={this.tableChange}
        />
    };


    return (
      <PageHeaderLayout>
      <div style={{width: '100%', height: 'calc(100% - 175px)',minHeight: 'calc(100vh - 175px)'}}>
        <SearchTablePanel field={field} onSearch={this.search} onReset={this.reset}
                          add={this.insertPlan}/>
      </div>
      </PageHeaderLayout>
    );
  }
}

