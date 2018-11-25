import React from 'react';
import {connect} from 'dva';
import styles from '../css/emerRightNav.css';

@connect(state => ({
  user: state.login.user,
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))

export default class EmerRightNav extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { changeStatus, navigation, vista, user} = this.props;
    return (
      <div id={styles.rightNav}>
        {/* <div id={styles.rightNavSwitch}>
         <img src="../../../images/emer/shrink.png"/>
         </div> */}
        <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerEventAdd': true})}>
          <img alt="receiveAlarm" src="../../../images/emer/rightNav/receiveAlarm.png" />
          <span>接警</span>
        </div>
        {
          this.props.ecodePattern.emerRightNav.isHasEmerPlan ?
            <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerExpert': true})}>
              <img alt="emerPlan" src="../../../images/emer/rightNav/emerPlan.png" />
              <span>应急专家</span>
            </div> : ''
        }
        <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerEventList': true})}>
          <img alt="emerEvent" src="../../../images/emer/rightNav/emerEvent.png" />
          <span>应急事件</span>
        </div>
        <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerEventPlan': true})}>
          <img alt="emerPlan" src="../../../images/emer/rightNav/emerPlan.png" />
          <span>应急预案</span>
        </div>
        <div className={styles.rightNavItem} onClick={navigation}>
          <img alt="navigation" src="../../../images/emer/rightNav/navigation.png" />
          <span>导航</span>
        </div>
        <div className={styles.rightNavItem} onClick={vista}>
          <img alt="streetView" src="../../../images/emer/rightNav/streetView.png" />
          <span>街景</span>
        </div>
        {/* <div className={styles.rightNavItem} onClick={openEmerUserDispatch}>
         <img src="../../../images/emer/rightNav/userDispatch.png"/>
         <span>人员调度</span>
         </div> */}
        <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowGoodsDispatch': true})}>
          <img alt="goodsDispatch" src="../../../images/emer/rightNav/goodsDispatch.png" />
          <span>物资调度</span>
        </div>
      </div>
    );
  }
}
