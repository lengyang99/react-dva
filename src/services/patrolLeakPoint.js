import {stringify, parse} from 'qs';
import request from '../utils/request';

//巡检车
export async function queryPatrolLeakPoint(params) {
  return request('/proxy/patrol/leakcar/getLeakCarListByCondition?' + stringify(params));
}

//检漏仪
export async function queryBluetoothPoint(params) {
  return request('/proxy/task/feedback/checkleak/detail?' + stringify(params));
}

