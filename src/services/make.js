import { stringify } from 'qs';
import request from '../utils/request';

//查询月计划制定列表
export async function getMakeMonth() {
  return request('/proxy/make/getmakemonth');
}

//根据日期查询月计划制定列表
export async function queryMakeMonth(params) {
  return request(`/proxy/make/getmakemonth?${stringify(params)}`);
}

//查询月计划制定总体情况
export async function getMonthTotalDetail(params) {
  return request('/proxy/make/getmonthtotaldetail?planId=' + params);
}

//查询月计划制定详细情况
export async function getMonthDetail(params) {
  return request('/proxy/make/getmonthdetail?planId=' + params);
}

//查询月计划制定去年信息
export async function getLastyearMonth(params) {
  return request(`/proxy/make/getLastyearMonth?${stringify(params)}`);
}

//查询cng、母站上报信息
export async function getCNGStation(params) {
  return request(`/proxy/make/getCNG?${stringify(params)}`);
}

//月计划总体情况上报
export async function addMonthMake(params) {
  return request('/proxy/make/addMonthMake', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//月计划制定总体情况修改
export async function updateMonthMake(params) {
  return request('/proxy/make/updateMonthMake', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//报表导出
export async function exportExcel(params) {
  return request(`/proxy/make/exportExcel?${stringify(params)}`);
}