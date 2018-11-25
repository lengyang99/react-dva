/**
 * Created by Kunhour on 2017/11/28.
 * 用于进行空间查询
 */


import {stringify} from 'qs';
import request from '../utils/request';


/**
 * 用于多图层查询
 *
 * @function identify
 * @param {Object} identifyOption - 查询参数
 * @param {string} identifyOption.geometry - "xmin,ymin,xmax,ymax"
 * @param {string} identifyOption.geometryType - "esriGeometryEnvelopen"
 * @param {string} identifyOption.sr - "2437"
 * @param {string} identifyOption.layerDefs - "visible:2,5 | all"
 * @param {number} identifyOption.tolerance - "2"
 * @param {number} identifyOption.mapExtent - 地图范围
 * @param {number} identifyOption.imageDisplay - xxx
 * @param {boolean} identifyOption.returnGeometry - 是否返回 geom 信息
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function identify(identifyOption, svn = 'QUERY_SVR') {
  const path = '/identify';
  // 判断是post还是get,所有的字符参数长度相加
  if (identifyOption.geometry) {
    identifyOption.geometry = JSON.stringify(identifyOption.geometry);
  }
  if (identifyOption.layerDefs) {
    identifyOption.layerDefs = JSON.stringify(identifyOption.layerDefs);
  }
  if (identifyOption.mapExtent) {
    identifyOption.mapExtent = JSON.stringify(identifyOption.mapExtent);
  }

  // IE最小：2083
  if (identifyOption.geometry && identifyOption.geometry.length > 1024) {
    return request(`/${svn}/identify`, {
      method: 'POST',
      body: {
        ...identifyOption,
        method: 'post',
      }
    });
  }
  else {
    return request(`/${svn}${path}?${stringify(identifyOption)}`);
  }
}

/**
 * 用于单图层查询
 *
 * @function query
 * @param {string} layerId - 元数据的layerId
 * @param {Object} queryOption - 查询参数
 * @param {string} queryOption.geometry - "xmin,ymin,xmax,ymax"
 * @param {string} queryOption.geometryType - "esriGeometryEnvelopen"
 * @param {string} queryOption.spatialRel - "esriSpatialRelIntersects"
 * @param {string} queryOption.where - "1=1"
 * @param {string} queryOption.objectIds - 查询某几个 gid 的值，"123,1234123"
 * @param {string} queryOption.outFields - 返回字段"xxx,xxx"
 * @param {boolean} queryOption.returnGeometry - 是否返回 geom 信息
 * @param {string} queryOption.returnIdsOnly - 只返回 gid 信息
 * @param {boolean} queryOption.returnCountOnly - 只返回总条数
 * @param {string} queryOption.orderByFields - 以某个字段排序
 * @param {Array} queryOption.outStatistics - 统计信息
 * @param {string} queryOption.outStatistics[].statisticType - 统计类型 "<count | sum | min | max | avg | stddev | var>"
 * @param {string} queryOption.outStatistics[].onStatisticField - 统计某个字段 "Field1"
 * @param {string} queryOption.outStatistics[].outStatisticFieldName - 显示字段名称 "Out_Field_Name1"
 * @param {string} queryOption.groupByFieldsForStatistics - 以某个字段排序
 * @param {string} queryOption.pageno - 以某个字段排序
 * @param {string} queryOption.pagesize - 以某个字段排序
 * @param {boolean} queryOption.returnGeometry - 是否返回 geom 信息
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function query(layerId, queryOption, svn = 'QUERY_SVR') {
  const path = `/${layerId}/query`;

  if (Array.isArray(queryOption.outFields)) {
    queryOption.outFields = queryOption.outFields.toString();
  }
  if (Array.isArray(queryOption.orderByFields)) {
    queryOption.orderByFields = queryOption.orderByFields.toString();
  }
  if (Array.isArray(queryOption.groupByFieldsForStatistics)) {
    queryOption.groupByFieldsForStatistics = queryOption.groupByFieldsForStatistics.toString();
  }
  if (Array.isArray(queryOption.geometry)) {
    queryOption.geometry = JSON.stringify(queryOption.geometry);
  }
  if (Array.isArray(queryOption.outStatistics)) {
    queryOption.outStatistics = JSON.stringify(queryOption.outStatistics);
  }
  if (Array.isArray(queryOption.returnDistinctValues)) {
    queryOption.returnDistinctValues = JSON.stringify(queryOption.returnDistinctValues);
  }
  if (Array.isArray(queryOption.objectIds)) {
    queryOption.objectIds = queryOption.objectIds.join(',');
  }

  let strQuery = (queryOption.geometry || '') +
    (queryOption.where || '') +
    (queryOption.objectIds || '') +
    (queryOption.outFields || '') +
    (queryOption.orderByFields || '');
  // IE最小：2083
  if (queryOption.outStatistics || strQuery.length > 1500) {
    return request(`/${svn}${path}`, {
      method: 'POST',
      body: {
        ...queryOption,
        method: 'post',
      }
    });
  }
  else {
    return request(`/${svn}${path}?${stringify(queryOption)}`);
  }
}

/**
 * 用于废管查询
 *
 * @function queryOld
 * @param {string} layerId - 元数据 layerId
 * @param {Object} queryOption - 查询参数
 * @param {string} queryOption.geometry - "xmin,ymin,xmax,ymax"
 * @param {string} queryOption.geometryType - "esriGeometryEnvelopen"
 * @param {string} queryOption.spatialRel - "esriSpatialRelIntersects"
 * @param {string} queryOption.where - "1=1"
 * @param {string} queryOption.objectIds - 查询某几个 gid 的值，"123,1234123"
 * @param {string} queryOption.outFields - 返回字段"xxx,xxx"
 * @param {boolean} queryOption.returnGeometry - 是否返回 geom 信息
 * @param {string} queryOption.returnIdsOnly - 只返回 gid 信息
 * @param {boolean} queryOption.returnCountOnly - 只返回总条数
 * @param {string} queryOption.orderByFields - 以某个字段排序
 * @param {Array} queryOption.outStatistics - 统计信息
 * @param {string} queryOption.outStatistics[].statisticType - 统计类型 "<count | sum | min | max | avg | stddev | var>"
 * @param {string} queryOption.outStatistics[].onStatisticField - 统计某个字段 "Field1"
 * @param {string} queryOption.outStatistics[].outStatisticFieldName - 显示字段名称 "Out_Field_Name1"
 * @param {string} queryOption.groupByFieldsForStatistics - 以某个字段排序
 * @param {string} queryOption.pageno - 以某个字段排序
 * @param {string} queryOption.pagesize - 以某个字段排序
 * @param {boolean} queryOption.returnGeometry - 是否返回 geom 信息
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function queryOld(layerId, queryOption, svn = 'QUERY_SVR') {
  const path = `/${layerId}/old/query`;
  if (Array.isArray(queryOption.outFields)) {
    queryOption.outFields = queryOption.outFields.toString();
  }
  if (Array.isArray(queryOption.orderByFields)) {
    queryOption.orderByFields = queryOption.orderByFields.toString();
  }
  if (Array.isArray(queryOption.groupByFieldsForStatistics)) {
    queryOption.groupByFieldsForStatistics = queryOption.groupByFieldsForStatistics.toString();
  }
  if (Array.isArray(queryOption.geometry)) {
    queryOption.geometry = JSON.stringify(queryOption.geometry);
  }
  if (Array.isArray(queryOption.outStatistics)) {
    queryOption.outStatistics = JSON.stringify(queryOption.outStatistics);
  }
  if (Array.isArray(queryOption.returnDistinctValues)) {
    queryOption.returnDistinctValues = JSON.stringify(queryOption.returnDistinctValues);
  }
  if (Array.isArray(queryOption.objectIds)) {
    queryOption.objectIds = queryOption.objectIds.join(',');
  }

  let strQuery = (queryOption.geometry || '') +
    (queryOption.where || '') +
    (queryOption.objectIds || '') +
    (queryOption.outFields || '') +
    (queryOption.orderByFields || '');
  // IE最小：2083
  if (queryOption.outStatistics || strQuery.length > 1500) {
    return request(`/${svn}${path}`, {
      method: 'POST',
      body: {
        ...queryOption,
        method: 'post',
      }
    });
  }
  else {
    return request(`/${svn}${path}?${stringify(queryOption)}`);
  }
}

/**
 * 添加记录
 *
 * @function append
 * @param {number} layerId - 元数据 layerId
 * @param {Array} adds - 待添加数据
 * @param {string} adds[].geometry - 空间信息
 * @param {number} adds[].geometry.x - x 坐标
 * @param {number} adds[].geometry.y - y 坐标
 * @param {Object} adds[].attributes - 属性信息
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function append(layerId, adds, svn = 'QUERY_SVR') {
  const path = `/${layerId}/applyEdits`;
  const data = {
    adds: JSON.stringify(adds),
  };
  return request(`/${svn}${path}`, {
    method: 'POST',
    body: {
      ...data,
      method: 'post',
    }
  });
}

/**
 * 删除数据
 *
 * @function del
 * @param {number} layerId - 元数据 layerId
 * @param {string} ids - 待删除 gid "112,123,4333,"
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function del(layerId, ids, svn = 'QUERY_SVR') {
  const path = `/${layerId}/applyEdits`;
  const data = {
    deletes: ids,
  };
  return request(`/${svn}${path}?${stringify(data)}`);
}

/**
 * 更新数据
 *
 * @function update
 * @param {number} layerId - 元数据 layerId
 * @param {Array} updates - 待更新数据
 * @param {Object} updates[].geometry - 空间信息
 * @param {number} updates[].geometry.x - x 坐标
 * @param {number} updates[].geometry.y - y 坐标
 * @param {Object} updates[].attributes - 属性信息
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 *
 * @return {Promise}
 */
export async function update(layerId, updates, svn = 'QUERY_SVR') {
  const path = `/${layerId}/applyEdits`;

  const data = {
    updates: JSON.stringify(updates),
  };
  return request(`/${svn}${path}`, {
    method: 'POST',
    body: {
      ...data,
      method: 'post',
    }
  });
}

/**
 * 获取附件信息
 *
 * @function attachments
 * @param {number} layerId - 元数据 layerId
 * @param {number} objectId - 数据 gid
 * @param {string} [svn=QUERY_SVR] - QUERY_SVR
 * @return {Promise}
 */
export async function attachments(layerId, objectId, svn = 'QUERY_SVR') {
  const path = `/${layerId}/${objectId}/attachments`;
  return request(`/${svn}${path}?${stringify(data)}`);
}
