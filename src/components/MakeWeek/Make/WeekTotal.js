import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
const { TextArea } = Input;
@connect(
  state => ({
    success: state.weekMake.success,
    msg: state.weekMake.msg,
    lastyearMonth: state.weekMake.lastyearMonth,
    cng: state.weekMake.cng,
}))
export default class WeekTotal extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.week = this.getWeek();
    this.state={
      dataSource: [],
    }
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

  componentDidMount() {
    let monday = new Date(this.week[0]).getDate();
    let year1 = new Date(this.week[0]).getFullYear();
    let month1 = new Date(this.week[0]).getMonth() + 1;
    let sunday = new Date(this.week[6]).getDate();
    let year2 = new Date(this.week[6]).getFullYear();
    let month2 = new Date(this.week[6]).getMonth() + 1;
    if (monday < 9) {
      monday = `0${monday}`;
    }
    if (sunday < 9) {
      sunday = `0${sunday}`;
    }
    if (month1 < 9) {
      month1 = `0${month1}`;
    }
    if (month2 < 9) {
      month2 = `0${month2}`;
    }
    let param = {
      startdate: `${year1-1}-${month1}-${monday}`, 
      enddate: `${year2-1}-${month2}-${sunday}`,
    }
    const dataSource = [];
    this.props.dispatch({
      type: 'weekMake/getLastyearMonth',
      params: param,
      callback: ({msg,success})=>{
        if (success) {
          //构造表单信息
          let info = this.props.lastyearMonth;
          if (typeof(info) != "undefined" && info.length > 0) {
            for (let i = 0; i < this.week.length; i++) {
              dataSource.push({
                key: i+1,
                makeDate: this.week[i],
                wendu: parseFloat((parseFloat(info[i].maxTemperature) + parseFloat(info[i].lowTemperature) ) / 2),
                lastyearTotal: parseFloat(info[i].total),
                lastyearGas: parseFloat(info[i].gas),
                lastyearVehicle: parseFloat(info[i].vehicle),
                lastyearDeliver: parseFloat(info[i].deliver),
                temperature: 23,
                gas:0,
                cng: 0,
                station: 0,
                cities: 0,
                total: 0,
              });
            }
          }
        }
      }
    });

    this.props.dispatch({
      type: 'weekMake/getCNGStation',
      params: {startdate: `${this.week[0]}`, enddate: `${this.week[6]}`,},
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
                cng = info[0].weekDetails;
                station = info[1].weekDetails;
              } else {
                cng = info[1].weekDetails;
                station = info[0].weekDetails; 
              }
              if(dataSource && dataSource.length!==0){
                for (let i = 0; i < this.week.length; i++) {
                  dataSource[i].cng = parseFloat(cng[i].reportValue);
                  dataSource[i].station = parseFloat(station[i].reportValue);
              }
              (dataSource || []).forEach((element,index) => {
                dataSource[index].total = parseFloat(element.cng) + parseFloat(element.station);
              });
            }
          }
            //初始行求和
            this.props.handleTotal(dataSource);
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
        });
        
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
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = parseFloat(value);
      dataSource.forEach((element,index) => {
        if (index === dex) {
          dataSource[index] = target;
          switch (dataIndex) {
            case "gas":
              dataSource[index].total = target.cng + target.station + target.cities + parseFloat(value);
              break;
            case "cities":
              dataSource[index].total = target.cng + target.station + target.gas + parseFloat(value);
              break;
          }
        }
      });
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
    }
  }

  handleChange = (value, index) => {
    this.props.handledWeekMakeTotalAnalysis(value,index);
  }

  render() {
      const {dataSource} = this.state;
      //构造表格信息
      const columns = [
        {title: '日期', dataIndex: 'makeDate', width: 50},
        {title: '同期均温', dataIndex: 'wendu', width: 40},
        {title: '同期总量', dataIndex: 'lastyearTotal', width: 50},
        {title: '同期燃气', dataIndex: 'lastyearGas', width: 50},
        {title: '同期车用', dataIndex: 'lastyearVehicle', width: 50},
        {title: '同期外输', dataIndex: 'lastyearDeliver', width: 50},
        // {title: '平均温度', dataIndex: 'temperature', width: 50},
        {title: '城燃气量', dataIndex: 'gas', width: 50, 
          render: (text, record, index) => {
            return (
              <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'gas', index, e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          }
        },
        {title: '车用CNG', dataIndex: 'cng', width: 50},
        {title: '车用母站', dataIndex: 'station', width: 50,},
        {title: '际通、怀来、文安、涿州', dataIndex: 'cities', width: 50, 
          render: (text, record, index) => {
            return (
              <Input disabled={this.state.disable} onChange={(e)=>{this.onCellChange(record.key, 'cities', index, e.target.value)}}
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          }
        },
        {title: '总量', dataIndex: 'total', width: 40, }
      ];
  
      return (
        <div>
          <Table bordered dataSource={dataSource} columns={columns} pagination={false}/>
          <div>
            城燃分析<TextArea disabled={this.state.disable} autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 1)}} />
            车用分析<TextArea disabled={this.state.disable} autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 2)}} />
            外输分析<TextArea disabled={this.state.disable} autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 3)}} />
          </div>
        </div>
      );
  }
}