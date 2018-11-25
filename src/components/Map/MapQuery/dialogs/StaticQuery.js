import React from 'react';
import { message } from 'antd';
import {guid, DialogCtrl, FormCtrl, PanelCtrl, TableCtrl, ContentTip} from '../controls';
import SelectArea from '../extends/SelectArea';
import YwArea from './YwArea';
import { getUserInfo } from '../../../../utils/utils';
import MapApi from '../utils';
import { getMetas, netQuery } from '../../../../services/thematicStatistics';
import attrTool from '../utils/attribute';

import styles from './style.less';

const layer = [`layer_${guid()}`, `layer_${guid()}`];

const empty = () => {};

const getDesc = (val) => {
  const {zt, count} = val;
  switch (zt) {
    case 0:
      return <span style={{color: 'green'}}>  等待查询</span>;
    case 1:
      return <span style={{color: 'red'}}>正在读取中。。。</span>;
    default:
      return <span style={{color: '#2196f3'}}>{count}</span>;
  }
};

const bindHepler = (target) => { // bind模式将对象实现分离，保证函数内部封装性, 相当于Model的功能，但其支持派生，支持多个实例和共享
  let val = -1;
  const {drawShape = false} = target.props; // 绘图模式， 启动后，自己绘制地图数据
  const maxSize = 30000; // 最大查询地图要素值
  const {user: {ecode}} = getUserInfo();
  const {props: {mapTarget}} = target;
  const api = new MapApi(mapTarget); // 地图操作核心对象
  const attr = drawShape ? {start: () => attr, stop: () => attr, bind: () => attr} : attrTool(api);

  const convertValues = (arr) => (typeof arr[0] === 'string' ? arr.map(x => ({dbval: x, dispval: x})) : arr); // 元数据枚举值处理

  const getColum = (fd, idx) => { // 获取表格字段
    const colum = { title: fd.alias, dataIndex: fd.name, key: idx, width: fd.width || 200, disptype: fd.disptype, values: fd.values};
    if (Array.isArray(fd.values) && fd.values.length > 0) {
      const vals = convertValues(fd.values).reduce((a, b) => Object.assign(a, {[`_${b.dbval}`]: b.color ? <span style={{color: b.color}}>{b.dispval}</span> : b.dispval}), {});
      colum.render = (text) => vals[`_${text}`] || text || '';
    }
    return colum;
  };

  const getParams = (res) => { // 获取查询的数据内容
    const {AREA} = res;
    const {tview: {page: {pageSize = 20} = {}} = {}} = target.state;
    return {
      returnGeometry: true,
      geometryType: 'esriGeometryPolygon',
      f: 'json',
      geometry: JSON.stringify(AREA.geometry),
      where: '1=1',
      pageno: 1,
      pagesize: pageSize,
      withCount: true,
    };
  };

  const recovery = () => { // 地图恢复功能
    const {geometry} = target.form.getFieldValue('AREA') || {};
    if (geometry && geometry.rings) api.polygon({gid: 1, dots: geometry.rings[0].map(o => ({x: o[0], y: o[1]}))}, layer[0]).centerAtPolygon(geometry);
  };

  const setValue = (res, idx) => { // 设置统计值
    const {count} = res;
    const {state: {list}} = target;
    target.setState({list: list.map((x, i) => (i === idx ? Object.assign(x, {count, zt: 2}) : x))});
  };

  const change = (item) => { // 选择图层事件
    const {tview, curLayer: {layerid} = {}} = target.state;
    if (layerid === item.layerid) return;
    const {flds} = item;
    target.setState({
      curLayer: item,
      tview: {
        ...tview,
        table: { ...tview.table, source: [], widthModel: true, columns: flds.map(getColum), width: 200 * flds.length},
      },
    }, () => { api.clearLayer(layer[1]).closeTip(); queryData(drawShape); });
  };

  const validator = (_, value, callback) => { // 验证区域范围
    const {geometry} = value || {};
    if (geometry && geometry.spatialReference) callback();
    else callback('区域范围不能为空，请点击右侧区域工具来添加');
  };

  const setArea = (data) => { // 业务区域设置
    const {name, areaPolygon} = data;
    target.setState({show: false, select: '', selectTip: `区域：${name}`}, () => {
      target.form.setFieldsValue({AREA: {geometry: {type: 'polygon', rings: [JSON.parse(areaPolygon).map(o => [o.x, o.y])], spatialReference: api.getSpatialReference()}}});
    });
  };

  const showAttr = (record) => { // 显示属性
    const {geo} = record;
    const {tview: {table: {columns}}} = target.state;
    if (!isNaN(geo.x)) {
      api.sharkPonit({geometry: geo}, {markersize: 8}).showTip(geo.x, geo.y, '设备属性', columns.map(x => ({name: x.title, value: x.render ? x.render(record[x.dataIndex]) : record[x.dataIndex]})));
    } else if (Array.isArray(geo.paths)) {
      const {paths: [paths]} = geo;
      const length = paths.length - 1;
      const [x1, y1] = paths[Math.floor(length / 2)];
      const [x2, y2] = paths[Math.ceil(length / 2)];
      api.sharkLine({geometry: geo}, {width: 5}).showTip((x1 + x2) / 2, (y1 + y2) / 2, '管线属性', columns.map(o => ({name: o.title, value: o.render ? o.render(record[o.dataIndex]) : record[o.dataIndex]})));
    }
  };

  const goPage = (pageno, pagesize) => { // 页面跳转
    const {curLayer: {layerid}, params} = target.state;
    if (isNaN(layerid) || !params) { message.info('请先查询'); return; }
    target.setState({loading: true, loadmsg: '正在查询数据'}, () => netQuery(ecode, layerid, Object.assign(params, {pageno, pagesize})).then(res => {
      const {count, features} = res;
      const {tview} = target.state;
      target.setState({ loading: false, tview: { ...tview, page: {...tview.page, current: pageno, pageSize: pagesize, total: count }, table: {...tview.table, source: features.map(x => ({...x.attributes, geo: x.geometry})) }}});
    }));
  };

  const queryData = (draw) => { // 查询地图要素和表格
    const {curLayer: {layerid, lx, name}, params} = target.state;
    if (isNaN(layerid) || !params) return;
    if (draw) {
      const list = [
        netQuery(ecode, layerid, Object.assign(params, {pageno: 1})).then(data => {
          const {count, features} = data;
          const {tview} = target.state;
          target.setState({ loadmsg: '正在查询地图元素数据', tview: { ...tview, page: {...tview.page, current: 1, pageSize: params.pagesize, total: count }, table: {...tview.table, source: features.map(x => ({...x.attributes, geo: x.geometry})) }}});
        }),
        netQuery(ecode, layerid, {...params, pagesize: maxSize, outFields: 'gid'}).then(data => {
          const {features} = data;
          target.setState({ loadmsg: '正在查表格数据'}, () => {
            if (Array.isArray(features)) {
              if (lx === 1) api.drawFeaturesPoint(features, layer[1], {click: pointClick, layerIndex: 100});
              else if (lx === 3) api.drawFeaturesLine(features, layer[1], {click: lineClick, layerIndex: 100, width: 5});
            }
          });
        }),
      ];
      target.setState({loading: true, loadmsg: '正在查询数据中'}, () => Promise.all(list).then(() => target.setState({loading: false})));
    } else goPage(1, params.pagesize);
    attr.bind(ecode, layerid, name).start();
  };

  const closeAreaDialog = () => { // 关闭区域选择对话框
    target.setState({show: false, select: ''}, recovery);
  };

  const closeDialog = () => { // 关闭区域选择对话框
    api.clearLayer(layer).closeTip();
    attr.stop();
  };

  const pointClick = (point) => { // 点击设备
    const {attributes: {gid}, geometry: {x, y}} = point;
    const {tview: {table: {columns}}, curLayer: {layerid}, params} = target.state;
    api.closeTip().centerAt({x, y}).sharkPonit(point, {markersize: 8});
    clearTimeout(val);
    val = setTimeout(() => {
      netQuery(ecode, layerid, {...params, pageno: 1, where: `gid=${gid}`}).then(res => {
        const {features: [{attributes: record = {}} = {}] = []} = res;
        api.showTip(x, y, '设备属性', columns.map(o => ({name: o.title, value: o.render ? o.render(record[o.dataIndex]) : record[o.dataIndex]})));
      });
    }, 500);
  };

  const lineClick = (line) => { // 点击管线
    const {attributes: {gid}, geometry: {paths: [paths]}} = line;
    const length = paths.length - 1;
    const [x1, y1] = paths[Math.floor(length / 2)];
    const [x2, y2] = paths[Math.ceil(length / 2)];
    const {tview: {table: {columns}}, curLayer: {layerid}, params} = target.state;
    api.closeTip().centerAt([(x1 + x2) / 2, (y1 + y2) / 2]).sharkLine(line, {width: 5});
    clearTimeout(val);
    val = setTimeout(() => {
      netQuery(ecode, layerid, {...params, pageno: 1, where: `gid=${gid}`}).then(res => {
        const {features: [{attributes: record = {}} = {}] = []} = res;
        api.showTip((x1 + x2) / 2, (y1 + y2) / 2, '管线属性', columns.map(o => ({name: o.title, value: o.render ? o.render(record[o.dataIndex]) : record[o.dataIndex]})));
      });
    }, 500);
  };

  const areaCfg = [ // 查询配置项
    {
      icon: 'scan',
      tip: '当前范围',
      query: () => {
        const geometry = api.getMapExtent();
        const {xmin, ymin, xmax, ymax, spatialReference} = geometry;
        const dots = [{x: xmin, y: ymin}, {x: xmin, y: ymax}, {x: xmax, y: ymax}, {x: xmax, y: ymin}, {x: xmin, y: ymin}];
        api.clearLayer(layer[0]).stopEditer().polygon({gid: 1, dots}, layer[0]);
        target.setState({select: '', selectTip: '当前范围'}, () => target.form.setFieldsValue({AREA: {geometry: {type: 'polygon', rings: [dots.map(o => [o.x, o.y])], spatialReference}}}));
      },
    },
    {
      icon: 'rectangle',
      itarget: <span className={styles.rectangle} />,
      tip: '矩形范围',
      query: () => {
        const {params} = target.state;
        if (target.state.select !== 'rectangle') {
          attr.stop();
          target.setState({select: 'rectangle'}, () => api.startRectange(layer[0]).then(geo => {
            if (params) attr.start();
            const {xmin, ymin, xmax, ymax, spatialReference} = geo;
            const dots = [{x: xmin, y: ymin}, {x: xmin, y: ymax}, {x: xmax, y: ymax}, {x: xmax, y: ymin}, {x: xmin, y: ymin}];
            target.setState({select: '', selectTip: '矩形范围'}, () => target.form.setFieldsValue({AREA: {geometry: {type: 'polygon', rings: [dots.map(o => [o.x, o.y])], spatialReference}}}));
          }));
        } else target.setState({select: ''}, () => { api.stopEditer(); recovery(); if (params) attr.start(); });
      },
    },
    {
      icon: 'polygon',
      itarget: <span className={styles.polygon} />,
      tip: '多边形范围',
      query: () => {
        const {params} = target.state;
        if (target.state.select !== 'polygon') {
          attr.stop();
          target.setState({select: 'polygon'}, () => api.startPolygon(layer[0]).then(geo => {
            if (params) attr.start();
            target.setState({select: '', selectTip: '多边形范围'}, () => target.form.setFieldsValue({AREA: {geometry: geo}}));
          }));
        } else target.setState({select: ''}, () => { api.stopEditer(); recovery(); if (params) attr.start(); });
      },
    },
    {
      icon: 'business',
      itarget: <span className={styles.business} />,
      tip: '业务区域选择',
      query: () => {
        api.stopEditer();
        if (target.state.select !== 'business') {
          target.setState({select: 'business', show: !target.state.show}, () => api.clearLayer(layer[0]));
        }
      },
    },
    {
      icon: 'delete',
      tip: '清空数据',
      type: 'danger',
      query: () => {
        api.stopEditer();
        attr.stop();
        const {tview, list} = target.state;
        target.setState({select: '', selectTip: '', params: null, tview: {...tview, table: {...tview.table, source: []}}, list: list.map(x => Object.assign(x, {zt: 0}))}, () => {
          target.form.setFieldsValue({LAYER: undefined, AREA: {geometry: undefined}});
          api.clearLayer(layer).closeTip();
        });
      },
    },
    {
      icon: 'search',
      tip: '统计查询',
      type: 'primary',
      name: '查询',
      query: () => {
        api.stopEditer().clearLayer(layer[1]).closeTip();
        const {state: {list}, form} = target;
        form.validateFields((err, values) => {
          if (!err) {
            const params = getParams(values);
            target.setState({select: '', params, loading: 'true', loadmsg: '正在查询统计数据。。。', list: list.map(x => Object.assign(x, {zt: 1}))}, () => {
              Promise.all(list.map((x, i) => netQuery(ecode, x.layerid, {...params, returnCountOnly: true}).then(res => setValue(res, i)))).then(() => queryData(drawShape));
            });
          }
        });
      },
    },
  ];

  const initState = (res) => {
    const nets = res.metainfo.reduce((a, b) => a.concat(b.net), []);
    const list = nets.map(x => ({name: x.dname, layerid: x.layerid, lx: x.geometrytype, zt: 0, count: 0, flds: x.fields.filter(o => /[\u4e00-\u9fa5]/.test(o.alias))}));
    const getComponent = () => <SelectArea tip="点此处查询区域☞" select={target.state.select} area={target.state.selectTip} items={areaCfg} />;
    const {linkData: {selectAreaName, geometry, init = false} = {}} = target.props; // 预留外部调用查询初始化

    const state = {
      loading: false,
      list,
      evts: {change, setArea, closeDialog, closeAreaDialog},
      selectTip: selectAreaName,
      form: {
        flds: [{disptype: 0, insertrule: '1-1-1', updaterule: 0, alias: '', name: 'AREA', getRules() { return [validator]; }, getComponent}],
        data: {area: {geometry}},
      },
      tview: {
        loading: false,
        loadmsg: '正在读取数据',
        page: { current: 1, pageSize: 20, total: 0, sizeList: ['20', '40', '80'], onChange: goPage, setSize: goPage},
        table: { source: [], columns: [], props: {onRow: (record) => ({onDoubleClick: () => { showAttr(record); }})}},
      },
    };
    target.setState(state, () => {
      change(list[0]);
      if (geometry && geometry.rings) api.polygon({gid: 1, dots: geometry.rings[0].map(o => ({x: o[0], y: o[1]}))}, layer[0]).centerAtPolygon(geometry);
      if (init) areaCfg.filter(x => x.icon === 'search').forEach(x => x.query()); // 预留外部调用时，自动查询
    });
  };

  getMetas(ecode).then(initState); // 入口函数
};

export default class StaticQuery extends React.Component {
  state = {show: false, loading: true, loadmsg: '正在加载数据'}
  componentWillMount() { bindHepler(this); }
  componentWillUnmount() {
    const {evts: {closeDialog = empty} = {}} = this.state;
    closeDialog();
  }
  render() {
    const {mapTarget, onClose} = this.props;
    const {list = [], curLayer = {}, evts: {change = empty, setArea = empty, closeAreaDialog = empty} = {}, form: {data, flds = []} = {}, show, tview = {}, loading, loadmsg} = this.state;
    return (
      <DialogCtrl minModel destroyOnClose {...{loading, loadmsg, top: 60, left: 10, title: '统计查询', footer: null, width: 750, bodyStyle: {padding: '2px'}, onCancel: onClose}}>
        <div style={{height: '550px'}}>
          <PanelCtrl
            header={(
              <FormCtrl ref={(c) => { this.form = c; }} edite flds={flds} data={data} btns={<div />} />
            )}
          >
            <PanelCtrl direction="col" size={[25, 75]}>
              <div style={{height: '100%', marginRight: '2px', border: '1px solid #e8e8e8', overflow: 'auto'}}>
                {list.map((x, i) => <div onClick={() => change(x)} className={x.layerid === curLayer.layerid ? `${styles.item_select} ${styles.item}` : styles.item} key={`layer${i * 1}`}>{x.name}：{getDesc(x, curLayer)}</div>)}
              </div>
              {isNaN(curLayer.layerid) ? <ContentTip msg="请在查询条件中选择图层" style={{border: '1px solid #e8e8e8', height: '100%'}} /> : <TableCtrl {...tview} /> }
            </PanelCtrl>
          </PanelCtrl>
          {show && <YwArea mapTarget={mapTarget} layer={layer[0]} onSuccess={setArea} onClose={closeAreaDialog} />}
        </div>
      </DialogCtrl>
    );
  }
}
