import React, {PureComponent} from 'react';
import {Tabs, Button, message, Table, DatePicker} from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Pagination from 'antd/lib/pagination/Pagination';

@connect(({report}) => ({
  data: report.data,
}))

export default class MonthList extends PureComponent {
  state={
    startdate: '',
    enddate: '',
    click: false,
    loading: true,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getMonthList',
      callback:({msg,success})=>{
        //当前是否可上报
        let info = this.props.data;
        if (info.length > 1) {
          let month = new Date().getMonth() + 2;
          if (month == 13) {
            month = 1;
          }
          let month1 = new Date(info[0].startdate).getMonth()+1;
          let month2 = new Date(info[1].startdate).getMonth()+1;
          if (month == month1 && month == month2) {
            if ( (info[0].iscng == 0 && info[1].iscng == 1) || (info[1].iscng == 0 && info[0].iscng == 1 ) ) {
              this.setState({
                click: true,
              });
            }
          } else {
            this.setState({
              click: false,
            });
          }
        }
        this.setState({
          loading: false,
        });
      }
    });
  }

  //日期选择
  onChange = (date, dateString) => {
    this.setState({
      startdate: dateString[0],
      enddate: dateString[1],
    });
  }

  //搜索
  queryList = () => {
    let param = {startdate: this.state.startdate, enddate: this.state.enddate };
    this.props.dispatch({
      type: 'report/queryMonthList',
      params: param,
    });
  }

  //路径跳转到月计划修改
  jump = (record) => {
    const path = {
      pathname: '/distribution/monthUpdate',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  //路径跳转到月计划详情
  go = (record) => {
    const path = {
      pathname: '/distribution/monthDetail',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  render() {
    const {data} = this.props;
    const { RangePicker } = DatePicker;
    //定义列
    const cols = [
      {title: '序号', dataIndex: 'id', width: 80},
      {title: '上报人', dataIndex: 'reportName', width: 150,},
      {title: '上报时间', dataIndex: 'reportTime', width: 200, sorter : (a, b) => new Date(Date.parse(a.reportTime.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.reportTime.replace(/-/g, "/"))).getTime(), },
      {title: '开始日期', dataIndex: 'startdate', sorter : (a, b) => new Date(Date.parse(a.startdate.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.startdate.replace(/-/g, "/"))).getTime(), },
      {title: '结束日期', dataIndex: 'enddate', sorter : (a, b) => new Date(Date.parse(a.enddate.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.enddate.replace(/-/g, "/"))).getTime(),},
      {title: '站点', dataIndex: 'iscng', width: 150, render: (text, record) => {
          if (record.iscng == 0) {
            return (
              <span>车用母站</span>
            )
          }
          return (
            <span>车用CNG</span>
          )
        }
      },
      {title: '状态', dataIndex: 'state', width: 120,
        render: (text, record) => {
          if (record.state == 0) {
            return (
              <span>已保存</span>
            )
          }
          return (
            <span>已提交</span>
          )
        }
      },
      {title: '操作', width: 80,
        render: (text, record) => {
          if (record.state == 0) {
            return (
              <span>
                <a onClick={() => {this.jump(record)}}>修改</a>
              </span>
            )
          }
          return (
            <span>
              <a onClick={() => {this.go(record)}}>详情</a>
            </span>
          )
        }
      }
    ];

    //表格数据
    const datas = [];
    if(data.length > 0){
      for (let i = 0; i < data.length; i++) {
        datas.push({
          id: i+1,
          gid: data[i].gid,
          reportUserid: data[i].reportUserid,
          reportName: data[i].reportName,
          reportTime: data[i].reportTime,
          startdate: data[i].startdate,
          enddate: data[i].enddate,
          state: data[i].state,
          iscng: data[i].iscng,
        });
     }
    }

    //定义分页
    const paginationProps = {
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: 10,
      pageSizeOptions: ['10', '20', '30', '40'],
    };

    return (
      <PageHeaderLayout>
        <div>
          <div>
            <div style={{paddingTop: '20px'}}>
              <span>选择日期：</span>
              <RangePicker onChange={this.onChange}/>
              <Button type="primary" icon="search" style={{marginLeft: '25px'}} onClick={this.queryList}>搜索</Button>

              <Button type="primary" disabled={this.state.click} style={{marginLeft: '25px',width: '85px'}}><Link to={'/distribution/monthReport'}>上报</Link></Button>


            </div>
          </div>
          <div style={{marginTop: '20px'}}>
            <Table loading={this.state.loading} rowKey={record => record.gid} columns={cols} dataSource={datas} pagination={paginationProps} />
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
