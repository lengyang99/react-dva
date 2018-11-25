import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { getFunction, getCardInfo, getCardDetail, getDetailinfo, getCardDetailPoint } from '../services/taskdetail';

export default {
  namespace: 'taskdetail',

  state: {
    functionName: [],
    data: [],
    detaildata: [],
    eqTotal: '',    //设备总数量
    eqdetail: {},   //设备信息
    fbdetail: [],   //反馈信息
    eqPoint: [],
  },

  effects: {
    * getFunction(action, {call, put}) {
      const res = yield  call(getFunction);
      yield put({
        type: 'nameinit',
        functionName: res.data || []
      });
    },
     * getCardInfo(action, {call, put}) {
      const res = yield  call(getCardInfo);
      yield put({
        type: 'cardinit',
        data: res.data || []
      });
    },
     * getCardDetail({payload, callback}, {call, put}) {
      const res = yield  call(getCardDetail, payload);
      yield put({
        type: 'cardDetail',
        payload: res
      });
      callback && callback(res.data)
    },
    * getDetailinfo({payload}, {call, put}) {
      const res = yield  call(getDetailinfo, payload);
      yield put({
        type: 'detailinfo',
        eqdetail: res || []
      });
    },
     * getCardDetailPoint({payload, callback}, {call, put}) {
      const res = yield  call(getCardDetailPoint, payload);
      yield put({
        type: 'geteqPoint',
        eqPoint: res.data || []
      });
      callback && callback(res.data)
    },
  },

  reducers: {
      nameinit(state, {functionName}) {
        return {
            ...state,
            functionName,
          };
      },
      cardinit(state, {data}) {
        return {
            ...state,
            data,
          };
      },
      cardDetail(state, {payload}) {
        return {
            ...state,
            detaildata: payload.data || [],
            eqTotal: payload.total || []
          };
      },
      detailinfo(state, {eqdetail}) {
        return {
            ...state,
            eqdetail
          };
      },
      geteqPoint(state, {eqPoint}) {
        return {
            ...state,
            eqPoint
          };
      },
  }
}
