import React from 'react';
import {Table} from 'antd';
import {connect} from 'dva';
import styles from '../css/emerMonitor.css'
// 引入压力监测表
import EmerPressureMonitor from '../monitorPoint/emerPressureMonitor.jsx';
// 引入流量监测折线图
import EmerFlowMonitor from '../monitorPoint/emerFlowMonitor.jsx';
// import $ from 'jquery';
import {isNumber} from 'util';

@connect(state => ({
  user: state.login.user,
}))

export default class EmerMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPressureMonitor: true,
      dataSource: [],
      emerEventTypeValue: '0',
      emerPlanTypeValue: '0',
    };
  }

  componentDidMount() {
    this.handleGetEmerPlan();
    // let ths = $('table>thead>tr>th');
    // Object.keys(ths).filter((key) => Number(key) >= 0).forEach((k) => {
    //     ths[k].style.background = 'none';
    //     ths[k].style.color = 'white';
    // });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  handleGetEmerPlan = () => {
    let data = {};
    data.eventType = this.state.emerEventTypeValue;
    data.type = this.state.emerPlanTypeValue;
    this.props.dispatch({
      type: 'emer/getEmerPlan',
      payload: data,
      callback: (res) => {
        console.log(res)
        if (res.success) {
          this.setState({
            dataSource: res.data,
          });
        } else {
          this.setState({
            dataSource: [],
          });
        }
      },
    });
  }

  // 切换应急监测内容
  handleChangeMonitor = (monitor) => {
    if (monitor === 'flow') {
      this.setState({
        showPressureMonitor: false,
      });
    } else {
      this.setState({
        showPressureMonitor: true,
      });
    }
  }

  render = () => {
    const {emerMonitorDatas, emerCurrentMonitorId} = this.props;
    const columns = [{
      title: '预案',
      dataIndex: 'typeName',
      width: 70,
      sortOrder: 'typeName',
    }, {
      title: '名称',
      dataIndex: 'name',
      width: 70,
      sortOrder: 'name',
    }]
    return (
      <div className={styles.emerStatistic}>
        <div className={styles.leftViewTitle}>
          <a className={styles.center} style={{color: '#fff'}} onClick={(monitor) => this.handleChangeMonitor('pressure')}>应急预案</a>
        </div>
        <div style={{paddingTop: 25}}>
          <Table
            size="small"
            columns={columns}
            dataSource={this.state.dataSource}
            pagination={{pageSize: 3, hideOnSinglePage: true}}
          />
        </div>
      </div>
    );
  }
}
