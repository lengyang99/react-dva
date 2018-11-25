import React, { PureComponent } from 'react';
import moment from 'moment';
import {Calendar, Popover, Icon, Button, Select, Popconfirm, Checkbox, message} from 'antd';
import { connect } from 'dva';
import {getSchedulData} from '../../services/IntelliSche';
import styles from './index.less';
import ReadModal from './ReadModal';
import EditModal from './EditModal';

const Option = Select.Option;
@connect(({ IntelliSche, login}) => ({
  stationData: IntelliSche.stationData,
  user: login.user,
}))
export default class WorkCalendar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectDate: moment().format('YYYY-MM'),
      visible: {}, // 当前排班信息是否可见
      pbCheck: {}, // 当前排班信息是否选中
      show: false,
      pbGid: {},
      pbDate: [], // 日期
      pbData: {}, // 排班数据
      cachePbData: {}, // 暂存排班数据
    };
  }
    gid = 1 ;
    componentDidMount() {
      this.props.onRef(this);
      const stationId = this.props.stationId;
      const searchTime = moment().format('YYYY-MM');
      this.getSchedulData({stationId, searchTime});
    }
    componentWillUnmount() {
      this.props.onRef(null);
    }
    getSchedulData = ({stationId, searchTime}) => {
      getSchedulData({stationId, searchTime}).then((res) => {
        if (res.data) {
          const pbDate = [];
          const pbGid = {};
          const pbData = {};
          res.data.forEach(item => {
            const pbObject = [];
            pbDate.push(item.pbDate);
            pbGid[item.pbDate] = item.gid;
            item.bcList.forEach(item2 => {
              const pdList = {...item2};
              const userList = [];
              const userIds = [];
              pdList.zbrList.forEach(item3 => {
                userList.push(item3.userName);
                userIds.push(item3.userId);
              });
              pdList.zbrList = userList.toString();
              pdList.zbrIds = userIds.toString();
              pbObject.push(pdList);
            });
            pbData[item.pbDate] = pbObject;
          });
          const cachePbData = this.copy(pbData);
          message.success('查询排班记录成功');
          this.setState({
            pbDate,
            pbData,
            pbGid,
            cachePbData,
          });
        }
      });
    }
  // 复制对象
  copy = (data) => {
    const result = JSON.parse(JSON.stringify(data));
    return result;
  }
    // 弹框的可见性
    handleVisibleChange = (visible, value) => {
      const modalVisible = {...this.state.visible};
      modalVisible[value] = visible;
      this.setState({visible: modalVisible});
    }
    // 选择日期
    onSelect = (value) => {
      this.setState({selectDate: value.format('YYYY-MM-DD')});
    }
    showModal = () => {
      this.setState({ show: true});
    }
    // 切换时间
    onPanelChange = (value) => {
      const stationId = this.props.stationId;
      const searchTime = value.format('YYYY-MM');
      this.props.onDateChange(searchTime);
      this.getSchedulData({stationId, searchTime});
    }
    // 勾选当前排班
    onDateCheck = (e, value) => {
      e.stopPropagation();
      const pbCheck = {...this.state.pbCheck};
      pbCheck[value] = e.target.checked;
      this.setState({pbCheck});
    }
    // 勾选本周 或本月排班
    onDateCheckGroup = (value) => {
      const startOfMonth = moment().startOf('month').subtract(1, 'days');
      const endOfMonth = moment().endOf('month');
      const startOfWeek = moment().startOf('week').subtract(1, 'days');
      const endOfWeek = moment().endOf('week');
      const pbCheck = {...this.state.pbCheck};
      const pbDate = [...this.state.pbDate];
      pbDate.forEach(item => {
        if (value === 1) {
          pbCheck[item] = moment(item).isBetween(startOfWeek, endOfWeek); // 是否在本周
        } else if (value === 2) {
          pbCheck[item] = moment(item).isBetween(startOfMonth, endOfMonth); // 是否在本月
        } else if (value === 3) {
          pbCheck[item] = false;
        }
      });
      this.setState({pbCheck});
    }
    dateCellRender = (value) => {
      const weekDay = value.day();
      const selectDate = value.format('YYYY-MM-DD');
      const nowMonth = moment(this.state.date).month() + 1;
      const startOfMonth = moment().startOf('month').subtract(1, 'days');
      const endOfMonth = moment().endOf('month');
      const isInNowMonth = moment(selectDate).isBetween(startOfMonth, endOfMonth);
      const {pbDate, pbData, pbGid, pbCheck} = this.state;
      return (
        pbDate.includes(selectDate) ? <Popover
          content={<ReadModal data={pbData[selectDate]} />}
          title={<div style={{backgroundColor: 'RGB(22,155,213)', height: 40, lineHeight: '40px', padding: '2px 10px'}}>
              <span><Icon type="smile-o" style={{fontSize: 25}} /></span>
              <span style={{fontSize: 18, marginLeft: 10}}>{selectDate}</span>
            </div>}
          placement={weekDay !== 2 ? 'topRight' : 'topLeft'}
          overlayStyle={{width: 525}}
          trigger="hover"
          visible={this.state.visible[selectDate]}
          onVisibleChange={(visible) => { this.handleVisibleChange(visible, selectDate); }}
        >
          <div onClick={this.showModal} style={{display: 'inline-block', width: '100%', height: '60%'}}>
            {(pbData[selectDate] || []).map(item => (
              <div className={styles[`dutyStyle${pbData[selectDate].length}`]}>
                <label>{`${item.bcName}:`}</label>
                <label className={styles.spanMsg}>{item.bcType === '人员排班' ? item.zbrList : item.bzName}</label>
              </div>
          ))}
          </div>
          <div style={{display: this.props.showChecked && pbGid[selectDate] && isInNowMonth ? 'inline-block' : 'none', float: 'right', height: '20%'}}>
            <Checkbox onChange={(e) => { this.onDateCheck(e, selectDate); }} checked={pbCheck[selectDate]} />
          </div>
        </Popover> : <div onClick={() => { this.showModal(); }} style={{width: '100%', height: '100%'}} />
      );
    }
    // 保存
    handleOk = () => {
      let pbDate = [...this.state.pbDate];
      const pbData = {...this.state.pbData};
      const data = pbData[this.state.selectDate];
      let canSave = true;
      const bcIds = [];
      // 验证保存信息
      data.forEach(item => {
        if (item.bcId) {
          bcIds.push(item.bcId);
        }
        if (!item.bcId || item.bcId === '' || item.zbrList === '' || (item.bcType === '班组排班' && (!item.bzId || item.bzId === ''))) {
          canSave = false;
          message.warn('请将排班信息填写完整再保存');
        }
      });
      const s = `${bcIds.join(',')},`;
      for (let i = 0; i < bcIds.length; i += 1) {
        if (s.replace(`${bcIds[i]},`, '').indexOf(`${bcIds[i]},`) > -1) {
          canSave = false;
          message.warn('不能同时存在两个完全相同的班次');
          break;
        }
      }
      if (canSave) {
        if (!pbDate.includes(this.state.selectDate)) {
          pbDate = [...this.state.pbDate, ...[this.state.selectDate]];
        }
        const cachePbData = this.copy(pbData);
        this.setState({show: false, pbDate, cachePbData});
      }
    }
    // 重置还原
    handleReset = () => {
      const pbData = {...this.state.pbData};
      const cachePbData = {...this.state.cachePbData};
      pbData[this.state.selectDate] = cachePbData[this.state.selectDate];
      this.setState({pbData});
    }
    // 取消
    handleCancel = () => {
      this.handleReset();
      this.setState({show: false});
    }
    // 提交排班
    onSubmit = () => {
      const pbData = {...this.state.pbData};
      const pbGid = {...this.state.pbGid};
      const pbDate = [...this.state.pbDate];
      const subData = [];
      pbDate.forEach(item => {
        const bcList = pbData[item];
        const gid = pbGid[item] || null;
        const bcData = [];
        bcList.forEach(item2 => {
          const {zbrIds, zbrList, monitorName, monitorId, bzName, bcName, bcType, bcId, bzId, bcStartTime, bcEndTime} = item2;
          const userIds = zbrIds.split(',');
          const userName = zbrList.split(',');
          const zbrList2 = [];
          userIds.forEach((item3, idx) => {
            zbrList2.push({
              userId: item3,
              userName: userName[idx],
            });
          });
          bcData.push({
            bcName,
            bcType,
            bcId,
            bcStartTime,
            bcEndTime,
            bzName: bzName || null,
            bzId: bzId || null,
            monitorName: monitorName || null,
            monitorId: monitorId || null,
            zbrList: zbrList2,
          });
        });
        const params = {
          stationId: this.props.stationId,
          ecode: this.props.user.ecode,
          pbDate: item,
          bcList: bcData,
        };
        if (gid) {
          Object.assign(params, {gid});
        }
        subData.push(params);
      });
      this.props.dispatch({
        type: 'IntelliSche/addSchedulData',
        payload: {items: JSON.stringify(subData)},
        callback: (res) => {
          if (res.success) {
            message.success(res.msg);
            this.getSchedulData({stationId: this.props.stationId, searchTime: moment().format('YYYY-MM')});
          } else {
            message.warn(res.msg);
          }
        },
      });
      console.log(subData, '提交上去的数据哦');
    }
    // 排班记录
    onPdDataChange = (data) => {
      const pbData = {...this.state.pbData};
      pbData[this.state.selectDate] = data;
      this.setState({pbData});
    }
    render() {
      const {selectDate, pbData} = this.state;
      const bcData = [{gid: `newPb_${this.gid += 1}`, bcType: '人员排班', zbrList: '', bcName: '', bcStartTime: '', bcEndTime: ''}];
      const bzData = [{gid: `newPb_${this.gid += 1}`, bcType: '班组排班', bzName: '', zbrList: '', bcName: '', bcStartTime: '', bcEndTime: ''}];
      const emptyData = this.props.bcType === '班组排班' ? bzData : bcData;
      return (
        <div className={styles.calendar}>
          <Calendar
            dateCellRender={this.dateCellRender}
            onPanelChange={this.onPanelChange}
            onSelect={this.onSelect}
            mode=""
          />
          <EditModal
            {...this.props}
            selectDate={selectDate}
            data={pbData[selectDate] || emptyData}
            handleChangePdData={(data) => { this.onPdDataChange(data); }}
            show={this.state.show}
            handleOk={this.handleOk}
            handleReset={this.handleReset}
            handleCancel={this.handleCancel}
          />
          <div style={{display: 'inline-block', width: '100%', margin: 10}}>
            <Popconfirm title="您确定要提交表单"onConfirm={() => { this.onSubmit(); }}>
              <Button type="primary" style={{marginRight: 10, float: 'right'}}>提交</Button>
            </Popconfirm>
          </div>
        </div>
      );
    }
}
