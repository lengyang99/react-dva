import { message } from 'antd';
import update from 'immutability-helper';
import {
  saveInnerService,
} from '../services/service';

export default {
  namespace: 'service',
  state: {
    internalServiceList: [],
    totalRatio: 0,
  },
  effects: {
    *changeRatio({payload}, {select, call, put}) {
      let pattern = /^(100|[1-9]?\d)%$/;
      const flag = pattern.test(payload.apportionmentRatio);
      if (!flag) {
        message.error('请输入整数的百分比(不超过100%)');
        return;
      }
      const list = yield select(state => state.service.internalServiceList);
      const ratioList = list.map((item, index) => {
        const ratioStr = item.apportionmentRatio ? item.apportionmentRatio.replace('%', '') : '0';
        const ratio = ratioStr / 100;
        return ratio;
      });
      const total = ratioList.reduce((tem, item, index) => {
        return tem + item;
      });
      if (total > 1) {
        message.error('分配比例超过100%,请重新分配');
      }
      yield put({type: 'setTotalRatio', payload: total});
    },
    *updateInternalServiceList({payload}, { select, put }) {
      const innerList = yield select(state => state.service.internalServiceList);
      const list = innerList.map((item) => {
        return item.gid === payload.gid ? payload : item;
      });
      console.log(list);
      yield put({type: 'setInternalServiceList', payload: list});
    },
    *saveInnerService({payload}, { call }) {
      const res = yield call(saveInnerService, payload);
      if (!res.success) {
        message.error(res.msg);
      }
      message.success(res.msg);
    },
  },
  reducers: {
    setInternalServiceList(state, action) {
      return {
        ...state,
        internalServiceList: action.payload,
      };
    },
    setTotalRatio(state, action) {
      return {
        ...state,
        totalRatio: action.payload,
      };
    },
  },
};
