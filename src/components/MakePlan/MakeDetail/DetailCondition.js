import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
@connect(
  state => ({
  data: state.make.dataDetail,
  token: state.login.token,
}))

export default class DetailCondition extends PureComponent {
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
  //     params: {templateName: 'monthDetail',planId: this.planId},
  //   });
  // }

  render() {
    const {dataSource} = this.state;
    let templateName = "monthDetail";
    let planId = this.planId;
    let token = this.props.token;
    let lujin = "/proxy/make/exportExcel?templateName=monthDetail&planId=" + planId + "&token=" + token;
    const columns = [
      { title: '日期', dataIndex: 'date', width: 100, }, 
      { title: '北方分公司', children: [
        {  title: '陕京二线干线', dataIndex: 'secondTrunk'}, 
        { title: '压缩机维检中心支线', dataIndex: 'centralBranch'}],
      }, 
      { title: '河北分公司', children: [
        { title: '采四', dataIndex: 'gasStation'}, 
        { title: '廊一联站', dataIndex: 'unionStation'}],
      }, 
      { title: '华都', dataIndex: 'huadu'}, 
      { title: '上报量', dataIndex: 'planningQuantity', width: 100,}, 
      { title: '需求量', dataIndex: 'requirement', width: 100,}
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