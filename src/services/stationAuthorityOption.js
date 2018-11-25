import { stringify } from 'qs';
import fetch from '../utils/request';

export function getAuthList(option) {
  return fetch(`/proxy/bms/multiSiteConfigure/queryUserLocationInfo?${stringify(option)}`);
}

export function deleteAuth(userID) {
  return fetch(`/proxy/bms/multiSiteConfigure/deleteMultiSiteConfig/${userID}`, {
    method: 'DELETE',
  });
}

export function updateAuth({ gid, ...body }) {
  return fetch(`/proxy$/${gid}`, {
    method: 'Update',
    body,
  });
}

export function fetchLocationTree() {
  return fetch('/proxy/bms/multiSiteConfigure/queryLocationTree');
}

// 获取站点列表
export async function fetchSiteList() {
  return fetch('/proxy/ldgr/site');
}
