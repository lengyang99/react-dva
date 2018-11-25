import {
    getMakeMonth, 
    queryMakeMonth, 
    getMonthTotalDetail,
    getMonthDetail,
    addMonthMake,
    updateMonthMake,
    getLastyearMonth,
    getCNGStation,
    exportExcel
 } from '../services/make';
  
  export default {
    namespace: 'make',
    state: {
        success:true,
        msg:'',
        monthList: [],//列表
        dataTotal: [],//总体情况
        dataDetail: [],//详细情况
        lastyearMonth: [],//去年信息
        cng: [],//cng、母站的上报信息
    },
    effects: {
        //查询月计划制定列表
        * getMonthList({callback},{call, put}) {
            const res = yield call(getMakeMonth);
            yield put({
                type: 'monthList',
                payload: res.data,
            });
            callback && callback(res);
        },

        //根据日期查询月计划制定列表
        * queryMonthList({params, callback},{call, put}) {
            const res = yield call(queryMakeMonth, params);
            yield put({
                type: 'monthList',
                payload: res.data,
            });
            callback && callback(res);
        },

        //查询月计划制定总体情况
        * getMonthTotalDetail({params, callback},{call, put}) {
            const res = yield call(getMonthTotalDetail, params);
            yield put({
                type: 'monthTotal',
                data: res.data,
            });
            callback && callback(res);
        },

        //查询月计划制定详细情况
        * getMonthDetail({params, callback},{call, put}) {
            const res = yield call(getMonthDetail, params);
            yield put({
                type: 'monthDetail',
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

        //月计划制定上报
        * addMonthMake({params, callback}, {call}) {
            const res = yield call(addMonthMake, params);
            callback && callback(res);
        },

        //月计划制定总体情况修改
        * updateMonthMake({params, callback}, {call}) {
            const res = yield call(updateMonthMake, params);
            callback && callback(res);
        },

        //报表导出
        * exportExcel({params}, {call}) {
            yield call(exportExcel, params);
        },
    },

    reducers: {
        monthList(state, action) {
            return {
            ...state,
            monthList: action.payload,
            };
        },

        monthTotal(state, action) {
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

        monthDetail(state, action) {
            return {
            ...state,
            dataDetail: action.data,
            };
        },
    },
  };
  