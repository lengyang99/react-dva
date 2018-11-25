import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
@connect(
  state => ({
  data: state.make.dataTotal,
}))

export default class TotalUpdate extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 2;
    if (this.month == 13) {
      this.year = parseInt(this.year) + 1;
      this.month = 1;
    }
    this.days = new Date(this.year, this.month, 0).getDate();
    if (this.month < 10) {
      this.month = `0${this.month}`;
    }
    this.planId = props.planId,

    this.state={
      dataSource: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'make/getMonthTotalDetail',
      params: this.planId,
      callback:({msg,success})=>{
        let info = this.props.data;
        const dataSource = [];
        if (typeof(info) != "undefined") {
          let sum1 = 0;
          let sum2 = 0;
          let sum3 = 0;
          let sum4 = 0;
          let sum5 = 0;
          let sum6 = 0;
          let sum7 = 0;
          let sum8 = 0;
          let sum9 = 0;
          let sum10 = 0;
          let sum11 = 0;
          let sum12 = 0;
          let sum13 = 0;
          let sum14 = 0;
          let sum15 = 0;
          let sum16 = 0;
          info.forEach((element, index) => {
            sum1 += parseFloat(element.lastyearTotal);
            sum2 += parseFloat(element.lastyearGas);
            sum3 += parseFloat(element.lastyearVehicle);
            sum4 += parseFloat(element.lastyearDeliver);
            sum5 += parseFloat(element.heating);
            sum6 += parseFloat(element.resident);
            sum7 += parseFloat(element.temperature);
            sum8 += parseFloat(element.theoreticalGas);
            sum9 += parseFloat(element.actualGas);
            sum10 += parseFloat(element.cng);
            sum11 += parseFloat(element.lng);
            sum12 += parseFloat(element.gasStation);
            sum13 += parseFloat(element.huailai);
            sum14 += parseFloat(element.totalForecast);
            sum15 += parseFloat(element.motherStation);
            sum16 += parseFloat(element.allForecast);
            dataSource.push({
              gid: element.gid,
              makeDate: element.makeDate,
              lastyearTotal: element.lastyearTotal,
              lastyearGas: element.lastyearGas,
              lastyearVehicle: element.lastyearVehicle,
              lastyearDeliver: element.lastyearDeliver,
              heating: element.heating,
              resident: element.resident,
              temperature: element.temperature,
              theoreticalGas: element.theoreticalGas,
              actualGas: element.actualGas,
              cng: element.cng,
              lng: element.lng,
              gasStation: element.gasStation,
              huailai: element.huailai,
              totalForecast: element.totalForecast,
              motherStation: element.motherStation,
              allForecast: element.allForecast,
            });
          });
          dataSource.push({
            gid: 0,
            makeDate: "合计",
            lastyearTotal: sum1,
            lastyearGas: sum2,
            lastyearVehicle: sum3,
            lastyearDeliver: sum4,
            heating: sum5,
            resident: sum6,
            temperature: sum7,
            theoreticalGas: sum8,
            actualGas: sum9,
            cng: sum10,
            lng: sum11,
            gasStation: sum12,
            huailai: sum13,
            totalForecast: sum14,
            motherStation: sum15,
            allForecast: sum16,
          });
        }
        this.setState({
          loading: false,
          dataSource: dataSource,
        });
        this.props.handleTotal(dataSource);
      }
    });
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
          switch (dataIndex) {
            case "heating":
              dataSource[index].theoreticalGas = target.lastyearGas + target.temperature + target.resident + parseFloat(value);
              break;
            case "resident":
              dataSource[index].theoreticalGas = target.lastyearGas + target.temperature + target.heating + parseFloat(value);
              break;
            case "actualGas":
              dataSource[index].totalForecast = target.cng + target.gasStation + target.huailai + parseFloat(value);
              break;
            case "gasStation":
              dataSource[index].totalForecast = target.cng + target.actualGas + target.huailai + parseFloat(value);
              break;
            case "huailai":
              dataSource[index].totalForecast = target.cng + target.actualGas + target.gasStation + parseFloat(value);
              break;
          }
          dataSource[index].allForecast = dataSource[index].totalForecast + target.motherStation;
        }
      });
    }
    //列求和
    switch (dataIndex) {
      case 'heating':
        let total1 = 0;
        let total = 0;
        for (let i = 0; i < this.days; i++) {
          total1 += dataSource[i][dataIndex];
          total += dataSource[i].theoreticalGas;
        }
        dataSource[this.days][dataIndex] = total1;
        dataSource[this.days].theoreticalGas = total;
        break;
      case 'resident':
        let total2 = 0;
        let total3 = 0;
        for (let i = 0; i < this.days; i++) {
          total2 += dataSource[i][dataIndex];
          total3 += dataSource[i].theoreticalGas;
        }
        dataSource[this.days][dataIndex] = total2;
        dataSource[this.days].theoreticalGas = total3;
        break;
      case 'actualGas':
        let total4 = 0;
        let total5 = 0;
        let total6 = 0;
        for (let i = 0; i < this.days; i++) {
          total4 += dataSource[i][dataIndex];
          total5 += dataSource[i].totalForecast;
          total6 += dataSource[i].allForecast;
        }
        dataSource[this.days][dataIndex] = total4;
        dataSource[this.days].totalForecast = total5;
        dataSource[this.days].allForecast = total6;
        break;
      case 'lng':
        let total7 = 0;
        for (let i = 0; i < this.days; i++) {
          total7 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total7;
        break;
      case 'gasStation':
        let total8 = 0;
        let total9 = 0;
        let total10 = 0;
        for (let i = 0; i < this.days; i++) {
          total8 += dataSource[i][dataIndex];
          total9 += dataSource[i].totalForecast;
          total10 += dataSource[i].allForecast;
        }
        dataSource[this.days][dataIndex] = total8;
        dataSource[this.days].totalForecast = total9;
        dataSource[this.days].allForecast = total10;
        break;
      case 'huailai':
        let total11 = 0;
        let total12 = 0;
        let total13 = 0;
        for (let i = 0; i < this.days; i++) {
          total11 += dataSource[i][dataIndex];
          total12 += dataSource[i].totalForecast;
          total13 += dataSource[i].allForecast;
        }
        dataSource[this.days][dataIndex] = total11;
        dataSource[this.days].totalForecast = total12;
        dataSource[this.days].allForecast = total13;
        break;   
    }
    this.setState({ dataSource });
    this.props.handleTotal(dataSource);
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
      let year = this.year;
      let month = this.month;
      const {dataSource} = this.state;
      //构造表格信息
      const columns = [
        {title: '日期', dataIndex: 'makeDate', width: 37},
        {title: '同期总量', dataIndex: 'lastyearTotal', width: 50},
        {title: '同期燃气', dataIndex: 'lastyearGas', width: 50},
        {title: '同期车用', dataIndex: 'lastyearVehicle', width: 50},
        {title: '同期外输', dataIndex: 'lastyearDeliver', width: 50},
        {title: '新增采暖', dataIndex: 'heating', width: 50, 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'heating', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: '新增居民、商业', dataIndex: 'resident', width: 50,
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'resident', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: '气温影响', dataIndex: 'temperature', width: 50},
        {title: '理论预测燃气', dataIndex: 'theoreticalGas', width: 50},
        {title: '实际预测燃气', dataIndex: 'actualGas', width: 50, 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'actualGas', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年${month}月车用CNG`, dataIndex: 'cng', width: 50},
        {title: `${year}年${month}月车用LNG`, dataIndex: 'lng', width: 50, 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'lng', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年际通、廊东加气站`, dataIndex: 'gasStation', width: 50, 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'gasStation', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年怀来`, dataIndex: 'huailai', width: 50, 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'huailai', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年预测总量`, dataIndex: 'totalForecast', width: 50},
        {title: '加气母站计划', dataIndex: 'motherStation', width: 50},
        {title: `${year}年预测总量（含加气母站）`, dataIndex: 'allForecast', width: 50}
      ];
  
      return (
        <div>
          <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
        </div>
      );
  }
}