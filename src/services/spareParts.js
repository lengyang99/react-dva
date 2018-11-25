import { stringify } from 'qs';
import request from '../utils/request';

//查询列表
export async function getList(params) {
  return request(`/proxy/material/findMetaByCondition?${stringify(params)}`);
}

export async function getFactory() {
  return request('/proxy/business/findFac');
}