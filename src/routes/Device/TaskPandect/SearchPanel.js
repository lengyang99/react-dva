import React, { PureComponent } from 'react';
import { Button, Select, Input, Icon, DatePicker } from 'antd';
import moment, { isMoment } from 'moment';
import update from 'immutability-helper';
import styles from './index.less';

const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      timeValue: null, // 创建时间
      expand: true,
    };
  }
  handleSearchParamsChange = (params, type) => {
    const newParams = update(this.props.searchTaskParams, {$merge: params});
    if (type === 0) {
      this.props.dispatch({
        type: 'device/searchTaskParamsSave',
        payload: newParams,
      });
    }
    if (type === 1) {
      this.props.queryTasks(params);
    }
  }
  timeChangeHandle = (st) => {
    let startTime = '';
    let endTime = '';
    switch (st.name) {
      case 'week':
        startTime = `${moment().startOf('week').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().endOf('week').format('YYYY-MM-DD')} 23:59:59`;
        break;
      case 'month':
        startTime = `${moment().startOf('month').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().endOf('month').format('YYYY-MM-DD')} 23:59:59`;
        break;
      case 'year':
        startTime = `${moment().startOf('year').format('YYYY-MM-DD')} 00:00:00`;
        endTime = `${moment().endOf('year').format('YYYY-MM-DD')} 23:59:59`;
        break;
      default:
        startTime = null;
        endTime = null;
    }
    this.setState({
      timeValue: st.name,
    });
    this.handleSearchParamsChange({ createTime1: startTime, createTime2: endTime }, 1);
  }
  handleTask = (action) => {
    this.props.handleEditTask(action);
  }
  // 搜索
  onSearch = () => {
    this.props.handleOnSearch(1);
  }
  // 重置
  onRest = () => {
    this.setState({timeValue: null});
    this.props.handleOnSearch(0);
  }
  // 展开
  expand = () => {
    this.setState({ expand: !this.state.expand });
  }
  // 任务导出
  handleExportTask = () => {
    this.props.handleExportTask();
  }
  render() {
    const { stationData, searchTaskParams, activitiCode, workStatus, isGsh, workObjectType} = this.props;
    const {startTime, endTime, workOrderStatus, stationId, others, status} = searchTaskParams || {};
    const { expand, timeValue} = this.state;
    const msg = [
      '任务编号、设备编码、设备名称、地址、处理人',
      '任务编号、设备编码、体育馆、客户号、合同号、表钢号、地址、处理人',
      '任务编号、客户名称、客户号、地址、处理人',
    ];
    const mode = isGsh ? workObjectType === 1 ? 1 : 2 : 0;
    const time1 = startTime ? moment(startTime) : null;
    const time2 = endTime ? moment(endTime) : null;
    const State = ({ datas, value, onChange }) => {
      const items = datas.map(item =>
        (<label
          className={styles['state-item']}
          style={{
            color: item.name === value ? '#1C8DF5' : 'default',
          }}
          onClick={() => {
            onChange(item);
          }}
          key={item.name}
        ><span>{item.alias}</span></label>));
      return (
        <div style={{ display: 'inline-block' }}>
          {
            items
          }
        </div>
      );
    };
    const selectValues = [
      { alias: '未完成', name: '0' },
      { alias: '已完成', name: '1' },
      { alias: '已超期', name: '2' },
      { alias: '超期已完成', name: '3' },
    ];
    const timeValues = [
      { alias: '全部', name: null },
      { alias: '本周', name: 'week' },
      { alias: '本月', name: 'month' },
      { alias: '本年', name: 'year' },
    ];
    const options = (stationData || []).map(item =>
      <Option key={item.gid}>{item.locName}</Option>);
    const statusOptions = (selectValues || []).map(item =>
      <Option key={item.name}>{item.alias}</Option>);
    const workStatusOptions = (workStatus || []).map(item =>
      <Option key={item.state}>{item.statename}</Option>);
    return (
      <div className={styles.panel} >
        <div>
          <div className={styles['field-block']}>
            <label><b>创建时间:</b></label>
            <State
              datas={timeValues}
              onChange={(d) => {
                this.timeChangeHandle(d);
              }}
              value={timeValue}
            />
          </div>
          {activitiCode ? <div className={styles['field-block']}>
            <label>工单状态：</label>
            <Select
              className={styles.select}
              value={workOrderStatus}
              onChange={(value) => {
                this.handleSearchParamsChange({workOrderStatus: value, activitiCode}, 1);
              }}
            >
              <Option key={null} value={null} >全部</Option>
              {workStatusOptions}
            </Select>
          </div> : null}
          <div className={styles['field-block']}>
            <label>完成状态：</label>
            <Select
              className={styles.select2}
              value={status}
              onChange={(value) => {
                  this.handleSearchParamsChange({status: value}, 1);
                }}
            >
              <Option key={null} value={null} >全部</Option>
              {statusOptions}
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>所属组织：</label>
            <Select
              className={styles.select}
              value={stationId}
              onChange={(value) => this.handleSearchParamsChange({stationId: value}, 0)}
            >
              <Option key={null} value={null} >全部</Option>
              {options}
            </Select>
          </div>
          <div
            className={styles['field-block3']}
            style={{
              position: 'relative',
              top: expand ? 0 : 0,
            }}
          >
            <Button
              className={styles.button}
              type="primary"
              onClick={this.onSearch}
            >查询</Button>
            <Button
              onClick={this.onRest}
            >重置</Button>
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.expand}>
              {expand ? '收起' : '展开'}<Icon type={expand ? 'up' : 'down'} />
            </a>
          </div>
        </div>
        <div style={{ display: !expand ? 'none' : 'inline-block' }}>
          <div className={styles['field-block2']}>
            <label>要求完成时间：</label>
            <RangePicker
              className={styles.range}
              format="YYYY-MM-DD HH:mm"
              showTime={{defaultValue: [moment('00:00', 'HH:mm'), moment('23:59', 'HH:mm')]}}
              value={[time1, time2]}
              onChange={(time) => {
                       const stime = isMoment(time[0]) ? time[0].format('YYYY-MM-DD HH:mm') : null;
                       const etime = isMoment(time[1]) ? time[1].format('YYYY-MM-DD HH:mm') : null;
                       this.handleSearchParamsChange({startTime: stime, endTime: etime}, 0);
                     }}
            />
          </div>
          <div className={styles['field-block2']}>
            <label>搜索：</label>
            <Input
              className={styles.input}
              placeholder={msg[mode]}
              value={others}
              onChange={(e) => this.handleSearchParamsChange({others: e.target.value}, 0)}
            />
          </div>
        </div>
        <div style={{marginLeft: 15}}>
          <Button type="primary" style={{ marginLeft: 5 }} onClick={() => this.handleTask('删除')}>删除</Button>
          <Button type="primary" style={{display: activitiCode ? 'none' : 'inline-block', marginLeft: 10 }} onClick={() => this.handleTask('编辑')}>编辑</Button>
          <Button type="primary" style={{display: activitiCode ? 'none' : 'inline-block', marginLeft: 10 }} onClick={() => this.handleExportTask()}>导出</Button>
        </div>
      </div>
    );
  }
}
export default SearchPanel;

