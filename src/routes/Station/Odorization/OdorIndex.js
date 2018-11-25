import React, { Component } from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Tabs, Button, Row, Col, Input, Select, Checkbox, InputNumber, Table, Switch, Icon, Spin, message} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from "./index.less";
import EarlyWarning from "./newPlan/EarlyWarning";
import Average from "./newPlan/Average";
import Mintain from "./newPlan/Mintain";

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const { TextArea } = Input;
const smellyMachine = [];
const startLevel = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110];
const stopLevel = [350, 400, 450, 600, 650, 700, 800, 850, 950, 1000];

@connect(({ odorization, login, station }) => ({
  mintainList: odorization.mintainList,
  user: login.user,
  groups: station.groups,
  eqUnit: station.eqUnit,
  odorIndex: odorization.odorIndex
}))
export default class OdorIndex extends Component {
  state = {
    isOnload: true,
    smellyMachineN: [],
  };
  componentDidMount() {
    const { dispatch, user } = this.props;
    //首页数据
    dispatch({
      type: "odorization/queryOdorIndex",
      payload: {
        ecode: user.ecode || "",
        stationId: user.locGid || ""
      },
      callback: (data) => {
        data && data.map(item => {
            if (!_.some(smellyMachine, [
                "smellyMachineId",
                item.smellyMachineVO.smellyMachineId
              ])) {
              smellyMachine.push({
                smellyMachineName:item.smellyMachineVO.smellyMachineName,
                smellyMachineCode:item.smellyMachineVO.smellyMachineCode,
                smellyMachineId: item.smellyMachineVO.smellyMachineId,
                status: item.smellyMachineVO.status
              });
            }
            this.setState({ smellyMachineN: smellyMachine });
          });
      }
    });
  }

  isOnload = () => {
    console.log("加载完成");
    // this.setState({ isOnload: false,});
  };
  checkStatus = (checked, val) => {
    const { dispatch, user } = this.props;
    console.log(checked, val, "checked");
    if (checked) {
      dispatch({
        type: "odorization/ordoStatus",
        payload: {
          gid: val,
          eqStatus: '在用',
        },
        callback: ({ success, msg }) => {
          if (success) {
            message.success("加臭机启用成功！");
            smellyMachine && smellyMachine.map((item, index) => {
              if(item.smellyMachineId === val){
                smellyMachine[index].status = '在用'
              }
              this.setState({ smellyMachineN: smellyMachine });
            })
            dispatch({
              type: "odorization/queryOdorIndex",
              payload: {
                ecode: user.ecode || "",
                stationId: user.locGid || ""
              },
            });
          }
        }
      });
    }
    if (!checked) {
      dispatch({
        type: "odorization/ordoStatus",
        payload: {
          gid: val,
          eqStatus: '停用',
        },
        callback: ({ success, msg }) => {
          if (success) {
            message.success("加臭机停用成功！");
            smellyMachine && smellyMachine.map((item, index) => {
                if (item.smellyMachineId === val) {
                  smellyMachine[index].status = '停用';
                }
                this.setState({ smellyMachineN: smellyMachine });
              });
            dispatch({
              type: "odorization/queryOdorIndex",
              payload: {
                ecode: user.ecode || "",
                stationId: user.locGid || ""
              }
            });
          }
        }
      });
    }
  };
  render() {
    const { odorIndex } = this.props;
    const { smellyMachineN } = this.state;
    console.log(smellyMachine, "smellyMachine");
    console.log(this.props, "props★");
    const OdorShow = () => {
      const items =
        odorIndex &&
        odorIndex.map(ii => {
          const eqWidth = (ii.configAdditions.length - 1) * 80 / 2;
          //预警液位高度；
          const warnHeight = (Number(ii.smellyMachineVO.warnLevel) / 300) * 120
          let level = 0;
          if (ii.smellyMachineVO.status === null || ii.smellyMachineVO.status ==='在用') {
            startLevel.map((item, index) => {
              if (Number(ii.smellyMachineVO.trueLevel) / 3 < 5) {
                level = 5;
              } else if (Number(ii.smellyMachineVO.trueLevel) / 3 > startLevel[index] && Number(ii.smellyMachineVO.trueLevel) / 3 <= startLevel[index + 1]) {
                level = startLevel[index + 1];
              } else if (Number(ii.smellyMachineVO.trueLevel) / 3 > 100) {
                level = 110;
              }
            });
          }
          if (ii.smellyMachineVO.status === '停用') {
            stopLevel.map((item, index) => {
              if (Number(ii.smellyMachineVO.trueLevel) / 0.3 < 350) {
                level = 350;
              } else if (Number(ii.smellyMachineVO.trueLevel) / 0.3 > stopLevel[index] && Number(ii.smellyMachineVO.trueLevel) / 0.3 <= stopLevel[index + 1]) {
                level = stopLevel[index + 1];
              }
            });
          }
          
          console.log(level, 'level★')
          return (
            <div
              style={{
                // marginRight: 60,
                marginBottom: 20,
                width: '33%',
                display: "inline-block"
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span>{ii.smellyMachineVO.smellyMachineName}</span>
                <br/>
                <span>{ii.smellyMachineVO.smellyMachineCode}</span>
              </div>
              {/* <Spin spinning={this.state.isOnload} style={{ width: 140, height: 149, marginLeft: eqWidth - 70}} /> */}
              <div
                style={{
                  width: 110,
                  height: 120,
                  // marginLeft: eqWidth - 55,
                  left: `calc(50% - ${55}px)`,
                  position: "relative"
                }}
              >
                <img
                  src={`../images/stop-level/pc-odor/level_${level}.png`}
                  style={{ width: 110, height: 120 }}
                />
                <div className={styles.imgFont} style={{ top: 25, right: 15 }}>
                  {ii.smellyMachineVO.status === '停用' ? "停" : "启"}
                </div>
                {/* <div className={styles.imgFont} style={{ bottom: warnHeight, borderBottom: '2px dashed  #f00' }}> */}
                <div className={styles.imgFont} style={{ bottom: warnHeight}}>
                  液位：{ii.smellyMachineVO.trueLevel}
                </div>
              </div>
              <div
                style={{
                  height: 30,
                  borderLeft: "1px solid #000",
                  // marginLeft: eqWidth,
                  marginLeft: '50%',
                  paddingLeft: 10
                }}
              >
                {ii.smellyMachineVO.regionName}
              </div>
              <div style={{ marginLeft: `calc(50% - ${eqWidth}px)` }}>
                {ii.configAdditions &&
                  ii.configAdditions.map((item, index) => {
                    if (index < ii.configAdditions.length - 1) {
                      return (
                        <div
                          key={`odor_${index}`}
                          className={styles.eqUnitLine}
                        />
                      );
                    }
                    if (ii.configAdditions.length === 1) {
                      return (
                        <div
                          key={`odorOne_${index}`}
                          className={styles.eqUnitOneLine}
                        />
                      );
                    }
                  })}
              </div>
              <div style={{textAlign: 'center'}}>
                {ii.configAdditions &&
                  ii.configAdditions.map((item1, index1) => (
                    <div key={item1.gid} className={styles.eqUnitData}>
                      <span className={styles.eqUnitDataSpan}>
                        {item1.equipmentUnitName}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        });
      return <div>{items}</div>;
    };

    return (
      <PageHeaderLayout>
        <div style={{ height: "auto", padding: "20px 0" }}>
          <div
            className={styles.indexLeft}
            style={{ width: "80%", display: "inline-block" }}
          >
            <OdorShow />
          </div>
          <div
            className={styles.indexRight}
            style={{ width: "20%", display: "inline-block" }}
          >
            <div>
              <h3 style={{ textAlign: "center", marginBottom: 20 }}>
                加臭机状态管理
              </h3>
              {smellyMachineN &&
                smellyMachineN.map(item => (
                  <div style={{ marginLeft: 20, marginBottom: 6 }}>
                    <div style={{ marginRight: 8, float: 'left' }}>
                      <span><b>{item.smellyMachineName}</b></span>
                      <br/>
                      <span><b>{item.smellyMachineCode}</b></span>
                    </div>
                    <div style={{float: 'left' }}>
                      <Switch
                        checkedChildren="启用"
                        unCheckedChildren="停用"
                        defaultChecked
                        checked={item.status === "停用" ? false : true}
                        onChange={checked =>
                          this.checkStatus(checked, item.smellyMachineId)
                        }
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </PageHeaderLayout>
    );
  }
}
