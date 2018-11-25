import React from 'react';
import { Tree, Icon } from 'antd';
import {getMenu, addEvent, removeEvent} from './common';

const {TreeNode} = Tree;

const getNode = (node, tkey) => {
  return (
    <TreeNode icon={node.icon && <Icon type={node.icon} />} title={node[tkey]} key={node.path} data={node}>
      { node.children && node.children.map((item) => { Object.assign(item, {_parent: node}); return getNode(item, tkey); }) }
    </TreeNode>
  );
};

export default class Control extends React.Component {
  state = { show: false, left: 0, top: 0}
  componentDidMount() {
    const {menuState = false} = this.props; // model ? 1 = 自己带有菜单 ：2 = 需要获取
    if (menuState) {
      this.handleClick = () => { if (this.state.show) this.setState({show: false}); };
      addEvent(document, 'click', this.handleClick);
    }
  }
  componentWillUnmount() {
    if (this.handleClick) removeEvent(document, 'click', this.handleClick);
  }
  render() {
    const {nodes = [], treeNode, data, menus, action, menuState = false, titlekey = 'name', getMenus} = this.props;
    const {show, left, top} = this.state;
    const props = menuState ? {...data,
      onRightClick: (e) => {
        const {event: { clientX, clientY }, node} = e;
        const { props: {data: val = {}}} = node;
        this.target = val;
        this.setState({show: true, left: clientX, top: clientY + 8});
        if (typeof (getMenus) === 'function') getMenus(val);
      }} : data;
    return (
      <div>
        <Tree {...props} >
          {treeNode || (Array.isArray(nodes) ? nodes.map(o => getNode(o, titlekey)) : nodes())}
        </Tree>
        {show && Array.isArray(menus) && menus.length > 0 && getMenu(menus, this.target, left, top, action)}
      </div>
    );
  }
}
