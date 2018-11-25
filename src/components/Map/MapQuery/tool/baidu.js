import React from 'react';
import _ from 'lodash';
import ReactDOM from 'react-dom';
import { Input, Button, Icon, Pagination, Spin, message, Popover, Tooltip} from 'antd';
import request from '../../../../utils/request';
import {getUserInfo} from '../../../../utils/utils';
import StreetView from './streetview';
import {guid, addEvent, removeEvent} from '../controls';

import styles from './style.less';

const url1 = 'mapBaidu?newmap=1&reqflag=pcmap&biz=1&from=webmap&qt=s&da_src=pcmappg.searchBox.button&src=0&wd2=&sug=0&from=webmap&tn=B_NORMAL_MAP&nn=0&ie=utf-8';
const url2 = 'mapBaidu/?qt=cur';
const url3 = 'baiduMap/ag/coord/convert?_=1';

const initUrl = './config/init.json';

const baiduConvert = (() => { // 在这里计算校准值
  const pi = 3.14159265358979324;
  const a = 6378245.0;
  const ee = 0.00669342162296594323;
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const MCBAND = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0];
  const MC2LL = [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2], [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86], [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37], [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06], [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4], [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]];

  const utf8 = (utftext) => {
    let utf = '';
    let i = 0;
    while (i < utftext.length) {
      const c = utftext.charCodeAt(i);
      if (c < 128) {
        utf += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        const c2 = utftext.charCodeAt(i + 1);
        utf += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        const c2 = utftext.charCodeAt(i + 1);
        const c3 = utftext.charCodeAt(i + 2);
        utf += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return utf;
  };

  const decode = (text) => {
    let value = '';
    let i = 0;
    const input = text.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
      const enc1 = keyStr.indexOf(input.charAt(i++));
      const enc2 = keyStr.indexOf(input.charAt(i++));
      const enc3 = keyStr.indexOf(input.charAt(i++));
      const enc4 = keyStr.indexOf(input.charAt(i++));
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      value += String.fromCharCode(chr1);
      if (enc3 !== 64) value += String.fromCharCode(chr2);
      if (enc4 !== 64) value += String.fromCharCode(chr3);
    }
    return utf8(value);
  };

  const outOfChina = (x, y) => {
    return y < 72.004 || y > 137.8347 || x < 0.8293 || x > 55.8271;
  };

  const convertor = (point, cE) => {
    const x = cE[0] + cE[1] * Math.abs(point.x);
    const cC = Math.abs(point.y) / cE[9];
    const y = cE[2] + cE[3] * cC + cE[4] * cC * cC + cE[5] * cC * cC * cC + cE[6] * cC * cC * cC * cC + cE[7] * cC * cC * cC * cC * cC + cE[8] * cC * cC * cC * cC * cC * cC;
    return {x: (point.x < 0 ? -1 : 1) * x, y: (point.y < 0 ? -1 : 1) * y};
  };

  const transformLat = (x, y) => {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
  };

  const transformLon = (x, y) => {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
  };

  const transform = (point) => {
    const {x, y} = point;
    if (outOfChina(y, x)) return point;
    let dLat = transformLat(x - 105.0, y - 35.0);
    let dLon = transformLon(x - 105.0, y - 35.0);
    const radLat = y / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    return {x: x + dLon, y: y + dLat};
  };

  const lonLat2Mercator = (point) => {
    const {x, y} = point;
    return {x: x * 20037508.342789 / 180, y: Math.log(Math.tan((90 + y) * pi / 360)) / (pi / 180) * 20037508.342789 / 180};
  };

  const onlineTrans2Baidu = (point) => {
    const {x, y} = point;
    const params = {x, y, from: 0, to: 4};
    return request([url3].concat(Object.keys(params).map(key => `${key}=${params[key]}`)).join('&')).then(res => {
      const {error, x: x1, y: y1} = res;
      if (error) return point;
      else return {x: decode(x1), y: decode(y1)};
    });
  };

  const convertMC2LL = (point) => {
    for (let i = 0; i < MCBAND.length; i++) {
      if (point.y >= MCBAND[i]) {
        return convertor(point, MC2LL[i]);
      }
    }
    return point;
  };

  const getGpsPointByBaiduGps = (point) => {
    const {x: x1, y: y1} = point;
    return onlineTrans2Baidu(point).then(res1 => {
      const {x: x2, y: y2} = res1;
      const {x: x3, y: y3} = {x: 2 * x1 - x2, y: 2 * y1 - y2};
      return onlineTrans2Baidu({x: x3, y: y3}).then(res2 => {
        const {x: x4, y: y4} = res2;
        return {x: x1 + x3 - x4, y: y1 + y3 - y4};
      });
    });
  };

  return (point) => getGpsPointByBaiduGps(convertMC2LL(point)).then(res => lonLat2Mercator(transform(res)));
})();

const binghelper = (target) => {
  const layer = guid();

  const getUrl = (url, obj) => [url].concat(Object.keys(obj).map(key => `${key}=${obj[key]}`)).join('&');

  const showTip = (item) => {
    const {mapTarget} = target.props;
    const {geometry: {x, y}, attributes: {name, addr, tel }} = item;
    mapTarget.popup({x, y, info: {title: name, content: [{name: '地址', value: addr}, {name: '电话', value: tel}].filter(o => o.value)}});
  };

  const draw = (items) => {
    const {mapTarget: {mapDisplay: display, map}} = target.props;
    display.clearLayer(layer);
    items.forEach((item, i) => {
      const {geometry: {x, y}} = item;
      display.image({src: `./images/map/location/${i + 1}.png`, x, y, layerId: layer, width: 25, height: 45, attr: item, click: showTip});
    });
    if (items.length > 0) {
      const xs = items.map(o => o.geometry.x);
      const ys = items.map(o => o.geometry.y);
      map.centerAt({ x: (Math.max(...xs) + Math.min(...xs)) / 2, y: (Math.max(...ys) + Math.min(...ys)) / 2});
    }
  };

  const search = (() => {
    let value = null;
    const getValue = () => { value = target.state.form.value; return value; };
    const getWord = (force) => (force ? getValue() : value);

    const query = (word, pno) => {
      const wd = word && _.trim(word);
      if (wd && wd.length > 0) {
        close();
        const {cityId} = target.state;
        request(getUrl(url1, {pn: pno, c: cityId, nn: (pno - 1) * 10, wd: encodeURIComponent(word)})).then(res => {
          const {result: {total}, content} = res;
          const {page} = target.state;
          const datas = _.take(content, 10);
          if (total > 0) {
            Promise.all(datas.map(item => baiduConvert({x: item.x / 100, y: item.y / 100}))).then(points => {
              const items = datas.map((item, i) => Object.assign(item, {geometry: points[i]}));
              target.setState({items, page: {...page, total, current: pno}}, () => draw(items));
            });
          } else message.info('真的找不到了！换个地址吧');
        });
      } else message.info('请输入地址名称');
    };

    return { goPage: (page) => query(getWord(), page), query: () => query(getWord(true), 1)};
  })();

  const clear = () => {
    const {form, page} = target.state;
    target.setState({items: [], form: {...form, value: undefined}, page: {...page, total: 0, current: 1}}, close);
  };

  const close = () => {
    const {mapTarget} = target.props;
    const {mapDisplay: display, map: {infoWindow}} = mapTarget;
    infoWindow.hide();
    display.clearLayer(layer);
  };

  const change = (e) => {
    const {form} = target.state;
    target.setState({form: {...form, value: e.target.value}});
  };

  const click = (item) => {
    const {mapTarget} = target.props;
    const {geometry: {x, y}, name, addr, tel} = item;
    mapTarget.popup({x, y, info: {title: name, content: [{name: '地址', value: addr}, {name: '电话', value: tel}].filter(o => o.value)}});
  };

  const viewStreet = (item) => {
    const {name, uid} = item;
    target.setState({street: {title: name, uid, width: '1000px', height: '700px', close() { target.setState({street: undefined}); }}});
  };

  const resize = () => {
    const func = 'findDOMNode';
    const {ownerDocument} = ReactDOM[func](target);
    const {clientHeight} = ownerDocument.documentElement || ownerDocument.body;
    target.setState({maxHeight: `${clientHeight - 290}px`});
  };

  const getInitCfg = () => {
    return request(initUrl, {
      method: 'get',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/text;charset=UTF-8',
      },
    });
  };

  Promise.all([getUserInfo(), getInitCfg()]).then(res => {
    const [{user: {ecode}}, {cfgs = []}] = res;
    const [{cityName: wd}] = cfgs.filter(x => x.ecode === ecode);
    return request(getUrl(url2, {wd}));
  }).then(res => {
    const {cur_area_id: cityId, cur_area_name: city, weather: json} = res;
    const {sim01: src, weather0: weather, temp0: temp, wind0: wind} = JSON.parse(json);
    target.setState({
      loading: false,
      cityId,
      items: [],
      city: {src, city, weather, temp, wind},
      form: {value: undefined, onChange: change, className: styles[`input${city.length}`]},
      page: {current: 1, total: 0, pageSize: 10, onChange: search.goPage},
      evts: {clear, query: search.query, click, close() { close(); removeEvent(window, 'resize', resize); }, viewStreet},
    }, resize);
    addEvent(window, 'resize', resize);
  });
};

export default class App extends React.Component {
  componentWillMount() { binghelper(this); }
  componentWillUnmount() {
    const {evts: {close = () => {}}} = this.state;
    close();
  }
  render() {
    const {loading, items = [], city: {src, city, weather, temp, wind} = {}, form = {}, page, street, evts = {}, maxHeight = 'auto'} = this.state || {};
    const {clear, query, click, viewStreet} = evts;
    return (
      <div className={styles.addr} {...this.props}>
        <Input
          {...form}
          placeholder="请输入您要查询的地址名称"
          onPressEnter={query}
          prefix={src ? (
            <Popover overlayClassName={styles.Popover} placement="bottomLeft" title={city} content={<div><div>天气：{weather}</div><div>温度：{temp}</div><div>风向：{wind}</div></div>} trigger="hover">
              <div className={styles.prefix}>
                {src && <span><img alt="天气图标" src={src} /></span>}
                <span>{city}</span>
              </div>
            </Popover>
          ) : <Icon className={styles.prefix} type="loading" />}
          suffix={(
            <div>
              {form.value && <Tooltip placement="top" title="清空" overlayStyle={{backfaceVisibility: 'white'}}><Icon className={styles.delete} type="delete" onClick={clear} /></Tooltip>}
              <Button loading={loading} className={styles.search} type="primary" icon="search" onClick={query} />
            </div>
          )}
        />
        {Array.isArray(items) && items.length > 0 && (
          <div className={styles.result}>
            <div className={styles.box}>
              <div className={styles.items} style={{maxHeight, overflow: 'auto'}}>
                <div>
                  { items.map((item, idx) => (
                    <div key={`${idx * 1}`}>
                      <div className={styles.item} onClick={() => click(item)}>
                        <div className={styles[`num${idx + 1}`]} />
                        <div className={styles.desc}>
                          <div>
                            <span style={{color: '#3385ff'}}>{item.name}</span>
                            {!!item.pano && <a style={{color: 'green', float: 'right'}} onClick={(e) => { e.stopPropagation(); viewStreet(item); }}>街景</a>}
                          </div>
                          <div>{item.addr}</div>
                          {item.tel && <div>电话:{item.tel}</div>}
                        </div>
                      </div>
                    </div>
                  )) }
                </div>
              </div>
              <div className={styles.page}>
                <Pagination size="small" {...page} showTotal={(num) => `总数:${num}条`} />
              </div>
            </div>
            {loading && <div className={styles.spin}><div><Spin size="large" spinning tip="正在查询数据" /></div></div>}
          </div>
        )}
        {street && <StreetView {...street} />}
      </div>
    );
  }
}
