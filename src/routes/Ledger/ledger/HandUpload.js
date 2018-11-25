import React, { Component } from 'react';
import { connect } from 'dva';
import { Upload } from 'antd';

@connect(
  state => ({
    fileList: state.ledger.fileList,
  })
)
export default class HandUpload extends Component {
  beforeUpload = (file) => {
    this.props.dispatch({
      type: 'ledger/setFileList',
      payload: [...this.props.fileList, file],
    });
    return false;
  };
  remove = (file) => {
    const { fileList } = this.props;
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    this.props.dispatch({
      type: 'ledger/setFileList',
      payload: newFileList,
    });
  };
  render() {
    const { fileList } = this.props;
    return (
      <div style={{ display: 'inline-block' }}>
        <Upload
          action="/proxy/attach/batch/upload"
          fileList={fileList}
          beforeUpload={this.beforeUpload}
          onRemove={this.remove}
        >
          {this.props.children}
        </Upload>
      </div>
    );
  }
}
