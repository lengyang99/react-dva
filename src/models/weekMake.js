import {
    getMakeWeek, 
    queryMakeWeek, 
    getWeekTotal,
    getWeekDetail,
    getLastyearMonth,
    addWeekMake,
    updateWeekMake,
    getCNGStation,
    exportExcel
 } from '../services/weekMake';
  
  export default {
    namespace: 'weekMake',
    state: {
        success:true,
        msg:'',
        weekList: [],//列表
        dataTotal: [],//总体情况
        dataDetail: [],//详细情况
        lastyearMonth: [],//去年信息
        cng: [],//cng、母站上报信息
    },
    effects: {
        //查询周计划制定列表
        * getMakeWeek({callback},{call, put}) {
            const res = yield call(getMakeWeek);
            yield put({
                type: 'weekList',
                data: res.data,
            });
            callback && callback(res);
        },

        //根据日期查询周计划制定列表
        * queryMakeWeek({params, callback},{call, put}) {
            const res = yield call(queryMakeWeek, params);
            yield put({
                type: 'weekList',
                data: res.data,
            });
            callback && callback(res);
        },

        //查询周计划制定总体情况
        * getWeekTotal({params, callback},{call, put}) {
            const res = yield call(getWeekTotal, params);
            yield put({
                type: 'weekTotal',
                data: res.data,
            });
            callback && callback(res);
        },

        //查询周计划制定详细情况
        * getWeekDetail({params, callback},{call, put}) {
            const res = yield call(getWeekDetail, params);
            yield put({
                type: 'weekDetail',
                data: res.data,
            });
            callback && callback(res);
        },

        //查询总体情况去年信息
        * getLastyearMonth({params, callback},{call, put}) {
            const res = yield call(getLastyearMonth, params);
            yield put({
                type: 'lastyear',
                data: res.data,
            });
            callback && callback(res);
        },

        //查询cng、母站上报信息
        * getCNGStation({params, callback},{call, put}) {
            const res = yield call(getCNGStation, params);
            yield put({
                type: 'getCNG',
                data: res.data,
            });
            callback && callback(res);
        },

        //周计划制定上报
        * addWeekMake({params, callback}, {call}) {
            const res = yield call(addWeekMake, params);
            callback && callback(res);
        },

        //周计划制定修改
        * updateWeekMake({params, callback}, {call}) {
            const res = yield call(updateWeekMake, params);
            callback && callback(res);
        },

        //报表导出
        * exportExcel({params}, {call}) {
            yield call(exportExcel, params);
        },
    },

    reducers: {
        weekList(state, action) {
            return {
            ...state,
            weekList: action.data,
            };
        },

        weekTotal(state, action) {
            return {
            ...state,
            dataTotal: action.data,
            };
        },

        lastyear(state, action) {
            return {
            ...state,
            lastyearMonth: action.data,
            };
        },

        getCNG(state, action) {
            return {
            ...state,
            cng: action.data,
            };
        },

        weekDetail(state, action) {
            return {
            ...state,
            dataDetail: action.data,
            };
        },
    },
  };
  