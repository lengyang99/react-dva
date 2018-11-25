import qs from 'qs';
import fetch from '../utils/request';

export async function fetchClassifyTree(option) {
  return fetch(`/proxy/eqClassification/tree?${qs.stringify(option)}`);
}

