/**
 *   监测点
 */

import React from 'react';
import {connect} from 'dva';
import {Table, Pagination} from 'antd';
import MyTable from './myTable';
import EmerOneContent from '../leftPlane/emerOneContent.jsx';

@connect(state => ({
  user: state.login.user,
  token: state.login.token,
  map: state.emerLfMap.map, // 地图
  currentClickEvent: state.emerLfMap.currentClickEvent, // 当前应急事件
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
}))
export default class emerMonitorPoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flds: [],
      datas: [],
    };
  }

  componentDidMount = () => {
    let init = () => this.props.dispatch({
      type: 'emer/getDetectionMessage',
      payload: {
        ecode: this.props.user.ecode,
        eventId: this.props.currentClickEvent.alarmId,
      },
      callback: (res) => {
        const flds = [
          { name: 'name', title: '监测点' },
          { name: 'itemText', title: '指标' },
          { name: 'itemValue', title: '数值' },
        ];
        if (res.success) {
          let datas = [];
          for (let i = 0; i < res.data.length; i += 1) {
            for (let j = 0; j < res.data[i].indicators.length; j += 1) {
              datas.push({gid: res.data[i].gid, x: res.data[i].x, y: res.data[i].y, name: res.data[i].name, ...res.data[i].indicators[j]});
            }
          }
          this.setState({ flds, datas});
        }
      },
    });
    init();
    this.timer = setInterval(init, 25000);
  }

  componentWillUnmount = () => {
    if (this.timer) { clearInterval(this.timer); }
    this.setState = (state, callback) => {};
  }

  render() {
    return (
      <EmerOneContent
        style={{height: 240, width: '100%'}}
        title="监测点"
        body={<MyTable
          map={this.props.map}
          trStyle={(record) => record.isStandard ? {color: '#ff0000'} : {}}
          td={(name, value, record) => name === 'itemValue' ? `${value} ${record.unit || ''}` : value}
          auto
          user={this.props.user}
          ecodePattern={this.props.ecodePattern}
          interval={5}
          pageSize={4}
          showHeader
          flds={this.state.flds}
          datas={this.state.datas}
          style={{width: '100%', height: '100%'}}
        />}
      />
    );
  }
}
