import React from 'react';
import moment from 'moment';
import {Modal, Form, Select, DatePicker} from 'antd';

const Item = Form.Item;
const Option = Select.Option;
export default Form.create()((props) => {
  const {form, userInfo, visible, handleOk, handleCancel, record} = props;
  const {getFieldDecorator} = form;
  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 12 },
      md: { span: 10 },
    },
  };
  const userOptions = (userInfo || []).map(item => (<Option key={item.gid} value={`${item.gid}`} dataRef={item}>{item.truename}</Option>));
  const disabled = record.taskCategory === 1 || !record.nextEndTime;
  return (
    <Modal
      title="编辑维护历史"
      visible={visible}
      maskClosable={false}
      onCancel={handleCancel}
      onOk={handleOk}
    >
      <Form>
        <Item
          label="维护人"
          {...formItemLayout}
        >
          {getFieldDecorator('user', {})(
            <Select
              mode="multiple"
              labelInValue
              style={{width: 180}}
            >
              {userOptions}
            </Select>)}
        </Item>
        <Item
          label="下次维护时间"
          {...formItemLayout}
        >
          {getFieldDecorator('time', {initialValue: moment()})(<DatePicker disabled={disabled} style={{width: 180}} />)}
        </Item>
      </Form>
    </Modal>
  );
});
