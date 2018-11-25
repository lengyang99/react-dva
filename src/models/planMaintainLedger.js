import {message} from 'antd';
import { queryPlanMaintainLedgerList, getDetailinfo, queryMaintainHistoryList, editPlanMaintainLedger} from '../services/planMaintainLedger';

export default {
  namespace: 'planMaintainLedger',

  state: {
    ledgerData: [], // 计划性维护台帐
    historyData: [], // 维护历史
    detailinfo: {}, // 维护历史详情
    // 计划性台帐
    searchLedgerParams: {
      others: null, // 模糊关键字
      startTime: null, // 维护开始时间
      endTime: null, // 维护结束时间
      clsGids: null, // 设备分类
      functionKeys: null, // 作业类型
      pageno: 1, // 页码
      pagesize: 10, // 每页数
    },
    tableIndex: null,
    // 维护历史
    searchMaintainParams: {
      others: null, // 模糊关键字
      startTime: null, // 维护开始时间
      endTime: null, // 维护结束时间
      pageno: 1, // 页码
      pagesize: 10, // 每页数
    },
  },

  effects: {
    // 查询计划性维护历史详情
    *getDetailinfo({ payload }, { call, put}) {
      const res = yield call(getDetailinfo, payload);
      if (res.success) {
        yield put({type: 'detailinfoSave', payload: res.data || {}});
      } else {
        message.warn(res.msg);
      }
    },
    // 查询计划性维护台帐
    *queryPlanMaintainLedgerList({ payload }, { call, put}) {
      yield put({type: 'searchLedgerParamsSave', payload: payload || {}});
      const res = yield call(queryPlanMaintainLedgerList, payload);
      if (res.success) {
        yield put({type: 'ledgerDataSave', payload: res || {}});
      } else {
        message.warn(res.msg);
      }
    },
    // 查询维护历史
    *queryMaintainHistoryList({ payload }, { call, put}) {
      yield put({type: 'searchMaintainParamsSave', payload: payload || {}});
      const res = yield call(queryMaintainHistoryList, payload);
      if (res.success) {
        yield put({type: 'historyDataSave', payload: res || {}});
      } else {
        message.warn(res.msg);
      }
    },
    // 编辑计划性维护台帐
    *editPlanMaintainLedger({ payload }, { call}) {
      const res = yield call(editPlanMaintainLedger, payload);
      if (res.success) {
        message.success(res.msg);
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
    historyDataSave(state, { payload}) {
      return {
        ...state,
        historyData: payload,
      };
    },
    detailinfoSave(state, { payload}) {
      return {
        ...state,
        detailinfo: payload,
      };
    },
    // 保存搜索条件
    searchLedgerParamsSave(state, action) {
      return {
        ...state,
        searchLedgerParams: action.payload,
      };
    },
    // 保存搜索条件
    searchMaintainParamsSave(state, action) {
      return {
        ...state,
        searchMaintainParams: action.payload,
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
