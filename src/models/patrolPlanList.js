import { queryPatrolPlanData, queryStationData, changePatrolPlanState, deletePatrolPlan, queryAreaData,
  queryUsernamesData, queryLayerData, queryPatrolTaskDetailData, insertPatrolPlan, updatePatrolPlan ,
  queryPointsByAreaAndLayer, getKeypointsByAreaid, querypipeData, queryEqData, querypatrolCycle, getMetadata,
  generatePlans, insertPatrolPlanEdit, getWalkWay, queryPatrolDetailData } from '../services/patrol';
import  {message} from 'antd';
import {sortBy} from 'lodash';
import {notification} from "antd/lib/index";
export default {
  namespace: 'patrolPlanList',
  state: {
    patrolPlanList: [],
    planTotal: '0',
    stationData: [],
    areaData: [],
    usernamesData: [],
    // layersData: [],
    patrolTaskDetailData: {},
    patrolCycle: [], //巡视周期
    walkWay: [],
    patrolDetailData: [], //管段、设备数据
    patrolDetailAllData: [],
  },
  effects: {
    *getPatrolPlanData({ payload, callback }, { call, put }) {
      const res = yield call(queryPatrolPlanData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      if(callback){
        callback(res.data);
      }else{
        yield put({
          type: 'changePatrolPlanData',
          payload: res,
        });
      }
    },
    *getStationData({ payload, callback }, { call, put }) {
      const res = yield call(queryStationData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      let stationObj={};
      const newStation=sortBy(res.data,['stationid']);
      const stationList = (newStation || []).map((item,index) => {
        stationObj[item.locCode]=index+res.data.length;
        return {
          name: item.locName,
          value: item.locCode,
        };
      });
      if(stationList.length > 1){
        stationList.unshift({ name: '全部', value: '' });
      }
      yield put({
        type: 'changeStationData',
        payload: stationList,
      });
      callback && callback({stationList,stationObj});
    },
    *getAreaData({ payload, callback }, { call, put }) {
      const res = yield call(queryAreaData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changeAreaData',
        payload: res.data,
      });
      callback && callback(res);
    },
    *getLayerData({ callback }, { call, put }) {
      const res = yield call(queryLayerData);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      let data = [];
      for(let i = 0; i < res.data.length; i++) {
        if(res.data[i].name === '关键点'){
          data.push(res.data[i]);
        }
      }
      callback && callback(data, res);
    },
    *getUsernamesData({ payload }, { call, put }) {
      const res = yield call(queryUsernamesData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      console.log(res.data, 'filter')
      yield put({
        type: 'changeUsernamesData',
        payload: res.data,
      });
    },
    *getPatrolTaskDetailData({ payload }, { call, put }) {
      const res = yield call(queryPatrolTaskDetailData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changePatrolTaskDetailData',
        payload: res.data,
      });
    },
    *channgePatrolPlanState({ payload, callback }, { call, put }) {
      const res = yield call(changePatrolPlanState, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *deletePatrolPlan({ payload, callback }, { call, put }) {
      const res = yield call(deletePatrolPlan, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *insertPatrolPlan({ payload, callback }, { call, put }) {
      const res = yield call(insertPatrolPlan, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *updatePatrolPlan({ payload, callback }, { call, put }) {
      const res = yield call(updatePatrolPlan, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *queryPointsByAreaAndLayer({ areaid, layerid, payload, callback }, { call, put }) {
      const res = yield call(queryPointsByAreaAndLayer, areaid, layerid, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getKeypointsByAreaid({payload, callback }, { call, put }) {
      const res = yield call(getKeypointsByAreaid, payload);

      callback && callback(res.data);
    },
    *querypipeData({ layerid, payload, callback }, { call, put }) {
      const res = yield call(querypipeData, layerid, payload);
      callback && callback(res);
    },
    *queryEqData({ layerid, payload, callback }, { call, put }) {
      const res = yield call(queryEqData, layerid, payload);
      callback && callback(res);
    },
    *querypatrolCycle({payload, callback }, { call, put }) {
      const res = yield call(querypatrolCycle, payload);
      yield put({
        type: 'patrolCycle',
        payload: res.data,
      });
      callback && callback(res);
    },
    *getMetadata({payload, callback }, { call, put }) {
      const res = yield call(getMetadata, payload);
      callback && callback(res);
    },
    *generatePlansForNow({payload}, {call, put}) {
      const res = yield call(generatePlans, payload);
      if (res.success) {
        notification.success({ message: '已生成任务', duration: 3});
      } else {
        notification.error({ message: res.msg, duration: 3 });
      }
    },
    *insertPatrolPlanEdit({ payload, callback }, { call, put }) {
      const res = yield call(insertPatrolPlanEdit, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getWalkWay({ payload, callback }, { call, put }) {
      const res = yield call(getWalkWay, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'walkWayData',
        payload: res.data,
      });
      callback && callback(res);
    },
    *queryPatrolDetailData({ payload, callback }, { call, put }) {
      const res = yield call(queryPatrolDetailData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'patrolDetailData',
        payload: res.data,
      });
      callback && callback(res);
    },
    *getPatrolTaskDetailAllData({ payload, callback }, { call, put }) {
      const res = yield call(queryPatrolTaskDetailData, payload);
      if(!res.success){
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'patrolDetailAllData',
        payload: res.data,
      });
      callback && callback(res);
    },
  },
  reducers: {
    changePatrolPlanData(state, action) {
      return {
        ...state,
        patrolPlanList: action.payload.data,
        planTotal: action.payload.total
      };
    },
    changeStationData(state, action) {
      return {
        ...state,
        stationData: action.payload,
      };
    },
    changeAreaData(state, action) {
      return {
        ...state,
        areaData: action.payload,
      };
    },
    changeUsernamesData(state, action) {
      return {
        ...state,
        usernamesData: action.payload,
      };
    },
    changePatrolTaskDetailData(state, action) {
      return {
        ...state,
        patrolTaskDetailData: action.payload,
      };
    },
    patrolCycle(state, action) {
      return {
        ...state,
        patrolCycle: action.payload,
      };
    },
    walkWayData(state, action) {
      return {
        ...state,
        walkWay: action.payload,
      };
    },
    patrolDetailData(state, action) {
      return {
        ...state,
        patrolDetailData: action.payload,
      };
    },
    patrolDetailAllData(state, action) {
      return {
        ...state,
        patrolDetailAllData: action.payload,
      };
    },
  },
};


