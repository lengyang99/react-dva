import { message } from 'antd';
import {
  queryMaterialInfo,
} from '../services/device';

export default {
  namespace: 'purNumModal',
  state: {
    pageno: 1, // 页码
    loading: false,
    totalPage: 0,
    visible: false,
    wlcode: '',
    data: [],
    selectedRowKeys: [], // 默认选中的项
    selectedRows: [], // 默认选中项 的 内容
    columns: [
      {
        title: '物料编号',
        dataIndex: 'code',
        key: 'code',
        width: '20%',
      },
      {
        title: '物料类别',
        dataIndex: 'groupdes',
        key: 'groupdes',
        width: '20%',
      },
      {
        title: '物料名称',
        dataIndex: 'des',
        key: 'des',
        width: '60%',
      },
    ],
  },
  reducers: {
    loadData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    getTableData(state, { payload }) {
      return {
        ...state,
        data: payload.data,
        loading: false,
        totalPage: payload.total, // 清空勾选项
        pageno: payload.pageno,
        wlcode: payload.wlcode,
      };
    },
  },
  effects: {
    *tableQuery({ payload }, { call, put }) {
      const response = yield call(queryMaterialInfo, payload);
      if (response.success) {
        yield put(
          {
            type: 'getTableData',
            payload: { ...response, wlcode: payload.wlcode, pageno: payload.pageno },
          });
      } else {
        yield put({ type: 'loadData', payload: { wlcode: payload.wlcode, pageno: payload.pageno, loading: false } });
        message.warning(response.msg);
      }
    },
  },
};
