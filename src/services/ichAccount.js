import qs from 'qs';
import fetch from '../utils/request';


export async function getledgerDataList(param) {
  return fetch(`/proxy/bp/businessAccount/getLedgerInfos?${qs.stringify(param)}`);
}
export async function queryForm(param) {
  return fetch(`/proxy/engin/getGshInfo?${qs.stringify(param)}`);
}

export async function getConditions() {
  return fetch('/proxy/bp/businessAccount/getConditions');
}

export async function fetchRegulatorList(options) {
  return fetch(`/proxy/ldgr/regulator?${qs.stringify(options)}`);
}

export async function saveRegulator(params) {
  return fetch('/proxy/bp/regulator/saveRegulator', {
    method: 'POST',
    body: params,
  });
}

export async function fetchRegulatorFilter() {
  return fetch('/proxy/ldgr/regulator/filter');
}

