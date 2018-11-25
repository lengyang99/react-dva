import { message } from 'antd';
import { tableQuery } from '../services/reportCount';

export default {
  namespace: 'reportCount',
  state: {
    tableData: [],
    selectData: {},
    countData: {},
  },

  reducers: {
    loadData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getData(state, { payload }) {
      const selectData = {};
      for (const elem of payload.list.fields.values()) {
        if (elem.name === 'loc_code') {
          selectData.loccode = elem.selectValues;
        }
        if (elem.name === 'loc_area') {
          selectData.locarea = elem.selectValues;
        }
        if (elem.name === 'varchar7') {
          selectData.sgschedule = elem.selectValues;
        }
      }
      return {
        ...state,
        selectData,
        tableData: payload.list.features,
        countData: payload.statis,
      };
    },
  },

  effects: {
    *tableQuery({ payload }, { call, put }) {
      const res = yield call(tableQuery, payload);
      if (res.success) {
        yield put({
          type: 'getData',
          payload: res,
        });
      } else {
        message.warning(`查询失败：${res.msg}`);
      }
    },
  },
};
