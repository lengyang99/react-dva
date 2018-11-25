import { stringify } from 'qs';
import fetch from '../utils/request';

/*
  巡视对象配置列表
 */
export async function fetchPatrolTargetConfigList() {
  return fetch('/proxy/patrol/layer/getPatrolLayerList');
}
/*
  类型options
 */
export async function fetchTypeOptions() {
  return fetch('/proxy/patrol/layer/getPatrolType');
}
/*
  filter options || 图层列表
 */
export async function fetchFilterOptions(ecode) {
  return fetch(`/proxy/gis/${ecode}/pipenet/MapServer/metas?`);
}
/*
  获取反馈表单
 */
export async function fetchFeedbackTableList(param) {
  return fetch(`/proxy/patrol/task/getContentFeedBackList?${stringify(param)}`);
}
/*
  巡视对象-删除
 */

export async function deletePatrolTargetConfig(param) {
  return fetch(`/proxy/patrol/layer/deletePatrolLayer?${stringify(param)}`);
}
/*
  巡视对象-编辑
 */
export async function editPatrolTargetConfig(param) {
  return fetch('/proxy/patrol/layer/updatePatrolLayerAndFeedForm', {
    method: 'POST',
    body: param,
  });
}
/*
  巡视对象-新增
 */
export async function addPatrolTargetConfig(param) {
  return fetch('/proxy/patrol/layer/insertPatrolLayerAndFeedForm', {
    method: 'POST',
    body: param,
  });
}
