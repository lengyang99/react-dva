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
  averageOdor: odorization.averageOdor,
  averageList: odorization.averageList,
  averageTotal: odorization.averageTotal,
  user: login.user,
  groups: station.groups
}))
export default class Average extends Component {
  state = {
    isShowNew: false,
    isShowOdor: false,
    ecode: "",
    operatorName: "",
    operatorId: "",
    smellyMachineId: "",
    smellyMachineName: "",
    smellyMachineCode: "",
    remark: "",
    regionId: "",
    regionName: "",
    warningMax: "",
    warningMin: "",
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
    //查询平均值记录
    dispatch({
      type: "odorization/queryAverageList",
      payload: {
        ecode: user.ecode || ""
      }
    });
    // 查询区域
    this.props.dispatch({
      type: "station/queryGroups"
    });
    // 查询加臭机
    this.props.dispatch({
      type: "odorization/queryOdorAverageList",
      payload: { stationId: user.locGid }
    });
  }

  componentWillReceiveProps(nextProps){
    if(this.props.isChange !== nextProps.isChange){
      this.cancelHandler()
    }
  }

  newPlan = val => {
    this.setState({ isShowNew: true });
  };
  odorChangeHandler = (val, fileName, node) => {
    if (fileName === "smellyMachineId") {
      const { dataRef } = node.props;
      this.setState({
        smellyMachineName: dataRef.eqName,
        smellyMachineCode: dataRef.eqCode,
      });
    }
    if (fileName === "regionId") {
      const { dataRef } = node.props;
      this.setState({ regionName: dataRef.name });
    }
    this.setState({
      [fileName]: val
    });
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
      remark: record.remark || "",
      regionId: record.regionId || "",
      regionName: record.regionName || "",
      warningMax: record.warningMax || "",
      warningMin: record.warningMin || ""
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
      remark: "",
      regionId: "",
      regionName: "",
      warningMax: "",
      warningMin: ""
    });
  };
  pageChange = (current, pageSize) => {
    this.setState({ pageno: current, pagesize: pageSize });
    this.props.dispatch({
      type: "odorization/queryAverageList",
      payload: {
        pageno: current,
        pagesize: pageSize
      }
    });
  };
  submitHandler = fileName => {
    const params = { ...this.state };
    delete params.isShowNew;
    delete params.isShowOdor;
    delete params.pageno;
    delete params.pagesize;
    this.props.dispatch({
      type: "odorization/newAverage",
      payload: params,
      callback: () => {
        this.cancelHandler();
        this.props.dispatch({
          type: "odorization/queryAverageList",
          payload: {
            ecode: this.state.ecode
          }
        });
        this.props.dispatch({
          type: "odorization/queryOdorAverageList",
          payload: { stationId: this.props.user.locGid }
        });
      }
    });
  };
  render() {
    const { pageno, pagesize, isShowNew } = this.state;
    const { groups, averageOdor, averageList, averageTotal } = this.props;
    console.log(this.state, "state☆");
    console.log(this.props, "props☆");

    // 表格分页
    const pagination = {
      total: averageTotal,
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
      }},
      { title: "区域", dataIndex: "regionName" },
      { title: "报警上限值", dataIndex: "warningMax" },
      { title: "报警下限值", dataIndex: "warningMin" },
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

    return <div>
        <div style={{ width: isShowNew ? "60%" : "100%", display: "inline-block", float: "left" }}>
          <div>
            <Button type="primary" onClick={this.newPlan} style={{ marginBottom: 15 }}>
              新建
            </Button>
          </div>
          <Table dataSource={averageList || []} columns={columns} rowKey={record => record.gid} pagination={pagination} />
        </div>
        <div className={styles.fillUp} style={{ display: isShowNew ? "inline-block" : "none", width: isShowNew ? "40%" : 0 }}>
          <h2 style={{ marginBottom: 10, textAlign: "center" }}>
            平均加臭量设置
          </h2>
          <div style={{ clear: "both" }} />
          <div style={{ marginBottom: 20 }}>
            <label>加臭机：</label>
            <Select placeholder="请选择加臭机" style={{ width: "60%" }} disabled={this.state.isShowOdor} value={this.state.smellyMachineName} onSelect={(val, node) => this.odorChangeHandler(val, "smellyMachineId", node)}>
              {averageOdor && averageOdor.map(item => (
                  <Option
                    key={item.gid}
                    value={item.gid}
                    dataRef={item}
                  >
                    {item.eqName}
                  </Option>
                ))}
            </Select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>管路：</label>
            <Select placeholder="请选择区域" style={{ width: "60%", marginLeft: 14 }} value={this.state.regionName} onSelect={(val, node) => this.odorChangeHandler(val, "regionId", node)}>
              {groups && groups.map(item => (
                  <Option key={item.gid} value={item.gid} dataRef={item}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "inline-block" }}>
              <label>预警值：</label>
              <InputNumber value={this.state.warningMin} onChange={val => {
                  this.odorChangeHandler(val, "warningMin");
                }} />
            </div>
            <div style={{ margin: "0 5px", display: "inline-block" }}>
              -
            </div>
            <div style={{ display: "inline-block" }}>
              <InputNumber value={this.state.warningMax} onChange={val => {
                  this.odorChangeHandler(val, "warningMax");
                }} />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>操作人：</label>
            <Input disabled style={{ width: "60%" }} value={this.state.operatorName} />
          </div>
          <div style={{ marginBottom: 20, marginLeft: 14 }}>
            <label>备注：</label>
            <TextArea style={{ width: "60%" }} autosize value={this.state.remark} onChange={e => {
                this.odorChangeHandler(e.target.value, "remark");
              }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <Button type="primary" onClick={this.cancelHandler} style={{ marginRight: 20 }}>
              取消
            </Button>
            <Button type="primary" onClick={this.submitHandler}>
              提交
            </Button>
          </div>
        </div>
      </div>;
  }
}
