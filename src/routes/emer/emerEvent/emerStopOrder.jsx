import React from 'react';
import {connect} from 'dva';
import {Button, Input, message} from 'antd';
import moment from 'moment';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

const {TextArea} = Input;

@connect(state => ({
  user: state.login.user,
  currentClickEvent: state.emerLfMap.currentClickEvent, // 当前应急事件
  flowPattern: state.emerLfMap.flowPattern, // 流程模式配置
}))

export default class EmerStopOrder extends React.Component {
  constructor(props) {
    super(props);
    this.state = ({
      emerOrder_sendContent: `${this.props.currentClickEvent.name}事件处置完毕，应急终止`,
    });
    message.config({
      duration: 2,
    });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 发布应急终止通知
  handleAddEmerOrder = () => {
    const {currentClickEvent, onCancel, handleAbortEmer} = this.props;
    let fd = new FormData();
    fd.append('alarmId', currentClickEvent.alarmId);
    // 设置指令类型为“应急终止”
    if(this.props.flowPattern.mode === '0'){
      fd.append('orderType', 3);
    }else{
      fd.append('orderType', 13);
    }
    fd.append('receiverId', 732);
    fd.append('receiver', '李永强');
    fd.append('senderId', this.props.user.gid);
    fd.append('sender', this.props.user.trueName);
    fd.append('sendDep', '廊坊新奥调度中心');
    fd.append('sendContent', this.state.emerOrder_sendContent);
    fd.append('sendTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    fd.append('drillScriptId', currentClickEvent.drillScriptId);
    fd.append('ecode', this.props.user.ecode);
    this.props.dispatch({
      type: 'emer/addEmerOrder',
      payload: fd,
      callback: (res) => {
        this.handleStoppro(currentClickEvent.gid, this.props.user.gid, this.props.user.trueName, currentClickEvent.drillScriptId);
        message.info(res.msg);
        // 关闭指令发送框
        onCancel();
        // 3秒后退出应急状态
        setTimeout(handleAbortEmer, 3000);
      },
    });
  }

  handleStoppro(gids, gid, trueName, drillScriptId) {
    let data = {};
    data.gid = gids;
    data.handlerId = gid;
    data.handler = trueName;
    data.drillScriptId = drillScriptId;
    data.ecode = this.props.user.ecode;
    this.props.dispatch({
      type: 'emerLfMap/endEmer',
      payload: data,
      callback: (res) => {
        message.info(res.msg);
      },
    });
  }

  // 设置应急指令内容
  setEmerOrderSendContent = (e) => {
    this.setState({
      emerOrder_sendContent: e.target.value,
    });
  }

  render = () => {
    const {onCancel} = this.props;
    return (
      <Dialog
        title="应急终止"
        width={450}
        onClose={onCancel}
      >
        <div style={{margin: 10}}>
          <div>
            <span>指令内容:</span>
            <span>
              <TextArea
                rows={3}
                cols={70}
                style={{resize: 'none'}}
                onBlur={this.setEmerOrderSendContent}
                value={this.state.emerOrder_sendContent}
              />
            </span>
          </div>
          <div>
            <Button
              type="primary"
              size="small"
              onClick={this.handleAddEmerOrder}
            >发布</Button>&nbsp;&nbsp;&nbsp;
            <Button type="primary" size="small" onClick={onCancel}>取消</Button>
          </div>
        </div>
      </Dialog>
    );
  }
}

