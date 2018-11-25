import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal, Popconfirm, Table } from 'antd';

@connect(
  state => ({
    enumListVisible: state.sortmanagement.enumListVisible,
    enumObj: state.sortmanagement.enumObj,
    enumList: state.sortmanagement.enumList,
  })
)

class EnumList extends PureComponent {
  componentDidMount = () => {
  };
  handleCancel = () => {
    this.props.dispatch({
      type: 'sortmanagement/toggleEnumListModal',
      payload: false,
    });
  };
  handleClickAddEnum = () => {
    this.props.dispatch({
      type: 'sortmanagement/setEnum',
      payload: {},
    });
    this.props.dispatch({
      type: 'sortmanagement/toggleEnumEditModal',
      payload: true,
    });
  }
  handleClickDeleteEnum = (record) => {
    const params = {
      gid: record.gid,
      classspecGid: record.classspecGid,
    };
    this.props.dispatch({
      type: 'sortmanagement/deleteEnum',
      payload: params,
    });
  }
  handleClickUpdateEnum = (record) => {
    this.props.dispatch({
      type: 'sortmanagement/setEnum',
      payload: record,
    });
    this.props.dispatch({
      type: 'sortmanagement/toggleEnumEditModal',
      payload: true,
    });
  }

  render() {
    const { enumListVisible, enumList } = this.props;

    const columns = [
      {
        title: '序号',
        dataIndex: 'gid',
        key: 'gid',
      }, {
        title: '值',
        dataIndex: 'enumVal',
        key: 'enumVal',
      }, {
        title: '名称',
        dataIndex: 'description',
        key: 'description',
      }, {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          return (
            <span>
              <Popconfirm
                title="确定删除吗？"
                onConfirm={this.handleClickDeleteEnum.bind(this, record)}
                onCancel={this.handleCancel.bind(this)}
                okText="确定"
                cancelText="取消"
              >
                <a>删除　</a>
              </Popconfirm>
              <span className="ant-divider" />
              <a onClick={this.handleClickUpdateEnum.bind(this, record)}>修改</a>
            </span>
          );
        },
      },
    ];

    return (
      <Modal
        width={1000}
        visible={enumListVisible}
        title="编辑枚举值"
        onCancel={this.handleCancel.bind(this)}
        footer={[
          <Button key="back" size="large" onClick={this.handleCancel.bind(this)}>返回</Button>,
        ]}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <Button type="primary" onClick={this.handleClickAddEnum.bind(this)}>添加</Button>
          </div>
          <Table rowKey="gid" columns={columns} dataSource={enumList} />
        </div>
      </Modal>
    );
  }
}

export default EnumList;
