import { message } from 'antd';
import { queryEventData, startCZProcess, queryEventDetailData, queryEventTypeData, endEvent, getCZStartFormData, getDictByKeys } from '../services/event';
import { getWoFormData, submitWoPlanForm } from '../services/submitFormManage';

export default {
  namespace: 'czmanage',
  state: {
    eventData: [],
    eventTotal: '0',
    eventDatailData: {},
    eventTypeData: [],
    checkNum: [],
    startFormData: {
      params: [],
    },
    stations: [],
  },
  effects: {
    *getStations({payload}, {call, put}) {
      const res = yield call(getDictByKeys, payload);
      const data = res[payload.key];
      yield put({
        type: 'saveStations',
        payload: res[payload.key],
      });
    },
    *getEventData({ payload }, { call, put }) {
      const res = yield call(queryEventData, payload);
      // if(!res.isSuccess){
      //   message.error(res.msg);
      //   return;
      // }
      yield put({
        type: 'changeEventData',
        payload: res,
      });
    },
    *getEventDetailData({ payload }, { call, put }) {
      const res = yield call(queryEventDetailData, payload);
      // if(!res.success){
      //   message.error(res.msg);
      //   return;
      // }
      yield put({
        type: 'changeEventDetailData',
        payload: res,
      });
    },
    *getEventTypeData({ payload }, { call, put }) {
      const res = yield call(queryEventTypeData, payload);
      // if(!res.success){
      //   message.error(res.msg);
      //   return;
      // }
      yield put({
        type: 'changeEventTypeData',
        payload: res.eventmenu,
      });
    },
    *startCZProcess({ payload, callback }, { call, put }) {
      const res = yield call(startCZProcess, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *startWoProcess({ payload, callback }, { call, put }) {
      const res = yield call(submitWoPlanForm, payload);
      callback && callback(res);
    },
    *closeEvent({ payload, callback }, { call, put }) {
      const res = yield call(endEvent, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getWoPlanStartFormData({ payload, callback }, { call, put }) {
      const res = yield call(getWoFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeStartFormData',
        payload: res,
      });
      callback && callback(res);
    },
    *getCZStartFormData({ payload, callback }, { call, put }) {
      const res = yield call(getCZStartFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const params = res.params;
      if (!payload.flag) {
        for (let i = 0; i < params.length; i++) {
          let name = 'repair_type';
          if (name.indexOf(params[i].name) > -1) {
            params[i].edit = 0;
            break;
          }
        }
        res.params = params;
      }
      yield put({
        type: 'changeStartFormData',
        payload: res,
      });
      callback && callback(res);
    },
  },
  reducers: {
    saveStations(state, action) {
      return {
        ...state,
        stations: action.payload,
      };
    },
    changeEventData(state, action) {
      return {
        ...state,
        eventData: action.payload.eventlist,
        eventTotal: action.payload.total,
        checkNum: action.payload.num,
      };
    },
    changeEventDetailData(state, action) {
      return {
        ...state,
        eventDatailData: action.payload,
      };
    },
    changeEventTypeData(state, action) {
      return {
        ...state,
        eventTypeData: action.payload,
      };
    },
    changeStartFormData(state, action) {
      return {
        ...state,
        startFormData: action.payload,
      };
    },
  },
};

