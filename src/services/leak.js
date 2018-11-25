import { stringify } from 'qs';
import request from '../utils/request';

export async function queryStationUsers(params) {
  return request(`/proxy/station/stationUser?${stringify(params)}`);
}

export  async function queryLeakPlanData(params) {
  return request(`/proxy/plan/list?${stringify(params)}`);
}

export  async function getTaskList(params) {
  // return request(`/proxy/task/station/plans?${stringify(params)}`);
  return request(`/proxy/task/list?${stringify(params)}`);
}

//管网捡漏添加计划
export async function addLeakTempPlan(params) {
  return request('/proxy/plan/new/temp', {
    method: 'POST',
    body: params,
  });
}
