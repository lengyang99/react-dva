import React, {PureComponent} from 'react';
import {Tabs, Button, message, Table, DatePicker} from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Pagination from 'antd/lib/pagination/Pagination';

@connect(
  state => ({
  data: state.weekMake.weekList,
}))

export default class WeekPlan extends PureComponent {
  state={
    startdate: '',
    enddate: '',
    click: false,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'weekMake/getMakeWeek',
      callback:({msg,success})=>{
        let info = this.props.data;
        if (info.length > 0) {
          //获取下周一日期
          let Stamp1 = new Date();
          let number;
          if (Stamp1.getDay() == 0) {
            number = 7;
          } else {
            number = Stamp1.getDay();
          }
          let num1 = 7-number + 1;
          Stamp1.setDate(Stamp1.getDate() + num1);
          let nextMonday = Stamp1.getDate();

          //当前是否可上报  
          let monday = new Date(info[0].startdate).getDate();
          if (nextMonday == monday) {
            this.setState({
              click: true,
            });
          } else {
            this.setState({
              click: false,
            });
          }
        }
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
      type: 'weekMake/queryMakeWeek',
      params: param,
    });
  }

  //路径跳转到月计划修改
  jump = (record) => {
    const path = {
      pathname: '/distribution/makeWeekUpdate',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  //路径跳转到月计划制定详情
  go = (record) => {
    const path = {
      pathname: '/distribution/makeWeekDetail',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  render() {
    const {data} = this.props;
    const { RangePicker } = DatePicker;
    //定义列
    const cols = [
      {title: '序号', dataIndex: 'id', width: 110, },
      {title: '制定人', dataIndex: 'reportName', width: 180,},
      {title: '制定时间', dataIndex: 'reportTime', width: 220, sorter : (a, b) => new Date(Date.parse(a.reportTime.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.reportTime.replace(/-/g, "/"))).getTime(), },
      {title: '开始日期', dataIndex: 'startdate', sorter : (a, b) => new Date(Date.parse(a.startdate.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.startdate.replace(/-/g, "/"))).getTime(), },
      {title: '结束日期', dataIndex: 'enddate', sorter : (a, b) => new Date(Date.parse(a.enddate.replace(/-/g, "/"))).getTime() - new Date(Date.parse(b.enddate.replace(/-/g, "/"))).getTime(),},
      {title: '状态', dataIndex: 'state', width: 120,
        render: (text, record) => {
          if (record.state == 1 && record.state2 == 1) {
            return (
              <span>已制定</span>
            )
          }
          return (
            <span>已保存</span>
          )
        }
      },
      {title: '操作', width: 80,
        render: (text, record) => {
          if (record.state == 1 && record.state2 == 1) {
            return (
              <span>
                <a onClick={() => {this.go(record)}}>详情</a>
              </span>
            )
          }
          return (
            <span>
              <a onClick={() => {this.jump(record)}}>修改</a>
            </span>
          )
        }
      }
    ];

    //表格数据
    const datas = [];
    if(typeof(data) != "undefined"){
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
          state2: data[i].state2,
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
              <Button type="primary" disabled={this.state.click} style={{marginLeft: '25px',width: '85px'}}><Link to={'/distribution/makeWeek'}>计划制定</Link></Button>
            </div>
          </div>
          <div style={{marginTop: '20px'}}>
            <Table rowKey={record => record.gid} columns={cols} dataSource={datas} pagination={paginationProps} />
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
