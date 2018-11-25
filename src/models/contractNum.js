import { message } from 'antd';
import {
  getledgerDataList,
  queryForm,
} from '../services/ichAccount';

export default {
  namespace: 'contractNum',
  state: {
    pageno: 1, // 页码
    loading: false,
    totalPage: 0,
    visible: false,
    param: '',
    data: [],
    selectedRowKeys: [], // 默认选中的项
    selectedRows: [], // 默认选中项 的 内容
    columns: [
      {
        title: '用户名称',
        dataIndex: 'customer_desc',
        key: 'customer_desc',
      },
      {
        title: '合同账户',
        dataIndex: 'contract_account',
        key: 'contract_account',
      },
      {
        title: '地址',
        dataIndex: 'contract_account_desc',
        key: 'contract_account_desc',
      },
      {
        title: '联系人',
        dataIndex: 'contactPeople',
        key: 'contactPeople',
      },
      {
        title: '联系电话',
        dataIndex: 'contactPhone',
        key: 'contactPhone',
      },
      {
        title: '系统联系电话',
        dataIndex: 'contact_num',
        key: 'contact_num',
      },
    ],
    fields: [
      { title: '客户号', key: 'customer_num' },
      { title: '销售订单号', key: 'order_set' },
      { title: '合同号', key: 'contract_account' },
      { title: '用户名称', key: 'alias' },
      { title: '用户类别', key: 'customer_type' },
      { title: '联系电话', key: 'contact_num' },
      { title: '联系地址', key: 'addr_contract' },
      { title: '联系人', key: 'contact_people' },
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
        param: payload.param,
      };
    },
  },
  effects: {
    *tableQuery({ payload }, { call, put }) {
      const response = yield call(getledgerDataList, payload);
      if (response.success) {
        yield put({ type: 'getTableData', payload: { ...response, param: payload.param, pageno: payload.pageno } });
      } else {
        yield put({ type: 'loadData', payload: { param: payload.param, pageno: payload.pageno, loading: false } });
        message.warning(response.msg);
      }
    },
    *queryForm({ payload, callback }, { call, put }) {
      const response = yield call(queryForm, payload);
      if (response.success) {
        callback(response);
      } else {
        message.warning(response.msg);
      }
    },
  },
};
