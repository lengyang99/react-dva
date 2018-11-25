import {stringify} from 'qs';
import request from '../utils/request';
// 查询计划性台帐列表
export async function queryPlanMaintainLedgerList2(param) {
  return request(`/proxy/plan/query/account?${stringify(param)}`);
}
// 编辑计划性台帐列表
export async function editPlanMaintainLedger(params) {
  return request('/proxy/plan/account/edit?', {
    method: 'POST',
    body: {
      params: JSON.stringify(params),
    },
  });
}
export async function queryPlanMaintainLedgerList(param) {
  return request(`/proxy/config/work/standard/list?${stringify(param)}`);
}
// 查询维护历史列表
export async function queryMaintainHistoryList(params) {
  return request(`/proxy/task/list?${stringify(params)}`);
}
// 查询维护历史详情
export async function getDetailinfo(params) {
  return request(`/proxy/task/detail?${stringify({ ...params })}`);
}
