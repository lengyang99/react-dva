import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Tag, Input } from 'antd';
import { findDOMNode } from 'react-dom';
import propTypes from 'prop-types';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
};
@connect(state => ({
  isModalActive: state.messageTemplate.isModalActive,
  formDetail: state.messageTemplate.formDetail,
  process: state.messageTemplate.process,
}))
@Form.create({
  mapPropsToFields: props => ({
    message: Form.createFormField({ value: props.formDetail && props.formDetail.message }),
  }),
  onValuesChange: (props, field) => {
    props.dispatch({
      type: 'messageTemplate/setFormDetail',
      payload: {...props.formDetail, ...field},
    });
  },
})
export default class EditModal extends PureComponent {
  static propTypes = {

  };
  handleClick = (e) => {
    const param = e.target.textContent;
    const textArea = findDOMNode(this.textAreaNode);
    const startPosition = textArea.selectionStart;
    const endPosition = textArea.selectionEnd;
    const { message } = this.props.formDetail;
    this.props.dispatch({
      type: 'messageTemplate/asyncSetFormDetail',
      payload: { ...this.props.formDetail, message: `${message.substring(0, startPosition)}{${param}}${message.substring(endPosition)}` },
      cbk: () => {
        textArea.focus();
        const currentPosition = startPosition + param.length + 2;
        textArea.setSelectionRange(currentPosition, currentPosition);
      },
    });
  };
  handleModal = (type) => {
    switch (type) {
      case 'cancel':
        this.props.dispatch({
          type: 'messageTemplate/toggleModal',
          payload: false,
        });
        break;
      case 'ok':
        this.props.form.validateFields(err => {
          if (!err) {
            this.props.dispatch({
              type: 'messageTemplate/updateTemp',
              payload: this.props.formDetail,
              cbk: () => {
                this.props.dispatch({
                  type: 'messageTemplate/fetchTempList',
                  payload: { process: this.props.process },
                });
              },
            });
          }
        });
        break;
      default:
        return 0;
    }
  };
  render() {
    const { isModalActive, formDetail } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Modal
        title="编辑消息模版"
        visible={isModalActive}
        onCancel={this.handleModal.bind('', 'cancel')}
        onOk={this.handleModal.bind('', 'ok')}
      >
        <Form>
          <FormItem label="参数" {...formItemLayout}>
            { formDetail && formDetail.msgParamrule.split(',').map(tag => <Tag color="blue" key={tag} onClick={this.handleClick}>{tag}</Tag>) }
          </FormItem>
        </Form>
        <Form>
          <FormItem label="消息模版" {...formItemLayout}>
            {getFieldDecorator('message', {
              rules: [{ required: true, message: '消息模版不能为空!' }],
            })(
              <TextArea ref={node => { this.textAreaNode = node; }} />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
