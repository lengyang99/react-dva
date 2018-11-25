import { message} from 'antd';
import { getSchedulData, queryFeedbackUsers, addSchedulData, copySchedulData, canCopy} from '../services/IntelliSche';
import { getStationData, queryClassManage, queryTeamManage} from '../services/station';

export default {
  namespace: 'IntelliSche',
  state: {
    schedulData: [],
    stationData: [],
    bcData: [],
    cacheBcData: [],
    bzData: [],
    userData: [],
  },
  effects: {
    // 查询排班信息
    * getSchedulData({payload, callback}, { call, put }) {
      const res = yield call(getSchedulData, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      if (callback) {
        callback(res.data);
      }
    },
    // 添加排班信息
    * addSchedulData({payload, callback}, { call}) {
      const res = yield call(addSchedulData, payload);
      if (callback) {
        callback(res);
      }
    },
    // 复制排班信息
    * copySchedulData({payload, callback}, { call}) {
      const res = yield call(copySchedulData, payload);
      if (callback) {
        callback(res);
      }
    },
    // 验证是否能复制
    * canCopy({payload, callback}, { call}) {
      const res = yield call(canCopy, payload);
      if (callback) {
        callback(res);
      }
    },
    // 站点列表
    * getStationData({payload, callback}, { call, put }) {
      const res = yield call(getStationData, payload);
      if (!res.success) {
        message.info(res.msg);
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
    // 站点人员信息
    * getUserData({payload, callback}, { call, put }) {
      const res = yield call(queryFeedbackUsers, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      yield put({
        type: 'userDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
    // 班次信息
    * getBcData({payload, callback}, { call, put }) {
      const res = yield call(queryClassManage, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      yield put({
        type: 'bcDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
    // 班组信息
    * getBzData({payload, callback}, { call, put }) {
      const res = yield call(queryTeamManage, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      yield put({
        type: 'bzDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
  },
  reducers: {
    schedulDataSave(state, {payload}) {
      return {
        ...state,
        schedulData: payload,
      };
    },
    stationDataSave(state, {payload}) {
      return {
        ...state,
        stationData: payload,
      };
    },
    userDataSave(state, {payload}) {
      return {
        ...state,
        userData: payload,
      };
    },
    bcDataChange(state, {payload}) {
      return {
        ...state,
        bcData: payload,
      };
    },
    bcDataSave(state, {payload}) {
      return {
        ...state,
        bcData: payload,
        cacheBcData: payload,
      };
    },
    bzDataSave(state, {payload}) {
      return {
        ...state,
        bzData: payload,
      };
    },
  },
};
