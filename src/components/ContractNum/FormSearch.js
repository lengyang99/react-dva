import React, { PureComponent } from 'react';
import { Row, Col, Select, Input, Form, Button, DatePicker } from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;

export default class FromSearch extends PureComponent {
  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };
    return (
      <Form
        onSubmit={this.props.handleSubmit}
        style={{
          width: '100%',
          padding: '20px',
        }}
      >
        <Row gutter={10}>
          <Col span={10} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="用户名称">
              {getFieldDecorator('username', {
                rules: [],
              })(
                <Input placeholder="请输入用户名！" />
                )}
            </FormItem>
          </Col>
          <Col span={6} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="刚号">
              {getFieldDecorator('oper', {
                rules: [],
                initialValue: '全部',
              })(
                <Select>
                  <Option key="op00" value="全部">全部</Option>
                  <Option key="op0" value="0">登录</Option>
                  <Option key="op1" value="1">登出</Option>
                </Select>
                )}
            </FormItem>
          </Col>
          <Col span={6} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="地址">
              {getFieldDecorator('sys', {
                rules: [],
                initialValue: '全部',
              })(
                <Select>
                  <Option key="sys00" value="全部">全部</Option>
                  <Option key="sys01" value="web">web</Option>
                  <Option key="sys02" value="android">android</Option>
                  <Option key="sys03" value="oms">oms</Option>
                </Select>
                )}
            </FormItem>
          </Col>
          <Col span={2} >
            <Button type="primary" htmlType="submit" style={{ marginTop: '3px' }}>
              搜索
            </Button>
          </Col>
        </Row >
      </Form >
    );
  }
}
