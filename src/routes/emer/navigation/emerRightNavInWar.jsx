import React from 'react';
import {connect} from 'dva';
import ScrollBar from '../../../components/ScrollBar/index';
import styles from '../css/emerRightNav.css';

@connect(state => ({
  user: state.login.user,
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))

export default class EmerRightNavInWar extends React.Component {
  constructor(props) {
    super(props);
  }

  render = () => {
    const { openSquibAnalysis, changeStatus, user} = this.props;
    return (
      <div id={styles.rightNav}>
        <ScrollBar>
          <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerOrder': true})}>
            <img alt="emerOrder" src="../../../images/emer/rightNav/emerOrder.png" />
            <span>应急指令</span>
          </div>
          {/*<div className={styles.rightNavItem} onClick={openSquibAnalysis}>*/}
            {/*<img alt="squibAnalysis" src="../../../images/emer/rightNav/squibAnalysis.png" />*/}
            {/*<span>爆管分析</span>*/}
          {/*</div>*/}
          {/* <div className={styles.rightNavItem} onClick={openEmerUserDispatch}>
           <img src='../../../images/emer/rightNav/userDispatch.png' />
           <span>人员调度</span>
           </div>
           <div className={styles.rightNavItem} onClick={openEmerCarDispatch}>
           <img src='../../../images/emer/rightNav/carDispatch.png' />
           <span>车辆调度</span>
           </div> */}
          <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowGoodsDispatch': true})}>
            <img alt="goodsDispatch" src="../../../images/emer/rightNav/goodsDispatch.png" />
            <span>物资调度</span>
          </div>
          <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowRecoverGasSupply': true})}>
            <img alt="recoverGasSupply" src="../../../images/emer/rightNav/recoverGasSupply.png" />
            <span>恢复供气</span>
          </div>
          <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerStop': true})}>
            <img alt="emerStop" src="../../../images/emer/rightNav/emerStop.png" />
            <span>应急终止</span>
          </div>
          {/* <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerReport': true})}>
            <img alt="emerReport" src="../../../images/emer/rightNav/emerReport.png" />
            <span>应急报告</span>
          </div> */}
          {
            this.props.ecodePattern.emerRightNav.isHasEmerPlan ?
              <div className={styles.rightNavItem} onClick={() => changeStatus({'isShowEmerExpert': true})}>
                <img alt="emerPlan" src="../../../images/emer/rightNav/emerPlan.png" />
                <span>应急专家</span>
              </div> : ''
          }
        </ScrollBar>
      </div>
    );
  }
}
