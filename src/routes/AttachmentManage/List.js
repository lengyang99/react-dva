import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Popconfirm } from 'antd';
import update from 'immutability-helper';

@connect(state => ({
  attachmentList: state.attachmentManage.attachmentList,
  searchOption: state.attachmentManage.searchOption,
}))
class List extends PureComponent {
  componentDidMount() {
    this.props.dispatch({
      type: 'attachmentManage/fetchAttachmentList',
      payload: this.props.searchOption,
    });
  }
  clickDelete = record => {
    this.props.dispatch({
      type: 'attachmentManage/deleteAttachment',
      payload: record.gid,
      cbk: () => {
        this.props.dispatch({
          type: 'attachmentManage/fetchAttachmentList',
          payload: this.props.searchOption,
        });
      },
    });
  };
  handleChange = (current, size) => {
    const searchOption = update(this.props.searchOption, { $merge: { pageNum: current, pageSize: size }});
    this.props.dispatch({
      type: 'attachmentManage/setSearchOption',
      payload: searchOption,
    });
    this.props.dispatch({
      type: 'attachmentManage/fetchAttachmentList',
      payload: searchOption,
    });
  };
  render() {
    const columns = [
 /*     {
        title: '所属业务',
        dataIndex: 'business',
      },*/
      {
        title: '附件名称',
        dataIndex: 'fileName',
      },
      {
        title: '附件类型',
        dataIndex: 'attachmentType',
      },
      {
        title: '上传人',
        dataIndex: 'gmtCreateby',
      },
      {
        title: '上传时间',
        dataIndex: 'gmtCreate',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span>
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
    const { attachmentList } = this.props;
    return (
      <div>
        <Table
          rowKey="gid"
          dataSource={attachmentList ? attachmentList.list : []}
          columns={columns}
          pagination={{
            current: attachmentList && attachmentList.pageNum,
            pageSize: attachmentList && attachmentList.pageSize,
            total: attachmentList && attachmentList.total,
            onChange: this.handleChange,
            onShowSizeChange: this.handleChange,
            showSizeChanger: true,
            showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {attachmentList.total} </span>条</span>),
          }}
        />
      </div>
    );
  }
}

export default List;
