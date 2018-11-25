import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
const { TextArea } = Input;
@connect(
  state => ({
  data: state.weekMake.dataTotal,
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
      gasAnalysis: "",//城燃分析
      vehicleAnalysis: "",//车用分析
      deliverAnalysis: "",//外输分析
      loading: true,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'weekMake/getWeekTotal',
      params: this.planId,
      callback:({msg,success})=>{
        if (success) {
          let info = this.props.data;
          const dataSource = [];
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
            dataSource: dataSource,
            gasAnalysis: info[0].gasAnalysis,
            vehicleAnalysis: info[0].vehicleAnalysis,
            deliverAnalysis: info[0].deliverAnalysis,
          });
        }
        this.setState({
          loading: false,
        });
      }
    });
  }

  // handleExport = () => {
  //   this.props.dispatch({
  //     type: 'weekMake/exportExcel',
  //     params: {templateName: 'weekTotal',planId: this.planId},
  //   });
  // }

  render() {
      let year = this.year;
      let month = this.month;
      let templateName = "weekTotal";
      let planId = this.planId;
      let token = this.props.token;
      let lujin = "/proxy/week/exportExcel?templateName=weekTotal&planId=" + planId + "&token=" + token;
      const {dataSource, gasAnalysis, vehicleAnalysis, deliverAnalysis} = this.state;
      //构造表格信息
      const columns = [
        {title: '日期', dataIndex: 'makeDate', width: 37},
        {title: '同期均温', dataIndex: 'wendu', width: 65},
        {title: '同期总量', dataIndex: 'lastyearTotal', width: 50},
        {title: '同期燃气', dataIndex: 'lastyearGas', width: 50},
        {title: '同期车用', dataIndex: 'lastyearVehicle', width: 50},
        {title: '同期外输', dataIndex: 'lastyearDeliver', width: 50},
        // {title: '平均温度', dataIndex: 'temperature', width: 50},
        {title: '城燃气量', dataIndex: 'gas', width: 50},
        {title: '车用CNG', dataIndex: 'cng', width: 50},
        {title: '车用母站', dataIndex: 'station', width: 50},
        {title: '际通、怀来、文安、涿州', dataIndex: 'cities', width: 50},
        {title: '总量', dataIndex: 'total', width: 20},
      ];
      return (
        <div>
          <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
          <div>
          城燃分析<TextArea value={gasAnalysis} autosize={{ minRows: 2, maxRows: 4 }} />
          车用分析<TextArea value={vehicleAnalysis} autosize={{ minRows: 2, maxRows: 4 }} />
          外输分析<TextArea value={deliverAnalysis} autosize={{ minRows: 2, maxRows: 4 }} />
          </div>
          <div className={styles.button}>
            <Button type="primary"><a href={`${lujin}`}>导出</a></Button>
            <Button style={{marginLeft: '25px'}}><Link to={'/distribution/weekPlan'}>返回</Link></Button>
          </div>
        </div>
      );
  }
}