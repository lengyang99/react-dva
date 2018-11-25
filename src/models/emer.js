import { message } from 'antd';
import {
  getEmerEvent,
  getEmerEventType,
  addEmerEvent,
  saveEmerEventPreDisposal,
  closeEmerEvent,
  getEmerPlan,
  addEmerStart,
  addEmerOrder,
  getEmerHandleProcessRecord,
  getEmerStart,
  getEmerPlanAttachedFileList,
  getEmerOrder,
  getEmerOrderType,
  delEmerPlan,
  addEmerPlan,
  updateEmerPlan,
  getEmerPlanType,
  getEmerProcessType,
  addEmerOrganization,
  getEmerMaterial,
  getEmerMaterialHouse,
  getEmerMaterialFactory,
  getLiveVideo,
  getEmerOrderList,
  saveEmerReport,
  addEmerReport,
  coorsBdToLocal,
  coorsLocalToBd,
  getLine,
  squibAnalysis,
  searchByLocation,
  getController,
  getEmerDrillCase,
  getDetectionMessage,
  sendRecoverGasSupplyNotice,
  sendStopGasNotice,
  getWeatherInfo,
  getLocationByIp,
  getEmerControlArea,
  getEmerExpert,
  addEmerExpert,
  updateEmerExpert,
  delEmerExpert,
  resetData, // 取消 新建预案的清空组织服务
  queryOrganizationUsers,
  getDangerType,
} from '../services/emer';

export default {
  namespace: 'emer',
  state: {
    // emerEventData: [],
    btLoading: false,
  },
  effects: {
    // 新建预案 查询组织人员信息
    * queryOrganizationUsers({ payload, callback }, { call }) {
      const res = yield call(queryOrganizationUsers, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res.data);
    },
    // 查询应急事件
    * getEmerEvent({ payload, callback }, { call }) {
      const res = yield call(getEmerEvent, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      // res.data = res.data.items;
      callback && callback(res);
    },
    // 查询应急事件类型
    * getEmerEventType({ payload, callback }, { call }) {
      const res = yield call(getEmerEventType, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 上报应急事件
    * addEmerEvent({ payload, callback }, { call }) {
      const res = yield call(addEmerEvent, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 专家名单
    * getEmerExpert({ payload, callback }, { call }) {
      const res = yield call(getEmerExpert, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      res.data = res.data.items;
      callback && callback(res);
    },
    * addEmerExpert({ payload, callback }, { call }) {
      const res = yield call(addEmerExpert, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    * updateEmerExpert({ payload, callback }, { call }) {
      const res = yield call(updateEmerExpert, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    * delEmerExpert({ payload, callback }, { call }) {
      const res = yield call(delEmerExpert, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 保存应急事件前期处置内容
    * saveEmerEventPreDisposal({ payload, callback }, { call }) {
      const res = yield call(saveEmerEventPreDisposal, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 关闭应急事件
    * closeEmerEvent({ payload, callback }, { call }) {
      const res = yield call(closeEmerEvent, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急预案
    * getEmerPlan({ payload, callback }, { call }) {
      const res = yield call(getEmerPlan, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 保存应急启动信息
    * addEmerStart({ payload, callback }, { call }) {
      const res = yield call(addEmerStart, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    // 发布应急指令
    * addEmerOrder({ payload, callback }, { call }) {
      const res = yield call(addEmerOrder, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急处置信息
    * getEmerHandleProcessRecord({ payload, callback }, { call }) {
      const res = yield call(getEmerHandleProcessRecord, payload);
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
    // 查询应急启动信息
    * getEmerStart({ payload, callback }, { call }) {
      const res = yield call(getEmerStart, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急预案附件列表
    * getEmerPlanAttachedFileList({ payload, callback }, { call }) {
      const res = yield call(getEmerPlanAttachedFileList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急指令
    * getEmerOrder({ payload, callback }, { call }) {
      const res = yield call(getEmerOrder, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急指令类型
    * getEmerOrderType({ payload, callback }, { call }) {
      const res = yield call(getEmerOrderType, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 删除应急预案
    * delEmerPlan({ payload, callback }, { call }) {
      const res = yield call(delEmerPlan, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 新建应急预案
    * addEmerPlan({ payload, callback }, { call }) {
      const res = yield call(addEmerPlan, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 修改应急预案
    * updateEmerPlan({ payload, callback }, { call }) {
      const res = yield call(updateEmerPlan, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急预案类型
    * getEmerPlanType({ payload, callback }, { call }) {
      const res = yield call(getEmerPlanType, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急处置进度
    * getEmerProcessType({ payload, callback }, { call }) {
      const res = yield call(getEmerProcessType, payload);
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
    // 新增应急组织机构
    * addEmerOrganization({ payload, callback }, { call, put }) {
      yield put({
        type: 'btLoadingChange',
        payload: true,
      });
      const res = yield call(addEmerOrganization, payload);
      yield put({
        type: 'btLoadingChange',
        payload: false,
      });
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急物资信息
    * getEmerMaterial({ payload, callback }, { call }) {
      const res = yield call(getEmerMaterial, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急物资仓库
    * getEmerMaterialHouse({ payload, callback }, { call }) {
      const res = yield call(getEmerMaterialHouse, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询应急物资工厂
    * getEmerMaterialFactory({ payload, callback }, { call }) {
      const res = yield call(getEmerMaterialFactory, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 根据企业编码ecode查视频编码ccode
    * getLiveVideo({ payload, callback }, { call }) {
      const res = yield call(getLiveVideo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询在应急处置过程中发布的应急指令
    * getEmerOrderList({ payload, callback }, { call }) {
      const res = yield call(getEmerOrderList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 东莞保存应急报告
    * saveEmerReport({ payload, callback }, { call }) {
      const res = yield call(saveEmerReport, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 廊坊保存应急报告
    * addEmerReport({ payload, callback }, { call }) {
      const res = yield call(addEmerReport, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 百度坐标转本地坐标
    * coorsBdToLocal({ payload, callback }, { call }) {
      const res = yield call(coorsBdToLocal, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 本地坐标转百度坐标
    * coorsLocalToBd({ payload, callback }, { call }) {
      const res = yield call(coorsLocalToBd, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 获取线
    * getLine({ payload, callback }, { call }) {
      const res = yield call(getLine, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 爆管分析
    * squibAnalysis({ payload, callback }, { call }) {
      const res = yield call(squibAnalysis, payload);
      // if (!res.success) {
      //   message.error(res.msg);
      //   return;
      // }
      callback && callback(res);
    },
    // 地点检索
    * searchByLocation({ payload, callback }, { call }) {
      const res = yield call(searchByLocation, payload);
      // if (!res.success) {
      //   message.error(res.msg);
      //   return;
      // }
      callback && callback(res);
    },
    // 获取爆管数据
    * getController({ payload, callback }, { put, call }) {
      yield put({
        type: 'changeBtLoading',
        payload: true,
      });
      const res = yield call(getController, payload);
      yield put({
        type: 'changeBtLoading',
        payload: false,
      });
      if (!res.success || !res.data) {
        // message.error(res.msg);
        message.warning('控制方案暂无数据，请先进行爆管分析');
        return;
      }
      callback && callback(res);
    },
    * getEmerDrillCase({ payload, callback }, { call }) {
      const res = yield call(getEmerDrillCase, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 获取监测点数据
    * getDetectionMessage({ payload, callback }, { call }) {
      const res = yield call(getDetectionMessage, payload);
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
    // 恢复供气提醒通知
    * sendRecoverGasSupplyNotice({ payload, callback }, { call }) {
      const res = yield call(sendRecoverGasSupplyNotice, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 停气通知状态更新
    * sendStopGasNotice({ payload, callback }, { call }) {
      const res = yield call(sendStopGasNotice, payload);
      // if (!res.success) {
      //   message.error(res.msg);
      //   return;
      // }
      callback && callback(res);
    },
    * getWeatherInfo({ payload, callback }, { call }) {
      const res = yield call(getWeatherInfo, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 自动获取IP定位城市
    * getLocationByIp({ payload, callback }, { call }) {
      const res = yield call(getLocationByIp, payload);
      // if (!res.success) {
      //   message.error(res.msg);
      //   return;
      // }
      callback && callback(res);
    },
    * getEmerControlArea({ payload, callback }, { call }) {
      const res = yield call(getEmerControlArea, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    * resetData({ callback, payload }, { call }) {
      const res = yield call(resetData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 获取险情分类数据；
    * getDangerType({ payload, callback }, { call }) {
      const res = yield call(getDangerType, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
  },
  reducers: {
    btLoadingChange(state, action) {
      return {
        ...state,
        btLoading: action.payload,
      };
    },
  },
};
