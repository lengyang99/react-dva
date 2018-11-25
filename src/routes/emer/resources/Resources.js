import React from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {Table, Button, Layout, message, Input} from 'antd';
import ResourceDispatchOrder from './ResourceDispatchOrder.jsx';
import EmerDialog from '../../../components/EmerDialog';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import tableStyles from '../css/emerTable.css';

const {TextArea} = Input;

@connect(state => ({
  user: state.login.user,
  map: state.emerLfMap.map, // 地图
  resources: state.emerLfMap.resources,
  phone: state.emerLfMap.phone,
  ecodePattern: state.emerLfMap.ecodePattern, // 企业模式配置
  currentClickEvent: state.emerLfMap.currentClickEvent, // 当前应急事件
}))

export default class Resources extends React.Component {
  constructor(props) {
    super(props);
    this.resourcesTimer = null;
    window.callUp = this.callUp;
    window.openOrCloseVideo = this.openOrCloseVideo;
    window.openDispatchOrder = this.openDispatchOrder;
    this.prevResources = [];
    this.state = {
      isShowEmerDispatchOrder: false,
      currentResource: {},
      emerOrder_sendContent: '立即前往事发现场', // 调度指令信息
      orgResources: [], // 应急组织机构实时信息
    };
    message.config({
      duration: 2,
    });
  }

  componentDidMount() {
    this.getGlobalPhone();
    this.getResourceTask();
    this.resourcesTimer = setInterval(this.getResourceTask, 60000);
  }

  componentWillUnmount = () => {
    clearInterval(this.resourcesTimer);
    this.setState = (state, callback) => {};
    this.setState({orgResources: []});
  };

  // 定时查询：1.地图图层人车；2.应急预案关联的组织机构
  getResourceTask = () => {
    const { currentClickEvent, isWar } = this.props;
    if (isWar && currentClickEvent && !currentClickEvent.isDrill) {
      this.getResSituation(); // 获取应急预案关联的组织机构资源准备情况
      return;
    } 
    this.getResources(); // 获取地图图层人车资源准备情况
  }

  // 获取资源
  getResources = () => {
    const { currentClickEvent, isWar} = this.props;
    let payload = {
      ecode: this.props.user.ecode,
      objtype: '3',
    };
    if (isWar && currentClickEvent) {
      payload.eventId = currentClickEvent.alarmId;
    }
    this.props.dispatch({
      type: 'emerLfMap/getResources',
      payload,
      callback: (res) => {
        const noarriveRes = res.filter((v) => { return !v.isarrive; });
        this.showResources(res, noarriveRes);
        this.setState({
          orgResources: res,
        });
      },
    });
  };

  // 资源准备情况
  getResSituation= () => {
    const { currentClickEvent } = this.props;
    // console.log('*********');
    // console.log(currentClickEvent);
    let payload = {
      ecode: this.props.user.ecode,
    };
    if (!currentClickEvent) {
      return;
    }
    if (currentClickEvent) {
      payload.alarmId = currentClickEvent.alarmId;
      payload.eventX = currentClickEvent.x;
      payload.eventY = currentClickEvent.y;
    }
    this.props.dispatch({
      type: 'emerLfMap/getRes',
      payload,
      callback: (res) => {
        // console.log(res, '☆');
        const noarriveRes = res && res.filter((v) => { return !v.isarrive; });
        this.showResources(res, noarriveRes);
        this.setState({
          orgResources: res,
        });
      },
    });
  };

  // 发布指令
  handleSendDispatchOrder = () => {
    const {emerEvent, currentResource, onCancel} = this.props;
    const fd = new FormData();
    fd.append('alarmId', emerEvent.alarmId);
    fd.append('orderType', 2);
    fd.append('receiver', currentResource.username);
    fd.append('sender', this.props.user.trueName);
    fd.append('sendDep', '廊坊新奥调度中心');
    fd.append('sendContent', this.state.emerOrder_sendContent);
    fd.append('sendTime', moment().format('YYYY-MM-DD HH:mm:ss'));
    fd.append('ecode', this.props.user.ecode);
    this.props.dispatch({
      type: 'emer/addEmerOrder',
      payload: fd,
      callback: (res) => {
        message.info(res.msg);
        // 关闭指令发送窗口
        onCancel();
      },
    });
  };

  // 获取主叫号码
  getGlobalPhone = () => {
    this.props.dispatch({
      type: 'emerLfMap/getGlobalPhone',
      payload: {
        ecode: this.props.user.ecode,
      },
    });
  };

  // 打电话
  callUp = (call) => {
    const { phone } = this.props;
    this.props.dispatch({
      type: 'emerLfMap/callUp',
      payload: {
        phone, // 主叫号码
        call, // 被叫号码
      },
    });
  };

  openDispatchOrder = (record) => {
    this.setState({
      isShowEmerDispatchOrder: true,
      currentResource: record,
    });
  };

  // 地图上展示所有元素
  showResources = (res, noarriveRes) => {
    if (this.props.isWar && this.props.emerEvent && this.props.emerEvent.isDrill === 1) {
      if (noarriveRes.length === 0) {
        for (let i = 0; i < res.length; i += 1) {
          this.showResource(res[i]);
        }
        // message.info('资源准备完毕');
        return;
      }
      if (this.prevResources.length === 0) {
        this.prevResources = res;
        // this.showLines(res);
        for (let i = 0; i < res.length; i += 1) {
          this.showResource(res[i]);
        }
      } else {
        let t = 0;
        const prevResources = [...this.prevResources];
        this.prevResources = res;
        const smoothLineTimer = setInterval(() => {
          t += 1;
          for (let i = 0; i < res.length; i += 1) {
            const prevResource = prevResources.filter((v) => { return v.objid === res[i].objid; })[0];
            if (prevResource.x && res[i].x && prevResource.y && res[i].y) {
              const x = prevResource.x + (res[i].x - prevResource.x) * t * 200 / 7000;
              const y = prevResource.y + (res[i].y - prevResource.y) * t * 200 / 7000;
              this.showResource({...res[i], x, y});
            }
          }
        }, 200);
        setTimeout(() => { clearInterval(smoothLineTimer); }, 7000);
      }
    } else {
      for (let i = 0; i < res.length; i += 1) {
        this.showResource(res[i]);
      }
    }
  };

  // 地图上展示单个元素
  showResource = (data) => {
    const layerId = data.objtype === '1' ? 'emerUser' : 'car';
    const imgUrl = data.objtype === '1' ? 'emerUser.png' : 'car.gif';
    const param = {
      id: `${data.objid}_body`,
      layerId,
      zIndex: 100,
      src: `./images/emer/layerIcon/${imgUrl}`,
      width: 40,
      height: 40,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: (attr) => { this.handleOpenTip(attr); },
    };
    const resourceNameParams = {
      x: data.x,
      y: data.y,
      id: `${data.objid}_name`,
      layerId: `${layerId}_name`,
      layerIndex: 101,
      offsetX: 0,
      offsetY: 25,
      text: {
        text: data.objname,
        font: '14px',
        color: {r: 255, g: 255, b: 255, a: 1},
      },
    };
    const dispatchParams = {
      id: `${data.objid}_dispatch`,
      layerId: `${layerId}_dispatch`,
      zIndex: 101,
      src: './images/emer/resources/smallIcon/调度.png',
      width: 12,
      height: 12,
      offsetX: -14,
      offsetY: -25,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: (attr) => { window.openDispatchOrder(attr.attributes); },
    };
    const callUpParams = {
      id: `${data.objid}_call`,
      layerId: `${layerId}_call`,
      zIndex: 101,
      src: './images/emer/resources/smallIcon/电话.png',
      width: 12,
      height: 12,
      offsetX: 0,
      offsetY: -25,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: (attr) => { window.callUp(attr.attributes.objphone); },
    };
    const radioParams = {
      id: `${data.objid}_radio`,
      layerId: `${layerId}_radio`,
      zIndex: 101,
      src: './images/emer/resources/smallIcon/视频直播.png',
      width: 12,
      height: 12,
      offsetX: 14,
      offsetY: -25,
      angle: 0,
      x: data.x,
      y: data.y,
      attr: data,
      click: () => { window.openOrCloseVideo(); },
    };
    this.props.map.getMapDisplay().image(param);
    this.props.map.getMapDisplay().text(resourceNameParams);
    this.props.map.getMapDisplay().image(dispatchParams);
    this.props.map.getMapDisplay().image(callUpParams);
    this.props.map.getMapDisplay().image(radioParams);
  };

  // 地图图标弹出框
  handleOpenTip = (attr) => {
    const record = attr.attributes;
    let info = '';
    if (record.objtype === '1') {
      info = {
        title: '应急人员',
        link: [{
          linkText: '调度',
          click: (data) => { window.openDispatchOrder(data); },
          param: JSON.stringify(record),
        }, {
          linkText: '电话',
          click: (call) => { window.callUp(call); },
          param: record.objphone,
        }, {
          linkText: '直播',
          click: () => { window.openOrCloseVideo(); },
        }],
        content: [{
          name: '姓名', value: record.objname,
        }, {
          name: '电话', value: record.objphone,
        }, {
          name: '预计时间', value: record.arrive_times,
        }, {
          name: '当前时间', value: record.time,
        }],
      };
    } else if (record.objtype === '2') {
      info = {
        title: '应急车辆',
        link: [{
          linkText: '调度',
          click: (data) => { window.openDispatchOrder(data); },
          param: JSON.stringify(record),
        }, {
          linkText: '电话',
          click: (call) => { window.callUp(call); },
          param: record.objphone,
        }, {
          linkText: '直播',
          click: () => { window.openVideo(); },
        }],
        content: [{
          name: '车牌号', value: record.objname,
        }, {
          name: '电话', value: record.objphone,
        }, {
          name: '预计时间', value: record.arrive_times,
        }, {
          name: '当前时间', value: record.time,
        }],
      };
    } else {
      // message.error('请求[资源准备情况]服务返回objtype错误');
    }
    const param = {
      x: record.x,
      y: record.y,
      info,
    };
    this.props.map.popup(param);
  };

  // 显示物资轨迹
  showLines = (datas) => {
    for (let i = 0; i < datas.lenght; i += 1) {
      const dots = [];
      const points = datas[i].his_points;
      for (let j = 0; j < points.length; j += 2) {
        dots.push({x: points[j], y: points[j + 1]});
      }
      const param = {
        id: `resources_lines_${i}`,
        layerId: 'resources_lines',
        width: 5,
        layerIndex: 10,
        dots,
      };
      this.props.map.getMapDisplay().polyline(param);
    }
  };

  // 打开/关闭视频直播
  openOrCloseVideo = (flag = true) => {
    if (!flag) {
      this.setState({
        isShowLiveRideo: flag,
      });
    } else {
      this.props.dispatch({
        type: 'emer/getLiveVideo',
        payload: {ecode: this.props.user.ecode},
        callback: (res) => {
          this.setState({
            liveVideoCode: res.data[0].ccode,
            isShowLiveRideo: flag,
          });
        },
      });
    }
  };

  // 表格行样式----双闪
  getRowClassName = (record) => {
    const that = this;
    if (that.prevResources && that.prevResources.length !== 0) {
      const prevResource = that.prevResources.filter((v) => { return v.objid === record.objid; })[0];
      if (prevResource && !prevResource.isarrive && record.isarrive) {
        return tableStyles.rowBackgroundColor;
      }
    }
    return '';
  };

  render = () => {
    const that = this;
    const {emerEvent, map} = this.props;
    const userColumns = [{
      title: '图片',
      key: 'objtype',
      dataIndex: 'objtype',
      width: '10%',
      render: (text, record, i) => (text === '1' ? <img key={`人${i}`} alt="人" src="./images/emer/resources/人.png" /> : <img key={`车${i}`} alt="车" src="./images/emer/resources/车.png" />),
    }, {
      title: '姓名',
      key: 'objname',
      dataIndex: 'objname',
      width: '20%',
    }, {
      title: '时间',
      key: 'arrive_times',
      dataIndex: 'arrive_times',
      width: '25%',
      render: (text) => (text !== 0 ? (text === '离线' ? text : `${text}分钟`) : '已到位'),
    }, {
      title: '操作',
      key: 'isarrive',
      dataIndex: 'isarrive',
      width: '20%',
      render: (text, record, i) => {
        const operetion = [];
        const imgStyle = {margin: '0px 5px', cursor: 'pointer'};
        if (true) {
          operetion.push(<img key={`电话_${i}`} alt="电话" style={imgStyle} onClick={() => { that.callUp(`${record.objphone}`); }} src="./images/emer/resources/电话.png" />);
        } else {
          operetion.push(<img key={`电话-灰_${i}`} alt="电话-灰" style={imgStyle} src="./images/emer/resources/电话-灰.png" />);
        }
        if (text) {
          operetion.push(<img key={`到位情况_${i}`} alt="到位情况" style={imgStyle} src="./images/emer/resources/到位情况.png" />);
        } else {
          operetion.push(<img key={`到位情况-灰_${i}`} alt="到位情况-灰" style={imgStyle} src="./images/emer/resources/到位情况-灰.png" />);
        }
        return <span>{operetion}</span>;
      },
    }];
    return (
      <div style={{height: '100%'}}>
        <div style={{height: '100%', display: this.props.isWar ? 'block' : 'none'}}>
          <EmerDialog title="资源准备情况" width={380} height="100%">
            <Table
              rowKey="objid"
              showHeader={false}
              bodyStyle={{color: '#fff'}}
              pagination={false}
              columns={userColumns}
              dataSource={this.state.orgResources}
              bordered={false}
              rowClassName={that.getRowClassName}
              onRow={(record) => ({
                onDoubleClick: () => {
                  const XY = that.props.ecodePattern.myTable;
                  if (!(record.x > XY.minX && record.x < XY.maxX && record.y > XY.minY && record.y < XY.maxY)) {
                    message.warn('坐标超出当前地图范围');
                    return;
                  }
                  this.props.map.centerAt({x: record.x, y: record.y});
                },
              })}
            />
          </EmerDialog>
        </div>
        {/* 人员调度指令 */}
        {
          this.state.isShowEmerDispatchOrder ? <ResourceDispatchOrder
            emerEvent={emerEvent}
            currentResource={this.state.currentResource}
            onCancel={() => this.setState({isShowEmerDispatchOrder: false})}
            map={map}
          /> : ''
        }
        {/* 视频弹框 */}
        {
          this.state.isShowLiveRideo ? <Dialog
            title="视频直播"
            width={900}
            onClose={() => { this.openOrCloseVideo(false); }}
            position={{
              top: 100,
              left: 200,
            }}
          >
            <iframe title="视频直播" style={{width: '100%', height: 450}} src={`./camera/?ccode=${this.state.liveVideoCode}`} />
          </Dialog> : ''
        }
      </div>
    );
  }
}
