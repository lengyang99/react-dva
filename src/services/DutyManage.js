import {stringify, parse} from 'qs';
import request from '../utils/request';
// 查看值班日志详情
export async function getDutyDetailForms(param) {
  return request(`/proxy/station/duty/zbrz/detail?${stringify(param)}`);
}

// 查看值班日志列表
export async function queryDutyList(param) {
  return request(`/proxy/station/duty/zbrz/list?${stringify(param)}`);
}
// 查看当前值班人状态
export async function queryDutyStatus(param) {
  return request(`/proxy/station/duty/zbrz/last?${stringify(param)}`);
}
// 查看值班人最后一次值班信息(模板信息)
export async function queryLastDutyData(param) {
  return request(`/proxy/station/duty/mb/last?${stringify(param)}`);
}
// 根据站点id获取责任人
export async function queryUsersByStationId(param) {
  return request(`/proxy/station/stationUser?${stringify(param)}`);
}
// 查询班次信息
export async function queryWorkTime(param) {
  return request(`/proxy/station/query/work/time?${stringify(param)}`);
}
// 提交接班记录
export async function submitJiebanDuty(params) {
  return request('/proxy/station/duty/zbrz/jieban?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 提交交班记录
export async function submitJiaobanDutyList(params) {
  return request('/proxy/station/duty/zbrz/jiaoban?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 提交当班记录
export async function submitZhibanDutyList(params) {
  return request('/proxy/station/duty/zbrz/zhiban?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 更新当班日志
export async function updateZhibanDuty(params) {
  return request('/proxy/station/duty/zbrz/updatezhiban?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
