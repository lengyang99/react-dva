import { notification } from 'antd';
import {
  getAuthList,
  deleteAuth,
  updateAuth,
  fetchSiteList,
} from '../services/stationAuthorityOption';

const initState = {
  confirmLoading: false,
  visible: false,
  editData: [],
  authList: {
    data: [],
    pageNum: 1,
    pageSize: 10,
    total: 0,
  },
  searchOption: '',
  siteList: [],
};

export default {
  namespace: 'stationAuthorityOption',
  state: initState,
  reducers: {
    showModel(state, { payload }) {
      return { ...state, visible: payload };
    },
    showConfirmLoading(state, { payload }) {
      return { ...state, confirmLoading: payload };
    },
    setEditData(state, { payload: editData }) {
      return { ...state, editData };
    },
    setAuthList(state, { payload: authList }) {
      return { ...state, authList };
    },
    changeOnValue(state, { payload }) {
      return { ...state, searchOption: payload };
    },
    setSiteList(state, {payload}) {
      return {
        ...state,
        siteList: payload,
      };
    },
  },
  effects: {
    *getAuthList({ payload }, { call, put }) {
      const res = yield call(getAuthList, payload);
      if (res.success) {
        yield put({ type: 'setAuthList', payload: res.data });
      }
    },
    *deleteAuthList({ payload, callback }, { call, put }) {
      const res = yield call(deleteAuth, payload);
      if (res.success) {
        notification.success({ message: '清除成功', duration: 3 });
        callback(res);
      } else {
        notification.error({ message: '清除失败', duration: 3 });
      }
    },
    *fetchSiteList({ payload }, { call, put }) {
      const res = yield call(fetchSiteList);
      if (res.success) {
        yield put({type: 'setSiteList', payload: res.data});
      }
    },
    *updateAuth({payload, callback}, {call, put}) {
      const res = yield call(updateAuth, payload);
      if (!res.success) {
        notification.error({ message: res.msg, duration: 3 });
        return;
      }
      callback(res);
    },
  },
};
