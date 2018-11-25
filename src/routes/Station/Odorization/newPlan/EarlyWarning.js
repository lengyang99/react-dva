import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs, Button, Row, Col, Input, Select, Checkbox, InputNumber, Table} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import styles from '../index.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;

@connect(({ odorization, login, station }) => ({
  odorList: odorization.odorList,
  earlyWarningList: odorization.earlyWarningList,
  earlyWarningTotal: odorization.earlyWarningTotal,
  user: login.user
}))
export default class EarlyWarning extends Component {
  state = {
    isShowNew: false,
    isShowOdor: false,
    gid: "",
    ecode: "",
    operatorName: "",
    operatorId: "",
    smellyMachineId: "",
    smellyMachineName: "",
    smellyMachineCode: "",
    warnLevel: "",
    remark: "",
    pageno: 1,
    pagesize: 10
  };
  componentDidMount() {
    const { dispatch, user } = this.props;
    this.setState({
      ecode: user.ecode,
      operatorName: user.trueName,
      operatorId: user.gid
    });
    //查询补液记录
    dispatch({
      type: "odorization/queryEarlyWarningList",
      payload: {
        ecode: user.ecode || ""
      }
    });
    // 查询加臭机
    this.props.dispatch({
      type: "odorization/queryOdorEarlyWarningList",
      payload: { stationId: user.locGid }
    });
  }
  componentWillReceiveProps(nextProps){
    if(this.props.isChange !== nextProps.isChange){
      this.cancelHandler()
    }
  }
  odorChangeHandler = (val, fileName, node) => {
    if (fileName === "smellyMachineId") {
      const { dataRef } = node.props;
      this.setState({
        smellyMachineName: dataRef.eqName,
        smellyMachineCode: dataRef.eqCode,
      });
    }
    this.setState({
      [fileName]: val
    });
  };
  newPlan = () => {
    this.setState({ isShowNew: true });
  };
  editPlan = record => {
    this.setState({
      isShowNew: true,
      isShowOdor: true,
      gid: record.gid,
      ecode: this.state.ecode,
      operatorName: this.state.operatorName,
      operatorId: this.state.operatorId,
      smellyMachineId: record.smellyMachineId || "",
      smellyMachineName: record.smellyMachineName || "",
      warnLevel: record.warnLevel || "",
      remark: record.remark || ""
    });
  };
  cancelHandler = () => {
    this.setState({
      isShowNew: false,
      isShowOdor: false,
      gid: "",
      smellyMachineId: "",
      smellyMachineName: "",
      warnLevel: "",
      remark: ""
    });
  };
  pageChange = (current, pageSize) => {
    this.setState({ pageno: current, pagesize: pageSize });
    this.props.dispatch({
      type: "odorization/queryEarlyWarningList",
      payload: {
        pageno: current,
        pagesize: pageSize
      }
    });
  };
  submitHandler = () => {
    const params = { ...this.state };
    delete params.isShowNew;
    delete params.isShowOdor;
    delete params.pageno;
    delete params.pagesize;
    this.props.dispatch({
      type: "odorization/newEarlyWarning",
      payload: params,
      callback: res => {
        console.log(res);
        this.cancelHandler();
        this.props.dispatch({
          type: "odorization/queryEarlyWarningList"
        });
        this.props.dispatch({
          type: "odorization/queryOdorEarlyWarningList",
          payload: { stationId: this.props.user.locGid }
        });
      }
    });
  };

  render() {
    const { pageno, pagesize, isShowNew } = this.state;
    const { odorList, earlyWarningList, earlyWarningTotal } = this.props;
    console.log(this.state, "state☆");
    console.log(this.props, "props☆");

    // 表格分页
    const pagination = {
      total: earlyWarningTotal,
      current: pageno,
      pageSize: pagesize,
      showTotal: (total, range) => {
        return (
          <div>
            共 {total} 条记录 第{pageno}/{Math.ceil(total / pagesize)}页
          </div>
        );
      },
      onChange: (current, pageSize) => {
        this.pageChange(current, pageSize);
      }
    };
    const columns = [
      { title: "名称", dataIndex: "smellyMachineName" , render: (text, record) => {
        return <div>
          <span>{record.smellyMachineCode}</span>
          <br/>
          <span>{text}</span>
        </div>
      } },
      { title: "液位", dataIndex: "warnLevel" },
      { title: "操作人", dataIndex: "operatorName" },
      {
        title: "操作",
        dataIndex: "action",
        render: (text, record) => (
          <span>
            <a
              onClick={() => {
                this.editPlan(record);
              }}
            >
              编辑
            </a>
          </span>
        )
      }
    ];
    return (
      <div>
        <div
          style={{
            width: isShowNew ? "70%" : "100%",
            display: "inline-block",
            float: "left"
          }}
        >
          <div>
            <Button
              type="primary"
              onClick={this.newPlan}
              style={{ marginBottom: 15 }}
            >
              新建
            </Button>
          </div>
          <Table
            dataSource={earlyWarningList || []}
            columns={columns}
            rowKey={record => record.gid}
            pagination={pagination}
          />
        </div>

        <div
          className={styles.fillUp}
          style={{
            display: isShowNew ? "inline-block" : "none",
            width: isShowNew ? "30%" : 0
          }}
        >
          <h2
            style={{
              marginBottom: 10,
              textAlign: "center"
            }}
          >
            液位预警
          </h2>
          <div style={{ clear: "both" }} />
          <div style={{ marginBottom: 20 }}>
            <label>加臭机：</label>
            <Select
              placeholder="请选择加臭机"
              disabled={this.state.isShowOdor}
              style={{ width: "60%" }}
              value={this.state.smellyMachineName}
              onSelect={(val, node) =>
                this.odorChangeHandler(val, "smellyMachineId", node)
              }
            >
              {odorList &&
                odorList.map(item => (
                  <Option key={item.gid} value={item.gid} dataRef={item}>
                    {item.eqName}
                  </Option>
                ))}
            </Select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>液位：</label>
            <InputNumber
              style={{ width: "60%", marginLeft: 14 }}
              value={this.state.warnLevel}
              onChange={val => {
                this.odorChangeHandler(val, "warnLevel");
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>操作人：</label>
            <Input
              disabled
              style={{ width: "60%" }}
              value={this.state.operatorName}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>备注：</label>
            <TextArea
              style={{ width: "60%", marginLeft: 14 }}
              autosize
              value={this.state.remark}
              onChange={e => {
                this.odorChangeHandler(e.target.value, "remark");
              }}
            />
          </div>
          <div style={{ textAlign: "center" }}>
            <Button
              type="primary"
              onClick={this.cancelHandler}
              style={{ marginRight: 20 }}
            >
              取消
            </Button>
            <Button type="primary" onClick={this.submitHandler}>
              提交
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
