import { message } from 'antd';
import {
  getStationDataByType
  , fetchCycleUnit
  , addPreMaintenPlan
  , addTempPreMaintenPlan
  , editPlan
  , stopplan
  , delplan
  , startplan
  , getDetailinfo
  , queryPrePlanData
  , queryTasks
  , queryPlanDetaile
  , getFormData
  , getDangerFormData
  , saveFormData
  , queryMtInfo
  , queryMaterialInfo
  , queryPlaceInfo
  , savePickingData
  , queryMaterialDetaile
  , cancelTask
  , submitAttInfo
  , queryLocation,
  getAreaData,
  getFunctionData,
  getUserDataByStation,
  delTasks,
  editTasks,
  getWorkStatus,
  getTaskListById,
  getStationListByType,
  queryAreaEq,
  queryAreaGsh,
  exportPlan,
  importPlan,
  getStationUserByEcode,
  queryGysByBukrs,
  savePurchaseOrderInfo,
  initPurchaseOrderInfo,
} from '../services/device';

export default {
  namespace: 'device',
  state: {
    equList: [],
    data: {},
    taskData: [],
    stations: [],
    planLoading: false,
    total: {},
    cycleUnit: [],
    rolesUser: {},
    detailinfo: [],
    planDetaileData: {}, // 计划 详情
    formData: [],
    formDangerData: [],
    mtInfo: [],
    placeInfo: [],
    materialInfo: [],
    mlDetaile: [],
    locData: [],
    paginations: {
      current: 1,
      pageSize: 10,
      total: 0,
    }, // 计划列表分页
    taskPaginations: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    areaData: [], // 新建计划区域列表
    cacheAreaData: [],
    functionData: [], //  计划和任务tab页数据
    userData: [], // 新建计划责任人列表
    workStatus: [], // 工单状态列表
    planData: [], // 计划性维护计划列表
    planTotal: 0, // 计划总数
    cacheFormData: {}, //
    eqData: [],
    taskList: [], // 任务列表
    stationList: [], // 新建计划站点列表
    stationData: [], // 列表站点
    areaEqData: [], // 新建计划设备数据
    vaLoading: false, // 导入计划按钮验证状态
    impLoading: false, // 导入按钮状态
    eqTotal: null, // 设备总数
    activeKey: null, // 计划tab页key
    functionKey: null, // 作业类型key
    funcList: {}, // 作业类型数组
    userInfo: [], // 企业下用户信息
    areaId: null,
    eqTableLoading: false, // 设备查询的loading
    searchTaskParams: {
      pageno: 1,
      pagesize: 10,
      stationId: null, // 站点
      others: null, // 关键字
      workOrderStatus: null, // 工单状态
      status: null, // 维保状态
      createTime1: null, // 创建开始时间
      createTime2: null, // 创建结束时间
      startTime: null, // 要求完成时间开始时间
      endTime: null, // 要求完成时间结束时间
      activitiCode: null, // 作业流程
      functionKey: null, // 作业类型
    },
    searchPlanParams: {
      pageno: 1,
      pagesize: 10,
      stationId: null,
      others: null,
      functionKey: null,
    },
    rowIndex: null,
  },
  effects: {
    // 查询function列表 即计划性维护和工商户tab页
    * getFunctionData({ callback, payload }, { call, put }) {
      const res = yield call(getFunctionData, payload);
      const funcList = {};
      let activeKey = '';
      let functionKey = '';
      if (res.data && res.data.length !== 0) {
        activeKey = res.data[0].functionKey;
        res.data.forEach((item, index) => {
          if (index === 0) {
            functionKey = res.data[0].children && res.data[0].children.length !== 0 ? res.data[0].children[0].functionKey : null;
          }
          (item.children || []).forEach(item2 => {
            funcList[`${item.functionKey}_${item2.functionKey}`] = item2;
          });
        });
      }
      yield put({
        type: 'functionKeySave',
        payload: functionKey,
      });
      yield put({
        type: 'funcListSave',
        payload: funcList,
      });
      yield put({
        type: 'activeKeySave',
        payload: activeKey,
      });
      yield put({
        type: 'functionDataSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    // 查询预防性维护计划列表
    * queryPrePlanData2({ payload }, { call, put }) {
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      const response = yield call(queryPrePlanData, payload);
      yield put({
        type: 'savePlanData',
        payload: { ...response, key: payload.functionKey || 'all' },
        paginations: payload,
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
    },
    // 查询预防性维护计划列表
    * queryPrePlanData({ payload }, { call, put }) {
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      yield put({ type: 'searchPlanParamsSave', payload});
      const response = yield call(queryPrePlanData, payload);
      yield put({
        type: 'planDataSave',
        payload: response,
        paginations: payload,
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
    },
    // 根据站点查询责任人数据
    *getUserDataByStation({ payload }, { call, put }) {
      const res = yield call(getUserDataByStation, payload);
      yield put({
        type: 'userDataSave',
        payload: res.data || [],
      });
    },
    // 获取所属组织
    *getStationListByType({ payload }, { call, put }) {
      const res = yield call(getStationListByType, payload);
      const parentData = [];
      const childrenData = [];
      let stationData = [];
      (res.data || []).forEach(ele => {
        if (ele.locType === 'ZONE') {
          childrenData.push(ele);
        } else if (ele.locType === 'SITE') {
          parentData.push(ele);
        }
      });
      if (parentData.length !== 0) {
        parentData.forEach(item => {
          const parent = { ...item };
          const children = childrenData.filter(item2 => item2.parentId === item.gid);
          parent.children = children;
          stationData.push(parent);
        });
      } else {
        stationData = childrenData;
      }
      yield put({
        type: 'stationListSave',
        payload: stationData || [],
        stationData: res.data,
      });
    },
    // 根据计划id查询任务列表
    * queryTaskList({ payload }, { call, put }) {
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      const res = yield call(queryTasks, payload);
      yield put({
        type: 'taskDataSave',
        payload: { ...res },
        paginations: payload,
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
    },
    // 根据计划id查询任务列表
    * getTaskListById({ payload }, { call, put }) {
      const res = yield call(getTaskListById, payload);
      yield put({
        type: 'taskListSave',
        payload: { ...res },
        paginations: payload,
      });
    },
    // 查询任务总览
    * queryTasks({ payload }, { call, put }) {
      yield put({type: 'searchTaskParamsSave', payload});
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      const res = yield call(queryTasks, payload);
      yield put({
        type: 'taskDataSave',
        payload: { ...res },
        paginations: payload,
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
    },
    // 根据计划id查看详情
    * queryPlanDetaile({ payload, callback }, { call, put }) {
      const res = yield call(queryPlanDetaile, payload);
      yield put({
        type: 'planDetaileSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    // 根据任务id查询任务详情
    * getDetailinfo({ payload, callback }, { call, put }) {
      const res = yield call(getDetailinfo, payload);
      yield put({
        type: 'detailinfoSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    // 根据formID查询formData
    * getFormData({ payload, callback }, { call, put }) {
      const res = yield call(getFormData, payload);
      yield put({
        type: 'formDataSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    * getDangerFormData({ payload, callback }, { call, put }) {
      const res = yield call(getDangerFormData, payload);
      yield put({
        type: 'formDangerDataSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    // 获取站点数据
    * getStationData({ callback }, { call, put }) {
      const res1 = yield call(getStationDataByType);
      yield put({
        type: 'changeStations',
        payload: res1.data,
      });
    },
    *getStationUserByEcode({ callback }, { call, put }) {
      const res1 = yield call(getStationUserByEcode);
      yield put({
        type: 'userInfoSave',
        payload: res1.data,
      });
    },
    // 获取周期数据
    *fetchCycleUnit({ _ }, { call, put }) {
      const res = yield call(fetchCycleUnit);
      yield put({
        type: 'saveUnits',
        payload: res.data || [],
      });
    },
    // 查询领料移动类型
    *queryMtInfo({ payload }, { call, put }) {
      const res = yield call(queryMtInfo);
      yield put({
        type: 'mtInfoSave',
        payload: res.data || [],
      });
    },
    // 查询公司工厂库存地信息
    *queryPlaceInfo({ payload, callback }, { call, put }) {
      const res = yield call(queryPlaceInfo);
      if (res.data.length > 0) {
        const res1 = yield call(queryGysByBukrs, { bukrs: res.data[0].ccode });
        res.data[0].supplier = res1.data;
      }
      yield put({
        type: 'placeInfoSave',
        payload: res.data || [],
      });
      callback && callback(res.data || []);
    },
    // 查询领料成功
    *queryMaterialInfo({ payload, callback }, { call, put }) {
      const res = yield call(queryMaterialInfo, payload);
      yield put({
        type: 'materialInfoSave',
        payload: res.data || [],
      });
      callback && callback(res.total);
    },
    // 根据工单号查询领料反馈信息
    *queryMaterialDetaile({ payload, callback }, { call, put }) {
      const res = yield call(queryMaterialDetaile, payload);
      yield put({
        type: 'mlDetaileSave',
        payload: res.data || [],
      });
      callback && callback(res.data || []);
    },
    // 上传附件
    *updateAtt({ payload, callback }, { call, put }) {
      let flag = true;
      const { formData, userInfo, attInfo } = payload;
      for (let i = 0; i < formData.length; i++) {
        formData[i].value.append('userid', userInfo.gid);
        formData[i].value.append('username', userInfo.trueName);
        formData[i].value.append('tablename', attInfo.tablename);
        formData[i].value.append('gid', attInfo.gid);
        formData[i].value.append('tabletype', '0');
        formData[i].value.append('field', formData[i].name);
        formData[i].value.append('columns', 'businesskey,name,text');
        const res = yield call(submitAttInfo, formData[i].value);
        if (!res.success) {
          message.error(res.msg);
          flag = false;
        }
      }
      callback(flag);
    },
    // 导入计划验证
    *exportPlan({ payload, callback }, { call, put }) {
      yield put({
        type: 'vaLoadingChange',
        payload: true,
      });
      const res = yield call(exportPlan, payload);
      yield put({
        type: 'vaLoadingChange',
        payload: false,
      });
      if (callback && res) {
        callback(res);
      }
    },
    // 导入计划
    *importPlan({ payload, callback }, { call, put }) {
      yield put({
        type: 'impLoadingChange',
        payload: true,
      });
      const res = yield call(importPlan, payload);
      yield put({
        type: 'impLoadingChange',
        payload: false,
      });
      if (callback && res) {
        callback(res);
      }
    },
    // 保存采购订单信息
    *savePurchaseOrderInfo({ payload, callback }, { call }) {
      const res = yield call(savePurchaseOrderInfo, payload);
      callback && callback(res);
    },
    // 初始化采购订单信息
    *initPurchaseOrderInfo({ payload, callback }, { call }) {
      const res = yield call(initPurchaseOrderInfo, payload);
      callback && callback(res);
    },
    // 保存领料信息
    *savePickingData({ payload, callback }, { call }) {
      const res = yield call(savePickingData, payload);
      callback && callback(res);
    },
    // 新建计划性常规维护计划
    * addPreMaintenPlan({ payload, callback }, { call }) {
      const res = yield call(addPreMaintenPlan, payload);
      callback && callback(res);
    },
    // 添加计划性临时计划
    * addTempPreMaintenPlan({ payload, callback }, { call }) {
      const res = yield call(addTempPreMaintenPlan, payload);
      callback && callback(res);
    },
    // 批量删除任务
    * delTasks({ payload, callback }, { call }) {
      const res = yield call(delTasks, payload);
      callback && callback(res);
    },
    // 批量编辑任务
    *editTasks({ payload, callback }, { call }) {
      const res = yield call(editTasks, payload);
      callback && callback(res);
    },
    // 编辑预防性维护计划
    * editPreMaintenPlan({ payload, callback }, { call }) {
      const res = yield call(editPlan, payload);
      callback && callback(res);
    },
    // 保存表单反馈内容
    * saveFormData({ payload, callback }, { call, put }) {
      const res = yield call(saveFormData, payload);
      callback && callback(res);
    },
    // 取消任务
    * cancelTask({ payload, callback }, { call, put }) {
      const res = yield call(cancelTask, payload);
      if (callback) {
        callback(res);
      }
    },
    // 停止计划
    * stopplan({ payload, callback }, { call, put }) {
      const res = yield call(stopplan, payload);
      callback && callback(res);
    },
    // 开始计划
    * startplan({ payload, callback }, { call, put }) {
      const res = yield call(startplan, payload);
      callback && callback(res);
    },
    // 删除计划
    * delplan({ payload, callback }, { call, put }) {
      const res = yield call(delplan, payload);
      callback && callback(res);
    },
    // 查设备
    *queryAreaEq({ payload, callback }, { call, put }) {
      yield put({
        type: 'eqTableLoadingChange',
        payload: true,
      });
      const res = yield call(queryAreaEq, payload);
      yield put({
        type: 'eqTableLoadingChange',
        payload: false,
      });
      yield put({
        type: 'areaEqDataSave',
        payload: res.data || [],
      });
      yield put({
        type: 'eqTotalSave',
        payload: res.total || 0,
      });
      callback && callback(res.data, res.total);
    },
    // 查工商户
    *queryAreaGsh({ payload, callback }, { call, put }) {
      const res = yield call(queryAreaGsh, payload);
      yield put({
        type: 'areaEqDataSave',
        payload: res.data || [],
      });
      yield put({
        type: 'eqTotalSave',
        payload: res.total || 0,
      });
      callback && callback(res.data, res.total);
    },
    // 查询位置
    * queryLocation({ payload, callback }, { call, put }) {
      const res = yield call(queryLocation, payload);
      yield put({
        type: 'locationSave',
        payload: res.data.list || [],
      });
      callback && callback(res);
    },
    // 获取区域
    *getAreaData({ payload, callback }, { call, put }) {
      Object.assign(payload, { isShowKeyPoint: 1 });
      const res = yield call(getAreaData, payload);
      if (!res.success) {
        message.warn(res.msg);
        return;
      }
      yield put({
        type: 'areaDataSave',
        payload: res.data || [],
      });
      callback && callback(res.data);
    },
    // 获取工单状态
    *getWorkStatus({ payload }, { call, put }) {
      const res = yield call(getWorkStatus, payload);
      yield put({
        type: 'workStatusSave',
        payload: res.states || [],
      });
    },
  },
  reducers: {
    taskDataSave(state, action) {
      const { data, total } = action.payload;
      const { pageno, pagesize } = action.paginations;
      return {
        ...state,
        taskData: data,
        taskPaginations: {
          ...state.taskPaginations,
          current: pageno,
          pageSize: pagesize,
          total,
        },
      };
    },
    taskListSave(state, action) {
      const { data, total } = action.payload;
      const { pageno, pagesize } = action.paginations;
      return {
        ...state,
        taskList: data,
        taskPaginations: {
          ...state.taskPaginations,
          current: pageno,
          pageSize: pagesize,
          total,
        },
      };
    },
    vaLoadingChange(state, action) {
      return {
        ...state,
        vaLoading: action.payload,
      };
    },
    impLoadingChange(state, action) {
      return {
        ...state,
        impLoading: action.payload,
      };
    },
    functionKeySave(state, action) {
      return {
        ...state,
        functionKey: action.payload,
      };
    },
    funcListSave(state, action) {
      return {
        ...state,
        funcList: action.payload,
      };
    },
    activeKeySave(state, action) {
      return {
        ...state,
        activeKey: action.payload,
      };
    },
    eqTotalSave(state, action) {
      return {
        ...state,
        eqTotal: action.payload,
      };
    },
    areaEqDataSave(state, action) {
      return {
        ...state,
        areaEqData: action.payload,
      };
    },
    eqTableLoadingChange(state, action) {
      return {
        ...state,
        eqTableLoading: action.payload,
      };
    },
    // gshTotalSave(state, action) {
    //   return {
    //     ...state,
    //     gshTotal: action.payload,
    //   };
    // },
    // areaGshDataSave(state, action) {
    //   return {
    //     ...state,
    //     areaGshData: action.payload,
    //   };
    // },
    formDataSave(state, action) {
      return {
        ...state,
        formData: action.payload,
      };
    },
    formDangerDataSave(state, action) {
      return {
        ...state,
        formDangerData: action.payload,
      };
    },
    detailinfoSave(state, action) {
      return {
        ...state,
        detailinfo: action.payload,
      };
    },
    planDetaileSave(state, action) {
      return {
        ...state,
        planDetaileData: action.payload,
      };
    },
    mtInfoSave(state, action) {
      return {
        ...state,
        mtInfo: action.payload,
      };
    },
    materialInfoSave(state, action) {
      return {
        ...state,
        materialInfo: action.payload,
      };
    },
    mlDetaileSave(state, action) {
      return {
        ...state,
        mlDetaile: action.payload,
      };
    },
    placeInfoSave(state, action) {
      return {
        ...state,
        placeInfo: action.payload,
      };
    },
    changeStations(state, action) {
      return {
        ...state,
        stations: action.payload,
      };
    },
    userInfoSave(state, action) {
      return {
        ...state,
        userInfo: action.payload,
      };
    },
    stationListSave(state, action) {
      return {
        ...state,
        stationList: action.payload,
        stationData: action.stationData,
      };
    },
    saveUser(state, action) {
      const { key, data } = action.payload;
      return {
        ...state,
        rolesUser: { ...state.rolesUser, [key]: data },
      };
    },
    areaIdChange(state, action) {
      return {
        ...state,
        areaId: action.payload,
      };
    },
    equSave(state, action) {
      return {
        ...state,
        equList: action.payload,
      };
    },
    savePlanData(state, action) {
      const { key, data, total } = action.payload;
      const { pageno, pagesize } = action.paginations;
      return {
        ...state,
        data: { ...state.data, [key]: data },
        total: { ...state.total, [key]: total },
        paginations: {
          ...state.paginations,
          current: pageno,
          pageSize: pagesize,
          total,
        },
      };
    },
    planDataSave(state, action) {
      const { pageno, pagesize } = action.paginations;
      return {
        ...state,
        planData: action.payload.data,
        planTotal: action.payload.total,
        paginations: {
          ...state.paginations,
          current: pageno,
          pageSize: pagesize,
          total: action.payload.total,
        },
      };
    },
    changePlanLoading(state, { payload }) {
      return {
        ...state,
        planLoading: payload,
      };
    },
    locationSave(state, { payload }) {
      return {
        ...state,
        locData: payload,
      };
    },
    saveUnits(state, { payload }) {
      return {
        ...state,
        cycleUnit: payload,
      };
    },
    areaDataSave(state, { payload }) {
      return {
        ...state,
        areaData: payload,
      };
    },
    cacheDataSave(state, { payload }) {
      return {
        ...state,
        cacheAreaData: payload,
      };
    },
    functionDataSave(state, { payload }) {
      return {
        ...state,
        functionData: payload,
      };
    },
    userDataSave(state, { payload }) {
      return {
        ...state,
        userData: payload,
      };
    },
    workStatusSave(state, { payload }) {
      return {
        ...state,
        workStatus: payload,
      };
    },
    cacheFormData(state, { payload }) {
      return {
        ...state,
        cacheFormData: payload,
      };
    },
    cacheEqData(state, { payload }) {
      return {
        ...state,
        eqData: payload,
      };
    },
    searchTaskParamsSave(state, { payload }) {
      return {
        ...state,
        searchTaskParams: payload,
      };
    },
    searchPlanParamsSave(state, { payload }) {
      return {
        ...state,
        searchPlanParams: payload,
      };
    },
    rowIndexSave(state, action) {
      return {
        ...state,
        rowIndex: action.payload,
      };
    },
  },
};
