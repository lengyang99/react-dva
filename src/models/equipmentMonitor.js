import {
    getDataSource,
    getDataType,
    getMonitorList,
    getDataUnit,
    newPlan,
    getMonitorDetail,
    delMonitorData,
 } from '../services/equipmentMonitor';
  
  export default {
    namespace: 'equipmentMonitor',
    state: {
        dataType: {},
        dataSource: {},
        monitorData: [],
        unitData: {},
        monitorTotal: 0,
        detailData: {},
    },
    effects: {
        //设备检测列表；
        * getMonitorList({payload},{call, put}) {
            const res = yield call(getMonitorList, payload);
            yield put({
                type: 'monitorData',
                payload: res.data,
                total: res.total,
            });
        },
        //值类型
        * getDataType({_, callback},{call, put}) {
            const res = yield call(getDataType);
            yield put({
                type: 'dataType',
                param: res.data,
            });
            callback && callback(res);
        },

        //数据来源
        * getDataSource(_,{call, put}) {
            const res = yield call(getDataSource);
            yield put({
                type: 'dataSource',
                param: res.data,
            });
        },
        //设备检测单位；
        * getDataUnit(payload,{call, put}) {
            const res = yield call(getDataUnit, payload);
            yield put({
                type: 'unitData',
                payload: res.data,
            });
        },
        //新建；
        * newPlan({payload, callback},{call, put}) {
            const res = yield call(newPlan, payload);
            callback && callback(res);
        },
        //计划详情；
        * getMonitorDetail({payload, callback},{call, put}) {
            const res = yield call(getMonitorDetail, payload);
            yield put({
                type: 'detailData',
                payload: res.data,
            });
            callback && callback(res);
        },
        //删除计划；
        * delMonitorData({payload, callback},{call, put}) {
            const res = yield call(delMonitorData, payload);
            callback && callback(res);
        },
    },

    reducers: {
        monitorData(state, action) {
            return {
                ...state,
                monitorData: action.payload,
                monitorTotal: action.total,
            };
        },
        dataType(state, action) {
            return {
            ...state,
            dataType: action.param,
            };
        },
        dataSource(state, action) {
            return {
                ...state,
                dataSource: action.param,
            };
        },
        unitData(state, action) {
            return {
                ...state,
                unitData: action.payload,
            };
        },
        detailData(state, action) {
            return {
                ...state,
                detailData: action.payload,
            };
        },
    },
  };
  