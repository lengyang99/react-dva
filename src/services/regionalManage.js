/**
 * Created by hexi on 2017/11/21.
 */
// import { stringify,parse } from 'qs';
import request from '../utils/request';
import { stringify } from 'querystring';

export async function getAreaStationInfo() {
  return request('/proxy/patrol/area/getAreaListByCodeAndEcode', {
    method: 'GET',
  });
}
export async function getStationInfo() {
  return request('/proxy/station/list?stationType=A', {
    method: 'GET',
  });
}

export async function getAreaByStationid(station, code) {
  return request(`/proxy/patrol/area/getAreaListByStation?stationid=${station}&code=${code}`, {
    method: 'GET',
  });
}

export async function deleteArea(areaid) {
  return request(`/proxy/patrol/area/delete?gid=${areaid}`, {
    method: 'GET',
  });
}

export async function getAllUserInfo(params) {
  return request(`/proxy/station/userlist?stationType=A&stationCode=${params}`, {
    method: 'GET',
  });
}

export async function getAreaInfoByGid(gid) {
  return request(`/proxy/patrol/area/getAreaInfoByGid?gid=${gid}`, {
    method: 'GET',
  });
}

export async function updateArea(params) {
  return request('/proxy/patrol/area/update', {
    method: 'POST',
    body: params
  });
}

export async function insertArea(params) {
  return request('/proxy/patrol/area/insert', {
    method: 'POST',
    body: params
  });
}

export async function getBustypeInfo() {
  return request(`/proxy/patrol/type/getPlanAreaBusTypeListByEcode`, {
    method: 'GET',
  });
}

export async function insertBustype(params) {
  return request('/proxy/patrol/type/insert', {
    method: 'POST',
    body: params
  });
}

export async function getStationByBustype(code) {
  return request(`/proxy/patrol/area/getAreaListByCodeAndEcode?code=${code}`, {
    method: 'GET',
  });
}

export async function getAreaByBusType(gid, code) {
  return request(`/proxy/patrol/area/getAreaListByBusType?stationid=${gid}&code=${code}`, {
    method: 'GET',
  });
}

export async function getGroupsTreeByUserId(userid) {
  return request(`/proxy/user/getGroupsTree?userid=${userid}`, {
    method: 'GET',
  });
}

export async function getUserByGroupId(params) {
  return request(`/proxy/user/queryUser?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function getUsersByOrgCode(orgcode) {
  return request(`/proxy/user/getUsersByOrgCode?orgCode=${orgcode}`, {
    method: 'GET',
  });
}

export async function insertAreaForBusType(params) {
  return request(`/proxy/patrol/area/insertAreaForBusType?${stringify(params)}`);
}

export async function deleteAreaForBusType(params) {
  return request(`/proxy/patrol/area/delete?${stringify(params)}`);
}

export async function queryStation(params) {
  return request(`/proxy/station/getStationAndGridList?stationType=A${stringify(params)}`);
}
//复制区域
export async function copeArea(params) {
  return request(`/proxy/patrol/area/copyExecutionArea?${stringify(params)}`);
}

//检查该一级区域是否已经创建
export async function areaIsExist(params) {
  return request(`/proxy/patrol/area/areaIsExist?${stringify(params)}`);
}

//复制一级区域
export async function copyParentArea(params) {
  return request(`/proxy/patrol/area/copyArea?${stringify(params)}`,{
    method: 'GET',
  });
}
