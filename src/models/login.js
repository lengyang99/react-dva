import { routerRedux } from 'dva/router';
import { fetchAccountLogin, fetchAccountLogout } from '../services/api';
const userStr = localStorage.getItem('user');
let user = {};
if (userStr && userStr.length > 0) {
  user = JSON.parse(userStr);
}

export default {
  namespace: 'login',

  state: {
    status: user.isSuccess ? 'ok' : 'error',
    type: user.type || 'account',
    user:{},
    menus:[],
    loginInfo: {},
    token:'',
    ...user,
  },

  effects: {
    *accountSubmit({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      let response = yield call(fetchAccountLogin, payload);

      if (response.isSuccess) {
        const {user:{ecode,company}} = response;
        response.user.originEcode = ecode;
        response.user.cCompany = company;
        response.user.loginInfo = payload;
      }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
      callback && callback(response)
    },
    *logout({ payload }, { call, put }) {
      try {
        let response = yield call(fetchAccountLogout, {ipaddr: '', trueName: payload.trueName, gid: payload.gid, sys: payload.loginInfo.sys});
      } catch (e) {
        console.log(e);
      }
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
      localStorage.removeItem('user');
      yield put(routerRedux.push('/user/login'));
    },
    *changeEcode({payload},{put}){
        yield put({
          type:'changeLoginStatus',
          payload
        });
        window.location.reload();
    }
  },

  reducers: {
    changeLoginStatus(state, { payload }) {

      localStorage.setItem('user', JSON.stringify(payload));
      return {
        ...state,
        status: payload.isSuccess ? 'ok' : 'error',
        type: payload.type || 'account',
        ...payload,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
  },
};
