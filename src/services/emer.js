import {stringify, parse} from 'qs';
import request from '../utils/request';

export async function getEmerEvent(params) {
  return request(`/proxy/emer/event/getEmerEvent?${  stringify(params)}`);
}

export async function getEmerEventType(params) {
  return request(`/proxy/emer/event/getEmerEventType?${  stringify(params)}`);
}

export async function addEmerEvent(params) {
  return request('/proxy/emer/event/addEmerEvent?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function saveEmerEventPreDisposal(params) {
  return request(`/proxy/emer/event/saveEmerEventPreDisposal?${  stringify(params)}`);
}

export async function closeEmerEvent(params) {
  return request(`/proxy/emer/closeEmerEvent?${  stringify(params)}`);
}

export async function getEmerPlan(params) {
  return request(`/proxy/emer/plan/getEmerPlan?${  stringify(params)}`);
}

export async function addEmerStart(params) {
  return request('/proxy/emer/addEmerStart?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function addEmerOrder(params) {
  return request('/proxy/emer/order/addEmerOrder?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function getEmerHandleProcessRecord(params) {
  return request(`/proxy/emer/getEmerHandleProcessRecord?${  stringify(params)}`);
}

export async function getEmerStart(params) {
  return request(`/proxy/emer/getEmerStart?${  stringify(params)}`);
}

export async function getEmerPlanAttachedFileList(params) {
  return request(`/proxy/attach/selectFileInfoListByIds?${  stringify(params)}`);
}

export async function getEmerOrder(params) {
  return request(`/proxy/emer/order/getEmerOrder?${  stringify(params)}`);
}

export async function getEmerOrderType(params) {
  return request(`/proxy/emer/order/getEmerOrderType?${  stringify(params)}`);
}

export async function delEmerPlan(params) {
  return request(`/proxy/emer/plan/delEmerPlan?${  stringify(params)}`);
}

export async function addEmerPlan(params) {
  return request('/proxy/emer/plan/addEmerPlan?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function updateEmerPlan(params) {
  return request('/proxy/emer/plan/editEmerPlan?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function getEmerPlanType(params) {
  return request(`/proxy/emer/plan/getEmerPlanType?${  stringify(params)}`);
}
export async function getEmerProcessType(params) {
  return request(`/proxy/emer/getLatestEmerProcess?${  stringify(params)}`);
}

export async function addEmerOrganization(params) {
  return request('/proxy/emer/organization/addEmerOrganization?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function getEmerMaterial(params) {
  return request(`/proxy/material/stockSearch?${  stringify(params)}`);
}

export async function getEmerMaterialHouse(params) {
  return request(`/proxy/emer/material/getEmerMaterialHouse?${  stringify(params)}`);
}

export async function getEmerMaterialFactory(params) {
  return request(`/proxy/emer/material/getEmerMaterialFactory?${  stringify(params)}`);
}

export async function getLiveVideo(params) {
  return request(`/proxy/emer/getEmerVideo?${  stringify(params)}`);
}

export async function getEmerOrderList(params) {
  return request(`/proxy/emer/order/getEmerOrderList?${  stringify(params)}`);
}

export async function saveEmerReport(params) {
  return request('/proxy/emer/report/saveEmerReport?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function addEmerReport(params) {
  return request('/proxy/emer/report/addEmerReport?', {
    method: 'POST',
    body: params,
  }, true);
}

export async function coorsBdToLocal(params) {
  return request(`/localToBaidu/ServiceEngine/rest/services/TransDataServer/coortranst?${  stringify(params)}`);
}

export async function coorsLocalToBd(params) {
  return request(`/localToBaidu/ServiceEngine/rest/services/TransDataServer/coortranst?${  stringify(params)}`);
}

export async function getLine(params) {
  return request(`/pipeClick/arcgis/rest/services/xagis/lfgw_bd/MapServer/identify?${  stringify(params)}`);
}

export async function squibAnalysis(params) {
  return request(`/localToBaidu/ServiceEngine/rest/services/NetServer/bdgw/PipeAnalyse/accident?${  stringify(params)}`);
}

export async function searchByLocation(params) {
  return request(`/baiduMap/place/v2/search?${  stringify(params)}`);
}

export async function getLocationByIp(params) {
  return request(`/baiduMap/location/ip?${  stringify(params)}`);
}

export async function getController(params) {
  return request(`/proxy/emer/location/getController?${  stringify(params)}`);
}
export async function getEmerExpert(params) {
  return request(`/proxy/emer/expert/getEmerExpert?${  stringify(params)}`);
}
export async function addEmerExpert(params) {
  return request('/proxy/emer/expert/addEmerExpert?', {
    method: 'POST',
    body: params,
  }, true);
}
export async function updateEmerExpert(params) {
  return request(`/proxy/emer/expert/updateEmerExpert?${  stringify(params)}`);
}
export async function delEmerExpert(params) {
  return request(`/proxy/emer/expert/delEmerExpert?${  stringify(params)}`);
}

export async function getEmerDrillCase(params) {
  return request(`/proxy/emer/event/getEmerDrillCase?${  stringify(params)}`);
}

export async function getDetectionMessage(params) {
  return request(`/proxy/emer/location/getDetectionMessage?${  stringify(params)}`);
}

export async function sendRecoverGasSupplyNotice(params) {
  return request(`/proxy/emer/sendRecoverGasSupplyNotice?${  stringify(params)}`);
}


export async function sendStopGasNotice(params) {
  return request(`/proxy/emer/sendStopGasNotice?${  stringify(params)}`);
}

export async function getWeatherInfo(params) {
  return request(`/weatherData/webapp/weather/getWeatherInfo?${  stringify(params)}`);
}

export async function getEmerControlArea(params) {
  return request(`/proxy/emer/getEmerControlArea?${  stringify(params)}`);
}
// 清空新建预案 组织信息
export async function resetData(params) {
  return request(`/proxy/emer/plan/delTempOrg?${stringify(params)}`);
}

// 新建预案 查询组织人员信息
export async function queryOrganizationUsers(params) {
  return request(`/proxy/emer/location/getEmerSceneController?${ stringify(params)}`);
}

// 险情分类数据；
export async function getDangerType(params) {
  return request(`/proxy/emer/event/getEmerDangerType?${ stringify(params)}`);
}
