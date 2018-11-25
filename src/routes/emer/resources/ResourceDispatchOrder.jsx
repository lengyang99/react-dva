import React from 'react';
import {connect} from 'dva';
import {Input, Button, message} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

const mapEvent = 'mapEvent';
const {TextArea} = Input;

// 应急演练
let userTimer = -1;
let userMark = 0;

@connect(state => ({
  user: state.login.user,
}))

export default class EmerUserDispatchOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerOrder_sendContent: '立即前往事发现场',
    };
    message.config({
      duration: 2,
    });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 发布指令
  handleSendDispatchOrder = () => {
    const {emerEvent, currentResource, onCancel} = this.props;
    let fd = new FormData();
    fd.append('alarmId', emerEvent.alarmId);
    fd.append('orderType', 2);
    fd.append('receiver', currentResource.username);
    fd.append('senderId', this.props.user.gid);
    fd.append('sender', this.props.user.trueName);
    fd.append('sendDep', '廊坊新奥调度中心');
    fd.append('sendContent', this.state.emerOrder_sendContent);
    fd.append('sendTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    fd.append('ecode', this.props.user.ecode);
    this.props.dispatch({
      type: 'emer/addEmerOrder',
      payload: fd,
      callback: (res) => {
        message.info(res.msg);
        // 关闭指令发送窗口
        onCancel();
        // 启动定时任务
        setInterval(this.handleSetTimeWork, 500);
      },
    });
  }

  // 设置指令内容
  setEmerOrderSendContent = (e) => {
    this.setState({
      emerOrder_sendContent: e.target.value,
    });
  }

  // 设置定时任务
  handleSetTimeWork = () => {
    const {currentResource} = this.props;
    if (userTimer) {
      this.handleRushToIncidentAddr(currentResource, 'emerUser', userMark);
    }
  }

  // 应急人员赶往事发地点
  handleRushToIncidentAddr = (data, layerId, mark) => {
    // 被调度的人员到达指定位置，则关闭定时器
    if (mark === data.line.length && layerId === 'emerUser') {
      clearInterval(userTimer);
      return;
    }
    // 清除上一次的位置
    // if (this.props.appEvent.emit(mapEvent + '.mapDisplay.getLayer', layerId)) {
    //   this.props.appEvent.emit(mapEvent + '.mapDisplay.removeLayer', layerId);
    // }
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
    this.props.map.getMapDisplay().image(param);
    // 设置下一次的位置
    userMark += 1;
  }

  render = () => {
    const {onCancel} = this.props;
    return (
      <Dialog
        title="调度指令"
        width={450}
        onClose={onCancel}
        modal
      >
        <div style={{margin: 10}}>
          <span>指令内容:</span>
          <TextArea
            rows={3}
            cols={70}
            style={{resize: 'none', margin: '8px 0'}}
            onChange={this.setEmerOrderSendContent}
            value={this.state.emerOrder_sendContent}
          />
          <Button type="primary" size="small" onClick={this.handleSendDispatchOrder}>发布</Button>&nbsp;&nbsp;&nbsp;
          <Button type="primary" size="small" onClick={onCancel}>取消</Button>
        </div>
      </Dialog>
    );
  }
}
