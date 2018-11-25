import { message } from 'antd';
import {
  fetchIchAccountDetail,
  getConditions,
  updateUserDetail,
  fetchSecurityRecordList,
  queryRegulator,
  deleteRegulator,
  fetchMeters,
  addGshCustomInfo,
  editGshCustomInfo,
  delGshCustomInfo,
  editGsh,
} from '../services/ichAccountDetail';

export default {
  namespace: 'ichAccountDetail',
  state: {
    userDetail: {},
    meterDetail: {},
    dialogStatus: {
      visible: false,
      statue: 'add',
    },
    gasList: [],
    typeList: [],
    securityRecordList: [],
    securityRecordTotal: 0,
    securityFilterOption: {
      param: '',
      contract_account: '',
      feedback_name: '',
      eq_name: '',
      arrive_time_start: '',
      arrive_time_end: '',
      pageNum: 1,
      pageSize: 10,
    },
    meterList: [],
    connectedRegulator: [],
    GISPropsData: [],
    CustomPropsData: [],
  },
  effects: {
    *getIchAccountDetail({ payload }, { call, put }) {
      const response = yield call(fetchIchAccountDetail, payload);
      if (response.success) {
        yield put({ type: 'setUserDetail', payload: response.data_baseinfo });
        yield put({ type: 'setGISProps', payload: response.data_gis });
        yield put({ type: 'setCustomProps', payload: response.data_custom });
      } else {
        message.error(response.msg);
      }
    },
    *fetchSearchOptions({ payload }, { call, put }) {
      const response = yield call(getConditions, payload);
      if (!response.success) {
        return;
      }
      yield put({ type: 'setConditions', payload: { ...response.gasList, ...response.typeList } });
    },
    *updateUserDetail({ payload, callback }, { call }) {
      const res = yield call(updateUserDetail, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.success(res.msg);
      callback(res);
    },
    *fetchSecurityRecordList({ payload }, { call, put }) {
      const res = yield call(fetchSecurityRecordList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({ type: 'setSecurityRecordList', payload: res.data });
    },
    *fetchConnectedRegulator({ payload }, { call, put }) {
      const res = yield call(queryRegulator, payload);
      if (!res.success) {
        message.error(res.msg);
        yield put({ type: 'setConnectedRegulator', payload: [] });
        return;
      }
      yield put({ type: 'setConnectedRegulator', payload: res.data });
    },
    *deleteRegulator({ payload }, { call, put, select }) {
      const res = yield call(deleteRegulator, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.success(res.msg);
      yield put({ type: 'fetchConnectedRegulator', payload: { gshId: yield select(state => state.ichAccountDetail.userDetail.gid) } });
    },
    *fetchMeterData({ payload }, { call, put }) {
      const res = yield call(fetchMeters, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({ type: 'setMeterList', payload: res.data.map((ele, index) => ({ ...ele, index })) });
    },
    *addGshCustomInfo({ payload, callback }, { call }) {
      const res = yield call(addGshCustomInfo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *editGshCustomInfo({ payload, callback }, { call }) {
      const res = yield call(editGshCustomInfo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *delGshCustomInfo({ payload, callback }, { call }) {
      const res = yield call(delGshCustomInfo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *editGsh({ payload, callback }, { call }) {
      const res = yield call(editGsh, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
  },
  reducers: {
    setIchMeterDetail(state, action) {
      return {
        ...state,
        meterDetail: action.payload,
      };
    },
    setUserDetail(state, action) {
      return {
        ...state,
        userDetail: action.payload,
      };
    },
    setDialogStatus(state, action) {
      return {
        ...state,
        dialogStatus: action.payload,
      };
    },
    setConditions(state, { payload }) {
      return {
        ...state,
        typeList: payload.customer_type,
        gasList: payload.gas_nature,
      };
    },
    setSecurityRecordList(state, action) {
      return {
        ...state,
        securityRecordList: action.payload.list,
        securityRecordTotal: action.payload.total,
      };
    },
    setSecurityFilterOption(state, action) {
      return {
        ...state,
        securityFilterOption: action.payload,
      };
    },
    setConnectedRegulator(state, action) {
      return {
        ...state,
        connectedRegulator: action.payload,
      };
    },
    setGISProps(state, action) {
      return {
        ...state,
        GISPropsData: action.payload,
      };
    },
    setMeterList(state, action) {
      return {
        ...state,
        meterList: action.payload,
      };
    },
    setCustomProps(state, action) {
      return {
        ...state,
        CustomPropsData: action.payload,
      };
    },
  },
};
