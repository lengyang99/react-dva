import qs from 'qs';
import fetch from '../utils/request';

// 新增或修改内部信息
export async function saveInnerService(params) {
  return fetch('/proxy/innerService/innerService', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

