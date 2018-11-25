import { message } from 'antd';
import { selectFieldworkList, queryInstanceTasks, processlist, processVerlist, detailtab, getOneDetail, getUserTask, submitApproiseData, getApproiseDetail,
  getTaskFormData, submitTaskFormData, selectFileInfoById, submitAttInfo, getApproiseFormData, getDetailFormByPro, getWorkorderFormData } from '../services/workOrder';
import { reportFormEvent } from '../services/submitFormManage';

export default {
  namespace: 'workOrder',
  state: {
    workOrderList: [],
    workOrderTotal: '0',
    processlist: [],
    processVerlist: {},
    tab: [{ name: '', url: '' }],
    detailInfo: {},
    userTask: [],
    taskFormData: {
      params: [],
      cascade: {},
    },
  },
  effects: {
    *selectFieldworkList({ payload, callback }, { call, put }) {
      const res = yield call(selectFieldworkList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const arr = [];
      for (const elem of res.params.values()) {
        arr.push(elem.processInstancedId);
      }
      const res1 = yield call(queryInstanceTasks, {userid: payload.userid, instanceIds: arr.join(',')});
      if (res1.success) {
        for (const elem of res.params.values()) {
          elem.items = res1.data[elem.processInstancedId];
        }
      }
      yield put({
        type: 'changeSelectFieldworkList',
        payload: res,
      });
      callback && callback(res);
    },
    *getProcesslist({ payload }, { call, put }) {
      const res = yield call(processlist, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeProcesslist',
        payload: res.items,
      });
    },
    *getProcessVerlist({ payload }, { call, put }) {
      const res = yield call(processVerlist, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'loadData',
        payload: {
          processVerlist: res.items,
        },
      });
    },
    *getDetailtab({ payload, callback }, { call, put }) {
      let type = '';
      const formRes = yield call(getDetailFormByPro, payload);
      if (formRes.data) {
        payload.formid = formRes.data.formid;
        type = formRes.data.event_type;
      }
      const res = yield call(detailtab, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeDetailtab',
        payload: res.tab,
      });
      callback && callback(res.tab, type);
    },
    *getAllDetail({ payload }, { call, put, select }) {
      const payloadJson = {};
      const res = yield call(getOneDetail, payload.url);

      if (!(res.type && res.type === 'repairList') && res.params && res.params.length > 1) {
        for (let i = 0; i < res.params.length; i++) {
          const restmp = yield call(getOneDetail, res.params[i].url + payload.urlExtra);
          if (!restmp.success) {
            message.error(restmp.msg);
            return;
          }
          res.params[i].items = restmp.params[0].items;
        }
      }
      const workOrder = yield select(state => state.workOrder);
      const detailInfo = workOrder.detailInfo;
      detailInfo[payload.formName] = res;
      yield put({
        type: 'changeAllDetail',
        payload: Object.assign({}, detailInfo),
      });
    },
    *getUserTask({ payload }, { call, put }) {
      const res = yield call(getUserTask, payload);
      if (!res.success) {
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
    *getApproiseFormData({ payload, callback }, { call, put }) {
      const res = yield call(getApproiseFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeTaskFormData',
        payload: { params: res.params[0].items },
      });
      callback && callback(res);
    },
    *submitApproiseData({ payload, callback }, { call, put }) {
      const res = yield call(submitApproiseData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.info('评价成功');
      callback && callback();
    },
    *submitTaskFormData({ payload, callback }, { call, put }) {
      const res = yield call(submitTaskFormData, payload);
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
    *submitAttach({ formData, attInfo, user, callback }, { call, put }) {
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
    *getApproiseDetail({ payload, callback }, { call, put }) {
      const res = yield call(getApproiseDetail, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback(res);
    },
  },
  reducers: {
    loadData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    changeSelectFieldworkList(state, action) {
      return {
        ...state,
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
      const tabs = action.payload;
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

