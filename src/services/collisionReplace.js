import {stringify, parse} from 'qs';
import request from '../utils/request';

export async function selectCollisionReplaceList(params) {
  return request('/proxy/fieldwork/query/selectPJZHList?' + stringify(params));
}




