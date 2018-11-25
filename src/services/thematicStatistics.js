/**
 * Created by zhongjie on 2018/7/10.
 */

import { stringify } from 'qs';
import request from '../utils/request';

export async function getMetas(ecode) {
  return request(`/proxy/gis/${ecode}/pipenet/MapServer/metas?f=json`);
}

export async function netQuery(ecode, layerid, params) {
  return request(`/proxy/gis/${ecode}/pipenet/MapServer/${layerid}/query?` + stringify(params));
}
