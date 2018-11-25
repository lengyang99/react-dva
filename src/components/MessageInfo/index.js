import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Popover, Icon, Badge, Spin, Modal, message} from 'antd';
import { routerRedux, Link } from 'dva/router';
import styles from './index.less';

const confirm = Modal.confirm;

@connect(state => ({
  total: state.messageInfo.msgPop.total,
  msgData: state.messageInfo.msgPop.msgData,
  userInfo: state.login.user,
}))

export default class MessageInfo extends PureComponent {
  constructor(props) {
    super(props);

    this.showPopup = false; // 是否隐藏消息弹框
    this.timerIndex = 0;
    this.state = {
      visible: false,
    };
    this.getMessageInfo();
  }

  componentWillMount() {

    this.timerIndex = setInterval(() => {
      this.getMessageInfo();
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.timerIndex);
  }

  onItemClick = (item, tabProps) => {
    const { onItemClick } = this.props;
    onItemClick(item, tabProps);
  }

  getMessageList = () => {
    let data = this.props.msgData;
    let tr = [];
    data.map((temp) => {
      tr.push(<div key={`message_${temp.id}`} style={{height: 'auto'}}>
        <div style={{float: 'left', width: '280px', height: 'auto', marginTop: '5px'}}><a style={{width: '200px'}} className="workorderInfo" data-gid={temp.id} href="javascript:void(0)" onClick={this.showDetail.bind(this, temp)}>{temp.msg}</a></div>
        <div style={{float: 'left', width: '180px', paddingLeft: '20px', marginTop: '5px'}}>{temp.sendtime}</div>
        <div style={{float: 'left', marginTop: '5px'}}> <Icon type="delete" title="删除" onClick={this.deleteMsg.bind(this, temp.id)} style={{cursor: 'pointer'}} /></div>
      </div>);
    });

    return (
      <div style={{width: '500px', height: '100%', display: 'table'}}>
        {tr}
      </div>);
  };

  showDetail = (row) => {
    // 标记当前消息为已读状态
    this.props.dispatch({
      type: 'messageInfo/readMsgInfo',
      payload: {
        gids: row.gid,
      },
    });
    this.hidePopup();
    // 当前的消息为工单消息时跳转到工单详情
    if (row.type.indexOf('wo_') === 0 || row.type.indexOf('gzwx_') === 0 || row.type.indexOf('gg_') === 0
      || row.type.indexOf('confirm_') === 0 || row.type.indexOf('qt_') === 0 || row.type.indexOf('bp_') === 0
      || row.type.indexOf('pj_') === 0 || row.type.indexOf('dsf_') === 0 || row.type.indexOf('zh_') === 0) {
      this.jumpToWorkorder(row);
    } else if (row.item_ids.indexOf('GWBY') >= 0 || row.item_ids.indexOf('DSF') >= 0
      || row.item_ids.indexOf('PJZH') >= 0) { // 当前的消息为第三方施工或者管网保压或者为碰接置换时跳转到工单详情
      this.eventToWorkorder(row);
    } else if (row.type.indexOf('event_') === 0 || row.type.indexOf('emer_') === 0 ) { // 消息类型为事件时跳到事件详情
      this.jumpToEvent(row);
    } else if (row.type.indexOf('t_') === 0 || row.type.indexOf('mt_') === 0) { // 消息类型为养护时跳转到养护任务详情
      this.jumpToYhTask(row);
    } else if (row.type.indexOf('pt_') === 0) { // 消息类型为巡检类型时跳转到巡检任务详情
      this.jumpToXJTask(row);
    } else if (row.type.indexOf('tq_') === 0 || row.type.indexOf('_tq_') >= 0
      || row.type.indexOf('pj_tq_') === 0) { // 停气通知的消息跳转至停气列表
      this.jumpToStopGas();
    }
    this.getMessageInfo();
  }

  /*
   * 消息跳转至工单详情
   * 参数-row 查询的消息数据
   */
  jumpToWorkorder = (row) => {
    this.props.dispatch({
      type: 'messageInfo/getWorkorderInfo',
      payload: {
        processinstanceid: row.objid,
        userid: this.props.userInfo.gid,
      },
      callback: (res) => {
        let formid = res.params[0].formid;
        let processinstanceid = res.params[0].processInstancedId;
        let path = {
          pathname: '/order/workOrder-list-detail',
          processInstanceId: processinstanceid,
          formid: formid,
          workOrderNum: '',
          params: {},
          // historyPageName: 'messageList',
          historyPageName: '',
        };
        this.props.dispatch(routerRedux.push(path));
      },
    });
  }

  /*
   * 由事件消息跳转至工单详情
   * 参数-row 查询的消息数据
   */
  eventToWorkorder = (row) => {
    this.props.dispatch({
      type: 'messageInfo/getEventFormInfo',
      payload: {eventid: row.objid},
      callback: (res) => {
        let formid = res.eventlist[0].formid;
        let processinstanceid = res.eventlist[0].processinstanceid;
        let path = {
          pathname: '/order/workOrder-list-detail',
          processInstanceId: processinstanceid,
          formid: formid,
          workOrderNum: '',
          params: {},
          historyPageName: '',
        };
        this.props.dispatch(routerRedux.push(path));
      },
    });
  }

  /*
   * 由事件消息跳转至事件详情
   * 参数-row 查询的消息数据
   */
  jumpToEvent = (row) => {
    this.props.dispatch({
      type: 'messageInfo/getEventFormInfo',
      payload: {eventid: row.objid},
      callback: (res) => {
        let typeid = res.eventlist[0].typeid;
        let path = {
          pathname: '/event-list-detail',
          eventid: row.objid,
          eventtype: typeid,
          params: {},
          historyPageName: '',
        };
        this.props.dispatch(routerRedux.push(path));
      },
    });
  }

  /*
   * 由养护消息跳转至养护详情
   * 参数-row 查询的消息数据
   */
  jumpToYhTask = (row) => {
    this.props.dispatch({
      type: 'messageInfo/getYHTaskInfo',
      payload: {
        taskId: row.objid,
      },
      callback: (res) => {
        const path = {
          pathname: '/query/task-detail',
          state: res,
          backpath: '/message-list',
        };
        this.props.dispatch(routerRedux.push(path));
      },
    });
  }

  /*
   * 由巡检消息跳转至巡检详情
   * 参数-row 查询的消息数据
   */
  jumpToXJTask = (row) => {
    this.props.dispatch({
      type: 'messageInfo/getTaskInfo',
      payload: {gid: row.objid},
      callback: (res) => {
        let taskData = res.data[0];
        let path = {
          pathname: '/query/patrol-task-detail',
          data: {
            gid: taskData.gid,
            usernames: taskData.usernames,
            name: taskData.name,
            startTime: taskData.startTime,
            endTime: taskData.endTime,
            arriveNum: taskData.arriveNum,
            totalNum: taskData.totalNum,
            feedbackNum: taskData.feedbackNum,
          },
        };
        this.props.dispatch(routerRedux.push(path));
      },
    });
  }

  /*
   * 由停气通知消息跳转至停气
   * 参数-row 查询的消息数据
   */
  jumpToStopGas = () => {
    let path = {
      pathname: '/query/stopVolume',
    };
    this.props.dispatch(routerRedux.push(path));
  }

  deleteMsg = (gid) => {
    let that = this;

    that.showPopup = true;
    confirm({
      title: '提示',
      content: '是否确认删除该消息？',
      zIndex: 10000,
      onOk() {
        that.props.dispatch({
          type: 'messageInfo/deleteMsgInfo',
          payload: {
            gids: gid,
          },
          callback: () => {
            message.info('消息删除成功！');
            that.getMessageInfo();
          },
        });
      },
      onCancel() {

      },
    });
  }

  showMoreMessage = () => {
    this.props.history();
  };

  getNotificationBox() {
    let titleEmt = (<div>
      <span>您有{this.props.total}条待处理消息</span>
      <Link style={{float: 'right'}} to="/message-list" onClick={this.hidePopup}>更多>></Link>
    </div>);
    let bodyEmt = this.getMessageList();
    return {title: titleEmt, body: bodyEmt};
  }

  hidePopup = () => {
    this.setState({
      visible: false,
    });
  }

  onPopupVisibleChange = (visible) => {
    if (visible) {
      this.getMessageInfo();
    }

    if (!this.showPopup) {
      this.setState({ visible });
    } else {
      this.setState({ visible: true });
    }
    this.showPopup = false;
  }

  getMessageInfo = () => {
    let queryParams = {userid: this.props.userInfo.gid, isread: 0, isdel: 0, pageno: 1, pagesize: 5};
    this.props.dispatch({
      type: 'messageInfo/getMessageList',
      loading: false,
      payload: {
        params: queryParams,
        queryType: '',
      },
    });
  }

  render() {
    // <Badge count={1} className={styles.badge}>
    // </Badge>
    const notificationBox = this.getNotificationBox();
    const trigger = (
      <span >
        <Badge count={this.props.total} overflowCount={10000000} className={styles.badge}>
          <Icon type="mail" className={styles.icon} />
        </Badge>
      </span>
    );
    if (!notificationBox) {
      return trigger;
    }

    return (
      <Popover
        title={notificationBox.title}
        placement="bottomRight"
        content={notificationBox.body}
        popupClassName={styles.popover}
        visible={this.state.visible}
        trigger="click"
        arrowPointAtCenter
        popupAlign={this.props.popupAlign}
        onVisibleChange={this.onPopupVisibleChange}
        // {...popoverProps}
      >
        {trigger}
      </Popover>
    );
  }
}
