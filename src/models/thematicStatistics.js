/**
 * Created by zhongjie on 2018/4/10.
 */
import { getMetas, netQuery } from '../services/thematicStatistics';

export default {
  namespace: 'thematicStatistics',

  state: {
    status: undefined,
  },

  effects: {
    *getMeta({ payload }, { call, put }) {
      const response = yield call(getMetas, payload.ecode);
      const metainfo = response.metainfo;
      let res = null;
      for (const index in metainfo) {
        // 只取管网元数据
        if (metainfo[index].type === 4) {
          res = metainfo[index];
        }
      }
      yield put({
        type: 'searchHandle',
        payload: res,
      });

      payload.fun(res);
    },
    // 管径专题统计
    *gjStatistics({ payload }, { call, put }) {
      const response = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features = response.features;
      // 正则表达式，匹配有1到3为小数的正数
      const reg1 = /^[0-9]+(.[0-9]{1,3})?$/;
      const reg2 = /^DN/;
      const req3 = /^De/;
      const res = {
        xdata: ['0-50', '50-150', '150-200', '200-250', '250-300', '300-350', '350-400', '400-500', '500-600', '600-'],
        ydata: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: 0,
        unit: '公里',
      };
      for (let i = 0; i < features.length; i++) {
        const pipediam = features[i].attributes.pipediam;
        const len = parseFloat(features[i].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.total += len;
        // len = Math.round(len * 100) / 100;
        if (reg1.test(pipediam) || reg2.test(pipediam) || req3.test(pipediam)) {
          let gj = 0;
          if (reg1.test(pipediam)) {
            // 如果是数字，则直接转换成数字
            gj = parseFloat(pipediam);
          } else {
            // 如果是以DN或De开头，则先将字母去掉再转换成数字
            gj = parseFloat(pipediam.slice(2, pipediam.length));
          }
          if (gj >= 0 && gj <= 50) {
            res.ydata[0] += len;
          } else if (gj > 50 && gj <= 150) {
            res.ydata[1] += len;
          } else if (gj > 150 && gj <= 200) {
            res.ydata[2] += len;
          } else if (gj > 200 && gj <= 250) {
            res.ydata[3] += len;
          } else if (gj > 250 && gj <= 300) {
            res.ydata[4] += len;
          } else if (gj > 300 && gj <= 350) {
            res.ydata[5] += len;
          } else if (gj > 350 && gj <= 400) {
            res.ydata[6] += len;
          } else if (gj > 400 && gj <= 500) {
            res.ydata[7] += len;
          } else if (gj > 500 && gj <= 600) {
            res.ydata[8] += len;
          } else if (gj > 600) {
            res.ydata[9] += len;
          }
        }
      }

      for (let i = 0; i < res.ydata.length; i++) {
        const data = res.ydata[i] / 1000; // 长度取公里
        res.ydata[i] = data.toFixed(2);
      }
      res.total = res.total / 1000;
      res.total = res.total.toFixed(2);
      payload.fun(res);
    },
    // 管材专题统计
    *gcStatistics({ payload }, { call, put }) {
      const response = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features = response.features;
      // 正则表达式，匹配包含相应材料名称的管材
      const reg1 = /焊接钢管/;
      const reg2 = /PE|pe/;
      const reg3 = /无缝/;
      const req4 = /波纹/;
      const req5 = /金属/;
      const req6 = /铸铁/;
      const req7 = /锌/;
      const res = {
        xdata: ['直缝焊接钢管', 'PE管', '无缝钢管', '波纹软管', '金属软管', '铸铁管', '镀锌钢管', '其他'],
        ydata: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        total: 0,
        unit: '公里',
      };
      for (let i = 0; i < features.length; i++) {
        const pipematerial = features[i].attributes.pipematerial;
        const len = parseFloat(features[i].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.total += len;
        if (reg1.test(pipematerial)) {
          res.ydata[0] += len;
        } else if (reg2.test(pipematerial)) {
          res.ydata[1] += len;
        } else if (reg3.test(pipematerial)) {
          res.ydata[2] += len;
        } else if (req4.test(pipematerial)) {
          res.ydata[3] += len;
        } else if (req5.test(pipematerial)) {
          res.ydata[4] += len;
        } else if (req6.test(pipematerial)) {
          res.ydata[5] += len;
        } else if (req7.test(pipematerial)) {
          res.ydata[6] += len;
        } else {
          res.ydata[7] += len;
        }
      }

      for (let i = 0; i < res.ydata.length; i++) {
        const data = res.ydata[i] / 1000; // 长度取公里
        res.ydata[i] = data.toFixed(2);
      }
      res.total = res.total / 1000;
      res.total = res.total.toFixed(2);
      payload.fun(res);
    },
    // 管龄专题统计
    *glStatistics({ payload }, { call, put }) {
      // 总数据查询
      const response0 = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features0 = response0.features;
      // 2000年以前数据查询
      payload.params.where = "burieddate < '2000-01-01 00:00:00'";
      const response1 = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features1 = response1.features;
      // 2000年到2010年数据查询
      payload.params.where = "burieddate >= '2000-01-01 00:00:00' and burieddate <= '2010-01-01 00:00:00'";
      const response2 = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features2 = response2.features;
      // 2010年以后数据查询
      payload.params.where = "burieddate > '2010-01-01 00:00:00'";
      const response3 = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features3 = response3.features;
      const res = {
        xdata: ['2000年以前', '2000年-2010年', '2010年-至今', '其他'],
        ydata: [0, 0, 0, 0],
        total: 0,
        unit: '公里',
      };
      for (let i = 0; i < features0.length; i++) {
        const len = parseFloat(features0[i].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.total += len;
      }
      for (let j = 0; j < features1.length; j++) {
        const len = parseFloat(features1[j].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.ydata[0] += len;
      }
      for (let k = 0; k < features2.length; k++) {
        const len = parseFloat(features2[k].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.ydata[1] += len;
      }
      for (let h = 0; h < features3.length; h++) {
        const len = parseFloat(features3[h].attributes.管道长度求和);
        if (isNaN(len)) {
          continue;
        }
        res.ydata[2] += len;
      }
      res.ydata[3] = res.total - res.ydata[0] - res.ydata[1] - res.ydata[2];
      // 数据格式化，长度取公里
      for (let i = 0; i < res.ydata.length; i++) {
        const data = res.ydata[i] / 1000;
        res.ydata[i] = data.toFixed(2);
      }
      res.total = res.total / 1000;
      res.total = res.total.toFixed(2);
      payload.fun(res);
    },
    // 阀门专题统计
    *fmStatistics({ payload }, { call, put }) {
      const response = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features = response.features;
      const reg1 = /常温阀门/;
      const reg2 = /低温阀门/;
      const res = {
        xdata: ['常温阀门', '低温阀门', '其他'],
        ydata: [0, 0, 0],
        total: 0,
        unit: '个',
      };
      for (let i = 0; i < features.length; i++) {
        const eqpttype = features[i].attributes.eqpttype;
        const count = parseInt(features[i].attributes.设备编码计数);
        if (isNaN(count)) {
          continue;
        }
        res.total += count;
        if (reg1.test(eqpttype)) {
          res.ydata[0] += count;
        } else if (reg2.test(eqpttype)) {
          res.ydata[1] += count;
        } else {
          res.ydata[2] += count;
        }
      }
      payload.fun(res);
    },
    // 调压设备专题统计
    *tyStatistics({ payload }, { call, put }) {
      const response = yield call(netQuery, payload.ecode, payload.id, payload.params);
      const features = response.features;
      const reg1 = /调压箱/;
      const reg2 = /调压柜/;
      const reg3 = /撬装调压站/;
      const reg4 = /调压间/;
      const res = {
        xdata: ['调压箱', '调压柜', '撬装调压站', '调压间', '其他'],
        ydata: [0, 0, 0, 0, 0],
        total: 0,
        unit: '个',
      };
      for (let i = 0; i < features.length; i++) {
        const eqpttype = features[i].attributes.eqpttype;
        const count = parseInt(features[i].attributes.设备编码计数);
        if (isNaN(count)) {
          continue;
        }
        res.total += count;
        if (reg1.test(eqpttype)) {
          res.ydata[0] += count;
        } else if (reg2.test(eqpttype)) {
          res.ydata[1] += count;
        } else if (reg3.test(eqpttype)) {
          res.ydata[2] += count;
        } else if (reg4.test(eqpttype)) {
          res.ydata[3] += count;
        } else {
          res.ydata[4] += count;
        }
      }
      payload.fun(res);
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
