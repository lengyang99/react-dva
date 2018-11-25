import React from 'react';
import { Row, Col, Select, Cascader, Tree, Icon, Modal, message } from 'antd';
import Map from './Map';
import mapApi from './api';
import {DialogCtrl, TreeCtrl, PanelCtrl} from '../../../components/Map/MapQuery/controls';
import {getBustypeInfo, queryStation, getAreaByStationid, updateArea} from '../../../services/regionalManage';

const {Option} = Select;
const {TreeNode} = Tree;

const bindHelper = (target) => {
  const inspectBustype = 1; // 默认业务类型：巡视
  let checkedKeys = [];

  const getOptions = (items) => { // 获取行政区域
    return items.map(x => {
      const item = {value: x.stationCode, label: x.name};
      if (Array.isArray(x.children) && x.children.length > 0) item.children = getOptions(x.children);
      return item;
    });
  };

  const getValue = (items, key) => { // 获取数组的第一个指定字段名的值
    const [item = {}] = items; return item[key];
  };

  const getTitle = (node) => <span><span style={{color: '#2196f3'}}>{node.name}</span>-<span style={{color: '#f09e90'}}>{node.usernames}</span></span>; // 获取树的标题内容

  const getNodes = (items, icon = 'star') => { // 绘制树节点
    return items.map(node => (
      <TreeNode icon={<Icon style={{color: 'green'}} type={icon} />} title={getTitle(node)} key={node.areaid} data={node}>
        { Array.isArray(node.children) && getNodes(node.children, 'environment') }
      </TreeNode>
    ));
  };

  const getMenus = (item) => { // 弹出右键菜单项
    const {areaPolygon, name} = item;
    const {tree} = target.state;
    target.setState({tree: {...tree, menus: areaPolygon ? [{name: `编辑 ${name}`, lx: 1, attr: item}, {name: `定位 ${name}`, lx: 2, attr: item}] : []}});
  };

  const editer = ({menu}) => { // 右键菜单实现
    if (target.api) {
      const {attr: {areaPolygon, gid, areaid, children = []}, lx} = menu;
      const rings = [JSON.parse(areaPolygon)];
      if (!checkedKeys.some(y => y * 1 === areaid)) { // 没有选择，让其自动选中
        const {tree} = target.state;
        checkedKeys = checkedKeys.concat(children.map(x => `${x.areaid}`)).concat(`${areaid}`);
        target.setState({tree: {...tree, data: {...tree.data, checkedKeys}}}, showArea);
      }
      if (lx === 1) {
        message.info('在地图上右键提示：Enter键保存修改，Esc键退出修改');
        target.setState({props: {loading: true, loadmsg: '正在编辑区域'}}, () => target.api.centerAtPolygon({rings}).start({gid}).then(confirm(menu.attr), cancel));
      } else if (lx === 2) target.api.centerAtPolygon({rings});
    }
  };

  const confirm = (item) => (geo) => { // 编辑确认
    const {name, usernames} = item;
    Modal.confirm({
      title: `确认要修改区域${name}吗？`,
      content: `责任人：${usernames}`,
      centered: true,
      okText: '确认',
      cancelText: '取消',
      onOk() {
        const {gid, parentid, userid, ecode, pathPolygon = [], stationid, station, keypoints = [], code} = item;
        const area = {gid, parentid, userid, usernames, ecode, name, areaPolygon: geo[0].map(o => ({x: o[0], y: o[1]})), pathPolygon, stationid, station, keypoints, code};
        updateArea({area}).then(res => {
          target.setState({props: {loading: false}}, () => {
            const {success, msg} = res;
            if (success) { message.success('操作成功'); Object.assign(item, {areaPolygon: JSON.stringify(area.areaPolygon)}); } else message.error(msg);
          });
        });
      },
      onCancel: cancel,
    });
  };

  const cancel = () => target.setState({props: {loading: false}}, showArea); // 取消编辑

  const getLevel = (items) => { // 获取区域数组
    return items.filter(x => Array.isArray(x.children)).reduce((a, b) => a.concat(getLevel(b.children)), items);
  };

  const showArea = () => { // 显示区域
    if (target.api) {
      const {geometry} = target.state;
      const areas = getLevel(geometry).filter(x => checkedKeys.some(y => y * 1 === x.areaid) && x.areaPolygon);
      target.api.clear().showArea(areas.map(x => ({gid: x.gid, usernames: x.usernames, name: x.name, dots: JSON.parse(x.areaPolygon)})));
    }
  };

  const onChange = (msg) => { // 切换
    const {select: {value: selectValue}, cascader: {value: cascaderValue = [], options}} = target.state;
    const val = cascaderValue[cascaderValue.length - 1];
    const stationIds = getLevel(getLevel(options).filter(x => x.value === val)).map(x => x.value);
    target.setState({props: {loading: true, loadmsg: msg || '正在查询区域'}}, () => getAreaByStationid(stationIds.join(','), selectValue).then(res => {
      const {data: geometry} = res;
      const {tree} = target.state;
      target.setState({geometry, props: {loading: false}, tree: {...tree, treeNode: getNodes(geometry)}}, showArea);
    }));
  };

  const onCheck = (keys) => { // 区域选择事件
    checkedKeys = keys;
    const {tree} = target.state;
    target.setState({tree: {...tree, data: {...tree.data, checkedKeys}}}, showArea);
  };

  const initState = (res) => { //  设置初始化状态
    const [{data: options}, {data: stations}, {data: geometry}] = res;
    const items = getOptions(stations);
    target.setState({
      geometry,
      props: {loading: false},
      select: {options, value: getValue(options, 'gid'), onChange(value) { target.setState({select: {...target.state.select, value}}, onChange); }},
      cascader: {options: items, value: [getValue(items, 'value')], allowClear: false, changeOnSelect: true, onChange(value) { target.setState({cascader: {...target.state.cascader, value}}, onChange); }},
      tree: { titlekey: 'name', menuState: true, menus: [], action: editer, getMenus, treeNode: getNodes(geometry), data: {checkable: true, checkedKeys: [], showIcon: true, defaultExpandAll: true, onCheck}},
    });
  };

  target.setState({props: {loading: true, loadmsg: '正在读取数据'}}, () => Promise.all([getBustypeInfo(), queryStation(), getAreaByStationid('', inspectBustype)]).then(initState)); // 入口
};

export default class Page extends React.Component {
  componentWillMount() { bindHelper(this); }
  render() {
    const {select: {options = [], ...select} = {}, cascader, tree, props} = this.state || {};
    return ( // 高度外不能是响应式布局，导致内部高度需要加载后才可以正常显示 其实这baselayout用antd的加在方式就可以很简单的解决问题 120 = 50 + 70 (头部占用50个px， 低下认证占用70px)来的
      <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
        <Map mapId="regionalEdit" onMapLoad={c => { mapApi(c).then(api => { this.api = api; }); }} mapType="base" />
        <DialogCtrl minModel {...props} {...{title: '区域边缘捕捉', width: 400, top: 51, left: 206, closable: false, footer: null}}>
          <div style={{height: '500px'}}>
            <PanelCtrl
              header={(
                <div>
                  <Row>
                    <Col span={5}><span style={{lineHeight: '32px'}}>行政区域:</span></Col>
                    <Col span={19}>
                      <Cascader style={{width: '100%'}} {...cascader} placeholder="请选择行政区域" />
                    </Col>
                  </Row>
                  <Row style={{margin: '4px 0'}}>
                    <Col span={5}><span style={{lineHeight: '32px'}}>区域分组:</span></Col>
                    <Col span={19}>
                      <Select style={{width: '100%'}} {...select} placeholder="请选择区域分组" >{options.map(x => <Option key={x.gid} value={x.gid}>{x.businessname}</Option>)}</Select>
                    </Col>
                  </Row>
                </div>
              )}
              footer={<div style={{color: 'red', paddingTop: '8px'}}>右键树节点定位和编辑区域</div>}
            >
              <div style={{height: '100%', border: '1px solid #e8e8e8', overflow: 'auto'}}>
                {tree && <TreeCtrl {...tree} />}
              </div>
            </PanelCtrl>
          </div>
        </DialogCtrl>
      </div>
    );
  }
}
