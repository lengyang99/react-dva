/**
 * Created by hexi on 2017/11/28.
 */
import { message } from 'antd';
import { getAttachInfo } from '../services/seeMedia';

export default {
  namespace: 'seeMedia',

  state: {
    attachInfoQuery: []
  },

  effects: {
    *getAttachInfo({ payload }, { call, put }) {
      let { ids, token } = payload;
      const res = yield call(getAttachInfo, ids);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const result = [];
      const arrSort = [];
      if (res.data) { // 让res.data数据的顺序 和 ids一样
        for (const elem of ids.split(',').values()) {
          for (const e of res.data.values()) {
            if (elem === e.id) {
              arrSort.push(e);
            }
          }
        }
      }
      arrSort.forEach((item) => {
        const filetype = item.filename.substring(item.filename.lastIndexOf('.') + 1, item.filename.length);
        result.push({ url: window.location.origin + '/proxy/attach/downloadFile?id=' + item.id + '&token=' + token, name: item.filename, type: filetype });
      });

      yield put({
        type: 'saveAttachInfo',
        payload: {
          attachInfoQuery: result
        },
      });
    },
  },
  reducers: {
    saveAttachInfo(state, action) {
      const result = action.payload;
      return {
        ...state,
        ...result,
      }
    },
    resetState(state, action) {
      const result = action.payload;
      return {
        ...state,
        ...result,
      }
    }
  },
};
