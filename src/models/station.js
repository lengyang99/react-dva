import {
  getStationFunction
  , getStationData
  , getTemplateData
  , addStationPlan
  , queryPlanData
  , queryGroups
  , queryTasks0
  , queryTasks1
  , getTaskInfo
  , delStationPlan
  , fetchCycleUnit
  , makeStationPlanNew
  , editPlan
  , editRPlan
  , getTaskDetail
  , trancePlanState
  , queryPlanDetaile2,
  queryCheckEq,
  queryCheckObj,
  checkObjArr,
  editCheckObjArr,
  CheckEqData,
  queryClassManage,
  delClassManage,
  addClassManage,
  queryTeamManage,
  delTeamManage,
  addTeamManage,
  queryObjManage,
  delObjManage,
  addObjManage,
  queryNotice,
  addNotice,
  editAreaManage,
  editeqUnitManage,
  queryCheckObjList,
  queryCheckObjListData,
  changeSort,
  queryCheckObjectList,
  objManageNameOnly,
  checkObjSort,
  getAdjustWay,
  queryRange,
  getRegionData,
  queryPlanList,
  queryFeedbackUsers,
  queryHasTasks,
  feedbackSubmit,
} from '../services/station';

export default {
  namespace: 'station',
  state: {
    funcList: [],
    data: {},
    stations: [],
    regions: [],
    templates: [],
    groups: [],
    planLoading: false,
    taskData: {},
    taskNewData: [],  //场站任务（新）
    taskTotal: [],  //场站任务总数（新）
    showTaskDlg: false,
    taskInfo: [],
    total: {},
    taskTotal: {},
    cycleUnit: [],
    planTasks: [],
    taskDetailData: [],
    taskActive: '',
    paginations: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    taskPaginations: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    planDetaileData: [],
    planTaskTotal: '',
    eqUnit: [],
    checkObj: [],
    checkObjArr: [], // 场站查询检查对象；
    classManage: [], // 班次数据
    teamManage: [], // 班组数据
    objManage: [], // 调压对象数据
    noticeData: [], // 通知数据
    feedbackUsers: [], //反馈人
  },
  effects: {
    * getStationFunction({callback}, {call, put}) {
      const res = yield call(getStationFunction);
      yield put({
        type: 'functionSave',
        payload: res.data || [],
      });

      callback && callback(res.data[0].functionKey);
    },
    //站点
    * getStationData({payload, callback}, {call, put}) {
      const res = yield call(getStationData, payload);
      yield put({
        type: 'changeStations',
        payload: res.data,
      });
      callback && callback(res);
    },
    //站点
    * getRegionData({payload, callback}, {call, put}) {
      const res = yield call(getRegionData, payload);
      yield put({
        type: 'changeRegion',
        payload: res.data
      });
      callback && callback(res.data);
    },
    * getTemplateData({payload}, {call, put}) {
      const res1 = yield call(getTemplateData, payload);
      yield put({
        type: 'changeTemplates',
        payload: res1.data,
      });
    },
    * addStationPlan({payload, callback}, {call}) {
      const res = yield call(addStationPlan, payload);
      callback && callback(res);
    },
    * editStationPlan({payload, callback}, {call}) {
      const res = yield call(editPlan, payload);
      callback && callback(res);
    },
    // 场站计划运行，编辑；
    * editStationRPlan({payload, callback}, {call}) {
      const res = yield call(editRPlan, payload);
      callback && callback(res);
    },
    *delStationPlan({payload, callback}, {call}) {
      const res = yield call(delStationPlan, payload);
      callback && callback(res);
    },
    //场站任务查询（新）
    * queryPlanList({payload, callback}, {call, put}) {
      const res = yield call(queryPlanList, payload);
      yield put({
        type: 'taskList',
        payload: res.data,
        taskTotal: res.total,
      });
      callback && callback(res);
    },
    * queryPlanData({payload, callback}, {call, put}) {
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      const response = yield call(queryPlanData, payload);
      yield put({
        type: 'savePlanData',
        payload: {...response, key: payload.areaId},
        paginations: payload,
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
      callback && callback(response);
    },
    // 根据计划id查看详情
    * queryPlanDetaile({payload, callback}, {call, put}) {
      yield put({
        type: 'changePlanLoading',
        payload: true,
      });
      const res = yield call(queryPlanDetaile2, payload);
      yield put({
        type: 'planDetaileSave',
        payload: res.data || [],
      });
      yield put({
        type: 'changePlanLoading',
        payload: false,
      });
      callback && callback(res.data || []);
    },
    * queryGroups({payload, callback}, {call, put}) {
      const {data = []} = yield call(queryGroups, payload);
      yield put({
        type: 'changeGroupData',
        payload: data,
      });
      if (data.length > 0) {
        callback && callback(data, data[0].gid);
      }else {
        callback && callback(data);
      }
    },
    * queryCheckEq({payload, callback}, {call, put}) {
      const {data = []} = yield call(queryCheckEq, payload);
      yield put({
        type: 'changeEqData',
        payload: data,
      });

      // if (data.length > 0) {
      //   callback && callback(data);
      // }
      callback && callback(data);
    },
    * queryCheckObj({payload, callback}, {call, put}) {
      const {data = []} = yield call(queryCheckObj, payload);
      yield put({
        type: 'checkObj',
        payload: data,
      });

      if (data.length > 0) {
        callback && callback(data);
      }
    },
    * queryTasks({payload, callback}, {call, put}) {
      const response = yield call(queryTasks1, payload);
      const {areaId} = payload;
      yield put({
        type: 'saveTaskData',
        // payload: {...response, key: group + (planId?planId:'')},
        payload: {...response, key: areaId },
        paginations: payload,
      });
      callback && callback(response.data);
    },
    //查询该计划下是否有任务；
    * queryHasTasks({payload, callback}, {call, put}) {
      const response = yield call(queryHasTasks, payload);

      callback && callback(response.data);
    },
    * queryPlanTasks({payload, callback}, {call, put}) {
      const response = yield call(queryTasks0, payload);
      yield put({
        type: 'savePlanTaskData',
        payload: response,

      });
      if (response.data && response.data.length > 0) {
        callback(response.data[0].taskId);
      }
    },

    * getTaskInfo({payload}, {call, put}) {
      yield put({
        type: 'setTaskDialogVisible',
        payload: true,
      });
      const res = yield call(getTaskInfo, payload);
      yield put({
        type: 'saveTaskInfo',
        payload: res.data || [],
      });
    },
    *fetchCycleUnit({_}, {call, put}) {
      const res = yield call(fetchCycleUnit);
      yield put({
        type: 'saveUnits',
        payload: res.data || [],
      });
    },
     *makeStationPlanNew({payload, callback}, {call}) {
      const res = yield call(makeStationPlanNew, payload);
      callback && callback(res);
    },
     *getTaskDetail({payload, callback}, {call, put}) {
      const {data = []} = yield call(getTaskDetail, payload);
      // let items=[];
      // if(data.length>0){
      //   if(data[0].items){
      //     items= data[0].items||[];
      //   }
      // }
      yield put({
        type: 'saveTaskDetail',
        payload: data,
        // payload:items,
        // key:payload.taskId
      });
      callback && callback(data);
    },
    *tranceState({payload, act, callback}, {call}) {
      const res = yield call(trancePlanState, act, payload);
      callback && callback(res);
    },
    *queryCheckObjArr({payload, callback}, {call, put}) {
      const res = yield call(checkObjArr, payload);
      yield put({
        type: 'checkObjArr',
        payload: res.data,
      });
      callback && callback(res);
    },
    // 场站检查对象，编辑；
    * editCheckObjArr({payload, callback}, {call}) {
      const res = yield call(editCheckObjArr, payload);
      callback && callback(res);
    },
    * CheckEqData({payload, callback}, {call}) {
      const res = yield call(CheckEqData, payload);
      callback && callback(res.data);
    },
    // 班次
    *queryClassManage({payload, callback}, {call, put}) {
      const res = yield call(queryClassManage, payload);
      yield put({
        type: 'classManage',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    * delClassManage({payload, callback}, {call}) {
      const res = yield call(delClassManage, payload);
      callback && callback(res);
    },
    * addClassManage({payload, callback}, {call}) {
      const res = yield call(addClassManage, payload);
      callback && callback(res);
    },
    // 班组
    *queryTeamManage({payload, callback}, {call, put}) {
      const res = yield call(queryTeamManage, payload);
      yield put({
        type: 'teamManage',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    * delTeamManage({payload, callback}, {call}) {
      const res = yield call(delTeamManage, payload);
      callback && callback(res);
    },
    * addTeamManage({payload, callback}, {call}) {
      const res = yield call(addTeamManage, payload);
      callback && callback(res);
    },
    // 调压对象管理；
    *queryObjManage({payload, callback}, {call, put}) {
      const res = yield call(queryObjManage, payload);
      yield put({
        type: 'objManage',
        payload: res.data,
      });
      callback && callback(res.data);
    },
    * delObjManage({payload, callback}, {call}) {
      const res = yield call(delObjManage, payload);
      callback && callback(res);
    },
    * addObjManage({payload, callback}, {call}) {
      const res = yield call(addObjManage, payload);
      callback && callback(res);
    },
    *queryNotice({payload, callback}, {call, put}) {
      const res = yield call(queryNotice, payload);
      yield put({
        type: 'noticeData',
        payload: res.data,
      });
      callback && callback(res);
    },
    * addNotice({payload, callback}, {call}) {
      const res = yield call(addNotice, payload);
      callback && callback(res);
    },
    // 添加区域；
    * editAreaManage({payload, callback}, {call}) {
      const res = yield call(editAreaManage, payload);
      callback && callback(res);
    },
    // 添加设备单元；
    * editeqUnitManage({payload, callback}, {call}) {
      const res = yield call(editeqUnitManage, payload);
      callback && callback(res);
    },
    // 调压记录->检查对象；
    * queryCheckObjList({payload, callback}, {call}) {
      const res = yield call(queryCheckObjList, payload);
      callback && callback(res.data);
    },
    // 调压对象->检查对象；
    * queryCheckObjectList({payload, callback}, {call}) {
      const res = yield call(queryCheckObjectList, payload);
      callback && callback(res.data);
    },
    // 调压记录-> 检查对象详情；
    * queryCheckObjListData({payload, callback}, {call}) {
      const res = yield call(queryCheckObjListData, payload);
      callback && callback(res.data);
    },
    // 区域排序；
    * changeSort({payload, callback}, {call}) {
      const res = yield call(changeSort, payload);
      callback && callback(res);
    },
    // 检验调压对象是否有重名；
    * objManageNameOnly({payload, callback}, {call}) {
      const res = yield call(objManageNameOnly, payload);
      callback && callback(res);
    },
    // 检查对象排序；
    * checkObjSort({payload, callback}, {call}) {
      const res = yield call(checkObjSort, payload);
      callback && callback(res);
    },
    // 上调下调；
    * getAdjustWay({payload, callback}, {call}) {
      const res = yield call(getAdjustWay, payload);
      callback && callback(res);
    },
    // 查询选择域范围
    * queryRange({payload, callback}, {call}) {
      const res = yield call(queryRange, payload); 
      console.log(res);
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      callback && callback(res);
    },
    // 查询场站反馈人
    * queryFeedbackUsers({payload, callback}, {call, put}) {
      const res = yield call(queryFeedbackUsers, payload); 
      if (!res.success) {
        message.error(res.msg);
        return;
      }
      yield put({
        type: 'feedbackUser',
        payload: res.data,
      });
      callback && callback(res);
    },
    // 任务反馈；
    * feedbackSubmit({payload, callback}, {call}) {
      const res = yield call(feedbackSubmit, payload);
      callback && callback(res);
    },
  },
  reducers: {
    noticeData(state, action) {
      return {
        ...state,
        noticeData: action.payload,
      };
    },
    objManage(state, action) {
      return {
        ...state,
        objManage: action.payload,
      };
    },
    teamManage(state, action) {
      return {
        ...state,
        teamManage: action.payload,
      };
    },
    classManage(state, action) {
      return {
        ...state,
        classManage: action.payload,
      };
    },
    checkObjArr(state, action) {
      return {
        ...state,
        checkObjArr: action.payload,
        checkObjTotal: action.checkObjTotal,
      };
    },
    functionSave(state, action) {
      return {
        ...state,
        funcList: action.payload,
      };
    },
    changeStations(state, action) {
      return {
        ...state,
        stations: action.payload,
      };
    },
    changeRegion(state, action) {
      return {
        ...state,
        regions: action.payload,
      };
    },
    changeTemplates(state, action) {
      return {
        ...state,
        templates: action.payload,
      };
    },
    savePlanData(state, action) {
      const {key, data, total} = action.payload;
      const {pageno, pagesize} = action.paginations;
      return {
        ...state,
        data: {...state.data, [key]: data},
        total: {...state.total, [key]: total},
        paginations: {
          current: pageno,
          pageSize: pagesize,
          total,
        },
      };
    },
    planDetaileSave(state, action) {
      return {
        ...state,
        planDetaileData: action.payload,
      };
    },
    changePlanLoading(state, {payload}) {
      return {
        ...state,
        planLoading: payload,
      };
    },
    changeGroupData(state, {payload}) {
      return {
        ...state,
        groups: payload,
      };
    },
    changeEqData(state, {payload}) {
      return {
        ...state,
        eqUnit: payload,
      };
    },
    checkObj(state, {payload}) {
      return {
        ...state,
        checkObj: payload,
      };
    },
    saveTaskData(state, action) {
      const {key, data, total} = action.payload;
      const {pageno, pagesize} = action.paginations;
      return {
        ...state,
        taskData: {...state.taskData, [key]: data},
        taskTotal: {...state.taskTotal, [key]: total},
        taskPaginations: {
          current: pageno,
          pageSize: pagesize,
          total,
        },
      };
    },
    setTaskDialogVisible(state, {payload}) {
      return {
        ...state,
        showTaskDlg: payload,
      };
    },
    saveTaskInfo(state, {payload}) {
      return {
        ...state,
        taskInfo: payload,
      };
    },
    saveUnits(state, {payload}) {
      return {
        ...state,
        cycleUnit: payload,
      };
    },
    savePlanTaskData(state, {payload}) {
      return {
        ...state,
        planTasks: payload.data || [],
        planTaskTotal: payload.total,
      };
    },
    saveTaskDetail(state, {payload, key}) {
      const tKey = `task_${key}`;
      return {
        ...state,
        // taskDetailData:{...state.taskDetailData,[tKey]:payload}
        taskDetailData: payload,
      };
    },
    changeGroupTab(state, {payload}) {
      return {
        ...state,
        taskActive: payload,
      };
    },
    taskList(state, action) {
      return {
        ...state,
        taskNewData: action.payload,
        taskTotal: action.taskTotal,
      };
    },
    feedbackUser(state, action) {
      return {
        ...state,
        feedbackUsers: action.payload,
      };
    },
  },
};
