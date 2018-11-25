import React, { Component } from 'react';
import { Input, Tabs } from 'antd';
import propTypes from 'prop-types';
import classnames from 'classnames';
import update from 'immutability-helper';
import SideTree from './SideTree';
import { fetchLocationTree } from '../../services/eqLocation';
import { fetchClassifyTree } from '../../services/eqClassification';
import { initOption } from './initOption';

const Pane = Tabs.TabPane;

const filterData = (list, filterValue) => {
  const temp = [];
  const loopData = (arr, value) => {
    if (Array.isArray(arr)) {
      arr.forEach(ele => {
        if (ele.name.indexOf(value) === -1 && Array.isArray(ele.children)) {
          loopData(ele.children, value);
        } else if (ele.name.indexOf(value) > -1) {
          temp.push(ele);
        }
      });
    }
  };
  loopData(list, filterValue);
  return temp;
};

export default class Side extends Component {
  static propTypes = {
    sideClass: propTypes.string,
    sideStyle: propTypes.object,
    handleSelect: propTypes.func,
    treeConfig: propTypes.object,
    filterOption: propTypes.object,
    fetchList: propTypes.func,
    changeModalOption: propTypes.func,
  };

  static defaultProps = {
    sideClass: '',
    sideStyle: {},
    handleSelect: () => {},
    treeConfig: {},
    filterOption: {},
    fetchList: () => {},
    changeModalOption: () => {},
  };

  state = {
    placeholder: '位置',
    activeKey: 'position',
    list: [],
    filterList: [],
  };

  componentDidMount() {
    this.fetchData(this.state.activeKey);
  }

  /**
   * @desc 根据 tree 的类型,获取该类型的数据
   * @param {string} type - ['position' | 'classify']
   */
  fetchData(type) {
    switch (type) {
      case 'position':
        this.fetchPositionTree();
        break;
      case 'classify':
        this.fetchClassifyTree();
        break;
      default:
        console.error('activeKey 只能为 position 或 classify');
    }
  }

  /**
   * @desc 获取位置树数据
   */
  fetchPositionTree() {
    fetchLocationTree('ldgr').then(({ success, data }) => {
      if (success) {
        this.setState({
          list: data,
          filterList: data,
        });
      }
    });
  }

  /**
   * @desc 获取分类树数据
   */
  fetchClassifyTree() {
    fetchClassifyTree({param: 'ldgr'}).then(({ success, data }) => {
      if (success) {
        this.setState({
          list: data,
          filterList: data,
        });
      }
    });
  }

  /**
   * @desc 树 tab 选项卡切换事件
   * @param activeKey
   */
  handleChange = (activeKey) => {
    this.fetchData(activeKey);
    this.setState({
      activeKey,
      placeholder: activeKey === 'position' ? '位置' : '分类',
    });
  };
  /**
   * @desc 设备树 or 分类树 筛选
   * @param {object} e - dom 事件对象
   */
  handleFilter = (e) => {
    const searchValue = e.target.value;
    const filterList = filterData(this.state.list, searchValue);
    this.setState({
      filterList: searchValue ? filterList : this.state.list,
    });
  };
  /**
   * @desc 设备树 or 分类树点击事件
   * @param {[]} selectedKeys - 已选择的某个节点
   * @param {object} e - dom 事件
   */
  handleSelect = (selectedKeys, e) => {
    if (!selectedKeys.length) {
      return;
    }
    this.props.handleSelect(selectedKeys, this.state.activeKey, e);
    let options = {};
    if (this.state.activeKey === 'position') {
      options = update(this.props.filterOption, {
        $merge: {
          ...initOption,
          locGid: selectedKeys[0],
          clsGid: undefined,
        },
      });
    } else {
      options = update(this.props.filterOption, {
        $merge: {
          ...initOption,
          locGid: undefined,
          clsGid: selectedKeys[0],
        },
      });
    }
    this.props.handleTreeSelect(options, this.state.activeKey, e);
    this.props.changeModalOption(options);
    this.props.fetchList(options);
  };

  render() {
    const { sideClass, sideStyle, treeConfig } = this.props;
    return (
      <div style={Object.assign({ width: 200 }, sideStyle)} className={classnames(sideClass)}>
        <Input
          style={{ marginBottom: 10 }}
          placeholder={`请输入${this.state.placeholder}名称`}
          onChange={this.handleFilter}
        />
        <Tabs
          type="card"
          activeKey={this.state.activeKey}
          onChange={this.handleChange}
        >
          <Pane tab="位置树" key="position"><SideTree {...treeConfig} onSelect={this.handleSelect} dataSource={this.state.filterList} /></Pane>
          <Pane tab="分类树" key="classify"><SideTree {...treeConfig} onSelect={this.handleSelect} dataSource={this.state.filterList} /></Pane>
        </Tabs>
      </div>
    );
  }
}
