import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';

@connect(
  state => ({
    data: state.weekMake.dataDetail,
}))
export default class MonthDetail extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.planId = props.planId,
   
    this.state = {
      dataSource: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'weekMake/getWeekDetail',
      params: this.planId,
      callback:({msg,success})=>{
        const dataSource = [];
        if (success) {
          let info = this.props.data;
          if (typeof(info) != "undefined") {
            info.forEach(element => {
              dataSource.push({
                gid: element.gid,
                date: element.date,
                secondTrunk: element.secondTrunk,
                centralBranch: element.centralBranch,
                gasStation: element.gasStation,
                unionStation: element.unionStation,
                huadu: element.huadu,
                planningQuantity: element.planningQuantity,
                requirement: element.requirement,
              });
            });
          }
          if (this.props.totalUpdate.length > 0 && dataSource.length > 0) {
            for (let i = 0; i < 7; i++) {
              dataSource[i].requirement = this.props.totalUpdate[i].total/10000;
            }
          }
          this.setState({
            dataSource: dataSource,
          });
        }
        this.setState({
          loading: false,
        });
        this.props.handleDetail(dataSource);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const dataSource = this.state.dataSource;
    if (nextProps.totalUpdate.length > 0 && dataSource.length > 0) {
      for (let i = 0; i < 7; i++) {
        dataSource[i].requirement = nextProps.totalUpdate[i].total/10000;
      }
      this.setState({
        dataSource: dataSource,
        loading: false,
      });
    }
    nextProps.handleDetail(dataSource);
  }

  onCellChange = (key, dataIndex, dex, value) => {
    if (value.trim().length === 0) {
      value = 0;
    }
    let regExp = new RegExp(/^\d{1,10}(\.\d{1,2})?$/);
    if (!regExp.test(value)) {
      return;
    }
    //行求和
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => item.gid === key);
    if (target) {
      target[dataIndex] = parseFloat(value);
      dataSource.forEach((element,index) => {
        if (index === dex) {
          dataSource[index] = target;
          let sum = 0;
          for (const key in target) {
            if (key === 'secondTrunk' || key === 'centralBranch' || key === 'gasStation' || key === 'unionStation' ||  key === 'huadu') {
              sum = parseFloat(target[key]) + sum;
            }
          }
          dataSource[index].planningQuantity = sum;
        }
      });
    }

    this.setState({ dataSource });
    this.props.handleDetail(dataSource);
  }

  checkValue = (value) => {
    if (value.trim().length === 0) {
      value = 0;
    }
    let regExp = new RegExp(/^\d{1,10}(\.\d{1,2})?$/);
    if (!regExp.test(value)) {
      message.warning("请输入10位整数或2位小数！");
    }
  }

  render() {
    const {dataSource} = this.state;
    const columns = [
      { title: '日期', dataIndex: 'date',}, 
      { title: '北方分公司', children: [
        {  title: '陕京二线干线', dataIndex: 'secondTrunk',
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'secondTrunk', index, e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }, 
        { title: '压缩机维检中心支线', dataIndex: 'centralBranch',
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'centralBranch', index,e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }],
      }, 
      { title: '河北分公司', children: [
        { title: '采四配气站', dataIndex: 'gasStation',
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'gasStation', index,e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }, 
        { title: '廊一联站', dataIndex: 'unionStation',
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'unionStation', index,e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }],
      }, 
      { title: '华都', dataIndex: 'huadu',
        render: (text, record, index) => {
          return (
            <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'huadu', index,e.target.value)}} 
            onBlur={(e)=>{this.checkValue(e.target.value)}}/>
          );
        },
      }, 
      { title: '上报量', dataIndex: 'planningQuantity', width: 100,}, 
      { title: '需求量', dataIndex: 'requirement', width: 100,}
    ];  
    return (
      <div>
        <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
      </div>
    );
  }
}