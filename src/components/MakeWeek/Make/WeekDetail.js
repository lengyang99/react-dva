import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';

@connect(
  state => ({
    success:state.weekMake.success,
    msg:state.weekMake.msg,
}))
export default class WeekDetail extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.week = this.getWeek();
   
    //构造表单信息
    const dataSource = this.props.detail;
    this.state = {
      dataSource: dataSource,
    }
  }

  componentWillReceiveProps(nextProps) {
    const dataSource = this.state.dataSource;
    if (nextProps.total.length > 0) {
      for (let i = 0; i < this.week.length; i++) {
        dataSource[i].requirement = nextProps.total[i].total/10000;
      }
    }
    this.setState({
      dataSource: dataSource,
    });
    this.props.handleDetail(dataSource);
  }

  //获取下周七天日期，并格式化为“yyyy-mm-dd”放入数组中
  getWeek() {
    const week = [];
    for (let i = 0; i < 7; i++) {
      let Stamp = new Date();
      let number;
      if (Stamp.getDay() == 0) {
        number = 7;
      } else {
        number = Stamp.getDay();
      }
      let num = 7-number + 1 + i;
      Stamp.setDate(Stamp.getDate() + num);

      let year = Stamp.getFullYear();
      let month = Stamp.getMonth() + 1;
      let date = Stamp.getDate();
      if (month < 10) {
          month = `0${month}`;
      }
      if (date < 10) {
        week.push(`${year}-${month}-0${date}`);        
      } else {
        week.push(`${year}-${month}-${date}`);
      }
    }
    return week;
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
    const target = dataSource.find(item => item.key === key);
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
              <Input onChange={(e)=>{this.onCellChange(record.key, 'secondTrunk', index, e.target.value)}}
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }, 
        { title: '压缩机维检中心支线', dataIndex: 'centralBranch',
          render: (text, record, index) => {
            return (
              <Input onChange={(e)=>{this.onCellChange(record.key, 'centralBranch', index,e.target.value)}}
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }],
      }, 
      { title: '河北分公司', children: [
        { title: '采四配气站', dataIndex: 'gasStation',
          render: (text, record, index) => {
            return (
              <Input onChange={(e)=>{this.onCellChange(record.key, 'gasStation', index,e.target.value)}}
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }, 
        { title: '廊一联站', dataIndex: 'unionStation',
          render: (text, record, index) => {
            return (
              <Input onChange={(e)=>{this.onCellChange(record.key, 'unionStation', index,e.target.value)}}
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          },
        }],
      }, 
      { title: '华都', dataIndex: 'huadu',
        render: (text, record, index) => {
          return (
            <Input onChange={(e)=>{this.onCellChange(record.key, 'huadu', index,e.target.value)}}
            onBlur={(e)=>{this.checkValue(e.target.value)}}/>
          );
        },
      }, 
      { title: '上报量', dataIndex: 'planningQuantity', width: 100,}, 
      { title: '需求量', dataIndex: 'requirement', width: 100,}
    ];  
    return (
      <div>
        <Table bordered dataSource={dataSource} columns={columns} pagination={false}/>
      </div>
    );
  }
}