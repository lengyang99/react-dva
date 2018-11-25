import {
    getMonthList, 
    queryMonthList, 
    getMonthDetail, 
    addMonthPlan, 
    updateMonthPlan,
    getWeekList, 
    queryWeekList, 
    getWeekDetail, 
    addWeekPlan, 
    updateWeekPlan,
    excelImport
 } from '../services/report';
  
  export default {
    namespace: 'report',
    state: {
        success:true,
        msg:'',
        data: [],
        dataList: [],
        dataMonth: {},
        dataWeek: {},
    },
    effects: {
        //查询月计划列表
        * getMonthList({callback},{call, put}) {
            const res = yield call(getMonthList);
            yield put({
                type: 'monthList',
                payload: res.data,
            });
            callback && callback(res);
        },

        //根据日期查询月计划列表
        * queryMonthList({params},{call, put}) {
            const res = yield call(queryMonthList, params);
            yield put({
                type: 'monthList',
                payload: res.data,
            });
        },

        //查询月计划详情
        * getMonthDetail({params},{call, put}) {
            const res = yield call(getMonthDetail, params);
            yield put({
                type: 'monthDetail',
                data: res.data,
            });
        },

        //月计划上报
        * addMonthPlan({params, callback}, {call}) {
            const res = yield call(addMonthPlan, params);
            callback && callback(res);
          },

        //月计划表单修改
        * updateMonthPlan({params, callback}, {call}) {
            const res = yield call(updateMonthPlan, params);
            callback && callback(res);
          },

        //查询周计划列表
        * getWeekList({callback},{call, put}) {
            const res = yield call(getWeekList);
            yield put({
                type: 'weekList',
                payload: res.data,
            });
            callback && callback(res);
        },

        //根据日期查询周计划列表
        * queryWeekList({params},{call, put}) {
            const res = yield call(queryWeekList, params);
            yield put({
                type: 'weekList',
                payload: res.data,
            });
        },

        //查询周计划详情
        * getWeekDetail({params},{call, put}) {
            const res = yield call(getWeekDetail, params);
            yield put({
                type: 'weekDetail',
                data: res.data,
            });
        },

        //周计划上报
        * addWeekPlan({params, callback}, {call}) {
            const res = yield call(addWeekPlan, params);
            callback && callback(res);
          },

        //周计划表单修改
        * updateWeekPlan({params, callback}, {call}) {
            const res = yield call(updateWeekPlan, params);
            callback && callback(res);
          },
    },

    reducers: {
        monthList(state, action) {
            return {
            ...state,
            data: action.payload,
            };
        },

        monthDetail(state, action) {
            return {
            ...state,
            dataMonth: action.data,
            };
        },

        weekList(state, action) {
            return {
            ...state,
            dataList: action.payload,
            };
        },

        weekDetail(state, action) {
            return {
            ...state,
            dataWeek: action.data,
            };
        },
    },
  };
  