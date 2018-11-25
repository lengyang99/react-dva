import { getDepartmentData } from '../services/department';

export default {
  namespace: 'department',
  state: {
    departmentData: [],
  },
  effects: {
    *getDepartmentData({ payload }, { call, put }) {
      const res = yield call(getDepartmentData, payload);
      yield put({
        type: 'changeDepartmentData',
        payload: res,
      });
    },
  },
  reducers: {
    changeDepartmentData(state, action) {
      return {
        ...state,
        departmentData: action.payload.data,
      };
    },
  },
};


