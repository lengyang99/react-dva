import {stringify, parse} from 'qs';
import request from '../utils/request';

export async function getIchMeterAccount(params) {
  return request('/bigData/webapp/find/mMdZHYYBpHInfo?' + stringify(params));
}
export async function getIchMeterDetail(params) {
  return request('/bigData/webapp/find/mMdZHYYGasequipmentInfo?' + stringify(params));
}
export async function getIchMeterDetailTable(params) {
  return request('/proxy/task/task/detail/list?' + stringify(params));
}
export async function getIchMeterDetailDetail(params) {
  return request('/proxy/task/task/detail?' + stringify(params));
}
// export async function getClassifyName() {
//   return request('/proxy/patrol/area/getAreaListByStation');
// }

