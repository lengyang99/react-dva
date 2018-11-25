import React from 'react';
import { connect } from 'dva';
import {Button, Select, DatePicker, message, Upload, Icon} from 'antd';
import Dialog from '../../components/yd-gis/Dialog/Dialog';

import styles from './css/emerRecoverGasSupply.css';

const Option = Select.Option;


@connect(state => ({
  user: state.login.user,
  currentClickEvent: state.emerLfMap.currentClickEvent, // 当前应急事件
}))

export default class EmerRecoverGasSupply extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      attachedFileList: [],
    };
    message.config({
      duration: 2,
    });
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 恢复供气
  handleRecoverGasSupply = () => {
    let data = {};
    data.eventId = this.props.currentClickEvent.alarmId;
    data.userId = this.props.user.gid;
    data.userName = this.props.user.trueName;
    data.ecode = this.props.user.ecode;
    // setTimeout(function () {


    // }, 1000);
    this.props.dispatch({
      type: 'emer/sendRecoverGasSupplyNotice',
      payload: data,
      callback: (res) => {
        message.info('成功恢复供气');
      },
    });
    // 关闭窗口
    this.props.onCancel();
  }

  render = () => {
    const {onCancel} = this.props;
    const uploadProps = {
      onRemove: (file) => {
        this.setState(({attachedFileList}) => {
          const index = attachedFileList.indexOf(file);
          const newFileList = attachedFileList.slice();
          newFileList.splice(index, 1);
          return {
            attachedFileList: newFileList,
          };
        });
      },
      beforeUpload: (file) => {
        this.setState(({attachedFileList}) => ({
          attachedFileList: [...attachedFileList, file],
        }));
        return false;
      },
      fileList: this.state.attachedFileList,
    };
    return (
      <Dialog
        title="恢复供气"
        width={430}
        onClose={onCancel}
        position={{
          top: 175,
          left: 450,
        }}
      >
        <div style={{margin: 10}}>
          <div className={styles.recoverGasItem}>
            <span>保压是否合格：</span>
            <Select defaultValue="1" style={{width: 70, display: 'inline-block'}}>
              <Option value="1">是</Option>
              <Option value="0">否</Option>
            </Select>
          </div>
          <div className={styles.recoverGasItem}>
            <span>恢复供气时间：</span>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择时间"
            />
          </div>
          <div style={{marginLeft: 15, marginBottom: 5}}>
            <span style={{display: 'inline-block', width: 105, marginRight: 5, fontSize: 14}}>现场照片：</span>
            <Upload {...uploadProps}>
              <Button><Icon type="file-add" />选择附件</Button>
            </Upload>
          </div>
          <div style={{marginLeft: 15}}>
            <Button type="primary" size="small" onClick={this.handleRecoverGasSupply.bind(this)}>提交</Button>
          </div>
        </div>
      </Dialog>
    );
  }
}
