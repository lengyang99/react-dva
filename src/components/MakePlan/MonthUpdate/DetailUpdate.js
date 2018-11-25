import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';

@connect(
  state => ({
    data: state.make.dataDetail,
}))
export default class DetailUpdate extends PureComponent {
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
   
    this.state = {
      dataSource: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'make/getMonthDetail',
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
          info.forEach(element => {
            sum1 += parseFloat(element.secondTrunk);
            sum2 += parseFloat(element.centralBranch);
            sum3 += parseFloat(element.gasStation);
            sum4 += parseFloat(element.unionStation);
            sum5 += parseFloat(element.huadu);
            sum6 += parseFloat(element.planningQuantity);
            sum7 += parseFloat(element.requirement);
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
          dataSource.push({
            gid: 0,
            date: "合计",
            secondTrunk: sum1,
            centralBranch: sum2,
            gasStation: sum3,
            unionStation: sum4,
            huadu: sum5,
            planningQuantity: sum6,
            requirement: sum7,
          });
        }
        if (this.props.allForecastUpdate.length > 0 && dataSource.length > 0) {
          let sum = 0;
          for (let i = 0; i < this.days; i++) {
            dataSource[i].requirement = this.props.allForecastUpdate[i].allForecast/10000;
            sum += this.props.allForecastUpdate[i].allForecast/10000;
          }
          dataSource[this.days].requirement = sum;
        }
        this.setState({
          dataSource: dataSource,
          loading: false,
        });
        this.props.handleDetail(dataSource);
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    let dataSource = this.state.dataSource;
    if (nextProps.allForecastUpdate.length > 0 && dataSource.length > 0) {
      let sum = 0;
      for (let i = 0; i < this.days; i++) {
        dataSource[i].requirement = nextProps.allForecastUpdate[i].allForecast/10000;
        sum += nextProps.allForecastUpdate[i].allForecast/10000;
      }
      dataSource[this.days].requirement = sum;
    }
    this.setState({
      dataSource: dataSource,
      loading: false,
    });
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

    //列求和
    switch (dataIndex) {
      case 'secondTrunk':
        let total1 = 0;
        for (let i = 0; i < this.days; i++) {
          total1 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total1;
        break;
      case 'centralBranch':
        let total2 = 0;
        for (let i = 0; i < this.days; i++) {
          total2 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total2;
        break;
      case 'gasStation':
        let total3 = 0;
        for (let i = 0; i < this.days; i++) {
          total3 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total3;
        break;
      case 'unionStation':
        let total4 = 0;
        for (let i = 0; i < this.days; i++) {
          total4 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total4;
        break;
      case 'huadu':
        let total5 = 0;
        for (let i = 0; i < this.days; i++) {
          total5 += dataSource[i][dataIndex];
        }
        dataSource[this.days][dataIndex] = total5;
        break;
    }
   
    dataSource[this.days].planningQuantity = dataSource[this.days].secondTrunk + dataSource[this.days].centralBranch + dataSource[this.days].gasStation + dataSource[this.days].unionStation + dataSource[this.days].huadu;
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
  
    //返回月计划制定列表
    // const path = {
    //   pathname: '/distribution/monthPlan',
    // }
    // this.props.dispatch(routerRedux.push(path));

  render() {
    const {dataSource} = this.state;
    const columns = [
      { title: '日期', dataIndex: 'date', width: 100, }, 
      { title: '北方分公司', children: [
        {  title: '陕京二线干线', dataIndex: 'secondTrunk',
          render: (text, record, index) => {
            if (index !== this.days) {
              return (
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'secondTrunk', index, e.target.value)}} 
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
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'centralBranch', index,e.target.value)}}
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
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'gasStation', index,e.target.value)}}
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
                <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'unionStation', index,e.target.value)}} 
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
              <Input defaultValue={text} onChange={(e)=>{this.onCellChange(record.gid, 'huadu', index,e.target.value)}} 
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
        <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
      </div>
    );
  }
}