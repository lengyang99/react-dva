/**
 * Created by hexi on 2017/11/28.
 */
// import { stringify,parse } from 'qs';
import request from '../utils/request';

export async function getAttachInfo(params) {
  return request(`/proxy/attach/selectFileInfoListByIds?ids=${params}`, {
    method: 'GET',
  });
}

