import { message } from 'antd';
import { dangerWorkList, dangerWorDetail, dangerWorEdit } from '../services/dangerWork';

export default {
  namespace: 'dangerWork',
  state: {
    dangerWorkList: [], //危险作业列表
    dangerWorkTotal: 0,
    dangerWorkDetail: {},  //危险作业详情
    dangerWorkEdit: {}, //编辑危险作业数据    
  },
  effects: {
    *dangerWorkList({ payload, callback }, { call, put }) {
      const res = yield call(dangerWorkList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'workList',
        payload: res,
      });
      callback && callback(res);
    },
    *dangerWorDetail({ payload, callback }, { call, put }) {
      const res = yield call(dangerWorDetail, payload);
      yield put({
        type: 'workDetail',
        payload: res,
      });
      callback && callback(res);
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
    *dangerWorEdit({ payload, callback }, { call, put }) {
      const res = yield call(dangerWorEdit, payload);
      yield put({
        type: 'workEdit',
        payload: res,
      });
      callback && callback(res);
    },
    *delDangerWorkData({ payload, callback }, { call, put }) {
      yield put({
        type: 'workDelete',
      });
    },
  },
  reducers: {
    workList(state, action) {
      return {
        ...state,
        dangerWorkList: action.payload.data,
        dangerWorkTotal: action.payload.total,
      };
    },
    workDetail(state, action) {
      return {
        ...state,
        dangerWorkDetail: action.payload,
      };
    },
    changeAllDetail(state, action) {
      return {
        ...state,
        detailInfo: action.payload,
      };
    },
    workEdit(state, action) {
      return {
        ...state,
        dangerWorkEdit: action.payload,
      };
    },
    workDelete(state, action){
      return {
        ...state,
        dangerWorkDetail: {},
        dangerWorkEdit: {},

      };
    }
  },
};

