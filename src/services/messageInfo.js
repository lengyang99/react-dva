/**
 * Created by hexi on 2017/12/5.
 */
import {stringify, parse} from 'qs';
import fetch from '../utils/request';


export async function getMessageList(params) {
  return fetch(`/proxy/fieldwork/message/list?${stringify(params)}`, {
    method: 'get',
  });
}

export async function getMessageListNoLoading(params) {
  return fetch(`/proxy/fieldwork/message/list?${stringify(params)}`, {
    method: 'get',
  }, false, false, false, true, false);
}

export async function deleteMsgInfo(params) {
  return fetch(`/proxy/fieldwork/message/delete?${stringify(params)}`, {
    method: 'get',
  });
}

export async function readMsgInfo(params) {
  return fetch(`/proxy/fieldwork/message/read?${stringify(params)}`, {
    method: 'get',
  });
}

export async function getEventFormInfo(params) {
  return fetch(`/proxy/event/getAllEventList?${stringify(params)}`, {
    method: 'get',
  });
}

export async function selectTaskBygid(params) {
  return fetch(`/proxy/patrol/task/selectTaskListByCondition?${stringify(params)}`, {
    method: 'get',
  });
}

export async function getYHTaskInfo(params) {
  return fetch(`/proxy/task/task/list?${stringify(params)}`, {
    method: 'get',
  });
}
