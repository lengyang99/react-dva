import {stringify} from 'qs';
import request from '../utils/request';
import {getCurrTk} from '../utils/utils';

export async function fetchAccountLogin(params) {
  return request(`/proxy/user/login?${stringify(params)}`,{},false,true);
}
export async function fetchAccountLogout(params) {
  return request(`/proxy/user/logout?${stringify(params)}`);
}
export function getAttachUrl(id) {
  return `/proxy/attach/downloadFile?id=${id}&token=${getCurrTk()}`;

}

export async function baiDuAddrSearch(params) {
  return request(`/mapBaidu?newmap=1&reqflag=pcmap&biz=1&from=webmap&qt=s&da_src=pcmappg.searchBox.button&src=0&wd2=&sug=0&l=11&from=webmap&tn=B_NORMAL_MAP&nn=0&ie=utf-8&t=1515117011662&${stringify(params)}`);
}

export async function transData(params) {
  return request(`/transData/TransDataServer/coortrans?${stringify(params)}`);
}

export async function fetchMonitorData(params) {
  return request(`/proxy/emer/location/getDetectionMessage?${stringify(params)}&token=${getCurrTk()}`);
}

export async function queryMaterialInfo(params) {
  return request(`/proxy/material/findMetaByWlAndFCodePaging?${stringify(params)}`);
}

export async function getAreaOrgTree(params) {
   return request(`/proxy/user/getAreaOrgTree?${stringify(params)}`,{},false,false,false,true,false);
}
// 获取所属组织列表
export async function getGroupsTree(params) {
   return request(`/proxy/user/getGroupsTree?${stringify(params)}`);
}
//墨卡托坐标转百度坐标
export async function translateMtoB(params) {
  return request(`/transData/TransDataServer/coortrans?fromSRID=Mercator&toSRID=BAIDU&${stringify(params)}`);
}
