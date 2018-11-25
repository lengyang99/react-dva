import React, {Component} from 'react';
import {
  getDutyDetailForms,
  queryDutyList,
  queryUsersByStationId,
  queryDutyStatus,
  queryLastDutyData,
  submitJiaobanDutyList,
  submitZhibanDutyList,
  updateZhibanDuty,
  submitJiebanDuty,
  queryWorkTime,
} from '../services/DutyManage';

import {getStationData} from '../services/station';

export default {
  namespace: 'dutymanage',
  state: {
    stations: [],
    users: [],
    workTime: [],
    DutyList: {
      success: '',
      msg: '',
      data: {
        totalCount: 0,
        listCzZbrz: [],
      },
    },
    loading: false,
    lastDutyData: [],
    DutyDetail: {
      success: '',
      msg: '',
      data: {
        gid: '',
        ecode: '',
        stationCode: '',
        zbr: '',
        zbrq: '',
        bc: '',
        jiaobanr: '',
        jiebanr: '',
        jiebansj: '',
        jiaobansj: '',
        zbrid: '',
        jiebanrid: '',
        jiaobanrid: '',
        jiebanDetail: [],
        dangbanDetail: [],
        jiaobanDetail: [],
      },
    },
  },

  effects: {
    * getDutyDetailForms({payload}, {call, put}) {
      const res = yield call(getDutyDetailForms, payload);
      yield put({
        type: 'saveDutyDetailForms',
        payload: res,
      });
    },
    * queryDutyList({payload}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const res = yield call(queryDutyList, payload);
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      yield put({
        type: 'saveDutyList',
        payload: res,
      });
    },
    * getStationData(_, {call, put}) {
      const res = yield call(getStationData);
      if (res.data.length > 0) {
        yield put({
          type: 'saveStationData',
          payload: res.data,
        });
      }
    },

    *queryUsersByStationId({payload}, {call, put}) {
      const res = yield call(queryUsersByStationId, payload);
      yield put({
        type: 'saveUsers',
        payload: res.data,
      });
    },
    // 查询值班人状态
    *queryDutyStatus({payload, callback}, {call}) {
      const res = yield call(queryDutyStatus, payload);
      if (callback) {
        callback(res.data);
      }
    },
    // 查询最近上次次值班信息
    *queryLastDutyData({payload}, {call, put}) {
      const res = yield call(queryLastDutyData, payload);
      yield put({
        type: 'saveLastDuty',
        payload: res.data,
      });
    },
    // 查询班次
    *queryWorkTime({payload}, {call, put}) {
      const res = yield call(queryWorkTime, payload);
      yield put({
        type: 'saveWorkTime',
        payload: res.data,
      });
    },
    // 提交交班日志
    *submitJiaobanDutyList({payload, callback}, {call}) {
      const res = yield call(submitJiaobanDutyList, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 提交当班日志
    *submitZhibanDutyList({payload, callback}, {call}) {
      const res = yield call(submitZhibanDutyList, payload);
      if (callback && res) {
        callback(res);
      }
    },
    // 提交接班日志
    *submitJiebanDuty({payload, callback}, {call}) {
      const res = yield call(submitJiebanDuty, payload);
      console.log(res, '这个结果');
      if (callback && res) {
        callback(res);
      }
    },
    // 更新值班日志
    *updateZhibanDuty({payload, callback}, {call, put}) {
      const res = yield call(updateZhibanDuty, payload);
      if (callback && res) {
        callback(res);
      }
    },
  },
  reducers: {
    saveDutyDetailForms(state, action) {
      return {
        ...state,
        DutyDetail: action.payload,
      };
    },

    saveStationData(state, action) {
      return {
        ...state,
        stations: action.payload,
      };
    },
    saveDutyList(state, action) {
      return {
        ...state,
        DutyList: action.payload,
      };
    },
    saveLastDuty(state, action) {
      return {
        ...state,
        lastDutyData: action.payload,
      };
    },
    saveWorkTime(state, action) {
      return {
        ...state,
        workTime: action.payload,
      };
    },
    changeLoading(state, {payload}) {
      return {
        ...state,
        loading: payload,
      };
    },

    saveUsers(state, action) {
      return {
        ...state,
        users: action.payload,
      };
    },
  },
};
