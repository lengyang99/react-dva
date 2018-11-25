import React, { Component } from 'react';
import { Input, Table } from 'antd';
import { fetchMalfunctionFirstOrder } from '../../services/malfunction';

export default class MalfunctionPanel extends Component {
  constructor() {
    super();
    this.state = {
      dataSource: [],
      filterData: [],
    };
  }

  componentDidMount() {
    fetchMalfunctionFirstOrder().then(({ success, data }) => {
      if (success) {
        this.setState({ dataSource: data, filterData: data });
      }
    });
  }

  /**
   * @desc 过滤故障列表
   * @param {object} e - dom 对象
   */
  handleChange = e => {
    const value = e.target.value;
    const data = this.state.dataSource.filter(item => item.failCode.indexOf(value) !== -1 || item.description.indexOf(value) !== -1);
    this.setState({ filterData: data });
  };

  render() {
    const columns = [
      { title: '分类代码', dataIndex: 'failCode' },
      { title: '故障分类', dataIndex: 'description' },
    ];
    return (
      <div>
        <Input
          style={{ marginBottom: 20 }}
          onChange={this.handleChange}
          placeholder="输入分类代码，故障分类模糊搜索"
        />
        <Table
          {...this.props}
          rowKey="gid"
          dataSource={this.state.filterData}
          columns={columns}
        />
      </div>
    );
  }
}
