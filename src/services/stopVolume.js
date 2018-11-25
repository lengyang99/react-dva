import { stringify } from 'qs';
import request from '../utils/request';

//查询列表
export async function getList(params) {
  return request(`/proxy/stopgas/getStopGasListByCondition?${stringify(params)}`);
}

export async function getType() {
  return request('/proxy/stopgas/getAllType');
}