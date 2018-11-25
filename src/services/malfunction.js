import qs from 'qs';
import fetch from '../utils/request';

// 获取故障列表
export async function fetchMalList(options) {
  return fetch(`/proxy/failure?${qs.stringify(options)}`);
}

// 新增 or 修改技术列表
export async function postMalfunction(options) {
  return fetch('/proxy/failure', {
    method: 'POST',
    body: options,
  });
}

export async function updateMalfunction(options) {
  return fetch(`/proxy/failure/${options.gid}`, {
    method: 'PUT',
    body: options,
  });
}

// 删除故障
export async function deleteMalfunction(id) {
  return fetch(`/proxy/failure/${id}`, {
    method: 'DELETE',
  });
}

// 获取故障分类列表
export async function fetchMalfunctionFirstOrder() {
  return fetch('/proxy/failure/root');
}

// 更新故障激活状态
export async function updateMalfunctionActive(options) {
  return fetch(`/proxy/failure/${options.id}/active`, {
    method: 'PUT',
    body: parseInt(options.active, 10),
  });
}
