import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs, Button, Row, Col, Input, Select, Checkbox, InputNumber} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import styles from '../index.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
// 液位预警
const earlyWarning = {
  smellyMachineId: '',
  smellyMachineName: '',
  warnLevel: '',
  operatorId: '',
  operatorName: '',
  remark: '',
  ecode: '',
};
@connect(({ odorization, login, station }) => ({
  detailDtata: odorization.detailDtata,
  odorMacData: odorization.odorMacData,
  user: login.user,
  groups: station.groups,
  eqUnit: station.eqUnit
}))
export default class OdorManage extends Component {
  state = {
    ecode: "",
    operatorName: "",
    operatorId: "",
    eqName: "全部",
    fillUp: {}, //补液
    earlyWarning: {}, // 液位预警
    mintain: {},    //管路维护
  };
  componentDidMount() {
    const { dispatch, user } = this.props;
    this.setState({
      ecode: user.ecode,
      operatorName: user.trueName,
      operatorId: user.gid
    });
    // 查询加臭机
    dispatch({
      type: "odorization/queryOdorMacList",
      payload: {
        ecode: user.ecode || ""
      }
    });
  }
  changeAreaHandler = val => {
    // 查询设备；
    this.props.dispatch({
      type: "station/queryCheckEq",
      payload: { areaId: val },
      callback: data => {
        this.setState({ eqName: "全部" });
      }
    });
  };
  changeUnitHandler = (val, node) => {
    const { dataRef } = node.props;
    this.setState({
      eqName: dataRef.name
    });
  };
  handleTabChange = key => {
    if (key === "3") {
      // 查询区域
      this.props.dispatch({
        type: "station/queryGroups"
      });
    }
  };
  //加臭机选择
  odorChangeHandler = (val, fileName, node) => {
    if (fileName === "earlyWarning") {
      const { dataRef } = node.props;
      const params = { ...this.state.earlyWarning };
      params.smellyMachineId = val;
      params.smellyMachineName = dataRef.name;

      this.setState({
        earlyWarning: params
      });
    }
  };
  //液位
  numHandler = (val, fileName) => {
    if (fileName === "earlyWarning") {
      const params = { ...this.state.earlyWarning };
      params.warnLevel = val;
      this.setState({
        earlyWarning: params
      });
    }
  };
  //备注
  remarkHandler = (val, fileName) => {
    if (fileName === "earlyWarning") {
      const params = { ...this.state.earlyWarning };
      params.remark = val;
      this.setState({
        earlyWarning: params
      });
    }
  };
  submitHandler = fileName => {
    // const { dispatch } = this.props;
    if (fileName === "earlyWarning") {
      const { earlyWarning: {smellyMachineId, smellyMachineName, warnLevel, remark}, operatorId, operatorName, ecode } = this.state;
      const params = { gid: "", smellyMachineId, smellyMachineName, warnLevel, remark, operatorId, operatorName, ecode };
      this.props.dispatch({
        type: "odorization/newEarlyWarning",
        payload: params
      });
    }
  };
  render() {
    const { pageno, pagesize } = this.state;
    const { groups, eqUnit, odorMacData } = this.props;
    console.log(this.state, "state☆");
    return (
      <PageHeaderLayout>
        <Tabs defaultActiveKey="1" onChange={this.handleTabChange}>
          <TabPane tab="加臭机补液" key="1">
            <div className={styles.fillUp}>
              <h2 style={{ marginBottom: 10, textAlign: "center" }}>补液</h2>
              <div style={{ float: "right", marginBottom: 10 }}>
                {moment(new Date()).format("YYYY.MM.DD HH:mm")}
              </div>
              <div style={{ clear: "both" }} />
              <div style={{ marginBottom: 20 }}>
                <label>加臭机：</label>
                <Select
                  defaultValue="加臭机1"
                  style={{ width: 120, marginLeft: 14 }}
                >
                  {odorMacData &&
                    odorMacData.map(item => (
                      <Option key={item.gid} value={item.gid} dataRef={item}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>本次液位：</label>
                <InputNumber style={{ width: 120 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>上次液位：</label>
                <InputNumber style={{ width: 120 }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>操作人：</label>
                <Input
                  disabled
                  style={{ width: 120, marginLeft: 14 }}
                  value={this.state.operatorName}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  onClick={this.submitHandler}
                  style={{ marginRight: 20 }}
                >
                  取消
                </Button>
                <Button type="primary" onClick={this.submitHandler}>
                  提交
                </Button>
              </div>
            </div>
          </TabPane>
          <TabPane tab="加臭机液位预警" key="2">
            <div className={styles.earlyWarning}>
              <h2 style={{ marginBottom: 10, textAlign: "center" }}>
                液位预警
              </h2>
              <div style={{ float: "right", marginBottom: 10 }}>
                {moment(new Date()).format("YYYY.MM.DD HH:mm")}
              </div>
              <div style={{ clear: "both" }} />
              <div style={{ marginBottom: 20 }}>
                <label>加臭机：</label>
                <Select
                  defaultValue="请选择加臭机"
                  style={{ width: 120 }}
                  onSelect={(val, node) =>
                    this.odorChangeHandler(val, "earlyWarning", node)
                  }
                >
                  {odorMacData &&
                    odorMacData.map(item => (
                      <Option key={item.gid} value={item.gid} dataRef={item}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>液位：</label>
                <InputNumber
                  style={{ width: 120, marginLeft: 14 }}
                  onChange={val => {
                    this.numHandler(val, "earlyWarning");
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>操作人：</label>
                <Input
                  disabled
                  style={{ width: 120 }}
                  value={this.state.operatorName}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <p>备注：</p>
                <TextArea
                  style={{ width: 180 }}
                  autosize
                  onChange={e => {
                    this.remarkHandler(e.target.value, "earlyWarning");
                  }}
                />
              </div>
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  onClick={this.submitHandler}
                  style={{ marginRight: 20 }}
                >
                  取消
                </Button>
                <Button
                  type="primary"
                  onClick={() => this.submitHandler("earlyWarning")}
                >
                  提交
                </Button>
              </div>
            </div>
          </TabPane>
          <TabPane tab="管路维护" key="3">
            <div className={styles.mintain}>
              <h2 style={{ marginBottom: 10, textAlign: "center" }}>
                管路维护
              </h2>
              <div style={{ float: "right", marginBottom: 10 }}>
                {moment(new Date()).format("YYYY.MM.DD HH:mm")}
              </div>
              <div style={{ clear: "both" }} />
              <div style={{ marginBottom: 20 }}>
                <label>加臭机：</label>
                <Select defaultValue="加臭机1" style={{ width: 120 }}>
                  {odorMacData &&
                    odorMacData.map(item => (
                      <Option key={item.gid} value={item.gid} dataRef={item}>
                        {item.name}
                      </Option>
                    ))}
                </Select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "inline-block", marginRight: 10 }}>
                  <label>管路：</label>
                  <Select
                    defaultValue="全部"
                    style={{ width: 120, marginLeft: 14 }}
                    onSelect={this.changeAreaHandler}
                  >
                    {groups &&
                      groups.map(item => (
                        <Option key={item.gid} value={item.gid} dataRef={item}>
                          {item.name}
                        </Option>
                      ))}
                  </Select>
                </div>
                <div style={{ display: "inline-block" }}>
                  <Select
                    defaultValue="全部"
                    style={{ width: 120 }}
                    value={this.state.eqName}
                    onSelect={this.changeUnitHandler}
                  >
                    {eqUnit &&
                      eqUnit.map(item => (
                        <Option key={item.gid} value={item.gid} dataRef={item}>
                          {item.name}
                        </Option>
                      ))}
                  </Select>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label>操作人：</label>
                <Input
                  disabled
                  style={{ width: 120 }}
                  value={this.state.operatorName}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <p>备注：</p>
                <TextArea style={{ width: 180 }} autosize />
              </div>
              <div style={{ textAlign: "center" }}>
                <Button
                  type="primary"
                  onClick={this.submitHandler}
                  style={{ marginRight: 20 }}
                >
                  取消
                </Button>
                <Button type="primary" onClick={this.submitHandler}>
                  提交
                </Button>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </PageHeaderLayout>
    );
  }
}
