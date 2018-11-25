import qs from 'qs';
import fetch from '../utils/request';

export async function queryEnumTypeSelectData(options) {
  return fetch('/proxy/eqCodes/8006');
}

export async function editProperty(property) {
  return fetch('/proxy/eqClassSpec', {
    method: 'POST',
    body: { ...property },
  });
}

export async function deleteProperty(gid) {
  return fetch(`/proxy/eqClassSpec/${gid}`, {
    method: 'DELETE',
  });
}

export async function queryProperty(options) {
  return fetch(`/proxy/eqClassSpec?${qs.stringify(options)}`);
}

export async function queryEquipment(options) {
  return fetch(`/proxy/ldgr?${qs.stringify(options)}`);
}

export async function editEnum(property) {
  return fetch('/proxy/eqClassSpecEnum', {
    method: 'POST',
    body: { ...property },
  });
}

export async function deleteEnum(gid) {
  return fetch(`/proxy/eqClassSpecEnum/${gid}`, {
    method: 'DELETE',
  });
}

export async function queryEnum(classspecGid) {
  return fetch(`/proxy/eqClassSpecEnum/${classspecGid}`);
}
