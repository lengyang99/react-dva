import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import echarts from 'echarts';
import {Table, Modal, Button, Spin, Select, Input, Icon, DatePicker, Tabs, Radio} from 'antd';
import styles from './homePage.less';
import HomePageCard from './HomePageCard.js';
import TrendStatistics from './TrendStatistics.js';
import PatrolRanking from './PatrolRanking.js';

@connect(({homePage, login}) => ({
  eqLedgerData: homePage.eqLedgerData, // 设备台账 - 管网设备
  stationEquipData: homePage.stationEquipData, // 设备台账 - 场站设备
  usersData: homePage.usersData, // 设备台账 - 工商户
  eqRepairData: homePage.eqRepairData, // 设备大修次数
  eqRepairPlanData: homePage.eqRepairPlanData, // 设备大修完成情况
  yhClassData: homePage.yhClassData, // 隐患类别
  eqItemData: homePage.eqItemData, // 单个提交指
  user: login.user,
}))
export default class equipmentPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      height: window.outerHeight,
      width: window.outerWidth,
      switchTime: '1',
      switchTime1: '1',
    };
  }

  componentWillMount() {
    //this.props.history.push('query/patrol-trace');
  }

  componentDidMount() {
    this.getDatas();
    // 单个提交指标
    // this.props.dispatch({
    //   type: 'homePage/getDHomeItem',
    //   payload: {userid: user.gid},
    // });
    // 设备台账
    // this.props.dispatch({
    //   type: 'homePage/getDHomeAccount',
    //   payload: {type: 1},
    // });
    // 大修次数
    // this.props.dispatch({
    //   type: 'homePage/getDHomeBigRepair',
    //   payload: {type: 1},
    // });
    // 大修完成情况
    // this.props.dispatch({
    //   type: 'homePage/getDHomeRepair',
    //   payload: {type: 1},
    // });
    // 隐患类别
    // this.props.dispatch({
    //   type: 'homePage/getDHomeYhClass',
    //   payload: {type: 1},
    // });
    window.addEventListener('resize', this.handleResize);
  }

  componentDidUpdate () {
    // this.getDatas();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({
      height: window.outerHeight,
      width: window.outerWidth
    })
  };

  getDatas = () => {
    const {user} = this.props;
    this.props.dispatch({
      type: 'homePage/getDatas',
      payload: {userid: user.gid, type: 1},
      callback: (res) => {
        this.getOptions();
        this.drawEcharts();
      },
    });
  };

  getOptions = () => {
    // 设备完好率
    this.option1 = {
      title: {
        show: false
      },
      tooltip: {
        formatter: "{a} <br/>{b} = {c}%"
      },
      series: [{
        name: '设备完好率=（设备完好等级为一级+二级）/总数',
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: "110%",
        center: ["50%", "65%"],
        splitLine: {           // 分隔线
          length: 15,         // 属性length控制线长
          lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
            color: 'auto'
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 10,
            shadowBlur: 0,
            color: [[0.3, '#009fdf'], [0.7, '#FF9809'], [1, '#7eb900']]
          }
        },
        pointer:{
          width:5
        },
        //修改指标
        itemStyle: {
          normal: {
            color: ['#009fdf']
          }
        },
        detail: {show: false},
        data: [{value: this.props.eqItemData.slice(5,8)[0].value, name: ''}]
      }]
    };

// 特种设备完好率
    this.option2 = {
      title: {
        show: false
      },
      tooltip: {
        formatter: "{a} <br/>{b} = {c}%"
      },
      series: [{
        name: '',
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: "110%",
        center: ["50%", "65%"],
        splitLine: {           // 分隔线
          length: 15,         // 属性length控制线长
          lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
            color: 'auto'
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 10,
            shadowBlur: 0,
            color: [[0.3, '#1890ff'], [0.7, '#ED7CC5'], [1, '#8579E8']]
          }
        },
        pointer:{
          width:5
        },
        //修改指标
        itemStyle: {
          normal: {
            color: ['#1890ff']
          }
        },
        detail: {show: false},
        data: [{value: this.props.eqItemData.slice(5,8)[1].value, name: ''}]
      }]
    };

// 隐患整改率
    this.option3 = {
      title: {
        show: false
      },
      tooltip: {
        formatter: "{a} <br/>{b} = {c}%"
      },
      series: [{
        name: '隐患整改率=周期内完成数/周期内新增总数',
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: "110%",
        center: ["50%", "65%"],
        splitLine: {           // 分隔线
          length: 15,         // 属性length控制线长
          lineStyle: {       // 属性lineStyle（详见lineStyle）控制线条样式
            color: 'auto'
          }
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 10,
            shadowBlur: 0,
            color: [[0.3, '#1A9ABB'], [0.7, '#24BF39'], [1, '#4eb2d7']]
          }
        },
        pointer:{
          width:5
        },
        //修改指标
        itemStyle: {
          normal: {
            color: ['#1A9ABB']
          }
        },
        detail: {show: false},
        data: [{value: this.props.eqItemData.slice(5,8)[2].value, name: ''}]
      }]
    };

// 隐患类型统计
    this.option4 = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['新增', '处理', '遗留', '超期']
      },
      grid: {
        left: '3%',
        top: '15%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: this.props.yhClassData.map((v) => v.repairYhclassAlias),
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 0
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: Math.max(...this.props.yhClassData.map((v) => v.total)),
          interval: 1,
          // interval: Math.max(...this.props.yhClassData.map((v) => v.total))/5,
          splitLine: {
            show: true,
            lineStyle: {
              color: '#ccc'
            }
          }
        }
      ],
      series: [
        {
          name: '新增',
          type: 'bar',
          barWidth: '15',
          itemStyle: {
            normal: {
              show: true,
              color:'#277ace ',
              barBorderRadius: 50
            }
          },
          data: this.props.yhClassData.map((v) => v.total),
        },
        {
          name: '处理',
          type: 'bar',
          barWidth: '15',
          itemStyle: {
            normal: {
              show: true,
              color:'#52b3d9',
              barBorderRadius: 50
            }
          },
          data: this.props.yhClassData.map((v) => v.doing),
        },
        {
          name: '遗留',
          type: 'bar',
          barWidth: '15',
          itemStyle: {
            normal: {
              show: true,
              color:'#e26a6a',
              barBorderRadius: 50
            }
          },
          data: this.props.yhClassData.map((v) => v.leave),
        },
        {
          name: '超期',
          type: 'bar',
          barWidth: '15',
          itemStyle: {
            normal: {
              show: true,
              color:'#913d88',
              barBorderRadius: 50
            }
          },
          data: this.props.yhClassData.map((v) => v.timeout),
        }
      ]
    };

// 完成率
    this.option5 = {
      series: [
        {
          name: '完成率',
          type: 'pie',
          radius: ['55%', '70%'],
          avoidLabelOverlap: false,

          labelLine: {
            normal: {
              show: false
            }
          },
          data: [
            {
              value: this.props.eqRepairPlanData[0] ? this.props.eqRepairPlanData[0].finish : 0,
              itemStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: '#1890ff'
                  }, {
                    offset: 1,
                    color: '#00DDE6'
                  }])
                }
              }
            },
            {
              value: !this.props.eqRepairPlanData[0] || this.props.eqRepairPlanData[0].finish === 0 ?  1 : this.props.eqRepairPlanData[0].doing,
              itemStyle: {
              normal: {
                color: '#ccc'
              }
            }
            }
          ]
        }
      ]
    };

// 设备大修次数统计
    this.option6 = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: this.props.eqRepairData.map((v, i) => `大修${v.repairNum}次`),
        boundaryGap: false,
        axisLabel: {
          rotate: 40
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        min:0,
        max:50,
        interval:5,
        axisTick: {
          show: false
        }
      },
      series: [{
        name: '设备个数',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbol: 'circle',
        symbolSize: 6,
        data: this.props.eqRepairData.map((v, i) => v.devCount),
        areaStyle: {
          normal: {
            color: 'rgba(24,144,255,0.8)'
          }
        },
        itemStyle: {
          normal: {
            color: '#1890ff'
          }
        },
        lineStyle: {
          normal: {
            width: 3
          }
        }
      }]
    };
  };

  drawEcharts = () => {
    echarts.init(document.getElementById('echart1')).setOption(this.option1);
    echarts.init(document.getElementById('echart2')).setOption(this.option2);
    echarts.init(document.getElementById('echart3')).setOption(this.option3);
    echarts.init(document.getElementById('echart4')).setOption(this.option4);
    echarts.init(document.getElementById('echart5')).setOption(this.option5);
    echarts.init(document.getElementById('echart6')).setOption(this.option6);
  };
  //页面跳转
  jump = (v) => {
    console.log(v, '★')
    if(v.name === '待处理工单'){
      this.props.dispatch(routerRedux.push('/equipment/wo-list'));
    }else if(v.name === '待处理隐患' || v.name === '今日新增隐患'){
      this.props.dispatch(routerRedux.push('/equipment/danger-mnmg'));
    }else if(v.name === '待处理预防性维护任务'){
      this.props.dispatch(routerRedux.push('/equipment/task-Pandect'));
    }
  };
  //切换年月；
  switchTime = (e, fileName) => {
    const {user} = this.props;
    const val = e.target.value
    if(fileName === 'hidden'){
      this.setState({
        switchTime: val
      })
      this.props.dispatch({
        type: 'homePage/getDHomeYhClass',
        payload: {type: val},
        callback: (res) => {
          this.getOptions();
          this.drawEcharts();
        }
      });
    }else if(fileName === 'equipment'){
      this.setState({
        switchTime1: val
      })
      this.props.dispatch({
        // type: 'homePage/getDHomeRepair',
        type: 'homePage/getDHomeBigRepair',
        payload: {type: val},
        callback: (res) => {
          this.getOptions();
          this.drawEcharts();
        }
      });
    }
  }
  render() {

    const columns1 = [{
      key: 'clsName', dataIndex: 'clsName', title: '设备分类', width: '19%',
    }, {
      key: 'total', dataIndex: 'total', title: '个数', width: '15%',
    }, {
      key: 'checkWillTimeout', dataIndex: 'checkWillTimeout', title: '检定即将到期', width: '20%',
    }, {
      key: 'checkTimeout', dataIndex: 'checkTimeout', title: '检定超期', width: '20%',
    }, {
      key: 'useTimeout', dataIndex: 'useTimeout', title: '超寿命使用设备', width: '25%',
    }];
    const pagination = {
      pageSize: 5,
      showQuickJumper: true,
    };

    return (
      <div style={{
        width: '100%',
        height: 'calc(100% - 100px)',
        backgroundColor: '#F7F7F7',
        paddingTop: '5px',
        fontSize: '14px',
        minWidth: '1162px',
      }}>
        <div style={{width: '100%', height: '166px', backgroundColor: 'white', borderBottom: '1px solid #e8e8e8'}}>
          <div style={{float: 'left', width: '325px', 'marginTop': '10px'}}>
            <span style={{'marginLeft': '30px'}}>首页</span>
            <div style={{width: 'auto', height: '60px', 'marginLeft': '20px', 'marginTop': '33px'}}>
              {
                this.props.eqItemData && this.props.eqItemData.slice(0,2).map((v, i) => {
                  let imgName = '';
                  if(v.key === 'today_danger'){
                    imgName = '新增隐患'
                  }else if(v.key === 'today_exception'){
                    imgName = '监测异常'
                  }else{
                    imgName = v.name
                  }
                return <div key={i} style={{float: 'left', margin: '0px 30px 0px 10px', height: '58px', cursor: 'pointer'}} onClick={()=> {this.jump(v)}}>
                    <img src={`./images/equipmentHomePage/${imgName}.png`}/>
                    <div style={{position: 'relative', left: '35px', top: '-28px', margin: '0px 21px 0px 5px'}}>
                      <span style={{color: '#333333'}}>{v.name}</span>
                      <br/>
                      <span style={{fontSize: '22px'}}>{v.value}</span>
                    </div>
                  </div>
                }
                  
                )
              }
            </div>
          </div>
          <div style={{float: 'left', height: '140px', width: '0px', borderLeft: '1px solid #cccccc', 'marginTop': '12px'}}/>
          <div style={{float: 'left', width: 'calc(100% - 365px)', 'marginLeft': '35px', 'marginTop': '10px'}}>
            <span>待办</span>
            <div style={{width: 'auto', height: '60px', 'marginTop': '33px', display: 'flex', alignItems: 'center', justifyContent: 'space-around'}}>
              {
                this.props.eqItemData && this.props.eqItemData.slice(2,5).map((v, i) => (
                  <div key={i} style={{height: '60px', margin: '15px 15px 15px 0px', padding: '0px 10px 0px 20px', display: 'flex', alignItems: 'center', background: '#f7f7f7', cursor: 'pointer'}} onClick={() => {this.jump(v)}}>
                    <img src={`./images/equipmentHomePage/${v.name}.png`}/>
                    <span style={{height: '42px', lineHeight: '42px', fontSize: '20px',margin: '0px 20px 0px 12px'}}>{v.value}</span>
                    <span style={{display: 'inline-block', verticalAlign: 'middle', width: `${14 * ( v.name.length + 1) / 2}px`}}>{v.name}</span>
                  </div>)
                )
              }
            </div>
          </div>
        </div>
        <div style={{float: 'left', width: 'calc(50% - 20px)', margin: '0px 20px'}}>
          <div style={{width: '100%', background: '#fff', height: '200px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>运营洞察</span>
            <div>
              {
                this.props.eqItemData.slice(5,8).map((v, i) => (
                  <div key={i} style={{width: '33%', height: '150px', display: 'inline-block'}}>
                    <div id={`echart${i + 1}`} style={{width: '223px', height: '150px', marginLeft: 'calc(50% - 111px)'}}/>
                    <div style={{height: '32px', lineHeight: '32px', textAlign: 'center', position: 'relative', top: '-32px'}}>
                      {v.name}<span style={{color: '#1890ff'}}>{`${v.value}%`}</span>
                    </div>
                  </div>)
                )
              }
            </div>
          </div>
          <div style={{width: '100%', background: '#fff', height: '400px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>设备台账统计</span>
            <div>
              <Tabs defaultActiveKey="1">
                <Tabs.TabPane tab="管网设备" key="1">
                  <Table
                    rowKey="clsName"
                    style={{margin: '-10px 10px 10px 10px'}}
                    dataSource={this.props.eqLedgerData}
                    columns={columns1}
                    pagination={this.props.eqLedgerData.length > 5 ? pagination : false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="场站设备" key="2">
                  <Table
                    rowKey="clsName"
                    style={{margin: '-10px 10px 10px 10px'}}
                    dataSource={this.props.stationEquipData}
                    columns={columns1}
                    pagination={this.props.stationEquipData.length > 5 ? pagination : false}
                  />
                </Tabs.TabPane>
                <Tabs.TabPane tab="工商户" key="3">
                  <Table
                    rowKey="clsName"
                    style={{margin: '-10px 10px 10px 10px'}}
                    dataSource={this.props.usersData}
                    columns={columns1}
                    pagination={this.props.usersData.length > 5 ? pagination : false}
                  />
                </Tabs.TabPane>
              </Tabs>
            </div>
          </div>
          <div style={{width: '100%', background: '#fff', height: '300px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>设备大修计划完成情况统计(本年)</span>
            <div style={{height: '230px'}}>
              <div style={{float: 'left',margin: '20px'}}>
                <div style={{width: '192px',height: '43px',margin: '22px', display: 'flex',alignItems: 'center', background: 'url(./images/equipmentHomePage/bar-点击.png)', backgroundSize: '100% 100%'}}>
                  <span style={{fontWeight: 'bold', margin: '0px 20px 0px 10px'}}>计划</span>
                  <span>计划大修</span>
                  <span style={{marginLeft: '34px', fontSize: '16px'}}>{(this.props.eqRepairPlanData[0] || {}).total}</span>
                </div>
                <div style={{width: '192px',height: '43px',margin: '22px', display: 'flex',alignItems: 'center', background: 'url(./images/equipmentHomePage/bar.png)', backgroundSize: '100% 100%'}}>
                  <span style={{fontWeight: 'bold', margin: '0px 20px 0px 10px'}}>完成</span>
                  <span>已完成</span>
                  <span style={{marginLeft: '34px', fontSize: '16px'}}>{(this.props.eqRepairPlanData[0] || {}).finish}</span>
                </div>
                <div style={{width: '192px',height: '43px',margin: '22px', display: 'flex',alignItems: 'center', background: 'url(./images/equipmentHomePage/bar.png)', backgroundSize: '100% 100%'}}>
                  <span style={{fontWeight: 'bold', margin: '0px 20px 0px 10px'}}>未完</span>
                  <span>未完成</span>
                  <span style={{marginLeft: '34px', fontSize: '16px'}}>{(this.props.eqRepairPlanData[0] || {}).doing}</span>
                </div>
              </div>
              <div style={{float: 'left', height: '100%'}}>
                <div id="echart5" style={{width: '270px', height: '100%'}}/>
                <div style={{position: 'relative', top: '-140px', textAlign: 'center'}}>
                  <span style={{fontSize: '18px', fontWeight: 'bold'}}>{!this.props.eqRepairPlanData[0] || this.props.eqRepairPlanData[0].total === 0 ? '0%' : `${(this.props.eqRepairPlanData[0].finish * 100/this.props.eqRepairPlanData[0].total).toFixed(2)}%`}</span>
                  <br/>
                  完成率
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{float: 'left', width: 'calc(50% - 40px)', marginRight: '20px'}}>
          <div style={{width: '100%', background: '#fff', height: '300px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>快速开始</span>
            <div style={{margin: '13px 30px'}}>
              <div
                style={{width: '187px',height: '92px', display: 'inline-block', margin: '13px 21px', background: 'url(./images/equipmentHomePage/块-点击.png)', backgroundSize: '100% 100%'}}
                onClick={() => this.props.dispatch(routerRedux.push({pathname: '/equipment/ledger'}))}
              >
                <img src="./images/equipmentHomePage/设备台账.png" style={{margin: '10px 74px'}}/>
                <div style={{height: '32px', lineHeight: '32px', textAlign: 'center'}}>设备台账</div>
              </div>
              <div
                style={{width: '187px',height: '92px', display: 'inline-block', margin: '13px 21px', background: 'url(./images/equipmentHomePage/块.png)', backgroundSize: '100% 100%'}}
                onClick={() => this.props.dispatch(routerRedux.push({pathname: '/equipment/sortmanagement'}))}
              >
                <img src="./images/equipmentHomePage/工单管理.png" style={{margin: '10px 74px'}}/>
                <div style={{height: '32px', lineHeight: '32px', textAlign: 'center'}}>工单管理</div>
              </div>
              <div
                style={{width: '187px',height: '92px', display: 'inline-block', margin: '13px 21px', background: 'url(./images/equipmentHomePage/块.png)', backgroundSize: '100% 100%'}}
                onClick={() => this.props.dispatch(routerRedux.push({pathname: '/equipment/spareParts'}))}
              >
                <img src="./images/equipmentHomePage/备品备件.png" style={{margin: '10px 74px'}}/>
                <div style={{height: '32px', lineHeight: '32px', textAlign: 'center'}}>备品备件</div>
              </div>
              <div
                style={{width: '187px',height: '92px', display: 'inline-block', margin: '13px 21px', background: 'url(./images/equipmentHomePage/块.png)', backgroundSize: '100% 100%'}}
                onClick={() => this.props.dispatch(routerRedux.push({pathname: '/equipment/pre-mainten'}))}
              >
                <img src="./images/equipmentHomePage/预防性维护.png" style={{margin: '10px 74px'}}/>
                <div style={{height: '32px', lineHeight: '32px', textAlign: 'center'}}>预防性维护</div>
              </div>
            </div>
          </div>
          <div style={{width: '100%', background: '#fff', height: '300px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>隐患类型统计</span>
            <Button.Group size='small' style={{float: 'right', marginRight: '18px'}} value={this.state.switchTime} onClick={(e) => this.switchTime(e, 'hidden')}>
              <Button type = {this.state.switchTime === '1' ? "primary" : ''} value={1}>月</Button>
              <Button type = {this.state.switchTime === '2' ? "primary" : ''} value={2}>年</Button>
            </Button.Group>
            <div id="echart4" style={{width: (this.state.width - 230) * 0.5 - 20, height: '255px'}}/>
          </div>
          <div style={{width: '100%', background: '#fff', height: '300px', margin: '20px 0px', paddingTop: '20px'}}>
            <div style={{
              float: 'left', width: '3px', height: '13px', 'marginTop': '4px', 'marginLeft': '15px',
              marginRight: '15px', backgroundColor: '#2395FF'
            }}/>
            <span>设备大修次数统计</span>
            <Button.Group size='small' value={this.state.switchTime} style={{float: 'right', marginRight: '18px'}} onClick={(e) => this.switchTime(e, 'equipment')}>
              <Button type = {this.state.switchTime1 === '1' ? "primary" : ''} value={1}>月</Button>
              <Button type = {this.state.switchTime1 === '2' ? "primary" : ''} value={2}>年</Button>
            </Button.Group>
            <div id="echart6" style={{height: '265px'}}/>
          </div>
        </div>
        <div style={{clear: 'both'}} />
      </div>
    );
  }
}
