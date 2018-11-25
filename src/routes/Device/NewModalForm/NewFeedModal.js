import React from 'react';
import { Modal, Form, Select, Input, InputNumber } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

export default Form.create()(
  (props) => {
    const { visible, isNum, isSelect, handleCancel, handleOk, showValue, handleCheckValue, handleCheckAlias, handleTypeChange,
      feedItem, form, typeData, isTXTSEL, showWarn, handleCheckWarn} = props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
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
    const typeOptions = (typeData || []).map(item =>
      <Option key={item.value} value={item.value}>{item.name}</Option>
    );
    const onValueChange = () => {
      if (getFieldValue('value')) {
        setFieldsValue({'value': ''});
      }
    };
    return (
      <div>
        <Modal
          visible={visible}
          title="反馈内容"
          maskClosable={false}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Form >
            <FormItem
              label="名称"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('alias', {
                rules: [
                  { required: true, message: '请输入名称' },
                  { max: 50, message: '最大长度不超过50' },
                  // { validator: handleCheckAlias },
                ],
                initialValue: feedItem.alias || '',
              })(
                <Input
                  placeholder="名称"
                />
              )}
            </FormItem>
            <FormItem
              label="数据类型"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('type', {
                rules: [{ required: true, message: '请选择数据类型' }],
                initialValue: feedItem.type || '',
              })(
                <Select
                  onChange={handleTypeChange}
                  placeholder="数据类型"
                >
                  {typeOptions || null}
                </Select>
              )}
            </FormItem>
            {isSelect ? <FormItem
              label="选择域"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('selectValues', {
                 rules: [{ required: true, message: '请输入选择域' }],
                initialValue: feedItem.selectValues || '',
              })(
                <Input
                  onChange={onValueChange}
                  placeholder="逗号连接, 如：值1,值2"
                />
              )}
            </FormItem> : null}
            {isTXTSEL ? <FormItem
              label="选择域"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('defaultvalue', {
                initialValue: feedItem.defaultvalue || '',
              })(
                <Input
                  onChange={onValueChange}
                  placeholder={isNum ? '逗号连接, 如：最小值,最大值' : '逗号连接, 如：值1,值2'}
                />
              )}
            </FormItem> : null}
            {showValue ? <FormItem
              label="默认值"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('value', {
                                initialValue: feedItem.value || '',
                                rules: [
                                  { validator: handleCheckValue },
                                ],
                            })(
                            isNum ? getFieldValue('accuracy') ? <InputNumber
                              placeholder="默认值"
                              style={{width: '100%'}}
                              precision={getFieldValue('accuracy')}
                            /> : <InputNumber
                              placeholder="默认值"
                              style={{width: '100%'}}
                            /> :
                            <Input
                              placeholder="默认值"
                            />
                                )}
            </FormItem> : null}
            {isNum ? <FormItem
              label="小数精度"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('accuracy', {
                initialValue: feedItem.accuracy || '',
              })(
                <InputNumber
                  style={{width: '100%'}}
                  min={0}
                  max={10}
                  precision={0}
                  placeholder="小数精度"
                />
              )}
            </FormItem> : null}
            {isNum ? <FormItem
              label="单位"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('unit', {
                initialValue: feedItem.unit || '',
              })(
                <Input
                  placeholder="单位"
                />
              )}
            </FormItem> : null}
            {showWarn ? <FormItem
              label="预警范围"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('warningrange', {
                initialValue: feedItem.warningrange || '',
                rules: [
                  { validator: handleCheckWarn },
                ],
              })(
                <Input
                  placeholder="逗号连接, 如：值1,值2"
                />
              )}
            </FormItem> : null}
            {showWarn ? <FormItem
              label="预警提醒说明"
              {...formItemLayout}
              hasFeedback
            >
              {getFieldDecorator('warningillustration', {
                initialValue: feedItem.warningillustration || '',
              })(
                <Input
                  placeholder="预警提醒说明"
                />
              )}
            </FormItem> : null}
          </Form>
        </Modal>
      </div>
    );
  }
);
