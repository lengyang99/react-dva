import { notification } from 'antd';
import {
  getAttachmentTypes,
  getAttachmentList,
  deleteAttachment,
} from '../services/attachmentManage';

const initState = {
  attachmentTypes: [],
  attachmentList: null,
  searchOption: {
    attachmentType: '',
    pageNum: 1,
    pageSize: 10,
    fileName: '',
  },
};

export default {
  namespace: 'attachmentManage',
  state: initState,
  reducers: {
    setAttachmentTypes(state, {payload}) {
      return {
        ...state,
        attachmentTypes: payload,
      };
    },
    setAttachmentList(state, { payload: attachmentList }) {
      return { ...state, attachmentList };
    },
    setSearchOption(state, { payload: searchOption }) {
      return { ...state, searchOption };
    },
  },
  effects: {
    *fetchAttachmentTypes({_}, { call, put }) {
      const response = yield call(getAttachmentTypes);
      if (response.success) {
        yield put({type: 'setAttachmentTypes', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchAttachmentList({ payload }, { call, put }) {
      const res = yield call(getAttachmentList, payload);
      if (res) {
        yield put({ type: 'setAttachmentList', payload: res.data });
      }
    },
    *deleteAttachment({ payload: gid, cbk }, { call }) {
      const res = yield call(deleteAttachment, gid);
      if (res.success) {
        notification.success({ message: '删除成功', duration: 3 });
        cbk();
      } else {
        notification.error({ message: '删除失败', duration: 3 });
      }
    },
    *resetSearch({_}, { put }) {
      yield put({ type: 'setSearchOption', payload: initState.searchOption });
      yield put({ type: 'fetchAttachmentList', payload: initState.searchOption });
    },
  },
};
