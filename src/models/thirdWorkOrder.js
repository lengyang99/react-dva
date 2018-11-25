import { message } from 'antd';
import { getWorkorderListByFunName, processlist, detailtab, getOneDetail, getUserTask,
  getTaskFormData, submitTaskFormData, selectFileInfoById, submitAttInfo, getStartFormData, submitStartFormData, getWorkorderFormData } from '../services/workOrder';
import { reportFormEvent } from '../services/submitFormManage';

export default {
  namespace: 'thirdWorkOrder',
  state: {
    fieldList: [],
    workOrderList: [],
    checkNum: {},
    workOrderTotal: '0',
    processlist: [],
    tab: [{name: '', url: ''}],
    detailInfo: {},
    userTask: [],
    taskFormData: {
      params: [],
      cascade: {},
    },
  },
  effects: {
    *getWorkorderList({ queryType, payload, callback }, { call, put }) {
      const res = yield call(getWorkorderListByFunName, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      res.params = [];
      res.features.forEach((item, index) => {
        res.params.push(item.attributes);
      });
      if (queryType === 'all') {
        callback && callback(res.params);
      } else {
        yield put({
          type: 'changeSelectFieldworkList',
          payload: res,
        });
      }
    },
    *getProcesslist({ payload }, { call, put }) {
      const res = yield call(processlist, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeProcesslist',
        payload: res.items,
      });
    },
    *getDetailtab({ payload, callback }, { call, put }) {
      const res = yield call(detailtab, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeDetailtab',
        payload: res.tab,
      });
      callback && callback(res.tab);
    },
    *getAllDetail({ payload }, { call, put, select }) {
      let payloadJson = {};
      let res = yield call(getOneDetail, payload.url);

      if (!(res.type && res.type === 'repairList') && res.params && res.params.length > 1) {
        for (let i = 0; i < res.params.length; i++) {
          let restmp = yield call(getOneDetail, res.params[i].url + payload.urlExtra);
          if(!restmp.success){
            message.error(restmp.msg);
            return;
          }
          res.params[i].items = restmp.params[0].items;
        }
      }
      const workOrder = yield select(state => state.workOrder);
      let detailInfo = workOrder.detailInfo;
      detailInfo[payload.formName] = res;
      yield put({
        type: 'changeAllDetail',
        payload: Object.assign({}, detailInfo) ,
      });
    },
    *getUserTask({ payload }, { call, put }) {
      const res = yield call(getUserTask, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeUserTask',
        payload: res.items,
      });
    },
    *getTaskFormData({ payload, callback }, { call, put }) {
      const res = yield call(getTaskFormData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeTaskFormData',
        payload: res,
      });
      callback && callback(res);
    },
    *getStartFormData({ payload, callback }, { call, put }) {
      const res = yield call(getStartFormData, payload);
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
    *getWorkorderFormData({ payload, callback }, { call, put }) {
      const res = yield call(getWorkorderFormData, payload);
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
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *submitStartFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitStartFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *reportEventFormData({ payload, callback }, { call, put }) {
      const res = yield call(reportFormEvent, payload);
      callback(res);
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
  },
  reducers: {
    changeSelectFieldworkList(state, action) {
      return {
        ...state,
        checkNum: action.payload.statisticInfo,
        fieldList: action.payload.fields,
        workOrderList: action.payload.params,
        workOrderTotal: action.payload.total,
      };
    },
    changeProcesslist(state, action) {
      return {
        ...state,
        processlist: action.payload,
      };
    },
    changeDetailtab(state, action) {
      let tabs = action.payload;
      // let tabJsons = {};
      // tabs.map((tab, i) => {tabJsons[tab.name] = {}});
      return {
        ...state,
        tab: action.payload,
        // AllDetail: tabJsons,
      };
    },
    changeAllDetail(state, action) {
      return {
        ...state,
        detailInfo: action.payload,
      };
    },
    changeUserTask(state, action) {
      return {
        ...state,
        userTask: action.payload,
      };
    },
    changeTaskFormData(state, action) {
      return {
        ...state,
        taskFormData: action.payload,
      };
    },
  },
};

