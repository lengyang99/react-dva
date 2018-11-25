import {stringify} from 'qs';
import request from '../utils/request';

// 管网首页服务
// 待办事项
export async function getHomeTodoParams(params) {
  return request(`/proxy/home/getHomeTodo?${stringify(params)}`);
}
// 运营洞察
export async function getHomeYYDC(params) {
  return request(`/proxy/home/getHomeYYDC?${stringify(params)}`);
}
// 趋势洞察
export async function getHomePatrolLen(params) {
  return request(`/proxy/home/getHomePatrolLen?${stringify(params)}`);
}
// 绩效自驱
export async function getHomeScoreRanking(params) {
  return request(`/proxy/home/getHomeScoreRanking?${stringify(params)}`);
}
// 设备首页服务
// 设备台账统计
export async function getDHomeAccount(params) {
  return request(`/proxy/device/home/getDHomeAccount?${stringify(params)}`);
}
// 设备大修次数统
export async function getDHomeBigRepair(params) {
  return request(`/proxy/device/home/getDHomeBigRepair?${stringify(params)}`);
}
// 单个提交指标
export async function getDHomeItem(params) {
  return request(`/proxy/device/home/getDHomeItem?${stringify(params)}`);
}
// 设备大修完成情况统
export async function getDHomeRepair(params) {
  return request(`/proxy/device/home/getDHomeRepair?${stringify(params)}`);
}
// 隐患类别统
export async function getDHomeYhClass(params) {
  return request(`/proxy/device/home/getDHomeYhClass?${stringify(params)}`);
}
