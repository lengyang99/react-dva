import {stringify, parse} from 'qs';
import request from '../utils/request';

// 查询加臭记录
export async function queryOdorList(params) {
  return request(`/proxy/station/smelly/record/list?${stringify(params)}`);
}
// 查詢站點列表
export async function queryStationList(params) {
  return request(`/proxy/station/list?${stringify({stationType: 'B'})}`);
}
// 查询加臭机
export async function queryOdorMacList(params) {
  return request(`/proxy/station/smelly/machine/list?${stringify(params)}`);
}
// 查詢操作方式
export async function queryOperType(params) {
  return request(`/proxy/station/smelly/oper/types?${stringify(params)}`);
}
// 查询加臭记录详情
export async function queryOdorDetail(params) {
  // return request('/proxy/task/feedback/checkleak/detail?' + stringify(params));
}
// 获取加臭表单参数
export async function getFormData(params) {
  return request(`/proxy/station/smelly/record/detail?${stringify(params)}`);
}

//预警加臭机
export async function queryOdorEarlyWarningList(params) {
  return request(`/proxy/station/smelly/level/machine/list?${stringify(params)}`);
}
//查询液位预警记录
export async function queryEarlyWarningList(params) {
  return request(`/proxy/station/smelly/level/list?${stringify(params)}`);
}
//新建液位预警
export async function newEarlyWarning(params) {
  return request("/proxy/station/smelly/level/new", {
    method: "POST",
    body: {
      ...params
    }
  });
}


//查询平均值加臭机
export async function queryOdorAverageList(params) {
  return request(`/proxy/station/smelly/avg/machine/list?${stringify(params)}`);
}
//查询平均值记录
export async function queryAverageList(params) {
  return request(`/proxy/station/smelly/avg/list?${stringify(params)}`);
}
//新建平均值
export async function newAverage(params) {
  return request("/proxy/station/smelly/avg/new", {
    method: "POST",
    body: {
      ...params
    }
  });
}

//查询管路维护加臭机
export async function queryOdorMintainList(params) {
  return request(`/proxy/station/smelly/association/machine/list?${stringify(params)}`);
}
//查询管路维护记录
export async function queryMintainList(params) {
  return request(`/proxy/station/smelly/association/list?${stringify(params)}`);
}
//新建管路维护
export async function newMintain(params) {
  return request("/proxy/station/smelly/association/new", {
    method: "POST",
    body: {
      ...params
    }
  });
}

//查询该加臭机下是否已有记录
export async function queryIsOdorEarlyWarningData(params) {
  return request(`/proxy/station/smelly/level/validate?${stringify(params)}`);
}
//管路维护的验证
export async function queryCheckAreaData(params) {
  return request(`/proxy/station/smelly/association/machine/validate?${stringify(params)}`);
}

//首页数据；
export async function queryOdorIndex(params) {
  return request(`/proxy/station/smelly/machine/list/for/home/page?${stringify(params)}`);
}

//加臭机启用；
export async function startOrdo(params) {
  return request(`/proxy/station/smelly/machine/start?${stringify(params)}`);
}

//加臭机停用；
export async function stopOrdo(params) {
  return request(`/proxy/station/smelly/machine/stop?${stringify(params)}`);
}

//加臭机启停新；
// export async function ordoStatus(gid, eqStatus) {
//   return request(`/proxy/ldgr/${gid}?eqStatus=${eqStatus}`);
// }

//加臭机启停新；
export async function ordoStatus(params) {
  console.log(params, 'params');
  return request(`/proxy/ldgr/${params.gid}?${stringify(params)}`, {
    method: 'PUT',
    body: {},
  })
}


