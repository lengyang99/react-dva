import { notification } from 'antd';
import {
  fetchIntegralList,
  fetchUnitList,
  fetchCompanyList,
  postIntegral,
  deleteIntegral,
  updateIntegral,
} from '../services/integral';

const params = { report: 'log', config: 'stat' };
const initState = {
  activeKey: 'report',
  detail: {},
  isModalActive: false,
  search: '',
  companyList: [],
  unitList: [],
  integralList: [],
};

export default {
  namespace: 'integral',
  state: initState,
  reducers: {
    setSearch(state, { payload: search }) {
      return { ...state, search };
    },
    setModalActive(state, { payload: isModalActive }) {
      return { ...state, isModalActive };
    },
    setActiveKey(state, { payload: activeKey }) {
      return { ...state, activeKey };
    },
    setDetail(state, { payload: detail }) {
      return { ...state, detail };
    },
    resetDetail(state) {
      return { ...state, detail: initState.detail };
    },
    setIntegralList(state, { payload: integralList }) {
      return { ...state, integralList };
    },
    setUnitList(state, { payload: unitList }) {
      return { ...state, unitList };
    },
    setCompanyList(state, { payload: companyList }) {
      return { ...state, companyList };
    },
  },
  effects: {
    *editDetail({ payload: { detail, isModalActive }}, { put }) {
      yield put({ type: 'setDetail', payload: detail });
      yield put({ type: 'setModalActive', payload: isModalActive });
    },
    *fetchIntegralList({ payload }, { call, put }) {
      const res = yield call(fetchIntegralList, {calcMode: params[payload]});
      if (res.success) {
        yield put({ type: 'setIntegralList', payload: res.data });
      }
    },
    *fetchListWithKeywords({ payload }, { call, put }) {
      const res = yield call(fetchIntegralList, Object.assign(payload, {calcMode: params[payload.calcMode]}));
      if (res.success) {
        yield put({ type: 'setIntegralList', payload: res.data});
      }
    },
    *fetchUnitList({_}, { call, put }) {
      const res = yield call(fetchUnitList);
      if (res.success) {
        yield put({ type: 'setUnitList', payload: res.data });
      }
    },
    *fetchCompanyList({_}, { call, put }) {
      const res = yield call(fetchCompanyList);
      if (res.success) {
        yield put({ type: 'setCompanyList', payload: res.data });
      }
    },
    *postIntegral({ payload, callback }, { call, put }) {
      const res = yield call(postIntegral, Object.assign(payload, { calcMode: 'log' }));
      if (res.success) {
        notification.success({ message: '新增成功', duration: 3 });
        yield put({ type: 'setModalActive', payload: false });
        callback();
      } else {
        notification.error({ message: '新增失败', duration: 3 });
      }
    },
    *deleteIntegral({ payload, callback }, { call }) {
      const res = yield call(deleteIntegral, payload);
      if (res.success) {
        notification.success({ message: '删除成功', duration: 3 });
        callback();
      } else {
        notification.error({ message: '删除失败', duration: 3 });
      }
    },
    *updateIntegral({ payload, callback }, { call, put }) {
      console.log(payload)
      const res = yield call(updateIntegral, payload);
      console.log(res)
      if (res.success) {
        notification.success({ message: '编辑成功', duration: 3 });
        yield put({ type: 'setModalActive', payload: false });
        callback();
      } else {
        notification.error({ message: '编辑失败', duration: 3 });
      }
    },
  },
};
