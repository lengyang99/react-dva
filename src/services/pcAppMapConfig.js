import qs from 'qs';
import fetch from '../utils/request';


export async function getEcodeList(param) {
  return fetch(`/proxy/bms/ecode?${qs.stringify(param)}`);
}

export async function getMapTpkList(param) {
  return fetch(`/proxy/bms/map/queryTPKInfo/${param}`);
}

export async function getList(param) {
  return fetch(`/proxy/bms/map/config?${qs.stringify(param)}`);
}

export async function addList(param) {
  return fetch('/proxy/bms/map/config', {
    method: 'POST',
    body: param,
  });
}

export async function deleteList(id) {
  return fetch(`/proxy/bms/map/config/${id}`, {
    method: 'DELETE',
  });
}

export async function modifyList(param) {
  return fetch(`/proxy/bms/map/config/${param.gid}`, {
    method: 'PUT',
    body: param,
  });
}
