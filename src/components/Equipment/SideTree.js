import React, { Component } from 'react';
import { Tree } from 'antd';
import propTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';

const TreeNode = Tree.TreeNode;

const loop = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (typeof ele.children === 'undefined' && Array.isArray(ele.children)) {
      return <TreeNode title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} key={ele.id} />;
    } else {
      return (
        <TreeNode title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} key={ele.id}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};

const NoSearchComponent = () => (<p style={{ textAlign: 'center', marginTop: 10 }}>暂无搜索结果</p>);

export default class SideTree extends Component {
  static propTypes = {
    dataSource: propTypes.array.isRequired,
  };

  render() {
    const { dataSource, ...otherProps } = this.props;
    return <Scrollbars style={{ height: 460 }}>{dataSource.length === 0 ? <NoSearchComponent /> : <Tree showLine {...otherProps}>{loop(dataSource)}</Tree>}</Scrollbars>;
  }
}
