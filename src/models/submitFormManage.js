/**
 * Created by hexi on 2017/11/21.
 */
import { message } from 'antd';
import { getFormData, reportFormEvent, submitAttInfo, getWoFormData, reportTaskFormEvent, submitWoPlanForm, getUserName, dangerWork } from '../services/submitFormManage';

export default {
  namespace: 'submitFormManage',

  state: {
    formData: {
      tableName: '',
      params: [{
        items: [],
      }],
    },
  },

  effects: {
    *getFormData({params, callback}, { call, put, select }) {
      const res = yield call(getFormData, params);
      if (res && res.error) {
        message.error(res.msg);
        return;
      }
      // 当当前表单是第三方施工或者管网保压时处理班组默认设置当前班组
      const loginInfo = yield select(state => state.login);
      // if (res.params[0].groupid === '10040001' || res.params[0].groupid === '10040002') {
      let items = [];
      if (res.formType === 'wo') {
        items = res.params;
      } else {
        items = res.params[0].items;
      }

      for (let i = 0; i < items.length; i++) {
        if (items[i].name === 'loc_code') {
          if (items[i].selectValues && items[i].selectValues.length > 0) {
            items[i].selectValues.forEach((item, index) => {
              if (item.name === loginInfo.user.locCode) {
                items[i].value = loginInfo.user.locCode;
              }
            });
          }
        }
      }
      // }
      callback(res);

      yield put({
        type: 'saveFormData',
        payload: {
          formData: res,
        },
      });
    },
    *getWoFormData({params, callback}, { call, put }) {
      const res = yield call(getWoFormData, params);

      callback(res);

      yield put({
        type: 'saveFormData',
        payload: {
          formData: {
            cascade: res.cascade,
            resetForm: res.resetForm,
            params: [{
              items: res.params,
            }],
          },
        },
      });
    },
    *reportFormEvent({params, callback}, { call, put }) {
      const res = yield call(reportFormEvent, params);
      callback(res);
    },
    *reportTaskFormEvent({params, callback}, { call, put }) {
      const res = yield call(reportTaskFormEvent, params);
      callback(res);
    },
    *submitWoPlanForm({params, callback}, { call, put }) {
      const res = yield call(submitWoPlanForm, params);
      callback(res);
    },
    *submitAttach({formData, attInfo, userInfo, callback}, { call, put } ) {
      let flag = true;
      let res = {};
      let tabletype = attInfo.tableName !== 'wo_activiti_work' ? (attInfo.tableType === undefined ? '0' : attInfo.tableType) : '1';
      for (let i = 0; i < formData.length; i++) {
        let columns = 'businesskey,name,text';
        if (tabletype != 0) {
          columns = formData[i].name;
        }
        if(attInfo){
          formData[i].value.append('tablename', attInfo.tablename ? attInfo.tablename : attInfo.tableName);
          formData[i].value.append('gid', attInfo.gid);
        }
        formData[i].value.append('userid', userInfo.gid);
        formData[i].value.append('username', userInfo.trueName);
        formData[i].value.append('tabletype', tabletype);
        formData[i].value.append('field', formData[i].name);
        formData[i].value.append('columns', columns);
        res = yield call(submitAttInfo, formData[i].value);
        if (!res.success) {
          message.error(res.msg);
          flag = false;
        }
      }
      callback(flag, res.data);
    },
    *dangerWork({params, formData, userInfo, callback}, { call, put }) {
      let flag = true;
      let res = {};
      let tabletype = '1';
      for (let i = 0; i < formData.length; i++) {
        let columns = 'businesskey,name,text';
        if (tabletype != 0) {
          columns = formData[i].name;
        }
        formData[i].value.append('userid', userInfo.gid);
        formData[i].value.append('username', userInfo.trueName);
        formData[i].value.append('tabletype', tabletype);
        formData[i].value.append('field', formData[i].name);
        formData[i].value.append('columns', columns);
        formData[i].value.append('json', params);
        let filesUid = [];
        let files = formData[i].value.getAll('files[]');
        for (let j = 0; j < files.length; j++) {
          let fileObj = files[j];
          if (typeof files[j] === 'string') {
            try {
              fileObj = JSON.parse(fileObj);
            } catch (e) {
              console.error(e);
            }
          }
          if (fileObj.gid) {
            filesUid.push(fileObj.gid);
          }
        }
        formData[i].value.append('filesUid', filesUid.join(','));
        res = yield call(dangerWork, formData[i].value);
        if (!res.success) {
          // message.error(res.msg);
          flag = false;
        }
      }
      callback && callback(flag, res);
    },
    *getUserName({params, callback}, { call, put }) {
      const res = yield call(getUserName, params);
      callback(res);
    },
    *dangerFile({params, callback}, { call, put }) {
      const res = yield call(submitAttInfo, params);
      // callback(res);
    },
  },
  reducers: {
    saveFormData(state, action) {
      const formData = action.payload;
      return {
        ...state,
        ...formData,
      };
    },
  },
};
