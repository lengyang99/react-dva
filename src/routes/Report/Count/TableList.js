import React, { PureComponent } from 'react';
import {Table} from 'antd';

export default class TableList extends PureComponent {
  getSumScore = (record = {}) => {
    let sum = 0;
    (Object.values(record) || []).forEach(item => {
      if (!isNaN(item)) {
        sum += item;
      }
    });
    return sum;
  }
  render() {
    const { handleTableChange, pagination, scoreData} = this.props;
    const {fields, data} = scoreData || {};
    const columns = [];
    columns.push({title: '用户姓名', dataIndex: 'username', fixed: 'left'});
    (fields || []).forEach(item => {
      const filed = {
        title: item.value,
        dataIndex: item.key,
      };
      columns.push(filed);
    });
    const sumScore =
    {title: '总分',
      dataIndex: 'sumScore',
      fixed: 'right',
      render: (text, record) => {
        return <span>{this.getSumScore(record)}</span>;
      },
    };
    columns.push(sumScore);
    return (
      <div>
        <Table
          dataSource={data || []}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{x: '350%'}}
          rowKey={record => record.username}
        />
      </div>
    );
  }
}
