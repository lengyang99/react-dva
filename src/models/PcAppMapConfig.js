import { notification } from 'antd';
import {
  getEcodeList,
  getMapTpkList,
  getList,
  addList,
  deleteList,
  modifyList,
} from '../services/pcAppMapConfig';


export default {
  namespace: 'PcAppMapConfig',
  state: {
    visible: false,
    confirmLoading: false,
    detail: { // 详情
      module: undefined,
      ecode: undefined,
      name: undefined, // 图层
    },
    searchHistory: { // 搜索历史记录
      module: undefined,
      ecode: undefined,
    },
    ecodeList: [], // 公司列表
    mapTpkList: [], // 图层下拉列表
    listData: [], // 配置列表数据
  },
  reducers: {
    showModal(state, { payload: visible }) {
      return {
        ...state,
        visible,
      };
    },
    showConfirmLoading(state, { payload: confirmLoading }) {
      return {
        ...state,
        confirmLoading,
      };
    },
    onValuesChange(state, { payload }) {
      return {
        ...state, detail: { ...state.detail, ...payload },
      };
    },
    saveSearchHistory(state, { payload: options}) {
      return {
        ...state,
        searchHistory: {...state.searchHistory, ...options},
      };
    },
    setEcodeListData(state, { payload }) {
      return {
        ...state,
        ecodeList: payload,
      };
    },
    setMapTpkListData(state, { payload }) {
      return {
        ...state,
        mapTpkList: payload,
      };
    },
    setListData(state, { payload }) {
      return {
        ...state,
        listData: payload,
      };
    },
    setDetailData(state, { payload }) {
      return {
        ...state,
        detail: payload,
      };
    },
  },
  effects: {
    *fetchEcodeListData({payload}, {call, put}) {
      const response = yield call(getEcodeList, payload);
      if (response.success) {
        yield put({type: 'setEcodeListData', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchMapTpkList({payload}, {call, put}) {
      const response = yield call(getMapTpkList, payload);
      if (response.success) {
        yield put({type: 'setMapTpkListData', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchListData({ payload }, {call, put}) {
      const response = yield call(getList, payload);
      if (response.success) {
        yield put({type: 'setListData', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *addListData({ payload, callback }, {call, put}) {
      const response = yield call(addList, payload);
      if (response.success) {
        callback(response);
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *modifyListData({payload, callback}, {call, put}) {
      const response = yield call(modifyList, payload);
      if (response.success) {
        callback(response);
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *deleteListData({payload, callback}, {call, put}) {
      const response = yield call(deleteList, payload);
      if (response.success) {
        callback(response);
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
  },
};
