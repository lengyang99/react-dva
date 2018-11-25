import { message } from 'antd';
import { queryEventData, startCZProcess, queryEventDetailData, queryEventTypeData, endEvent, getCZStartFormData, getDictByKeys } from '../services/event';
import { getWoPlanWorkorderList, getTaskFormData, submitTaskFormData, submitAttInfo } from '../services/workOrder';

export default {
  namespace: 'woPlanManage',
  state: {
    woData: {
      features: [],
      fields: [],
      total: 0,
    },
    processlist: [],
    tab: [{name: '', url: ''}],
    detailInfo: {},
    userTask: [],
    taskFormData: {
      params: [],
      cascade: {},
    },
    startFormData: {
      params: [],
    },
  },
  effects: {
    *getWoPlanWorkorderList({ payload }, { call, put }) {
      const res = yield call(getWoPlanWorkorderList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeWorkorderList',
        payload: res,
      });
    },
    *getTaskFormData({ payload, callback }, { call, put }) {
      const res = yield call(getTaskFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeTaskFormData',
        payload: res,
      });
      callback && callback(res);
    },
    *submitTaskFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitTaskFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *submitAttach({formData, attInfo, user, callback}, { call, put } ) {
      let flag = true;
      for (let i = 0; i < formData.length; i++) {
        formData[i].value.append('userid', user.gid);
        formData[i].value.append('username', user.username);
        formData[i].value.append('tablename', attInfo.tablename);
        formData[i].value.append('gid', attInfo.gid);
        formData[i].value.append('tabletype', '1');
        formData[i].value.append('columns', formData[i].name);
        const res = yield call(submitAttInfo, formData[i].value);
        if (!res.success) {
          message.error(res.msg);
          flag = false;
        }
      }
      callback(flag);
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
  },
  reducers: {
    changeWorkorderList(state, action) {
      return {
        ...state,
        woData: action.payload,
      };
    },
    changeTaskFormData(state, action) {
      return {
        ...state,
        taskFormData: action.payload,
      };
    }
  },
};

