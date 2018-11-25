import { stringify, parse } from 'qs';
import request from '../utils/request';


export async function FormTypeid(params) {
  return request(`/proxy/formconfig/configFormByEcodeAndTypeid?${stringify(params)}`);
}
export async function updateValueByGid(params) {
  return request(`/proxy/formconfig/updateValueByGid?${stringify(params)}`);
}
export async function updatereFresh(params) {
  return request(`/proxy/fieldwork/dict/refresh?${stringify(params)}`);
}
// export async function updateValueByGid(params) {
//   return request('/proxy/formconfig/updateValueByGid', {
//     method: 'POST',
//     body: {
//       ...params,
//     },
//   });
// }