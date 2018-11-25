import { stringify } from 'qs';
import request from '../utils/request';

// 查询气质组分列表
export async function getQzzfData(params) {
  return request(`/proxy/station/qzzf/list?${stringify(params)}`);
}
// 添加气质组分列表
export async function addQzzfData(params) {
  return request('/proxy/station/qzzf/add?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 编辑气质组分列表
export async function updateQzzfData(params) {
  return request('/proxy/station/qzzf/update?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
export async function addAttach(params) {
  for (const value of params.values()) {
    console.log(value);
  }
  return request('/proxy/station/qzzf/addFile', {
    method: 'POST',
    body: params,
  }, true);
}

