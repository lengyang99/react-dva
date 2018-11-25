/**
 * Created by zhongjie on 2018/6/11.
 */
import { message } from 'antd';
import {
  getResultInfo,
  editResult,
  commitResult,
  reportExcel,
} from '../services/meterTaskResult';

export default {
  namespace: 'meterTaskResult',

  state: {
    data: {},
    response: '',
  },

  effects: {
    // 查询抄表结果
    *getResInfo({ payload, callback }, { call, put }) {
      const data = yield call(getResultInfo, payload);
      if (!data.success) {
        return;
      }
      // 如果液晶读数有值则直接取液晶读数
      data.list.forEach((list, index) => {
        if (list.items.length > 0) {
          for (let i = 0; i < list.items.length; i++) {
            if (list.items[i].name === 'shangqidushu' && list.items[i].text !== '') {
              list.last_num = parseFloat(list.items[i].text);
            } else if (list.items[i].name === 'bcbiaodishu' && list.items[i].text !== '') {
              list.this_num = parseFloat(list.items[i].text);
            }
          }
          // 重新计算期间气量
          list.period_of_gas = list.this_num - list.last_num;
        }
      });
      callback(data);
      yield put({
        type: 'queryResInfo',
        payload: data,
      });
    },
    // 编辑本次表底数
    *editThisNum({ payload, callback }, { call, put }) {
      const response = yield call(editResult, payload);
      callback(response);
      // yield put({
      //   type: 'editThisNum',
      //   payload: data,
      // });
    },
    // 提交反馈数据
    *commitResult({ payload, callback }, { call, put }) {
      const response = yield call(commitResult, payload);
      callback(response);
      // yield put({
      //   type: 'editThisNum',
      //   payload: data,
      // });
    },
    // // 提交反馈数据
    // *reportExcel({ payload, callback }, { call, put }) {
    //   yield call(reportExcel, payload);
    //   // callback(response);
    //   // yield put({
    //   //   type: 'editThisNum',
    //   //   payload: data,
    //   // });
    // },
  },
  reducers: {
    queryResInfo(state, { payload }) {
      return {
        ...state,
        data: payload,
      };
    },
  },
};
