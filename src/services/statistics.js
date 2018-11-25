import {stringify, parse} from 'qs';
import request from '../utils/request';

// 查询关键点巡视
export async function queryKeyPonitList(params) {
  return request(`/proxy/statistics/getStationKeyPointReport?${stringify(params)}`);
}
// 查询站点信息
export async function queryStationList(params) {
  return request(`/proxy/user/userinfo/location/A?${stringify({params})}`);
}
// 查询养护作业列表
export async function queryFunctionList(params) {
  return request(`/proxy/config/function/list?${stringify(params)}`);
}
// 查詢第三方施工
export async function queryThridConList(params) {
  return request(`/proxy/statistics/getDSFReport?${stringify(params)}`);
}
// 查詢养护任务统计
export async function queryMaintaceList(params) {
  return request(`/proxy/statistics/getMaintenanceTaskReport?${stringify(params)}`);
}
// 查詢计分统计api/v1/sop/score/getScoreList
export async function queryScoreCount(params) {
  return request(`/proxy/score/getScoreList?${stringify(params)}`);
}
// 巡线任务统计
export async function getPatrolTaskAnalysis(params) {
  return request(`/proxy/statistics/getPatrolTaskAnalysis?${stringify(params)}`);
}
// 推广：第三方施工统计
export async function getPDSFReport(params) {
  return request(`/proxy/statistics/promotion/getPDSFReport?${stringify(params)}`);
}