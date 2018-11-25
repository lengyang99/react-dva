import { notification, message } from 'antd';
import {
  getledgerDataList,
  getConditions,
  fetchRegulatorList,
  saveRegulator,
  fetchRegulatorFilter,
} from '../services/ichAccount';
import { queryRegulator } from '../services/ichAccountDetail';

export default {
  namespace: 'ichAccount',
  state: {
    typeList: [],
    gasList: [],
    filterOption: {
      pageNum: 1, // 页码
      pageSize: 10, // 页数
      keyword: undefined, // 过滤关键字
      eqCode: undefined,
      model: undefined, // 规格型号
      eqStatus: undefined, // 状态
      eqType: undefined, // 类型
      posId: undefined, // 所属站点ID
      clsGid: undefined, // 分类 ID
    },
    searchOptions: {
      customer_type: undefined,
      gas_properties: undefined,
      param: undefined,
      pageno: 1,
      pagesize: 10,
    },
    ledgeData: [],
    dialogVisible: false,
    regulatorData: {},
    selectedIchAccount: {},
    regulatorFilter: {},
    loading: false,
    totalNumbers: 0,
  },
  reducers: {
    searchValueOnchange(state, {payload}) {
      return {
        ...state,
        searchOptions: { ...state.searchOptions, ...payload },
      };
    },
    setConditions(state, {payload}) {
      return {
        ...state,
        typeList: payload.customer_type,
        gasList: payload.gas_nature,
      };
    },
    setLedgerData(state, {payload}) {
      return {
        ...state,
        ledgeData: payload,
      };
    },
    setDialogVisible(state, action) {
      return {
        ...state,
        dialogVisible: action.payload,
      };
    },
    setRegulatorData(state, action) {
      return {
        ...state,
        regulatorData: action.payload,
      };
    },
    setSelectedIchAccount(state, action) {
      return {
        ...state,
        selectedIchAccount: action.payload,
      };
    },
    setTableLoading(state, action) {
      return {
        ...state,
        loading: action.payload,
      };
    },
    setRegulatorFilter(state, action) {
      return {
        ...state,
        regulatorFilter: action.payload,
      };
    },
    setTotalNumbers(state, action) {
      return {
        ...state,
        totalNumbers: action.payload,
      };
    },
  },
  effects: {
    *fetchLedgerData({payload}, {call, put}) {
      yield put({type: 'setTableLoading', payload: true});
      const response = yield call(getledgerDataList, payload);
      if (response.success) {
        yield put({type: 'setLedgerData', payload: response.data});
        yield put({type: 'setTotalNumbers', payload: response.total});
        yield put({type: 'setTableLoading', payload: false});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchSearchOptions({payload}, {call, put}) {
      const response = yield call(getConditions, payload);
      if (response.success) {
        yield put({ type: 'setConditions', payload: { ...response.gasList, ...response.typeList }});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchRegulatorList({ payload, callback }, {call, put}) {
      const res = yield call(fetchRegulatorList, payload.pageOption);
      if (!res.success) {
        notification.error({ message: res.msg, duration: 3 });
        return;
      }
      yield put({ type: 'setRegulatorData', payload: res.data });
      yield put({ type: 'fetchRegulatorFilter' });
      yield put({ type: 'setDialogVisible', payload: true });
    },
    *saveRegulator({ payload }, { call, put, select}) {
      const res = yield call(saveRegulator, payload);
      if (!res.success) {
        notification.error({ message: res.msg, duration: 3 });
        return;
      }
      notification.success({ message: res.msg, duration: 3 });
      yield put({type: 'setDialogVisible', payload: false});
      const ichAccountDetail = yield select(state => state.ichAccountDetail);
      if (ichAccountDetail) {
        yield put({type: 'ichAccountDetail/fetchConnectedRegulator', payload: { gshId: ichAccountDetail.userDetail.gid }});
      }
    },
    *fetchRegulatorFilter(_, { call, put }) {
      const res = yield call(fetchRegulatorFilter);
      if (!res.success) {
        notification.error({ message: res.msg, duration: 3 });
        return;
      }
      yield put({type: 'setRegulatorFilter', payload: res.data});
    },
  },
};
