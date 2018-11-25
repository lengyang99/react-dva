import { message } from 'antd';
import {
  getMsgTempList,
  getMsgTempTypes,
  updateMsgTemp,
} from '../services/messageTemplate';

const initState = {
  tempTypeList: [],
  tempList: [],
  isModalActive: false,
  formDetail: null,
  process: null,
};

export default {
  namespace: 'messageTemplate',
  state: initState,
  reducers: {
    toggleModal(state, { payload: isModalActive }) {
      return { ...state, isModalActive };
    },
    setTempTypeList(state, { payload: tempTypeList }) {
      return { ...state, tempTypeList };
    },
    setTempList(state, { payload: tempList }) {
      return { ...state, tempList };
    },
    setFormDetail(state, { payload: formDetail }) {
      return { ...state, formDetail };
    },
    setProcess(state, { payload: process }) {
      return { ...state, process };
    },
  },
  effects: {
    *fetchTempTypeList({ payload }, { call, put }) {
      const res = yield call(getMsgTempTypes, payload);
      if (res.success) {
        yield put({ type: 'setTempTypeList', payload: res.data });
      }
    },
    *fetchTempList({ payload }, { call, put }) {
      const res = yield call(getMsgTempList, payload);
      if (res.success) {
        yield put({ type: 'setTempList', payload: res.data });
      }
    },
    *updateTemp({ payload, cbk }, { call, put }) {
      const res = yield call(updateMsgTemp, payload);
      if (res.success) {
        message.success('修改成功');
        yield put({ type: 'toggleModal', payload: false });
        cbk();
      } else {
        message.error('修改失败');
      }
    },
    *asyncSetFormDetail({ payload: formDetail, cbk }, { put }) {
      yield put({ type: 'setFormDetail', payload: formDetail });
      cbk();
    },
  },
};
