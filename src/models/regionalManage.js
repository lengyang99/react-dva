/**
 * Created by hexi on 2017/11/21.
 */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import {
  getStationInfo, getAreaStationInfo, getAreaByStationid, deleteArea, getAllUserInfo, getAreaInfoByGid, updateArea, insertArea,
  getBustypeInfo, insertBustype, getStationByBustype, getAreaByBusType, getGroupsTreeByUserId, getUserByGroupId,
  getUsersByOrgCode, insertAreaForBusType, deleteAreaForBusType, queryStation, copeArea, areaIsExist,copyParentArea,
} from '../services/regionalManage';

export default {
  namespace: 'regionalManage',

  state: {
    //展示页面
    bustypeList: [{ gid: '', businessname: '巡检', code: '', ecode: '' }],
    stationList: [{ id: '', name: '全部' }],
    areaStationList: [{ id: '', name: '全部' }],
    stationListNoInspect: [{ id: '', name: '全部' }],
    areaTree: [{
      name: '区域列表',
      value: '0',
      key: 0,
      type: 0,
      attr: { stationid: '' },
      children: [],
    }],
    areaTreeNoInspect: [{
      name: '区域列表',
      value: '0',
      key: 0,
      type: 0,
      attr: { stationid: '' },
      children: [],
    }],
    //编辑
    personTree: [],
    editPageData: [],
    // 组织树
    groupsTree: [],
    // 根据组织编号查询组织人员
    userByGroupId: [],
    stationData: [],
  },

  effects: {
    *getStationInfo(action, { call, put }) {
      const stationInfo = yield call(getStationInfo);
      if (!stationInfo.success) {
        message.error(stationInfo.msg);
        return;
      }
      const stationList = stationInfo.data.map((item) => {
        return {
          id: `${item.stationCode}`,
          name: item.name,
          ecode: item.ecode,
          code: item.code,
          gid: item.gid,
        };
      });
      stationList.unshift({ id: '', name: '全部', ecode: '', code: '' });
      yield put({
        type: 'saveStationInfo',
        payload: stationList,
      });
    },
    *getAreaStationInfo(action, { call, put }) {
      const stationInfo = yield call(getAreaStationInfo);
      if (!stationInfo.success) {
        message.error(stationInfo.msg);
        return;
      }
      const stationList = stationInfo.data.map((item) => {
        return {
          id: item.stationid,
          name: item.name,
          gid: item.gid,
        };
      });
      stationList.unshift({ id: '', name: '全部', ecode: '', code: '' });
      yield put({
        type: 'saveAreaStationInfo',
        payload: stationList,
      });
    },
    *getAreaByStationid(action, { call, put }) {
      const areaInfo = yield call(getAreaByStationid, action.stationid, action.code);
      if (!areaInfo.success) {
        message.error(areaInfo.msg);
        return;
      }
      const treeData = [];
      action.callback(areaInfo.data, treeData);
      const tmpAreaTree = [{
        name: '区域列表',
        value: '0',
        key: 0,
        type: 0,
        attr: { stationid: '', station: '', username: '' },
        children: treeData,
      }];
      yield put({
        type: 'saveAreaInfo',
        payload: tmpAreaTree,
      });
    },
    *deleteArea(action, { call, put }) {
      const areaInfo = yield call(deleteArea, action.areaid);
      if (!areaInfo.success) {
        message.error(areaInfo.msg);
        return;
      }
      message.success('该节点删除成功！');
      action.callback();
    },
    *getAllUserInfo(action, { call, put }) {
      const res = yield call(getAllUserInfo, action.stationCode);
      const {callback, showUser} = action;
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const tmp = action.dealStationPerson(res.data);
      yield put({
        type: 'saveUserInfo',
        payload: tmp,
      });
      if(callback){
        action.callback();
      }
      if(showUser && tmp){
        action.showUser();
      }
    },
    *getAreaInfoByGid({ gid, callback }, { call, put }) {
      const res = yield call(getAreaInfoByGid, gid);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      if (res.data.length === 0) {
        message.error('未查询到相关数据');
        return;
      }
      callback(res);
      yield put({
        type: 'saveAreaInfoByGid',
        payload: {
          editPageData: res.data[0]
        },
      });
    },
    *updateArea({ params, callback }, { call, put }) {
      const res = yield call(updateArea, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.success('区域编辑成功！');
      callback();
    },
    *insertArea({ params, callback }, { call, put }) {
      const res = yield call(insertArea, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.success('区域添加成功！');
      callback();
    },
    *getBustypeInfo(action, { call, put }) {
      const res = yield call(getBustypeInfo);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const bustypeList = res.data.map((item) => {
        return {
          gid: item.gid,
          businessname: item.businessname,
          code: item.code,
          ecode: item.ecode,
        };
      });
      yield put({
        type: 'saveBustypeInfo',
        payload: bustypeList,
      });
    },
    *insertBustype({ payload, callback }, { call }) {
      const res = yield call(insertBustype, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.info('业务类型新增成功！');
      callback && callback();
    },
    *getStationByBustype(action, { call, put }) {
      const res = yield call(getStationByBustype, action.code);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const stationList = res.data.map((item) => {
        return { id: item.gid, name: item.name, stationid: item.stationid };
      });
      stationList.unshift({ id: '', name: '全部' });
      yield put({
        type: 'saveStationInfoNoInspect',
        payload: stationList,
      });
    },
    *getGroupsTreeByUserId(action, { call, put }) {
      const res = yield call(getGroupsTreeByUserId, action.userid);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const tmp = action.dealGroupsTreeInfo(res.items[0], []);
      yield put({
        type: 'saveGroupsTree',
        payload: tmp,
      });
    },
    *getUserByGroupId({ payload }, { call, put }) {
      const res = yield call(getUserByGroupId, payload);
      yield put({
        type: 'saveUserByGroupId',
        payload: res.root,
      });
    },
    *getAreaByBusType(action, { call, put }) {
      const res = yield call(getAreaByBusType, action.stationid, action.code);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      const treeData = [];
      action.callback(res.data, treeData);
      const tmpAreaTree = [{
        name: '区域列表',
        value: '0',
        key: 0,
        type: 0,
        attr: { stationid: '', station: '', username: '' },
        children: treeData,
      }];
      yield put({
        type: 'saveAreaInfoNoInspect',
        payload: tmpAreaTree,
      });
    },
    *getUsersByOrgCode(action, { call, put }) {
      const res = yield call(getUsersByOrgCode, action.orgcode);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      res.items.map((item) => {
        item.userid = item.gid;
      });
      yield put({
        type: 'saveUserByGroupId',
        payload: res.items,
      });
    },
    *insertAreaForBusType({ params, callback }, { call }) {
      const res = yield call(insertAreaForBusType, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      message.success('区域添加成功！');
      callback && callback();
    },
    *deleteAreaForBusType({ params, callback }, { call }) {
      const res = yield call(deleteAreaForBusType, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback();
    },
    *queryStation({ params, callback }, { call, put }) {
      const res = yield call(queryStation, params);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'stationData',
        payload: res.data,
      });
      callback && callback(res);
    },
    *copeArea({ payload, callback }, { call, put }) {
      const res = yield call(copeArea, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *areaIsExist({ payload, callback }, { call, put }) {
      const res = yield call(areaIsExist, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    *copyParentArea({ payload,callback }, { call, put}){
      const res = yield call(copyParentArea, payload);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    }
  },

  reducers: {
    saveStationInfo(state, action) {
      const stationInfo = action.payload;
      return {
        ...state,
        stationList: stationInfo,
      };
    },
    saveAreaStationInfo(state, action) {
      const stationInfo = action.payload;
      return {
        ...state,
        areaStationList: stationInfo,
      };
    },
    saveStationInfoNoInspect(state, action) {
      const stationInfoNoInspect = action.payload;
      return {
        ...state,
        stationListNoInspect: stationInfoNoInspect,
      };
    },
    saveAreaInfo(state, action) {
      const areaInfo = action.payload;
      return {
        ...state,
        areaTree: areaInfo,
      };
    },
    saveUserInfo(state, action) {
      const areaInfo = action.payload;
      return {
        ...state,
        personTree: areaInfo,
      };
    },
    saveAreaInfoByGid(state, action) {
      const editPageData = action.payload;
      return {
        ...state,
        editPageData: editPageData,
      };
    },
    saveBustypeInfo(state, action) {
      const bustypeInfo = action.payload;
      return {
        ...state,
        bustypeList: bustypeInfo,
      };
    },
    saveGroupsTree(state, action) {
      const groupsTreeInfo = action.payload;
      return {
        ...state,
        groupsTree: groupsTreeInfo,
      };
    },
    saveUserByGroupId(state, action) {
      const userByGroupId = action.payload;
      return {
        ...state,
        userByGroupId: userByGroupId,
      };
    },
    saveAreaInfoNoInspect(state, action) {
      const areaInfoNoInspect = action.payload;
      return {
        ...state,
        areaTreeNoInspect: areaInfoNoInspect,
      };
    },
    stationData(state, action) {
      return {
        ...state,
        stationData: action.payload,
      };
    },
  },
};
