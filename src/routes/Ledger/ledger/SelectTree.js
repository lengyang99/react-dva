import React, { Component } from 'react';
import { TreeSelect } from 'antd';
import propTypes from 'prop-types';

const TreeNode = TreeSelect.TreeNode;

/**
 * @desc 递归树结构
 * @param {[]} list
 * @return {jsx}
 */
const loop = list => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (typeof ele.children === 'undefined' && Array.isArray(ele.children)) {
      return <TreeNode ccode={ele.ccode} title={ele.name} key={ele.id} value={ele.id} />;
    } else {
      return (
        <TreeNode ccode={ele.ccode} title={ele.name} key={ele.id.toString()} value={ele.id.toString()}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};

export default class SelectTree extends Component {
  static propTypes = {
    style: propTypes.object,
  };
  static defaultProps = {
    style: {},
  };
  /**
   * @desc 根据树节点的名称过滤树
   * @param {string} filterValue - 索引值
   * @param {jsx} treeNode - jsx 对象
   * @return {boolean}
   */
  filterFunc = (filterValue, treeNode) => {
    return treeNode.props.title.indexOf(filterValue) > -1 || treeNode.props.value.indexOf(filterValue) > -1;
  };

  render() {
    const { style, ...other } = this.props;
    return (
      <TreeSelect
        showSearch
        allowClear
        dropdownStyle={{ maxHeight: 300 }}
        {...other}
        dropdownMatchSelectWidth={false}
        filterTreeNode={this.filterFunc}
        style={style}
      >
        {loop(this.props.dataSource)}
      </TreeSelect>
    );
  }
}
