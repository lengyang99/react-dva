import qs from 'qs';
import request from '../utils/request';

// 获取表具信息详情
export const getIchAccountDetail = (account) => {
  return request(`/proxy/bp/businessAccount/getTableInfos?${qs.stringify(account)}`);
};
// 获取字典表
export async function getConditions() {
  return request('/proxy/bp/businessAccount/getConditions');
}
// 更新基本信息
export async function updateUserDetail(params) {
  return request(`/proxy/bp/businessAccount/update?${qs.stringify(params)}`);
}

// 安检记录查询
export async function fetchSecurityRecordList(params) {
  return request(`/proxy/gshMeterSafe/meterSafeInfos?${qs.stringify(params)}`);
}

// 查询指定工商户调压器关系
export async function queryRegulator(params) {
  return request(`/proxy/bp/regulator/queryRegulator?${qs.stringify(params)}`);
}

// 删除指定工商户调压器关系
export async function deleteRegulator(params) {
  return request(`/proxy/bp/regulator/deleteRegulator?${qs.stringify(params)}`, {
    method: 'DELETE',
  });
}

// 工商户详情
export async function fetchIchAccountDetail(params) {
  return request(`/proxy/gshEqptFind/findGshInfoById?${qs.stringify(params)}`);
}

// 表具信息
export async function fetchMeters(param) {
  return request(`/proxy/gshEqptFind/findBjByAccount?${qs.stringify(param)}`);
}

// 工商户新增自定义属性
export async function addGshCustomInfo(param) {
  return request(`/proxy/gshEqptFind/addGshCustomInfo?${qs.stringify(param)}`);
}

// 工商户编辑自定义属性
export async function editGshCustomInfo(param) {
  return request(`/proxy/gshEqptFind/editGshCustomInfo?${qs.stringify(param)}`);
}

// 工商户删除自定义属性
export async function delGshCustomInfo(param) {
  return request(`/proxy/gshEqptFind/delGshCustomInfo?${qs.stringify(param)}`);
}

// 更新工商户-运营平台属性信息
export async function editGsh(param) {
  return request(`/proxy/gshEqptFind/editGsh?${qs.stringify(param)}`);
}