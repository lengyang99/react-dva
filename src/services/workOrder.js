import {stringify, parse} from 'qs';
import request from '../utils/request';

// http://10.2.66.204:1112/
// http://backend-service-sop-zhyytest.ipaas.enncloud.cn:16762/"

export async function selectFieldworkList(params) {
  // processInstanceId=125020
  return request(`/proxy/fieldwork/query/selectFieldworkList?${stringify(params)}`);
}
export async function queryInstanceTasks(params) {
  // processInstanceId=125020
  return request(`/proxy/fieldwork/query/queryInstanceTasks?${stringify(params)}`);
}
export async function processlist(params) {
  // processInstanceId=125020
  return request(`/proxy/fieldwork/query/processlist?${stringify(params)}`);
}
export async function processVerlist(params) {
  // processInstanceId=125020
  return request(`/proxy/fieldwork/query/processDGList?${stringify(params)}`);
}
export async function detailtab(params) {
  // formid=10050001
  return request(`/proxy/fieldwork/query/detailtab?${stringify(params)}`);
}
export async function getApproiseDetail(params) {
  // formid=10050001
  return request(`/proxy/fieldwork/woController/getPatrolControlDetailInfo?${stringify(params)}`);
}
export async function getOneDetail(params) {
  return request(`/proxy${params}`);
}
export async function getUserTask(params) {
  // processInstanceId=152508&assignee=1&plat=web
  return request(`/proxy/fieldwork/process/getUserTask?${stringify(params)}`);
}
export async function getTaskFormData(params) {
  // taskId=267561&taskType=task&taskCode=&userid=1
  return request(`/proxy/fieldwork/process/getTaskFormData?${stringify(params)}`);
}

export async function getApproiseFormData(params) {
  return request(`/proxy/fieldwork/woController/getFormData?${stringify(params)}`);
}

export async function getDetailFormByPro(params) {
  return request(`/proxy/fieldwork/woController/getDetailFormByPro?${stringify(params)}`);
}

export async function submitApproiseData(params) {
  return request('/proxy/fieldwork/woController/addLeaderAppraise', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function submitTaskFormData(params) {
  // taskId=152550&taskType=task&taskCode=&userid=1&properties=&user=&isSave=0
  // return request('/proxy/fieldwork/process/submitTaskFormData?' + stringify(params));
  return request('/proxy/fieldwork/process/submitTaskFormData', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function submitAttInfo(params) {
  return request('/proxy/attach/batch/uploadWithEcho', {
    method: 'POST',
    body: params,
  }, true);
}

export async function selectFieldworkByProcessinstancedid(params) {
  return request(`/proxy/fieldwork/query/selectFieldworkByProcessinstancedid?${stringify(params)}`);
}

export async function getWoPlanWorkorderList(params) {
  return request(`/proxy/fieldwork/query/selectWoPlanList?${stringify(params)}`);
}

export async function getStartFormData(params) {
  return request(`/proxy/fieldwork/process/getStartFormData?${stringify(params)}`);
}

export async function getWorkorderListByFunName(params) {
  const option = {};
  if (params.f === 'excel') {
    option.headers = {
      'Content-Type': 'application/vnd.ms-excel;charset=gb2312',
    };
  }
  return request(`/proxy/fieldwork/query/getWorkorderListByFunName?${stringify(params)}`);
}

export async function submitStartFormData(params) {
  return request('/proxy/fieldwork/process/submitStartFormData', {
    method: 'POST',
    body: params,
  });
}

export async function getWorkorderFormData(params) {
  return request(`/proxy/fieldwork/query/getWorkorderFormData?${stringify(params)}`);
}

