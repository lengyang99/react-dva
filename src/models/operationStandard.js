import {
  queryOperaStandardList,
  readOperaStandard,
  addOperaStandard,
  editOperaStandard,
  getTaskType,
  queryOperaTypeList,
  readOperaType,
  addOperaType,
  editOperaType,
  getOperationData,
  getCatergoryData,
  validateFunction,
  validateParentFunction,
  validateStandard,
  stopStandard,
  startStandard,
  delOperaType,
  validateDelOperaType,
  validateDelCatergoryData,
  delCatergoryData,
  getEqTypeData,
  getAreaType,
  getFunctionGroup,
  addFile,
  refresh,
  getEventList,
} from '../services/operationStandard';

import {fetchCycleUnit} from '../services/device';

export default {
  namespace: 'operationStandard',
  state: {
    dataList: [], // 作业标准列表
    detailData: [],
    taskTypeData: [], // 任务类型
    unitData: [], // 周期
    total: 0,
    operaTypeData: [],
    typeDetailData: {},
    typeTotal: 0,
    operaData: [],
    catergoryData: [],
    eqFormData: {},
    cacheFormData: {},
    eqTypeData: [],
    areaTypeData: [],
    functionGroup: [],
    eventList: [],
    // 作业标准 搜索条件
    searchStandardParams: {
      likeValue: null,
      taskCategory: null,
      stateValue: null,
    },
    // 作业标准分页条件
    paginationMsg: {
      pageno: 1,
      pagesize: 10,
      total: 0,
    },
    // 作业标准选中行
    rowIndex: null,
  },
  effects: {
    // 查 作业标准
    * queryOperaStandardList({payload}, {call, put, select}) {
      const searchStandardParams = yield select(state => state.operationStandard.searchStandardParams);
      const {likeValue, taskCategory, stateValue} = searchStandardParams || {};
      const params = {others: likeValue, taskCategory, status: stateValue, ...payload};
      const res = yield call(queryOperaStandardList, params);
      yield put({
        type: 'saveDataList',
        payload: res.data || [],
        paginationMsg: {
          pageno: payload.pageno,
          pagesize: payload.pagesize,
          total: res.total,
        },
      });
    },
    // 获取周期数据
    *fetchCycleUnit({_}, {call, put}) {
      const res = yield call(fetchCycleUnit);
      yield put({
        type: 'saveUnits',
        payload: res.data || [],
      });
    },
    // 获取应用分类 functionGroup
    *getFunctionGroup({_}, {call, put}) {
      const res = yield call(getFunctionGroup);
      yield put({
        type: 'saveFunctionGroup',
        payload: res.data.function_groups || [],
      });
    },
    // 获取任务类型
    * getTaskType(_, {call, put}) {
      const res = yield call(getTaskType);
      if (res.data && Object.keys(res.data).length !== 0) {
        yield put({
          type: 'saveTaskType',
          payload: res.data.prevmaintain_task_type || [],
        });
      }
    },
    // 获取区域类型
    *getAreaType({ payload }, { call, put }) {
      const res = yield call(getAreaType, payload);
      yield put({
        type: 'areaTypeDataSave',
        payload: res.data || [],
      });
    },
    // 看 作业标准
    *readOperaStandard({payload, callback}, {call, put}) {
      const res = yield call(readOperaStandard, payload);
      yield put({
        type: 'saveDetailData',
        payload: res.data,
      });
      if (callback && res) {
        callback(res.data);
      }
    },
    // 增 作业标准
    *addOperaStandard({payload, callback}, {call}) {
      const res = yield call(addOperaStandard, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 改  作业标准
    *editOperaStandard({payload, callback}, {call}) {
      const res = yield call(editOperaStandard, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 停用 作业标准
    *stopStandard({payload, callback}, {call}) {
      const res = yield call(stopStandard, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 启用 作业标准
    *startStandard({payload, callback}, {call}) {
      const res = yield call(startStandard, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 查询作业类型
    * queryOperaTypeList({_}, {call, put, select}) {
      const searchStandardParams = yield select(state => state.operationStandard.searchStandardParams);
      const {likeValue, taskCategory, stateValue} = searchStandardParams || {};
      const params = {others: likeValue, parentFunctionKey: taskCategory, status: stateValue};
      const res = yield call(queryOperaTypeList, params);
      yield put({
        type: 'saveOperaTypeData',
        payload: res.data || [],
      });
    },
    // 作业类型详情
    *readOperaType({payload, callback}, {call, put}) {
      const res = yield call(readOperaType, payload);
      yield put({
        type: 'saveTypeDetailData',
        payload: res.data,
      });
      if (callback && res) {
        callback(res.data);
      }
    },
    // 作业流程
    *getEventList({payload}, {call, put}) {
      const res = yield call(getEventList, payload);
      yield put({
        type: 'saveEventList',
        payload: res.eventmenu,
      });
    },
    // 新增作业类型
    *addOperaType({payload, callback}, {call}) {
      const res = yield call(addOperaType, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 获取设备类型
    *getEqTypeData({payload, callback}, {call, put}) {
      const res = yield call(getEqTypeData, payload);
      yield put({
        type: 'saveEqTypeData',
        payload: res.data || [],
      });
      if (callback && res) {
        callback(res);
      }
    },
    // 编辑作业类型
    *editOperaType({payload, callback}, {call}) {
      const res = yield call(editOperaType, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 删除作业类型
    *delOperaType({payload, callback}, {call}) {
      const res = yield call(delOperaType, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 验证删除作业类
    *validateDelOperaType({payload, callback}, {call}) {
      const res = yield call(validateDelOperaType, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 作业标准下拉选
    *getOperationData({payload, callback}, {call, put}) {
      const res = yield call(getOperationData, payload);
      yield put({
        type: 'saveOperaData',
        payload: res.data || [],
      });
      if (callback && res) {
        callback(res.data);
      }
    },
    // 查询类型分类列表
    *getCatergoryData({callback, payload}, {call, put}) {
      const res = yield call(getCatergoryData, payload);
      yield put({
        type: 'saveCatergoryData',
        payload: res.data || [],
      });
      if (callback && res) {
        callback(res.data);
      }
    },
    // 作业标准上传附件
    *addAttach({callback, payload}, {call}) {
      const res = yield call(addFile, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 新建作业标准刷新
    *refresh(_, {call}) {
      yield call(refresh);
    },
    // 删除类型分类
    *delCatergoryData({callback, payload}, {call}) {
      const res = yield call(delCatergoryData, payload);
      if (callback && res) {
        callback(res);
      }
    },
    *validateDelCatergoryData({callback, payload}, {call}) {
      const res = yield call(validateDelCatergoryData, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 验证作业类型名称
    *validateFunction({callback, payload}, {call}) {
      const res = yield call(validateFunction, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 验证类型分类名称
    *validateParentFunction({ callback, payload }, { call }) {
      const res = yield call(validateParentFunction, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 验证类型分类名称
    *validateStandard({callback, payload}, {call}) {
      const res = yield call(validateStandard, payload);
      if (callback && res) {
        callback(res);
      }
    },
  },
  reducers: {
    saveDataList(state, action) {
      const {pageno, pagesize, total} = action.paginationMsg;
      return {
        ...state,
        dataList: action.payload,
        paginationMsg: {
          ...state.paginationMsg,
          pageno,
          pagesize,
          total,
        },
      };
    },
    saveDetailData(state, action) {
      return {
        ...state,
        detailData: action.payload,
      };
    },
    saveTaskType(state, action) {
      return {
        ...state,
        taskTypeData: action.payload,
      };
    },
    saveFunctionGroup(state, action) {
      return {
        ...state,
        functionGroup: action.payload,
      };
    },
    saveUnits(state, action) {
      return {
        ...state,
        unitData: action.payload,
      };
    },
    saveEventList(state, action) {
      return {
        ...state,
        eventList: action.payload,
      };
    },
    saveOperaTypeData(state, action) {
      return {
        ...state,
        operaTypeData: action.payload,
      };
    },
    paginationSave(state, action) {
      const {pageno, pagesize, total} = action.payload;
      return {
        ...state,
        paginationMsg: {
          ...state.paginationMsg,
          pageno,
          pagesize,
          total,
        },
      };
    },
    saveTypeDetailData(state, action) {
      return {
        ...state,
        typeDetailData: action.payload,
      };
    },
    saveOperaData(state, action) {
      return {
        ...state,
        operaData: action.payload,
      };
    },
    saveCatergoryData(state, action) {
      return {
        ...state,
        catergoryData: action.payload,
      };
    },
    saveEqTypeData(state, action) {
      return {
        ...state,
        eqTypeData: action.payload,
      };
    },
    areaTypeDataSave(state, {payload}) {
      return {
        ...state,
        areaTypeData: payload,
      };
    },
    cacheFormData(state, action) {
      return {
        ...state,
        cacheFormData: action.payload,
      };
    },
    cacheEqFormData(state, action) {
      return {
        ...state,
        eqFormData: action.payload,
      };
    },
    searchStandardParamsSave(state, action) {
      const {likeValue, taskCategory, stateValue} = action.payload;
      return {
        ...state,
        searchStandardParams: {
          ...state.searchStandardParams,
          likeValue,
          taskCategory,
          stateValue,
        },
      };
    },
    rowIndexSave(state, action) {
      return {
        ...state,
        rowIndex: action.payload,
      };
    },
    clearAll(state) {
      return {
        ...state,
        rowIndex: null,
        searchStandardParams: {
          ...state.searchStandardParams,
          likeValue: null,
          taskCategory: null,
          stateValue: null,
        },
        paginationMsg: {
          ...state.paginationMsg,
          pageno: 1,
          pagesize: 10,
          total: 0,
        },
      };
    },
  },
};
