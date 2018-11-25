import React from 'react';
import {Modal, Button, message} from 'antd';
import SubmitForm from '../../commonTool/SubmitFormModal/SubmitFormModal';

export default class WorkListModal extends React.Component {
    state ={
      showModal: false,
      loading: false,
      ModelData: [],
    }
    handleOk = () => {
      let paramsObj = {};
      const paramsAttArray = [];
      const validate = this.refs.formRef_1.validateRequired();
      if (validate) {
        message.warning(`字段【${validate}】为空！`);
        return;
      }
      const params = this.refs.formRef_1.getValues();
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          paramsObj[key] = params[key];
        }
      }
      paramsObj = {...paramsObj, ...this.geom};

      const paramsAtt = this.refs.formRef_1.getAttValues();
      for (const key in paramsAtt) {
        if (paramsAtt.hasOwnProperty(key)) {
          paramsAttArray.push({name: key, value: paramsAtt[key]});
        }
      }
      this.setState({
        loading: true,
      });
      this.props.dispatch({
        type: 'workOrder/submitTaskFormData',
        payload: {
          taskId: this.state.ModelData.taskId,
          taskType: this.state.ModelData.taskType,
          taskCode: '',
          userid: this.props.user.gid,
          user: this.props.user.trueName,
          properties: JSON.stringify(paramsObj),
          isSave: 0,
        },
        callback: (res) => {
          const { pageno } = this.props.searchTaskParams;
          if (paramsAttArray.length > 0) {
            this.props.dispatch({
              type: 'workOrder/submitAttach',
              formData: paramsAttArray,
              attInfo: res,
              user: this.props.user,
              callback: (resAtt) => {
                if (resAtt) {
                  message.info('提交成功');
                  this.clearFormData();
                  this.props.queryTasks({pageno});
                }
              },
            });
          } else {
            message.info('提交成功');
            this.clearFormData();
            this.props.queryTasks({pageno});
          }
        },
      });
    };
    handleCancel = () => {
      this.clearFormData();
    };
    onChangeState = (data) => {
      this.setState({showModal: true, ModelData: data});
    }
    clearFormData = () => {
      this.setState({showModal: false, loading: false});
      this.props.dispatch({
        type: 'workOrder/changeTaskFormData',
        payload: {
          params: [],
        },
      });
    };
    render() {
      return (
        <Modal
          width="770px"
          visible={this.state.showModal}
          onCancel={this.handleCancel}
          wrapClassName="web"
          footer={null}
                  // onOk={this.handleOk}
          title={this.state.ModelData.taskName}
        >
          <div style={{display: 'block'}}>
            <SubmitForm
              data={this.props.taskFormData.params}
              column={2}
              ref="formRef_1"
            />
          </div>
          <div style={{height: '30px', marginTop: '25px'}}>
            <Button
              style={{float: 'right', marginLeft: '15px', marginRight: '30px'}}
              onClick={this.handleCancel.bind(this)}
            >取消</Button>
            <Button
              type="primary"
              style={{float: 'right'}}
              loading={this.state.loading}
              onClick={this.handleOk.bind(this)}
            >确定</Button>
          </div>
        </Modal>
      );
    }
}
