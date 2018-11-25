import React from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {Modal, message, Tooltip, Button} from 'antd';
import styles from '../css/aemerHandleProcess.css';
import Process from './emerHandleProcess.jsx';

let getHandleProcessTimer = -1;

@connect(state => ({
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  currentEmerEventData: state.emerLfMap.currentEmerEventData, // 当前点击应急事件
}))

export default class AemerHandleProcess extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      OpenPro: false,
      datajson: [],
      dataSource: {},
      data: [],
    });
  }

  componentDidMount() {
    let index = 0;
    const alarmId = this.props.currentEmerEvent ? this.props.currentEmerEvent.alarmId : this.props.currentEmerEventData[0].alarmId
    const getData = () => {
      this.props.dispatch({
        type: 'emer/getEmerHandleProcessRecord',
        payload: {alarmId},
        callback: (res) => {
          const oldData = this.state.data;
          if (res.data.length > oldData.length) {
            this.setState({data: res.data});
            showData(_.slice(res.data, 0, res.data.length - oldData.length));
          }
        },
      });
    }
    const showData = (data) => {
      data.reverse();
      if (this.timer2) {
        clearInterval(this.timer2);
        index = 0;
      }
      this.timer2 = setInterval(() => {
        this.setState({dataSource: data[index]});
        index += 1;
        if (index >= data.length) {
          index = 0;
          clearInterval(this.timer2);
        }
      }, 5000);
    }
    getData();
    this.timer1 = setInterval(getData, 15000);
  }

  componentWillUnmount = () => {
    if (this.timer1) {
      clearInterval(this.timer1);
    }
    if (this.timer2) {
      clearInterval(this.timer2);
    }
    this.setState = (state, callback) => {};
  }

  // 点击详情
  handlePrecss = () => {
    this.setState({
      OpenPro: !this.state.OpenPro,
    });
  }

  render = () => {
    return (
      <div className={styles.mymsg1}>
        <div className={styles.mymsg7}>
          <div className={styles.mymsg2}>{this.state.dataSource.handler || ''}</div>
          <div className={styles.mymsg3}>
            <Tooltip placement="topLeft" title={this.state.dataSource.handleContent || ''}>
              <div className={styles.mymsg6}>{(this.state.dataSource.handleContent || ' ').length < 8 ? this.state.dataSource.handleContent : `${this.state.dataSource.handleContent.substring(0, 7)}...`}</div>
            </Tooltip>
          </div>
          <div className={styles.mymsg4}>{(this.state.dataSource.handleTime || ' ').substring(10, 16)}</div>
          <div className={styles.mymsg5}>
            <Button icon="arrows-alt" type="primary" size="small" onClick={this.handlePrecss} />
            {
              this.state.OpenPro ? <Process
                currentEmerEvent={this.props.currentEmerEvent}
                emerHandleProcessRecordData={this.state.data}
              /> : ''
            }
          </div>
        </div>
      </div>
    );
  }
}
