import { message } from 'antd';
import {
  queryModuleList,
  queryParameterList,
  addParameter,
  deleteParameter,
  editParameter,
  // queryParameterListByGID,
} from '../services/globalParameter';

export default {
  namespace: 'globalParameter',
  state: {
    moduleSelectList: [],
    parameterList: [],
    selectedRows: [],
    modal: {
      modalVisible: false,
      modalType: 'add',
      modalForm: null,
    },
  },
  effects: {
    *queryModuleList({payload}, {call, put}) {
      const response = yield call(queryModuleList);
      if (response.success !== true) {
        message.error(response.msg);
        return;
      }
      yield put({type: 'setModuleList', payload: response.data});
    },
    *queryParameterList({payload}, {call, put}) {
      const response = yield call(queryParameterList, payload);
      if (response.success !== true) {
        message.error(response.msg);
        return;
      }
      yield put({type: 'setParameterList', payload: response.data});
    },
    // *queryParameterListByGID({payload}, {call, put}) {
    //   const response = yield call(queryParameterListByCondition, payload);
    //   yield put({type: 'setParameterList', payload: response});
    // },
    *addParameter({payload, callback}, {call, put}) {
      const response = yield call(addParameter, payload);
      if (response.success !== true) {
        message.error(response.msg);
        return;
      }
      callback && callback(response);
    },
    *editParameter({payload, callback}, {call, put}) {
      const response = yield call(editParameter, payload);
      if (response.success !== true) {
        message.error(response.msg);
        return;
      }
      callback && callback(response);
    },
    *deleteParameter({payload, callback}, {call, put}) {
      const response = yield call(deleteParameter, payload);
      if (response.success !== true) {
        message.error(response.msg);
        return;
      }
      callback && callback(response);
    },
    *getSelectedRows({payload: value}, {call, put}) {
      yield put({type: 'setSelectedRows', payload: value});
    },
    *makeModalShow({payload: value}, {call, put}) {
      console.log(value);
      yield put({type: 'showModal', payload: value });
    },
    *makeModalHide({payload}, {call, put}) {
      yield put({type: 'hideModal'});
    },
  },
  reducers: {
    setModuleList(state, action) {
      return {
        ...state,
        moduleSelectList: action.payload,
      };
    },
    setParameterList(state, action) {
      return {
        ...state,
        parameterList: action.payload,
      };
    },
    setSelectedRows(state, action) {
      return {
        ...state,
        selectedRows: action.payload,
      };
    },
    showModal(state, action) {
      return {
        ...state,
        modal: {
          ...action.payload,
          modalVisible: true,
        },
      };
    },
    hideModal(state) {
      return {
        ...state,
        modal: {
          modalVisible: false,
          modalType: 'add',
          modalForm: null,
        },
      };
    },
  },
};
