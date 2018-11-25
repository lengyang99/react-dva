import { notification } from 'antd';
import {
  fetchMalList,
  deleteMalfunction,
  postMalfunction,
  updateMalfunction,
  updateMalfunctionActive,
} from '../services/malfunction';

// malfunctionForm 表单四级联动过滤数据
const filterData = (list, option) => {
  let result = [];
  list.forEach(ele => {
    if (parseInt(ele.id, 10) === parseInt(option, 10) && Array.isArray(ele.children)) {
      result = ele.children;
    }
  });
  return result;
};

const initState = {
  visible: false,
  list: [],
  modalOption: {
    modalType: null,
    isEdit: false,
    editName: '',
    quoteCount: '',
    organization: '',
    classify: {
      name: '',
      id: '',
      parentId: '',
      code: '',
      isNew: true,
      active: false,
    },
    malfunction: {
      name: '',
      id: '',
      parentId: '',
      code: '',
      isNew: true,
      active: false,
    },
    reason: {
      name: '',
      id: '',
      parentId: '',
      code: '',
      isNew: true,
      active: false,
    },
    solution: {
      name: '',
      id: '',
      parentId: '',
      code: '',
      isNew: true,
      active: false,
    },
    solutionR: {
      name: '',
      id: '',
      parentId: '',
      code: '',
    },
    isActive: '1',
  },
  modalEditOptionId: '',
  formValidateFiled: {
    classify: {
      nameError: false,
      nameErrorMessage: '',
      codeError: false,
      codeErrorMessage: '',
    },
    malfunction: {
      nameError: false,
      nameErrorMessage: '',
      codeError: false,
      codeErrorMessage: '',
    },
    reason: {
      nameError: false,
      nameErrorMessage: '',
      codeError: false,
      codeErrorMessage: '',
    },
    solutionR: {
      nameError: false,
      nameErrorMessage: '',
      codeError: false,
      codeErrorMessage: '',
    },
  },
  formList: {
    malfunctionList: [],
    reasonList: [],
    solutionList: [],
  },
};

export default {
  namespace: 'malfunction',
  state: {
    ...initState,
  },
  reducers: {
    // 故障 modal 是否显示
    toggleModal(state, { payload: visible }) {
      // 如果关闭 modal,初始化 form 表单验证
      if (visible) {
        return {
          ...state,
          visible,
        };
      } else {
        return {
          ...state,
          visible,
          formValidateFiled: initState.formValidateFiled,
        };
      }
    },
    // 设置故障列表
    setList(state, { payload: list }) {
      return {
        ...state,
        list,
      };
    },
    // 设置故障四级联动列表
    setFormList(state, { payload: formList }) {
      return {
        ...state,
        formList,
      };
    },
    // 设置故障弹窗表单验证信息
    setFormValidMessage(state, { payload: formValidateFiled }) {
      return {
        ...state,
        formValidateFiled,
      };
    },
    // 初始化故障实际联动列表
    initFormList(state) {
      const malfunctionList = filterData(state.list, state.modalOption.classify.id);
      const reasonList = filterData(malfunctionList, state.modalOption.malfunction.id);
      const solutionList = filterData(reasonList, state.modalOption.reason.id);
      return {
        ...state,
        formList: {
          malfunctionList,
          reasonList,
          solutionList,
        },
      };
    },
    // 初始化表单验证
    initFormValidateFiled(state) {
      return {
        ...state,
        formValidateFiled: initState.formValidateFiled,
      };
    },
    // 设置弹窗的数据
    setModalOption(state, { payload: modalOption }) {
      return {
        ...state,
        modalOption,
      };
    },
    // 设置编辑故障的 ID
    setModalEditOption(state, { payload: modalEditOptionId }) {
      return {
        ...state,
        modalEditOptionId,
      };
    },
    // 初始化故障弹窗数据
    initModalOption(state, { payload: organization }) {
      return {
        ...state,
        modalOption: {
          ...initState.modalOption,
          organization,
        },
        formList: initState.formList,
      };
    },
  },

  effects: {
    // 获取故障列表
    *fetchMalList({ payload: options }, { put, call }) {
      const response = yield call(fetchMalList, options);
      if (response.success) {
        yield put({ type: 'setList', payload: response.data });
      }
    },
    // 添加 or 修改故障
    *postMalfunction({ payload: options }, { put, call }) {
      const response = yield call(postMalfunction, options);
      if (response.success) {
        notification.success({ message: '新增成功', duration: 3 });
        yield put({ type: 'fetchMalList' });
        yield put({ type: 'toggleModal', payload: false });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 更新故障
    *updateMalfunction({ payload: options }, { put, call }) {
      const response = yield call(updateMalfunction, options);
      if (response.success) {
        notification.success({ message: '修改成功', duration: 3 });
        yield put({ type: 'fetchMalList' });
        yield put({ type: 'toggleModal', payload: false });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 更新故障是否激活
    *updateMalfunctionActive({ payload: id }, { put, call }) {
      const response = yield call(updateMalfunctionActive, id);
      if (response.success) {
        notification.success({ message: '修改状态成功', duration: 3 });
        yield put({ type: 'fetchMalList' });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 删除故障
    *deleteMalfunction({ payload: options }, { put, call }) {
      const response = yield call(deleteMalfunction, options);
      if (response.success) {
        notification.success({ message: '删除成功', duration: 3 });
        yield put({ type: 'fetchMalList' });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
  },
};
