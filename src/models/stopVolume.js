import {
    getList,
    getType,
    downLoad,
 } from '../services/stopVolume';
  export default {
    namespace: 'stopVolume',
    state: {
        dataList: [],
        type: [],
    },
    effects: {
        //查询列表
        * getList({params, callback},{call, put}) {
            const res = yield call(getList, params);
            yield put({
                type: 'stopVolumeList',
                param: res.data,
            });
            callback && callback(res);
        },

        //查询类型
        * getType(_,{call, put}) {
            const res = yield call(getType);
            yield put({
                type: 'typeList',
                param: res.data || [],
            });
        },
    },

    reducers: {
        stopVolumeList(state, action) {
            return {
            ...state,
            dataList: action.param,
            };
        },

        typeList(state, action) {
            return {
            ...state,
            type: action.param,
            };
        },
    },
  };
