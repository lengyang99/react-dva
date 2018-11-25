/**
 * 系统配置信息获取
 */
import request from './request';

const initUrl = './config/init.json';

const cache = new Map();

request(initUrl, {
  method: 'get',
  dataType: 'json',
  headers: {
    'Content-Type': 'application/text;charset=UTF-8',
  },
}).then((res) => {
});

function getInitCfg() {
  return request(initUrl, {
    method: 'get',
    dataType: 'json',
    headers: {
      'Content-Type': 'application/text;charset=UTF-8',
    },
  });
}

export function getEcodePattern(ecode = '0011') {
  return getInitCfg().then((res) => {
    const {cfgs} = res;
    if (!Array.isArray(cfgs)) {
      throw new Error('res.cfgs 异常');
    }
    for (let i = 0; i < cfgs.length; i += 1) {
      if (cfgs[i].ecode === ecode) {
        return request('./config/emerEcodecfg.json').then((res2) => {
          return res2[cfgs[i].pattern];
        });
      }
    }
  });
}

export function getCfgByKey(key = '') {
  if (cache.has(key)) {
    return new Promise((resolved) => {
      resolved(cache.get(key));
    });
  } else {
    return getInitCfg().then((res) => {
      const { cfgs } = res;
      if (!Array.isArray(cfgs)) {
        throw new Error('res.cfgs 异常');
      }
      for (let i = 0; i < cfgs.length; i++) {
        if (cfgs[i].key === key) {
          return request(cfgs[i].url).then((res2) => {
            cache.set(key, res2);
            return res2;
          });
        }
      }
    });
  }
}

export function getMapCggByTypeAndEcode(mapType,ecode) {
  const key = `${mapType}${ecode}`;
  if (cache.has(key)) {
    return new Promise((resolved) => {
      resolved(cache.get(key));
    });
  } else {
    return getInitCfg().then((res) => {
      const { cfgs } = res;
      if (!Array.isArray(cfgs)) {
        throw new Error('res.cfgs 异常');
      }
      for (let i = 0; i < cfgs.length; i++) {
        if (cfgs[i].mapType === mapType && cfgs[i].ecode===ecode) {
          return request(cfgs[i].url).then((res2) => {
            cache.set(key, res2);
            return res2;
          });
        }
      }
    });
  }
}

