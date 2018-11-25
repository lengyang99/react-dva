import React, { Component } from 'react';
import { Table } from 'antd';
import propTypes from 'prop-types';
import update from 'immutability-helper';

export default class List extends Component {
  static propTypes = {
    dataSource: propTypes.object.isRequired,
    filterOption: propTypes.object.isRequired,
    fetchList: propTypes.func.isRequired,
    changeModalOption: propTypes.func.isRequired,
    handleClick: propTypes.func.isRequired,
    handleDoubleClick: propTypes.func.isRequired,
  };
  /**
   * @desc 分页改变事件
   * @param {number} current - 当前页码
   * @param {number} size - 每页条数
   */
  handleChange = (current, size) => {
    const options = update(this.props.filterOption, {
      $merge: {
        pageNum: current,
        pageSize: size,
      },
    });
    this.props.changeModalOption(options);
    this.props.fetchList(options);
  };
  /**
   * @desc 排序
   * @param {number} current - 当前页码
   * @param {number} size - 每页条数
   * @param {object} filters - 过滤
   * @param {object} sorter - 排序
   */
  handleTableChange = ({ current, pageSize }, filters, sorter) => {
    if (sorter && sorter.field) {
      const sortField = sorter.field.split('').map(letter => (/[A-Z]/.test(letter) ? `_${letter.toLowerCase()}` : letter)).join('');
      const sortRule = sorter.order.replace('end', '');
      this.props.handleSort(update(this.props.filterOption, { $merge: { sortField, sortRule }}));
    }
  };
  render() {
    const { dataSource: {pageInfo}, column, ...props } = this.props;
    let columns = [];
    if (column.length) {
      columns = column;
    } else {
      columns = [
        {
          title: '设备编码',
          dataIndex: 'eqCode',
          width: 170,
          sorter: true,
        },
        {
          title: '设备名称',
          dataIndex: 'eqName',
          sorter: true,
        },
        {
          title: '所属站点',
          dataIndex: 'stationName',
          width: 100,
          sorter: true,
        },
        {
          title: '位置',
          dataIndex: 'posDesc',
          sorter: true,
        },
        {
          title: '安装日期',
          dataIndex: 'instalDate',
          width: 100,
          sorter: true,
        },
      ];
    }
    return (
      <Table
        {...props}
        size="small"
        columns={columns}
        rowKey="gid"
        onRow={(record, index) => ({
          onClick: this.props.handleClick.bind('', record, index),
          onDoubleClick: this.props.handleDoubleClick.bind('', record, index),
        })}
        pagination={{
          current: pageInfo ? pageInfo.pageNum : 1,
          pageSize: pageInfo ? pageInfo.pageSize : 10,
          total: pageInfo ? pageInfo.total : 0,
          onChange: this.handleChange,
        }}
        dataSource={pageInfo ? pageInfo.list : []}
        onChange={this.handleTableChange}
      />
    );
  }
}
