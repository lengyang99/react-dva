import React, { PureComponent } from 'react';
import { Button, Select, Input, DatePicker, Icon, TreeSelect, message } from 'antd';
import moment from 'moment';
import {stringify} from 'qs';
import fetch from 'dva/fetch';
import { getCurrTk } from '../../../utils/utils.js';
import styles from './index.less';
const TreeNode = TreeSelect.TreeNode;
const Option = Select.Option;
const MonthPicker = DatePicker.MonthPicker;
const FormatStr = 'YYYY-MM';
const defaultState = {
  stationId: '全部', // 站点id
  time: moment(), // 日期
  likeValue: '', // 关键字：操作人
  func: '', // 作业类型
};
export default class SearchPanel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultState,
      expand: false,
    };
  }
  handleStationChange = (stationId) => {
    this.setState({
      stationId,
    });
  }
  handleDataChange = (time) => {
    this.setState({
      time,
    });
  }
  handleFunctionChange = (func) => {
    if(!func){
      this.setState({
        func,
      });
    }
  }
  handleLikeValueChange = (e) => {
    this.setState({
      likeValue: e.target.value,
    });
  }
  // 展开
  expand = () => {
    this.setState({expand: !this.state.expand});
  }
  // 获取搜索参数
  getSearchValue = () => {
    const { stationId, time, likeValue, func } = this.state;
    const params = {
      stationid: stationId === '全部' ? '' : stationId,
      condition: likeValue,
      taskType: func,
      date: time ? time.format(FormatStr) : moment().format(FormatStr),
    };
    return params;
  }
  // 搜索
  onSearch = () => {
    this.props.handleOnSearch(this.getSearchValue());
  }
  // 重置
  onRest = () => {
    this.setState(defaultState);
    this.props.handleOnRest();
  };

  // 填充数据至区域
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item}>
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item} />;
    });
  };

  onSelectTask = (value, node) => {
    if (value !== '' && (node !== undefined)) {
      const {dataRef} = node.props;
      if (dataRef.children && dataRef.children.length >0 && value === dataRef.functionKey) {
        message.error(`请选择 ${dataRef.functionName} 下的任务类型！`);
        return;
      }
      this.setState({
        func: value,
      });
    }
  };
  downLoadData =() => {
    this.props.loading(true)
    const url = `${window.location.origin}/proxy/statistics/maintenanceTaskReportExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk()})}`
    let header = {
        "Content-Type": "application/json;charset=UTF-8",
    };
    location.href = url;
    return fetch(url, {
            method: 'GET',
            headers: header,
        }).then((response) => response.blob())
        .then((responseData) => {
            console.log('res:',url, responseData);
            if(responseData){
              this.props.loading(false)
            }
        })
        .catch( (err) => {
            console.log('err:',url, err);
        });
    };
  render() {
    const { stationData, functionData, pageno, pagesize } = this.props;
    const { expand, time} = this.state;
    const stationOptions = (stationData || []).map(item =>
      (<Option key={item.gid}>
        {item.locName}
      </Option>));
    const funcOptions = (functionData || []).map(item =>
      (<Option key={item.functionKey}>
        {item.functionName}
      </Option>));
    return (
      <div className={styles.panel}>
        <div>
          <div className={styles['field-block']}>
            <label>站点：</label>
            <Select
              className={styles.select}
              value={this.state.stationId}
              onChange={this.handleStationChange}
            >
              <Option key="全部" value="全部">全部</Option>
              {stationOptions || null}
            </Select>
          </div>
          <div className={styles['field-block']}>
            <label>时间：</label>
            <MonthPicker
              className={styles.rangePicker}
              value={time ? moment(time, FormatStr) : moment()}
              onChange={this.handleDataChange}
              allowClear
            />
          </div>
          <div
            className={styles['field-block']}
            style={{
              position: 'relative',
              top: expand ? 37 : 0,
            }}
          >
            <Button
              type="primary"
              className={styles.button}
              onClick={this.onSearch}
            >查询</Button>
            <Button
              onClick={this.onRest}
            >重置</Button>
            <Button
              type="primary"
              className={styles.button}
            >
              <Icon type="download" />
              {/* <a href={`${window.location.origin}/proxy/statistics/maintenanceTaskReportExportExcel?${stringify({...this.getSearchValue(), ecode: this.props.user.ecode, pageno: 1, pagesize: 1000, token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a> */}
              <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
            </Button>
            <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.expand}>
              {expand ? '收起' : '展开'}<Icon type={expand ? 'up' : 'down'} />
            </a>
          </div>
        </div>
        <div style={{ display: !expand ? 'none' : 'inline-block' }}>
          <div className={styles['field-block3']}>
            <label>任务类型：</label>
            <TreeSelect
              style={{ width: 160 }}
              allowClear              
              value={this.state.func}
              dropdownStyle={{ maxHeight: 180, overflow: 'auto' }}
              placeholder="请选择任务类型"
              treeDefaultExpandAll
              onChange={this.handleFunctionChange}
              onSelect={this.onSelectTask}
            >
              {(functionData || []).map((item) => {
                if(item.children && item.children.length > 0){
                  return (
                    <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item}>
                      {this.renderTreeNodes(item.children)}
                    </TreeNode>
                  )
                }
                return <TreeNode title={item.functionName} key={item.gid} value={item.functionKey} dataRef={item} />
              })}
            </TreeSelect>
          </div>
          <div className={styles['field-block3']}>
            <label>搜索： </label>
            <Input
              className={styles.input}
              value={this.state.likeValue}
              placeholder="巡线员姓名"
              onChange={this.handleLikeValueChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

