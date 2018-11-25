import React, { PureComponent } from 'react';
import {Table} from 'antd';

export default class ReadModal extends PureComponent {
  render() {
    const {data} = this.props;
    const bcColumns = [{
      title: '类型',
      dataIndex: 'bcType',
      width: '15%',
    },
    {
      title: '人员',
      dataIndex: 'zbrList',
      width: '47%',
    },
    {
      title: '班次',
      dataIndex: 'bcName',
      width: '18%',
    },
    {
      title: '班次时间',
      dataIndex: 'bcTime',
      width: '20%',
      render: (text, record) => (
        <span>{`${record.bcStartTime}~${record.bcEndTime}`}</span>
      ),
    }];
    const bzColumns = [{
      title: '类型',
      dataIndex: 'bcType',
      width: '14%',
    },
    {
      title: '班组',
      dataIndex: 'bzName',
      width: '20%',
    },
    {
      title: '班组人员',
      dataIndex: 'zbrList',
      width: '30%',
      render: (text, record) => (<label><span><b>{record.monitorName}</b></span><span>{text && text !== '' ? `,${text}` : ''}</span></label>),
    },
    {
      title: '班次',
      dataIndex: 'bcName',
      width: '18%',
    },
    {
      title: '班次时间',
      dataIndex: 'bcTime',
      width: '18%',
      render: (text, record) => (
        <span>{`${record.bcStartTime}~${record.bcEndTime}`}</span>
      ),
    }];
    const columns = data && data.length !== 0 && data[0].bcType === '班组排班' ? bzColumns : bcColumns;
    return (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{y: 100}}
      />
    );
  }
}
