import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Input, Modal } from 'antd';

const FormItem = Form.Item;

class EnumForm extends PureComponent {
  componentDidMount = () => {
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'sortmanagement/toggleEnumEditModal',
      payload: false,
    });
  };

  handleClickSaveEnum = () => {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('枚举值提交失败!!!');
        return;
      }
      if (this.props.gid !== '') {
        values.gid = this.props.enumObj.gid;
      }
      values.classspecGid = this.props.classspecGid;
      this.props.dispatch({
        type: 'sortmanagement/editEnum',
        payload: values,
      });
      this.props.dispatch({
        type: 'sortmanagement/toggleEnumEditModal',
        payload: false,
      });
    });
  };

  render() {
    const { enumEditVisible } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };

    return (
      <div>
        <Modal
          width={500}
          visible={enumEditVisible}
          title="编辑枚举值"
          onCancel={this.handleCancel.bind(this)}
          footer={[
            <Button key="back" size="large" onClick={this.handleCancel.bind(this)}>返回</Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={this.handleClickSaveEnum.bind(this)}
            >保存
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleClickSaveEnum.bind(this)}>
            <FormItem
              {...formItemLayout}
              label="序号"
              hasFeedback
            >
              {getFieldDecorator('enumVal', {
                rules: [{ required: true, message: '请输入值!' }],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="值"
              hasFeedback
            >
              {getFieldDecorator('description', {
                rules: [{ required: true, message: '请输入值!' }],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => ({
    enumEditVisible: state.sortmanagement.enumEditVisible,
    classspecGid: state.sortmanagement.classspecGid,
    enumObj: state.sortmanagement.enumObj,
  })
)(
  Form.create({
    mapPropsToFields(props) {
      return {
        enumVal: Form.createFormField({ value: props.enumObj.enumVal }),
        description: Form.createFormField({ value: props.enumObj.description }),
      };
    },
  })(EnumForm)
);
