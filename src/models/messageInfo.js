/**
 * Created by hexi on 2017/12/5.
 */
import {message} from 'antd';
import { getMessageList, getMessageListNoLoading, deleteMsgInfo, readMsgInfo, getEventFormInfo, selectTaskBygid, getYHTaskInfo } from '../services/messageInfo';
import { queryEventData } from '../services/event';
import { querySummary } from '../services/maintain';
import { selectFieldworkByProcessinstancedid } from '../services/workOrder';

export default {
  namespace: 'messageInfo',
  state: {
    msgPop: {
      total: 0,
      msgData: [],
    }, // 记录弹框查询数据
    msgRead: {
      total: 0,
      msgData: [],
    }, // 记录已读数据
    msgNoRead: {
      total: 0,
      msgData: [],
    }, // 记录未读数据
  },
  effects: {
    * getMessageList({ payload, loading, callback}, { call, put }) {
      const res = loading === false ? yield call(getMessageListNoLoading, payload.params) :
        yield call(getMessageList, payload.params);
      if (!res.success) {
        message.info(res.msg);
        return;
      }

      let data = {};
      if (payload.queryType === '0') {
        data.msgNoRead = {
          total: res.total,
          msgData: res.msg,
        };
      } else if (payload.queryType === '1') {
        data.msgRead = {
          total: res.total,
          msgData: res.msg,
        };
      } else {
        data.msgPop = {
          total: res.total,
          msgData: res.msg,
        };
      }
      yield put({
        type: 'saveMessageInfo',
        payload: data,
      });
    },
    *deleteMsgInfo({ payload, callback }, { call, put }) {
      const res = yield call(deleteMsgInfo, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }

      callback && callback();
    },
    *readMsgInfo({ payload, callback }, { call, put }) {
      const res = yield call(readMsgInfo, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }

      callback && callback();
    },
    *getEventInfo({ payload, callback }, { call, put }) {
      const res = yield call(queryEventData, payload);
      if (!res.total || res.total === 0) {
        message.info('未查询到相关信息！');
        return;
      }

      callback && callback(res);
    },
    *getWorkorderInfo({ payload, callback }, { call, put }) {
      const res = yield call(selectFieldworkByProcessinstancedid, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      if (res.total === 0 || res.params.length === 0) {
        message.info('未查询到相关信息！');
        return;
      }

      callback && callback(res);
    },
    *getEventFormInfo({ payload, callback }, { call, put }) {
      const res = yield call(getEventFormInfo, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      if (res.eventlist.length === 0) {
        message.info('未查询到相关信息！');
        return;
      }

      callback && callback(res);
    },
    *getTaskInfo({ payload, callback }, { call, put }) {
      const res = yield call(selectTaskBygid, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      if (res.data === 0) {
        message.info('未查询到相关信息！');
        return;
      }

      callback && callback(res);
    },
    *getYHTaskInfo({ payload, callback }, { call, put }) {
      const res = yield call(getYHTaskInfo, payload);
      if (!res.success) {
        message.info(res.msg);
        return;
      }
      if (res.data === 0) {
        message.info('未查询到相关信息！');
        return;
      }
      const resInfo = yield call(querySummary, {function: res.data[0].function, others: res.data[0].planName});
      if (resInfo.data === 0) {
        message.info('未查询到相关信息！');
        return;
      }

      let result = {};
      for (let i = 0; i < resInfo.data.length; i++) {
        if (res.data[0].planName === resInfo.data[i].planName) {
          result = resInfo.data[i];
          break;
        }
      }
      callback && callback(result);
    },
  },
  reducers: {
    saveMessageInfo(state, action) {
      const data = action.payload;
      return {
        ...state,
        ...data,
      };
    },
  },
};
