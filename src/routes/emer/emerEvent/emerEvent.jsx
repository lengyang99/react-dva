import React from 'react';
import { connect } from 'dva';
import yjqd from '../../../../public/mp3/应急启动.mp3';
import styles from '../css/emerEvent.css';

@connect(state => ({
  user: state.login.user, // 当前登录系统的用户
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))

export default class EmerEvent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyEmerEventData: [],
    };
    this.handleGetHistoryEmerEvent();
  }

  componentDidMount() {

  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 查询历史应急事件
  handleGetHistoryEmerEvent = () => {
    let data = {};
    data.status = 4;
    data.ecode = this.props.user.ecode;
    data.terminalType = 'pc';
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          historyEmerEventData: res.data,
        });
      },
    });
  }

  render = () => {
    console.log(this.state.video);
    return (
      <div className={styles.emerEvent} style={this.props.ecodePattern && this.props.ecodePattern.emerMonitor 
        && this.props.ecodePattern.emerMonitor.isHasMonitor ? {top: 467} : {top: 238}}>
        <div className={styles.leftViewTitle}>应急事件</div>
        <div id={styles.emerEventList}>
          {
            this.state.historyEmerEventData.map((item) => {
              // 获取事件级别
              let emerEventLevel = '';
              switch (item.level) {
                case 1:
                  emerEventLevel = '一级紧急';
                  break;
                case 2:
                  emerEventLevel = '二级紧急';
                  break;
                case 3:
                  emerEventLevel = '三级紧急';
                  break;
                default:
                  break;
              }
              return (
                <div key={item.gid} className={styles.emerEventInfo}>
                  <div className={styles.emerEventItem}>事件名称：<span>{item.name}</span></div>
                  <div>事件级别：<span>{emerEventLevel}</span></div>
                  <div className={styles.emerEventItem}>事发地点：<span>{item.incidentAddr}</span></div>
                  <div>事发时间：<span>{item.incidentTime.substr(0, 10)}</span></div>
                  <div className={styles.emerEventItem}>前期处置：<span>{item.preDisposal}</span></div>
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}
