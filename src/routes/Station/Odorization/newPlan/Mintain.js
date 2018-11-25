import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs, Button, Row, Col, Input, Select, Checkbox, InputNumber, Table, message} from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../../../layouts/PageHeaderLayout';
import _ from 'lodash';
import styles from '../index.less';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
const eqInfoOld = [];
const eqId = [];
@connect(({ odorization, login, station }) => ({
  mintainTotal: odorization.mintainTotal,
  odorMacData: odorization.odorMacData,
  mintainList: odorization.mintainList,
  mintainOdor: odorization.mintainOdor,
  user: login.user,
  groups: station.groups,
  eqUnit: station.eqUnit
}))
export default class Mintain extends Component {
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
    remark: "",
    equipmentUnits: [],
    delEquipments: "",
    regionId: "",
    regionName: "",
    eqName: []
  };
  
  componentDidMount() {
    const { dispatch, user } = this.props;
    this.setState({
      ecode: user.ecode,
      operatorName: user.trueName,
      operatorId: user.gid
    });
    //查询管路维护记录
    dispatch({
      type: "odorization/queryMintainList",
      payload: {
        ecode: user.ecode || ""
      }
    });
    // 查询区域
    dispatch({
      type: "station/queryGroups"
    });
    // 查询加臭机
    dispatch({
      type: "odorization/queryOdorMintainList",
      payload: { stationId: user.locGid }
    });

    // 查询加臭机(原来)
    // dispatch({
    //   type: "odorization/queryOdorMacList",
    //   payload: { stationId: user.locGid }
    // });
  }
  componentWillReceiveProps(nextProps){
    if(this.props.isChange !== nextProps.isChange){
      this.cancelHandler()
    }
  }
  odorChangeHandler = (val, fileName, node) => {
    console.log(val, "valllll");
    if (fileName === "smellyMachineId") {
      const { dataRef } = node.props;
      this.setState({
        smellyMachineName: dataRef.eqName,
        smellyMachineCode: dataRef.eqCode,

      });
    }
    if (fileName === "regionId") {
      const { dataRef } = node.props;
      const { ecode, smellyMachineId, regionId, gid } = this.state;
      //验证该加臭机下该区域是否有记录
      this.props.dispatch({
        type: "odorization/queryCheckAreaData",
        payload: {
          ecode,
          smellyMachineId,
          regionId: val,
          recordId: gid
        },
        callback: res => {
          console.log(res, "验证");
          if (res.data && res.data.length > 0) {
            message.warning("该加臭机在此区域下已有记录，不能再次添加！");
            return;
          }
          // 查询设备；
          this.props.dispatch({
            type: "station/queryCheckEq",
            payload: {
              areaId: val
            },
            callback: data => {
              this.setState({
                regionName: dataRef.name,
                eqName: [],
                equipmentUnits: [],
                delEquipments: ""
              });
            }
          });
        }
      });
    }
    if (fileName === "equipmentUnits") {
      const eqAll = [];
      const eqNew = [];
      const eqDelId = [];
      val.map((item, index) => {
        if (!eqId.includes(item)) {
          eqNew.push({
            gid: "",
            equipmentUnitId: item,
            equipmentUnitName: node[index].props.dataRef.name
          });
        } else {
          const deleqArr = _.filter(eqInfoOld, { equipmentUnitId: item });
          deleqArr.map(item => {
            eqNew.push(item);
          });
        }
      });
      const eqDelData = eqInfoOld.filter(item => {
        return !val.includes(item.equipmentUnitId);
      });
      eqDelData.map(item => {
        eqDelId.push(item.gid);
      });

      this.setState({
        equipmentUnits: eqNew,
        delEquipments: eqDelId.join(","),
        eqName: val
      });
    }
    if (fileName !== "equipmentUnits") {
      this.setState({
        [fileName]: val
      });
    }
  };

  newPlan = () => {
    this.setState({ isShowNew: true });
  };
  editPlan = record => {
    const { config, configAdditions } = record;
    const eq = [];
    configAdditions.length > 0 &&
      configAdditions.map(item => {
        eqInfoOld.push({
          gid: item.gid,
          equipmentUnitId: item.equipmentUnitId,
          equipmentUnitName: item.equipmentUnitName
        });
        eq.push(item.equipmentUnitId);
        eqId.push(item.equipmentUnitId);
      });

    // 查询设备；
    this.props.dispatch({
      type: "station/queryCheckEq",
      payload: {
        areaId: config.regionId
      },
      callback: data => {
        // const eq = data.length>0 && data.filter(item => {
        //   return eqId.includes(item.name)
        // })
        // eq.map(item => {
        //   eqName.push(item)
        // })
      }
    });
    this.setState({
      isShowNew: true,
      isShowOdor: true,
      eqName: eq,
      gid: config.gid,
      ecode: this.state.ecode,
      operatorName: this.state.operatorName,
      operatorId: this.state.operatorId,
      smellyMachineId: config.smellyMachineId || "",
      smellyMachineName: config.smellyMachineName || "",
      remark: config.remark || "",
      equipmentUnits: eqInfoOld,
      delEquipments: "",
      regionId: config.regionId || "",
      regionName: config.regionName || ""
    });
  };
  cancelHandler = () => {
    eqInfoOld.length = 0;
    eqId.length = 0;
    this.setState({
      isShowNew: false,
      isShowOdor: false,
      eqName: [],
      gid: "",
      smellyMachineId: "",
      smellyMachineName: "",
      remark: "",
      equipmentUnits: [],
      delEquipments: "",
      regionId: "",
      regionName: ""
    });
  };
  submitHandler = () => {
    const parameter = { ...this.state };
    delete parameter.isShowNew;
    delete parameter.isShowOdor;
    delete parameter.eqName;
    this.props.dispatch({
      type: "odorization/newMintain",
      payload: parameter,
      callback: () => {
        this.cancelHandler();
        this.props.dispatch({
          type: "odorization/queryMintainList"
        });
      }
    });
  };

  render() {
    const { pageno, pagesize, isShowNew, equipmentUnits, eqName } = this.state;
    const { groups, eqUnit, mintainOdor, mintainTotal, mintainList, odorMacData } = this.props;
    console.log(this.state, "state☆");
    console.log(this.props, "props☆");
    console.log(eqName, eqInfoOld, "eqName");
    const columns = [
      {
        title: "名称",
        dataIndex: "smellyMachineName",
        render: (text, recoed) => {
          return <div>
            <span>{recoed.config.smellyMachineCode}</span>
            <br/>        
            <span>{recoed.config.smellyMachineName}</span>
          </div>
        }
      },
      {
        title: "区域",
        dataIndex: "regionName",
        render: (text, recoed) => <span>{recoed.config.regionName}</span>
      },
      {
        title: "设备单元",
        dataIndex: "warnLevel",
        render: (text, recoed) => {
          const { configAdditions } = recoed;
          const eqNames = [];
          configAdditions &&
            configAdditions.length > 0 &&
            configAdditions.map(item => {
              eqNames.push(item.equipmentUnitName);
            });
          return <span>{eqNames.join("、")}</span>;
        }
      },
      {
        title: "操作人",
        dataIndex: "operatorName",
        render: (text, recoed) => <span>{recoed.config.operatorName}</span>
      },
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
          <Table dataSource={mintainList || []} columns={columns} rowKey={record => record.config.gid} />
        </div>
        <div className={styles.fillUp} style={{ display: isShowNew ? "inline-block" : "none", width: isShowNew ? "40%" : 0 }}>
          <h2 style={{ marginBottom: 10, textAlign: "center" }}>
            管路维护
          </h2>
          <div style={{ marginBottom: 20 }}>
            <label>加臭机：</label>
            <Select placeholder="请选择加臭机" disabled={this.state.isShowOdor} style={{ width: "60%" }} value={this.state.smellyMachineName} onSelect={(val, node) => this.odorChangeHandler(val, "smellyMachineId", node)}>
              {mintainOdor && mintainOdor.map(item => (
                  <Option key={item.gid} value={item.gid} dataRef={item}>
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
            <label>设备：</label>
            <Select placeholder="请选择设备单元" mode="multiple" style={{ width: "60%", marginLeft: 14 }} value={eqName} onChange={(val, node) => this.odorChangeHandler(val, "equipmentUnits", node)}>
              {eqUnit && eqUnit.map(item => (
                  <Option key={item.gid} value={item.gid} dataRef={item}>
                    {item.name}
                  </Option>
                ))}
            </Select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>操作人：</label>
            <Input disabled style={{ width: "60%" }} value={this.state.operatorName} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label>备注：</label>
            <TextArea style={{ width: "60%", marginLeft: 14 }} value={this.state.remark} autosize onChange={e => {
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
