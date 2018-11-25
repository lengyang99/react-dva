import {stringify, parse} from 'qs';
import request from '../utils/request';

// const BaseURL = 'http://10.39.21.38:1112';
// const BaseURL='http://localhost:8088/ServiceEngine/rest/services/CSProjectServer';

export async function queryEventData(params) {
  return request(`/proxy/event/getEventAllTypeList?${stringify(params)}`);
}

export async function queryRepairEventData(params) {
  return request(`/proxy/event/getRepairEventList?${stringify(params)}`);
}
export async function getEventEditInfo(params) {
  return request(`/proxy/event/getEventEditInfo?${stringify(params)}`);
}

export async function queryEventTypeData(params) {
  return request(`/proxy/event/getEventList?${stringify(params)}`);
}
export async function queryEventDetailData(params) {
  return request(`/proxy/event/getEventInfo?${stringify(params)}`);
}
export async function startProcess(params) {
  return request(`/proxy/event/startProcess?${stringify(params)}`);
}
export async function getRepairFormData(params) {
  return request(`/proxy/event/getRectifyFormData?${stringify(params)}`);
}
export async function getZhiDingFormData(params) {
  return request(`/proxy/event/getDangerFormData?${stringify(params)}`);
}

export async function submitRepairFormData(params) {
  return request('/proxy/event/submitRectifyData', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
export async function submitZhiDingFormData(params) {
  return request('/proxy/event/submitDangerData', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
export async function submitEditFormData(params) {
  return request('/proxy/event/submitEventFormData', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function startCZProcess(params) {
  return request('/proxy/event/startProcessForCZHandle', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function endEvent(params) {
  return request(`/proxy/event/endEvent?${stringify(params)}`);
}

export async function getStartFormData(params) {
  return request(`/proxy/fieldwork/process/getStartFormData?${stringify(params)}`);
}

export async function getCZStartFormData(params) {
  return request(`/proxy/event/getCZStartFormData?${stringify(params)}`);
}

export async function getDictByKeys(key) {
  return request(`/proxy/fieldwork/dict/getdictbykeys?${stringify(key)}`);
}

export async function getFormFields(params) {
  return request(`/proxy/event/getFormFields?${stringify(params)}`);
}

export async function updateGisInfo(params) {
  return request('/proxy/event/updateGisInfo', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function updateEvent(params) {
  return request('/proxy/event/updateEvent', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function exchangeCustomerDemand(params) {
  return request(`/proxy/event/exchangeCustomerDemand?${stringify(params)}`);
}

