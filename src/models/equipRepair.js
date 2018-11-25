import { message } from 'antd';
import { queryRepairEventData, getEventEditInfo, queryEventDetailData, queryEventTypeData, endEvent, getCZStartFormData, getDictByKeys, getRepairFormData, submitRepairFormData, getZhiDingFormData, submitZhiDingFormData, submitEditFormData } from '../services/event';
import { getWoFormData, submitAttInfo, getFormData, reportFormEvent } from '../services/submitFormManage';

export default {
  namespace: 'equipRepair',
  state: {
    fields: [],
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
    *getStations({ payload }, { call, put }) {
      const res = yield call(getDictByKeys, payload);
      const data = res[payload.key];
      yield put({
        type: 'saveStations',
        payload: res[payload.key],
      });
    },
    *getEventEditInfo({ payload, callback }, { call, put }) {
      const res = yield call(getEventEditInfo, payload);
      try {
        for (const elem of res.params[0].items.values()) {
          elem.value = res.rtjson[elem.name] || '';
        }
        yield put({
          type: 'changeStartFormData',
          payload: { params: res.params[0].items },
        });
        callback && callback(res.params[0].items);
      } catch (e) {
        console.log(e);
      }
    },
    *getEventData({ payload }, { call, put }) {
      const res = yield call(queryRepairEventData, payload);
      if (!res.isSuccess) {
        message.error(res.msg);
        return;
      }
      const eventData = [];
      res.features.forEach((item) => {
        eventData.push(item.attributes);
      });
      yield put({
        type: 'changeEventData',
        payload: {
          fields: res.fields,
          eventlist: eventData,
          total: res.total,
          num: res.num,
        },
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
    *submitEditFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitEditFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
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
        fields: action.payload.fields,
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

