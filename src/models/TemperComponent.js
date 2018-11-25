import {addQzzfData, updateQzzfData, addAttach} from '../services/TemperComponent';

export default {
  namespace: 'TemperComponent',
  state: {
  },
  effects: {
    // 添加气质组分记录
    * addQzzfData({payload, callback}, {call}) {
      const res = yield call(addQzzfData, payload);
      callback && callback(res);
    },
    // 更新气质组分记录
    * updateQzzfData({payload, callback}, {call}) {
      const res = yield call(updateQzzfData, payload);
      callback && callback(res);
    },
    * addAttach({payload, callback}, {call}) {
      const res = yield call(addAttach, payload);
      callback && callback(res);
    },
  },
  reducers: {},
};

