/**
 * Created by zhongjie on 2018/6/11.
 */

import { stringify } from 'qs';
import request from '../utils/request';

// 抄表结果查询
export async function getResultInfo(params) {
  return request(`/proxy/gshMeterReading/getLedgerInfo?` + stringify(params));
}

// 抄表结果编辑
export async function editResult(params) {
  return request(`/proxy/gshMeterReading/update?`, {
    method: 'POST',
    body: params,
  }, true);
}

// 抄表结果提交至CCS
export async function commitResult(params) {
  return request(`/proxy/backPass/pushTask?`, {
    method: 'POST',
    body: params,
  }, true);
}

// 抄表结果导出
export async function reportExcel(params) {
  return request(`/proxy/gshMeterReading/meterReadingLedgerExportExcel?` + stringify(params));
}
