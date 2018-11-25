import {
    getList,
    getFactory
 } from '../services/spareParts';
  
  export default {
    namespace: 'spareParts',
    state: {
        dataList: [],
        factoryList: [],
    },
    effects: {
        //查询列表
        * getList({params, callback},{call, put}) {
            const res = yield call(getList, params);
            yield put({
                type: 'sparePartsList',
                param: res.data,
            });
            callback && callback(res);
        },

        //查询工厂
        * getFactory(_,{call, put}) {
            const res = yield call(getFactory);
            yield put({
                type: 'factoryList',
                param: res.data,
            });
        },
    },

    reducers: {
        sparePartsList(state, action) {
            return {
            ...state,
            dataList: action.param,
            };
        },

        factoryList(state, action) {
            return {
            ...state,
            factoryList: action.param,
            };
        },
    },
  };
  