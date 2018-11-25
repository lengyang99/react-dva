import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
const {TextArea} = Input;
@connect(
  state => ({
  data: state.weekMake.dataTotal,
}))

export default class TotalUpdate extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
    this.planId = props.planId,
 
    this.state={
      dataSource: [],
      loading: true,
      gasAnalysis: "",//城燃分析
      vehicleAnalysis: "",//车用分析
      deliverAnalysis: "",//外输分析
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'weekMake/getWeekTotal',
      params: this.planId,
      callback:({msg,success})=>{
        let info = this.props.data;
        const dataSource = [];
        if (success) {
          if (typeof(info) != "undefined") {
            info[0].weekMakeTotals.forEach((element, index) => {
              dataSource.push({
                gid: element.gid,
                makeDate: element.makeDate,
                wendu: element.wendu,
                lastyearTotal: element.lastyearTotal,
                lastyearGas: element.lastyearGas,
                lastyearVehicle: element.lastyearVehicle,
                lastyearDeliver: element.lastyearDeliver,
                temperature: element.temperature,
                gas: element.gas,
                cng: element.cng,
                station: element.station,
                cities: element.cities,
                total: element.total,
              });
            });
          }
          this.setState({
            loading: false,
            dataSource: dataSource,
            gasAnalysis: info[0].gasAnalysis,
            vehicleAnalysis: info[0].vehicleAnalysis,
            deliverAnalysis: info[0].deliverAnalysis,
          });
        }
        this.props.handleTotal(dataSource);
        this.props.handledWeekMakeTotalAnalysis(info[0].gasAnalysis,1);
        this.props.handledWeekMakeTotalAnalysis(info[0].vehicleAnalysis,2);
        this.props.handledWeekMakeTotalAnalysis(info[0].deliverAnalysis,3);
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
    switch (index) {
      case 1:
        this.setState({
          gasAnalysis: value,
        });
        break;
      case 2:
        this.setState({
          vehicleAnalysis: value,
        });
        break;
      case 3:
        this.setState({
          deliverAnalysis: value,
        });
        break;
    }
    this.props.handledWeekMakeTotalAnalysis(value,index);
  }

  render() {
      let year = this.year;
      let month = this.month;
      const {dataSource, gasAnalysis, vehicleAnalysis, deliverAnalysis} = this.state;
      //构造表格信息
      const columns = [
        {title: '日期', dataIndex: 'makeDate', width: 37},
        {title: '同期均温', dataIndex: 'wendu', width: 37},
        {title: '同期总量', dataIndex: 'lastyearTotal', width: 50},
        {title: '同期燃气', dataIndex: 'lastyearGas', width: 50},
        {title: '同期车用', dataIndex: 'lastyearVehicle', width: 50},
        {title: '同期外输', dataIndex: 'lastyearDeliver', width: 50},
        // {title: '平均温度', dataIndex: 'temperature', width: 50},
        {title: '城燃气量', dataIndex: 'gas', width: 50, 
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'gas', index, e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          }
        },
        {title: '车用CNG', dataIndex: 'cng', width: 50},
        {title: '车用母站', dataIndex: 'station', width: 50,},
        {title: '际通、怀来、文安、涿州', dataIndex: 'cities', width: 50, 
          render: (text, record, index) => {
            return (
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'cities', index, e.target.value)}} 
              onBlur={(e)=>{this.checkValue(e.target.value)}}/>
            );
          }
        },
        {title: '总量', dataIndex: 'total', width: 50, }
      ];
  
      return (
        <div>
          <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
          <div>
            城燃分析<TextArea value={gasAnalysis}  autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 1)}} />
            车用分析<TextArea value={vehicleAnalysis} autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 2)}} />
            外输分析<TextArea value={deliverAnalysis} autosize={{ minRows: 2, maxRows: 4 }} onChange={(e)=>{this.handleChange(e.target.value, 3)}} />
          </div>
        </div>
      );
  }
}