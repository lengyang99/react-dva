import React from 'react';
import EmerStart from './emerStart.jsx';
import s from '../less/emerWarningInW.css';


export default class EmerReportW extends React.Component {
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

  openReport = () => {
    this.props.openReport();
    this.props.onCancel();
  }
  render = () => {
    const { emerEvent, onCancel} = this.props;
    const reportname = emerEvent ? (emerEvent.name + '上报了' + emerEvent.eventName + '事件') : ''
    return emerEvent ? (
        <div className={s.emerEventReporte}>
          <div className={s.warningTitle}>
            <span className={s.wt_1}>
              <img alt="warning" src="../../images/emer/warning.png" /><span>事件上报提醒</span></span>
            <span className={s.wt_2} onClick={(op) => this.openReport()}>
              <img alt="orangeYellowBlock" src="../../images/emer/orangeYellowBlock.png" />查看
            </span>
            <span className={s.wt_3} onClick={onCancel}>
              <img alt="close" src="../../images/emer/close.png" />
            </span>
          </div>
          <div className={s.warningInfo}>
            <span style={{color: '#f00'}}>{reportname}</span>
          </div>
        </div>
    ) : null;
  }
}
