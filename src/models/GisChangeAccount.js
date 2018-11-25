import {message} from 'antd';
import moment from 'moment';
import { queryGisLedgerList, getEqType} from '../services/GisChangeAccount';

export default {
  namespace: 'GisChangeAccount',
  state: {
    ledgerData: [], // Gis变更台帐
    eqTypeData: [], // 设备分类
    // 计划性台帐
    searchLedgerParams: {
      param: null, // 模糊关键字
      state: null, // 处理状态
      eq_type: null, // 设备分类
      startTime: `${moment().startOf('month').format('YYYY-MM-DD')} 00:00:00`,
      endTime: `${moment().endOf('month').format('YYYY-MM-DD')} 23:59:59`,
      pageno: 1, // 页码
      pagesize: 10, // 每页数
    },
    tableIndex: null,
  },
  effects: {
    // 设备分类
    *getEqType({ payload }, { call, put}) {
      const res = yield call(getEqType, payload);
      if (res.success) {
        yield put({type: 'eqTypeDataSave', payload: res.data || {}});
      } else {
        message.warn(res.msg);
      }
    },
    // 查询计划性维护台帐
    *queryGisLedgerList({ payload }, { call, put}) {
      yield put({type: 'searchLedgerParamsSave', payload: payload || {}});
      const res = yield call(queryGisLedgerList, payload);
      if (res.success) {
        yield put({type: 'ledgerDataSave', payload: res || {}});
      } else {
        message.warn(res.msg);
      }
    },
  },

  reducers: {
    ledgerDataSave(state, { payload}) {
      return {
        ...state,
        ledgerData: payload,
      };
    },
    eqTypeDataSave(state, { payload}) {
      return {
        ...state,
        eqTypeData: payload,
      };
    },
    // 保存搜索条件
    searchLedgerParamsSave(state, action) {
      return {
        ...state,
        searchLedgerParams: action.payload,
      };
    },
    tableIndexSave(state, action) {
      return {
        ...state,
        tableIndex: action.payload,
      };
    },
  },
};
