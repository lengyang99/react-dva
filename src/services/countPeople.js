import { stringify } from 'qs';
import request from '../utils/request';

export async function tableQueryLogin(params) {
  return request(`/proxy/log/loginCount?${stringify(params)}`);
}

export async function tableQuery(params) {
  return request(`/proxy/log/loginStat?${stringify(params)}`);
}

