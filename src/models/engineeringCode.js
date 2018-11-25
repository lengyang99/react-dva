import { message } from 'antd';
import {
  queryData,
} from '../services/engineeringCode';

export default {
  namespace: 'engineeringCode',
  state: {
    pageno: 1, // 页码
    loading: false,
    totalPage: 0,
    visible: false,
    data: [],
    selectedRowKeys: [], // 默认选中的项
    selectedRows: [], // 默认选中项 的 内容
    columns: [
      {
        title: '工程编号',
        dataIndex: 'pro_code',
        key: 'pro_code',
      },
      {
        title: '工程名称',
        dataIndex: 'pro_name',
        key: 'pro_name',
      },
      {
        title: '工程地点',
        dataIndex: 'pro_address',
        key: 'pro_address',
      },
      // {
      //   title: '工程范围',
      //   dataIndex: 'pro_range',
      //   key: 'pro_range',
      // },
      // {
      //   title: '工程性质',
      //   dataIndex: 'pro_property',
      //   key: 'pro_property',
      // },
      {
        title: '施工单位',
        dataIndex: 'pro_builder',
        key: 'pro_builder',
      },
      {
        title: '施工队长',
        dataIndex: 'pro_captain',
        key: 'pro_captain',
      },
      // {
      //   title: '设计压力',
      //   dataIndex: 'pro_design_press',
      //   key: 'pro_design_press',
      // },
      // {
      //   title: '长度',
      //   dataIndex: 'pro_length',
      //   key: 'pro_length',
      // },
      // {
      //   title: '管道性质',
      //   dataIndex: 'pro_pipe_property',
      //   key: 'pro_pipe_property',
      // },
      {
        title: '现场管理员',
        dataIndex: 'pro_manager',
        key: 'pro_manager',
      },
      {
        title: '现场管理员电话',
        dataIndex: 'pro_manager_tel',
        key: 'pro_manager_tel',
      },
      // {
      //   title: '现场图片',
      //   dataIndex: 'pro_picture',
      //   key: 'pro_picture',
      // },
      // {
      //   title: '已建管道材质',
      //   dataIndex: 'pro_material',
      //   key: 'pro_material',
      // },
      // {
      //   title: '已建管道管径',
      //   dataIndex: 'pro_diameter',
      //   key: 'pro_diameter',
      // },
      // {
      //   title: '新建管道材质',
      //   dataIndex: 'pro_material_new',
      //   key: 'pro_material_new',
      // },
      // {
      //   title: '新建管道管径',
      //   dataIndex: 'pro_material_diameter',
      //   key: 'pro_material_diameter',
      // },
      // {
      //   title: '验收时间',
      //   dataIndex: 'pro_check_time',
      //   key: 'pro_check_time',
      // },
      // {
      //   title: '验收情况',
      //   dataIndex: 'pro_check_situation',
      //   key: 'pro_check_situation',
      // },
      // {
      //   title: '验收详情',
      //   dataIndex: 'pro_check_detail',
      //   key: 'pro_check_detail',
      // },
      // {
      //   title: '发起人',
      //   dataIndex: 'pro_itcode',
      //   key: 'pro_itcode',
      // },
    ],
    fields: [
      {
        title: '工程编号',
        key: 'pro_code',
      },
      {
        title: '工程名称',
        key: 'pro_name',
      },
      {
        title: '工程地点',
        key: 'pro_address',
      },
      {
        title: '工程范围',
        key: 'pro_range',
      },
      {
        title: '工程性质',
        key: 'pro_property',
      },
      {
        title: '施工单位',
        key: 'pro_builder',
      },
      {
        title: '施工队长',
        key: 'pro_captain',
      },
      {
        title: '设计压力',
        key: 'pro_design_press',
      },
      {
        title: '长度',
        key: 'pro_length',
      },
      {
        title: '管道性质',
        key: 'pro_pipe_property',
      },
      {
        title: '现场管理员',
        key: 'pro_manager',
      },
      {
        title: '现场管理员电话',
        key: 'pro_manager_tel',
      },
      {
        title: '现场图片',
        key: 'pro_picture',
      },
      {
        title: '已建管道材质',
        key: 'pro_material',
      },
      {
        title: '已建管道管径',
        key: 'pro_diameter',
      },
      {
        title: '新建管道材质',
        key: 'pro_material_new',
      },
      {
        title: '新建管道管径',
        key: 'pro_material_diameter',
      },
      {
        title: '验收时间',
        key: 'pro_check_time',
      },
      {
        title: '验收情况',
        key: 'pro_check_situation',
      },
      {
        title: '验收详情',
        key: 'pro_check_detail',
      },
      {
        title: '发起人',
        key: 'pro_itcode',
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
        data: payload.list,
        loading: false,
        totalPage: payload.total, // 清空勾选项
        pageno: payload.pageno,
      };
    },
  },
  effects: {
    *tableQuery({ payload }, { call, put }) {
      const response = yield call(queryData, payload);
      if (response.success) {
        yield put({ type: 'getTableData', payload: { ...response, pageno: payload.pageno } });
      } else {
        yield put({ type: 'loadData', payload: { pageno: payload.pageno, loading: false } });
        message.warning(response.msg);
      }
    },
  },
};
