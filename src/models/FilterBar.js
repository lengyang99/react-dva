import { routerRedux } from 'dva/router';
import { message } from 'antd';
import { queryFilterBar } from '../services/api';

export default {
  namespace: 'filterbar',

  state: {
    datanames: [],
    plan: []

  },

  effects: {
    init: function * ({key}, {put}){
      const data = yield fetch("/proxy/task/function/list?group=net").then((data)=>{return data.json()})
      yield put({"type": "init_sync", data});
      yield put({"type": "fetchDate"});
    },
    //查询；
    addfilter: function * ({key,parmas}, {put}){
      const plan = yield fetch("/proxy/task/plan/query?function="+ key + parmas).then((data)=>{return data.json()})
      yield put({"type": "addfilter_sync", plan});
      // yield put({"type": "fetchDate"})
    },
    //删除计划；
    delplan: function * ({planId}, {put}){
      const del = yield fetch("/proxy/task/plan/delete?planId=" + planId, {
        "method": "DELETE",
        "headers": {
          "Content-Type": "application/json"
        }
      }).then((data)=>{return data.json()})
      yield put({"type": "fetchDate"})
    },
    //停止计划；
    stopplan: function * ({planId}, {put}){
      const stop = yield fetch("/proxy/task/plan/stop?planId=" + planId, {
        "method": "GET",
        "headers": {
          "Content-Type": "application/json"
        }
      }).then((data)=>{return data.json()})
      yield put({"type": "fetchDate"})
    },
    //启动计划；
    startplan: function * ({planId}, {put}){
      const stop = yield fetch("/proxy/task/plan/start?planId=" + planId, {
        "method": "GET",
        "headers": {
          "Content-Type": "application/json"
        }
      }).then((data)=>{return data.json()})
      yield put({"type": "fetchDate"})
    },
    //改变ABC的functionKey;
    changefunctionkey: function * ({key}, {put}){
      const plan = yield fetch("/proxy/task/plan/query?function=" + key, {
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify(key)
      }).then((data)=>{return data.json()})
      yield put({"type": "changefunctionkey_sync", plan})
    },
    //拉取数据
    fetchDate: function * ({key}, {put}){
      const keys = key === undefined ? "valve" : key; 
      const plan = yield fetch("/proxy/task/plan/query?function=" + keys, {
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": JSON.stringify()
      }).then((data)=>{return data.json()})
      yield put({"type": "fetchDate_sync", plan})
      console.log(plan, "qqq")
    }
  },

  reducers: {
      init_sync(state,{data}){
        return{
          ...state,
          datanames: data.list|| [],
        }
      },
      //增加筛选条件；
      addfilter_sync(state, {plan}){
        return {
          ...state,
          plan: plan.list || []
        }
      },
      changefunctionkey_sync(state, {plan}){
        return{
          ...state,
          plan: plan.list || []
        }
      },
      fetchDate_sync(state,{plan}){
        return{
          ...state,
          plan: plan.list || []
        }
      }
  }
};
