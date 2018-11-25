import {
  queryPlan,
  queryAreaData,
  addTempPlan,
  querySummary
} from '../services/maintain';
import {getTaskInfo} from '../services/station';

import {queryStationUsers,getTaskList, queryLeakPlanData, addLeakTempPlan} from '../services/leak';

const initState = {
  loading: false,
  data: {
    list: [],
    total: 0,
  },
  taskData: {
    list: [],
    total: 0,
    current: 1,
  },
  visible: false,
  areaData: [],
  submitLoading: false,
  stationUsers: [],
  taskInfo: []
};
export default {
  namespace: 'leak',
  state: initState,
  effects: {
    // * queryPlanData({payload}, {call, put}) {
    //   yield put({
    //     type: 'changeLoading',
    //     payload: true,
    //   });
    //   const {total = 0, data = []} = yield call(queryPlan, payload);
    //   yield put({
    //     type: 'changeLoading',
    //     payload: false,
    //   });
    //   yield put({
    //     type: 'savePlanData',
    //     payload: {
    //       list: data,
    //       total,
    //       current: payload.pageno || 1
    //     },
    //   });
    // },
    * queryLeakPlanData({payload}, {call, put}) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const {total = 0, data = []} = yield call(queryLeakPlanData, payload);
      yield put({
        type: 'changeLoading',
        payload: false,
      });
      yield put({
        type: 'savePlanData',
        payload: {
          list: data,
          total,
          current: payload.pageno || 1
        },
      });
    },
    * queryAreaData(_, {call, put}) {
      const {data = []} = yield call(queryAreaData);
      yield put({
        type: 'saveAreaData',
        payload: data,
      });
    },
    * addPlan({payload, callback}, {call, put}) {
      yield put({type: 'changeSubmitLoading', payload: true});
      const res = yield  call(addTempPlan, payload);
      yield put({type: 'changeSubmitLoading', payload: false});
      callback && callback(res);
    },
    //推广捡漏计划创建
    * addLeakTempPlan({payload, callback}, {call, put}) {
    yield put({type: 'changeSubmitLoading', payload: true});
    const res = yield  call(addLeakTempPlan, payload);
    yield put({type: 'changeSubmitLoading', payload: false});
    callback && callback(res);
  },
    * getStationUsers({payload}, {call, put}) {
      const res = yield  call(queryStationUsers, payload);
      yield put({
        type: 'changeStationUser',
        payload: res.data || []
      })
    },
    * queryTaskList({payload}, {call, put}) {
      yield put({type: 'changeLoading', payload: true,});
      const {total = 0, data = []} = yield call(getTaskList, payload);
      yield put({type: 'changeLoading', payload: false,});
      yield put({
        type: 'saveTaskData',
        payload: {
          list: data,
          total,
          current: payload.pageno || 1
        }
      })
    },
    * getTaskInfo({payload}, {call, put}) {
      const {data = []} = yield call(getTaskInfo, payload);
      if (data.length > 0) {
        const items = data[0].items || [];
        yield put({type: 'changeTaskInfo', payload: items});
      }
    }
  },
  reducers: {
    changeLoading(state, {payload}) {
      return {
        ...state,
        loading: payload
      }
    },
    savePlanData(state, {payload}) {
      return {
        ...state,
        data: payload
      }
    },
    changeVisible(state, {payload}) {
      return {
        ...state,
        visible: payload
      }
    },
    saveAreaData(state, {payload}) {
      return {
        ...state,
        areaData: payload
      }
    },
    changeSubmitLoading(state, {payload}) {
      return {
        ...state,
        submitLoading: payload
      }
    },
    changeStationUser(state, {payload}) {
      return {
        ...state,
        stationUsers: payload
      }
    },
    saveTaskData(state, {payload}) {
      return {
        ...state,
        taskData: payload
      }
    },
    changeTaskInfo(state, {payload}) {
      return {
        ...state,
        taskInfo: payload
      }
    },
  },
};
