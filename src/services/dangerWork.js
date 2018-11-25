import {stringify, parse} from 'qs';
import request from '../utils/request';

// http://10.2.66.204:1112/
// http://backend-service-sop-zhyytest.ipaas.enncloud.cn:16762/"

export async function getOneDetail(params) {
  return request(`/proxy${params}`);
}

//查询危险作业计划
export async function dangerWorkList(params) {
  return request(`/proxy/dangerWork/getAllDangerWorksInfo?${stringify(params)}`);
}
//查询危险作业详情
export async function dangerWorDetail(params) {
  return request(`/proxy/dangerWork/getAllDangerWorkDetail?${stringify(params)}`);
}

//编辑危险作业数据
export async function dangerWorEdit(params) {
  return request(`/proxy/dangerWork/getDangerWorkEditDetail?${stringify(params)}`);
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

