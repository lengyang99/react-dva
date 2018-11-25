import React from 'react';
import {Tree} from 'antd';

const TreeNode = Tree.TreeNode;

export default class EmerOrganization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // selectedTreeNode: [],
    };
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 生成应急组织结构树
  createEmerOrganizationTree = (data) => {
    let treeNodes = [{
      name: '应急组织机构',
      gid: 0,
      children: [],
    }];
    for (let i = 0; i < data.length; i += 1) {
      treeNodes[0].children.push({
        name: data[i].name,
        gid: `${data[i].gid}`,
        children: data[i].children || [],
      });
    }
    return treeNodes;
  }
  // 填充树节点
  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.name) {
        return (
          <TreeNode title={item.name} key={item.gid} dataRef={item}>
            {this.renderTreeNodes(item.children || [])}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });
  }

  render = () => {
    const {emerOrganizationData, associateEmerOrganization, defaultSelectAll} = this.props;
    // 应急组织结构树
    let treeNodes = this.createEmerOrganizationTree(emerOrganizationData);
    console.log(this.props.emerOrganizationGids);
    return (
      <div style={{width: '230px', height: '236px', overflow: 'auto'}}>
        <Tree
          checkable
          checkedKeys={{checked: this.props.emerOrganizationGids, halfChecked:[]}}
          onCheck={associateEmerOrganization}
          defaultExpandAll
          checkStrictly={true}
        >
          {this.renderTreeNodes(treeNodes)}
        </Tree>
      </div>
    );
  }
}
