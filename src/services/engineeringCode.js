import { stringify } from 'qs';
import request from '../utils/request';

export async function queryData(params) {
  return request(`/proxy/engin/prolist?${stringify(params)}`);
}

