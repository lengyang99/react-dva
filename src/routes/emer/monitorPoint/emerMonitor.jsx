import React from 'react';
import {connect} from 'dva';
// 引入压力监测表
import EmerPressureMonitor from './emerPressureMonitor.jsx';
// 引入流量监测折线图
import EmerFlowMonitor from './emerFlowMonitor.jsx';
import styles from '../css/emerMonitor.css';


@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
}))

export default class EmerMonitor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPressureMonitor: true,
      emerMonitorDatas: [],
      monitorData: {},
    };
  }

  componentDidMount() {
    clearInterval(this.timer);
    this.handleOpenView();
    this.timer = setInterval(() => this.handleOpenView(), 300000);
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  clickMonitor = (attr) => {
    this.setState({monitorData: attr.attributes});
  };

  // 查询监测数据
  handleOpenView = () => {
    this.props.dispatch({
      type: 'emer/getDetectionMessage',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        this.setState({
          emerMonitorDatas: res.data,
          monitorData: res.data[0] || {},
        });
        this.props.map.getMapDisplay().removeLayer('monitorPoint');
        res.data.forEach((e, i) => {
          let param = {
            id: `monitorPoint_${e.gid}`,
            layerId: 'monitorPoint',
            src: './images/emer/layerIcon/monitorPoint.png',
            width: 20,
            height: 20,
            angle: 0,
            x: e.x,
            y: e.y,
            attr: e,
            click: this.clickMonitor,
          };
          this.props.map.getMapDisplay().image(param);
        });
      },
    });
  };

  // 切换应急监测内容
  handleChangeMonitor = (monitor) => {
    if (monitor === 'flow') {
      this.setState({
        showPressureMonitor: false,
      });
    } else {
      this.setState({
        showPressureMonitor: true,
      });
    }
  }

  render = () => {
    const { emerCurrentMonitorId} = this.props;
    return (
      <div className={styles.emerStatistic}>
        <div className={styles.leftViewTitle}>
          <a className={styles.center} style={{color: '#fff'}} onClick={(monitor) => this.handleChangeMonitor('pressure')}>管网监测</a>
        </div>
        {
          this.state.showPressureMonitor ?
            <EmerPressureMonitor datas={this.state.monitorData} /> :
            <EmerFlowMonitor />
        }
      </div>
    );
  }
}
