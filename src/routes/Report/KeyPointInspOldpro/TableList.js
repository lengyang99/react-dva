import React, { PureComponent } from 'react';
import {Table} from 'antd';

export default class TableList extends PureComponent {
  render() {
    const { handleTableChange, pagination, keyPonitData} = this.props;
    const newData = keyPonitData;
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
        title: '关键点总数(个)',
        dataIndex: 'pointTotal',
      },
      {
        title: '已完成数量(个)',
        dataIndex: 'pointFinish',
      },
      {
        title: '完成率(%)',
        dataIndex: 'completeRate',
      },
      {
        title: '巡线里程(km)',
        dataIndex: 'onlineLength',
      },
      {
        title: '在线时长(小时)',
        dataIndex: 'onlineTime',
      },
    ];
    return (
      <div>
        <Table
          dataSource={newData || []}
          columns={columns}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey={record => record.gid}
        />
      </div>
    );
  }
}
