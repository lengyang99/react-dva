import React from 'react';
import { Button, message } from 'antd';
import {guid, DialogCtrl, FormCtrl, FormFieldCtrl, PanelCtrl, TableCtrl, TabsCtrl, ContentTip} from '../controls';
import SelectArea from '../extends/SelectArea';
import YwArea from './YwArea';
import { getUserInfo } from '../../../../utils/utils';
import MapApi from '../utils';
import attrTool from '../utils/attribute';
import { getMetas, netQuery } from '../../../../services/thematicStatistics';

import styles from './style.less';

const layer = [`layer_${guid()}`, `layer_${guid()}`];

const empty = () => {};

const bindHepler = (target) => { // bind模式将对象实现分离，保证函数内部封装性, 相当于Model的功能，但其支持派生，支持多个实例和共享
  let val = -1;
  let qdata = null;
  const {drawShape = false} = target.props; // 绘图模式， 启动后，自己绘制地图数据
  const maxSize = 30000; // 最大查询地图要素值
  const {user: {ecode}} = getUserInfo();
  const {props: {mapTarget}} = target;
  const api = new MapApi(mapTarget); // 地图操作核心对象
  const attr = drawShape ? {start: () => attr, stop: () => attr, bind: () => attr} : attrTool(api);

  const convertValues = (arr) => (typeof arr[0] === 'string' ? arr.map(x => ({dbval: x, dispval: x})) : arr); // 元数据枚举值处理

  const getValue = (lx, data, idx) => { // 获取配置值
    const field = data[`field_${lx}`];
    const match = data[`match_${lx}`];
    let value = data[`value_${lx}`];
    const relation = data[`relation_${lx}`];
    if (match === 'like') value = `'%${value}%'`;
    else if (typeof value.format === 'function') value = `'${value.format('YYYY-MM-DD')}'`;
    else if (isNaN(value)) value = `'${value}'`;
    return (idx > 0 ? [relation] : []).concat([field, match, value]);
  };

  const getType = (obj) => { // 支持的集中字段类型
    if (obj.values.length > 0) return 'dropdown';
    switch (obj.esritype) {
      case 'esriFieldTypeOID':
      case 'esriFieldTypeSmallInteger':
      case 'esriFieldTypeInteger':
        return 'int';
      case 'esriFieldTypeDate':
        return 'date';
      default:
        return 'string';
    }
  };

  const getColum = (fd, idx) => { // 获取表格字段
    const colum = { title: fd.alias, dataIndex: fd.name, key: idx, width: fd.width || 200, disptype: fd.disptype, values: fd.values};
    if (Array.isArray(fd.values) && fd.values.length > 0) {
      const vals = convertValues(fd.values).reduce((a, b) => Object.assign(a, {[`_${b.dbval}`]: b.color ? <span style={{color: b.color}}>{b.dispval}</span> : b.dispval}), {});
      colum.render = (text) => vals[`_${text}`] || text || '';
    }
    return colum;
  };

  const validateFields = (e, formObj) => { //  表单验证
    return new Promise((resolve, reject) => {
      formObj.validateFields((err, values) => {
        e.preventDefault();
        if (!err) resolve(values);
        else reject(err);
      });
    });
  };

  const getParams = (res) => { // 获取查询的数据内容
    const [{LAYER, AREA}, form] = res;
    const {find: {glx, name}, qform: {items}, tview: {page: {pageSize}}} = target.state;
    const where = items.map((item, idx) => getValue(item.key, form, idx)).reduce((a, b) => a.concat(b), []);
    return {
      glx,
      name,
      layerid: LAYER,
      params: {
        returnGeometry: true,
        geometryType: 'esriGeometryPolygon',
        f: 'json',
        geometry: JSON.stringify(AREA.geometry),
        where: where.length > 0 ? where.join(' ') : '1=1',
        pageno: 1,
        pagesize: pageSize,
        withCount: true,
      },
    };
  };

  const recovery = () => { // 地图恢复功能
    const {geometry} = target.form.getFieldValue('AREA') || {};
    if (geometry && geometry.rings) api.polygon({gid: 1, dots: geometry.rings[0].map(o => ({x: o[0], y: o[1]}))}, layer[0]).centerAtPolygon(geometry);
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

  const validator = (_, value, callback) => { // 验证区域范围
    const {geometry} = value || {};
    if (geometry && geometry.spatialReference) callback();
    else callback('区域范围不能为空，请点击右侧区域工具来添加');
  };

  const changeFld = (item) => { // 表单类型切换事件
    const {key, field} = item;
    const {qform} = target.state;
    const {items} = qform;
    target.setState({qform: {...qform, items: items.map(x => (x.key === key ? Object.assign(x, {field, match: '=', value: undefined}) : x))}});
  };

  const addItem = () => { // 添加条件
    const {qform} = target.state;
    const {items} = qform;
    target.setState({qform: {...qform, items: items.concat({key: guid(), relation: 'and'})}});
  };

  const delItem = (key) => { // 删除条件
    const {qform} = target.state;
    const {items} = qform;
    target.setState({qform: {...qform, items: items.filter((x) => x.key !== key)}});
  };

  const clear = () => { // 清空数据
    const {qform, tview} = target.state;
    target.setState({find: null, qform: {...qform, items: [], flds: []}, tview: {...tview, table: {...tview.table, source: []}}}, () => {
      qdata = null;
      target.form.setFieldsValue({LAYER: undefined, AREA: {geometry: undefined}});
      api.clearLayer(layer).closeTip();
    });
  };

  const changeTabs = (key) => { // 切换Tabs
    target.setState({activeKey: key});
  };

  const goPage = (pageno, pagesize) => { // 页面跳转
    if (!qdata) { message.info('请先查询'); return; }
    const {layerid, params} = qdata;
    target.setState({loading: true, loadmsg: '正在查询数据'}, () => netQuery(ecode, layerid, Object.assign(params, {pageno, pagesize})).then(res => {
      const {count, features} = res;
      const {tview} = target.state;
      target.setState({ loading: false, activeKey: '1', tview: { ...tview, page: {...tview.page, current: pageno, pageSize: pagesize, total: count }, table: {...tview.table, source: features.map(x => ({...x.attributes, geo: x.geometry})) }}});
    }));
  };

  const queryData = (draw) => { // 查询地图要素和表格
    const {layerid, glx, name, params} = qdata;
    if (isNaN(layerid) || !params) return;
    if (draw) {
      const list = [
        netQuery(ecode, layerid, params).then(data => {
          const {count, features} = data;
          const {tview} = target.state;
          target.setState({ loadmsg: '正在查询地图元素数据', activeKey: '1', tview: { ...tview, page: {...tview.page, current: params.pageno, pageSize: params.pagesize, total: count }, table: {...tview.table, source: features.map(x => ({...x.attributes, geo: x.geometry})) }}});
        }),
        netQuery(ecode, layerid, {...params, pagesize: maxSize, outFields: 'gid'}).then(data => {
          const {features} = data;
          target.setState({ loadmsg: '正在查表格数据'}, () => {
            if (Array.isArray(features)) {
              if (glx === 1) api.drawFeaturesPoint(features, layer[1], {click: pointClick, layerIndex: 100});
              else if (glx === 3) api.drawFeaturesLine(features, layer[1], {click: lineClick, layerIndex: 100, width: 5});
            }
          });
        }),
      ];
      target.setState({loading: true, loadmsg: '正在查询数据中'}, () => Promise.all(list).then(() => target.setState({loading: false})));
    } else goPage(1, params.pagesize);
    attr.bind(ecode, layerid, name).start();
  };

  const query = (e) => { // 点击查询逻辑在此
    Promise.all([validateFields(e, target.form), validateFields(e, target.qform)]).then((res) => {
      qdata = getParams(res);
      queryData(drawShape);
    });
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
    const {tview: {table: {columns}}} = target.state;
    const {layerid, params} = qdata;
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
    const {tview: {table: {columns}}} = target.state;
    const {layerid, params} = qdata;
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
        if (target.state.select !== 'rectangle') {
          attr.stop();
          target.setState({select: 'rectangle'}, () => api.startRectange(layer[0]).then(geo => {
            if (qdata) attr.start();
            const {xmin, ymin, xmax, ymax, spatialReference} = geo;
            const dots = [{x: xmin, y: ymin}, {x: xmin, y: ymax}, {x: xmax, y: ymax}, {x: xmax, y: ymin}, {x: xmin, y: ymin}];
            target.setState({select: '', selectTip: '矩形范围'}, () => target.form.setFieldsValue({AREA: {geometry: {type: 'polygon', rings: [dots.map(o => [o.x, o.y])], spatialReference}}}));
          }));
        } else target.setState({select: ''}, () => { api.stopEditer(); recovery(); if (qdata) attr.start(); });
      },
    },
    {
      icon: 'polygon',
      itarget: <span className={styles.polygon} />,
      tip: '多边形范围',
      query: () => {
        if (target.state.select !== 'polygon') {
          attr.stop();
          target.setState({select: 'polygon'}, () => api.startPolygon(layer[0]).then(geo => {
            if (qdata) attr.start();
            target.setState({select: '', selectTip: '多边形范围'}, () => target.form.setFieldsValue({AREA: {geometry: geo}}));
          }));
        } else target.setState({select: ''}, () => { api.stopEditer(); recovery(); if (qdata) attr.start(); });
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
      tip: '清空区域',
      type: 'danger',
      query: () => {
        api.stopEditer();
        attr.stop();
        target.setState({select: '', selectTip: ''}, () => {
          target.form.setFieldsValue({AREA: {geometry: undefined}});
          api.clearLayer(layer[0]).closeTip();
        });
      },
    },
  ];

  const initState = (res) => { // 构造目标对象的state
    const nets = res.metainfo.reduce((a, b) => a.concat(b.net), []);
    const props = {onChange(value) {
      const {qform, tview} = target.state;
      const [{fields, dname, geometrytype}] = nets.filter((x) => x.layerid === value);
      const flds = fields.filter(x => /[\u4e00-\u9fa5]/.test(x.alias));
      target.setState({
        find: {glx: geometrytype, name: dname},
        qform: {...qform, flds: flds.map((o) => ({alias: o.alias, name: o.name, lx: getType(o), values: convertValues(o.values)})), items: []},
        tview: {
          ...tview,
          table: { ...tview.table, source: [], widthModel: true, columns: flds.map(getColum), width: 200 * flds.length},
        },
      }, () => api.clearLayer(layer[1]));
    }};
    const getComponent = () => <SelectArea select={target.state.select} area={target.state.selectTip} items={areaCfg} />;
    const state = {
      loading: false,
      evts: {changeTabs, addItem, clear, setArea, closeDialog, closeAreaDialog, query},
      form: {
        flds: [
          {disptype: 5, insertrule: '1-1-1', updaterule: 4, nullable: 1, alias: '选择图层', name: 'LAYER', values: nets.map((x) => ({dbval: x.layerid, dispval: x.dname})), props},
          {disptype: 0, insertrule: '1-2-1', updaterule: 0, alias: '', name: 'AREA', getRules() { return [validator]; }, getComponent},
        ],
      },
      qform: { flds: [], items: [], changeFld, delItem},
      tview: {
        loading: false,
        loadmsg: '正在读取数据',
        page: { current: 1, pageSize: 20, total: 0, sizeList: ['20', '40', '80'], onChange: goPage, setSize: goPage},
        table: { source: [], columns: [], props: {onRow: (record) => ({onDoubleClick: () => { showAttr(record); }})}},
      },
    };
    target.setState(state);
  };

  getMetas(ecode).then(initState); // 入口函数
};

export default class QueryFilter extends React.Component {
  state = {activeKey: '0', show: false, loading: true, loadmsg: '正在加载数据'}
  componentWillMount() { bindHepler(this); }
  componentWillUnmount() {
    const {evts: {closeDialog = empty} = {}} = this.state;
    closeDialog();
  }
  render() {
    const {mapTarget, onClose} = this.props;
    const {activeKey, show, loading, loadmsg, find, form = {}, qform = {}, tview = {}, evts = {}} = this.state;
    const {changeTabs = empty, addItem = empty, clear = empty, query = empty, setArea = empty, closeAreaDialog = empty} = evts;
    return (
      <DialogCtrl minModel destroyOnClose {...{loading, loadmsg, top: 60, left: 10, title: '条件查询', footer: null, width: activeKey === '1' ? 750 : 580, bodyStyle: {padding: '2px'}, onCancel: onClose}}>
        <div style={{height: '550px'}}>
          <TabsCtrl tabs={['查询条件', '查询结果']} props={{activeKey}} onChange={changeTabs}>
            <PanelCtrl
              header={<FormCtrl ref={(c) => { this.form = c; }} edite flds={form.flds || []} btns={<div />} />}
              footer={(
                <div style={{display: 'flex', justifyContent: 'space-between', padding: '4px 0 2px 0'}}>
                  <Button disabled={!find} icon="plus" onClick={addItem}>添加</Button>
                  <div style={{textAlign: 'right'}}>
                    <Button icon="delete" type="danger" style={{ marginRight: '6px'}} onClick={clear}>清空</Button>
                    <Button icon="search" type="primary" loading={loading} onClick={query}>查询</Button>
                  </div>
                </div>
              )}
            >
              <div style={{border: '1px solid #e8e8e8', height: '100%'}}>
                {find ? <FormFieldCtrl edite ref={(c) => { this.qform = c; }} {...qform} /> : <ContentTip msg="请选择图层" /> }
              </div>
            </PanelCtrl>
            {find ? <TableCtrl {...tview} /> : <ContentTip msg="请在查询条件中选择图层" style={{border: '1px solid #e8e8e8', height: '100%'}} /> }
          </TabsCtrl>
          {show && <YwArea mapTarget={mapTarget} layer={layer[0]} onSuccess={setArea} onClose={closeAreaDialog} />}
        </div>
      </DialogCtrl>
    );
  }
}
