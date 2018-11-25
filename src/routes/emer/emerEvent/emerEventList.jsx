import React from 'react';
import {connect} from 'dva';
import {Button, Table, DatePicker, Select, Input} from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerStart from './emerStart.jsx';
import EmerEventDetails from './emerEventDetails.jsx';
import EmerVerify from './emerVerify';
import SquibAnalysis from '../controllPlan/squibAnalysis';
import EmerWarningInW from './emerWarning.jsx';
import EmerReport from '../emerReport.jsx';

const Option = Select.Option;
// 应急事件等级
let emerEventLevel = ['1-一级紧急', '2-二级紧急', '3-三级紧急'];
let emerRemindTimer = -1;

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  isEmerStatus: state.emerLfMap.isEmerStatus, //  应急/平时状态
  isShowEmerWarn: state.emerLfMap.isShowEmerWarn, // 是否展示应急提醒(平时-右下)
  currentClickEvent: state.emerLfMap.currentClickEvent, // 事件列表所点击的事件
}))

export default class EmerEventList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerEventData: [],
      eventLevel: '0',
      receiveTime: '',
      datePickerValue: null,
      loading: true,
      emerEventDealOpen: false,
      emerEventDeal: {},
      emerEventDetailsOpen: false,
      emerEventDetails: {},
      pageno: 1,
      pagesize: 5,
      lastEmerEvent: {}, // 最新已确认未启动的事件
      isShowEmerVerity: false,
    };
    this.handleGetEmerEvent(0);
  }

  // 进入应急首页进行判断
  componentDidMount = () => {
    this.handleGetEmerEventStartEmer();
    emerRemindTimer = setInterval(this.handleGetEmerEventStartEmer, 5000);
  };

  componentWillUnmount = () => {
    clearInterval(emerRemindTimer);
    this.setState = (state, callback) => {};
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.emerEventListOpen && this.props.emerEventListOpen) {
      this.handleGetEmerEvent(0);
      this.handleGetEmerEventStartEmer();
    }
    // 平时 --> 应急
    if (!prevProps.isEmerStatus && this.props.isEmerStatus) {
      this.props.map.getMapDisplay().removeLayer('currentEmerEvent');
      this.drawingOneEmerEvent(this.props.currentEmerEvent);
    }
    // 应急 --> 平时
    if (prevProps.isEmerStatus && !this.props.isEmerStatus) {
      this.props.removeLayers();
      this.handleGetEmerEventStartEmer();
      this.state.emerEventData.map((v, i) => {
        this.drawingOneEmerEvent(v);
      });
    }
  }

  // 查询已确认未启动的应急事件
  handleGetEmerEventStartEmer = () => {
    this.props.dispatch({
      type: 'emerLfMap/getEmerEvent',
      payload: {
        status: 1,
        ecode: this.props.user.ecode,
        terminalType: 'pc',
      },
      callback: (res) => {
        if (this.props.isEmerStatus) {
          // 有“应急启动”的事件
          this.props.changeStatus({isShowEmerWarn: false});
          return;
        }
        if (res.data.length > 0 && res.data[0].level) {
          // 有“已接警”的事件
          this.setState({
            lastEmerEvent: res.data[0],
          });
          this.props.changeStatus({isShowEmerWarn: true});
        }
      },
    });
  }

  // 处理查询
  handleSearch = (e) => {
    // 获取表单并设置其属性
    let f = e.target.ownerDocument.getElementById('emerEventSearch_form');
    let data = {};
    data.name = f.name.value;
    data.level = this.state.eventLevel;
    data.receiveTime = this.state.receiveTime;
    data.ecode = this.props.user.ecode;
    data.terminalType = 'pc';
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventData: res.data,
        });
      },
    });
  }

  // 重置查询
  handleResetSearch = (e) => {
    e.target.ownerDocument.getElementById('emerEventSearch_form').reset();
    this.setState({
      eventLevel: '0',
      receiveTime: '',
      datePickerValue: null,
    });
  }

  // 处理事件级别变化
  onLevelChange = (value) => {
    this.setState({
      eventLevel: value,
    });
  }

  // 处理日期变化
  onDateChange = (date, dateString) => {
    this.setState({
      receiveTime: dateString,
      datePickerValue: date,
    });
  }

  // 获取应急事件
  handleGetEmerEvent = (eventId) => {
    let data = {};
    data.gid = eventId;
    data.ecode = this.props.user.ecode;
    data.terminalType = 'pc';
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventData: res.data,
          loading: false,
        });
        this.props.map.getMapDisplay().removeLayer('currentEmerEvent');
        res.data.map((v, i) => {
          this.drawingOneEmerEvent(v);
        });
      },
    });
  }

  // 处置应急事件（匹配应急预案或终止应急事件）
  handleDealEmerEvent = (op, emerEvent) => {
    if (op === 'open') {
      this.setState({
        emerEventDealOpen: true,
        emerEventDeal: emerEvent,
      });
    } else {
      this.setState({
        emerEventDealOpen: false,
      });
      // 关闭应急事件处置模态框后，更新应急事件列表
      this.handleGetEmerEvent(0);
    }
  }

  // 打开/关闭应急事件详情
  handleShowEmerEventDetails = (op, eventId) => {
    if (op === 'open' && eventId) {
      // 遍历应急事件列表，获取指定的应急事件
      for (let i = 0; i < this.state.emerEventData.length; i += 1) {
        if (eventId === this.state.emerEventData[i].gid) {
          this.setState({
            emerEventDetailsOpen: true,
            emerEventDetails: this.state.emerEventData[i],
          });
          return;
        }
      }
    } else {
      this.setState({
        emerEventDetailsOpen: false,
      });
    }
  }

  openOrCloseDialog = (name, flag) => {
    this.setState({
      [name]: flag,
    });
  };

  // 绘制一个应急事件
  drawingOneEmerEvent = (emerEvent) => {
    if ((emerEvent.status === 1 && !emerEvent.level) || emerEvent.status === 3 || emerEvent.status === 4) {
      return;
    }
    const currentEmerEventParam = {
      id: `${emerEvent.gid}`,
      layerId: 'currentEmerEvent',
      src: './images/emer/alarm.gif',
      width: 40,
      height: 40,
      angle: 0,
      x: emerEvent.x,
      y: emerEvent.y,
      attr: emerEvent,
      click: (attr) => this.emerEventClick(attr.attributes),
    };
    this.props.map.getMapDisplay().image(currentEmerEventParam);
  };

  // 绘制的应急事件的点击事件
  emerEventClick = (emerEvent) => {
    if (emerEvent.status === 1) {
      if (!emerEvent.level) {
        // this.openOrCloseDialog('isShowEmerVerity', true);
        // this.props.changeStatus({currentClickEvent: emerEvent}); // 险情确认
      } else {
        this.handleDealEmerEvent('open', emerEvent); // 立即处理
      }
    } else if (emerEvent.status === 2) { // 已经启动切换事件
      this.props.handleGoEmer(emerEvent);
    }
  };

  render = () => {
    const that = this;
    const {onCancel, emerEventListOpen} = this.props;
    const tableColumns = [{
      title: '事件名称',
      dataIndex: 'name',
      width: 150,
    }, {
      title: '事件类型',
      dataIndex: 'typeName',
      width: 85,
    }, {
      title: '事件等级',
      dataIndex: 'levelName',
      width: 85,
    }, {
      title: '事件状态',
      dataIndex: 'statusName',
      width: 85,
    }, {
      title: '事发单位',
      dataIndex: 'incidentUnit',
      width: 100,
    }, {
      title: '事发时间',
      dataIndex: 'incidentTime',
      width: 100,
    }, {
      title: '操作',
      render: (record) => (
        <span>
          <Button
            type="primary"
            size="small"
            onClick={(op, eventId) => this.handleShowEmerEventDetails('open', record.gid)}
          >详情</Button>&nbsp;&nbsp;&nbsp;
          {
            record.status === 1 && record.level ? <Button
              type="primary"
              size="small"
              onClick={(op, emerEvent) => this.handleDealEmerEvent('open', record)}
            >立即处置</Button> : ''
          }
          &nbsp;&nbsp;&nbsp;
          {
            record.status === 2 && record.isFalseReport === 0 ? <Button
              type="primary"
              size="small"
              onClick={() => {
                this.props.handleGoEmer(record);
              }}
            >切换应急事件</Button> : ''
          }
          {
            record.status === 3 ? <Button
              type="primary"
              size="small"
              onClick={() => {
                this.props.changeStatus({currentClickEvent: record});
                this.props.openEmerReport();
              }}
            >险情处置报告</Button> : ''
          }
        </span>
      ),
    }];
    const pagination = {
      current: that.state.pageno,
      pageSize: that.state.pagesize,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ['5', '7', '10'],
      onChange: (pageno, pagesize) => {
        this.setState({pageno, pagesize});
      },
      onShowSizeChange: (pageno, pagesize) => {
        this.setState({pageno, pagesize});
      },
      // showTotal: (total) => `共 ${total} 条数据`,
    };
    const modalStyle = {
      marginLeft: 360,
      marginTop: 65,
    };
    let levelArr = [];
    return (
      <div>
        <div style={{display: emerEventListOpen ? 'block' : 'none'}}>
          <Dialog
            title="应急事件"
            width={900}
            onClose={onCancel}
            position={{
              top: 140,
              left: 290,
            }}
          >
            <div style={{margin: 10, position: 'relative'}}>
              <div>
                <form id="emerEventSearch_form">
                <span>
                  事件名称:<Input type="text" name="name" style={{width: 120, margin: '0px 14px 5px 8px'}}/>
                </span>
                <span>事件等级:
                  <Select
                    value={this.state.eventLevel}
                    style={{width: 120, margin: '0px 14px 5px 8px', display: 'inline-block'}}
                    onChange={this.onLevelChange}
                  >
                    <Option value="0">请选择</Option>
                    {
                      emerEventLevel.map((item, index) => {
                        let op = item.split('-');
                        return (<Option key={index} value={op[0]}>{op[1]}</Option>);
                      })
                    }
                  </Select>
                </span>
                  <span>上报时间:
                  <DatePicker
                    style={{width: 140, margin: '0px 14px 5px 8px'}}
                    value={this.state.datePickerValue}
                    onChange={this.onDateChange}
                  />
                </span>
                  <Button type="primary" style={{marginRight: 20}} onClick={this.handleSearch}>查询</Button>
                  <Button onClick={this.handleResetSearch}>重置</Button>
                </form>
              </div>
              <Table
                rowKey={record => record.gid}
                columns={tableColumns}
                dataSource={this.state.emerEventData}
                pagination={pagination}
                loading={this.state.loading}
                onRow={(record) => ({
                  onDoubleClick: () => {
                    this.props.map.centerAt({x: record.x, y: record.y});
                  },
                })}
              />
              {
                this.state.emerEventData.length ? <span style={{position: 'absolute', bottom: 20, left: 16}}>
                共<span style={{color: '#108EE9'}}>{this.state.emerEventData.length}</span>条数据</span> : ''
              }
            </div>
          </Dialog>
        </div>
        {/* 应急事件详情 */}
        {
          this.state.emerEventDetailsOpen ? <EmerEventDetails
            emerEventDetails={this.state.emerEventDetails}
            onCancel={(op, eventId) => this.handleShowEmerEventDetails('close', null)}
          /> : ''
        }
        {/* 应急事件立即处置 */}
        {
          this.state.emerEventDealOpen ? <EmerStart
            emerEvent={this.state.emerEventDeal}
            onCancel={() => this.handleDealEmerEvent('close', null)}
            map={this.props.map}
          /> : ''
        }
        {/* 险情确认 */}
        {
          this.state.isShowEmerVerity ? <EmerVerify
            onClose={() => this.openOrCloseDialog('isShowEmerVerity', false)}
            verityEvent={this.props.currentClickEvent}
            handleGetEmerEvent={(lastEmerEvent) => {
              this.handleGetEmerEvent(0);
              this.setState({lastEmerEvent});
              this.props.changeStatus({isShowEmerWarn: true});
            }}
            emerEventClick={this.emerEventClick}
          /> : ''
        }
        {/* 控制方案 */}
        {
          this.state.isShowSquibAnalysis ?
            <SquibAnalysis
              emerEvent={this.props.currentClickEvent}
              handleSendStopGasNotice={this.props.handleSendStopGasNotice}
              onCancel={() => this.openOrCloseDialog('isShowSquibAnalysis', false)}
            /> : ''
        }
        {/* 应急提示 */}
        {
          this.props.isShowEmerWarn ?
            <EmerWarningInW
              handleEmerStart={this.props.handleOpenEmerStart}
              emerEvent={this.state.lastEmerEvent}
              loginUser={this.props.user}
              onCancel={this.props.openEmerWarning}
              handleGoEmer={this.props.handleGoEmer}
              map={this.props.map}
              emerStartFlag={this.props.emerStartFlag}
              isWar={!this.props.isShowEmerWarn}
            /> : ''
        }
      </div>
    );
  }
}
