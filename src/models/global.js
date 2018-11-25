import { queryNotices,getAreaOrgTree,getGroupsTree } from '../services/api';

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    fetchingNotices: false,
    spinArray: [],
    spin:false,
    companyData:[]
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      yield put({
        type: 'changeNoticeLoading',
        payload: true,
      });
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });

      yield put({
        type: 'saveClearedNotices',
        payload,
      });
    },
    *queryCompany({payload},{put,call}){
      const res = yield call(getAreaOrgTree,payload);
      yield put({
        type:'changeCompanyData',
        payload:res.items||[]
      })
    }
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
        fetchingNotices: false,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    changeNoticeLoading(state, { payload }) {
      return {
        ...state,
        fetchingNotices: payload,
      };
    },
    changeSpin(state, {payload}) {
      const newSpinArray = state.spinArray;
      let showSpin = payload.showSpin;
      if (payload.showSpin) {
        newSpinArray.push(payload.spinIndex);
      } else {
        newSpinArray.forEach((item, index) => {
          if (item === payload.spinIndex) {
            newSpinArray.splice(index, 1);
          }
        });
        if (newSpinArray.length > 0) {
          showSpin = true;
        }
      }
      return {...state, spin: showSpin, spinArray: newSpinArray};
    },
    changeCompanyData(state, {payload}) {
      return {
        ...state,
        companyData: payload,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
