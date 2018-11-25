import { stringify } from 'qs';
import fetch from '../utils/request';

export function fetchIntegralList(option) {
  return fetch(`/proxy/bms/queryStatConfig?${stringify(option)}`);
}

export function fetchUnitList() {
  return fetch('/proxy/bms/statUnit/queryStatUnit');
}

export function fetchCompanyList() {
  return fetch('/proxy/bms/ecode');
}

export function postIntegral(options) {
  return fetch('/proxy/bms/saveStatConfig', {
    method: 'POST',
    body: options,
  });
}

export function deleteIntegral(gid) {
  return fetch(`/proxy/bms/deleteStatConfig/${gid}`, { method: 'DELETE' });
}

export function updateIntegral({ gid, ...detail }) {
  return fetch(`/proxy/bms/updateStatConfig/${gid}`, {
    method: 'PUT',
    body: detail,
  });
}
