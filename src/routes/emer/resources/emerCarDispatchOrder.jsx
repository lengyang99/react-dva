import React from 'react';
import {connect} from 'dva';
import {Input, Button, message} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

const mapEvent = 'mapEvent';
const {TextArea} = Input;

// 应急演练
let carTimer = -1;
let carMark = 0;

@connect(state => ({
  user: state.login.user,
}))

export default class EmerCarDispatchOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerOrder_sendContent: '立即前往事发现场',
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
    const {emerEvent, onCancel, the_emerCar} = this.props;
    let fd = new FormData();
    fd.append('alarmId', emerEvent.alarmId);
    fd.append('orderType', 2);
    fd.append('receiver', the_emerCar.Tel);
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
        setInterval(this.handleSetTimeWork, 1000);
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
    const {the_emerCar} = this.props;
    if (carTimer) {
      this.handleRushToIncidentAddr(the_emerCar, 'car', carMark);
    }
  }

  // 应急车辆赶往事发地点
  handleRushToIncidentAddr = (data, layerId, mark) => {
    // 被调度的人员到达指定位置，则关闭定时器
    if (mark === data.line.length && layerId === 'car') {
      clearInterval(carTimer);
      return;
    }
    // 绘制新的位置
    let p = data.line[mark];
    let param = {
      id: `${data.gid}`,
      layerId,
      src: `./images/emer/layerIcon/${layerId}.png`,
      width: 42,
      height: 42,
      angle: 0,
      x: p.x,
      y: p.y,
    };
    this.props.map.getMapDisplay().image(param);
    // 设置下一次的位置
    carMark += 1;
  }

  render = () => {
    const {onCancel} = this.props;
    return (
      <Dialog
        title="调度指令"
        width={450}
        onClose={onCancel}
      >
        <div style={{margin: 10}}>
          <div>
            <span>指令内容:</span>
            <div>
              <TextArea
                rows={3}
                cols={70}
                style={{resize: 'none'}}
                onBlur={this.setEmerOrderSendContent}
                value={this.state.emerOrder_sendContent}
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

