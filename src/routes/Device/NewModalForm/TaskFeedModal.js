import React, { Component } from 'react';
import { Modal, message} from 'antd';
import moment from 'moment';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal';

export default class TaskFeedModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnloading: false,
    };
  }
    feedForm=null;
    handleOk=() => {
      const {handleVisibleChange, dispatch, taskId, userInfo, handleBack, startTime} = this.props;
      const validate = this.feedForm.validateRequired();
      if (validate) {
        message.warning(`字段【${validate}】为空！`);
        return;
      }
      const params = this.feedForm.getValues();
      const paramsAtt = this.feedForm.getAttValues();
      const paramsAttArray = [];
      for (const key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({name: key, value: paramsAtt[key]});
        }
      }
      this.setState({btnloading: true});
      const diff = moment.duration(moment() - startTime, 'ms').as('milliseconds') / 1000;
      dispatch({
        type: 'device/saveFormData',
        payload: {
          userId: userInfo.gid,
          userName: userInfo.trueName,
          timeCost: diff,
          taskId,
          properties: JSON.stringify(params),
        },
        callback: (res) => {
          if (!res.success) {
            message.warn(res.msg);
            this.setState({btnloading: false});
            return;
          }
          if (paramsAttArray.length > 0) {
            dispatch({
              type: 'device/updateAtt',
              payload: {formData: paramsAttArray, attInfo: res.data, userInfo},
              callback: (res2) => {
                if (res2) {
                  message.success('反馈成功');
                  handleVisibleChange();
                  handleBack();
                } else {
                  message.warn('反馈失败');
                }
              },
            });
          } else {
            message.success('反馈成功');
            handleVisibleChange();
            handleBack();
          }
          this.setState({btnloading: false});
        },
      });
    }

    render() {
      const {feedData, visible, handleVisibleChange} = this.props;
      return (
        <Modal
          visible={visible}
          title="反馈详情"
          maskClosable={false}
          confirmLoading={this.state.btnloading}
          onOk={this.handleOk}
          onCancel={handleVisibleChange}
          width={790}
          bodyStyle={{
                    height: 460,
                    overflowY: 'auto',
                }}
        >
          <SubmitForm
            column={2}
            data={feedData || []}
            ref={ref => { this.feedForm = ref; }}
          />
        </Modal>
      );
    }
}
