import { queryPatrolLeakPoint, queryBluetoothPoint } from '../services/patrolLeakPoint';
import { message } from 'antd';

export default {
  namespace: 'patrolLeakPoint',
  state: {
    patrolLeakPointData: [],
    patrolLeakPointTotal: '0',
    bluetoothPointData: [],
    bluetoothPointTotal: '0',
  },
  effects: {
    *queryPatrolLeakPoint({ payload }, { call, put }) {
      const res = yield call(queryPatrolLeakPoint, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changePatrolLeakPoint',
        payload: res,
      });
    },
    *queryBluetoothPoint({ payload }, { call, put }) {
      const res = yield call(queryBluetoothPoint, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeBluetoothPoint',
        payload: res,
      });
    },
  },
  reducers: {
    changePatrolLeakPoint(state, action) {
      return {
        ...state,
        patrolLeakPointData: action.payload.data,
        patrolLeakPointTotal: action.payload.total,
      };
    },
    changeBluetoothPoint(state, action) {
      return {
        ...state,
        bluetoothPointData: action.payload.data,
        bluetoothPointTotal: action.payload.total,
      };
    },
  },
};


