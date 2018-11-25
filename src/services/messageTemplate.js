import { stringify } from 'qs';
import fetch from '../utils/request';

export function getMsgTempList(option) {
  return fetch(`/proxy/bms/msgTemplet/queryMsgTempletInfo?${stringify(option)}`);
}

export function getMsgTempTypes() {
  return fetch('/proxy/bms/msgTemplet/queryAllMsgTempletType');
}

export function updateMsgTemp({ gid, ...body }) {
  return fetch(`/proxy/bms/msgTemplet/updateMsgTemplet/${gid}`, {
    method: 'PUT',
    body,
  });
}
