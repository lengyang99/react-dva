import { stringify,parse } from 'qs';
import request from '../utils/request';

// const BaseURL = 'http://10.39.21.38:1112';
// const BaseURL='http://localhost:8088/ServiceEngine/rest/services/CSProjectServer';

export async function getFunction() {
  return request(`/proxy/task/function/list?group=net`);
}

export async function getCardInfo() {
  return request(`/proxy/task/task/card/list`);
}

export async function getCardDetail(params) {
  return request('/proxy/task/task/list/group?' + stringify(params));
}

export async function getDetailinfo(params) {
  return request('/proxy/task/task/detail?' + stringify(params));
}

//查询设备坐标点；
export async function getCardDetailPoint(params) {
  return request(`/proxy/task/task/list/group2?` + stringify(params));
}
