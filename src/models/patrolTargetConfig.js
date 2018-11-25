import { notification } from 'antd';
import {
  fetchPatrolTargetConfigList,
  fetchTypeOptions,
  fetchFeedbackTableList,
  editPatrolTargetConfig,
  addPatrolTargetConfig,
  deletePatrolTargetConfig,
  fetchFilterOptions,
} from '../services/patrolTargetConfig';

export default {
  namespace: 'PatrolTargetConfig',
  state: {
    visible: false, // 反馈弹框
    confingList: [], // 列表data
    configDetial: {
      name: undefined,
      layername: undefined,
      isfeedback: undefined,
      type: undefined,
    }, // 配置详情
    typeOptions: [], // 类型options
    layerNameOptions: [], // 图层名称option
    filterOptions: [], // 筛选条件下拉值
    filterDataSource: [], // 晒选条件列表
    feedbackList: [], // 反馈项列表
    feedbackDetial: {
      findex: '',
      name: '',
      defaultvalue: '',
      visible: 1,
      edit: 1,
      info: '',
      alias: undefined,
      type: undefined,
      required: undefined,
    }, // 反馈项详情
  },
  reducers: {
    showModal(state, { payload: visible }) {
      return {
        ...state,
        visible,
      };
    },
    setConfigDetial(state, {payload}) {
      return {
        ...state,
        configDetial: payload,
      };
    },
    configValuesChange(state, { payload }) {
      return {
        ...state, configDetial: { ...state.configDetial, ...payload },
      };
    },
    feedbackValuesChange(state, { payload }) {
      return {
        ...state, feedbackDetial: { ...state.feedbackDetial, ...payload },
      };
    },
    setListData(state, {payload}) {
      return {
        ...state,
        confingList: payload,
      };
    },
    setFeedbackData(state, {payload}) {
      return {
        ...state,
        feedbackList: payload.map((item, i) => ({...item, findex: (i + 1)})),
      };
    },
    setFeedbackDetial(state, {payload}) {
      return {
        ...state,
        feedbackDetial: payload,
      };
    },
    setTypeOptionData(state, {payload}) {
      return {
        ...state,
        typeOptions: payload,
      };
    },
    setLayerNameData(state, {payload}) {
      return {
        ...state,
        layerNameOptions: payload,
      };
    },
    setFilterData(state, {payload}) {
      return {
        ...state,
        filterDataSource: payload.map((item, i) => ({...item, index: i})),
      };
    },
    setFilterOptions(state, {payload}) {
      return {
        ...state,
        filterOptions: payload,
      };
    },
  },
  effects: {
    *fetchListData({payload}, {call, put}) {
      const response = yield call(fetchPatrolTargetConfigList, payload);
      if (response.success) {
        yield put({type: 'setListData', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchTypeOptionData({payload}, {call, put}) {
      const response = yield call(fetchTypeOptions, payload);
      if (response.success) {
        yield put({type: 'setTypeOptionData', payload: response.data});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchLayerNameData({payload}, {call, put}) {
      const response = yield call(fetchFilterOptions, payload);
      if (response.metainfo && response.metainfo.length > 1) {
        yield put({type: 'setLayerNameData', payload: response.metainfo[1].net});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *fetchFeedbackTableData({payload}, {call, put}) {
      const response = yield call(fetchFeedbackTableList, payload);
      if (response.success) {
        yield put({type: 'setFeedbackData', payload: response.data.feedbackForm ? response.data.feedbackForm[0].items : []});
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *editPatrolTargetConfigData({payload, callback}, {call, put}) {
      const response = yield call(editPatrolTargetConfig, payload);
      if (response.success) {
        notification.success({ message: '提交成功', duration: 3});
        callback();
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *addPatrolTargetConfigData({payload, callback}, {call, put}) {
      const response = yield call(addPatrolTargetConfig, payload);
      if (response.success) {
        notification.success({ message: '提交成功', duration: 3});
        callback();
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    *deletePatrolTargetConfig({payload, callback}, {call, put}) {
      const response = yield call(deletePatrolTargetConfig, payload);
      if (response.success) {
        notification.success({ message: '删除成功', duration: 3});
        callback();
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
  },
};
