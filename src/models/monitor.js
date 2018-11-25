import { message } from 'antd';
import { fetchMonitorData } from '../services/api';

export default {
  namespace: 'monitor',

  state: {
    results: {
      data: [],
      total: 0,
    },
  },

  effects: {
    *fetchTags({ payload }, { call, put }) {
      const response = yield call(fetchMonitorData, payload.fetchParams);
      if (!response.success) {
        message.info(response.msg);
        return;
      }
      payload.fun && payload.fun(response);
      yield put({
        type: 'saveTags',
        payload: response,
      });
    },
  },

  reducers: {
    saveTags(state, action) {
      return {
        ...state,
        results: action.payload,
      };
    },
  },
};
