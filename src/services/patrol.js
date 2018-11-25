import { stringify, parse } from 'qs';
import request from '../utils/request';

// const BaseURL = 'http://10.39.21.38:1112';
// const BaseURL='http://localhost:8088/ServiceEngine/rest/services/CSProjectServer';

export async function queryAreaData(params) {
  return request('/proxy/patrol/area/getAreaListByStation?' + stringify(params));
}
export async function queryUsernamesData(params) {
  return request('/proxy/user/getUserPosition?' + stringify(params));
}
export async function queryLayerData() {
  return request('/proxy/patrol/layer/getPatrolLayerList');
}
export async function queryPatrolTaskDetailData(params) {
  return request('/proxy/patrol/task/selectTaskInfoByGid?' + stringify(params));
}

//分开查询设备管段数据
export async function queryPatrolDetailData(params) {
  return request('/proxy/patrol/task/getTaskInfo?' + stringify(params));
}

export async function insertPatrolPlan(params) {
  return request('/proxy/patrol/plan/insert', {
    method: 'POST',
    body: params,
  });
}
export async function updatePatrolPlan(params) {
  return request('/proxy/patrol/plan/update', {
    method: 'POST',
    body: params,
  });
}
export async function queryPatrolPlanData(params) {
  return request('/proxy/patrol/plan/selectPlanListByCondition?' + stringify(params));
}
export async function queryStationData(params) {
  return request(`/proxy/user/userinfo/location/${params.stationType}`);
}
export async function changePatrolPlanState(params) {
  return request('/proxy/patrol/plan/updateState?' + stringify(params));
}
export async function deletePatrolPlan(params) {
  return request('/proxy/patrol/plan/delete?' + stringify(params));
}
export async function queryPatrolTaskData(params) {
  return request('/proxy/patrol/task/selectTaskListByCondition?' + stringify(params));
}
export async function queryPointsByAreaAndLayer(areaid, layerid, params) {
  return request(`/map/rest/services/NetServer/lfgw/${layerid}/query?` + stringify(params));
}
export async function getKeypointsByAreaid(params) {
  return request(`/proxy/patrol/area/getKeypointsByAreaid?` + stringify(params));
}
//管道数据
// export async function querypipeData(layerid, params) {
//   const {ecode} = params
//   return request(`/proxy/gis/${ecode}/pipenet/MapServer/${layerid}/query?` + stringify(params));
// }

export async function querypipeData(layerid, params) {
  const { ecode } = params
  return request(`/proxy/gis/${ecode}/pipenet/MapServer/${layerid}/query`, {
    method: 'POST',
    body: params,
  });
}
//设备数据
// export async function queryEqData(layerid, params) {
//   const {ecode} = params;
//   return request(`/proxy/gis/${ecode}/pipenet/MapServer/${layerid}/query?` + stringify(params));
// }

export async function queryEqData(layerid, params) {
  const { ecode } = params
  return request(`/proxy/gis/${ecode}/pipenet/MapServer/${layerid}/query`, {
    method: 'POST',
    body: params,
  });
}
//巡视计划周期
export async function querypatrolCycle(layerid, params) {
  return request(`/proxy/patrol/cycle/selectCycleList?` + stringify(params));
}
//获取元数据id
export async function getMetadata(params) {
  return request(`/proxy/gis/${params.ecode}/pipenet/MapServer/metas?serverType=3`);
}

export async function delTaskByGid(gid) {
  return request(`/proxy/patrol/task/deleteTask?gid=${gid}`);
}
export async function transferTask(params) {
  return request(`/proxy/patrol/task/handoverTask`, {
    method: 'POST',
    body: params,
  });
}
export async function getPatrolDeviceFeedbackInfo(feedbackid, groupid) {
  return request(`/proxy/patrol/task/getFeedbackInfoByid?feedbackid=${feedbackid}&groupid=${groupid}`);
}
export async function getUserInfoByStationCode(stationCode) {
  // return request(`/proxy/station/userlistByStationCode?stationCode=${stationCode}`);
  return request(`/proxy/user/getUserOrg?userid=${stationCode}`);
}
/*
  生成任务
 */
export async function generatePlans(param) {
  return request(`/proxy/patrol/plan/generateTask?${stringify(param)}`);
}

//巡视计划编辑
export async function insertPatrolPlanEdit(param) {
  return request(`/proxy/patrol/plan/update`, {
    method: 'POST',
    body: param,
  });
}

//获取行走方式
export async function getWalkWay(param) {
  return request(`/proxy/patrol/speed/queryListByEcode?${stringify(param)}`);
}

// 巡视任务周期（返回周期的name）
export async function queryPlanCycleList(param) {
  return request(`/proxy/patrol/cycle/queryPlanCycleList?${stringify(param)}`);
}