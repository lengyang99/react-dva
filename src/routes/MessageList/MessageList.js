/**
 * Created by hexi on 2017/12/1.
 */
import React, {Component} from 'react';
import {routerRedux, Link} from 'dva/router';
import {Table, Tabs, Select, DatePicker, message, Modal, Button } from 'antd';
import {connect} from 'dva';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './MessageList.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const confirm = Modal.confirm;

@connect(state => ({
  msgRead: state.messageInfo.msgRead,
  msgNoRead: state.messageInfo.msgNoRead,
  userInfo: state.login.user,
}))

export default class MessageList extends Component {
  constructor(props) {
    super(props);

    this.queryType = '0'; // 记录当前的查询的数据类型 '0'未读，'1'已读
    this.pageno = 1;
    this.pagesize = 10;
    this.state={
      selectedRowKeys: [], //勾选的未读信息；
      loading: false,
    }
  }

  componentWillMount() {
    let params = {userid: this.props.userInfo.gid, isread: 0, isdel: 0, pageno: this.pageno, pagesize: this.pagesize};
    this.getMessageInfo(params);
  }

  deleteMsg = (gid) => {
    let gidAll = ''
    const selectedRowKeys = [...this.state.selectedRowKeys];
    if(gid === 'check'){
      gidAll = selectedRowKeys.toString();
      this.setState({loading: true})
    }else{
      gidAll = gid;
    }
    console.log(gid, selectedRowKeys,gidAll, 'selectedRowKeys')
    let that = this;
    confirm({
      title: '提示',
      content: '是否确认删除该消息？',
      onOk() {
        that.props.dispatch({
          type: 'messageInfo/deleteMsgInfo',
          payload: {
            // userid: this.props.userInfo.gid,
            gids: gidAll,
          },
          callback: () => {
            message.info('消息删除成功！');
            that.setState({selectedRowKeys:[], loading: false}, () => {
              console.log(that.state, 'this.state')
            })
            that.onChangeTab();
          },
        });
      },
      onCancel() {

      },
    });
  }

  showDetail = (row) => {
    // if (row.type === 'event_report') {
    //   let path = {
    //     pathname: '/event-list',
    //     params: {condition: row.objid},
    //   };
    //   this.props.dispatch(routerRedux.push(path));
    // } else if (row.type.indexOf('wo_') >= 0) {
    //   this.props.dispatch({
    //     type: 'messageInfo/getWorkorderInfo',
    //     payload: {condition: row.objid},
    //     callback: (res) => {
    //       let workorderid = '';
    //       for (let i = 0; i < res.params.length; i++) {
    //         if (res.params[i].eventid === row.objid) {
    //           workorderid = res.params[i];
    //           break;
    //         }
    //       }
    //       let path = {
    //         pathname: '/workOrder-list',
    //         params: {condition: workorderid},
    //       };
    //       this.props.dispatch(routerRedux.push(path));
    //     },
    //   });
    //   let path = {
    //     pathname: '/workOrder-list',
    //     params: {condition: row.objid},
    //   };
    //   this.props.dispatch(routerRedux.push(path));
    // }

    // 标记当前消息为已读状态
    this.props.dispatch({
      type: 'messageInfo/readMsgInfo',
      payload: {
        gids: row.gid,
      },
    });
    // 当前的消息为工单消息时跳转到工单详情
    if (row.type.indexOf('wo_') === 0 || row.type.indexOf('gzwx_') === 0 || row.type.indexOf('gg_') === 0
          || row.type.indexOf('confirm_') === 0 || row.type.indexOf('qt_') === 0 || row.type.indexOf('bp_') === 0
          || row.type.indexOf('pjzh_') === 0 || row.type.indexOf('dsf_') === 0) {
      this.jumpToWorkorder(row);
    } else if (row.item_ids.indexOf('GWBY') >= 0 || row.item_ids.indexOf('DSF') >= 0 || row.item_ids.indexOf('PJZH') >= 0) { // 当前的消息为第三方施工或者管网保压或者为碰接置换时跳转到工单详情
      this.eventToWorkorder(row);
    } else if (row.type.indexOf('event_') === 0 || row.type.indexOf('emer_') === 0) { // 消息类型为事件时跳到事件详情
      this.jumpToEvent(row);
    } else if (row.type.indexOf('t_') === 0 || row.type.indexOf('mt_') === 0) { // 消息类型为养护时跳转到养护任务详情
      this.jumpToYhTask(row);
    } else if (row.type.indexOf('pt_') === 0) { // 消息类型为巡检类型时跳转到巡检任务详情
      this.jumpToXJTask(row);
    } else if (row.type.indexOf('tq_') === 0 || row.type.indexOf('_tq_') >= 0 || row.type.indexOf('pj_tq_') === 0) { // 停气通知的消息跳转至停气列表
      this.jumpToStopGas();
    }
    this.onChangeTab();
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
          historyPageName: '/message-list',
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
          historyPageName: '/message-list',
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
          historyPageName: '/message-list',
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

  /*
  *设置消息为已读
  * 参数 gid 服务返回的消息编号
  */
  readMsg = (gid) => {
    let gidAll = ''
    const {selectedRowKeys} = this.state;
    if(gid === 'check'){
      gidAll = selectedRowKeys.toString();
    }else{
      gidAll = gid;
    }
    this.props.dispatch({
      type: 'messageInfo/readMsgInfo',
      payload: {
        gids: gidAll,
      },
      callback: () => {
        message.info('消息已设置为已读！');
        this.setState({selectedRowKeys:[]})
        this.onChangeTab();
      },
    });
  }

  onChangeTab = (data) => {
    if (data) {
      this.queryType = data;
      this.setState({selectedRowKeys:[]})
    } else {
      data = this.queryType;
    }

    let params = {userid: this.props.userInfo.gid, isread: data, isdel: 0, pageno: this.pageno, pagesize: this.pagesize};
    this.getMessageInfo(params);
  }

  getMessageInfo = (params) => {
    this.props.dispatch({
      type: 'messageInfo/getMessageList',
      payload: {
        params: params,
        queryType: this.queryType,
      },
    });
  }

  /*
  * 判断当前数据是否为空，若查询为空则继续查询前一页的数据
  */
  dataIsNull = () => {
    let data = [];
    if (this.queryType === '0') {
      data = this.props.msgNoRead.msgData;
    } else if (this.queryType === '1') {
      data = this.props.msgRead.msgData;
    }

    if (data.length === 0 && this.pageno > 1) {
      this.pageno = this.pageno - 1;
      this.onChangeTab();
    }
  }



  render() {
    this.dataIsNull();
    const {selectedRowKeys, loading} = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(selectedRowKeys, selectedRows, 'check')
        this.setState({
          selectedRowKeys
        })
      }
    }
    const columns = [{ title: '时间', dataIndex: 'sendtime', key: 'sendtime', width: '20%' },
      { title: '内容',
        dataIndex: 'msg',
        key: 'msg',
        width: '60%',
        render: (value, row, index) => {
          return value;
          // return <a style="color:black;text-decoration:none;" href="javascript:void(0)" onClick="orderInfo('+index+')">{value}</a>;
        },
      },
      { title: '操作',
        dataIndex: 'opt',
        key: 'opt',
        width: '20%',
        render: (value, row, index) => {
          // const menu = (
          //   <Menu>
          //     <Menu.Item>
          //       <span>详情</span>
          //     </Menu.Item>
          //     <Menu.Item>
          //       <span onClick={this.deleteMsg.bind(this, row.gid)}>删除</span>
          //     </Menu.Item>
          //     <Menu.Item>
          //       <span onClick={this.readMsg.bind(this, row.gid)}>标记为已读</span>
          //     </Menu.Item>
          //   </Menu>
          // );
          // return (<Dropdown overlay={menu} trigger={['click']}>
          //   <a className="ant-dropdown-link" href="javascript:void(0)">
          //     更多<Icon type="down" />
          //   </a>
          // </Dropdown>);
          // 修改为直接显示详情-删除-标记为已读
          return (
            <div>
              <a href="javascript:void(0)" style={{pointer: 'cursor'}} onClick={this.showDetail.bind(this, row)}>详情</a>
              <a href="javascript:void(0)" style={{pointer: 'cursor', marginLeft: '20px'}} onClick={this.deleteMsg.bind(this, row.gid)}>删除</a>
              {row.isread === '0' ? <a href="javascript:void(0)" style={{pointer: 'cursor', marginLeft: '20px'}} onClick={this.readMsg.bind(this, row.gid)}>标记为已读</a> : ''}
            </div>
          );
        },
      }];

    return (
      <PageHeaderLayout>
        <div style={{height: 'auto', width: '100%', backgroundColor: 'white', padding: '10px 0px'}}>
          {/* <div style={{padding: '15px 0px'}}> */}
          {/* <label>消息类型：</label> */}
          {/* <Select style={{width: '130px'}} onChange={this.onChangeMsgType}> */}
          {/* <Option value='1' key = '1'>全部</Option> */}
          {/* </Select> */}
          {/* <label style={{marginLeft: '20px'}}>消息内容：</label> */}
          {/* <Input onChange={this.onChangeContent} style={{width: '150px'}}/> */}
          {/* <label style={{marginLeft: '20px'}}>通知时间：</label> */}
          {/* <RangePicker */}
          {/* style={{width: '320px'}} */}
          {/* showTime={{ hideDisabledOptions: true }} */}
          {/* onChange={this.onChangeTime} */}
          {/* defaultValue={[moment().add(-1, 'month'),moment()]} */}
          {/* format='YYYY-MM-DD HH:mm:ss' */}
          {/* ></RangePicker> */}
          {/* <Button type='primary' style={{marginLeft: '10px'}}>查询</Button> */}
          {/* <Button style={{marginLeft: '10px'}}>重置</Button> */}
          {/* </div> */}
          <Tabs onChange={this.onChangeTab} type="card">
            <TabPane tab="未读消息" key="0">
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    style={{margin: '0 8px'}}
                    onClick={() => this.deleteMsg('check')}
                    disabled={selectedRowKeys.length <= 1}
                    loading={loading}
                  >
                    删除
                  </Button>
                  <Button
                    onClick={() => this.readMsg('check')}
                    disabled={selectedRowKeys.length <= 1}
                    // loading={loading}
                  >
                    标记为已读
                  </Button>
                  <span style={{ marginLeft: 8 }}>
                    {selectedRowKeys.length > 1 ? `已勾选${selectedRowKeys.length}条信息` : ''}
                  </span>
                </div>
                <Table
                  columns={columns}
                  dataSource={this.props.msgNoRead.msgData}
                  scroll={{y: 1000}}
                  rowKey={(record) => record.gid}
                  pagination={{
                    total: this.props.msgNoRead.total,
                    showTotal: (total, range) => `当前第${range[0]}到${range[1]}条，共 ${total} 条数据`,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (pageno, pagesize) => {
                      this.pageno = pageno;
                      this.pagesize = pagesize;
                      this.onChangeTab();
                    },
                    onShowSizeChange: (pageno, pagesize) => {
                      this.pageno = pageno;
                      this.pagesize = pagesize;
                      this.onChangeTab();
                    },
                  }}
                  rowSelection={rowSelection}
                />
              </div>
            </TabPane>
            <TabPane tab="已读消息" key="1">
              <div style={{ marginBottom: 16 }}>
                <Button
                  style={{margin: '0 8px'}}
                  // onClick={this.start}
                  disabled={selectedRowKeys.length <= 1}
                  // loading={loading}
                >
                  删除
                </Button>
                <span style={{ marginLeft: 8 }}>
                  {selectedRowKeys.length > 1 ? `已勾选${selectedRowKeys.length}条信息` : ''}
                </span>
              </div>
              <Table
                columns={columns}
                dataSource={this.props.msgRead.msgData}
                scroll={{y: 1000}}
                rowKey={(record) => record.gid}
                pagination={{
                  total: this.props.msgRead.total,
                  showTotal: (total, range) => `当前第${range[0]}到${range[1]}条，共 ${total} 条数据`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (pageno, pagesize) => {
                    this.pageno = pageno;
                    this.pagesize = pagesize;
                    this.onChangeTab();
                  },
                  onShowSizeChange: (pageno, pagesize) => {
                    this.pageno = pageno;
                    this.pagesize = pagesize;
                    this.onChangeTab();
                  },
                }}
                rowSelection={rowSelection}
              />
            </TabPane>
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}
