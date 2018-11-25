import { message } from 'antd';
import {
  getEmerEvent, getEmerStart, send, endEmer, getEmerReport, getcarlastposition, detectionMessage,
  getManyUserPosition, getManyUserCurrentPosition, v2, baiduVista, identify, getBaiduWay, getAllResources,
  callUp, getGlobalPhone, updateSceneControlPlan, emerVerify, changeCurrentEmerEvent, getCurrentEmerEvent,
  makeSureSceneControlPlan, getUsers, getEmerModeConf, getDatas, deleteOrganization, updateOrganization, getRes,
  getEmerTemplateConf
} from '../services/emerLfMap';

import emerUser from '../routes/emer/data/emerUser';

export default {
  namespace: 'emerLfMap',
  state: {
    currentEmerEvent: null, // 当前应急事件
    currentEmerEventData: null, // 当前点击应急事件
    currentClickEvent: null, // 事件列表所点击的事件
    resources: [], // 资源准备情况
    getresources: [], //资源准备情况新
    users: [], // 人员
    sceneController: [], // 现场控制人员
    map: null, // 地图
    phone: '', // 主叫号码
    ecodePattern: null, // 企业模式配置
    flowPattern: null, // 流程模式
    isEmerStatus: false, //  应急/平时状态
    isShowEmerWarn: false, // 是否展示应急提醒(平时-右下)
    isShowEmerRep: false, // 是否展示应急上报提醒(平时-右下)
    isShowRightNavigation: false, // 是否展示右侧导航栏(右)
    isShowGoodsDispatch: false, // 是否展示物资调度(弹窗)
    isShowEmerEventAdd: false, // 是否展示接警(弹窗)
    isShowEmerEventList: false, // 是否展示应急事件列表(弹窗)
    isShowEmerEventPlan: false, // 是否展示应急预案(弹窗)
    isShowEmerOrder: false, // 是否展示应急指令(弹窗)
    isShowEmerReport: false, // 是否展示应急报告(弹窗)
    isShowEmerExpert: false, // 是否展示应急专家(弹窗)
    isShowEmerStop: false, // 是否展示应急终止(弹窗)
    isShowRecoverGasSupply: false, // 是否展示恢复供气(弹窗)
    isShowControllPlan: false, // 是否展示控制方案(弹窗)
    emerTemplateId: '',// 应急模版文件的uuid
  },
  effects: {
    *getEmerEvent({ payload, callback }, { call, put }) {
      const res = yield call(getEmerEvent, payload);
      if (res.response && res.response.status === '502') {
        console.log(`${res.response.statusText}`);
        console.log(`url:${res.response.url}`);
        return;
      }
      if (!res.success) {
        return;
      }
      callback && callback(res);
    },
    *getEmerStart({ payload, callback }, { call, put }) {
      const res = yield call(getEmerStart, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急预案关联的应急组织机构
    * getEmerOrganization({ payload, callback }, { select, call }) {
      const url = yield select((state) => state.emerLfMap.ecodePattern.emerStartOrder.getEmerOrganization);
      const res = yield call(getDatas, { url, payload });
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *deleteOrganization({ payload, callback }, { call, put }) {
      const res = yield call(deleteOrganization, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *updateOrganization({ payload, callback }, { call, put }) {
      const res = yield call(updateOrganization, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *send({ payload, callback }, { call, put }) {
      const res = yield call(send, payload);
      callback && callback(res);
    },
    *endEmer({ payload, callback }, { call, put }) {
      const res = yield call(endEmer, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getEmerReport({ payload, callback }, { select, call, put }) {
      const url = yield select((state) => state.emerLfMap.ecodePattern.emerReport.getEmerReport);
      const res = yield call(getEmerReport, { url, payload });
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getcarlastposition({ payload, callback }, { call, put }) {
      const res = yield call(getcarlastposition, payload);
      if (res.response && res.response.status === '502') {
        console.log(`${res.response.statusText}`);
        console.log(`url:${res.response.url}`);
        return;
      }
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *detectionMessage({ payload, callback }, { call, put }) {
      const res = yield call(detectionMessage, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getManyUserPosition({ payload, callback }, { call, put }) {
      const res = yield call(getManyUserPosition, payload);
      if (res.response && res.response.status === '502') {
        console.log(`${res.response.statusText}`);
        console.log(`url:${res.response.url}`);
        return;
      }
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *getManyUserCurrentPosition({ payload, callback }, { call, put }) {
      const res = yield call(getManyUserCurrentPosition, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *v2({ payload, callback }, { call, put }) {
      const res = yield call(v2, payload);
      callback && callback(res);
    },
    *baiduVista({ payload, callback }, { call, put }) {
      const res = yield call(baiduVista, payload);
      callback && callback(res);
    },
    *identify({ payload, callback }, { select, call, put }) {
      const url = yield select((state) => state.emerLfMap.ecodePattern.emerVerify.getLine);
      const res = yield call(identify, { payload, url });
      callback && callback(res);
    },
    *getBaiduWay({ payload, callback }, { call, put }) {
      const res = yield call(getBaiduWay, payload);
      callback && callback(res);
    },
    *callUp({ payload, callback }, { call, put }) {
      const res = yield call(callUp, payload);
      if (res.errcode !== 0) {
        message.error(res.des);
        return;
      }
      message.info('呼叫中...');
      callback && callback();
    },
    *getResources({ payload, callback }, { call, put }) {
      const res = yield call(getAllResources, payload);
      if (res.response && res.response.status === '502') {
        console.log(`${res.response.statusText}`);
        console.log(`url:${res.response.url}`);
        return;
      }
      if (!res.success) {
        return;
      }
      if (!res.data) {
        message.error('无数据');
        return;
      }
      let newRes = [...res.data.persons, ...res.data.cars];
      yield put({
        type: 'setResources',
        payload: newRes,
      });
      callback && callback(newRes);
    },
    *getUsers({ payload, callback }, { call, put }) {
      const res = yield call(getUsers, payload);
      if (res.data.length === 0) {
        message.error('无人员数据');
        return;
      }
      yield put({
        type: 'setUsers',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    *getGlobalPhone({ payload }, { call, put }) {
      const res = yield call(getGlobalPhone, payload);
      console.log(res);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'setPhone',
        payload: res.data.phone,
      });
    },
    *updateSceneControlPlan({ payload, callback }, { call, put }) {
      const res = yield call(updateSceneControlPlan, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *makeSureSceneControlPlan({ payload, callback }, { call, put }) {
      const res = yield call(makeSureSceneControlPlan, payload);
      if (!res.success) {
        message.warn(res.msg);
        return;
      }
      callback && callback(res);
    },
    *emerVerify({ payload, callback }, { call, put }) {
      const res = yield call(emerVerify, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *changeCurrentEmerEvent({ payload, callback }, { call, put }) {
      const res = yield call(changeCurrentEmerEvent, { eventId: payload.alarmId });
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'setCurrentEmerEvent',
        payload,
      });
      callback && callback(res);
    },
    *getEmerModeConf({ payload, callback }, { call, put }) {
      const res = yield call(getEmerModeConf, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'setFlag',
        payload: { flowPattern: res.data },
      });
      callback && callback(res);
    },
    // 资源准备情况
    * getRes({ payload, callback }, { call, put }) {
      const res = yield call(getRes, payload);
      if (res.response && res.response.status === '502') {
        console.log(`${res.response.statusText}`);
        console.log(`url:${res.response.url}`);
        return;
      }
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'getResSituation',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    // 当前点击事件数据
    * getCurrentEmerEvent({ payload, callback }, { call, put }) {
      const res = yield call(getCurrentEmerEvent, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'getCEmerEvent',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    // 查询现场控制人员
    *getSceneController({ payload }, { call, put }) {
      const res = yield call(getUsers, payload);
      if (res.data.length === 0) {
        message.error('无人员数据');
        return;
      }
      yield put({
        type: 'setSceneController',
        payload: res.data,
      });
    },
    // 获取模版配置信息
    *getEmerTemplateConf({ payload, callback }, { call, put }) {
      const res = yield call(getEmerTemplateConf, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'setEmerTemplateConf',
        payload: res.data,
      });
    },
  },
  reducers: {
    getResSituation(state, action) {
      return {
        ...state,
        getresources: action.payload,
      };
    },
    setResources(state, action) {
      return {
        ...state,
        resources: action.payload,
      };
    },
    setUsers(state, action) {
      return {
        ...state,
        users: action.payload,
      };
    },
    setPhone(state, action) {
      return {
        ...state,
        phone: action.payload,
      };
    },
    setCurrentEmerEvent(state, action) {
      return {
        ...state,
        currentEmerEvent: action.payload,
      };
    },
    setMap(state, action) {
      return {
        ...state,
        map: action.payload,
      };
    },
    setFlag(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    getCEmerEvent(state, action) {
      return {
        ...state,
        currentEmerEventData: action.payload,
      };
    },
    setSceneController(state, action) {
      return {
        ...state,
        sceneController: action.payload,
      };
    },
    setEmerTemplateConf(state, action) {
      return {
        ...state,
        emerTemplateId: action.payload,
      };
    }
  },
};

