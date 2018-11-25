import {
  queryPatrolTaskData,
  queryLayerData,
  delTaskByGid,
  transferTask,
  getPatrolDeviceFeedbackInfo,
  getUserInfoByStationCode,
  getMetadata,
  queryEqData,
  queryPlanCycleList
} from '../services/patrol';
import { message } from 'antd';

export default {
  namespace: 'patrolTaskList',
  state: {
    patrolTaskList: [],
    taskTotal: '0',
    stationData: [],
    checkNum: { allNum: 0, notCompleteNum: 0, completeNum: 0, overdueNum: 0 },
    patrolLayerInfo: [],
    authorityMenu: [],
    taskReceiverList: [], // 任务接收人信息
    patrolDeviceFeedbackInfo: [],
    patrolDeviceDetailsInfo: {},
    patrolCycleData: [], // 巡视周期
  },
  effects: {
    *getPatrolTaskData({ payload, callback }, { call, put }) {
      const res = yield call(queryPatrolTaskData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'changePatrolTaskData',
        payload: res,
      });
      callback && callback(res)
    },
    *getPatrolLayerInfo(action, { call, put }) {
      const res = yield call(queryLayerData);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'savePatrolLayerInfo',
        payload: res.data,
      });
    },
    *delTaskByGid(action, { call, put }) {
      const res = yield call(delTaskByGid, action.gid);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.info('任务删除成功!');
    },
    *getUserInfoByStationCode({ stationCode, callback }, { call, put }) {
      const res = yield call(getUserInfoByStationCode, stationCode);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'saveUserInfoByStatioId',
        payload: res.data,
      });
      callback && callback(res);
    },
    *transferTask({ payload, callback }, { call }) {
      const res = yield call(transferTask, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.info('任务转交成功!');
      callback && callback();
    },
    *getPatrolDeviceFeedbackInfo(action, { call, put }) {
      const res = yield call(getPatrolDeviceFeedbackInfo, action.feedbackid, action.groupid);
      let tmp = {};
      if (res.success) {
        tmp = res.data.params[0];
      }
      yield put({
        type: 'savePatrolDeviceFeedbackInfo',
        payload: tmp,
      });
    },
    *getPatrolDeviceDetailsInfo({ params }, { call, put }) {
      // 查询设备layerid
      const mapMetasInfo = yield call(getMetadata, params);
      if (!mapMetasInfo.metainfo) return;
      let metainfo = mapMetasInfo.metainfo.filter((item) => { return item.code === `${params.ecode}_MER` });
      let eqLayerInfo = metainfo[0].net.filter((item) => { return `${item.dno}` === params.layername })[0];
      if (!eqLayerInfo) {
        message.error(`${params.layername}图层编号查询失败！`);
        return;
      }
      let eqLayerId = eqLayerInfo.layerid;
      // 查询设备险情
      const eqInfo = yield call(queryEqData, eqLayerId, {
        ecode: params.ecode,
        where: `(eqptcode='${params.eqptcode}')`,
        returnGeometry: 'true',
        pageno: 1,
        pagesize: 1,
        f: 'json',
        outFields: '*',
        geometryType: 'extent'
      });
      yield put({
        type: 'savePatrolDeviceDetailsInfo',
        payload: eqInfo,
      });
    },
    *queryPatrolCycle({ params }, { call, put }) {
      const res = yield call(queryPlanCycleList, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'savePatrolCycleData',
        payload: res.data,
      });
    },
  },
  reducers: {
    changePatrolTaskData(state, action) {
      return {
        ...state,
        patrolTaskList: action.payload.data,
        checkNum: action.payload.checkNum,
        taskTotal: action.payload.total,
        authorityMenu: action.payload.authority,
      };
    },
    savePatrolLayerInfo(state, action) {
      return {
        ...state,
        patrolLayerInfo: action.payload,
      };
    },
    saveUserInfoByStatioId(state, action) {
      return {
        ...state,
        taskReceiverList: action.payload,
      };
    },
    savePatrolDeviceFeedbackInfo(state, action) {
      return {
        ...state,
        patrolDeviceFeedbackInfo: action.payload,
      };
    },
    savePatrolDeviceDetailsInfo(state, action) {
      return {
        ...state,
        patrolDeviceDetailsInfo: action.payload,
      };
    },
    savePatrolCycleData(state, action) {
      return {
        ...state,
        patrolCycleData: action.payload,
      };
    },
  },
};


