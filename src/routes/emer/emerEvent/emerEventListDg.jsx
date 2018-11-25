import React from 'react';
import { connect } from 'dva';
import { Button, Table, DatePicker, Select, Input } from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import EmerStart from './emerStart.jsx';
import EmerEventDetails from './emerEventDetails.jsx';
import EmerVerify from './emerVerify';
import SquibAnalysis from '../controllPlan/squibAnalysis'; // 老组件
import ControllPlan from '../controllPlan/ControllPlan';
import EmerWarningInW from './emerWarning.jsx';
import EmerReport from '../emerReport.jsx';

const Option = Select.Option;
// 应急事件等级
let emerEventLevel = ['1-一级紧急', '2-二级紧急', '3-三级紧急'];

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  currentEmerEvent: state.emerLfMap.currentEmerEvent, // 当前应急事件
  isEmerStatus: state.emerLfMap.isEmerStatus, //  应急/平时状态
  isShowEmerWarn: state.emerLfMap.isShowEmerWarn, // 是否展示应急提醒(平时-右下)
  currentClickEvent: state.emerLfMap.currentClickEvent, // 事件列表所点击的事件
  currentEmerEventData: state.emerLfMap.currentEmerEventData,
}))

export default class EmerEventListDg extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emerEventData: [],
      emerEventTypeData: [],
      emerClassify: '',
      eventLevel: '',
      receiveTime: '',
      datePickerValue: null,
      loading: true,
      emerEventDealOpen: false,
      emerEventDeal: {},
      emerEventDetailsOpen: false,
      emerEventDetails: {},
      emerEventTotal: 0,
      pageno: 1,
      pagesize: 5,
      lastEmerEvent: {}, // 最新已确认未启动的事件
    };
    this.handleGetEmerEvent({ gid: 0, pageNo: this.state.pageno, pageSize: this.state.pagesize });
    this.handleGetEmerEventType();
  }

  // 进入应急首页进行判断
  componentDidMount = () => {
    this.handleGetEmerEventStartEmer();
    setInterval(() => this.handleGetEmerEventStartEmer(), 5000);
  };

  componentWillUnmount = () => {
    this.setState = (state, callback) => { };
  };

  componentDidUpdate(prevProps, prevState) {
    if (!prevProps.emerEventListOpen && this.props.emerEventListOpen) {
      this.handleGetEmerEvent({ gid: 0, pageNo: null, pageSize: null });
      this.handleGetEmerEventStartEmer();
    }
    // 平时 --> 应急
    if (!prevProps.isEmerStatus && this.props.isEmerStatus) {
      this.props.map.getMapDisplay().removeLayer('currentEmerEvent');
      this.drawingOneEmerEvent(this.props.currentEmerEvent ? this.props.currentEmerEvent : this.props.currentEmerEventData[0]);
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
        status: 2,
        ecode: this.props.user.ecode,
        pageNo: 1,
        pageSize: 1,
      },
      callback: (res) => {
        if (this.props.isEmerStatus) {
          // 有“应急启动”的事件
          this.props.changeStatus({ isShowEmerWarn: false });
          return;
        }
        if (res.data.length > 0) {
          // 有“已确认”的事件
          this.setState({
            lastEmerEvent: res.data[0],
          });
          this.props.changeStatus({ isShowEmerWarn: true });
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
    data.type = this.state.emerClassify;
    data.level = this.state.eventLevel;
    data.receiveTime = this.state.receiveTime;
    data.ecode = this.props.user.ecode;
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventData: res.data,
          emerEventTotal: res.pageInfo.totalNum,
        });
      },
    });
  }

  // 重置查询
  handleResetSearch = (e) => {
    e.target.ownerDocument.getElementById('emerEventSearch_form').reset();
    this.setState({
      emerClassify: '',
      eventLevel: '',
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
  handleGetEmerEvent = (pageinfo = {}) => {
    let data = {
      gid: pageinfo.gid,
      ecode: this.props.user.ecode,
      pageNo: pageinfo.pageNo,
      pageSize: pageinfo.pageSize,
    };
    if (this.state.emerClassify) {
      data.type = this.state.emerClassify;
    }
    if (this.state.eventLevel) {
      data.level = this.state.eventLevel;
    }
    if (this.state.receiveTime) {
      data.receiveTime = this.state.receiveTime;
    }
    this.props.dispatch({
      type: 'emer/getEmerEvent',
      payload: data,
      callback: (res) => {
        this.setState({
          emerEventTotal: res.pageInfo.totalNum,
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
      this.handleGetEmerEvent({ gid: 0, pageNo: this.state.pageno, pageSize: this.state.pagesize });
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
    if (emerEvent.status === 0) {
      // 事件状态不支持为0
    } else if (emerEvent.status === 1 || emerEvent.status === 2 || emerEvent.status === 3) {
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
      const param = {
        id: 'emerPoint',
        layerId: 'emerPoint',
        src: '',
        width: 0,
        height: 0,
        angle: 0,
        x: emerEvent.x,
        y: emerEvent.y,
      }
      this.props.map.getMapDisplay().image(currentEmerEventParam);
      this.props.map.getMapDisplay().image(param);
    }
  };

  // 绘制的应急事件的点击事件
  emerEventClick = (emerEvent) => {
    if (emerEvent.status === 2) {
      // 立即处理
      this.handleDealEmerEvent('open', emerEvent);
    } else if (emerEvent.status === 3) {
      // 已经启动切换事件
      this.props.handleGoEmer(emerEvent);
    }
  };


  // 查询应急事件类型
  handleGetEmerEventType = () => {
    this.props.dispatch({
      type: 'emer/getEmerEventType',
      payload: {
        ecode: this.props.user.ecode,
      },
      callback: (res) => {
        this.setState({
          emerEventTypeData: res.data,
        });
      },
    });
  }

  onChangeField = (field, value, e) => {
    this.setState({
      [field]: value,
    });
  };

  render = () => {
    const that = this;
    const { onCancel, emerEventListOpen } = this.props;
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
      title: '操作（双击事件定位到险情地点）',
      render: (record) => (
        <span>
          <Button
            type="primary"
            style={{ marginRight: '10px' }}
            size="small"
            onClick={(op, eventId) => this.handleShowEmerEventDetails('open', record.gid)}
          >详情</Button>
          {
            record.status === 1 ? <Button
              type="primary"
              size="small"
              style={{ marginRight: '10px' }}
              onClick={() => {
                this.openOrCloseDialog('isShowEmerVerity', true);
                this.props.changeStatus({ currentClickEvent: record });
              }}
            >险情确认</Button> : ''
          }
          {
            record.status === 2 && record.isFalseReport === 0 ? <Button
              type="primary"
              size="small"
              style={{ marginRight: '10px' }}
              onClick={() => {
                this.handleDealEmerEvent('open', record);
                this.props.changeStatus({ currentClickEvent: record });
              }}
            >立即处置</Button> : ''
          }
          {
            record.status === 3 ? <Button
              type="primary"
              size="small"
              style={{ marginRight: '10px' }}
              onClick={() => {
                this.props.handleGoEmer(record);
                this.props.details();
                this.props.changeStatus({ currentClickEvent: record });
              }}
            >控制方案</Button> : ''
          }
          {
            record.status === 3 ? <Button
              type="primary"
              size="small"
              style={{ marginRight: '10px' }}
              onClick={() => {
                this.props.handleGoEmer(record);
                this.props.changeStatus({ currentClickEvent: record });
              }}
            >切换应急事件</Button> : ''
          }
          {
            record.status === 4 && record.isFalseReport === 0 ? <Button
              type="primary"
              size="small"
              style={{ marginRight: '10px' }}
              onClick={() => {
                this.props.changeStatus({ currentClickEvent: record });
                this.props.openEmerReport();
              }}
            >险情处置报告</Button> : ''
          }
        </span>
      ),
    }];
    const pagination = {
      total: that.state.emerEventTotal,
      current: that.state.pageno,
      pageSize: that.state.pagesize,
      showQuickJumper: true,
      showSizeChanger: true,
      pageSizeOptions: ['5', '7', '10'],
      onChange: (pageno, pagesize) => {
        this.setState({ pageno, pagesize });
        this.handleGetEmerEvent({ gid: 0, pageNo: pageno, pageSize: pagesize });
      },
      onShowSizeChange: (pageno, pagesize) => {
        this.setState({ pageno, pagesize });
        this.handleGetEmerEvent({ gid: 0, pageNo: pageno, pageSize: pagesize });
      },
    };
    const modalStyle = {
      marginLeft: 360,
      marginTop: 65,
    };
    let levelArr = [];
    return (
      <div>
        <div style={{ display: emerEventListOpen ? 'block' : 'none' }}>
          <Dialog
            title="应急事件"
            width={900}
            onClose={onCancel}
            position={{
              top: 140,
              left: 290,
            }}
          >
            <div style={{ margin: 10, position: 'relative' }}>
              <div>
                <form id="emerEventSearch_form">
                  <span>
                    事件名称:<Input type="text" name="name" style={{ width: 110, margin: '0px 14px 5px 8px' }} />
                  </span>
                  <span>事件类型:
                  <Select
                      value={this.state.emerClassify}
                      style={{ width: 90, margin: '0px 14px 5px 8px', display: 'inline-block' }}
                      onChange={this.onChangeField.bind(this, 'emerClassify')}
                    >
                      <Option value="">请选择</Option>
                      {
                        this.state.emerEventTypeData.map((item, index) => <Select.Option key={index} value={item.gid + ''}>{item.name}</Select.Option>)
                      }
                    </Select>
                  </span>
                  <span>事件等级:
                  <Select
                      value={this.state.eventLevel}
                      style={{ width: 90, margin: '0px 14px 5px 8px', display: 'inline-block' }}
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
                      style={{ width: 120, margin: '0px 14px 5px 8px' }}
                      value={this.state.datePickerValue}
                      onChange={this.onDateChange}
                    />
                  </span>
                  <Button type="primary" style={{ marginRight: 10 }} onClick={this.handleSearch}>查询</Button>
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
                    this.props.map.centerAt({ x: record.x, y: record.y });
                    this.drawingOneEmerEvent(record)
                  },
                })}
              />
              {
                this.state.emerEventData.length ? <span style={{ position: 'absolute', bottom: 20, left: 16 }}>
                  共<span style={{ color: '#108EE9' }}>{this.state.emerEventTotal}</span>条数据</span> : ''
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
            drawingOneEmerEvent={(event) => this.drawingOneEmerEvent(event)}
            onCancel={() => this.handleDealEmerEvent('close', null)}
            map={this.props.map}
          /> : ''
        }
        {/* 险情确认 */}
        {
          this.state.isShowEmerVerity ? <EmerVerify
            onClose={() => this.openOrCloseDialog('isShowEmerVerity', false)}
            verityEvent={this.props.currentClickEvent}
            emerEventTypeData={this.state.emerEventTypeData}
            handleGetEmerEvent={(lastEmerEvent) => {
              this.handleGetEmerEvent({ gid: 0, pageNo: null, pageSize: null });
              this.setState({ lastEmerEvent });
              this.props.changeStatus({ isShowEmerWarn: true });
            }}
            emerEventClick={this.emerEventClick}
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
              changeStatus={this.props.changeStatus}
            /> : ''
        }
      </div>
    );
  }
}
