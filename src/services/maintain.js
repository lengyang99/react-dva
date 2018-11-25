import { stringify,parse } from 'qs';
import request from '../utils/request';

// const BaseURL = 'http://10.39.21.38:1112';
// const BaseURL='http://localhost:8088/ServiceEngine/rest/services/CSProjectServer';

export async function getFunction(params) {
  return request(`/proxy/task/function/list?${stringify(params)}`);
}

export async function queryPlan(params) {
  return request('/proxy/task/plan/query?'+stringify(params));
}
export async function queryAreaEquData(params) {
  return request('/proxy/task/function/eq/list?'+stringify(params));
}
export async function addRulePlan(params) {
  return request('/proxy/task/plan/new', {
    method: 'POST',
    body: params,
  });
}
export async function addTempPlan(params) {
  return request('/proxy/task/plan/new/temp', {
    method: 'POST',
    body: params,
  });
}
//编辑常规计划；
export async function editRulePlan(params) {
  return request('/proxy/task/plan/edit', {
    method: 'POST',
    body: params,
  });
}
export async function querySummary(params) {
  return request('/proxy/task/task/card/list?' + stringify(params));
}

export async function queryOne(params) {
  return request('/proxy/task/task/list?funcion=valve&planId='+params);
}
export async function queryAreaData() {
  return request('/proxy/patrol/area/getAreaListByStation');
}

//删除计划；
export async function delplan(params) {
  return request('/proxy/task/plan/delete?planId=' + params);
}
//开启计划；
export async function startplan(planId, src) {
  return request(`/proxy/task/plan/${src}?planId=${planId}`);
}
//停止计划；
// export async function stopplan(params) {
//   return request('/proxy/task/plan/stop?planId=' + params);
// }

export async function getStationData() {
  return request(`/proxy/station/list?${stringify({stationType: 'A'})}`);
}

//查询周期；
export async function getCycleInfo(params) {
  return request(`/proxy/task/plan/cycle/info?` + stringify(params));
}

//检查是否有任务；
export async function checkPlanData(params) {
  return request(`/proxy/task/plan/repeat/check?` + stringify(params));
}


//查询功能分组列表；
export async function queryFuncGroup(params) {
  return request(`/proxy/task/function/groups?` + stringify(params));
}
//查询父功能列表
export async function queryFunctionPlan(params) {
  return request(`/proxy/task/function/parent/list?` + stringify(params));
}
//添加功能；
export async function newFunction(params) {
  return request('/proxy/task/function/new', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
//查询父功能详情
export async function functionDetail(params) {
  return request(`/proxy/task/function/detail?` + stringify(params));
}
//编辑父功能
export async function editFunction(params) {
  return request('/proxy/task/function/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
//编辑父功能表单
export async function editFunctionForm(params) {
  return request('/proxy/task/function/edit/form', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

//查询子功能列表；
export async function queryChildFunctionPlan(params) {
  return request(`/proxy/task/function/children/list?` + stringify(params));
}

//查询作业模板列表；
export async function queryFunctionModule(params) {
  return request(`/proxy/task/plan/template/list?` + stringify(params));
}

//查询作业模板列表详情；
export async function queryFunctionModuleDetail(params) {
  return request(`/proxy/task/plan/template?` + stringify(params));
}
//新建作业模板；
export async function newModule(params) {
  return request('/proxy/task/plan/template/new/or/edit', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

//删除作业模板计划；
export async function delFuncModule(params) {
  return request('/proxy/task/plan/template/delete?planTemplateId=' + params);
}
//启停作业模板计划；
export async function startModuleplan(planTemplateId, src) {
  return request(`/proxy/task/plan/template/${src}?planTemplateId=${planTemplateId}`);
}

//模板区域查询；
export async function queryModuleAreaData(params) {
  return request('/proxy/patrol/area/getAreaListByStation?' + stringify(params));
}

//上移、下移
export async function moveUD(params) {
  return request('/proxy/task/function/order', {
    method: 'POST',
    body: params,
  });
};

//查询排班信息
export async function queryWorkForceList(params) {
  return request('/proxy/classManage/gwpb/list?' + stringify(params));
}
//查询排班工作内容
export async function workContent(params) {
  return request('/proxy/patrol/layer/getPatrolLayerList?' + stringify(params));
}
//查询巡视计划列表
export async function getPatrolPlanData(params) {
  return request('/proxy/patrol/plan/getPlanListForPb?' + stringify(params));
}

//新建排班
export async function addWorkforce(params) {
  return request('/proxy/classManage/gwpb/add', {
    method: 'POST',
    body: params,
  });
};

//删除排班
export async function delWorkforce(params) {
  return request('/proxy/classManage/gwpb/delete?' + stringify(params));
}