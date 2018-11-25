import React from 'react';
import { Button, Tree, Icon, message } from 'antd';
import MapApi from '../utils';
import {DialogCtrl, PanelCtrl} from '../controls';
import {queryAreaData} from '../../../../services/patrol';

const {TreeNode} = Tree;

const getNode = (node, pkey, tkey) => {
  return (
    <TreeNode icon={node.icon && <Icon type={node.icon} />} title={node[tkey]} key={node[pkey]} data={node}>
      { node.children && node.children.map((item) => { Object.assign(item, {_parent: node}); return getNode(item, pkey, tkey); }) }
    </TreeNode>
  );
};

let treeData = null; // 不要问我为什么加这个参数，服务有毒，因为获取这个参数要15s+的时间，这里先缓存起来, ，第二次秒加载。

export default class YwArea extends React.Component {
  state = { nodes: [], loading: true, loadmsg: '正在加载数据'}
  componentWillMount() {
    if (treeData) this.setState({nodes: treeData, loading: false}, () => { this.api = new MapApi(this.props.mapTarget); });
    else {
      let idx = 0;
      const timer = 200; // 频率
      const total = 2.5 * 1000 / timer; // 预计2.5s加载完成
      const val = setInterval(() => {
        if (idx < total) this.setState({loadmsg: `正在读取数据,已完成${Math.floor(100 * (idx++) / total)}%`});
        else this.setState({loadmsg: '数据正在获取中，即将完成'}, () => clearInterval(val));
      }, timer);
      queryAreaData({}).then((res) => {
        treeData = res.data;
        this.setState({nodes: treeData, loading: false}, () => { this.api = new MapApi(this.props.mapTarget); }, () => clearInterval(val));
      });
    }
  }
  render() {
    const {onClose, onSuccess, layer} = this.props;
    const {nodes, loading, loadmsg} = this.state;
    const close = () => { if (this.api) { this.api.clearLayer(layer); onClose(); } else message.info('即将完成业务区域数据读取，请稍后。。。'); };
    return (
      <DialogCtrl center mask destroyOnClose {...{loading, loadmsg, footer: null, width: 300, title: '业务区域选择', bodyStyle: {padding: '4px'}, onCancel: close}}>
        <div style={{height: '380px'}}>
          <PanelCtrl
            footer={(
              <div style={{textAlign: 'right', paddingTop: '4px'}}>
                <Button icon="search" type="primary" loading={loading} onClick={() => { if (this.data) onSuccess(this.data); else message.info('请选择区域'); }}>确认</Button>
              </div>
            )}
          >
            <div style={{border: '1px solid #e8e8e8', height: '100%', overflow: 'auto'}}>
              <Tree
                onSelect={(_, target) => {
                  const {node: {props: {data}}} = target;
                  const {areaPolygon} = data;
                  this.data = data;
                  const dots = JSON.parse(areaPolygon);
                  this.api.clearLayer(layer);
                  this.api.polygon({gid: 1, dots}, layer).centerAtPolygon({rings: [dots.map(o => [o.x, o.y])]});
                }}
              >{nodes.map((x) => getNode(x, 'gid', 'name'))}</Tree>
            </div>
          </PanelCtrl>
        </div>
      </DialogCtrl>
    );
  }
}
