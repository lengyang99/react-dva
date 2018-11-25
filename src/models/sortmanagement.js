import { queryEnumTypeSelectData,
  editProperty, deleteProperty, queryProperty,
  queryEquipment,
  editEnum, deleteEnum, queryEnum } from '../services/sortmanagement';

const initState = {
  loginEcode: '1', // 登录用户的所属组织
  visible: false, //  是否显示编辑属性界面
  enumListVisible: false, //  是否显示枚举值列表界面
  enumEditVisible: false, //  是否显示枚举值编辑界面
  classification: { // 选中左侧树节点
    gid: '',
    parentId: '',
    clsCode: '',
    description: '',
  },
  classspecGid: '', // 选中的属性ID
  enumTypeSelectData: [], // 编辑属性界面中枚举下拉组件的数据源
  property: {
    gid: '',
    description: '',
    measureunit: '',
    enumType: '',
    isRequired: '',
    isParent: '',
    dfltVal: '',
    ecode: '',
  },
  propertyPageList: {
    pageNum: 1,
    pageSize: 10,
    total: 0,
    list: [],
  },
  equipmentPageList: {
    pageNum: 1,
    pageSize: 10,
    total: 0,
    list: [],
  },
  enumObj: {
    gid: '',
    classspecGid: '',
    enumVal: '',
    description: '',
    isUsed: '',
  },
  enumList: [],
};

export default {
  namespace: 'sortmanagement',
  state: {
    ...initState,
  },
  reducers: {
    toggleModal(state, { payload: visible }) {
      return {
        ...state,
        visible,
      };
    },
    toggleEnumListModal(state, { payload: enumListVisible }) {
      return {
        ...state,
        enumListVisible,
      };
    },
    toggleEnumEditModal(state, { payload: enumEditVisible }) {
      return {
        ...state,
        enumEditVisible,
      };
    },
    setClassification(state, { payload: classification }) {
      return {
        ...state,
        classification,
      };
    },
    setClassspecGid(state, { payload: classspecGid }) {
      return {
        ...state,
        classspecGid,
      };
    },
    setEnumTypeSelectData(state, { payload: enumTypeSelectData }) {
      return {
        ...state,
        enumTypeSelectData,
      };
    },
    setProperty(state, { payload: property }) {
      return {
        ...state,
        property,
      };
    },
    setPropertyPageList(state, { payload: propertyPageList }) {
      return {
        ...state,
        propertyPageList,
      };
    },
    setEquipmentPageList(state, { payload: equipmentPageList }) {
      return {
        ...state,
        equipmentPageList,
      };
    },
    setEnum(state, { payload: enumObj }) {
      return {
        ...state,
        enumObj,
      };
    },
    setEnumList(state, { payload: enumList }) {
      return {
        ...state,
        enumList,
      };
    },
  },
  effects: {
    *queryEnumTypeSelectData({ payload: params, callback }, { put, call }) {
      const enumTypeSelectData = yield call(queryEnumTypeSelectData, params);
      if (enumTypeSelectData && enumTypeSelectData.success) {
        const enumTypeSelectData2 = [];
        enumTypeSelectData.data.map(ele => enumTypeSelectData2.push({ value: ele.value, name: ele.text }));
        yield put({ type: 'setEnumTypeSelectData', payload: enumTypeSelectData2 });
        callback && callback();
      }
    },
    *editProperty({ payload: params }, { call, put }) {
      yield call(editProperty, params.property);
      yield put({ type: 'queryProperty', payload: params.classification });
    },
    *deleteProperty({ payload: params }, { call, put }) {
      yield call(deleteProperty, Number.parseInt(params.gid, 0));
      yield put({ type: 'queryProperty', payload: params.classification });
    },
    *queryProperty({ payload: params }, { put, call }) {
      const propertyPageList = yield call(queryProperty, params);
      if (propertyPageList.success) {
        yield put({ type: 'setPropertyPageList', payload: propertyPageList.data });
      }
    },
    *queryEquipment({ payload: params }, { put, call }) {
      const equipmentPageList = yield call(queryEquipment, params);
      if (equipmentPageList.success) {
        yield put({ type: 'setEquipmentPageList', payload: equipmentPageList.data.pageInfo });
      }
    },
    *editEnum({ payload: params }, { call, put }) {
      yield call(editEnum, params);
      yield put({ type: 'queryEnum', payload: params.classspecGid });
    },
    *deleteEnum({ payload: params }, { call, put }) {
      yield call(deleteEnum, Number.parseInt(params.gid, 0));
      yield put({ type: 'queryEnum', payload: params.classspecGid });
    },
    *queryEnum({ payload: classspecGid }, { put, call }) {
      const enumList = yield call(queryEnum, Number.parseInt(classspecGid, 0));
      if (enumList.success) {
        yield put({ type: 'setEnumList', payload: enumList.data });
      }
    },
  },
};
