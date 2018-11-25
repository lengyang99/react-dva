import React, { PureComponent } from 'react';
import {Table} from 'antd';

export default class TableList extends PureComponent {
  render() {
    const { handleTableChange, pagination, maintaceData} = this.props;
    const newData = maintaceData;
    newData.forEach((item, index) => {
      Object.assign(item, {index: index + 1});
    });
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
      },
      {
        title: '辖区',
        dataIndex: 'zonename',
      },
      {
        title: '巡线员',
        dataIndex: 'username',
      },
      {
        title: '任务类型',
        dataIndex: 'taskType',
      },
      {
        title: '任务总数(个)',
        dataIndex: 'devTotal',
      },
      {
        title: '已完成数量(个)',
        dataIndex: 'devFinish',
      },
      {
        title: '完成率(%)',
        dataIndex: 'completeRate',
      },
    ];
    return (
      <div>
        <Table
          dataSource={newData || []}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey={record => record.index}
        />
      </div>
    );
  }
}
