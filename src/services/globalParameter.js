import qs from 'qs';
import fetch from '../utils/request';

// 查询模块列表
export async function queryModuleList() {
  return fetch('/proxy/bms/module');
}

// 查询参数列表
export async function queryParameterList(params) {
  return fetch(`/proxy/bms/sop/config?${qs.stringify(params)}`);
}

// 增加参数
export async function addParameter(params) {
  return fetch('/proxy/bms/sop/config', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

// 删除参数
export async function deleteParameter(gid) {
  return fetch(`/proxy/bms/sop/config/${gid}`, {
    method: 'DELETE',
  });
}

// 编辑参数
export async function editParameter(params) {
  return fetch(`/proxy/bms/sop/config/${params.gid}`, {
    method: 'PUT',
    body: {
      ...params.record,
    },
  });
}

// 条件查询参数列表
export async function queryParameterListByGID(params) {
  return fetch(`/proxy/bms/sop/config/${params}`);
}
