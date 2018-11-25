import React from 'react';
import {Table, Button} from 'antd';
import {connect} from 'dva';
import styles from '../less/EmerLeftPlanView/emerLeftPlanView.less'

// 资源准备情况
import Resources from '../resources/Resources.js';

// 爆管分析
import EmerSquibAnalysis from '../controllPlan/emerSquibAnalysis.jsx';

// 监测点
import EmerMonitor from '../monitorPoint/emerMonitorPoint.jsx';

@connect(state => ({}))

export default class EmerLeftPanelView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {

  }

  /**
   * 父组件改变状态，子组件也改变
   */
  componentWillReceiveProps() {

  }

  render() {
    return (
      <div>
        <div style={{position: 'absolute', top: 55, left: 8}}>
          <Resources emerEvent={this.props.emerEvent} map={this.props.map} />
        </div>
        <EmerSquibAnalysis
          emerEvent={this.props.emerEvent}
          loginUser={this.props.user}
          map={this.props.map}
          details={this.props.details}
          sendMsg={this.props.sendMsg}
        />
        <EmerMonitor
          emerMonitorDatas={this.props.emerMonitorDatas}
          emerCurrentMonitorId={this.props.emerCurrentMonitorId}
        />
      </div>
    );
  }
}
