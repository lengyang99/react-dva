import React from 'react';
import EmerStart from './emerStart.jsx';
import s from '../less/emerWarningInW.css';


export default class EmerWarningInW extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openEmerEventDeal: false,
      emerEvent: {},
    };
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 1.应急事件处置
  handleEmerEventDeal = (op) => {
    const { changeStatus, emerEvent } = this.props;
    // 设置当前正在处置的应急事件
    changeStatus({currentClickEvent: emerEvent});
    if (op === 'open') {
      this.setState({
        emerEvent: this.props.emerEvent,
        openEmerEventDeal: true,
      });
    } else {
      this.setState({
        openEmerEventDeal: false,
      });
    }
  }

  render = () => {
    const { emerEvent, handleEmerStart, onCancel, handleGoEmer, map } = this.props;
    return emerEvent ? (
      <div>
        <div className={s.emerWarning}>
          <div className={s.warningTitle}>
            <span className={s.wt_1}>
              <img alt="warning" src="../../images/emer/warning.png" /><span>应急提醒</span></span>
            <span className={s.wt_2} onClick={(op) => this.handleEmerEventDeal('open')}>
              <img alt="orangeYellowBlock" src="../../images/emer/orangeYellowBlock.png" />立即处理
            </span>
            <span className={s.wt_3} onClick={onCancel}>
              <img alt="close" src="../../images/emer/close.png" />
            </span>
          </div>
          <div className={s.warningInfo}>
            <span>您有新的应急事件：</span>
            <span className={s.wi}>{emerEvent.name}</span>
            <span className={s.wi}>发生地址：{emerEvent.incidentAddr}</span>
          </div>
        </div>
        {/* 处置应急事件 */}
        {
          this.state.openEmerEventDeal ?
            <EmerStart
              handleEmerStart={handleEmerStart}
              emerEvent={this.state.emerEvent}
              onCancel={(op) => this.handleEmerEventDeal('close')}
              handleGoEmer={handleGoEmer}
              map={this.props.map}
            /> : ''
        }
      </div>
    ) : null;
  }
}
