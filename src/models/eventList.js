import { message } from 'antd';
import {
  queryEventData,
  queryEventDetailData,
  queryEventTypeData,
  startProcess,
  endEvent,
  getStartFormData,
  getDictByKeys,
  getFormFields,
  updateGisInfo,
  exchangeCustomerDemand,
  submitRepairFormData,
  submitZhiDingFormData,
  getCZStartFormData,
  getRepairFormData,
  getZhiDingFormData,
} from '../services/event';
import { submitAttInfo, getFormData, reportFormEvent } from '../services/submitFormManage';
import { getOneDetail } from '../services/workOrder';

export default {
  namespace: 'event',
  state: {
    eventData: [],
    eventTotal: '0',
    eventDatailData: {
      params: [],
    },
    eventTypeData: [],
    checkNum: [],
    startFormData: {
      params: [],
    },
    stations: [],
  },
  effects: {
    *getStations({ payload }, { call, put }) {
      const res = yield call(getDictByKeys, payload);
      if (res.success) {
        message.info(res.msg);
        return;
      }
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
    *getEventDetailData({ payload, urlExtra, callback }, { call, put }) {
      const res = yield call(queryEventDetailData, payload);
      // if(!res.success){
      //   message.error(res.msg);
      //   return;
      // }
      if (res.params && res.params.length > 1) {
        for (let i = 0; i < res.params.length; i++) {
          if (res.params[i].url) {
            let restmp = yield call(getOneDetail, res.params[i].url + urlExtra);
            if (!restmp.success) {
              message.error(restmp.msg);
              return;
            }
            res.params[i].data = restmp;
          }
        }
      }
      yield put({
        type: 'changeEventDetailData',
        payload: res,
      });
      if (payload.btn) {
        callback(res);
      }
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
    *startProcess({ payload, callback }, { call, put }) {
      const res = yield call(startProcess, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
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
    *getStartFormData({ payload, callback }, { call, put }) {
      const res = yield call(getStartFormData, payload);
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
    *getFormFields({ payload, callback }, { call, put }) {
      const res = yield call(getFormFields, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeStartFormData',
        payload: { params: res.params[0].items },
      });
      callback && callback(res);
    },
    *updateGisInfo({ payload, callback }, { call, put }) {
      const res = yield call(updateGisInfo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *submitmaintainBackData({ payload, callback }, { call, put }) {
      const res = yield call(exchangeCustomerDemand, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getRepairFormData({ payload, callback }, { call, put }) {
      const res = yield call(getRepairFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.params.length === 0) {
        return;
      }
      res.params = res.params[0].items;
      res.tableName = '整改反馈';
      yield put({
        type: 'changeStartFormData',
        payload: res,
      });
      callback && callback(res);
    },
    *getZhiDingFormData({ payload, callback }, { call, put }) {
      const res = yield call(getZhiDingFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.params.length === 0) {
        return;
      }
      res.params = res.params[0].items;
      res.tableName = '隐患方案制定';
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
    *submitRepairFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitRepairFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *submitZhiDingFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitZhiDingFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getFormData({ payload, callback }, { call, put }) {
      const res = yield call(getFormData, payload);
      // if (!res.success) {
      //   message.error(res.msg);
      //   return;
      // }
      if (res.formType === 'event') {
        res.params = res.params[0].items;
      }
      yield put({
        type: 'changeStartFormData',
        payload: res,
      });
      callback && callback(res);
    },
    *reportFormEvent({ payload, callback }, { call, put }) {
      const res = yield call(reportFormEvent, payload);
      callback && callback(res);
    },
    *submitAttach({ formData, attInfo, userInfo, callback }, { call, put }) {
      let flag = true;
      let tabletype = attInfo.tableType === undefined ? '0' : attInfo.tableType;
      for (let i = 0; i < formData.length; i++) {
        let columns = 'businesskey,name,text';
        if (tabletype != 0) {
          columns = formData[i].name;
        }
        formData[i].value.append('userid', userInfo.gid);
        formData[i].value.append('username', userInfo.trueName);
        formData[i].value.append('tablename', attInfo.tablename);
        formData[i].value.append('gid', attInfo.gid);
        formData[i].value.append('tabletype', tabletype);
        formData[i].value.append('field', formData[i].name);
        formData[i].value.append('columns', columns);
        const res = yield call(submitAttInfo, formData[i].value);
        if (!res.success) {
          message.error(res.msg);
          flag = false;
        }
      }
      callback(flag);
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

