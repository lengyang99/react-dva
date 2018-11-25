import React, { Component } from 'react';
import { Table } from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const data = [
  { id: 1, name: 'item1' },
  { id: 2, name: 'item2' },
  { id: 3, name: 'item3' },
  { id: 4, name: 'item4' },
  { id: 5, name: 'item5' },
  { id: 6, name: 'item6' },
];

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: 'name',
    dataIndex: 'name',
  },
];

@DragDropContext(HTML5Backend)
export default class DragTable extends Component {
  render() {
    return <Table rowKey="id" dataSource={data} columns={columns} {...this.props} />;
  }
}
