/**
 * @author malfunction 树组件
 * @desc tree 组件的方法等同于 antd tree 提供的方法
 */

import React, { Component } from 'react';
import { Tree, Input } from 'antd';
import propTypes from 'prop-types';
import classnames from 'classnames';
import { fetchMalList } from '../../services/malfunction';

const TreeNode = Tree.TreeNode;
const NoSearchComponent = () => (<p style={{ textAlign: 'center', marginTop: 10 }}>暂无搜索结果</p>);

export default class MalfunctionTree extends Component {
  static propTypes = {
    type:  propTypes.string, // 数据类型
    width: propTypes.oneOfType([propTypes.string, propTypes.number]), // 组件的宽度
    className: propTypes.string, // 组件的样式
    treeType: propTypes.oneOf(['malfunction', 'solution']), // tree 的类型
  };

  static defaultProps = {
    type: 'DDL',
    className: '',
    width: 280,
    treeType: 'solution',
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      treeData: [],
      style: {
        width: props.width,
        height: props.height,
        overflow: props.overflow,
      },
    };
  }

  componentDidMount() {
    fetchMalList().then(({ success, data }) => {
      if (success) {
        let treeData = [];
        const filterMalfunction = list => list.map(ele => {
          if (ele.hasOwnProperty('children') && Array.isArray(ele.children)) { // 判断 ele 元素有没有 children,如果有 children 移除
            const children = ele.children.map(malfunction => {
              delete malfunction.children;
              return malfunction;
            });
            return {
              ...ele,
              children,
            };
          } else {
            return ele;
          }
        });
        switch (this.props.treeType) {
          case 'malfunction':
            treeData = filterMalfunction(data);
            break;
          case 'solution':
            treeData = data;
            break;
          default:
            return;
        }
        this.setState({
          list: data,
          treeData,
        });
      }
    });
  }

  loop = (list) => {
    if (this.props.type === 'TREE') {
      return !Array.isArray(list) ? null : list.map(ele => {
        if (!ele.hasOwnProperty('children') && Array.isArray(ele.children)) {
          return <TreeNode title={`(${ele.data.typeName})${ele.name}`} key={ele.id.toString()} />;
        } else {
          return (
            <TreeNode title={`(${ele.data.typeName})${ele.name}`} key={ele.id.toString()}>
              {this.loop(ele.children)}
            </TreeNode>
          );
        }
      });
    } else {
      return !Array.isArray(list) ? null : list.map(ele => {
        return <TreeNode title={`(${ele.data.typeName})${ele.name}`} key={ele.id.toString()} />;
      });
    }
  };

  onChange = (e) => {
    const searchValue = e.target.value;
    const { list } = this.state;
    const temp = [];
    /**
     * @desc 递归需要过滤数据的列表
     * @param {Array} arr
     * @param {String} value
     */
    const filterData = (arr, value) => {
      if (Array.isArray(arr)) {
        arr.forEach(ele => {
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
      <div style={style} className={classnames('malfunction-tree', className)}>
        <Input placeholder="请输入需要索引的内容" onChange={this.onChange} />
        {treeData.length === 0 ? <NoSearchComponent /> : <Tree showLine {...otherProps}>{this.loop(treeData)}</Tree>}
      </div>
    );
  }
}
