/**
 * Created by zhongjie on 2018/1/5.
 */
import { baiDuAddrSearch, transData } from '../services/api';

export default {
  namespace: 'mapSearch',

  state: {
    status: undefined,
  },

  effects: {
    *search({ payload }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(baiDuAddrSearch, payload.searchParams);
      let results = []; // 坐标转换后的查询结果
      for (let i = 0; i < (response.content ? response.content.length : 0); i++) {
        const data = response.content[i];
        const point = data.geo.split('|');
        const coortran = point[point.length - 1].split(';')[0];
        payload.transParams.coors = coortran;
        // 调用坐标转换服务
        const response1 = yield call(transData, payload.transParams);
        // 将转换后的坐标和poi点名称push到结果数组中
        results.push({
          attributes: {
            name: data.name,
            alias: '地址',
          },
          x: response1[0].x,
          y: response1[0].y,
        });
      }
      payload.fun(results);
      yield put({
        type: 'searchHandle',
        payload: results,
      });
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
  },

  reducers: {
    searchHandle(state, { payload }) {
      return {
        ...state,
        results: payload,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
  },
};
