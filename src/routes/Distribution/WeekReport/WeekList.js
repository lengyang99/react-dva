import React, {PureComponent} from 'react';
import {Tabs, Button, message, Table, DatePicker} from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Pagination from 'antd/lib/pagination/Pagination';

@connect(({report}) => ({
  data: report.dataList,
}))

export default class WeekList extends PureComponent {
  state={
    startdate: '',
    enddate: '',
    click: false,
    loading: true,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'report/getWeekList',
      callback: ({msg,success})=>{
        let info = this.props.data;
        if (info.length > 1) {
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
          let monday1 = new Date(info[0].startdate).getDate();
          let monday2 = new Date(info[1].startdate).getDate();
          if (nextMonday == monday1 && nextMonday == monday2) {
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
      type: 'report/queryWeekList',
      params: param,
    });
  }

  jump = (record) => {
    const path = {
      pathname: '/distribution/weekUpdate',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  go = (record) => {
    const path = {
      pathname: '/distribution/weekDetail',
      state: {planId: record.gid},
    }
    this.props.dispatch(routerRedux.push(path));
  }

  render() {
    const {data} = this.props;
    const { RangePicker } = DatePicker;
    //定义列
    const cols = [
      {title: '序号', dataIndex: 'id', width: 80 },
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
      {title: '操作',  width: 80,
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

              <Button type="primary" disabled={this.state.click} style={{marginLeft: '25px',width: '85px'}}><Link to={'/distribution/weekReport'}>上报</Link></Button>

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
