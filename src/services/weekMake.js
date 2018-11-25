import { stringify } from 'qs';
import request from '../utils/request';

//查询周计划制定列表
export async function getMakeWeek() {
  return request('/proxy/week/getmakeweek');
}

//根据日期查询周计划制定列表
export async function queryMakeWeek(params) {
  return request(`/proxy/week/getmakeweek?${stringify(params)}`);
}

//查询周计划制定总体情况
export async function getWeekTotal(params) {
  return request('/proxy/week/getweektotal?planId=' + params);
}

//查询周计划制定详细情况
export async function getWeekDetail(params) {
  return request('/proxy/week/getweekdetail?planId=' + params);
}

//查询周计划制定去年信息
export async function getLastyearMonth(params) {
  return request(`/proxy/make/getLastyearMonth?${stringify(params)}`);
}

//查询cng、母站上报信息
export async function getCNGStation(params) {
  return request(`/proxy/week/getCNGStation?${stringify(params)}`);
}

//周计划情况上报
export async function addWeekMake(params) {
  return request('/proxy/week/addWeekMake', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//周计划制定修改
export async function updateWeekMake(params) {
  return request('/proxy/week/updateWeekMake', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//报表导出
export async function exportExcel(params) {
  return request(`/proxy/week/exportExcel?${stringify(params)}`);
}
