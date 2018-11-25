import {stringify} from 'qs';
import request from '../utils/request';
// 查询Gis变更台帐
export async function queryGisLedgerList(param) {
  return request(`/proxy/gis/gisbutt/getGisChangeInfo?${stringify(param)}`);
}
// 查询设备分类
export async function getEqType(params) {
  return request(`/proxy/gis/gisbutt/getfldValue?${stringify({ ...params })}`);
}
// 导出Gis变更台帐数据
export async function exportTaskData(params) {
  return request(`/proxy/gis/gisbutt/exportTaskData?${stringify({ ...params })}`);
}
