import React, { PureComponent } from 'react';
import { Tabs, Pagination } from 'antd';
import { connect } from 'dva';
import { routerRedux, Router, Route, Link } from 'dva/router';
import {sortBy} from 'lodash';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import CardList from '../../components/CardList/CardList';
import TaskSearch from '../../components/SearchPanel/TaskSearch';
// import State from '../PipeLeak/State.js';
import styles from './TaskSummary.less';
const TabPane = Tabs.TabPane;
@connect(state => ({
  funcList: state.maintain.funcList,
  functionList: state.maintain.functionList,
  functionData: state.maintain.functionData,
  data: state.maintain.data,
  areaData: state.maintain.areaData,
  regulators: state.maintain.regulators,
  cardTotal: state.maintain.cardTotal
}))
export default class TaskSummary extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      maintainValue: '',
      currTab: "valve",
      pagesize: 10,
      pageno: 1,
      indexKey: "valve",
      filterData: "",
      stationColor: {}, //所的颜色
      funcData: [],
      tabFunc: '',
    };
  }
  func = "valve";
  
  componentWillMount() {
    console.log(this.props, "★★★★★1");
    // 计划制定 ---> 任务总览
    if (this.props.location.state) {
      console.log(1, "★");
      const funcNew = this.props.functionData.filter(item => {
        return item.functionKey === this.props.location.state.cardfunctionkey;
      });
      this.setState({
        indexKey: this.props.location.state.cardfunctionkey,
        maintainValue: this.props.location.state.maintainValue,
        currTab: this.props.location.state.functionkey,
        pageno: 1,
        funcData: funcNew,
        tabFunc: this.props.location.state.cardfunctionkey,
      });
    }

    // 任务详情 ---> 任务总览，
    if (this.props.location.filterData) {
      console.log(2, "★");
      
      this.setState({
        indexKey: this.props.location.filterData.params.funcData[0].functionKey,
        maintainValue: this.props.location.filterData.params.maintainValue,
        currTab: this.props.location.filterData.params.currTab,
        filterData: this.props.location.filterData.params.filterData,
        pageno: this.props.location.filterData.params.pageno,
        pagesize: this.props.location.filterData.params.pagesize,
        funcData: this.props.location.filterData.params.funcData,
      });
    }
  }
  componentDidMount() {
    console.log(this.props, "★★★★★2");
    // 直接进入任务总览
    if (!this.props.location.state && !this.props.location.filterData) {
      console.log(3, "★");
      this.props.dispatch({
        type: "maintain/getFunction",
        callback: data => {
          const funcNew = [];
          const funcK = data[0].children.length > 0 ? data[0].children[0].functionKey : data[0].functionKey;
          const funcN = data[0].children.length > 0 ? data[0].children[0].functionName : '';
          funcNew.push(data[0]);
          this.setState({
            funcData: funcNew,
            maintainValue: funcN,
            currTab: funcK,
            tabFunc: data[0].functionkey,
          });
          const params = {
            pageno: 1,
            pagesize: this.state.pagesize,
            function: funcK
          };
          this.querySummaryPlanList(params);
        }
      });
    }
    if (Object.keys(this.state.stationColor).length === 0) {
      this.props.dispatch({
        type: "maintain/getAreaData",
        callback: stationData => {
          const stationColor = { ...this.state.stationColor };
          if (stationData && stationData.length !== 0) {
            const stationArr = sortBy(stationData, ["stationid"]);
            (stationArr || []).forEach((item, index) => {
              stationColor[item.stationid] = index + stationData.length;
            });
          }
          this.setState({ stationColor });
        }
      });
    }
    // 计划制定 ---> 任务总览
    if (this.props.location.state) {
      console.log(4, "★");
      const params = {
        others: this.props.location.state.names,
        planId: this.props.location.state.planId,
        pageno: 1,
        pagesize: this.state.pagesize,
      };
      this.refs.getChildrenSearch && this.refs.getChildrenSearch.jumpQuery(params);
    }

    // 任务详情 ---> 任务总览
    if (this.props.location.filterData) {
      console.log(5, "★");
      const { filterData } = this.props.location.filterData.params;
      delete filterData.planId;
      // delete filterData.pagesize;
      const params = {
        isJump: true,
        planId: this.props.location.filterData.state.planId,
        pageno: this.props.location.filterData.params.pageno,
        pagesize: this.props.location.filterData.params.pagesize,
        ...filterData
      };
      this.refs.getChildrenSearch && this.refs.getChildrenSearch.jumpQuery(params);
    }
  }

  querySummaryPlanList = params => {
    this.props.dispatch({
      type: "maintain/querySummary",
      payload: params
    });
  };
  // 需要调整
  tabChangeHandle = key => {
    const { functionData } = this.props;

    const isFuncC = functionData.filter(item => {
      return item.functionKey === key;
    });

    if (isFuncC[0].children.length > 0) {
      this.func = isFuncC[0].children[0].functionKey;
      this.setState({
        maintainValue: isFuncC[0].children[0].functionName,
      })
    } else {
      this.func = key;
      this.setState({
        maintainValue: '',
      });
    }

    this.setState({
      currTab: this.func,
      funcData: isFuncC,
      tabFunc: key,
    });

    const params = {
      pageno: 1,
      pagesize: this.state.pagesize,
      function: this.func
    };
    this.setState({
      pageno: 1,
      filterData: ""
    });
    this.querySummaryPlanList(params);
    const isMove = {
      function: this.func
    };
    this.refs.getChildrenSearch.resetHandle(isMove);
  };
  expOnChange = params => {
    this.setState({
      filterData: params,
      pageno: 1
    });
    this.querySummaryPlanList({ ...params, function: this.state.currTab });
  };
  // 反馈返回查询
  expBackOnChange = params => {
    this.setState({
      filterData: params
    });
    this.querySummaryPlanList({ ...params, function: this.state.currTab });
  };

  detailHandle = data => {
    const path = {
      pathname: "/query/task-detail",
      state: data,
      params: this.state
    };
    this.props.dispatch(routerRedux.push(path));
  };
  detailFunc = key => {
    switch (key) {
      case "regulator_a":
      case "regulator_b":
      case "regulator_c":
      case "regulator_debug_qieduan":
      case "regulator_debug_fangsan":
        return "regulator";
      default:
        return key;
    }
  };
  maintainStateChangeHandle = mc => {
    this.setState({
      pageno: 1,
      pagesize: 10,
      maintainValue: mc.functionName,
      currTab: mc.functionKey,
    });
    // if (!this.props.data[mc.functionKey] || this.props.data[mc.functionKey].length === 0) {
    this.querySummaryPlanList({
      function: mc.functionKey,
      pageno: 1,
      pagesize: 10
    });
    // }
  };

  addArr = regulators => {
    const selectTypes = [
      { alias: "A类" },
      { alias: "B类" },
      { alias: "C类" },
      { alias: "切断调试" },
      { alias: "放散调试" }
    ];
    for (let i = 0; i < regulators.length; i++) {
      Object.assign(regulators[i], selectTypes[i]);
    }
  };

  onChangeHandler = (page, pageSize) => {
    this.setState({
      pageno: page,
      pagesize: pageSize
    });
    const { filterData } = this.state;
    delete filterData.pageno;
    delete filterData.pagesize;
    const params = {
      pageno: page,
      pagesize: pageSize,
      function: this.state.currTab,
      ...filterData
    };
    this.querySummaryPlanList(params);
  };

  changePageSize = (current, size) => {
    this.setState({
      pageno: 1,
      pagesize: size
    });
    const { filterData } = this.state;
    delete filterData.pageno;
    delete filterData.pagesize;
    const params = {
      pageno: 1,
      pagesize: size,
      function: this.state.currTab,
      ...filterData
    };
    this.querySummaryPlanList(params);
  };

  showTotal = total => {
    const { pagesize, pageno } = this.state;
    const totalRow = Math.ceil(this.props.cardTotal / pagesize);
    return (
      <div>
        共 {total} 条记录 第{pageno}/{totalRow}页
      </div>
    );
  };
  render() {
    const {
      functionList: tabs,
      regulators,
      data,
      areaData,
      cardTotal
    } = this.props;
    const { currTab, funcData } = this.state;
    const cardData = data[this.state.currTab] || [];
    this.addArr(regulators);
    let total = 0;
    if (Object.keys(data).length !== 0 && data[currTab] !== undefined) {
      total = data[currTab].length;
    }
    const State = ({ datas, value, onChange }) => {
      const items = datas.length > 0 && datas[0].children.length > 0 && datas[0].children.map(
          item => (
            <label
              className={styles["state-item"]}
              style={{
                color:
                  item.functionName ===
                  (value || this.state.maintainValue)
                    ? "#1C8DF5"
                    : "default"
              }}
              onClick={() => {
                onChange(item);
              }}
              key={item.functionName}
            >
              <span>{item.functionName}</span>
            </label>
          )
        );
      return <div style={{ display: "inline-block" }}>{items}</div>;
    };
 
    const panes = tabs.map(item => (
      <TabPane tab={item.functionName} key={item.functionKey}>
        <div
          style={{
            display: funcData.length > 0 && funcData[0].children.length > 0
              ? "block"
              : "none", marginBottom: 10
          }}
          className={styles["field-block"]}
        >
          <label>维护状态： </label>
          <State
            datas={funcData}
            onChange={mc => {
              this.maintainStateChangeHandle(mc);
            }}
            value={this.state.maintainValue}
          />
        </div>
        <TaskSearch
          ref="getChildrenSearch"
          station={areaData}
          show
          pagination={{
            pagesize: this.state.pagesize,
            pageno: 1
          }}
          expOnChange={this.expOnChange}
          expBackOnChange={this.expBackOnChange}
          keepSearchData={this.state.filterData}
        />
        <CardList
          stationData={this.state.stationColor}
          progressOption={{
            arrive: "arriveCount",
            feedback: "feedBackCount",
            total: "taskCount"
          }}
          showFeedback={true}
          title="assigneeName"
          titleExtra={dd => {
            const max = () => {
              if (dd.arriveCount - dd.feedBackCount >= 0) {
                return dd.feedBackCount;
              } else {
                return dd.arriveCount;
              }
            };
            return dd.feedBackCount === dd.taskCount ? (
              <span style={{ color: "#333" }}>已完成</span>
            ) : (
              <span style={{ color: "#f00" }}>
                未完成({dd.taskCount - max(dd)})
              </span>
            );
          }}
          data={cardData}
          detailClick={this.detailHandle}
        />
        <div className={styles.pagination}>
          <Pagination
            total={cardTotal}
            current={this.state.pageno}
            pageSize={this.state.pagesize}
            showQuickJumper={true}
            showSizeChanger={true}
            onChange={this.onChangeHandler}
            showTotal={this.showTotal}
            onShowSizeChange={this.changePageSize}
          />
        </div>
      </TabPane>
    ));
    return (
      <PageHeaderLayout>
        <div style={{ backgroundColor: "#fff" }}>
          <Tabs
            defaultActiveKey={this.state.indexKey}
            onChange={this.tabChangeHandle}
          >
            {panes}
          </Tabs>
        </div>
      </PageHeaderLayout>
    );
  }
}
