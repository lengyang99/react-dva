import qs from 'qs';
import fetch from '../utils/request';

export async function fetchLocationTree(param) {
  return fetch(`/proxy/eqLocation/tree?param=${param}`);
}

export async function getLocationMessages(option) {
  return fetch(`/proxy/eqLocation?${qs.stringify(option)}`);
}

export async function searchForLocationMessage(option) {
  return fetch(`/proxy/eqLocation?${qs.stringify(option)}`);
}

export async function deleteLocationMgn(id) {
  return fetch(`/proxy/eqLocation/${id}`, {
    method: 'DELETE',
  });
}
// 设备管理/位置信息保存
export async function addAndEditLocationmsg(option) {
  return fetch(`/proxy/eqLocation?ecode=${option.ecode}`, {
    method: 'POST',
    body: option,
  });
}

// 上传附件(位置管理)
export async function uploadAttachmentList(formData) {
  return fetch('/proxy/eqLocationFile/upload', {
    method: 'POST',
    body: formData,
  }, true);
}
// 获取附件列表(位置管理)
export async function fetchAttachmentList(options) {
  return fetch(`/proxy/eqLocationFile?${qs.stringify(options)}`);
}
// 删除附件(位置管理)
export async function deleteAttachmentList(ids) {
  return fetch(`/proxy/eqLocationFile/${ids}`, {
    method: 'DELETE',
  });
}
//  位置编号重复校验
export async function validateCode(option) {
  return fetch(`proxy/eqLocation/verificationQuery?${qs.stringify(option)}`);
}
// 关联隐患数据
export async function getHiddenLinkData(option) {
  return fetch(`proxy/fieldwork/query/selectYHRecordByAddr?${qs.stringify(option)}`);
}
// 查询公司编码信息
export async function getCompanyCode(ecode) {
  return fetch(`proxy/eqLocation/queryCompanyInfo${qs.stringify(ecode)}`);
}
// 实时生成编号
export async function getLocCode(param) {
  return fetch(`proxy/eqLocation/code?${qs.stringify(param)}`);
}
