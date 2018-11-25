import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import { stat } from 'fs';
import styles from '../style.less';

@connect(
  state => ({
    success: state.make.success,
    msg: state.make.msg,
    lastyearMonth: state.make.lastyearMonth,
    cng: state.make.cng,
}))
export default class MonthTotal extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 2;
    if (this.month == 13) {
      this.year = parseInt(this.year) + 1;
      this.month = 1;
    }
    this.days = new Date(this.year, this.month, 0).getDate();
    this.values1 = new Array(this.days);
    this.values2 = new Array(this.days);
    this.values3 = new Array(this.days);
    this.values4 = new Array(this.days);
    this.values5 = new Array(this.days);
    this.values6 = new Array(this.days);
    if (this.month < 10) {
      this.month = `0${this.month}`;
    }
    
    this.state={
      dataSource: [],
      loading: true,
      disable: false,
    }
  }

  componentDidMount() {
    const dataSource = [];
    let param = {
      startdate: `${this.year-1}-${this.month}-01`, 
      enddate: `${this.year-1}-${this.month}-${this.days}`,
    }
    this.props.dispatch({
      type: 'make/getLastyearMonth',
      params: param,
      callback: ({msg,success})=>{
        if (success) {
          //构造表单信息
          let info = this.props.lastyearMonth;
          if (typeof(info) != "undefined" && info.length > 0) {
            for (let i = 0; i < this.days; i++) {
              let date;
              if (i < 9) {
                date = `${this.year}-${this.month}-0${i+1}`;
              } else {
                date = `${this.year}-${this.month}-${i+1}`;
              }
              dataSource.push({
                key: i+1,
                makeDate: date,
                lastyearTotal: parseFloat(info[i].total),
                lastyearVehicle: parseFloat(info[i].vehicle),
                lastyearGas: parseFloat(info[i].gas),
                lastyearDeliver: parseFloat(info[i].deliver),
                heating: 0,
                resident: 0,
                temperature: parseFloat(info[i].temperature),
                actualGas: 0,
                cng: 0,
                lng: 0,
                gasStation: 0,
                huailai: 0,
                motherStation: 0,
              });
            }
          }
        }
      }
    });

    this.props.dispatch({
      type: 'make/getCNGStation',
      params: {startdate: `${this.year}-${this.month}-01`, enddate: `${this.year}-${this.month}-${this.days}`,},
      callback: ({msg, success}) => {
        if (success) {
          //构造cng、母站上报信息
          let info = this.props.cng;
          let cng = [];
          let station = [];
          if (typeof(info) != "undefined" && info.length > 0) {
            if (info.length < 2) {
              message.info("CNG或母站计划暂未上报，请等待！");
              this.setState({
                disable: true,
              });
              this.props.handleChangeButton(true);
            } else if (info[0].state == 0 || info[1].state == 0) {
              message.info("CNG或母站计划暂未提交，请等待！");
              this.setState({
                disable: true,
              });
              this.props.handleChangeButton(true);
            } else {
              if (info[0].iscng == 1 && info[1].iscng == 0) {
                cng = info[0].monthDetails;
                station = info[1].monthDetails;
              } else {
                cng = info[1].monthDetails;
                station = info[0].monthDetails; 
              }
              for (let i = 0; i < this.days; i++) {
                dataSource[i].cng = parseFloat(cng[i].reportValue);
                dataSource[i].motherStation = parseFloat(station[i].reportValue);
              }
            }
            let obj = new Object();
            obj.key = this.days+1;
            obj.makeDate = '合计';
            for (let i = 0; i < 7; i++) {
              let sum = 0;
              let values = new Array(this.days);
              switch (i) {
                case 0:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].lastyearTotal);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.lastyearTotal = sum;
                  break;
                case 1:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].lastyearVehicle);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.lastyearVehicle = sum;
                  break;
                case 2:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].lastyearGas);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.lastyearGas = sum;
                  break;
                case 3:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].lastyearDeliver);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.lastyearDeliver = sum;
                  break;
                case 4:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].temperature);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.temperature = sum;
                  break;
                case 5:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].cng);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.cng = sum;
                  break;
                case 6:
                  for (let j = 0; j < this.days; j++) {
                    values[j] = parseFloat(dataSource[j].motherStation);
                      if (typeof(values[j]) !== "undefined") {
                        sum += values[j];
                      }
                  }
                  obj.motherStation = sum;
                  break;
              }      
            }
            dataSource.push(obj);
            //初始行求和
            dataSource.forEach((element,index) => {
              dataSource[index].theoreticalGas = parseFloat(element.lastyearGas) + parseFloat(element.temperature);
              dataSource[index].totalForecast = parseFloat(element.cng);
              dataSource[index].allForecast = parseFloat(element.cng) + parseFloat(element.motherStation);
            });
          }
        } else {
          message.error("获取CNG或母站上报信息失败！");
          this.setState({
            disable: true,
          });
          this.props.handleChangeButton(true);
        }
        this.setState({
          dataSource: dataSource,
          loading: false,
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
      // message.warning("请输入10位整数或2位小数！");
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
        this.values1[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values1[i]) !== "undefined") {
              total1 += this.values1[i];
            }
            total += dataSource[i].theoreticalGas;
        }
        dataSource[this.days][dataIndex] = total1;
        dataSource[this.days].theoreticalGas = total;
        break;
      case 'resident':
        let total2 = 0;
        let total3 = 0;
        this.values2[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values2[i]) !== "undefined") {
              total2 += this.values2[i];
            }
            total3 += dataSource[i].theoreticalGas;
        }
        dataSource[this.days][dataIndex] = total2;
        dataSource[this.days].theoreticalGas = total3;
        break;
      case 'actualGas':
        let total4 = 0;
        let total5 = 0;
        let total6 = 0;
        this.values3[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values3[i]) !== "undefined") {
              total4 += this.values3[i];
            }
            total5 += dataSource[i].totalForecast;
            total6 += dataSource[i].allForecast;
        }
        dataSource[this.days][dataIndex] = total4;
        dataSource[this.days].totalForecast = total5;
        dataSource[this.days].allForecast = total6;
        break;
      case 'lng':
        let total7 = 0;
        this.values4[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values4[i]) !== "undefined") {
              total7 += this.values4[i];
            }
        }
        dataSource[this.days][dataIndex] = total7;
        break;
      case 'gasStation':
        let total8 = 0;
        let total9 = 0;
        let total10 = 0;
        this.values5[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values5[i]) !== "undefined") {
              total8 += this.values5[i];
            }
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
        this.values6[dex] = parseFloat(value);
        for (let i = 0; i < this.days; i++) {
            if (typeof(this.values6[i]) !== "undefined") {
              total11 += this.values6[i];
            }
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
        {title: '日期', dataIndex: 'makeDate'},
        {title: '同期总量', dataIndex: 'lastyearTotal'},
        {title: '同期燃气', dataIndex: 'lastyearGas'},
        {title: '同期车用', dataIndex: 'lastyearVehicle'},
        {title: '同期外输', dataIndex: 'lastyearDeliver'},
        {title: '新增采暖', dataIndex: 'heating',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'heating', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: '新增居民、商业', dataIndex: 'resident',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'resident', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: '气温影响', dataIndex: 'temperature', },
        {title: '理论预测燃气', dataIndex: 'theoreticalGas', },
        {title: '实际预测燃气', dataIndex: 'actualGas', 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'actualGas', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年${month}月车用CNG`, dataIndex: 'cng',},
        {title: `${year}年${month}月车用LNG`, dataIndex: 'lng',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'lng', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年际通、廊东加气站`, dataIndex: 'gasStation', 
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'gasStation', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年怀来`, dataIndex: 'huailai',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'huailai', index, e.target.value)}} 
                onBlur={(e)=>{this.checkValue(e.target.value)}}/>
              );
            } else {
              return text;
            }
          }
        },
        {title: `${year}年预测总量`, dataIndex: 'totalForecast',},
        {title: '加气母站计划', dataIndex: 'motherStation',},
        {title: `${year}年预测总量（含加气母站）`, dataIndex: 'allForecast', }
      ];
  
      return(
        <div>
          <Table 
            scroll={{ x: '180%' }}
           bordered dataSource={dataSource} 
           columns={columns} 
           pagination={false}/>
        </div>
      );
  }
}