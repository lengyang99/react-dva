import { message} from 'antd';
import {
  queryOdorList,
  queryOdorDetail,
  queryStationList,
  queryOdorMacList,
  queryOperType,
  getFormData,
  newEarlyWarning,
  queryEarlyWarningList,
  queryAverageList,
  newAverage,
  queryOdorMintainList,
  queryMintainList,
  newMintain,
  queryOdorEarlyWarningList,
  queryOdorAverageList,
  queryIsOdorEarlyWarningData,
  queryCheckAreaData,
  queryOdorIndex,
  startOrdo,
  stopOrdo,
  ordoStatus,
} from "../services/odorization";

export default {
  namespace: "odorization",
  state: {
    dataList: [], // 加臭記錄列表
    detailData: [], // 加臭記錄詳情
    stationData: [], // 站點列表
    odorMacData: [], // 加臭機
    operType: {}, // 操作方式
    formData: {}, // 表单数据
    total: "", // 总数
    earlyWarningList: [], // 预警列表
    earlyWarningTotal: 0,
    odorList: "",
    averageList: [], //平均值
    averageTotal: 0,
    averageOdor: "",
    mintainList: [], //管路维护
    mintainTotal: 0,
    mintainOdor: "",
    odorIndex: [] //首页数据
  },
  effects: {
    // 查询加臭记录
    *queryOdorList({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "odorDataSave",
        payload: res.data,
        total: res.total
      });
      callback && callback(res);
    },
    // 查看加臭记录详情
    *queryOdorDetail({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorDetail, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "odorDetailSave",
        payload: res.data
      });
      callback && callback(res);
    },
    // 站点
    *getStationData(_, { call, put }) {
      const res = yield call(queryStationList);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "stationDataSave",
        payload: res.data
      });
    },
    // 加臭机器
    *queryOdorMacList({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorMacList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "odorMacDataSave",
        payload: res.data
      });
      callback && callback(res.data);
    },
    // 操作方式
    *queryOperType(_, { call, put }) {
      const res = yield call(queryOperType);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "operTypeSave",
        payload: res.data
      });
    },
    // 获取表单参数
    *getFormData({ payload, callback }, { call, put }) {
      const res = yield call(getFormData, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "formDataSave",
        payload: res.data
      });
      callback && callback(res.data);
    },
    //查询预警加臭机
    *queryOdorEarlyWarningList({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorEarlyWarningList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "odorList",
        payload: res.data
      });
      callback && callback(res);
    },
    //查询液位预警列表
    *queryEarlyWarningList({ payload, callback }, { call, put }) {
      const res = yield call(queryEarlyWarningList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "earlyWarningList",
        payload: res.data,
        total: res.total
      });
      callback && callback(res);
    },
    //新建液位预警
    *newEarlyWarning({ payload, callback }, { call, put }) {
      const res = yield call(newEarlyWarning, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.success) {
        message.success("创建成功！");
      }
      callback && callback(res);
    },
    //查询平均值加臭机
    *queryOdorAverageList({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorAverageList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "averageOdor",
        payload: res.data
      });
      callback && callback(res);
    },
    //查询平均值列表
    *queryAverageList({ payload, callback }, { call, put }) {
      const res = yield call(queryAverageList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "averageList",
        payload: res.data,
        total: res.total
      });
      callback && callback(res);
    },
    //新建平均值
    *newAverage({ payload, callback }, { call, put }) {
      const res = yield call(newAverage, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.success) {
        message.success("创建成功！");
      }
      callback && callback(res);
    },
    //查询管路维护加臭机
    *queryOdorMintainList({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorMintainList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "mintainOdor",
        payload: res.data
      });
      callback && callback(res);
    },
    //查询管路维护列表
    *queryMintainList({ payload, callback }, { call, put }) {
      const res = yield call(queryMintainList, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: "mintainList",
        payload: res.data,
        total: res.total
      });
      callback && callback(res);
    },
    //新建管路维护
    *newMintain({ payload, callback }, { call, put }) {
      const res = yield call(newMintain, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.success) {
        message.success("创建成功！");
      }
      callback && callback(res.data);
    },
    //查询该加臭机下是否已有记录
    *queryIsOdorEarlyWarningData({ payload, callback }, { call, put }) {
      const res = yield call(queryIsOdorEarlyWarningData, payload);
      callback && callback(res);
    },
    //管路维护的验证
    *queryCheckAreaData({ payload, callback }, { call, put }) {
      const res = yield call(queryCheckAreaData, payload);
      callback && callback(res);
    },
    //首页数据；
    *queryOdorIndex({ payload, callback }, { call, put }) {
      const res = yield call(queryOdorIndex, payload);
      yield put({
        type: "odorIndex",
        payload: res.data
      });
      callback && callback(res.data);
    },
    //加臭机启用；
    *startOrdo({ payload, callback }, { call, put }) {
      const res = yield call(startOrdo, payload);
      callback && callback(res);
    },
    //加臭机停用；
    *stopOrdo({ payload, callback }, { call, put }) {
      const res = yield call(stopOrdo, payload);
      callback && callback(res);
    },
     //加臭机启停（新）；
     *ordoStatus({ payload, callback }, { call, put }) {
      const res = yield call(ordoStatus, payload);
      callback && callback(res);
    }
  },

  reducers: {
    odorDataSave(state, action) {
      return {
        ...state,
        dataList: action.payload,
        total: action.total
      };
    },
    odorDetailSave(state, action) {
      return {
        ...state,
        detailData: action.payload
      };
    },
    stationDataSave(state, action) {
      return {
        ...state,
        stationData: action.payload
      };
    },
    odorMacDataSave(state, action) {
      return {
        ...state,
        odorMacData: action.payload
      };
    },
    operTypeSave(state, action) {
      return {
        ...state,
        operType: action.payload
      };
    },
    formDataSave(state, action) {
      return {
        ...state,
        formData: action.payload
      };
    },
    earlyWarningList(state, action) {
      return {
        ...state,
        earlyWarningList: action.payload,
        earlyWarningTotal: action.total
      };
    },
    averageList(state, action) {
      return {
        ...state,
        averageList: action.payload,
        averageTotal: action.total
      };
    },
    mintainList(state, action) {
      return {
        ...state,
        mintainList: action.payload,
        mintainTotal: action.total
      };
    },
    odorList(state, action) {
      return { ...state, odorList: action.payload };
    },
    averageOdor(state, action) {
      return { ...state, averageOdor: action.payload };
    },
    mintainOdor(state, action) {
      return { ...state, mintainOdor: action.payload };
    },
    odorIndex(state, action) {
      return {
        ...state,
        odorIndex: action.payload
      };
    }
  }
};

