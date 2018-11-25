import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Form, Input, Select, message } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
@connect(state => ({
  meterDetail: state.ichAccountDetail.meterDetail,
  dialogStatus: state.ichAccountDetail.dialogStatus,
}))
@Form.create({mapPropsToFields: (props) => {
  const { meterDetail } = props;
  return {

  };
}})
export default class MeterDialog extends PureComponent {
  handleOK = (e) => {
    e.preventDefault();
    const {dispatch, form, dialogStatus} = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        if (dialogStatus.status === 'add') {
          console.log('add');
        } else {
          console.log('edit');
        }
      }
    });
  };
  handleHideModal = () => {
    const {dispatch, dialogStatus} = this.props;
    dispatch({
      type: 'ichAccountDetail/changeDialogStatus',
      payload: {
        visible: false,
        status: dialogStatus.status,
      },
    });
  };
  render() {
    const { dialogStatus } = this.props;
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
      <Modal
        title={dialogStatus.status === 'add' ? '新增用气设备' : '编辑用气设备'}
        visible={dialogStatus.visible}
        okText="确认"
        cancelText="取消"
        onOk={this.handleOK}
        onCancel={this.handleHideModal}
      >
        <Form>
          <FormItem
            {...formItemLayout}
            label="类型"
            hasFeedback
          >
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请选择类型' }, {
                // validator: this.checkConfirm,
              }],
            })(
              <Select
                showSearch
                style={{ width: 200 }}
                placeholder="类型"
                optionFilterProp="children"
                // onChange={handleChange}
                // filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Option value={1}>{1}</Option>
                <Option value={2}>{2}</Option>
                <Option value={3}>{3}</Option>
              </Select>
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="品牌"
            hasFeedback
          >
            {getFieldDecorator('name', {
              rules: [{
                required: true, message: '请输入品牌',
              }, {
                // validator: this.checkConfirm,
              }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem
            {...formItemLayout}
            label="数量"
            hasFeedback
          >
            {getFieldDecorator('total', {
              rules: [{
                required: true, message: '请输入数量',
              }, {
                // validator: this.checkConfirm,
              }],
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
