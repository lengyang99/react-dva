/**
 * Created by wxj on 2018/7/19.
 */
/**
 * 工程编号
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Table, Spin, Input, message } from 'antd';
import styles from './index.less';
import { getAttachInfo } from '../../services/seeMedia';
import { getCurrTk } from '../../utils/utils.js';

@connect(state => ({
  fromData: state.submitFormManage.formData.params,
  data: state.engineeringCode.data,
  columns: state.engineeringCode.columns,
  loading: state.engineeringCode.loading,
  pageno: state.engineeringCode.pageno,
  visible: state.engineeringCode.visible,
  totalPage: state.engineeringCode.totalPage,
  selectedRowKeys: state.engineeringCode.selectedRowKeys,
  selectedRows: state.engineeringCode.selectedRows,
  fields: state.engineeringCode.fields,
}))
class EngineeringCode extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  onChangeValue = () => {
    this.props.dispatch({
      type: 'engineeringCode/loadData',
      payload: {
        loading: true,
        visible: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'engineeringCode/tableQuery',
      payload: {
        pageno: 1,
        pagesize: 10,
        workType: this.props.codeName,
      },
    });
  }
  handleCancel = (e) => {
    this.props.dispatch({
      type: 'engineeringCode/loadData',
      payload: {
        visible: false,
      },
    });
  }
  handleOk = (e) => {
    const obj = {};
    const { selectedRows, fromData, fields } = this.props;
    if (selectedRows.length > 0) {
      for (const el of fromData.values()) {
        if (el.visible === 1) {
          for (const elem of fields.values()) {
            if (el.alias === elem.title) {
              if (el.type === 'IMG' || el.type === 'ADO' || el.type === 'ATT') {
                obj[el.name] = [];
                // 处理文件
                getAttachInfo(selectedRows[0][elem.key]).then((res) => {
                  if (!res.success) {
                    message.info(res.msg);
                    return;
                  }
                  res.data.forEach((item) => {
                    obj[el.name].push({
                      uid: item.id,
                      name: item.filename,
                      url: `${window.location.origin}/proxy/attach/downloadFile?id=${item.id}&token=${getCurrTk()}`,
                    });
                  });
                });
              } else {
                obj[el.name] = selectedRows[0][elem.key];
              }
            }
          }
        }
      }
    }
    this.props.onChangeValue(obj);
    this.props.dispatch({
      type: 'engineeringCode/loadData',
      payload: {
        visible: false,
      },
    });
  }
  // 隔行换色
  setRowClassName = (record, index) => {
    if (index % 2 !== 0) {
      return styles.doubleRow;
    }
  };
  // 显示总页数
  showTotal = total => {
    return `共${total}条数据`;
  };
  // 分页改变
  tablePageChange = pagination => {
    this.props.dispatch({
      type: 'engineeringCode/loadData',
      payload: {
        loading: true,
        selectedRowKeys: [],
        selectedRows: [],
      },
    });
    this.props.dispatch({
      type: 'engineeringCode/tableQuery',
      payload: {
        pageno: pagination.current,
        pagesize: 10,
        workType: this.props.codeName,
      },
    });
  };
  render() {
    return (
      <div className={styles.span} >
        <Input
          value={this.props.value}
          onClick={this.onChangeValue}
        />
        <Modal
          title="工程编号"
          visible={this.props.visible}
          onOk={this.handleOk}
          width={800}
          onCancel={this.handleCancel}
        >
          <div style={{ textAlign: 'center', width: '100%', height: '100% ' }}>
            <Spin tip="Loading..." spinning={this.props.loading}>
              <Table
                dataSource={this.props.data}
                columns={this.props.columns}
                style={{ width: '100%', height: '100%', padding: '0 20px' }}
                bordered
                pagination={{
                  current: this.props.pageno,
                  pageSize: 10,
                  total: this.props.totalPage,
                  showTotal: this.showTotal,
                }}
                rowClassName={this.setRowClassName}
                onChange={this.tablePageChange}
                rowSelection={{
                  onChange: (selectedRowKeys, selectedRows) => {
                    this.props.dispatch({
                      type: 'engineeringCode/loadData',
                      payload: {
                        selectedRowKeys,
                        selectedRows,
                      },
                    });
                  },
                  type: 'radio',
                  selectedRowKeys: this.props.selectedRowKeys,
                }}
              />
            </Spin>
          </div>
        </Modal>
      </div>
    );
  }
}

export default EngineeringCode;
