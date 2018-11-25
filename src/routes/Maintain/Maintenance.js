import React, {Component} from 'react';
import {Tabs, Button, message, Modal} from 'antd';

import { connect } from 'dva';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import MaintainTable from './MaintainTable';
import NormalPlanForm from './ModalForm/NormalPlanForm';
import TempPlanForm from './ModalForm/TempPlanForm';
import PlanSearch from './SearchPanel/PlanSearch';
import {sortBy} from 'lodash';
const FormatStr = 'YYYY-MM-DD';
const TabPane = Tabs.TabPane;
const confirm = Modal.confirm;

@connect(
  ({
    maintain: {
      funcList,
      regulators,
      planData,
      paginations,
      planLoading,
      areaData,
      stations,
      eqTempTotal,
      equData,
      origEquData,
      checkIsPlan,
      functionList,
      functionData
    },
    login,
    taskdetail: { detaildata, eqTotal }
  }) => ({
    funcList,
    regulators,
    planData,
    paginations,
    planLoading,
    areaData,
    user: login.user,
    token: login.token,
    stations,
    origEquData,
    equData,
    eqTempTotal,
    detaildata,
    eqTotal,
    checkIsPlan,
    functionList,
    functionData
  })
)
export default class Maintenance extends Component {
  state = {
    normal: false,
    temp: false,
    loading: false,
    normalBtn: true,
    tempBtn: true,
    pageno: 1,
    pagesize: 10,
    NormalmodalKey: 0,
    TempmodalKey: -100,
    normalName: "",
    tempName: "",
    hasPlanName: false,
    hasTempName: false,
    visible: false,
    stationColor: {}, //所对应的颜色
    funcData: [],
  };
  taskTypes = [{ name: 1, alias: "常规" }, { name: 2, alias: "临时" }];
  stateData = [{ name: 1, alias: "启用" }, { name: 2, alias: "停用" }];
  func = '';
  tabFunc = '';
  tabFuncName = '';
  form = null;
  regionItem = {};
  equipments = "";
  eqcheck = [];
  road = {};
  queryFilter = {};

  componentWillMount() {
    this.props.dispatch({
      type: "maintain/getFunction",
      callback: data => {
        console.log(data, "functionKey");
        const funcNew = [];
        funcNew.push(data[0]);
        let params = {
          pageno: this.props.paginations.current,
          pagesize: this.props.paginations.pageSize
        };
        this.func =
          data[0].children.length > 0
          ? data[0].children[0].functionKey
          : data[0].functionKey;
        
        this.tabFunc = data[0].functionKey;
        this.tabFuncName = data[0].children.length > 0
          ? data[0].children[0].functionName
          : '';
        this.setState({
          funcData: funcNew,
        });
        console.log(this.func, "funcccc");
        this.queryMaintainPlan(params);
      }
    });
  }
  componentDidMount() {
    // if (this.props.funcList.length === 0) {
    
    // }
    if (Object.keys(this.state.stationColor).length === 0) {
      this.props.dispatch({
        type: "maintain/getStationData",
        callback: stationData => {
          const stationColor = { ...this.state.stationColor };
          if (stationData && stationData.length !== 0) {
            const stationArr = sortBy(stationData, ["stationCode"]);
            (stationArr || []).forEach((item, index) => {
              stationColor[item.stationCode] = index + stationData.length;
            });
          }
          this.setState({ stationColor });
        }
      });
    }
  }

  extraParams = {};
  queryMaintainPlan = (params = {}) => {
    this.props.dispatch({
      type: "maintain/queryMaintainPlan",
      payload: {
        ...params,
        function: this.func
      }
    });
  };
  getCategory = () => {
    switch (this.func) {
      case "regulator_a":
        return 2;
      case "regulator_b":
        return 3;
      case "regulator_c":
        return 4;
      case "regulator_debug_qieduan":
        return 5;
      case "regulator_debug_fangsan":
        return 6;
    }
  };
  onRef = (ref) => {
    this.child = ref
  }
  tabChangeHandle = key => {
    const { functionData } = this.props;
    this.tabFunc = key;
    const isFuncC = functionData.filter(item => {
      return item.functionKey === key;
    });

    if (isFuncC[0].children.length > 0) {
      this.func = isFuncC[0].children[0].functionKey;
    } else {
      this.func = key;
    }
    this.funcData = isFuncC;

    this.setNewBtn(isFuncC[0].allowRoutineTask, isFuncC[0].allowTempTask);
    this.setState({
      funcData: isFuncC,
    })
    const { planData } = this.props;
    // if (planData[this.func] && planData[this.func].length > 0) {
    //   return;
    // }
    let params = {
      pageno: this.state.pageno,
      pagesize: this.state.pagesize
    };
    this.queryMaintainPlan(params);
    // this.refs.getChildernSearch.resetHandle()
    this.child.resetState()
  };

  setNewBtn = (routine , temp) => {
    this.setState({
      normalBtn: routine === 1 ? true : false,
      tempBtn: temp === 1 ? true : false
    });
  };
  showNewNormalModal = key => {
    this.setState({
      [key]: true,
      loading: false,
      normal: true
    });
    if (!this.props.areaData || this.props.areaData.length === 0) {
      this.props.dispatch({
        type: "maintain/getAreaData"
      });
    }
  };
  showNewTempModal = key => {
    this.setState({
      [key]: true,
      loading: false,
      temp: true,
      pageno: 1,
      pagesize: 10
    });
    if (!this.props.areaData || this.props.areaData.length === 0) {
      this.props.dispatch({
        type: "maintain/getAreaData"
      });
    }
  };
  handleOk = () => {
    const form = this.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      this.setState({ loading: true }); // 只有通过表单验证才产生loding状态
      const {
        name,
        stationid,
        gid,
        station,
        eqlocation,
        ecode,
        userid,
        usernames
      } = this.extraParams;
      const categoryData = this.getCategory(this.func);
      const params = {
        assigneeId: userid,
        assigneeName: usernames,
        zoneId: eqlocation.parentId,
        regionId: eqlocation.gid,
        regionName: name,
        startTime: values.startTime.format("YYYY-MM-DD") + " " + "00:00:00",
        ecode,
        function: this.func,
        params:
          categoryData === undefined
            ? ""
            : JSON.stringify({ category: categoryData }),
        planName: this.state.normalName
      };
      this.props.dispatch({
        type: "maintain/submitRulePlan",
        payload: params,
        callback: ({ success, msg }) => {
          if (success) {
            message.success("添加成功！");
            form.resetFields();
            let params2 = {
              pageno: this.state.pageno,
              pagesize: this.state.pagesize
            };
            this.queryMaintainPlan(params2);
            this.setState({
              normalName: "",
              hasPlanName: false
            });
          } else {
            message.info(`添加失败:${msg}！`);
            setTimeout(() => {
              this.setState({
                loading: false
              });
            }, 1000);
          }
          this.setState({
            normal: !success,
            loading: !success
          });
        }
      });
    });
  };

  handTempOk = (st, et, pn) => {
    const {
      gid,
      name,
      stationid,
      station,
      userid,
      usernames,
      eqlocation,
      ecode
    } = this.regionItem;
    const isr = this.tabFunc.includes("regulator");
    const lines = [];
    if (isr) {
      const eqs = this.equipments.split(",");
      // const eqKeys = Object.keys(this.road)
      eqs.forEach(eq => {
        if (!this.road[eq]) {
          message.warn("所选设备必须选择AB路");
          message.destroy();
          return;
        }
        const adRoad = this.road[eq] === "AB" ? "A,B" : this.road[eq];
        lines.push({ eq_id: eq, line: adRoad });
      });
    }
    // const ftr = 'YYYY-MM-DD';
    const data = {
      function: this.func,
      regionId: eqlocation.gid,
      zoneId: eqlocation.parentId,
      regionName: name,
      stationName: station,
      startTime: st + " " + "00:00:00",
      endTime: et + " " + "23:59:59",
      planName: pn,
      assigneeId: userid,
      assigneeName: usernames,
      equipments: this.equipments,
      params: JSON.stringify({}),
      ecode
    };

    const regObj = {
      regulator_a: 2,
      regulator_b: 3,
      regulator_c: 4,
      regulator_debug_qieduan: 5,
      regulator_debug_fangsan: 6
    };
    if (isr) {
      data.params = JSON.stringify({
        category: regObj[this.func],
        lines: lines
      });
    }
    this.setState({ loading: true });
    this.props.dispatch({
      type: "maintain/submitTempPlan",
      payload: data,
      callback: ({ success, msg }) => {
        if (success) {
          message.success("添加成功！");
          this.equipments = "";
          this.eqcheck.splice(0, this.eqcheck.length);
          this.road = {};
          this.regionItem = {};
          let params2 = {
            pageno: this.state.pageno,
            pagesize: this.state.pagesize
          };
          this.queryMaintainPlan(params2);
          this.refs.getChildernFunc.cancelHandler();
        } else {
          message.info(`添加失败:${msg}！`);
          setTimeout(() => {
            this.setState({
              loading: false
            });
          }, 1000);
        }
        this.setState({
          temp: !success,
          loading: !success
        });
      }
    });
  };

  isPlanData(data) {
    let that = this;
    confirm({
      title: "您在该站下已有计划，是否继续添加计划?",
      cancelText: "否",
      okText: "是",
      onOk() {},
      onCancel() {
        that.handleNormalCancel();
        that.refs.getChildernFunc.cancelHandler();
      }
    });
  };
  //计划下没有设备提示
  isPlanEq(data) {
    let that = this;
    confirm({
      title: "该区域没有设备，是否新增?",
      cancelText: "否",
      okText: "是",
      onOk() {},
      onCancel() {
        that.handleNormalCancel();
        that.refs.getChildernFunc.cancelHandler();
      }
    });
  };

  extraHandle = params => {
    this.extraParams = params;
    const date = new Date();
    const normalNameData = params.name + "_" + moment(date).format(FormatStr);
    if (!this.state.hasPlanName) {
      this.setState({
        normalName: normalNameData
      });
    }
    const station = this.props.areaData.filter(item => {
      return item.station === params.station;
    });
    const cycleData = {
      stationId: station.length > 0 ? station[0].eqlocation.parentId : "",
      regionId: params.eqlocation.gid,
      zoneId: params.eqlocation.parentId,
      ecode: params.ecode,
      function: this.func
    };
    const form = this.form;
    this.props.dispatch({
      type: "maintain/getCycleInfo",
      payload: cycleData,
      callback: data => {
        form.setFieldsValue({
          cycleInfo: data ? (data.cycleId + data.cycleName) : '',
        });
      }
    });
    const checkData = {
      function: this.func,
      regionId: params.eqlocation.gid
    };
    const checkDataEq = {
      pageno: 1,
      pagesize: 10,
      function: this.func,
      regionId: params.eqlocation.gid
    };
    this.checkPlanEq(checkData);
    this.checkData(checkData);
    
  };

  //检查在该站下是否已有计划；
  checkData = params => {
    this.props.dispatch({
      type: "maintain/checkPlanData",
      payload: params,
      callback: data => {
        if (data && data.length > 0) {
          this.isPlanData();
        }
      }
    });
  };
  //检查在该站下是否已有计划；
  checkPlanEq = params => {
    this.props.dispatch({
      type: "maintain/getAreaEquData",
      payload: params,
      callback: data => {
        if (data && data.length === 0) {
          this.isPlanEq();
        }
      }
    });
  };

  changePlanName = params => {
    this.setState({ normalName: params });
    if (params === "") {
      this.setState({
        hasPlanName: false
      });
    } else {
      this.setState({
        hasPlanName: true
      });
    }
  };

  callbackRegion = params => {
    this.regionItem = params;
    const { eqlocation: { gid } } = params;
    const checkPlanData = {
      function: this.func,
      regionId: gid
    };
    this.checkData(checkPlanData);
    this.eqcheck.splice(0, this.eqcheck.length);
  };
  // setState的回调实现；
  setStateAsync(state) {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  // async handleNormalCancel(key){
  //   const state = {
  //     [key]: false,
  //     normal: false,
  //     "normalName": '',
  //     "hasPlanName" : false,
  //   }
  //   await this.setStateAsync(state)
  //   console.log(this.state.normal);
  //   this.form.resetFields();
  // };

  // handleNormalCancel = (key) => {
  //   this.setState({
  //     [key]: false,
  //     normal: false,
  //     "normalName": '',
  //     "hasPlanName" : false,
  //   });
  //   setTimeout(() => {
  //     this.form.resetFields();
  //   }, 0)
  // };
  handleNormalCancel = key => {
    this.setState(
      {
        [key]: false,
        normal: false,
        normalName: "",
        hasPlanName: false
      },
      () => {
        this.form.resetFields();
      }
    );
  };

  handleTempCancel = key => {
    this.setState({
      [key]: false,
      normal: false,
      temp: false,
      tempName: "",
      hasTempName: false
    });
    this.props.dispatch({
      type: "maintain/getAreaEquData",
      payload: {
        ecode: "",
        function: "",
        regionId: ""
      }
    });
    this.eqcheck.splice(0, this.eqcheck.length);
    // this.tempForm.resetFields();
  };
  changeTempName = params => {
    this.setState({ tempName: params });
    if (params === "") {
      this.setState({
        hasTempName: false
      });
    } else {
      this.setState({
        hasTempName: true
      });
    }
  };

  searchChangeHandle = (params, func, name, routine, temp) => {
    const { status, zoneId, taskType, others, regulator } = params;
    this.queryFilter = params;
    // if (func === "regulator") {
    //   if (regulator) {
    //     this.func = regulator;
    //   }
    // }
    this.func = regulator === undefined ? func : regulator;
    this.tabFuncName = name;
    this.setNewBtn(routine, temp);
    this.queryMaintainPlan({
      pageno: this.state.pageno,
      pagesize: this.state.pagesize,
      status,
      zoneId,
      taskType,
      others
    });
  };

  handlePlanTableChange = () => {
    // console.log(pagination);
  };

  callbackDevice = (equipments, selectedRowKeys) => {
    const str = selectedRowKeys.toString();
    this.equipments = str;
    this.eqcheck = selectedRowKeys;
  };
  render() {
    const {
      // funcList: tabs,
      functionList: tabs,
      planData,
      regulators,
      planLoading,
      paginations,
      functionData
    } = this.props;
    const {funcData} = this.state;
    console.log(this.tabFunc, this.tabFuncName,this.func, "tabFuncName");
    const panes = tabs.map(item => (
      <TabPane tab={item.functionName} key={item.functionKey}>
        <PlanSearch
          onRef={this.onRef}
          stations={this.props.stations}
          stateValues={this.stateData}
          taskTypes={this.taskTypes}
          regulators={regulators}
          funcData={funcData.length > 0 ? funcData[0].children : []}
          func={item.functionKey}
          funcN={this.func}
          expOnChange={this.searchChangeHandle}
        />
        <MaintainTable
          loading={planLoading}
          tabFunc={this.tabFunc}
          tabFuncName={this.tabFuncName}
          data={{
            funclist: tabs,
            data: planData[this.func] || [],
            functionkey: this.func,
            pagination: {
              current: paginations.current,
              pageSize: paginations.pageSize,
              total: paginations.total
            }
          }}
          detaildata={this.props.detaildata}
          areaData={this.props.areaData}
          stationData={this.state.stationColor}
          dispatch={this.props.dispatch}
          queryFilter={this.queryFilter}
          taskTypes={this.taskTypes}
          onChange={this.handlePlanTableChange}
        />
      </TabPane>
    ));
    return (
      <PageHeaderLayout>
        <div style={{ minHeight: "60vh", paddingRight: 10 }}>
          <Tabs
            onChange={this.tabChangeHandle}
            animated={{ inkBar: true, tabPane: false }}
            tabBarExtraContent={[
              <Button
                style={{
                  display: this.state.normalBtn ? "inline-block" : "none"
                }}
                key="normal"
                type="primary"
                onClick={() => {
                  this.showNewNormalModal("normal");
                }}
              >
                ＋常规
              </Button>,
              "　",
              <Button
                key="temp"
                type="primary"
                onClick={() => {
                  this.showNewTempModal("temp");
                }}
              >
                ＋{this.state.normalBtn ? "临时" : "新建"}
              </Button>
            ]}
          >
            {panes}
          </Tabs>
        </div>
        <NormalPlanForm
          ref={form => {
            this.form = form;
          }}
          normalName={this.state.normalName}
          NormalmodalKey={this.state.NormalmodalKey}
          extraHandle={this.extraHandle}
          changePlanName={this.changePlanName}
          visible={this.state.normal}
          handCancel={this.handleNormalCancel}
          handleSubmitRulePlan={this.handleOk}
          areaData={this.props.areaData}
          dispatch={this.props.dispatch}
          detaildata={this.props.detaildata}
          func={this.func}
          loading={this.state.loading}
        />

        <TempPlanForm
          ref="getChildernFunc"
          changeTempName={this.changeTempName}
          tempName={this.state.tempName}
          TempmodalKey={this.state.TempmodalKey}
          visible={this.state.temp}
          handCancel={this.handleTempCancel}
          origEquData={this.props.origEquData}
          equData={this.props.equData}
          handleSubmitPlan={this.handTempOk}
          areaData={this.props.areaData}
          dispatch={this.props.dispatch}
          func={this.func}
          road={this.road}
          eqcheck={this.eqcheck}
          loading={this.state.loading}
          callbackRegion={this.callbackRegion}
          callbackDevice={this.callbackDevice}
          callbackRoad={road => {
            this.road = road;
          }}
          detaildata={this.props.detaildata}
          eqTempTotal={this.props.eqTempTotal}
          eqTotal={this.props.eqTotal}
        />
      </PageHeaderLayout>
    );
  }
}
