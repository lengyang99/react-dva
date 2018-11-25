import qs, {stringify} from 'qs';
import fetch from '../utils/request';
// 获取台账列表
export async function fetchLedger(options) {
  return fetch(`/proxy/ldgr?${qs.stringify(options)}`);
}

// 下载台帐
export async function downloadLedger(options) {
  return fetch(`/proxy/ldgr/download?${qs.stringify(options)}`, {}, false, false, false, true, false);
}

// 删除台账
export async function deleteLedger(id) {
  return fetch(`/proxy/ldgr/${id}`, {
    method: 'delete',
  });
}
// 查询台账详情
export async function getLedgerDetial(id) {
  return fetch(`/proxy/ldgr/${id}`);
}

// 新增 or 修改台账
export async function postLedger(options) {
  return fetch('/proxy/ldgr', {
    method: 'POST',
    body: options,
  });
}

// 获取站点列表
export async function fetchSiteList() {
  return fetch('/proxy/ldgr/site');
}

// 获取执行区域列表
export async function fetchAreaList() {
  return fetch('/proxy/ldgr/zone');
}

// 获取设备编号
export async function fetchEqCode(options) {
  return fetch(`/proxy/ldgr/eqCode?${qs.stringify(options)}`);
}

// 获取技术参数列表
export async function fetchTechParamList(gid) {
  return fetch(`/proxy/spcf/${gid}`);
}

// 上传附件(设备台账)
export async function uploadAttachmentList(formData) {
  return fetch('/proxy/ldgrFile/upload', {
    method: 'POST',
    body: formData,
  }, true);
}

// 获取附件列表2(设备台账)
export async function fetchAttachmentList(options) {
  return fetch(`/proxy/ldgrFile?${qs.stringify(options)}`);
}

// 删除附件2(设备台账)
export async function deleteAttachmentList(ids) {
  return fetch(`/proxy/ldgrFile/${ids}`, {
    method: 'DELETE',
  });
}

// 添加 or 修改技术参数
export async function addOrModifyTechParam(option) {
  return fetch('/proxy/spcf', {
    method: 'POST',
    body: option,
  });
}

// 删除技术参数
export async function deleteTechParam(id) {
  return fetch(`/proxy/spcf/${id}`, {
    method: 'DELETE',
  });
}

// 获取站点
export async function fetchSite() {
  return fetch('/proxy/eqCodes/8001');
}

// 获取分类列表
export async function fetchClassify() {
  return fetch('/proxy/eqCodes/8002');
}

// 获取完好等级列表
export async function fetchPerfectLevel() {
  return fetch('/proxy/eqCodes/8003');
}
// 获取重要等级列表
export async function fetchImportantLevel() {
  return fetch('/proxy/eqCodes/8004');
}

// 获取状态列表
export async function fetchStatus() {
  return fetch('/proxy/eqCodes/8005');
}

export async function getSelectOptions() {
  return fetch('/proxy/eqCodes/8006');
}

// 获取位置类型列表
export async function fetchPositionType() {
  return fetch('/proxy/eqCodes/8007');
}

// 获取站点类型列表
export async function fetchSiteType() {
  return fetch('/proxy/eqCodes/8008');
}

export async function fetchLocationStatus() {
  return fetch('/proxy/eqCodes/8009');
}

// 获取下次检修等级
export async function fetchRepairLevel() {
  return fetch('/proxy/eqCodes/8012');
}
// 获取责任人列表
export async function getUserInfoByEcode(params) {
  return fetch(`/proxy/station/getUserInfoByEcode?${qs.stringify(params)}`);
}
// 获取所属组织列表
export async function getGroupsTree(params) {
  return fetch(`/proxy/user/getGroupsTree?${qs.stringify(params)}`);
}
// 获取台账预防性维护计划
export async function fetchLedgerPlan(option) {
  return fetch(`/proxy/task/plan/list/eq?${qs.stringify(option)}`);
}
// 获取台账预防性维护记录
export async function fetchLedgerTask(option) {
  return fetch(`/proxy/task/task/list/eq?${qs.stringify(option)}`);
}

export async function fetchOptions(classspecGid) {
  return fetch(`/proxy/eqClassSpecEnum/${classspecGid}`);
}
// 获取设备历史工单列表
export async function fetchLegerHistory(options) {
  return fetch(`/proxy/fieldwork/query/selectHistoryWorkOrder?${qs.stringify(options)}`);
}
// 获取设备隐患记录
export async function fetchLedgerRecord(options) {
  return fetch(`/proxy/fieldwork/query/selectYHRecord?${qs.stringify(options)}`);
}

// 获取周转备件
export async function fetchSpareParts(params) {
  return fetch(`/proxy/material/findMetaByCondition?${stringify(params)}`); // factoryCode=
}

// 查询公司编码信息
export async function getCompanyCode() {
  return fetch('proxy/eqLocation/queryCompanyInfo');
}
// 批量更新设备台帐类型
export async function updateLdgrType(param) {
  return fetch('proxy/updateLdgrType', {
    method: 'PUT',
    body: param,
  });
}
// 查询作业类型列表
export async function queryOperaTypeList(param) {
  return fetch(`/proxy/config/function/children/list?${stringify(param)}`);
}
// 查询设备分类
export async function queryEqKindes(param) {
  return fetch(`/proxy/eqKinds/${param}`);
}
