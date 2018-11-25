import React, { Component } from 'react';
import { Row, Col } from 'antd';
import propTypes from 'prop-types';
import { fetchLedger } from '../../services/eqLedger';
import Side from './Side';
import List from './List';
import ToolBar from './ToolBar';

export default class Equipment extends Component {
  static propTypes = {
    sideClass: propTypes.string,
    sideStyle: propTypes.object,
    treeConfig: propTypes.object,
    tableConfig: propTypes.object,
    onClick: propTypes.func,
    onDoubleClick: propTypes.func,
  };
  static defaultProps = {
    sideClass: '',
    sideStyle: {},
    treeConfig: {},
    tableConfig: {},
    onClick: () => {},
    onDoubleClick: () => {},
  };

  state = {
    column: [],
    dataSource: {
      list: [],
    },
    filterOption: {
      keyword: undefined,
      site: undefined,
      parentId: undefined,
      locGid: undefined,
      clsGid: undefined,
      pageNum: 1,
      pageSize: 10,
    },
  };

  componentDidMount() {
    this.fetchEqList(this.state.filterOption);
  }
  /**
   * @desc table row 点击事件
   * @param {object} record
   * @param {number} index
   */
  handleClick = (record, index) => {
    this.props.onClick(record, index);
  };
  /**
   * @desc table row 双击事件
   * @param record
   * @param index
   */
  handleDoubleClick = (record, index) => {
    this.props.onDoubleClick(record, index);
  };
  /**
   * @desc 获取设备列表
   * @param {object} options - 筛选条件
   */
  fetchEqList = (options) => {
    fetchLedger(options).then(({ success, data }) => {
      if (success) {
        this.setState({
          dataSource: data,
        });
      }
    });
  };
  /**
   * @desc 改变筛选条件
   * @param options
   */
  changeModalOption = (options) => {
    this.setState({
      filterOption: options,
    });
  };
  /**
   * @desc 树节点选择
   * @param options
   */
  handleTreeSelect = (options) => {
    this.setState({
      filterOption: options,
    });
  };
  /**
   * @desc 表格行排序
   * @param options
   */
  handleSort = (options) => {
    this.fetchEqList(options);
  };
  /**
   * @desc 动态改变行显示
   * @param value
   */
  handleRowChange = (value) => {
    const column = value.map(ele => {
      return {
        title: ele.label,
        dataIndex: ele.key,
        width: 100,
        sorter: true,
      };
    });
    this.setState({
      column,
    });
  };
  render() {
    return (
      <Row>
        <Col span={4}>
          <Side
            {...this.props.treeConfig}
            filterOption={this.state.filterOption}
            fetchList={this.fetchEqList}
            handleSelect={this.handleSelect}
            handleTreeSelect={this.handleTreeSelect}
          />
        </Col>
        <Col span={19} offset={1}>
          <Row>
            <ToolBar
              filterOption={this.state.filterOption}
              fetchList={this.fetchEqList}
              changeModalOption={this.changeModalOption}
              handleRowChange={this.handleRowChange}
            />
          </Row>
          <Row>
            <List
              {...this.props.tableConfig}
              column={this.state.column}
              dataSource={this.state.dataSource}
              filterOption={this.state.filterOption}
              fetchList={this.fetchEqList}
              changeModalOption={this.changeModalOption}
              handleClick={this.handleClick}
              handleDoubleClick={this.handleDoubleClick}
              handleSort={this.handleSort}
            />
          </Row>
        </Col>
      </Row>
    );
  }
}
