/**
 * @author TreeList 树组件
 * @desc tree 组件的方法等同于 antd tree 提供的方法
 */

import React, { PureComponent } from 'react';
import { Tree, Input, Tabs } from 'antd';
import propTypes from 'prop-types';

const TreeNode = Tree.TreeNode;
const TabPane = Tabs.TabPane;

const loop = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children')) {
      return <TreeNode title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} key={ele.id.toString()} />;
    } else {
      return (
        <TreeNode title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} key={ele.id.toString()}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};

const NoSearchComponent = () => (<p style={{ textAlign: 'center', marginTop: 10 }}>暂无搜索结果</p>);

class TreeLists extends PureComponent {
  static propTypes = {
    treeDataArr: propTypes.array, //  树型结构的数据
    width: propTypes.oneOfType([propTypes.string, propTypes.number]), // 组件的宽度
    height: propTypes.oneOfType([propTypes.string, propTypes.number]), // 组件的高度
    className: propTypes.string, // 组件的样式
  };

  static defaultProps = {
    width: '',
    height: '',
    className: '',
    treeDataArr: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      treeData: [],
      style: {
        width: props.width,
        height: props.height,
      },
    };
  }
  componentWillReceiveProps(nextProp) {
    this.setState({
      list: nextProp.treeDataArr,
      treeData: nextProp.treeDataArr,
    });
  }

  onChange = (e) => {
    const searchValue = e.target.value;
    const { list } = this.state;
    const temp = [];

    /**
     * @desc 递归需要过滤数据的列表
     * @param {Array} dataList
     * @param {String} value
     */
    const filterData = (dataList, value) => {
      if (Array.isArray(dataList)) {
        dataList.forEach(ele => {
          if (ele.name.indexOf(value) === -1 && ele.hasOwnProperty('children')) {
            filterData(ele.children, value);
          } else if (ele.name.indexOf(value) > -1) {
            temp.push(ele);
          }
        });
      }
    };
    filterData(list, searchValue);
    this.setState({
      treeData: searchValue ? temp : list,
    });
  };

  render() {
    const { className, ...otherProps } = this.props;
    const { treeData, style } = this.state;
    return (
      <div style={style} className={className}>
        <Input placeholder="根据位置名称查询" style={{ marginBottom: 20, height: 30, fontSize: 13 }} onChange={this.onChange} />
        <Tabs type="card" style={{ width: 280 }}>
          <TabPane tab="位置树" key="1">
            {treeData.length === 0 ? <NoSearchComponent /> : <Tree showLine {...otherProps}>{loop(treeData)}</Tree>}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default TreeLists;
