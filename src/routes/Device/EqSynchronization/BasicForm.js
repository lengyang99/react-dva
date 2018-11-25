import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Input, Button, Form, Row, Col} from 'antd';

const Item = Form.Item;
@Form.create()
export default class BasicForm extends PureComponent {
  render() {
    const { getFieldDecorator} = this.props.form;
    const layout2 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        span: 14,
      },
    };
    return (
      <Form hideRequiredMark>
        <Row>
          <Col span={10}>
            <Item
              label="数据库地址"
              {...layout2}
            >
              {getFieldDecorator('a', {
                    rules: [
                        { required: true, message: '请输入数据库地址' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="数据库地址"
                  />
                    )}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="用户名"
              {...layout2}
            >
              {getFieldDecorator('al', {
                    rules: [
                        { required: true, message: '请输入用户名' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="用户名"
                  />
                    )}
            </Item>
          </Col>
          <Col span={6}>
            <Item
              label="密码"
              {...layout2}
            >
              {getFieldDecorator('ali', {
                    rules: [
                        { required: true, message: '请输入密码' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="密码"
                  />
                    )}
            </Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
