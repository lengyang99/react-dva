import React from 'react';
import { connect } from 'dva';
import { Steps } from 'antd';
import moment from 'moment';
import EmerPlanDetails from '../emerPlan/emerPlanDetails.jsx';
import styless from '../less/emerTopInWar/emerTopInWar.css';
import styles from '../css/emerTopInWar.css';

let minusTimer = -1;
let progressTimer = -1;
const Step = Steps.Step;

@connect(state => ({
  user: state.login.user,
  token: state.login.token,
  map: state.emerLfMap.map, // 地图
  isEmerStatus: state.emerLfMap.isEmerStatus, //  应急/平时状态
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  currentEmerEventData: state.emerLfMap.currentEmerEventData, // 当前点击应急事件
}))

export default class EmerTopInWar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerPlanData: [],
      currentPlan: {},
      timeMinus: '',
      emerStartTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      emerPlanId: '',
      // 是否打开应急预案详情
      openEmerPlanDetails: false,
      current: 0,
      ProgressBar: [], // 步骤条
      mp3: null,     // mp3
    }
    this.isFirstControlArea = true;
  }

  componentDidMount = () => {
    console.log(this.props.currentEmerEventData, 'this.cirrent')
    const alarmId = this.props.currentEmerEvent ? this.props.currentEmerEvent.alarmId : this.props.currentEmerEventData[0].alarmId;
    this.handleGetEmerStartInfo(alarmId);
    this.time = new Date();
    minusTimer = setInterval(this.handleGetTimeMinus, 1000);
    this.handleProgress(alarmId);
    progressTimer = setInterval(() => this.handleProgress(alarmId), 10000);
  }

  componentWillUnmount = () => {
    clearInterval(minusTimer);
    clearInterval(progressTimer);
    this.setState = (state, callback) => {};
  }

  componentWillReceiveProps() {
    const alarmId = this.props.currentEmerEvent ? this.props.currentEmerEvent.alarmId : this.props.currentEmerEventData[0].alarmId;
    this.handleProgress(alarmId);
  }

  // 查询应急启动信息
  handleGetEmerStartInfo = (alarmId) => {
    let data = {};
    data.alarmId = alarmId;
    data.ecode = this.props.user.ecode;
    this.props.dispatch({
      type: 'emer/getEmerStart',
      payload: data,
      callback: (res) => {
        this.setState({
          // 设置应急启动时间和应急预案
          emerStartTime: res.data[0].startTime,
          emerPlanId: res.data[0].planId,
        });
        this.handleGetEmerPlan();
      },
    });
  }

  // 查询应急处置进度
  handleProgress = (alarmId) => {
    const { currentEmerEvent } = this.props;
    this.props.dispatch({
      type: 'emer/getEmerProcessType',
      payload: { alarmId: alarmId },
      callback: (res) => {
        if (res.success) {
          this.setState({ProgressBar: res.data});
          res.data.forEach((e, i) => {
            if (e.finishTime !== null) {
              let t = new Date(e.finishTime);
              if (t > this.time) {
                let id = `music_${i}`;
                let video = `<embed id=${id} src='./mp3/${e.process}.mp3' width=0 height=0 panel=0 autostart=true loop=1 />`;
                document.getElementById('music').innerHTML = document.getElementById('music').innerHTML + video;
                this.time = t;
                setTimeout(() => document.getElementById(id).remove(), 11000);
              }
            }
          });
          // if (res.data[1].process === '现场控制' && res.data[1].finishTime !== null && this.isFirstControlArea) {
          //   this.isFirstControlArea = false;
          //   this.props.dispatch({// 地图展示控制区域
          //     type: 'emer/getEmerControlArea',
          //     payload: {
          //       eventId: this.props.currentEmerEvent.alarmId,
          //     },
          //     callback: (res) => {
          //       let area = res.data[0];
          //       let areaParam = {
          //         id: currentEmerEvent.gid + '',
          //         layerId: 'controllArea',
          //         dots: JSON.parse(area.controlArea),
          //         fillcolor: [97, 180, 18, 0.5],
          //       };
          //       this.props.map.getMapDisplay().polygon(areaParam);
          //     }
          //   });
          // }
          for (let elem of res.data.values()) {
            if (elem.process === '应急终止') {
              if (elem.finishTime !== null) {
                clearInterval(minusTimer);
              }
            }
            if (elem.process === '现场控制') {
              if (elem.finishTime !== null && this.isFirstControlArea) {
                const alarmId = currentEmerEvent ? currentEmerEvent.alarmId : this.props.currentEmerEventData[0].alarmId;
                const gid = currentEmerEvent ? currentEmerEvent.gid : this.props.currentEmerEventData[0].gid;
                this.isFirstControlArea = false;
                this.props.dispatch({// 地图展示控制区域
                  type: 'emer/getEmerControlArea',
                  payload: {
                    eventId: alarmId,
                  },
                  callback: (res1) => {
                    let area = res1.data[0];
                    let areaParam = {
                      id: `${gid}`,
                      layerId: 'controllArea',
                      dots: JSON.parse(area.controlArea),
                      fillcolor: [97, 180, 18, 0.5],
                    };
                    this.props.map.getMapDisplay().polygon(areaParam);
                  },
                });
              }
            }
          }
        }
      },
    });
  }

  // 获取应急预案
  handleGetEmerPlan = () => {
    let data = {};
    data.status = 1 ;
    this.props.dispatch({
      type: 'emer/getEmerPlan',
      payload: data,
      callback: (res) => {
        this.setState({
          emerPlanData: res.data,
        });
        this.handleSetCurrentEmerPlan(null);
      },
    });
  }

  // 设置当前应急事件匹配的预案
  handleSetCurrentEmerPlan = (e) => {
    if (e) {
      for (let i = 0; i < this.state.emerPlanData.length; i += 1) {
        if (e.target.value === this.state.emerPlanData[i].gid) {
          this.setState({
            currentPlan: this.state.emerPlanData[i],
          });
          return;
        }
      }
    } else {
      for (let i = 0; i < this.state.emerPlanData.length; i += 1) {
        if (this.state.emerPlanId === this.state.emerPlanData[i].planId) {
          this.setState({
            currentPlan: this.state.emerPlanData[i],
          });
          return;
        }
      }
    }
  }

  // 获取指定的日期:yyyy年MM月dd日
  handleGetIncidentTime = (t) => {
    let year = t.substring(0, 4);
    let month = t.substring(5, 7);
    let day = t.substring(8, 10);
    return `${year}年${month}月${day}日`;
  }

  // 设置定时器
  handleGetTimeMinus = () => {
    if (!this.props.isEmerStatus) {
      // 清除定时任务
      clearInterval(minusTimer);
      return;
    }
    let minus = new Date().getTime() - new Date(this.state.emerStartTime.replace('-', '/')).getTime();
    // 秒数累计
    let time = Math.round(minus / 1000);
    let h = this.handleFixTheTime(Math.floor(time / 60 / 60));
    let s = this.handleFixTheTime(time % 60);
    let m = this.handleFixTheTime(Math.floor(time / 60 % 60));
    let timeMinus = `${h}:${m}:${s}`;
    this.setState({timeMinus});
  }

  // 修正时间
  handleFixTheTime = (t) => {
    let time = t;
    if (t >= 0 && t <= 9) {
      time = `0${t}`;
    }
    return time;
  }

  // 打开/关闭应急预案详情
  handleOpenOrCloseEmerPlanDetails = (op) => {
    if (op === 'open') {
      this.setState({
        openEmerPlanDetails: true,
      });
    } else {
      this.setState({
        openEmerPlanDetails: false,
      });
    }
  }

  render = () => {
    const { currentEmerEvent, handleGoEmerInNormal, token } = this.props;
    const incidentTime = currentEmerEvent ? currentEmerEvent.incidentTime : this.props.currentEmerEventData[0].incidentTime;
    const eventName = currentEmerEvent ? currentEmerEvent.name : this.props.currentEmerEventData[0].name;
    let url = `proxy/attach/findById?token=${token}&id=${this.state.currentPlan.attachedFile}`;
    let currentDate = this.handleGetIncidentTime(incidentTime);
    return (
      <div>
        <div id={styles.top}>
          <img alt="logo-emergency.gif" src="../../images/emer/logo-emergency.gif" />
          <span id={styles.name}>
            <span id={styles.date}>{eventName}</span>
            <span>-<a id={styles.Date}>{currentDate}</a></span>
            <span id={styles.timer}>
              {this.state.timeMinus}
            </span>
          </span>
          <span id={styles.info}>
            <a href="javascript:void(0)" title="点击查看预案详情" onClick={(op) => this.handleOpenOrCloseEmerPlanDetails('open')}>
              {this.state.currentPlan.name}
            </a>
          </span>
          <span id={styles.btn}>
            <select className={styles.select} onChange={(e) => this.handleSetCurrentEmerPlan(e)}>
              {
                this.state.emerPlanData.length === 0 ? '' : <option value="0">应急预案</option>
              }
              {
                this.state.emerPlanData.map((item) => {
                  return (<option key={item.gid} value={item.gid}>{item.name}</option>);
                })
              }
            </select>
          </span>
          <span id={styles.goNormal} onClick={handleGoEmerInNormal} />
          <span style={{ padding: '0 19px', position: 'absolute', right: 0 }}>
            <img alt="收缩" onClick={this.props.handleShowRightNav} style={{ cursor: 'pointer' }} src="../../images/emer/收缩.png" /></span>
          <div className={styless.StepView}>
            <div>
              {
                (this.state.ProgressBar || []).map((e, i) => {
                  if (e.finishTime !== null) {
                    return (
                      <div key={i} className={styless.StepView_greed}>
                        <span className={styless.StepSpan}>{e.process}</span>

                      </div>
                    );
                  } else {
                    return (
                      <div key={i} className={styless.StepView_red}>
                        <span className={styless.StepSpan}>{e.process}</span>
                      </div>
                    );
                  }
                })
              }
            </div>
          </div>
        </div>
        {/* 应急预案详情 */}
        {
          this.state.openEmerPlanDetails ? <EmerPlanDetails
            onCancel={(op) => this.handleOpenOrCloseEmerPlanDetails('close')}
            emerPlan={this.state.currentPlan}
            position={{ top: 85, left: 815 }}
            token={token}
          /> : ''
        }
        <div id="music" style={{width: 0, height: 0}}>
        </div>
      </div>
    );
  }
}
