import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
@connect(
  state => ({
  data: state.make.dataTotal,
  token: state.login.token,
}))

export default class TotalCondition extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.month = new Date().getMonth() + 1;
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
      }
    });
  }

  // handleExport = () => {
  //   this.props.dispatch({
  //     type: 'make/exportExcel',
  //     params: {templateName: 'monthTotal',planId: this.planId },
  //   });
  // }

  render() {
      let year = this.year;
      let month = this.month;
      let templateName = "monthTotal";
      let planId = this.planId;
      let token = this.props.token;
      let lujin = "/proxy/make/exportExcel?templateName=monthTotal&planId=" + planId + "&token=" + token;
      const {dataSource} = this.state;
      //构造表格信息
      const columns = [
        {title: '日期', dataIndex: 'makeDate', width: 37},
        {title: '同期总量', dataIndex: 'lastyearTotal', width: 50},
        {title: '同期燃气', dataIndex: 'lastyearGas', width: 50},
        {title: '同期车用', dataIndex: 'lastyearVehicle', width: 50},
        {title: '同期外输', dataIndex: 'lastyearDeliver', width: 50},
        {title: '新增采暖', dataIndex: 'heating', width: 50},
        {title: '新增居民、商业', dataIndex: 'resident', width: 50},
        {title: '气温影响', dataIndex: 'temperature', width: 50},
        {title: '理论预测燃气', dataIndex: 'theoreticalGas', width: 50},
        {title: '实际预测燃气', dataIndex: 'actualGas', width: 50},
        {title: `${year}年${month}月车用CNG`, dataIndex: 'cng', width: 50},
        {title: `${year}年${month}月车用LNG`, dataIndex: 'lng', width: 50},
        {title: `${year}年际通、廊东加气站`, dataIndex: 'gasStation', width: 50},
        {title: `${year}年怀来`, dataIndex: 'huailai', width: 50},
        {title: `${year}年预测总量`, dataIndex: 'totalForecast', width: 50},
        {title: '加气母站计划', dataIndex: 'motherStation', width: 50},
        {title: `${year}年预测总量（含加气母站）`, dataIndex: 'allForecast', width: 50}
      ];
  
      return (
        <div>
          <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
          <div className={styles.button}>
            <Button type="primary"><a href={`${lujin}`}>导出</a></Button>
            <Button style={{marginLeft: '25px'}}><Link to={'/distribution/monthPlan'}>返回</Link></Button>
          </div>
        </div>
      );
  }
}