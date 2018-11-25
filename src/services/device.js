import { stringify } from 'qs';
import request from '../utils/request';

// 根据任务formId查看任务反馈详情
export async function getFormData(params) {
  return request(`/proxy/task/feedback/form?${stringify(params)}`);
}

// 根据任务formId查看危险作业反馈详情
export async function getDangerFormData(params) {
  return request(`/proxy/dangerWork/form?${stringify(params)}`);
}

// 根据站点类型查询站点
export async function getStationDataByType() {
  return request(`/proxy/station/list?${stringify({ stationType: 'B,C' })}`);
}
// 根据站点了；类型以及用户信息查询站点
export async function getStationListByType() {
  return request(`/proxy/user/userinfo/location?${stringify({ stationTypes: 'A,B,C,Z' })}`);
}
// 根据ecode查询用户信息
export async function getStationUserByEcode() {
  return request('/proxy/station/getUserInfoByEcode?');
}
// 获取区域列表
export async function getAreaData(params) {
  return request(`/proxy/patrol/area/getAreaListByStation?${stringify(params)}`);
}
// 查询设备
export async function queryAreaEq(params) {
  return request('/proxy/plan/query/equipments?', {
    method: 'POST',
    body: params,
  });
}
// 查询工商户信息
export async function queryAreaGsh(params) {
  return request('/proxy/plan/query/gsh?', {
    method: 'POST',
    body: params,
  });
}
// 获取工单状态
export async function getWorkStatus(params) {
  return request(`/proxy/task/getGDStateList?${stringify(params)}`);
}
// 根据站点id和角色获取责任人列表
export async function getUserDataByRoles(params) {
  return request(`/proxy/station/stationAndRolesUser?${stringify({ ...params, 'roles': 'prenent_maintainer' })}`);
}
export async function getUserDataByStation(params) {
  return request(`/proxy/station/stationUser?${stringify(params)}`);
}
// 获取预防性维护function列表
export async function getFunctionList(params) {
  return request(`/proxy/task/plan/list?${stringify(params)}`);
}
// 获取预防性维护作业类型
export async function getFunctionData(params) {
  return request(`/proxy/config/function/list?${stringify(params)}`);
}
// 获取周期下拉列表
export async function fetchCycleUnit() {
  return request('/proxy/task/plan/cycle/units');
}
// 根据条件查询计划列表
export async function queryPrePlanData(params) {
  return request(`/proxy/plan/list?${stringify({ ...params })}`);
}
// 根据计划id查询计划详情

export async function queryPlanDetaile(params) {
  return request(`/proxy/plan/detail?${stringify({ ...params })}`);
}
// 新建预防性维护常规计划
export async function addPreMaintenPlan(params) {
  return request('/proxy/plan/new/routine', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 新建预防性维护常规计划
export async function addTempPreMaintenPlan(params) {
  return request('/proxy/plan/new/temp', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 编辑计划
export async function editPlan(params) {
  return request('/proxy/plan/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 导入计划前验证
export async function exportPlan(params) {
  return request('/proxy/plan/validate/plans/excel', {
    method: 'POST',
    body: params,
  }, true);
}
// 导入计划
export async function importPlan(params) {
  return request('/proxy/plan/batch/import', {
    method: 'POST',
    body: params,
  }, true);
}
// 删除计划；
export async function delplan(params) {
  return request(`/proxy/prevmaintain/delete?${stringify(params)}`);
}
// 开启计划；
export async function startplan(params) {
  return request(`/proxy/plan/start?${stringify(params)}`);
}
// 停止计划；
export async function stopplan(params) {
  return request(`/proxy/plan/stop?${stringify(params)}`);
}
// 批量删除任务
export async function delTasks(params) {
  return request(`/proxy/task/delete?${stringify(params)}`);
}
// 批量编辑任务
export async function editTasks(params) {
  return request('/proxy/task/edit?', {
    method: 'POST',
    body: params,
  });
}

// 取消任务
export async function cancelTask(params) {
  return request(`/proxy/prevmaintain/cancel?${stringify(params)}`);
}
// 根据任务id查询任务详情
export async function getDetailinfo(params) {
  return request(`/proxy/task/detail?${stringify({ ...params })}`);
}
// 根据条件查询任务列表
export async function queryTasks(params) {
  return request(`/proxy/task/list?${stringify(params)}`);
}
// 根据 计划id 查询任务列表
export async function getTaskListById(params) {
  return request(`/proxy/task/list/by/id?${stringify(params)}`);
}
// 查询领料移动类型
export async function queryMtInfo() {
  return request('/proxy/business/businessType?');
}
// 查询领料公司工厂的信息
export async function queryPlaceInfo() {
  return request('/proxy/business/businessPlace?');
}
export async function queryGysByBukrs(params) {
  return request(`/proxy/material/queryGysByBukrs?${stringify({ ...params })}`);
}
// 查询领料信息
export async function queryMaterialInfo(params) {
  return request(`/proxy/material/findMetaByWlAndFCodePaging?${stringify({ ...params })}`);
}
// 根据工单号查询领料反馈信息
export async function queryMaterialDetaile(params) {
  return request(`/proxy/material/adoptDetailed?${stringify({ ...params })}`);
}
// 保存领料反馈信息
export async function savePickingData(params) {
  return request('/proxy/material/metaReserved?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 保存采购订单信息
export async function savePurchaseOrderInfo(params) {
  return request('/proxy/material/createPurchaseOrder?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 初始化采购订单信息
export async function initPurchaseOrderInfo(params) {
  return request('/proxy/material/findPurchaseOrder?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 保存任务表单反馈内容
export async function saveFormData(params) {
  return request('/proxy/task/feedback', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 保存附件信息
export async function submitAttInfo(params) {
  return request('/proxy/attach/batch/uploadWithEcho', {
    method: 'POST',
    body: params,
  }, true);
}
export async function queryLocation(params) {
  return request(`/proxy/eqLocation?${stringify({ ...params })}`);
}
