import {stringify, parse} from 'qs';
import request from '../utils/request';
import {getCurrTk} from '../utils/utils';


export async function getStationFunction() {
  return request(`/proxy/task/function/list?${stringify({group: 'station'})}`);
}

export async function formStationInit(params) {
  return request('/proxy/station/form?' + stringify(params));
}

export async function formStationSubmit(params) {
  return request(`/proxy/station/edit/check/target/form?${stringify(params)}`);
}


//场站运行计划、计划编辑；
export async function editRPlan(params) {
  return request('/proxy/station/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

//区域排序；
export async function changeSort(params) {
  return request('/proxy/station/area/order', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}









//站点
export async function getStationData() {
  return request(`/proxy/station/list?${stringify({stationType: 'B'})}`);
}
//网格所
export async function getRegionData() {
  return request(`/proxy/station/list?${stringify({stationType: 'A'})}`);
}

export async function getTemplateData(params) {
  return request(`/proxy/task/plan/templates?${stringify(params)}`);
}

export async function addStationPlan(params) {
  return request('/proxy/task/plan/new', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function delStationPlan(param){
  return request(`/proxy/station/delete/plan?${stringify(param)}`);
}

export async function queryPlanData(params) {
  return request(`/proxy/station/plans?${stringify({...params, 'function': 'station_patrol'})}`);
}

export async function queryPlanDetaile2(params) {
  return request(`/proxy/station/plan/detail?${stringify({...params,'function': 'station_patrol'})}`);
}

export async function getEventForm(eventtype) {
  return request(`/proxy/event/getEventForm?eventtype=${eventtype}`);
}

export async function reportFormEvent(params) {
  return request('/proxy/event/reportFormEvent', {
    method: 'POST',
    body: params,
  });
}

export async function reportEventFile(params){
  return request('/proxy/attach/batch/uploadWithEcho', {
    method: 'POST',
    body: params,
  }, true);
}

// export async function queryGroups(params={}) {
//   return request(`/proxy/task/plan/groups?${stringify({...params,'function': 'station_patrol'})}`);
// }

//根据站点查区域列表
export async function queryGroups(params) {
  return request(`/proxy/station/area/list?${stringify(params)}`);
}
//根据区域id查询设备单元列表
export async function queryCheckEq(params) {
  return request(`/proxy/station/equipment/unit/list?${stringify(params)}`);
}

//检查对象查询；
export async function queryCheckObj(params) {
  return request(`/proxy/station/check/target/list?${stringify(params)}`);
}
//已有的检查对象数据；
export async function checkObjArr(params) {
  return request(`/proxy/station/query/check/target/list?${stringify(params)}`);
}

//编辑新建检查对象；
export async function editCheckObjArr(params) {
  // return request(`/proxy/station/edit/check/target?${stringify(params)}`);
  return request('/proxy/station/edit/check/target', {
    method: 'POST',
    body: params,
  });
}

//检查该设备单元下是否有数据；
export async function CheckEqData(params) {
  return request(`/proxy/station/validate?${stringify(params)}`);
};

/**
 * 查询任务
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryTasks0(params) {
  return request(`/proxy/task/task/list/group?${stringify(params)}`);
}

//查询任务（新）
export async function queryPlanList(params) {
  return request(`/proxy/station/task/summary?${stringify(params)}`);
}

/**
 * 查询任务汇总
 * @param params
 * @returns {Promise.<Object>}
 */
export async function queryTasks1(params) {
  return request(`/proxy/station/pad/summary?${stringify(params)}`);
}


export async function getTaskInfo(params) {
  return request(`/proxy/task/task/detail?${stringify(params)}`);
}

export async function getDictByKeys(key) {
  return request(`/proxy/fieldwork/dict/getdictbykeys?${stringify(key)}`);
}
/*
//查询所有的故障类型
export async function getFaultType(key) {
  return request(`/proxy/fieldwork/dict/getdictbykeys?${stringify(key)}`);
}
//查询所有的故障问题
export async function getFaultDescript(key) {
  return request(`/proxy/fieldwork/dict/getdictbykeys?${stringify(key)}`);
}
*/

//查询故障列表
export async function getFaultList(params){
  return request('/proxy/event/getEventAllTypeList?' + stringify(params));
}
//查询列表
export async function getExtEventList(params) {
  return request('/proxy/event/getExtEventList?' + stringify(params));
}



/**
 * 查询周期下拉值
 * @returns {Promise.<Object>}
 */
export async function fetchCycleUnit(){
  return request('/proxy/task/plan/cycle/units');
}
//task/station/new
export async function  makeStationPlanNew(params){
  return request('/proxy/station/new', {
    method: 'POST',
    body: params,
  });
}

export async function getStationUserList(){
  return request('proxy/station/userlist?stationType=B');
}

export async function getTaskDetail(params) {
  return request(`/proxy/station/pad/summary/detail?${stringify(params)}`);
}

export async function trancePlanState(act,planId) {
  return request(`/proxy/station/${act}?planId=${planId}`);
}

export function exportStationAccount(params, path) {
  return `/proxy/report/station/${path}?${stringify({...params, token: getCurrTk()})}`
}

//班次
export async function queryClassManage(params) {
  return request(`/proxy/station/query/work/time?${stringify(params)}`);
}

export async function delClassManage(params) {
  return request(`/proxy/station/delete/work/time?${stringify(params)}`);
}
export async function addClassManage(params) {
  return request('/proxy/station/save/work/time', {
    method: 'POST',
    body: params,
  });
  // return request(`/proxy/station/save/work/time?${stringify(params)}`);
}

//班组
export async function queryTeamManage(params) {
  return request(`/proxy/station/query/work/group?${stringify(params)}`);
}

export async function delTeamManage(params) {
  return request(`/proxy/station/delete/work/group?${stringify(params)}`);
}
export async function addTeamManage(params) {
  return request('/proxy/station/save/work/group', {
    method: 'POST',
    body: params,
  });
  // return request(`/proxy/station/save/work/group?${stringify(params)}`);
}

//调压对象管理
export async function queryObjManage(params) {
  return request(`/proxy/adjust/pressure/query/adjust/pressure/target?${stringify(params)}`);
}

export async function delObjManage(params) {
  return request(`/proxy/adjust/pressure/delete/adjust/pressure/target?${stringify(params)}`);
}
export async function addObjManage(params) {
  return request('/proxy/adjust/pressure/save/adjust/pressure/target', {
    method: 'POST',
    body: params,
  });
  // return request(`/proxy/station/save/work/group?${stringify(params)}`);
}

//调压通知
export async function queryNotice(params) {
  return request(`/proxy/adjust/pressure/query/adjust/pressure/record?${stringify(params)}`);
}

export async function addNotice(params) {
  return request('/proxy/adjust/pressure/save/adjust/pressure/record', {
    method: 'POST',
    body: params,
  });
  // return request(`/proxy/station/save/work/group?${stringify(params)}`);
}

//调压记录 -> 检查对象集合；
export async function queryCheckObjList(params) {
  return request(`/proxy/adjust/pressure/check/target/list?${stringify(params)}`);
}

//调压对象 -> 检查对象集合；
export async function queryCheckObjectList(params) {
  return request(`/proxy/adjust/pressure/query/check/targets?${stringify(params)}`);
}

//检查记录 -> 检查对象详情；
export async function queryCheckObjListData(params) {
  return request(`/proxy/adjust/pressure/detail?${stringify(params)}`);
}

//编辑、新建区域；
export async function editAreaManage(params) {
  return request('/proxy/station/save/area', {
    method: 'POST',
    body: params,
  });
}

//编辑、新建设备单元；
export async function editeqUnitManage(params) {
  return request('/proxy/station/save/equipment/unit', {
    method: 'POST',
    body: params,
  });
}

//查询检查项值域；
export async function queryRange(params) {
  return request(`/proxy/station/oper/types`);
}


//检验调压对象是否有重名；
export async function objManageNameOnly(params) {
  return request(`/proxy/adjust/pressure/validate/adjust/pressure/target?${stringify(params)}`);
}

//检查对象排序；
export async function checkObjSort(params) {
  return request('/proxy/station/check/target/order', {
    method: 'POST',
    body: params,
  });
}

//上调下调；
export async function getAdjustWay(params) {
  return request(`/proxy/adjust/pressure/oper/types`);
}


//查站点下的负责人；
export async function queryFeedbackUsers(params) {
  return request(`/proxy/station/stationUser?${stringify(params)}`);
}

//查询计划下是否有任务；
export async function queryHasTasks(params) {
  return request(`/proxy/station/validate/plan/delete?${stringify(params)}`);
}

//任务反馈；
export async function feedbackSubmit(params) {
  return request('/proxy/station/feedback/multi', {
    method: 'POST',
    body: params,
  });
}

