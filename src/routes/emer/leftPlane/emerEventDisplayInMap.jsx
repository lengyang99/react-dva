import React from 'react';
import {Table, Button} from 'antd';
import {connect} from 'dva';
import s from '../css/emerMonitor.css';
import EmerStart from '../emerEvent/emerStart.jsx';

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
}))

export default class emerEventDisplayInMap extends React.Component {
  constructor(props) {
    super(props);
    window.handleEmerEventDeal = this.handleEmerEventDeal;
    this.state = {
      openEmerEventDeal: false,
      emerEvent: {},
      historyEvent: [],
    };
  }

  componentDidMount = () => {
    this.getHistoryEmerEvent();
  }

  componentWillUnmount = () => {
    if (this.props.map.getMapDisplay().getLayer('historyEvent')) {
      this.props.map.getMapDisplay().removeLayer('historyEvent');
    }
    this.setState = (state, callback) => {};
  }

  // 查询历史应急事件
  getHistoryEmerEvent = () => {
    this.map = this.props.map;
    const size = {
      一级紧急: 25,
      二级紧急: 35,
      三级紧急: 42,
    };
    const imgs = { // 1.已接警 2.应急启动 3.应急终止 4.关闭
      '1': './images/emer/接警.png',
      '2': './images/emer/处理中.png',
      '3': './images/emer/处理完成.png',
      '4': './images/emer/关闭.png',
    }
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: {ecode: this.props.user.ecode, terminalType: 'pc'},
      callback: (res) => {
        if (res.success) {
          if (this.map.getMapDisplay().getLayer('historyEvent')) {
            this.map.getMapDisplay().removeLayer('historyEvent');
          }
          this.setState({historyEvent: res.data});
          // res.data.forEach((e, i) => {
          //     let param = {
          //         id: 'historyEvent_' + i,
          //         layerId: 'historyEvent',
          //         src: imgs[e.status],
          //         width: size[e.levelName],
          //         height: size[e.levelName],
          //         angle: 0,
          //         x: e.x,
          //         y: e.y,
          //         attr: e,
          //         click: this.clickHistoryEvent,
          //     };
          //     this.map.getMapDisplay().image(param);
          // });
        }
      },
    });
  }

  // 历史应急事件图片点击事件
  clickHistoryEvent = (e) => {
    let attr = e.attributes;
    let params = {
      x: attr.x,
      y: attr.y,
      info: {
        title: attr.name,
        content: [
          {name: '事发地点', value: attr.incidentAddr},
          {name: '事发时间', value: attr.incidentTime},
          {name: '事件等级', value: attr.levelName},
          {name: '上报人', value: attr.reporter},
          {name: '上报电话', value: attr.reporterTel},
          {name: '事件状态', value: attr.statusName},
        ],
      },
      size: {height: 300, width: 450},
      onCloseHandle: () => {
        console.log('close');
      },
    };
    if (attr.status === 1) {
      params.info.link = [{
        linkText: '立即处理',
        click: (op) => {
          window.handleEmerEventDeal(op);
        },
        param: JSON.stringify({open: 'open', alarmId: attr.alarmId}),
      }];
    }
    this.props.map.popup(params);
  }

  // 1.应急事件处置
  handleEmerEventDeal = (op) => {
    if (op.open) {
      this.setState({
        emerEvent: this.state.historyEvent.filter((e) => e.alarmId === op.alarmId)[0],
        openEmerEventDeal: true,
      });
    } else {
      this.setState({
        openEmerEventDeal: false,
      });
    }
  }

  render() {
    const { handleEmerStart, handleGoEmer} = this.props;
    return (
      <div>
        {this.state.openEmerEventDeal ?
          <EmerStart
            handleEmerStart={handleEmerStart}
            emerEvent={this.state.emerEvent}
            onCancel={(op) => this.handleEmerEventDeal('close')}
            handleGoEmer={handleGoEmer}
            map={this.props.map}
          /> : null
        }
      </div>
    );
  }
}
