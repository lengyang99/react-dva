import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Modal, Button, Spin, Select, Input, Icon, DatePicker } from 'antd';
import styles from './homePage.less';
import HomePageCard from './HomePageCard.js';
import TrendStatistics from './TrendStatistics.js';
import PatrolRanking from './PatrolRanking.js';

@connect(({ homePage, login, event }) => ({
  todoData: homePage.todoData,
  patrolData: homePage.patrolData,
  scoreData: homePage.scoreData,
  operateData: homePage.operateData,
  user: login.user,
  funs: login.funs,
  eventTypeData: event.eventTypeData,
}))
export default class homePage extends Component {
  constructor(props) {
    super(props);

    // 是否显示协停上报和碰接置换功能
    let showAssistXt = false;
    const funs = this.props.funs;
    for (let i = 0; i < funs.length; i += 1) {
      if (funs[i].code === 'event_ope_assist_xt') {
        showAssistXt = true;
        break;
      }
    }
    this.state = {
      height: window.outerHeight,
      width: window.outerWidth,
      showAssistXt,
      reportData: {},
      overflow: 'hidden',
    };
  }
  pagesize = 11;
  componentWillMount() {
    // this.props.history.push('query/patrol-trace');
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    const { user } = this.props;
    // 待办
    this.props.dispatch({
      type: 'homePage/getHomeTodoParams',
      payload: { userid: user.gid },
    });
    // // 运营
    // this.props.dispatch({
    //   type: 'homePage/getHomeYYDC',
    //   payload: {userid: user.gid},
    // });
    // 趋势
    this.props.dispatch({
      type: 'homePage/getHomePatrolLen',
      callback: (data) => {
        if (data) {
          const monthData = [];
          const nameData = [];
          const reportParams = [];
          let valueData = [];
          let params = {};
          data.forEach(item => {
            nameData.push(item.locName);
            monthData.push(item.month);
          });
          const stNameData = [...new Set(nameData)];
          let monthsData = [...new Set(monthData)];
          stNameData.forEach(item => {
            data.forEach(item2 => {
              if (item === item2.locName) {
                valueData.push(item2.value);
                params.value = valueData;
                params.label = item;
              }
            });
            reportParams.push(params);
            params = {};
            valueData = [];
          });
          monthsData = monthsData.map(item => `${item}月`);
          const reportData = {
            reportParams,
            stNameData,
            monthsData,
          };
          this.setState({ reportData });
        }
      },
    });
    // 绩效
    this.props.dispatch({
      type: 'homePage/getHomeScoreRanking',
      payload: { pagesize: this.pagesize },
    });
    //应用类型
    this.props.dispatch({
      type: 'event/getEventTypeData',
      payload: {type: 'gw'},
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  showMore = () => {
    this.pagesize += 20;
    // 绩效
    this.props.dispatch({
      type: 'homePage/getHomeScoreRanking',
      payload: { pagesize: this.pagesize },
    });
    this.setState({ overflow: 'scroll' });
  }
  handleResize = () => {
    this.setState({
      height: window.outerHeight,
      width: window.outerWidth,
    });
  }

  reportEventClick = (value) => {
    this.props.history.push(`/query/report-eventform?eventtype=${value}`);
  }
  renderYYJHComponent = () => {
    const { eventTypeData} = this.props;
    const yyjhConfig = [];
    const typeColor = ['紫', '浅蓝', '红', '绿', '黄', '蓝'];
    eventTypeData && eventTypeData.length > 0 && eventTypeData.map(item => {
      yyjhConfig.push({
        alias: item.eventname,
        color: typeColor[Math.floor(Math.random()*typeColor.length)],
        click: true,
        type: item.eventtype,
      })
    })
    // const yyjhConfig = [
    //   { alias: '管网保压上报', color: '紫', click: true, type: '4' },
    //   { alias: '第三方施工上报', color: '浅蓝', click: true, type: '0' },
    //   { alias: '故障上报', color: '红', click: true, type: '1' },
    //   { alias: '碰接置换', color: '绿', click: true, type: '7' },
    //   { alias: '隐患上报', color: '黄', click: true, type: '2' },
    //   { alias: '户内置换', color: '黄', click: true, type: '10' },
    //   { alias: '维修上报', color: '蓝', click: true, type: '9' },
    //   { alias: '定位测绘', color: '蓝', click: true, type: '11' },
    //   { alias: '协助停气', color: '蓝', click: true, type: '8' },
    // ];

    const tdArr = [];
    const trArr = [];
    for (let i = 0; i < yyjhConfig.length; i += 1) {
      let temp = (
        <td>
          <img alt="" className={styles.table_circle} src={`./images/homePageImages/${yyjhConfig[i].color}.png`} />
          <span style={{ cursor: 'pointer' }} onClick={this.reportEventClick.bind(this, yyjhConfig[i].type)}>{yyjhConfig[i].alias}</span>
        </td>
      );
      if (!yyjhConfig[i].click) {
        temp = (
          <td>
            <img alt="" className={styles.table_circle} src={`./images/homePageImages/${yyjhConfig[i].color}.png`} />
            <span style={{ cursor: 'pointer' }} >{yyjhConfig[i].alias}</span>
          </td>
        );
      }
      if (yyjhConfig[i].alias === '协助停气' && !this.state.showAssistXt) {
        temp = (<td />);
      }
      tdArr.push(temp);
    }
    const ii = yyjhConfig.length > 10 ? 3 : 2
    for (let i = 0; i < yyjhConfig.length; i += ii) {
      yyjhConfig.length > 10 ?
      trArr.push(
        <tr>
          {tdArr[i]}
          {tdArr[i + 1]}
          {tdArr[i + 2]}
        </tr>
      )
      :
      trArr.push(
        <tr>
          {tdArr[i]}
          {tdArr[i + 1]}
        </tr>
      );
    }
    return trArr;
  }
  render() {
    const YYJHComponent = this.renderYYJHComponent();
    return (
      <div style={{ width: '100%', height: 'cacl(100vh - 100px)', backgroundColor: '#F7F7F7', paddingTop: '5px', minHeight: '830px', fontSize: '14px' }}>
        <div style={{ width: '100%', height: '150px', backgroundColor: 'white', 'marginLeft': '15px' }}>
          <div style={{ float: 'left', width: 'calc((100vw - 270px) * 0.6)', 'marginTop': '10px' }}>
            <span style={{ 'marginLeft': '20px' }}>首页</span>
            <div style={{ width: 'auto', height: '60px', 'marginLeft': '40px', 'marginTop': '25px' }}>
              {(this.props.todoData || []).map((item, idx) => {
                return (<div className={idx !== 0 ? styles.event_summary_div : styles.event_summary_div2}>
                  <img alt="" src={`./images/homePageImages/${item.text}.png`} className={styles.event_img} />
                  <div className={styles.event_span_div}>
                    <span>{item.text}</span>
                    <br />
                    <span className={styles.span_num}>{item.value}</span>
                  </div>
                </div>);
              })}
            </div>
          </div>
          <div style={{ float: 'left', height: '140px', width: '0px', borderLeft: '1px solid #cccccc', 'marginTop': '5px' }} />
          <div style={{ float: 'left', width: 'calc((100vw - 250px) * 0.35)', 'marginLeft': '35px', 'marginTop': '10px' }}>
            <span>应用聚合</span>
            <table style={{ 'marginLeft': '35px', width: 'calc((100vw - 250px) * 0.35 - 30px)', height: '100px', 'marginTop': '6px' }}>
              <tbody>
                {YYJHComponent}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ float: 'left', width: 'calc((100vw - 230px) * 0.7 - 30px)', height: 'calc(100vh - 260px)', minHeight: '680px' }}>
          <div style={{ height: 'calc((100vh - 260px) * 0.4 - 10px)', backgroundColor: 'white', 'marginTop': '20px', 'marginLeft': '15px', paddingTop: '22px', minHeight: '260px' }}>
            <div style={{
              float: 'left',
              width: '3px',
              height: '13px',
              'marginTop': '4px',
              'marginLeft': '14px',
              marginRight: '13px',
              backgroundColor: '#2395FF',
            }}
            />
            <span>运营洞察</span>
            <div style={{ display: 'table', width: 'calc((100vw - 230px) * 0.7 - 30px)', height: 'calc((100vh - 260px) * 0.4 - 20px)', minHeight: '215px' }}>
              <div style={{ display: 'table-cell' }}>
                <HomePageCard width={(this.state.width - 230) * 0.7 - 20} height={(this.state.height - 260) * 0.4 - 20} />
              </div>
            </div>
          </div>
          <div style={{ height: 'calc((100vh - 260px) * 0.6 - 15px)', backgroundColor: 'white', 'marginTop': '10px', 'marginLeft': '15px', minHeight: '380px', paddingTop: '22px' }}>
            <div style={{
              float: 'left',
              width: '3px',
              height: '13px',
              'marginTop': '4px',
              'marginLeft': '14px',
              marginRight: '13px',
              backgroundColor: '#2395FF',
            }}
            />
            <span>趋势洞察</span>
            <TrendStatistics reportData={this.state.reportData} width={(this.state.width - 230) * 0.7 - 20} height={(this.state.height - 260) * 0.6 - 55} />
          </div>
        </div>
        <div style={{ float: 'left', width: 'calc((100vw - 230px) * 0.3)', height: 'calc(100vh - 275px)', backgroundColor: 'white', 'marginTop': '20px', 'marginLeft': '15px', minHeight: '650px', paddingTop: '22px' }}>
          <div style={{
            float: 'left',
            width: '3px',
            height: '13px',
            'marginTop': '4px',
            'marginLeft': '14px',
            marginRight: '13px',
            backgroundColor: '#2395FF',
          }}
          />
          <span>绩效自驱</span>
          <div style={{ 'marginLeft': '15px', height: '550px', overflowY: this.state.overflow }}>
            <PatrolRanking reportData={this.props.scoreData} width={((this.state.width - 200) * 0.3 + 20)} height={this.state.height - 260} />
          </div>
          <div style={{ display: this.props.scoreData && this.props.scoreData.length === 0 ? 'none' : 'block', textAlign: 'center', cursor: 'pointer', 'color': '#319CFF' }}>
            <p onClick={this.showMore}>更多</p>
            <div style={{ 'marginTop': '-16px' }}>
              <Icon type="down" />
              <Icon type="down" style={{ position: 'relative', 'marginLeft': '-14px', top: '5px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
