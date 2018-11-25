/**
 * Created by hexi on 2017/11/22.
 */
import { stringify, parse } from 'qs';
import request from '../utils/request';

export async function getFormData(params) {
  return request(`/proxy/event/getEventForm?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function getWoFormData(params) {
  return request(`/proxy/fieldwork/process/getStartFormData?${stringify(params)}`, {
    method: 'GET',
  });
}

export async function reportFormEvent(params) {
  return request('/proxy/event/reportFormEvent', {
    method: 'POST',
    body: params,
  });
}
// 上报计划性维护工单 modify -ly
export async function reportTaskFormEvent(params) {
  return request('/proxy/event/reportTaskFormEvent', {
    method: 'POST',
    body: params,
  });
}

export async function submitWoPlanForm(params) {
  return request('/proxy/event/startProcessForCZHandle', {
    method: 'POST',
    body: {...params},
  });
}

export async function submitAttInfo(params) {
  return request('/proxy/attach/batch/uploadWithEcho', {
    method: 'POST',
    body: params,
  }, true);
}

//危险作业创建
export async function dangerWork(params) {
  return request(`/proxy/approve/dangerWork?`, {
    method: 'POST',
    body: params,
  }, true);
}

//查询人的全部信息
export async function getUserName(params) {
  return request(`/proxy/user/getUsersByUsernames?usernames=${params}`, {
    method: 'GET',
  });
}

