import React, { Component } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import { Select, Button, Radio, message, Modal} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './index.less';
import WorkCalendar from './WorkCalendar';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const confirm = Modal.confirm;
@connect(({ IntelliSche}) => ({
  stationData: IntelliSche.stationData,
  cacheBcData: IntelliSche.cacheBcData,
  bcData: IntelliSche.bcData,
  bzData: IntelliSche.bzData,
  userData: IntelliSche.userData,
}))
export default class IntelliSche extends Component {
  state={
    selectd: '班组排班',
    showChecked: false,
    staId: '',
    month: moment().add(1, 'months').format('YYYY-MM'),
    date: moment().format('YYYY-MM'),
  }
  calendar = null;
  componentDidMount() {
    this.props.dispatch({
      type: 'IntelliSche/getStationData',
      callback: (data) => {
        if (data && data.length !== 0) {
          const defaultStaId = data[0].gid;
          this.getPbData(defaultStaId);
          this.setState({staId: defaultStaId});
        }
      },
    });
  }
  // 获取 班次 班组 人员信息
  getPbData = (stationId) => {
    this.props.dispatch({
      type: 'IntelliSche/getBcData',
      payload: {stationId},
    });
    this.props.dispatch({
      type: 'IntelliSche/getBzData',
      payload: {stationId},
    });
    this.props.dispatch({
      type: 'IntelliSche/getUserData',
      payload: {stationId},
    });
  }
  onChangeType = (item) => {
    this.setState({selectd: item.name});
  }
  onSelectStation = (value) => {
    this.setState({staId: value});
  }
  // 查询
  onSearch = () => {
    if (this.calendar) {
      const stationId = this.state.staId;
      const searchTime = this.state.date;
      this.calendar.getSchedulData({stationId, searchTime});
    }
  }
  // 复制
  copyDate = () => {
    const {showChecked, staId, month} = this.state;
    if (showChecked) {
      const pbCheck = {...this.calendar.state.pbCheck};
      const pbCheckData = Object.values(pbCheck);
      const needCopy = pbCheckData.find(item => item === true);
      const copyDate = [];
      const {entries} = Object;
      for (const [key, value] of entries(pbCheck)) {
        if (value) {
          copyDate.push(key);
        }
      }
      if (this.calendar && !needCopy) {
        message.warn('请选择所要复制的记录');
      } else if (this.calendar) {
        const copyDays = copyDate.toString();
        const params = {stationId: staId, copyDays, toMonth: month};
        this.props.dispatch({
          type: 'IntelliSche/canCopy',
          payload: params,
          callback: (res) => {
            if (res.data && res.data.length === 0) {
              this.copySchedulData(params);
            } else if (res.data && res.data.length !== 0) {
              const months = res.data.toString();
              confirm({
                title: `${months}已存在排班记录，请重新选择`,
                onOk() {
                },
                onCancel() {},
              });
            }
          },
        });
      }
    }
    this.setState({showChecked: true});
  }
  copySchedulData = (params) => {
    this.props.dispatch({
      type: 'IntelliSche/copySchedulData',
      payload: params,
      callback: (res) => {
        if (res.success) {
          message.success('复制成功');
          this.cancelCopy();
        } else {
          message.warn(res.msg);
        }
      },
    });
  }
  // 取消复制
  cancelCopy = () => {
    this.setState({showChecked: false});
    if (this.calendar) {
      this.calendar.onDateCheckGroup(3);
    }
  }
  // 单选 本周 本月
  onCopyDateChange = (e) => {
    const value = e.target.value;
    if (this.calendar) {
      this.calendar.onDateCheckGroup(value);
    }
  }
  onDateChange = (date) => {
    this.setState({date, month: moment(date).add(1, 'months').format('YYYY-MM')});
  }
  onChangeMonth = (value) => {
    this.setState({month: value});
  }
  render() {
    const stationOptions = (this.props.stationData || []).map(item => (
      <Option key={item.gid} value={item.gid}>{item.name}</Option>
    ));
    const months = [];
    const nowMonth = moment(this.state.date).month() + 1;
    for (let i = nowMonth + 1, j = 1; i <= 12; i += 1, j += 1) {
      const nextMonth = moment(this.state.date).add(j, 'months').format('YYYY-MM');
      months.push(<Option value={nextMonth}>{`${i}月`}</Option>);
    }
    const datas = [{name: '班组排班'}, { name: '人员排班'}];
    const WorkType = ({data, value, onChange}) => {
      const items = data.map((item, i) =>
        (<label
          className={styles['state-item']}
          style={{
                 color: item.name === (value || this.state.selectd) ? '#1C8DF5' : 'default', marginLeft: 10, cursor: 'pointer',
               }}
          onClick={() => {
                 onChange(item);
               }}
          key={item.name}
        ><span>{`${item.name}${i === data.length - 1 ? '' : '  /'}`}</span></label>));
      return (
        <div style={{display: 'inline-block'}}>
          {
            items
          }
        </div>
      );
    };
    return (
      <PageHeaderLayout>
        <div>
          <div className={styles['field-block']}>
            <label>站点: </label>
            <Select value={this.state.staId} className={styles.select} onSelect={this.onSelectStation}>
              {stationOptions}
            </Select>
          </div>
          <Button type="primary" onClick={this.onSearch.bind(this)}>查询</Button>
          <Button type="primary" style={{marginLeft: 10, marginRight: 10}} onClick={() => { this.copyDate(); }}>{this.state.showChecked ? '开始复制' : '复制'}</Button>
          {this.state.showChecked ?
            <div className={styles['field-block']}>
              <RadioGroup onChange={(e) => this.onCopyDateChange(e)}>
                <Radio value={1}>本周</Radio>
                <Radio value={2}>本月</Radio>
              </RadioGroup>
              <span style={{marginRight: 10}}>到</span>
              <Select style={{marginRight: 10, width: 80}} onChange={this.onChangeMonth} value={this.state.month}>
                {months}
              </Select>
              <Button type="primary" style={{marginLeft: 10, marginRight: 10}} onClick={this.cancelCopy}>取消复制</Button>
            </div>
        : null}
        </div>
        <WorkType data={datas} value={this.state.selectd} onChange={(item) => { this.onChangeType(item); }} />
        <div>
          {this.state.staId !== '' ? <WorkCalendar
            {...this.props}
            onRef={(ref) => { this.calendar = ref; }}
            onDateChange={(date) => { this.onDateChange(date); }}
            bcType={this.state.selectd}
            stationId={this.state.staId}
            showChecked={this.state.showChecked}
          /> : null}
        </div>
      </PageHeaderLayout>
    );
  }
}
