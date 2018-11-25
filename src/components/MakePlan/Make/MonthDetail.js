import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';

export default class MonthDetail extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 2;
    if (this.month == 13) {
      this.year = parseInt(this.year) + 1;
      this.month = 1;
    }
    this.days = new Date(this.year, this.month, 0).getDate();
    this.values1 = new Array(this.days+1);
    this.values2 = new Array(this.days+1);
    this.values3 = new Array(this.days+1);
    this.values4 = new Array(this.days+1);
    this.values5 = new Array(this.days+1);
   
    if (this.month < 10) {
      this.month = `0${this.month}`;
    }
    //构造表单信息
    const dataSource = this.props.detail;
    this.state = {
      dataSource: dataSource,
      loading: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    const dataSource = this.state.dataSource;
    if (nextProps.allForecast.length > 0) {
      for (let i = 0; i < nextProps.allForecast.length; i++) {
        dataSource[i].requirement = nextProps.allForecast[i].allForecast/10000;
      }
    }
    this.setState({
      dataSource: dataSource,
      loading: false,
    });
    this.props.handleDetail(dataSource);
  }

  onCellChange = (key, dataIndex, dex, value) => {
    if (value.trim().length === 0) {
      value = 0;
    }
    let regExp = new RegExp(/^\d{1,10}(\.\d{1,2})?$/);
    if (!regExp.test(value)) {
      // message.warning("请输入少于10位整数或2位小数！");
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
          //dataSource[index].requirement = sum;
        }
      });
    }

    //列求和
    switch (dataIndex) {
      case 'secondTrunk':
        let total1 = 0;
        this.values1[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values1[i]) !== "undefined") {
              total1 += this.values1[i];
            }
        }
        this.values1[this.days] = total1;
        dataSource[this.days][dataIndex] = total1;
        break;
      case 'centralBranch':
        let total2 = 0;
        this.values2[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values2[i]) !== "undefined") {
              total2 += this.values2[i];
            }
        }
        this.values2[this.days] = total2;
        dataSource[this.days][dataIndex] = total2;
        break;
      case 'gasStation':
        let total3 = 0;
        this.values3[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values3[i]) !== "undefined") {
              total3 += this.values3[i];
            }
        }
        this.values3[this.days] = total3;
        dataSource[this.days][dataIndex] = total3;
        break;
      case 'unionStation':
        let total4 = 0;
        this.values4[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values4[i]) !== "undefined") {
              total4 += this.values4[i];
            }
        }
        this.values4[this.days] = total4;
        dataSource[this.days][dataIndex] = total4;
        break;
      case 'huadu':
        let total5 = 0;
        this.values5[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values5[i]) !== "undefined") {
              total5 += this.values5[i];
            }
        }
        this.values5[this.days] = total5;
        dataSource[this.days][dataIndex] = total5;
        break;
    }
    if (typeof(this.values1[this.days]) === "undefined") {
      this.values1[this.days] = 0;
    }
    if (typeof(this.values2[this.days]) === "undefined") {
      this.values2[this.days] = 0;
    }
    if (typeof(this.values3[this.days]) === "undefined") {
      this.values3[this.days] = 0;
    }
    if (typeof(this.values4[this.days]) === "undefined") {
      this.values4[this.days] = 0;
    }
    if (typeof(this.values5[this.days]) === "undefined") {
      this.values5[this.days] = 0;
    }
    dataSource[this.days].planningQuantity = this.values1[this.days]+this.values2[this.days]+this.values3[this.days]+this.values4[this.days]+this.values5[this.days];
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
      return;
    }
  }

  render() {
    const {dataSource} = this.state;
    const columns = [
      { title: '日期', dataIndex: 'date', width: 100, }, 
      { title: '北方分公司', children: [
        {  title: '陕京二线干线', dataIndex: 'secondTrunk',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input onChange={(e)=>{this.onCellChange(record.key, 'secondTrunk', index, e.target.value)}}
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          },
        }, 
        { title: '压缩机维检中心支线', dataIndex: 'centralBranch',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input onChange={(e)=>{this.onCellChange(record.key, 'centralBranch', index,e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          },
        }],
      }, 
      { title: '河北分公司', children: [
        { title: '采四配气站', dataIndex: 'gasStation',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input onChange={(e)=>{this.onCellChange(record.key, 'gasStation', index,e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          },
        }, 
        { title: '廊一联站', dataIndex: 'unionStation',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input onChange={(e)=>{this.onCellChange(record.key, 'unionStation', index,e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          },
        }],
      }, 
      { title: '华都', dataIndex: 'huadu',
        render: (text, record, index) => {
          if (index !== this.days) {
            return (
              <Input onChange={(e)=>{this.onCellChange(record.key, 'huadu', index,e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          } else {
            return text;
          }
        },
      }, 
      { title: '上报量', dataIndex: 'planningQuantity', width: 100,}, 
      { title: '需求量', dataIndex: 'requirement', width: 100,}
    ];  
    return (
      <div>
        <Table loading={this.state.loading} bordered dataSource={dataSource} columns={columns} pagination={false}/>
      </div>
    );
  }
}