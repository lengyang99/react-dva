import React, { Component } from 'react';
import { connect } from 'dva';
import { Table, Popconfirm } from 'antd';


@connect(state => ({
  listData: state.PcAppMapConfig.listData,
}))
class List extends Component {
  componentDidMount() {
  }
  clickEdit = (record) => { // 修改
    this.props.dispatch({
      type: 'PcAppMapConfig/showModal',
      payload: true,
    });
    this.props.dispatch({
      type: 'PcAppMapConfig/setDetailData',
      payload: {
        gid: record.gid,
        module: record.module,
        ecode: record.ecode,
        name: record.name,
      },
    });
  };
  clickDelete = (record) => { // 删除
    this.props.dispatch({
      type: 'PcAppMapConfig/deleteListData',
      payload: record.gid,
      callback: () => {
        this.props.dispatch({
          type: 'PcAppMapConfig/fetchListData',
          payload: {
            ecode: undefined,
            module: undefined,
          },
        });
      },
    });
  };
  render() {
    const { listData } = this.props;
    const columns = [
      {
        title: '所属平台',
        dataIndex: 'module',
        key: 'module',
      },
      {
        title: '企业名称',
        dataIndex: 'ename',
        key: 'ename',
      },
      {
        title: '图层名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '修改人',
        dataIndex: 'gmtModifiedby',
        key: 'gmtModifiedby',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={this.clickEdit.bind(this, record)}>编辑</a>
            <span className="divider" />
            <Popconfirm
              title="确定删除?一旦删除，不可撤销！"
              onConfirm={this.clickDelete.bind(this, record)}
              okText="是"
              cancelText="否"
            >
              <a>删除</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <div>
        <Table
          columns={columns}
          dataSource={listData}
          rowKey="gid"
          // rowSelection={{
          //   onChange: (selectedRowKeys, selectedRows) => {
          //     console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          //   },
          // }}
        />
      </div>
    );
  }
}

export default List;
