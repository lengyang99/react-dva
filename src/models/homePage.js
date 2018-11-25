import {
  getHomeTodoParams,
  getHomePatrolLen,
  getHomeScoreRanking,
  getHomeYYDC,
  getDHomeAccount,
  getDHomeBigRepair,
  getDHomeItem,
  getDHomeRepair,
  getDHomeYhClass,
} from '../services/homePage';

export default {
  namespace: 'homePage',
  state: {
    todoData: [], // 待办事项
    patrolData: [], // 趋势洞察
    scoreData: [], //  绩效自驱
    operateData: [], //  运营洞察
    eqLedgerData: [], // 设备台账 - 管网设备
    stationEquipData: [], // 设备台账 - 场站设备
    usersData: [], // 设备台账 - 工商户
    eqRepairData: [], // 设备大修次数
    eqRepairPlanData: [], // 设备大修完成情况
    yhClassData: [], // 隐患类别
    eqItemData: [], // 单个提交指
  },
  effects: {
    * getDatas({payload, callback}, {call, put}) {
      const res1 = yield call(getDHomeItem, payload);
      yield put({
        type: 'eqItemDataSave',
        payload: res1.data,
      });
      const res2 = yield call(getDHomeAccount, {type: 1});
      const res6 = yield call(getDHomeAccount, {type: 2});
      const res7 = yield call(getDHomeAccount, {type: 3});
      yield put({
        type: 'changeStatus',
        payload: {
          eqLedgerData: res2.data,
          stationEquipData: res6.data,
          usersData: res7.data,
        },
      });
      const res3 = yield call(getDHomeBigRepair, payload);
      yield put({
        type: 'eqRepairDataSave',
        payload: res3.data,
      });
      const res4 = yield call(getDHomeRepair, payload);
      yield put({
        type: 'eqRepairPlanDataSave',
        payload: res4.data,
      });
      const res5 = yield call(getDHomeYhClass, payload);
      yield put({
        type: 'yhClassDataSave',
        payload: res5.data,
      });
      console.log(res1,res2,res3,res4,res5,res6,res7);
      callback && callback(res5, res3);
    },
    // 待办事项
    * getHomeTodoParams({payload, callback}, {call, put}) {
      const res = yield call(getHomeTodoParams, payload);
      yield put({
        type: 'todoDataSave',
        payload: res.data,
      });
    },
    // 趋势洞察
    * getHomePatrolLen({payload, callback}, {call, put}) {
      const res = yield call(getHomePatrolLen, payload);
      yield put({
        type: 'patrolDataSave',
        payload: res.data,
      });
      if (callback) {
        callback(res.data);
      }
    },
    // 绩效自驱
    * getHomeScoreRanking({payload, callback}, {call, put}) {
      const res = yield call(getHomeScoreRanking, payload);
      yield put({
        type: 'scoreDataSave',
        payload: res.data,
      });
    },
    //  运营洞察
    * getHomeYYDC({payload}, {call, put}) {
      const res = yield call(getHomeYYDC, payload);
      yield put({
        type: 'operateDataSave',
        payload: res.data,
      });
    },
    //  设备台账统计
    * getDHomeAccount({payload}, {call, put}) {
      const res = yield call(getDHomeAccount, payload);
      yield put({
        type: 'eqLedgerDataSave',
        payload: res.data,
      });
    },
    //  设备大修次数统计
    * getDHomeBigRepair({payload, callback}, {call, put}) {
      const res = yield call(getDHomeBigRepair, payload);
      yield put({
        type: 'eqRepairDataSave',
        payload: res.data,
      });
      callback && callback(res)
    },
    //  单个提交指
    * getDHomeItem({payload}, {call, put}) {
      const res = yield call(getDHomeItem, payload);
      yield put({
        type: 'eqItemDataSave',
        payload: res.data,
      });
    },
    //  设备大修完成情况统
    * getDHomeRepair({payload}, {call, put}) {
      const res = yield call(getDHomeRepair, payload);
      yield put({
        type: 'eqRepairPlanDataSave',
        payload: res.data,
      });
    },
    //  隐患类别统
    * getDHomeYhClass({payload, callback}, {call, put}) {
      const res = yield call(getDHomeYhClass, payload);
      yield put({
        type: 'yhClassDataSave',
        payload: res.data,
      });
      callback && callback(res)
    },
  },

  reducers: {
    changeStatus(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },

    todoDataSave(state, action) {
      return {
        ...state,
        todoData: action.payload,
      };
    },

    patrolDataSave(state, action) {
      return {
        ...state,
        patrolData: action.payload,
      };
    },
    scoreDataSave(state, action) {
      return {
        ...state,
        scoreData: action.payload,
      };
    },
    operateDataSave(state, action) {
      return {
        ...state,
        operateData: action.payload,
      };
    },
    eqLedgerDataSave(state, action) {
      return {
        ...state,
        eqLedgerData: action.payload,
      };
    },
    eqRepairDataSave(state, action) {
      return {
        ...state,
        eqRepairData: action.payload,
      };
    },
    eqItemDataSave(state, action) {
      return {
        ...state,
        eqItemData: action.payload,
      };
    },
    eqRepairPlanDataSave(state, action) {
      return {
        ...state,
        eqRepairPlanData: action.payload,
      };
    },
    yhClassDataSave(state, action) {
      return {
        ...state,
        yhClassData: action.payload,
      };
    },
  },
};

