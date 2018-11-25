import React, {Component} from 'react';
import {connect} from 'dva';
import {Icon, Radio} from 'antd';
import styles from './homePage.less';
import TrendInsight from './TrendInsight.js';
import OperationTopic from './OperationTopic.js';
import PatrolRanking from './PatrolRanking.js';
import Appliedpoly from './Appliedpoly.js';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
@connect(({homePage, login}) => ({
  todoData: homePage.todoData,
  patrolData: homePage.patrolData,
  scoreData: homePage.scoreData,
  operateData: homePage.operateData,
  user: login.user,
}))
export default class homePage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      height: window.outerHeight,
      width: window.outerWidth,
      reportData: {},
      overflow: 'hidden',
      btValue: 'a',
    };
  }
  pagesize=11;
  componentWillMount() {
    // this.props.history.push('query/patrol-trace');
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    const {user} = this.props;
    // 待办
    this.props.dispatch({
      type: 'homePage/getHomeTodoParams',
      payload: {userid: user.gid},
    });
    // 运营
    this.props.dispatch({
      type: 'homePage/getHomeYYDC',
      payload: {userid: user.gid},
    });
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
          this.setState({reportData});
        }
      },
    });
    // 绩效
    this.props.dispatch({
      type: 'homePage/getHomeScoreRanking',
      payload: {pagesize: this.pagesize},
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
      payload: {pagesize: this.pagesize},
    });
    this.setState({overflow: 'scroll'});
  }
    handleResize = () => {
      this.setState({
        height: window.outerHeight,
        width: window.outerWidth,
      });
    }
    onChange = (e) => {
      this.setState({btValue: e.target.value});
    }
    renderCompo
    render() {
      return (
        <div style={{width: '100%', height: 'cacl(100vh - 100px)', backgroundColor: '#F7F7F7', paddingTop: '5px', minHeight: '830px', fontSize: '14px'}}>
          <div style={{width: '100%', height: '150px', backgroundColor: 'white', 'marginLeft': '15px'}}>
            <div style={{float: 'left', width: 'calc((100vw - 270px) * 0.6)', 'marginTop': '10px'}}>
              <span style={{'marginLeft': '20px'}}>首页</span>
              <div style={{width: 'auto', height: '60px', 'marginLeft': '40px', 'marginTop': '25px'}}>
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
            <div style={{float: 'left', height: '140px', width: '0px', borderLeft: '1px solid #cccccc', 'marginTop': '5px'}} />
            <div style={{float: 'left', width: 'calc((100vw - 250px) * 0.35)', 'marginLeft': '35px', 'marginTop': '10px'}}>
              <span>应用聚合</span>
              <RadioGroup onChange={this.onChange} value={this.state.btValue} size="small">
                <RadioButton style={this.state.btValue === 'a' ? {marginLeft: 35, color: 'white', backgroundColor: '#1890ff'} : {marginLeft: 35}} value="a">年度管网整改</RadioButton>
                <RadioButton style={this.state.btValue === 'b' ? {marginLeft: 15, color: 'white', backgroundColor: '#1890ff'} : {marginLeft: 15}} value="b">设备维护</RadioButton>
                <RadioButton style={this.state.btValue === 'c' ? {marginLeft: 15, color: 'white', backgroundColor: '#1890ff'} : {marginLeft: 15}} value="c">管网巡视</RadioButton>
              </RadioGroup>
              <div style={{float: 'left', 'marginLeft': '35px', width: 'calc((100vw - 250px) * 0.35 - 30px)', height: '100px', 'marginTop': '6px'}}>
                <div style={{float: 'left'}}><Appliedpoly /></div>
                <div style={{float: 'left', 'marginLeft': '35px'}}>
                  <div style={{marginBottom: 8, marginTop: 2}}>
                    <label style={{display: 'inline-block', width: 80, 'text-align': 'right' }}><b>计划整改:</b></label>
                    <span style={{marginLeft: 10, color: 'RGB(33,150,243)'}}>600</span>
                    <span>km</span>
                  </div>
                  <div style={{marginBottom: 8}}>
                    <label style={{display: 'inline-block', width: 80, 'text-align': 'right' }}><b>已整改:</b></label>
                    <span style={{marginLeft: 10, color: 'RGB(33,150,243)'}}>196.96</span>
                    <span>km</span>
                  </div>
                  <div style={{marginBottom: 4}}>
                    <label style={{display: 'inline-block', width: 80, 'text-align': 'right' }}><b>未整改:</b></label>
                    <span style={{marginLeft: 10, color: 'RGB(33,150,243)'}}>413.04</span>
                    <span>km</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ float: 'left', width: 'calc((100vw - 230px) * 0.7 - 30px)', height: 'calc(100vh - 260px)', minHeight: '680px' }}>
            <div style={{ height: 'calc((100vh - 260px) * 0.4 - 10px)', backgroundColor: 'white', 'marginTop': '20px', 'marginLeft': '15px', paddingTop: '22px', minHeight: '300px' }}>
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
              <OperationTopic operateData={this.props.operateData} width={(this.state.width - 230) * 0.7 - 20} height={(this.state.height - 260) * 0.4 - 20} />
            </div>
            <div style={{ height: 'calc((100vh - 260px) * 0.6 - 15px)', backgroundColor: 'white', 'marginTop': '10px', 'marginLeft': '15px', minHeight: '340px', paddingTop: '22px' }}>
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
              <TrendInsight reportData={this.state.reportData} width={(this.state.width - 230) * 0.7 - 20} height={(this.state.height - 260) * 0.5 - 15} />
            </div>
          </div>
          <div style={{float: 'left', width: 'calc((100vw - 230px) * 0.3)', height: 'calc(100vh - 275px)', backgroundColor: 'white', 'marginTop': '20px', 'marginLeft': '15px', minHeight: '650px', paddingTop: '22px'}}>
            <div style={{float: 'left',
                      width: '3px',
                      height: '13px',
                      'marginTop': '4px',
                      'marginLeft': '14px',
                      marginRight: '13px',
                      backgroundColor: '#2395FF',
                  }}
            />
            <span>绩效自驱</span>
            <div style={{'marginLeft': '15px', height: '550px', overflowY: this.state.overflow}}>
              <PatrolRanking reportData={this.props.scoreData} width={((this.state.width - 200) * 0.3 + 20)} height={this.state.height - 260} />
            </div>
            <div style={{display: this.props.scoreData && this.props.scoreData.length === 0 ? 'none' : 'block', textAlign: 'center', cursor: 'pointer', 'color': '#319CFF'}}>
              <p onClick={this.showMore}>更多</p>
              <div style={{'marginTop': '-16px'}}>
                <Icon type="down" />
                <Icon type="down" style={{position: 'relative', 'marginLeft': '-14px', top: '5px'}} />
              </div>
            </div>
          </div>
        </div>
      );
    }
}
