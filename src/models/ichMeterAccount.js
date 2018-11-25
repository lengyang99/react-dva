import { getIchMeterAccount, getIchMeterDetail, getIchMeterDetailTable, getIchMeterDetailDetail, getClassifyName } from '../services/ichMeterAccount';
import { message } from 'antd';

export default {
  namespace: 'ichMeterAccount',
  state: {
    meterData: [],
    meterTotal: '0',
    meterDetail: [],
    meterDetailTable: [],
    meterDetailTableTotal: '0',
    meterDetailDetail: [],
    classifyNameData: [],
  },
  effects: {
    *getIchMeterAccount({ payload }, { call, put }) {
      const res = yield call(getIchMeterAccount, payload);
      // if(!res.success){
      //   message.error(res.msg);
      //   return;
      // }
      yield put({
        type: 'changeIchMeterAccount',
        payload: res.item,
      });
    },
    *getIchMeterDetail({ payload }, { call, put }) {
      const res = yield call(getIchMeterDetail, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeIchMeterDetail',
        payload: res.data,
      });
    },
    *getIchMeterDetailTable({ payload }, { call, put }) {
      const res = yield call(getIchMeterDetailTable, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeIchMeterDetailTable',
        payload: res,
      });
    },
    *getIchMeterDetailDetail({ payload ,callback }, { call, put }) {
      const res = yield call(getIchMeterDetailDetail, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeIchMeterDetailDetail',
        payload: res.data,
      });
      callback && callback(res);
    },
    // *getClassifyName({ payload }, { call, put }) {
    //   const res = yield call(getClassifyName, payload);
    //   if (!res.success) {
    //     message.error(res.msg);
    //     return;
    //   }
    //   const classifyNameList = res.data.map((item) => {
    //     return {
    //       name: item.locName,
    //       value: item.locCode,
    //     };
    //   });
    //   if(classifyNameList.length > 1){
    //     classifyNameList.unshift({ name: '全部', value: '' });
    //   }
    //   yield put({
    //     type: 'changeClassifyName',
    //     payload: classifyNameList,
    //   });
    // },
  },
  reducers: {
    changeIchMeterAccount(state, action) {
      return {
        ...state,
        meterData: action.payload.data,
        meterTotal: action.payload.total,
      };
    },
    changeIchMeterDetail(state, action) {
      return {
        ...state,
        meterDetail: action.payload,
      };
    },
    changeIchMeterDetailTable(state, action) {
      return {
        ...state,
        meterDetailTable: action.payload.data,
        meterDetailTableTotal: action.payload.total,
      };
    },
    changeIchMeterDetailDetail(state, action) {
      return {
        ...state,
        meterDetailDetail: action.payload,
      };
    },
    // changeClassifyName(state, action) {
    //   return {
    //     ...state,
    //     classifyNameData: action.payload,
    //   };
    // },
  },
};


