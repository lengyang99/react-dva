import {stringify, parse} from 'qs';
import request from '../utils/request';

export async function getDepartmentData(params) {
  return request('/proxy/station/list?' + stringify(params));
}


