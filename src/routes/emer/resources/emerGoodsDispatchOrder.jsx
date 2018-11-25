import React from 'react';
import {connect} from 'dva';
import {Input, Button, message, Select} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

const mapEvent = 'mapEvent';
const {TextArea} = Input;

// 应急演练
let userTimer = -1;
let userMark = 0;

@connect(state => ({
  user: state.login.user,
  resources: state.emerLfMap.users,
  map: state.emerLfMap.map, // 地图
}))

export default class EmerGoodsDispatchOrder extends React.Component {
  constructor(props) {
    super(props);
    this.map = this.props.map;
    // XXX事件需要调用应急物资xxx规格xx物资x个、xxx规格xx物资x个、……，请做好调度工作，收到请回复1
    this.content = '';
    this.props.the_emerGoods.map((v, i) => {
      this.content += `${v.des}物资${v.labct}个、`;
    });
    this.content += '……，请做好调度工作，收到请回复1';
    this.state = {
      emerOrderSendContent: `${this.props.theCurrentEmerEvent.name}事件需要调用应急物资${this.content}`,
      userId: '',
    };
    message.config({
      duration: 1.5,
    });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 发布指令
  handleSendDispatchOrder = () => {
    let that = this;
    const {theCurrentEmerEvent, the_emerGoods, onCancel, resources} = this.props;
    const {userId, emerOrderSendContent} = this.state;
    let currentUser = resources.filter((v, i) => {
      return v.userid === userId;
    })[0];
    if (userId === '') {
      message.warn('【调度员】为空');
      return;
    }
    if (emerOrderSendContent === '') {
      message.warn('【指令内容】为空');
      return;
    }
    let fd = new FormData();
    fd.append('alarmId', theCurrentEmerEvent.alarmId);
    fd.append('orderType', 2);
    fd.append('receiverId', currentUser.userid);
    fd.append('receiver', currentUser.truename);
    fd.append('senderId', this.props.user.gid);
    fd.append('sender', this.props.user.username);
    fd.append('sendDep', '廊坊新奥调度中心');
    fd.append('sendContent', this.state.emerOrderSendContent);
    fd.append('sendTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    fd.append('ecode', this.props.user.ecode);
    this.props.dispatch({
      type: 'emer/addEmerOrder',
      payload: fd,
      callback: (res) => {
        message.info(res.msg);
        // 关闭指令发送窗口
        onCancel();
        // 清除应急演练人员的初始位置
        this.map.getMapDisplay().removeLayer('theDrillEmerUser');
        // 启动定时任务
        setInterval(this.handleSetTimeWork, 500);
      },
    });
  }

  // 设置指令内容
  setEmerOrderSendContent = (e) => {
    this.setState({
      emerOrderSendContent: e.target.value,
    });
  }

  // 设置定时任务
  handleSetTimeWork = () => {
    const {resources} = this.props;
    const {userId} = this.state;
    let currentUser = resources.filter((v, i) => {
      return v.objid === userId;
    })[0];
    if (userTimer) {
      this.handleRushToIncidentAddr(currentUser, 'theDrillEmerUser', userMark);
    }
  }

  // 应急人员赶往事发地点
  handleRushToIncidentAddr = (data, layerId, mark) => {
    // 被调度的人员到达指定位置，则关闭定时器
    if (mark === data.line.length && layerId === 'theDrillEmerUser') {
      clearInterval(userTimer);
      return;
    }
    // 清除上一次的位置
    this.map.getMapDisplay().removeLayer(layerId);
    // 绘制新的位置
    let p = data.line[mark];
    let param = {
      id: `${data.gid}`,
      layerId,
      src: '../../images/emer/layerIcon/emerUser.png',
      width: 42,
      height: 42,
      angle: 0,
      x: p.x,
      y: p.y,
    };
    this.map.getMapDisplay().image(param);
    // 设置下一次的位置
    userMark += 1;
  }

  onChangeUser = (value) => {
    let currentUser = this.props.resources.filter((v, i) => {
      return v.userid === value;
    })[0];
    this.setState({
      userId: value,
      // emerOrderSendContent: `请${currentUser.objname}${this.content}`,
    });
  };

  render = () => {
    const {onCancel, resources} = this.props;
    return (
      <Dialog
        title="调度指令"
        width={450}
        onClose={onCancel}
      >
        <div style={{margin: 10}}>
          <div>
            <span>
              调度员 :
              <Select
                value={this.state.userId}
                style={{width: 135, margin: '0px 14px 5px 8px', display: 'inline-block'}}
                placeholder="请选择"
                onChange={this.onChangeUser}
              >
                {resources.map((v, i) => <Select.Option key={i} value={v.userid}>{v.truename}</Select.Option>)}
              </Select>
            </span>
            <span>指令内容:</span>
            <div>
              <TextArea
                rows={3}
                cols={70}
                style={{resize: 'none'}}
                onChange={this.setEmerOrderSendContent}
                value={this.state.emerOrderSendContent}
              />
            </div>
          </div>
          <div>
            <Button
              type="primary"
              size="small"
              onClick={this.handleSendDispatchOrder}
            >发布</Button>&nbsp;&nbsp;&nbsp;
            <Button type="primary" size="small" onClick={onCancel}>取消</Button>
          </div>
        </div>
      </Dialog>
    );
  }
}
