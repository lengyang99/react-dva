import {stringify, parse} from 'qs';
import request from '../utils/request';
import {getCurrTk} from '../utils/utils';

//数据来源
export async function getDataSource() {
  return request(`/proxy/detection/data/source`);
}

//值类型
export async function getDataType() {
  return request('/proxy/detection/value/type');
}

//设备检测列表；
export async function getMonitorList(params) {
  return request(`/proxy/detection/list?${stringify(params)}`);
}

//设备检测单位；
export async function getDataUnit(params) {
  return request(`/proxy/detection/unit?${stringify(params)}`);
}

//查询计划详情;
export async function getMonitorDetail(params) {
  return request(`/proxy/detection/detail?${stringify(params)}`);
}

//删除计划
export async function delMonitorData(params) {
  return request(`/proxy/detection/delete?${stringify(params)}`);
}

//设备检测新建；
export async function newPlan(params) {
  return request('/proxy/detection/new', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

//区域排序；
export async function changeSort(params) {
  return request('/proxy/station/area/order', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}