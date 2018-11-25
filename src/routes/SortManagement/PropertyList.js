import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Modal, Popconfirm, Table } from 'antd';

@connect(
  state => ({
    funs: state.login.funs,
    classification: state.sortmanagement.classification,
    loginEcode: state.sortmanagement.loginEcode,
    pageNum: state.sortmanagement.propertyPageList.pageNum,
    pageSize: state.sortmanagement.propertyPageList.pageSize,
    total: state.sortmanagement.propertyPageList.total,
    data: state.sortmanagement.propertyPageList.list,
    classspecGid: state.sortmanagement.classspecGid,
  })
)

class PropertyList extends PureComponent {
  componentDidMount = () => {
    // this.handleClickQueryProperty();
  };
  handleClickAddProperty = () => {
    if (this.props.classification.gid !== '-1') {
      this.props.dispatch({
        type: 'sortmanagement/setProperty',
        payload: {},
      });
      this.props.dispatch({
        type: 'sortmanagement/toggleModal',
        payload: true,
      });
    } else {
      Modal.info({
        title: '请先选择分类，再添加分类的属性！',
        content: (
          <div>
            <p>点击左端树的某一节点</p>
          </div>
        ),
        onOk() {},
      });
    }
  };

  handleClickDeleteProperty = (record) => {
    const params = {
      gid: record.gid,
      classification: {
        clsGid: this.props.classification.gid,
        pageNum: this.props.pageNum,
        pageSize: this.props.pageSize,
      },
    };
    this.props.dispatch({
      type: 'sortmanagement/deleteProperty',
      payload: params,
    });
  };

  handleClickUpdateProperty = (record) => {
    this.props.dispatch({
      type: 'sortmanagement/setProperty',
      payload: record,
    });
    this.props.dispatch({
      type: 'sortmanagement/toggleModal',
      payload: true,
    });
  };
  // 查询列表
  handleClickQueryProperty = () => {
    const params = {
      clsGid: this.props.classification.gid,
      pageNum: this.props.pageNum,
      pageSize: this.props.pageSize,
    };
    this.props.dispatch({
      type: 'sortmanagement/queryProperty',
      payload: params,
    });
  };

  handleClickListEnum = (record) => {
    this.props.dispatch({
      type: 'sortmanagement/queryEnum',
      payload: record.gid,
    });
    this.props.dispatch({
      type: 'sortmanagement/setClassspecGid',
      payload: record.gid,
    });
    this.props.dispatch({
      type: 'sortmanagement/toggleEnumListModal',
      payload: true,
    });
  }

  render() {
    const { loginEcode, pageNum, pageSize, total, data, funs } = this.props;
    let sortmanagement_add = true; // 设备分类添加
    let sortmanagement_edit = true; // 设备分类编辑
    let sortmanagement_delete = true; // 设备分类删除
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='sortmanagement_add') {
        sortmanagement_add = false;
      }
      if (json.code=='sortmanagement_edit') {
        sortmanagement_edit = false;
      }
      if (json.code=='sortmanagement_delete') {
        sortmanagement_delete = false;
      }
    }
    const formerColumns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
        render: (text, record, index) => {
          return (index + 1);
        },
      }, {
        title: '属性名称',
        dataIndex: 'description',
        key: 'description',
        width: 200,
      }, {
        title: '单位',
        dataIndex: 'measureunit',
        key: 'measureunit',
      }, {
        title: '类型',
        dataIndex: 'enumType',
        key: 'enumType',
      }, {
        title: '是否为父级属性',
        dataIndex: 'isParent',
        key: 'isParent',
        render: (text) => {
          if (!text || text === '0') {
            return '否';
          } else {
            return '是';
          }
        },
      }, {
        title: '是否必填',
        dataIndex: 'isRequired',
        key: 'isRequired',
        render: (text) => {
          if (!text || text === '0') {
            return '否';
          } else {
            return '是';
          }
        },
      }, {
        title: '默认值',
        dataIndex: 'dfltVal',
        key: 'dfltVal',
      },
    ];

    const middleColumns = [
      {
        title: '所属组织',
        dataIndex: 'orgName',
        key: 'orgName',
      },
    ];
    const latterColumns = [
      {
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (this.props.loginEcode === '0') { // 当前登录用户为集团用户 可以删除
            if (record.enumType === '下拉框') { // 记录类型为下拉框 可以编辑枚举值
              return (
                <span>
                  <Popconfirm
                    title="确定删除吗？"
                    onConfirm={this.handleClickDeleteProperty.bind(this, record)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a disabled={sortmanagement_delete}>删除　</a>
                  </Popconfirm>
                  <span className="ant-divider" />
                  <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                  <span className="ant-divider" />
                  <a onClick={this.handleClickListEnum.bind(this, record)}>编辑枚举值</a>
                </span>
              );
            } else {
              return (
                <span>
                  <Popconfirm
                    title="确定删除吗？"
                    onConfirm={this.handleClickDeleteProperty.bind(this, record)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <a disabled={sortmanagement_delete}>删除　</a>
                  </Popconfirm>
                  <span className="ant-divider" />
                  <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                </span>
              );
            }
          } else { // 当前登录用户为下属单位用户
            if (this.props.code === '0') { // 记录属于集团用户定义的 不能删除
              if (record.enumType === '下拉框') { // 记录类型为下拉框 可以编辑枚举值
                return (
                  <span>
                    <span className="ant-divider" />
                    <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                    <span className="ant-divider" />
                    <a onClick={this.handleClickListEnum.bind(this, record)}>编辑枚举值</a>
                  </span>
                );
              } else {
                return (
                  <span>
                    <span className="ant-divider" />
                    <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                  </span>
                );
              }
            } else { // 记录不属于集团用户定义的 可以删除
              if (record.enumType === '下拉框') {
                return (
                  <span>
                    <Popconfirm
                      title="确定删除吗？"
                      onConfirm={this.handleClickDeleteProperty.bind(this, record)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a disabled={sortmanagement_delete}>删除　</a>
                    </Popconfirm>
                    <span className="ant-divider" />
                    <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                    <span className="ant-divider" />
                    <a onClick={this.handleClickListEnum.bind(this, record)}>编辑枚举值</a>
                  </span>
                );
              } else {
                return (
                  <span>
                    <Popconfirm
                      title="确定删除吗？"
                      onConfirm={this.handleClickDeleteProperty.bind(this, record)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <a disabled={sortmanagement_delete}>删除　</a>
                    </Popconfirm>
                    <span className="ant-divider" />
                    <a disabled={sortmanagement_edit} onClick={this.handleClickUpdateProperty.bind(this, record)}>修改　</a>
                  </span>
                );
              }
            }
          }
        },
      },
    ];
    let columns = [];
    if (loginEcode === '0') {
      columns = formerColumns.concat(latterColumns);
    } else {
      columns = formerColumns.concat(middleColumns).concat(latterColumns);
    }

    const pagination = {
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total_, range) => {
        const totalRow = total_ % this.props.pageSize === 0 ? total_ % this.props.pageSize === 0 : Math.ceil(total_ / this.props.pageSize);
        return <div>共 {total_} 条记录 第{this.props.pageNum}/{totalRow}页</div>;
      },
      current: pageNum,
      pageSize: pageSize,
      total: total,
      onChange: (current, _pageSize) => {
        const queryParams = {
          clsGid: this.props.classification.gid,
          pageNum: current,
          pageSize: _pageSize,
        };
        this.props.dispatch({
          type: 'sortmanagement/queryProperty',
          payload: queryParams,
        });
      },
      onShowSizeChange: (current, _pageSize) => {
        const queryParams = {
          clsGid: this.props.classification.gid,
          pageNum: current,
          pageSize: _pageSize,
        };
        this.props.dispatch({
          type: 'sortmanagement/queryProperty',
          payload: queryParams,
        });
      },
    };

    return (
      <div>
        <div style={{ marginBottom: 10 }}>
          <Button type="primary" disabled={sortmanagement_add} onClick={this.handleClickAddProperty.bind(this)}>添加属性</Button>
        </div>
        <Table rowKey="gid" columns={columns} dataSource={data} pagination={pagination} />
      </div>
    );
  }
}

export default PropertyList;
