import React, {PureComponent} from 'react';
import { Table, Input, Icon, Button, message } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import styles from '../style.less';
@connect(
  state => ({
  data: state.weekMake.dataDetail,
  token: state.login.token,
}))

export default class DetailCondition extends PureComponent {
  constructor(props){
    super(props);
    this.year = new Date().getFullYear();
    this.planId = props.planId,

    this.state = {
      dataSource: [],
      loading: true,
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'weekMake/getWeekDetail',
      params: this.planId,
      callback:({msg,success})=>{
        if (success) {
          let info = this.props.data;
          const dataSource = [];
          if (typeof(info) != "undefined") {
            info.forEach(element => {
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
          }
          this.setState({
            dataSource: dataSource,
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
  //     params: {templateName: 'weekDetail',planId: this.planId},
  //   });
  // }

  render() {
    const {dataSource} = this.state;
    let templateName = "weekDetail";
    let planId = this.planId;
    let token = this.props.token;
    let lujin = "/proxy/week/exportExcel?templateName=weekDetail&planId=" + planId + "&token=" + token;
    const columns = [
      { title: '日期', dataIndex: 'date',}, 
      { title: '北方分公司', children: [
        {  title: '陕京二线干线', dataIndex: 'secondTrunk'}, 
        { title: '压缩机维检中心支线', dataIndex: 'centralBranch'}],
      }, 
      { title: '河北代表处', children: [
        { title: '采四配气站', dataIndex: 'gasStation'}, 
        { title: '廊一联站', dataIndex: 'unionStation'}],
      }, 
      { title: '华都', dataIndex: 'huadu'}, 
      { title: '上报量', dataIndex: 'planningQuantity', width: 100,}, 
      { title: '需求量', dataIndex: 'requirement', width: 100,}
    ];  
    return (
      <div className={styles.button}>
        <Table loading={this.state.loading} bordered rowKey={record => record.gid} dataSource={dataSource} columns={columns} pagination={false}/>
        <div className={styles.button}>
          <Button type="primary"><a href={`${lujin}`}>导出</a></Button>
          <Button style={{marginLeft: '25px'}}><Link to={'/distribution/weekPlan'}>返回</Link></Button>
        </div>
      </div>
    );
  }
}