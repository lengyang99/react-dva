import {
  querySummary,
  getFunction,
  queryAreaData,
  queryPlan,
  queryAreaEquData,
  addRulePlan,
  addTempPlan,
  delplan,
  stopplan,
  startplan,
  getStationData,
  getCycleInfo,
  checkPlanData,
  newFunction,
  queryFunctionPlan,
  queryChildFunctionPlan,
  queryFuncGroup,
  functionDetail,
  editFunction,
  editFunctionForm,
  newModule,
  queryFunctionModule,
  startModuleplan,
  delFuncModule,
  queryFunctionModuleDetail,
  queryModuleAreaData,
  moveUD,
  queryWorkForceList,
  workContent,
  addWorkforce,
  delWorkforce,
  getPatrolPlanData,
} from '../services/maintain';
import {message} from 'antd';


export default {
  namespace: "maintain",
  state: {
    funcList: [],
    regulators: [],
    stations: [],
    planData: {},
    data: {},
    areaData: [],
    equData: [],
    origEquData: [],
    planLoading: false,
    searchText: "",
    paginations: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    cardTotal: 0,
    eqTempTotal: 0,
    cycleData: "",
    checkIsPlan: [],
    functionData: [], //新列表
    functionList: [],  //父级列表
    funcListData: [],  //父功能列表
    functionTotal: [],  //父功能列表总数
    fChildListData: [], //子功能列表
    funcGroup: [], //功能分组
    funcDetail: {}, //父功能详情
    funcModuleData: [], //作业模板列表
    funcModuleDetail: [], // 作业模板详情
    workForceList: [],   // 排班信息数据
    workContentList: [],   // 排班工作内容
    patrolPlanList: [], //巡视计划列表数据
  },
  effects: {
    *getFunction({ callback }, { call, put }) {
      const { data = [] } = yield call(getFunction, { group: "net" });
      console.log(data, "functionlist")
      const funcKey = [];
      const regulators = [];
      data.map(item => {
        funcKey.push({
          functionKey: item.functionKey,
          functionName: item.functionName
        });
      })
      const funcList = [];
      const pd = {};
      let flag = false;
      data.forEach(item => {
        const { functionKey: fk } = item;
        let alias = "";
        if (
          fk === "regulator_a" ||
          fk === "regulator_b" ||
          fk === "regulator_c"
        ) {
          alias = fk.slice(-1).toUpperCase() + "类";
        } else if (fk === "regulator_debug_qieduan") {
          alias = "切断调试";
        } else if (fk === "regulator_debug_fangsan") {
          alias = "放散调试";
        }
        if (fk.startsWith("regulator_")) {
          regulators.push({
            ...item,
            name: item.functionKey,
            // alias: `${fk.slice(-1).toUpperCase()} 类`
            alias
          });
          if (!flag) {
            funcList.push({
              ...item,
              functionKey: "regulator",
              functionName: "调压器养护"
            });
          }
          flag = true;
        } else {
          funcList.push(item);
        }
      });
      yield put({
        type: "functionSave",
        payload: funcList
      });
      yield put({
        type: "saveRegulators",
        payload: regulators
      });
      yield put({
        type: "newList",
        payload: data,
        functionKey: funcKey,
      });
      // if (funcList.length > 0) {
        // callback && callback(functionList[0].functionKey);
      // }
      callback && callback(data);
    },
    //查询养护计划
    *queryMaintainPlan({ payload }, { call, put }) {
      yield put({
        type: "changePlanLoading",
        payload: true
      });
      const res = yield call(queryPlan, payload);
      yield put({
        type: "changePlanLoading",
        payload: false
      });
      yield put({
        type: "savePlanData",
        payload: { ...res, key: payload.function },
        res: payload
      });
    },

    *getStationData({ callback }, { call, put }) {
      const res1 = yield call(getStationData);
      yield put({
        type: "changeStations",
        payload: res1.data
      });
      callback && callback(res1.data);
    },
    *querySummary({ payload }, { call, put }) {
      const response = yield call(querySummary, payload);
      yield put({
        type: "save",
        payload: { ...response, key: payload.function }
      });
    },
    *getAreaData({ callback }, { call, put }) {
      const response = yield call(queryAreaData);
      yield put({
        type: "changeAreaData",
        payload: response.data
      });
      callback && callback(response.data);
    },
    *getAreaEquData({payload, callback}, { call, put }) {
      const response = yield call(queryAreaEquData, payload);
      yield put({
        type: "changeAreaEquData",
        payload: response.data,
        eqTempTotal: response.total
      });

      yield put({
        type: "changeEquData",
        payload: response.data
      });
      callback && callback(response.data)
    },

    *submitRulePlan(action, { call, put }) {
      const response = yield call(addRulePlan, action.payload);
      if (action.callback) {
        action.callback(response);
      }
    },

    *submitTempPlan({ payload, callback }, { call, put }) {
      const response = yield call(addTempPlan, payload);
      if (callback) {
        callback(response);
      }
    },

    *editRulePlan({ payload, callback }, { call, put }) {
      const response = yield call(editRulePlan, payload);
      if (callback) {
        callback(response);
      }
    },

    *stopplan({ payload, callback }, { call, put }) {
      const response = yield call(stopplan, payload);
      if (callback) {
        callback(response);
      }
    },
    *startplan({ planId, src, callback }, { call, put }) {
      const response = yield call(startplan, planId, src);
      if (callback) {
        callback(response);
      }
    },
    *delplan({ payload, callback }, { call, put }) {
      const response = yield call(delplan, payload);
      if (callback) {
        callback(response);
      }
    },
    //周期查询；
    *getCycleInfo({ payload, callback }, { call, put }) {
      const response = yield call(getCycleInfo, payload);
      yield put({
        type: "getCycleData",
        payload: response.data
      });
      callback && callback(response.data);
    },
    //检查是否有任务；
    *checkPlanData({ payload, callback }, { call, put }) {
      const response = yield call(checkPlanData, payload);
      callback && callback(response.data);
    },
    //添加功能；
    *newFunction({ payload, callback }, { call, put }) {
      const response = yield call(newFunction, payload);
      callback && callback(response);
    },
     //查询功能分组列表
     *queryFuncGroup({ payload, callback }, { call, put }) {
      const response = yield call(queryFuncGroup, payload);
      yield put({
        type: "functionGroup",
        payload: response.data.function_groups
      });
      callback && callback(response);
    },
    //查询父功能列表
    *queryFunctionPlan({ payload, callback }, { call, put }) {
      const response = yield call(queryFunctionPlan, payload);
      yield put({
        type: "functionList",
        payload: response.data,
        total: response.total,
      });
      callback && callback(response);
    },
    //查询父功能详情
    *functionDetail({ payload, callback }, { call, put }) {
      const response = yield call(functionDetail, payload);
      yield put({
        type: "funcDetail",
        payload: response.data
      });
      callback && callback(response.data);
    },
    //编辑父功能
    *editFunction({ payload, callback }, { call, put }) {
      const response = yield call(editFunction, payload);
      callback && callback(response);
    },
    //编辑父功能表单
    *editFunctionForm({ payload, callback }, { call, put }) {
      const response = yield call(editFunctionForm, payload);
      callback && callback(response);
    },
     //查询子功能列表
     *queryChildFunctionPlan({ payload, callback }, { call, put }) {
      const response = yield call(queryChildFunctionPlan, payload);
      yield put({
        type: "functionCList",
        payload: response.data
      });
      callback && callback(response);
    },
    //新建作业模板
    *newModule({ payload, callback }, { call, put }) {
      const response = yield call(newModule, payload);
      callback && callback(response);
    },
    //查询功能模板列表
    *queryFunctionModule({ payload, callback }, { call, put }) {
      const response = yield call(queryFunctionModule, payload);
      yield put({
        type: "funcModule",
        payload: response.data
      });
      callback && callback(response);
    },
    //查询功能模板详情
    *queryFunctionModuleDetail({ payload, callback }, { call, put }) {
      const response = yield call(queryFunctionModuleDetail, payload);
      yield put({
        type: "functionModuleDetail",
        payload: response.data
      });
      callback && callback(response);
    },
    //删除作业任务模板
    *delFuncModule({ payload, callback }, { call, put }) {
      const response = yield call(delFuncModule, payload);
      if (callback) {
        callback(response);
      }
    },
    //启停作业模板
    *startModuleplan({ planTemplateId, src, callback }, { call, put }) {
      const response = yield call(startModuleplan, planTemplateId, src);
      if (callback) {
        callback(response);
      }
    },
    //查询模板区域；
    *queryModuleAreaData({payload, callback }, { call, put }) {
      const response = yield call(queryModuleAreaData, payload);
      callback && callback(response.data);
    },
    //上移、下移；
    *moveUD({payload, callback }, { call, put }) {
      const response = yield call(moveUD, payload);
      callback && callback(response.data);
    },
    //查询排班信息
    *queryWorkForceList({ payload, callback }, { call, put }) {
      const response = yield call(queryWorkForceList, payload);
      yield put({
        type: "workForce",
        payload: response.data
      });
      callback && callback(response);
    },
     //查询排班工作内容
     *workContent({ payload, callback }, { call, put }) {
      const response = yield call(workContent, payload);
      yield put({
        type: "workData",
        payload: response.data
      });
      callback && callback(response.data);
    },
    *addWorkforce({payload, callback }, { call, put }) {
      const response = yield call(addWorkforce, payload);
      callback && callback(response);
    },
    //删除排班计划
    *delWorkforce({payload, callback }, { call, put }) {
      const response = yield call(delWorkforce, payload);
      callback && callback(response);
    },
    //查询巡视计划列表
    *getPatrolPlanData({ payload, callback }, { call, put }) {
      const response = yield call(getPatrolPlanData, payload);
      yield put({
        type: "patrolPlan",
        payload: response.data
      });
      callback && callback(response.data);
    },
  },
  reducers: {
    functionModuleDetail(state, action) {
      return {
        ...state,
        funcModuleDetail: action.payload
      };
    },
    funcModule(state, action) {
      return {
        ...state,
        funcModuleData: action.payload
      };
    },
    funcDetail(state, action) {
      return {
        ...state,
        funcDetail: action.payload
      };
    },
    functionGroup(state, action) {
      return {
        ...state,
        funcGroup: action.payload
      };
    },
    functionCList(state, action) {
      return {
        ...state,
        fChildListData: action.payload
      };
    },
    functionList(state, action) {
      return {
        ...state,
        funcListData: action.payload,
        functionTotal: action.total,
      };
    },
    newList(state, action) {
      const { key, data } = action.payload;
      return { ...state, functionData: action.payload, functionList: action.functionKey };
    },
    save(state, action) {
      const { key, data } = action.payload;
      return {
        ...state,
        data: { ...state.data, [key]: data },
        cardTotal: action.payload.total
      };
    },
    savePlanData(state, action) {
      const { key, data = [] } = action.payload;
      const { pageno, pagesize } = action.res;
      return {
        ...state,
        planData: { ...state.planData, [key]: data },
        paginations: {
          ...state.paginations,
          current: pageno,
          pageSize: pagesize,
          total: action.payload.total
        }
      };
    },
    functionSave(state, action) {
      return {
        ...state,
        funcList: action.payload
      };
    },
    saveRegulators(state, action) {
      return {
        ...state,
        regulators: action.payload
      };
    },
    //合并
    changeAreaData(state, action) {
      return {
        ...state,
        areaData: action.payload
      };
    },
    changeAreaEquData(state, action) {
      return {
        ...state,
        origEquData: action.payload,
        eqTempTotal: action.eqTempTotal
      };
    },
    changeEquData(state, action) {
      return {
        ...state,
        equData: action.payload
      };
    },
    restEquData(state, { payload }) {
      return {
        ...state,
        equData: payload
      };
    },
    changePlanLoading(state, { payload }) {
      return {
        ...state,
        planLoading: payload
      };
    },
    changeStations(state, action) {
      return {
        ...state,
        stations: action.payload
      };
    },
    getCycleData(state, action) {
      return {
        ...state,
        cycleData: action.payload
      };
    },
    // checkPlanData(state, action){
    //   return {
    //     ...state,
    //     checkIsPlan: action.payload
    //   }
    // }
    workForce(state, action) {
      return {
        ...state,
        workForceList: action.payload
      };
    },
    workData(state, action) {
      return {
        ...state,
        workContentList: action.payload
      };
    },
    patrolPlan(state, action) {
      return {
        ...state,
        patrolPlanList: action.payload
      };
    },
  }
};
