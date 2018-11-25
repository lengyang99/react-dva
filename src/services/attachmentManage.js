import { stringify } from 'qs';
import fetch from '../utils/request';

export async function getAttachmentTypes() {
  return fetch('/proxy/bms/attachmentManage/queryAttachmentType/1');
}

export function getAttachmentList(option) {
  return fetch(`/proxy/bms/attachmentManage/queryAttachmentInfo?${stringify(option)}`);
}

export function deleteAttachment(gid) {
  return fetch(`/proxy/bms/attachmentManage/deleteAttachment/${gid}`, {
    method: 'DELETE',
  });
}
