import { selectCollisionReplaceList } from '../services/collisionReplace';
import { message } from 'antd';

export default {
  namespace: 'collisionReplace',
  state: {
    collisionReplaceList: [],
    collisionReplaceTotal: 0,
  },
  effects: {
    *selectCollisionReplaceList({ payload }, { call, put }) {
      const res = yield call(selectCollisionReplaceList, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeSelectFieldworkList',
        payload: res,
      });
    },
  },
  reducers: {
    changeSelectFieldworkList(state, action) {
      return {
        ...state,
        collisionReplaceList: action.payload.params,
        collisionReplaceTotal: action.payload.total,
      };
    },
  },
};


