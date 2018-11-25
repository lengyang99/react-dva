import { stringify } from 'qs';
import request from '../utils/request';

//查询月计划列表
export async function getMonthList() {
  return request('/proxy/sp/getmonthplan');
}

//根据日期查询月计划列表
export async function queryMonthList(params) {
  return request(`/proxy/sp/getmonthplan?${stringify(params)}`);
}

//查询月计划详情
export async function getMonthDetail(params) {
  return request('/proxy/sp/getmonthplandetail?planId=' + params);
}

//月计划上报
export async function addMonthPlan(params) {
  return request('/proxy/sp/addmonthplan', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//月计划表单修改
export async function updateMonthPlan(params) {
  return request('/proxy/sp/updatemonthplan', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//查询周计划列表
export async function getWeekList() {
  return request('/proxy/sp/getweekplan');
}

//根据日期查询走周划列表
export async function queryWeekList(params) {
  return request(`/proxy/sp/getweekplan?${stringify(params)}`);
}

//查询周计划详情
export async function getWeekDetail(params) {
  return request('/proxy/sp/getweekplandetail?planId=' + params);
}

//周计划上报
export async function addWeekPlan(params) {
  return request('/proxy/sp/addweekplan', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}

//周计划表单修改
export async function updateWeekPlan(params) {
  return request('/proxy/sp/updateweekplan', {
    method: 'POST',
    body: {
      str: JSON.stringify(params),
    },
  });
}