import update from 'immutability-helper';
import { notification } from 'antd';
import {
  fetchLedger as fetchLedgerList,
  postLedger,
  fetchClassify,
  fetchPerfectLevel,
  fetchImportantLevel,
  fetchSiteList,
  fetchAreaList,
  fetchStatus,
  deleteLedger,
  fetchEqCode,
  fetchTechParamList,
  fetchOptions,
  uploadAttachmentList,
  fetchAttachmentList,
  deleteAttachmentList,
  fetchLedgerPlan,
  fetchLedgerTask,
  fetchLedgerRecord,
  fetchLegerHistory,
  fetchRepairLevel,
  fetchSpareParts,
  getCompanyCode,
  updateLdgrType,
  getGroupsTree,
  downloadLedger,
  queryEqKindes,
  getLedgerDetial,
} from '../services/eqLedger';
import { fetchClassifyTree } from '../services/eqClassification';
import { fetchLocationTree } from '../services/eqLocation';
import { fetchMalfunctionFirstOrder } from '../services/malfunction';

const initState = {
  activeKey: 'list', // tabs 切换 activeKey
  isNewLedger: false, // 是否是新增台账
  eqClassify: '', // 设备分类信息
  eqDetail: {
    isEdit: false, // 判断台账表单是否编辑过
    gid: undefined,
    id: undefined,
    name: undefined,
    classify: undefined,
    organization: undefined,
    organizationName: undefined,
    site: undefined,
    area: undefined,
    position: undefined,
    positionName: undefined,
    type: undefined,
    perfect: undefined,
    isSpecial: undefined,
    parentId: undefined,
    parentName: undefined,
    model: undefined,
    company: undefined,
    manufacturer: undefined,
    installDate: undefined,
    person: undefined,
    importantLevel: undefined,
    user: undefined,
    productionDate: undefined,
    code: undefined,
    malfunction: undefined,
    changedTime: undefined,
    material: undefined,
    provider: undefined,
    qualityDate: undefined,
    fixedCode: undefined,
    status: undefined,
    ewCodeUUID: undefined,
    nextRepairDate: undefined,
    nextRepairLevel: undefined,
    proDefineNumber: undefined,
    spareParts: undefined,
    sparePartsAccount: undefined,
    oldEqCode: undefined,
    ccode: undefined,
  },
  eqDetailPositionName: undefined,
  eqCustom: {
    gid: '',
    eqCode: '',
    eqName: '',
    parentName: '',
  },
  gis: {
    gisId: '',
    x: '',
    y: '',
  },
  filterOption: {
    keyword: undefined, // 过滤关键字
    eqCode: undefined, // 设备编号
    site: undefined, // 站点
    parentId: undefined, // 父级 ID
    locGid: undefined, // 位置 ID
    clsGid: undefined, // 分类 ID
    pageNum: undefined, // 页码
    pageSize: undefined, // 页数
    sortRule: undefined, // 排序规则
    sortField: undefined, // 排序名称
  },
  siteList: [], // 站点列表
  eqList: {}, // 台账列表
  attachmentListArr: [], // 附件列表
  classifyList: [], // 分类列表
  TechParamList: [], // 技术参数列表
  eqChildList: [], // 设备子级列表
  selectOptions: [], // 下拉选项列表
  ledgerLists: { // 台账表单下拉列表
    classify: [],
    site: [],
    area: [],
    pos: [],
    type: [],
    perfectLevel: [],
    importantLevel: [],
    malfunction: [],
    status: [],
    companyCode: [], // 所属公司
  },
  nextRepairLevel: [], // 下次检修等级
  fileList: [],
  map: null, // 地图容器
  taskList: {}, // 预防性维护记录
  planList: {}, // 预防性维护计划
  historyList: {}, // 设备历史工单列表
  recordList: {}, // 设备隐患记录列表
  imageDisplay: 'none', // 设备详情二维码显示与否
  selectedRowKeys: [], // 列表多选，导出二维码
  sparePartsList: [],
  sparePartsTotal: 0,
  typeFilter: [], // 分类筛选
  allowDownload: false, // 是否能导出
  disabled: false, // 是否能编辑
  groupTreeData: [], // 组织树
  eqKindData: [], // 设备种类
  filterVale: {
    clsName: [],
    eqKind: [],
    eqStatus: [],
    eqTypeName: [],
    gisReportState: [],
  },
};

export default {
  namespace: 'ledger',
  state: initState,
  reducers: {
    // 设置附件列表
    setAttachmentList(state, { payload: attachmentList }) {
      const { list } = attachmentList;
      const attachmentListArr = [];
      if (list) {
        list.forEach(item => {
          const attachmentListJson = {
            uid: item.gid,
            name: item.fileName,
            status: 'done',
            url: `/proxy/ldgrFile/downloadFile?id=${item.fileGid}`,
          };
          attachmentListArr.push(attachmentListJson);
        });
      }
      return {
        ...state,
        attachmentListArr,
      };
    },
    // 设置 tab 切换 activeKey
    setEqActiveKey(state, { payload: activeKey }) {
      return {
        ...state,
        activeKey,
      };
    },
    // 设置台账过滤条件
    setFilterOption(state, { payload: filterOption }) {
      return {
        ...state,
        filterOption,
      };
    },
    // 设置台账列表
    setEqList(state, { payload: eqList }) {
      return {
        ...state,
        eqList,
      };
    },
    // 设置台账技术参数列表
    setTechParamList(state, { payload: TechParamList }) {
      return {
        ...state,
        TechParamList,
      };
    },
    // 设置站点列表
    setSiteList(state, { payload: siteList }) {
      return {
        ...state,
        siteList,
      };
    },
    // 设置台账表单状态 - 新增还是修改
    setLedgerStatus(state, { payload: isNewLedger }) {
      return {
        ...state,
        isNewLedger,
      };
    },
    // 设置设备详情
    setEqDetail(state, { payload: eqDetail }) {
      return {
        ...state,
        eqDetail,
      };
    },
    // 设置设备分类信息
    setEqClassify(state, { payload: eqClassify }) {
      return {
        ...state,
        eqClassify,
      };
    },
    // 设置全局 eq 基本信息
    setEqCustom(state, { payload: eqCustom }) {
      return {
        ...state,
        eqCustom,
      };
    },
    // 设置 GIS 信息
    setGis(state, { payload: gis }) {
      return {
        ...state,
        gis,
      };
    },
    // 初始化 tab 下的各 list
    initTabList(state) {
      return {
        ...state,
        taskList: initState.taskList,
        planList: initState.planList,
        historyList: initState.historyList,
        recordList: initState.recordList,
      };
    },
    // 根据台账父级 ID 获取该父级下的自己列表
    setChildList(state, { payload: eqChildList }) {
      return {
        ...state,
        eqChildList,
      };
    },
    // 根据技术参数的id,获取该 ID 下的下拉选项列表
    getSelectOptions(state, { payload: selectOptions }) {
      return {
        ...state,
        selectOptions,
      };
    },
    // 设置台账表单下拉选项
    setLedgerLists(state, { payload: ledgerLists }) {
      return {
        ...state,
        ledgerLists,
      };
    },
    // 设置筛选
    setClassifyList(state, { payload: classifyList }) {
      return {
        ...state,
        classifyList,
      };
    },
    // 设置附件内容
    setFileList(state, { payload: fileList }) {
      return {
        ...state,
        fileList,
      };
    },
    // 设置地图
    setMap(state, { payload: map }) {
      return {
        ...state,
        map,
      };
    },
    // 设置位置名称
    setEqDetailPositionName(state, { payload: eqDetailPositionName }) {
      return {
        ...state,
        eqDetailPositionName,
      };
    },
    // 设置台账维护及计划
    setTaskList(state, { payload: taskList }) {
      return { ...state, taskList };
    },
    // 设置台账维护记录
    setPlanList(state, { payload: planList }) {
      return { ...state, planList };
    },
    // 设置设备历史工单
    setHistoryList(state, { payload: historyList }) {
      return { ...state, historyList };
    },
    // 设置设备维护记录
    setRecordList(state, { payload: recordList }) {
      return { ...state, recordList };
    },
    setErcodeImage(state, { payload: imageDisplay }) {
      return {
        ...state,
        imageDisplay,
      };
    },
    setSelectedRowKeys(state, { payload: selectedRowKeys }) {
      return {
        ...state,
        selectedRowKeys,
      };
    },
    setNextRepairLevel(state, { payload }) {
      return {
        ...state,
        nextRepairLevel: payload,
      };
    },
    setSparePartsList(state, action) {
      return {
        ...state,
        sparePartsList: action.payload.data,
        sparePartsTotal: action.payload.total,
      };
    },
    setTypeFilter(state, {payload}) {
      return {
        ...state,
        typeFilter: payload,
      };
    },
    setAllowDownload(state, {payload}) {
      return {
        ...state,
        allowDownload: payload,
      };
    },
    setDisabled(state, {payload}) {
      return {
        ...state,
        disabled: payload,
      };
    },
    setGroupTreeData(state, {payload}) {
      return {
        ...state,
        groupTreeData: payload,
      };
    },
    setEqKinds(state, action) {
      return {
        ...state,
        eqKindData: action.payload,
      };
    },
    setFilterVale(state, action) {
      return {
        ...state,
        filterVale: action.payload,
      };
    },
  },
  effects: {
    // 获取台账列表
    *fetchLedger({ payload: options }, { call, put }) {
      yield put({ type: 'setFilterOption', payload: options });
      const response = yield call(fetchLedgerList, {...options, filterCols: 'cls'});
      if (response.success) {
        yield put({ type: 'setEqList', payload: response.data.pageInfo });
        if (options.clsGid) {
          yield put({type: 'setAllowDownload', payload: true});
        } else {
          yield put({type: 'setAllowDownload', payload: false});
        }
        if (response.data.filter.cls !== undefined) {
          yield put({ type: 'setTypeFilter', payload: response.data.filter.cls});
        }
      }
    },
    *fetchLedgerWithFilter({payload: options}, {call, put}) {
      yield put({ type: 'setFilterOption', payload: options });
      const response = yield call(fetchLedgerList, options);
      if (response.success) {
        if (options.clsGid) {
          yield put({type: 'setAllowDownload', payload: true});
        } else {
          yield put({type: 'setAllowDownload', payload: false});
        }
        yield put({ type: 'setEqList', payload: response.data.pageInfo });
      }
    },
    // 删除台账
    *deleteLedger({ payload: data }, { call, put }) {
      const response = yield call(deleteLedger, data.gid);
      if (response.success) {
        notification.success({ message: '删除成功', duration: 3 });
        yield put({ type: 'fetchLedger', payload: data.filterOption });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 获取附件列表1(设备台账)
    *fetchAttachmentList({ payload: options }, { call, put }) {
      const response = yield call(fetchAttachmentList, options);
      if (response.success) {
        yield put({ type: 'setAttachmentList', payload: response.data });
      }
    },
    // 删除附件1(设备台账)
    *deleteAttachmentList({ payload: ids }, { call, put }) {
      const response = yield call(deleteAttachmentList, ids);
    },
    // 初始化新增台账
    *newLedger({ payload: data }, { put }) {
      yield put({ type: 'setAttachmentList', payload: {} }); // 初始化附件列表
      yield put({
        type: 'setEqDetail',
        payload: update(initState.eqDetail, {
          $merge: {
            organizationName: data.organizationName,
            user: data.user,
            changedTime: data.changedTime,
          },
        }),
      });
      // 初始化设备详情
      yield put({ type: 'initTabList' }); // 初始化各 tabList
      yield put({ type: 'setFileList', payload: [] }); // 清空附件列表
      yield put({ type: 'setEqDetailPositionName', payload: undefined }); // 清空位置名称
      yield put({ type: 'setLedgerStatus', payload: data.isNewLedger }); // 设置为新增台账
      yield put({ type: 'fetchLedgerLists' }); // 拉取表单的下拉选项
      yield put({ type: 'setEqCustom', payload: {} }); // 初始化设备通用信息
      yield put({ type: 'setGis', payload: initState.gis }); // 初始化 GIS 信息
      yield put({ type: 'setEqActiveKey', payload: data.activeKey }); // 跳转到台账表单页面
      yield put({ type: 'fetchRepairLevel', payload: {} }); // 初始化检修等级下拉选项
      yield put({ type: 'setEqClassify', payload: '' }); // 初始化分类名称
    },
    // 新增台账
    *postLedger({ payload: data }, { call, put }) {
      console.log(data);
      const response = yield call(postLedger, { ...data.eqDetailFormat, clsName: data.clsName}); // 提交表单
      if (response.success) { // 判断表单提交是否成功
        if (data.fileList.length && !data.fileList[data.fileList.length - 1].url) {
          const formData = new FormData();
          data.fileList.forEach(file => formData.append('files[]', file));
          formData.append('gid', response.data);
          const fileResponse = yield call(uploadAttachmentList, formData);
          if (!fileResponse.success) {
            notification.error({ message: '附件上传失败', duration: 2 });
          }
        }
        yield put({
          type: 'setEqDetail',
          payload: update(data.eqDetail, {$merge: { gid: response.data, isEdit: false }}),
        }); // 初始化 eqDetail
        yield put({ type: 'setEqCustom', // 设置 EQCustom 值
          payload: {
            gid: response.data,
            eqCode: data.eqDetail.id,
            eqName: data.eqDetail.name,
            eqClassify: data.eqClassify,
          },
        });
        yield put({ type: 'setLedgerStatus', payload: false }); // 设置当前台账为编辑状态
        yield put({ type: 'fetchTechParamList', payload: response.data }); // 获取技术参数列表
        if (data.isNewLedger) { // 判断是新增台账还是修改台账
          notification.success({ message: '新增台账成功', duration: 3 });
          yield put({ type: 'setEqActiveKey', payload: 'param' }); // 新增跳转到参数列表
        } else {
          notification.success({ message: '修改台账成功', duration: 3 });
          yield put({ type: 'setEqActiveKey', payload: 'list' }); // 编辑跳转到设备列表
        }
        yield put({ type: 'fetchLedger', payload: data.filterOption }); // 拉取设备列表
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 新增 or 编辑 GIS 信息
    *postGis({ payload: data }, { call, put }) {
      const response = yield call(postLedger, data.options);
      if (response.success) {
        notification.success({ message: '编辑成功', duration: 3 });
        yield put({ type: 'fetchLedger', payload: data.filterOption }); // 编辑成功,拉取台账列表
        yield put({ type: 'setEqActiveKey', payload: 'list' }); // 跳转到 list 页面
      } else {
        notification.success({ message: response.msg, duration: 3 });
      }
    },
    // 编辑台账
    *editLedger({ payload: data }, { put }) {
      yield put({ type: 'fetchSpareParts', payload: {factoryCode: data.eqDetail.organization, pageno: 1, pagesize: 10}}); // 初始化周转备件列表
      yield put({ type: 'fetchLedgerLists' }); // 获取台账下拉选项内容
      yield put({ type: 'fetchRepairLevel', payload: {} }); // 初始化检修等级下拉选项
      yield put({ type: 'setLedgerStatus', payload: data.isNewLedger }); // 设置是编辑还是新增
      yield put({ type: 'setEqDetail', payload: data.eqDetail }); // 设置台账表单详细内容
      yield put({ type: 'setEqDetailPositionName', payload: data.eqDetail.positionName }); // 设置位置名称
      yield put({ type: 'setEqClassify', payload: data.eqDetail.classifyName }); // 设置分类名称
      yield put({ type: 'setEqCustom', // 设置设备基本信息
        payload: {
          gid: data.eqDetail.gid,
          eqCode: data.eqDetail.id,
          eqName: data.eqDetail.name,
          eqClassify: data.eqDetail.classifyName,
        },
      });
      yield put({ type: 'fetchTechParamList', payload: data.eqGid }); // 拉取技术参数列表
      yield put({ type: 'fetchAttachmentList', // 获取附件列表
        payload: {
          eqCode: data.eqDetail.gid,
          pageNum: '1',
          pageSize: '100',
        },
      });
      yield put({ type: 'setEqActiveKey', payload: data.activeKey }); //
    },
    // 获取站点列表
    *fetchSiteList(_, { call, put }) {
      const response = yield call(fetchSiteList);
      if (response.success) {
        yield put({ type: 'setSiteList', payload: response.data });
      }
    },
    // 获取设备编号
    *fetchEqCode({ payload: options }, { call, put }) {
      const response = yield call(fetchEqCode, options.params);
      if (response.success) {
        yield put({
          type: 'setEqDetail',
          payload: update(options.eqDetail, { id: { $set: response.data } }),
        });
      } else {
        notification.error({ message: response.msg, duration: 3 });
      }
    },
    // 获取技术列表
    *fetchTechParamList({ payload: options }, { call, put }) {
      const response = yield call(fetchTechParamList, options);
      if (response.success) {
        yield put({ type: 'setTechParamList', payload: response.data });
      }
    },
    // 获取技术参数下拉值
    *fetchOptions({ payload: classspecGid }, { call, put }) {
      const response = yield call(fetchOptions, classspecGid);
      if (response.success) {
        yield put({ type: 'getSelectOptions', payload: response.data });
      }
    },
    // 获取台账下拉列表
    *fetchLedgerLists(_, { call, put }) {
      const classify = yield call(fetchClassifyTree, {}); // 获取分类列表
      const site = yield call(fetchSiteList); // 获取站点列表
      const area = yield call(fetchAreaList); // 获取执行区域列表
      const pos = yield call(fetchLocationTree); // 获取位置列表
      const type = yield call(fetchClassify); // 获取类型列表
      const perfectLevel = yield call(fetchPerfectLevel); // 获取完美等级列表
      const importantLevel = yield call(fetchImportantLevel); // 获取重要等级列表
      const malfunction = yield call(fetchMalfunctionFirstOrder); // 获取故障参数列表
      const status = yield call(fetchStatus); // 获取状态列表
      const companyCode = yield call(getCompanyCode); // 获取所属公司列表
      yield put({ type: 'setLedgerLists',
        payload: {
          classify: classify.success ? classify.data : [],
          area: area.success ? area.data : [],
          site: site.success ? site.data : [],
          pos: pos.success ? pos.data : [],
          type: type.success ? type.data : [],
          perfectLevel: perfectLevel.success ? perfectLevel.data : [],
          importantLevel: importantLevel.success ? importantLevel.data : [],
          malfunction: malfunction.success ? (malfunction.data || []) : [],
          status: status.success ? status.data : [],
          companyCode: companyCode.success ? companyCode.data : [],
        },
      });
    },
    // 获取组织树
    *fetchGroupTree({payload}, {call, put}) {
      const companyTreeData = yield call(getGroupsTree, payload); // 获取组织树
      yield put({type: 'setGroupTreeData', payload: companyTreeData.success ? companyTreeData.items : []});
    },
    // 获取设备类型列表
    *fetchClassifyList(_, { call, put }) {
      const response = yield call(fetchClassify);
      yield put({
        type: 'setClassifyList',
        payload: response.success ? response.data : [],
      });
    },
    // 获取预防性维护列表
    *fetchLedgerMaintain({ payload: options }, { call, put }) {
      if (options.type === 'plan') {
        const responsePlan = yield call(fetchLedgerPlan, options);
        if (responsePlan.success) {
          yield put({ type: 'setPlanList', payload: responsePlan });
        }
      } else if (options.type === 'task') {
        const responseTask = yield call(fetchLedgerTask, options);
        if (responseTask.success) {
          yield put({ type: 'setTaskList', payload: responseTask });
        }
      } else {
        const responseTask = yield call(fetchLedgerTask, options);
        const responsePlan = yield call(fetchLedgerPlan, options);
        if (responseTask.success) {
          yield put({ type: 'setTaskList', payload: responseTask });
        }
        if (responsePlan.success) {
          yield put({ type: 'setPlanList', payload: responsePlan });
        }
      }
    },
    // 获取历史工单列表
    *fetchHistoryList({ payload: options }, { call, put }) {
      const response = yield call(fetchLegerHistory, options);
      if (response.success) {
        yield put({ type: 'setHistoryList', payload: response });
      }
    },
    // 获取隐患记录列表
    *fetchRecordList({ payload: options }, { call, put }) {
      const response = yield call(fetchLedgerRecord, options);
      if (response.success) {
        yield put({ type: 'setRecordList', payload: response });
      }
    },
    // 获取下次检修等级
    *fetchRepairLevel({ payload }, { call, put }) {
      const res = yield call(fetchRepairLevel, payload);
      if (res.success) {
        yield put({ type: 'setNextRepairLevel', payload: res.data });
      }
    },
    // 获取周转备件下拉菜单
    *fetchSpareParts({ payload }, { call, put }) {
      const res = yield call(fetchSpareParts, payload);
      if (res.success) {
        yield put({ type: 'setSparePartsList', payload: res });
      }
    },
    *updateLdgrTypes({payload, callback}, {call, put}) {
      const res = yield call(updateLdgrType, payload);
      if (res.success) {
        notification.success({ message: '批量更新完成', duration: 3 });
        callback(res);
      } else {
        notification.error({ message: res.msg, duration: 3 });
      }
    },
    *getRunStatus({payload}, {call, put}) {
      const status = yield call(fetchStatus, payload);
      yield put({ type: 'setLedgerLists',
        payload: {
          status: status.success ? status.data : [],
        },
      });
    },
    *fetchForDownload({payload, callback}, {call, put}) {
      const res = yield call(downloadLedger, payload);
      // if (res.success) {
      //   callback();
      // } else {
      //   notification.error({ message: res.msg, duration: 3 });
      // }
    },
    *fetchEqKindes({payload}, {call, put}) {
      const res = yield call(queryEqKindes, payload);
      if (res.success) {
        yield put({type: 'setEqKinds', payload: res.data});
      }
    },
    *fetchLedgerDetail({payload, callback}, {call, put}) {
      const res = yield call(getLedgerDetial, payload);
      if (res.success) {
        // console.log(res);
        callback(res.data);
      }
    },
  },
};
