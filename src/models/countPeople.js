import { message } from 'antd';
import { tableQuery, tableQueryLogin } from '../services/countPeople';

export default {
  namespace: 'countPeople',
  state: {
    // 右侧数据
    total: 0,
    data: [],
    columns: [{
      title: '企业',
      dataIndex: 'enterprise',
      key: 'enterprise',
      align: 'center',
      width: '50%',
    }, {
      title: '在线人数',
      dataIndex: 'peoNum',
      key: 'peoNum',
      sorter: (a, b) => a.peoNum - b.peoNum,
      align: 'center',
      width: '50%',
    }],
    // 左侧数据
    totalLogin: 0,
    totalUserLogin: 0,
    dataLogin: [],
    columnsLogin: [{
      title: '企业',
      dataIndex: 'enterprise',
      key: 'enterprise',
      align: 'center',
      width: '33%',
    }, {
      title: '登录人次',
      dataIndex: 'num',
      key: 'num',
      sorter: (a, b) => a.num - b.num,
      align: 'center',
      width: '33%',
    }, {
      title: '用户数',
      dataIndex: 'peoNum',
      key: 'peoNum',
      sorter: (a, b) => a.peoNum - b.peoNum,
      align: 'center',
      width: '33%',
    }],
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
      const arr = [];
      let total = 0;
      if (res.success) {
        for (const elem of res.data.values()) {
          arr.push({
            enterprise: elem.ename,
            peoNum: elem.count,
          });
          total += Number(elem.count);
        }
        yield put({
          type: 'loadData',
          payload: {
            data: arr,
            total,
          },
        });
      } else {
        message.warning(`查询失败：${res.msg}`);
      }
    },
    *tableQueryLogin({ payload }, { call, put }) {
      const res = yield call(tableQueryLogin, payload);
      const arr = [];
      const obj = {};
      if (res.success) {
        for (const e of res.ecodeArr.values()) {
          obj[e.ecode] = e.qymc;
        }
        for (const elem of res.data.values()) {
          arr.push({
            enterprise: obj[elem.ecode] || '',
            num: elem.c1,
            peoNum: elem.c2,
          });
        }
        yield put({
          type: 'loadData',
          payload: {
            dataLogin: arr,
            totalLogin: res.count[0].count,
            totalUserLogin: res.userCount,
          },
        });
      } else {
        message.warning(`查询失败：${res.msg}`);
      }
    },
  },
};
