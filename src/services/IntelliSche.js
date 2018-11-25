import {stringify} from 'qs';
import request from '../utils/request';

export async function getSchedulData(params) {
  return request(`/proxy/classManage/znpb/list/?${stringify(params)}`);
}
export async function addSchedulData(params) {
  return request('/proxy/classManage/znpb/add', {
    method: 'POST',
    body: params,
  });
}
// 查站点下的负责人；
export async function queryFeedbackUsers(params) {
  return request(`/proxy/station/stationUser?${stringify(params)}`);
}
// 复制
export async function copySchedulData(params) {
  return request(`/proxy/classManage/znpb/copy?${stringify(params)}`);
}
export async function canCopy(params) {
  return request(`/proxy/classManage/znpb/canCopy?${stringify(params)}`);
}

