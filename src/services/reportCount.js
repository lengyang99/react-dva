import { stringify } from 'qs';
import request from '../utils/request';


export async function tableQuery(params) {
  return request(`/proxy/fieldwork/woController/getThirdWoControlList?${stringify(params)}`);
}
