/**
 * Created by hexi on 2017/11/21.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import { getPersonTree, queryPatrolPosition, queryStagnatePoints, trajectoryExportExcel } from '../services/patrolTrace';

export default {
  namespace: 'patrolTrace',

  state: {
    personTreeData: [],
    personList: [],
    onlineNum: 0, // 记录在线人数
    // 轨迹
    queryData: [],
  },

  effects: {
    *getPersonTree({poyload, callback}, { call, put }) {
      const res = yield call(getPersonTree, poyload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      let personTree = [];
      let personList = [];
      callback(res.data, personTree, personList);

      let onlineNum = 0;
      for (let i = 0; i < personList.length; i++) {
        if (personList[i].online === 1) {
          onlineNum++;
        }
      }
      yield put({
        type: 'savePersonTree',
        payload: {
          personTreeData: personTree,
          personList: personList,
          onlineNum: onlineNum
        },
      });
    },
    *queryPatrolPosition({data, callback}, { call, put } ){
      const res = yield call(queryPatrolPosition, data);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback(res);
      yield put({
        type: 'savePatrolPosition',
        payload: {
          queryData: res.upList,
        }
      });
    },
    *queryStagnatePoints({data, callback}, { call, put }) {
      const res = yield call(queryStagnatePoints, data);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *trajectoryExportExcel({data}, { call, put }) {
      const res = yield call(trajectoryExportExcel, data);

      if (!res.success) {
        message.error(res.msg);
        return;
      }
    },
  },

  reducers: {
    savePersonTree(state, action) {
      const personData = action.payload;
      return {
        ...state,
        ...personData,
      };
    },
    savePatrolPosition(state, action) {
      let queryData = action.payload;
      return {
        ...state,
        ...queryData,
      };
    },
  },
};
