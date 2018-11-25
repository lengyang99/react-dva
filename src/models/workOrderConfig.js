import { message } from 'antd';
import { queryEventTypeData } from '../services/event';
import { FormTypeid, updateValueByGid, updatereFresh } from '../services/workOrderConfig';

export default {
  namespace: 'workOrderConfig',
  state: {
    orderTypeData: [],
    FormTypeid: [],
    selectValue: '',
  },
  effects: {
    *orderTypeData({ payload }, { call, put }) {
      const res = yield call(queryEventTypeData, payload);
      if (res.eventmenu.length === 0) {
        message.warning('工单类型-暂无数据！');
        return;
      }
      const res1 = yield call(FormTypeid, { typeid: res.eventmenu[0].eventtype, ecode: payload.ecode });
      if (res1.formInfo.length === 0) {
        message.warning('暂无数据！');
      }
      yield put({
        type: 'loadData',
        orderTypeData: res.eventmenu || [],
        FormTypeid: res1.formInfo || [],
        selectValue: res.eventmenu[0].eventtype,
      });
    },
    *getOrderType({ payload }, { call, put }) {
      const res = yield call(FormTypeid, payload);
      if (res.formInfo.length === 0) {
        message.warning('暂无数据！');
      }
      yield put({
        type: 'loadData',
        FormTypeid: res.formInfo || [],
        selectValue: payload.selectValue,
      });
    },
    *submitValue({ payload }, { call, put }) {
      const res = yield call(updateValueByGid, payload);
      if (res.success) {
        const res1 = yield call(updatereFresh, {});
        if (res1.success) {
          message.success('提交成功!');
        }
      }
    },
  },
  reducers: {
    loadData(state, payload) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};

