import {stringify} from 'qs';
import request from '../utils/request';
// 查询作业标准列表
export async function queryOperaStandardList(param) {
  return request(`/proxy/config/work/standard/list?${stringify(param)}`);
}

// 查看作业标准详情
export async function readOperaStandard(param) {
  return request(`/proxy/config/work/standard/detail?${stringify(param)}`);
}
// 获取任务类型
export async function getTaskType() {
  return request('/proxy/config/task/types?');
}
// 停用作业标准
export async function stopStandard(param) {
  return request(`/proxy/config/work/standard/stop?${stringify(param)}`);
}
// 启用作业标准
export async function startStandard(param) {
  return request(`/proxy/config/work/standard/start?${stringify(param)}`);
}
// 上传附件
export async function addFile(params) {
  return request('/proxy/attach/batch/upload?', {
    method: 'POST',
    body: params,
  }, true);
}
// 新建作业标准
export async function addOperaStandard(params) {
  return request('/proxy/config/work/standard/new?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 编辑作业标准
export async function editOperaStandard(params) {
  return request('/proxy/config/work/standard/edit?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

// 作业类型
// 查询作业类型列表
export async function queryOperaTypeList(param) {
  return request(`/proxy/config/function/children/list?${stringify(param)}`);
}
// 查询作业流程 (事件菜单)
export async function getEventList(param) {
  return request(`/proxy/event/getEventList?${stringify(param)}`);
}
// 查看作业类型详情
export async function readOperaType(param) {
  return request(`/proxy/config/function/detail?${stringify(param)}`);
}
// 删除作业类型
export async function delOperaType(param) {
  return request(`/proxy/config/function/delete?${stringify(param)}`);
}
// 验证删除作业类型
export async function validateDelOperaType(param) {
  return request(`/proxy/config/function/delete/validate?${stringify(param)}`); 
}
// 获取应用场景
export async function getFunctionGroup(param) {
  return request(`/proxy/config/function/groups?${stringify(param)}`);
}
// 查看设备类型
export async function getEqTypeData(param) {
  return request(`/proxy/eqClassification/tree?${stringify(param)}`);
}
// 根据设备id查询条件
export async function getEqConfigData(param) {
  return request(`/proxy/spcf/cls?${stringify(param)}`);
}
// 根据设备id和设备属性查询属性值
export async function getEqConfigParam(param) {
  return request(`/proxy/ldgr/col?${stringify(param)}`);
}
// 查询区域类型
export async function getAreaType() {
  return request('/proxy/patrol/type/getPlanAreaBusTypeListByEcode?');
}
// 新建作业类型
export async function addOperaType(params) {
  return request('/proxy/config/function/new?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 编辑作业类型
export async function editOperaType(params) {
  return request('/proxy/config/function/edit?', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
// 查询作业标准
export async function getOperationData(param) {
  return request(`/proxy/config/work/standard/list/without/page?${stringify(param)}`);
}
// 新建作业标准刷新
export async function refresh() {
  return request('/proxy/fieldwork/dict/refresh?');
}

// 查询类型分类
export async function getCatergoryData(param) {
  return request(`/proxy/config/function/parent/list?${stringify(param)}`);
}
// 删除类型分类
export async function delCatergoryData(param) {
  return request(`/proxy/config/parent/function/delete?${stringify(param)}`);
}
export async function validateDelCatergoryData(param) {
  return request(`/proxy/config/parent/function/delete/validate?${stringify(param)}`);
}
// 校验类型分类名称
export async function validateParentFunction(param) {
  return request(`/proxy/config/validate/parent/function?${stringify(param)}`);
}
// 校验作业类型
export async function validateFunction(param) {
  return request(`/proxy/config/validate/function?${stringify(param)}`);
}
// 检验作业标准名称
export async function validateStandard(param) {
  return request(`/proxy/config/validate/work/standard?${stringify(param)}`);
}
