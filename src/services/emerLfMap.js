import { stringify } from 'qs';
import request from '../utils/request';

// lfMap.jsx
export async function getEmerEvent(params) {
  return request(`/proxy/emer/event/getEmerEvent?${stringify(params)}`);
}
export async function getEmerStart(params) {
  return request(`/proxy/emer/getEmerStart?${stringify(params)}`);
}
export async function send(params) {
  return request('/sendSms/sms/send', {
    method: 'POST',
    body: params,
  }, true);
}
export async function getEmerModeConf(params) {
  return request(`/proxy/emer/conf/getEmerModeConf?${stringify(params)}`);
}
export async function endEmer(params) {
  return request(`/proxy/emer/endEmer?${stringify(params)}`);
}
export async function getEmerReport(params) {
  return request(`${params.url}?${stringify(params.payload)}`);
}
export async function getcarlastposition(params) {
  return request(`/proxy/emer/location/getcarlastposition?${stringify(params)}`);
}
export async function getDatas(params) {
  return request(`${params.url}?${stringify(params.payload)}`);
}
export async function detectionMessage(params) {
  return request(`/proxy/detection/detectionMessage?${stringify(params)}`);
}
export async function deleteOrganization(params) {
  return request(`/proxy/emer/organization/delEmerOrganization?${stringify(params)}`);
}
export async function updateOrganization(params) {
  return request('/proxy/emer/organization/editEmerOrganization',{
    method: 'POST',
    body: params,
  }, true);
}
export async function getManyUserPosition(params) {
  return request(`/proxy/user/getManyUserPosition?${stringify(params)}`);
}
export async function getManyUserCurrentPosition(params) {
  return request(`/proxy/position/getManyUserCurrentPosition?${stringify(params)}`);
}
export async function v2(params) {
  return request(`/baiduMap/geocoder/v2/?${stringify(params)}`);
}
export async function baiduVista(params) {
  return request(`/baiduVista/?${stringify(params)}`);
}
export async function identify(params) {
  return request(`${params.url}?${stringify(params.payload)}`,{
    method:'GET',
  }, false, true);
}
export async function getBaiduWay(params) {
  return request(`/mapBaidu/?${stringify(params)}`);
}
// Resources.js
export async function getAllResources(params) {
  return request(`/proxy/emer/location/getlastposition?${stringify(params)}`);
}
export async function getUsers(params) {
  return request(`/proxy/emer/location/getEmerSceneController?${stringify(params)}`);
}
export async function callUp(params) {
  return request(`/proxy/emer/netcall?${stringify(params)}`);
}
export async function getGlobalPhone(params) {
  return request(`/proxy/emer/getGlobalPhone?${stringify(params)}`);
}
export async function updateSceneControlPlan(params) {
  return request('/proxy/emer/updateSceneControlPlan', {
    method: 'POST',
    body: params,
  }, true);
}
export async function makeSureSceneControlPlan(params) {
  return request(`/proxy/emer/confirmSceneControlPlan?${stringify(params)}`);
}
export async function emerVerify(params) {
  return request('/proxy/emer/event/dangerConfirm', {
    method: 'POST',
    body: params,
  }, true);
}
export async function changeCurrentEmerEvent(params) {
  return request(`/proxy/emer/changeCurrentEmerEvent?${stringify(params)}`);
}
// 资源准备情况
export async function getRes(params) {
  return request(`/proxy/emer/location/getEmerOrgUsersPosition?${stringify(params)}`);
}
// 查询当前点击事件详情；
export async function getCurrentEmerEvent(params) {
  return request(`/proxy/emer/event/getEmerEvent?${stringify(params)}`);
}
// 获取模版配置信息
export async function getEmerTemplateConf(params){
  return request(`/proxy/emer/conf/getEmerTemplateConf?${stringify(params)}`);
}

