import React from 'react';
import {connect} from 'dva';
import {Select, Button, Input, message} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerStartOrder from './emerStartOrder.jsx';
import styles from '../css/emerStart.css';

const {TextArea} = Input;
const mapEvent = 'mapEvent';
const Option = Select.Option;

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map,
}))

export default class EmerStart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerEventTypeData: [],
      emerPlanData: [],
      emerPlanAllData: [], //全部应急预案
      emerStart_planId: '',
      emerStart_planName: '',
      emerStart_startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      openEmerStartOrder: false,
      // 应急事件前期处置内容
      emerEventPreDisposal: '',
      dangerData: [],  //险情分类数据
    };
    message.config({
      duration: 2,
    });
    
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'emer/getDangerType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        console.log(res, '险情分类');
        this.handleGetEmerPlan(res.data);
        this.setState({
          dangerData : res.data,
        });
      },
    });
  }
  
  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  }

  openOrganization = () => {
  // 发送应急启动指令
    this.setState({
      openEmerStartOrder: true,
    });
  };

  // 2.1 启动应急
  handleAddEmerStart = () => {
    const { emerEvent, drawingOneEmerEvent } = this.props;
    let flag = true;
    let planId = '';
    let reg = new RegExp('[\\u4E00-\\u9FFF]');
    if (flag) {
      if (reg.test(this.state.emerStart_planId)) {
        for (let [index, elem] of this.state.emerPlanData.entries()) {
          if (elem.name === this.state.emerStart_planId) {
            planId = elem.planId;
          }
        }
      } else {
        planId = this.state.emerStart_planId;
      }
      let fd = new FormData();
      fd.append('alarmId', emerEvent.alarmId);
      fd.append('planId', planId);
      fd.append('startUserId', this.props.user.gid);
      fd.append('startUser', this.props.user.trueName);
      fd.append('startTime', this.state.emerStart_startTime);
      this.props.dispatch({
        type: 'emer/addEmerStart',
        payload: fd,
        callback: () => {
          // 关联应急预案，设置应急启动时间，更新全局事件
          emerEvent.planId = this.state.emerStart_planId;
          emerEvent.startTime = this.state.emerStart_startTime;
          this.props.dispatch({
            type: 'emerLfMap/getCurrentEmerEvent',
            payload: {gid: emerEvent.gid},
            callback: () => {
              this.setState({openEmerStartOrder: false});
              this.props.onCancel();
              message.info('应急启动成功');
              // 定位事发地点为地图中心点
              let centerPoint = {
                x: emerEvent.x,
                y: emerEvent.y
              };
              this.props.map.centerAt(centerPoint);
              drawingOneEmerEvent && drawingOneEmerEvent(emerEvent);
              this.props.dispatch({
                type: 'emerLfMap/setFlag',
                payload: {
                  isEmerStatus: true,
                  isShowEmerWarn: false,
                },
              });
            },
          });
        },
      });
    }
  }

  // 表单校验
  handleCheckForm = () => {
    if (this.state.emerStart_planId.trim() === '') {
      message.warning('请选择应急预案');
      return false;
    }
    return true;
  }

  // 2.2 事件关闭:修改事件状态为4
  handleCloseEmerEvent = () => {
    const {emerEvent, onCancel} = this.props;
    let data = {};
    data.alarmId = emerEvent.alarmId;
    this.props.dispatch({
      type: 'emer/closeEmerEvent',
      payload: data,
      callback: (res) => {
        message.info(res.msg);
        // 关闭应急事件处置模态框
        onCancel();
      },
    });
  }

  // 根据应事件类型查询应急预案
  handleGetEmerPlan = (dangerType) => {
    const {emerEvent} = this.props;
    const {emerPlanAllData} = this.state;
    let data = {};
    // data.eventType = emerEvent.type;
    const dangertype = dangerType.length >0 && dangerType.filter(item => 
      emerEvent.dangerType === item.name
    ); //根据险分类查询
    data.dangerType = dangertype && dangertype.length > 0 ? dangertype[0].gid : '';
    data.ecode = this.props.user.ecode;
    data.status = 1;
    this.props.dispatch({
      type: 'emer/getEmerPlan',
      payload: data,
      callback: (res) => {
        if (res.data.length > 0) {
          this.setState({
            emerPlanData: res.data,
            emerStart_planId: res.data[0].planId,
            emerStart_planName: res.data[0].name,
          });
        } else if (res.data.length === 0) {
          const data = {
            ecode: this.props.user.ecode,
            status: 1,
          }
          this.props.dispatch({
            type: 'emer/getEmerPlan',
            payload: data,
            callback: (res) => {
              this.setState({
                emerPlanData: res.data,
                emerStart_planId: res.data[0].planId,
                emerStart_planName: res.data[0].name,
              });
            },
          });
          
        }
      },
    });
  }

  // 设置应急预案
  setEmerPlan = (value) => {
    // 确定要预览的应急预案
    for (let i = 0; i < this.state.emerPlanData.length; i += 1) {
      if (this.state.emerPlanData[i].planId === value) {
        this.setState({
          emerStart_planName: this.state.emerPlanData[i].name,
          emerStart_planId: value,
        });
      }
    }
  }

  // 获取应急事件类型信息
  handleGetEmerEvnetType = () => {
    let data = {};
    this.props.dispatch({
      type: 'emer/getEmerEventType',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventTypeData: res.data,
        });
      },
    });
  }

  // 应急事件前期处置
  setEmerEventPreDisposal = (e) => {
    this.setState({
      emerEventPreDisposal: e.target.value,
    });
  }

  // 保存应急事件前期处置内容
  handleSavePreDisposal = () => {
    if (this.state.emerEventPreDisposal === '') {
      message.warning('请完善应急事件前期处置内容');
      return;
    }
    const {emerEvent} = this.props;
    let data = {};
    data.alarmReceiverId = this.props.user.gid;
    data.alarmReceiver = this.props.user.trueName;
    data.preDisposal = this.state.emerEventPreDisposal;
    data.alarmId = emerEvent.alarmId;
    this.props.dispatch({
      type: 'emer/saveEmerEventPreDisposal',
      payload: data,
      callback: (res) => {
        message.info(res.msg);
        // 前期处置内容保存成功后，禁用“保存”按钮
        document.getElementById('saveEventPreDisposal').setAttribute('disabled', 'disabled');
      },
    });
  }

  // 应急预案预览
  handlePreviewEmerPlan = () => {
    if (this.state.emerStart_planId === '') {
      message.warning('请选择应急预案');
      return;
    }
    const url = `/images/static/${this.state.emerStart_planName}.html`;
    const getWindowWidth = () => (window.innerWidth || document.documentElement.clientWidth);
    const newWindWidth = 590;
    const left = (getWindowWidth() - newWindWidth) / 2;
    window.open(url, '_blank,title="预案详情"',
      `width=${newWindWidth},height=440,left=${left},top=150,location=0,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`
    );
  }

  render() {
    const {emerEvent, onCancel} = this.props;
    this.map = this.props.map;
    return (
      <div>
        <Dialog
          title="应急事件处置"
          width={480}
          onClose={onCancel}
          position={{
            top: 185,
            left: 500,
          }}
          modal
        >
          <div style={{margin: 10}}>
            <form style={{color: '#000'}}>
              <div className={styles.emerStartFormItem_1}>
                <span><label>事件名称：</label>{emerEvent.name}</span>
              </div>
              {/* <div className={styles.emerStartFormItem_1}>
                <span><label>事件类型：</label>{emerEvent.typeName}</span>
              </div> */}
              <div className={styles.emerStartFormItem_1}>
                <span><label>险情分类：</label>{emerEvent.dangerType}</span>
              </div>
              <div className={styles.emerStartFormItem_1}>
                <span><label>事发单位：</label>{emerEvent.incidentUnit}</span>
              </div>
              <div className={styles.emerStartFormItem_1}>
                <span><label>事发时间：</label>{emerEvent.incidentTime}</span>
              </div>
              <div className={styles.emerStartFormItem_1}>
                <span><label>事发地点：</label>{emerEvent.incidentAddr}</span>
              </div>
              {/* <div className={styles.emerStartFormItem_1}> */}
              {/* <span><label>事件等级:</label>{emerEvent.levelName}</span> */}
              {/* </div> */}
              <div className={styles.emerStartFormItem_1}>
                <span>
                  <label>前期处置：</label>
                  <TextArea
                    rows={3}
                    cols={65}
                    style={{resize: 'none'}}
                    onBlur={this.setEmerEventPreDisposal}
                    defaultValue={this.state.emerEventPreDisposal}
                  />
                </span>
              </div>
              <div className={styles.emerStartFormItem_1}>
                <span>
                  <label>应急预案：</label>
                  <Select
                    onChange={this.setEmerPlan}
                    style={{width: 240, display: 'inline-block'}}
                    value={this.state.emerStart_planId}
                  >
                    {
                      this.state.emerPlanData.map((item) => {
                        return (<Option key={item.gid} value={item.planId}>{item.name}</Option>);
                      })
                    }
                  </Select>
                  <a id={styles.a_preview} href="javascript:void(0)" onClick={this.handlePreviewEmerPlan}>预览</a>
                </span>
              </div>
              <div className={styles.emerStartFormBtn}>
                {/* 进入应急状态 */}
                <Button id="saveEventPreDisposal" type="primary" size="small" onClick={this.handleSavePreDisposal}>保存</Button>&nbsp;&nbsp;&nbsp;
                <Button type="primary" size="small" onClick={this.handleCloseEmerEvent}>关闭事件</Button>&nbsp;&nbsp;&nbsp;
                <Button type="primary" size="small" onClick={this.openOrganization}>启动应急</Button>
              </div>
            </form>
          </div>
        </Dialog>
        {/* 应急启动指令 */}
        {
          this.state.openEmerStartOrder ? <EmerStartOrder
            handleAddEmerStart={this.handleAddEmerStart}
            emerEvent={emerEvent}
            planId={this.state.emerStart_planId}
            onCancel={() => { this.setState({openEmerStartOrder: false}); }}
          /> : ''
        }
      </div>
    );
  }
}
