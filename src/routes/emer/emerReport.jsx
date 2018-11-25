import React from 'react';
import {connect} from 'dva';
import {Button, Select, Input, Table, message} from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';

import styles from './css/emerReport.css';

const Option = Select.Option;

@connect(state => ({
  user: state.login.user,
}))

export default class EmerReport extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderListData: [],
      emerHandleProcessInfo: [],
      emerReportData: null,
    };
    this.openCreateEmerReport();
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 获取应急处置过程中发布的指令
  handleGetHandleProcessOrder = (model) => {
    let data = {};
    data.alarmId = model.alarmId || '';
    this.props.dispatch({
      type: 'emer/getEmerOrderList',
      payload: data,
      callback: (res) => {
        this.setState({
          orderListData: res.data,
        });
      },
    });
  }

  // 获取应急处置过程信息
  handleGetHandleProcessInfo = (model) => {
    let data = {};
    data.alarmId = model.alarmId || '';
    this.props.dispatch({
      type: 'emer/getEmerHandleProcessRecord',
      payload: data,
      callback: (res) => {
        this.setState({
          emerHandleProcessInfo: res.data,
        });
      },
    });
  }

  // 1.应急报告：基本信息
  handleGetEmerReportBaseInfo = (model, index) => {
    return (
      <div>
        <div className={styles.blockTitle}>事故信息</div>
        <div className={styles.row}>
          <span className={styles.block}>接警时间：
            <span>{model.receiveTime || ''}</span>
          </span>
          <span className={styles.block}>事故类型：
            <span>
              <Input type="text" defaultValue={model.typeDesc} style={{width: 100}} />
            </span>
          </span>
          <span className={styles.block}>接警人：
            <span>
              <Input type="text" defaultValue={model.alarmReceiver} style={{width: 100}} />
            </span>
          </span>
          <span className={styles.block}>接警人电话：
            <span>
              <Input type="text" defaultValue={model.alarmReceiverTel} style={{width: 100}} />
            </span>
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.block}>事故原因：
            <span>
              <Input type="text" defaultValue={model.reason} style={{width: 625}} />
            </span>
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.block}>事故位置：
            <span>
              <Input type="text" defaultValue={model.incidentAddr} style={{width: 200}} />
            </span>
          </span>
          <span className={styles.block}>受伤人数：
            <span>
              <Input type="text" defaultValue={model.injuredNum} style={{width: 70}} />
            </span>
          </span>
          <span className={styles.block}>死亡人数：
            <span>
              <Input type="text" defaultValue={model.deathNum} style={{width: 70}} />
            </span>
          </span>
          <span className={styles.block}>天气：
            <span>
              <Input type="text" defaultValue={model.weather} style={{width: 100}} />
            </span>
          </span>
        </div>
      </div>
    );
  }

  // 2.应急报告：提醒用户注意事项
  handleGetUserNotice = (model, index) => {
    if (!model.reportGroups || !model.reportGroups[index]) {
      return;
    }
    model.setEmerReportSelectValue = this.setEmerReportSelectValue;
    model.setEmerReportInputValue = this.setEmerReportInputValue;
    let itemArr = model.reportGroups[index].items;
    const content = [];
    let rowComp = [];
    let gi = 100;
    itemArr.forEach((item, ii) => {
      if (item.datatype === 'text') {
        if (item.datavalues) {
          let opArr = item.datavalues.split('/');
          rowComp.push(
            <span className={styles.block2} key={ii}>{item.operitem}：
              <Select
                onChange={(val) => {
                  model.setEmerReportSelectValue(item.operitem, val, index);
                }}
                defaultValue={-1}
                style={{width: 50, display: 'inline-block'}}
              >
                <Option value={-1}></Option>
                <Option value={opArr[0]}>{opArr[0]}</Option>
                <Option value={opArr[1]}>{opArr[1]}</Option>
              </Select>
            </span>
          );
        } else {
          rowComp.push(
            <span className={styles.block2} key={ii}>{item.operitem}：
              <Input
                type={item.datatype}
                defaultValue=""
                style={{width: 100}}
                onBlur={(e) => {
                model.setEmerReportInputValue(item.operitem, e);
              }}
              />
            </span>
          );
        }
        if (rowComp.length === 2 || item.operitem.length > 18) {
          content.push(<div
            key={`gi${gi + ii}`}
            className={styles.row}
          >
            {rowComp}
          </div>);
          rowComp = [];
        }
      }
    });
    return (
      <div>
        <div className={styles.blockTitle}>{model.reportGroups[index].opergroup}</div>
        <div>
          {
            content
          }
        </div>
      </div>
    );
  }

  // 设置应急报告中的下拉项值
  setEmerReportSelectValue = (name, value, index) => {
    let reportGroup = this.state.emerReportData.reportGroups[index].items;
    for (let i = 0; i < reportGroup.length; i += 1) {
      if (name === reportGroup[i].operitem) {
        this.state.emerReportData.reportGroups[index].items[i].operitemvalue = value;
      }
    }
  }

  // 设置应急报告中的输入项值
  setEmerReportInputValue = (name, e) => {
    this.setEmerReportSelectValue(name, e.target.value, 1);
  }

  // 生成应急报告
  openCreateEmerReport = () => {
    if (this.props.emerEvent) {
      this.props.dispatch({
        type: 'emerLfMap/getEmerReport',
        payload: {
          alarmid: this.props.emerEvent.alarmId || '',
        },
        callback: (res) => {
          this.setState({
            emerReportData: res.data,
          });
          this.handleGetHandleProcessInfo(res.data);
          this.handleGetHandleProcessOrder(res.data);
        },
      });
    }
  };

  // 保存应急报告
  handleSaveEmerReport = () => {
    const { onCancel, emerEvent } = this.props;
    let fd = new FormData();
    fd.append('emerReport', JSON.stringify(this.state.emerReportData));
    fd.append('alarmId', emerEvent.alarmId || '');
    this.props.dispatch({
      type: 'emer/addEmerReport',
      payload: fd,
      callback: (res) => {
        // 保存成功后关闭应急报告窗口
        onCancel();
        message.info(res.msg);
      },
    });
  }

  render = () => {
    const {onCancel, emerEvent} = this.props;
    let orderListColumns = [{
      title: '组织',
      dataIndex: 'organizationName',
      width: 210,
    }, {
      title: '人员',
      dataIndex: 'receiver',
      width: 120,
    }, {
      title: '通知时间',
      dataIndex: 'sendTime',
      width: 120,
    }];
    return (
      <Dialog
        title="应急报告"
        width={750}
        onClose={onCancel}
        position={{
          top: 85,
          left: 380,
        }}
      >
        <div style={{height: 410, overflow: 'auto'}}>
          {this.handleGetEmerReportBaseInfo(this.state.emerReportData || {}, -1)}
          {this.handleGetUserNotice(this.state.emerReportData || {}, 0)}
          {this.handleGetUserNotice(this.state.emerReportData || {}, 1)}
          <div>
            <div className={styles.blockTitle}>人员通知情况</div>
            <Table
              rowKey={(record) => record.uid}
              bordered
              columns={orderListColumns}
              dataSource={this.state.orderListData}
              pagination={false}
              scroll={{x: false, y: 120}}
            />
          </div>
          <div>
            <div className={styles.blockTitle}>应急响应过程记录</div>
            <div>
              {
                this.state.emerHandleProcessInfo.map((item, index) => {
                  return (
                    <div className={styles.record}>
                      <div style={{display: 'inline-block'}}>
                        {`【${item.handler}-${item.handleTime}】 `}
                      </div>
                      <div
                        style={{
                          display: 'inline-block',
                          maxWidth: '75%',
                          verticalAlign: 'top',
                        }}
                      >
                        <span>{item.handleContent} 。</span></div>
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div style={{textAlign: 'right'}}>
            <Button type="primary" size="small" onClick={this.handleSaveEmerReport}>保存</Button>
          </div>
        </div>
      </Dialog>
    );
  }
}
