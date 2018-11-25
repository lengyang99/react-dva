import { message } from 'antd';
import { tableQuery } from '../services/loginLog';

export default {
  namespace: 'loginLog',
  state: {
    data: [],
    columns: [{
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
      width: '20%',
    }, {
      title: '时间',
      dataIndex: 'createtime',
      key: 'createtime',
      align: 'center',
      width: '20%',
    }, {
      title: '操作',
      dataIndex: 'oper',
      key: 'oper',
      align: 'center',
      width: '20%',
    }, {
      title: 'ip地址',
      dataIndex: 'ipaddr',
      key: 'ipaddr',
      align: 'center',
      width: '20%',
    }, {
      title: '系统',
      dataIndex: 'sys',
      key: 'sys',
      align: 'center',
      width: '20%',
    }],
    loading: false, // loading框
  },

  reducers: {
    loadData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },

  effects: {
    *tableQuery({ payload }, { call, put }) {
      const res = yield call(tableQuery, payload);
      if (res.success) {
        for (const elem of res.data.values()) {
          if (elem.oper === '1') {
            elem.oper = '登出';
          } else {
            elem.oper = '登录';
          }
        }
        yield put({
          type: 'loadData',
          payload: {
            data: res.data,
            loading: false,
          },
        });
      } else {
        message.warning(`查询失败：${res.msg}`);
        yield put({
          type: 'loadData',
          payload: {
            loading: false,
          },
        });
      }
    },
  },
};
