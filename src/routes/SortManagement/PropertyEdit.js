import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Checkbox, InputNumber, Form, Row, Col, Button, Input, Modal, Select } from 'antd';
import MyCheckBox from './MyCheckBox';

const FormItem = Form.Item;
const Option = Select.Option;

class PropertyForm extends PureComponent {
  componentDidMount = () => {
    // 加载类型下拉框数据
    this.props.dispatch({
      type: 'sortmanagement/queryEnumTypeSelectData',
      payload: null,
    });
  }

  handleCancel = () => {
    this.props.dispatch({
      type: 'sortmanagement/toggleModal',
      payload: false,
    });
  };

  handleClickSaveProperty = () => {
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('设备属性提交失败!!!');
        return;
      }

      if (this.props.property.gid !== '') {
        values.gid = this.props.property.gid;
      }
      values.clsGid = this.props.classification.gid;
      values.isRequired = values.isRequired ? 1 : 0;
      values.isParent = values.isParent ? 1 : 0;
      const params = {
        property: values,
        classification: {
          clsGid: this.props.classification.gid,
          pageNum: this.props.pageNum,
          pageSize: this.props.pageSize,
        },
      };
      this.props.dispatch({
        type: 'sortmanagement/editProperty',
        payload: params,
      });
      this.props.dispatch({
        type: 'sortmanagement/toggleModal',
        payload: false,
      });
    });
  };

  render() {
    const { visible, enumType } = this.props;
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
    const checkboxItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 12 },
      },
      wrapperCol: {
        xs: { span: 12 },
        sm: { span: 12 },
      },
    };
    return (
      <div>
        <Modal
          width={1000}
          visible={visible}
          title={`【${this.props.classification.description}】${this.props.property.gid === undefined ? '添加属性' : '修改属性'}`}
          onCancel={this.handleCancel.bind(this)}
          footer={[
            <Button key="back" size="large" onClick={this.handleCancel.bind(this)}>返回</Button>,
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={this.handleClickSaveProperty.bind(this)}
            >保存
            </Button>,
          ]}
        >
          <Form onSubmit={this.handleClickSaveProperty.bind(this)}>
            <Row gutter={10}>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="序号"
                  hasFeedback
                >
                  {getFieldDecorator('orderBy', {
                    rules: [{ required: true, message: '请输入序号!' }],
                  })(
                    <InputNumber style={{width: '100%'}} />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="名称"
                  hasFeedback
                >
                  {getFieldDecorator('description', {
                    rules: [{ required: true, message: '请输入属性名称!' }],
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="单位"
                  hasFeedback
                >
                  {getFieldDecorator('measureunit', {
                    rules: [{ message: '请输入单位!' }],
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="类型"
                >
                  {getFieldDecorator('enumType', {
                    rules: [{ required: true, message: '请选择类型!' }],
                  })(
                    <Select>
                      {enumType.map(ele => <Option key={ele.value} value={ele.value}>{ele.name}</Option>)}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={10}>
              <Col span={12}>
                <Row gutter={0}>
                  <Col span={12}>
                    <FormItem
                      {...checkboxItemLayout}
                      label="是否为父级属性"
                    >
                      {getFieldDecorator('isParent')(
                        <MyCheckBox />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      {...checkboxItemLayout}
                      label="是否必填"
                    >
                      {getFieldDecorator('isRequired')(
                        <MyCheckBox />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Col>
              <Col span={12}>
                <FormItem
                  {...formItemLayout}
                  label="默认值："
                >
                  {getFieldDecorator('dfltVal', {
                    rules: [{ message: '请输入默认值!' }],
                  })(
                    <Input />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default connect(
  state => ({
    visible: state.sortmanagement.visible,
    classification: state.sortmanagement.classification,
    enumType: state.sortmanagement.enumTypeSelectData,
    pageNum: state.sortmanagement.propertyPageList.pageNum,
    pageSize: state.sortmanagement.propertyPageList.pageSize,
    property: state.sortmanagement.property,
  })
)(
  Form.create({
    mapPropsToFields(props) {
      return {
        description: Form.createFormField({ value: props.property.description }),
        measureunit: Form.createFormField({ value: props.property.measureunit }),
        enumType: Form.createFormField({ value: typeof (props.property.enumType) !== 'undefined' ? props.property.enumType : props.enumType[0].value }),
        isParent: Form.createFormField({ value: props.property.isParent === '1' }),
        isRequired: Form.createFormField({ value: props.property.isRequired === '1' }),
        dfltVal: Form.createFormField({ value: props.property.dfltVal }),
        ecode: Form.createFormField({ value: props.property.ecode }),
        orderBy: Form.createFormField({ value: props.property.orderBy }),
      };
    },
  })(PropertyForm)
);
