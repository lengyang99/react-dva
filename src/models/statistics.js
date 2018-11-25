import { message } from 'antd';
import {
  queryKeyPonitList,
  queryThridConList,
  queryStationList,
  queryMaintaceList,
  queryFunctionList,
  queryScoreCount,
  getPatrolTaskAnalysis,
  getPDSFReport
} from '../services/statistics';

export default {
  namespace: 'statistics',
  state: {
    keyPonitData: [], // 关键点巡视
    maintaceData: [], // 养护任务
    thridConData: [], // 第三方施工
    scoreData: {}, // 计分
    stationData: [], // 所属辖区
    functionData: [], // 作业类型
    total: '', // 总数
    patrolTaskStatisticInfo: [], // 巡线任务统计数据
    patrolTaskTotal: 0, // 巡线任务总数
    pThirdConData: [], // 推广：第三方施工
  },
  effects: {
    // 统计关键点巡视
    *queryKeyPonitList({ payload }, { call, put }) {
      const res = yield call(queryKeyPonitList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'keyPonitDataSave',
        payload: res.data,
        total: res.total,
      });
    },
    // 统计养护任务
    *queryMaintaceList({ payload }, { call, put }) {
      const res = yield call(queryMaintaceList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'maintaceDataSave',
        payload: res.data,
        total: res.total,
      });
    },
    // 获取站点
    *getStationData({ callback }, { call, put }) {
      const res = yield call(queryStationList);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'stationDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
    // 统计第三方施工
    *queryThridConList({ payload, callback }, { call, put }) {
      const res = yield call(queryThridConList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'thridConDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
    // 计分统计
    *queryScoreCount({ payload, callback }, { call, put }) {
      const res = yield call(queryScoreCount, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'scoreDataSave',
        payload: res,
        total: res.total,
      });
      if (callback) {
        callback(res);
      }
    },
    // 作业列表
    *getFunctionData({ payload }, { call, put }) {
      const res = yield call(queryFunctionList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'functionDataSave',
        payload: res.data,
      });
    },
    // 巡线任务统计
    *getPatrolTaskAnalysis({ payload }, { call, put }) {
      const res = yield call(getPatrolTaskAnalysis, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'savePatrolTaskStatisticInfo',
        payload: res.data,
        total: res.total,
      });
    },
    // 推广：第三方施工统计
    *getPDSFReport({ payload, callback }, { call, put }) {
      const res = yield call(getPDSFReport, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'savePromotionThirdConData',
        payload: res.data,
      });
      callback && callback(res.data);
    },
  },
  reducers: {
    keyPonitDataSave(state, action) {
      return {
        ...state,
        keyPonitData: action.payload,
        total: action.total,
      };
    },
    maintaceDataSave(state, action) {
      return {
        ...state,
        maintaceData: action.payload,
        total: action.total,
      };
    },
    stationDataSave(state, action) {
      return {
        ...state,
        stationData: action.payload,
      };
    },
    thridConDataSave(state, action) {
      return {
        ...state,
        thridConData: action.payload,
      };
    },
    scoreDataSave(state, action) {
      return {
        ...state,
        scoreData: action.payload,
        total: action.total,
      };
    },
    functionDataSave(state, action) {
      return {
        ...state,
        functionData: action.payload,
      };
    },
    savePatrolTaskStatisticInfo(state, action) {
      return {
        ...state,
        patrolTaskStatisticInfo: action.payload,
        patrolTaskTotal: action.total,
      };
    },
    savePromotionThirdConData(state, action) {
      return {
        ...state,
        pThirdConData: action.payload,
      };
    },
  },
};

