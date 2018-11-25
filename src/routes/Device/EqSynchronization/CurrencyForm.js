import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Tabs, Input, Button, Form, Row, Col} from 'antd';

const Item = Form.Item;
@Form.create()
export default class CurrencyForm extends PureComponent {
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
      <div>
        <Form hideRequiredMark>
          <Row>
            <Col span={10}>
              <Item
                label="原数据库表名称"
                {...layout2}
              >
                {getFieldDecorator('a', {
                    rules: [
                        { required: true, message: '请输入原数据库表名称' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="原数据库表名称"
                  />
                    )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="条件"
                {...layout2}
              >
                {getFieldDecorator('al', {
                    rules: [
                        { required: true, message: '请输入条件' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="条件"
                    style={{width: 482}}
                  />
                    )}
              </Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Item
                label="设备分类编码"
                {...layout2}
              >
                {getFieldDecorator('ali', {
                  rules: [
                      { required: true, message: '请输入设备分类编码' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="设备分类编码"
                />
                  )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="ecode"
                {...layout2}
              >
                {getFieldDecorator('alia', {
                  rules: [
                      { required: true, message: '请输入ecode' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="ecode"
                />
                  )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="station_id"
                {...layout2}
              >
                {getFieldDecorator('alias', {
                  rules: [
                      { required: true, message: '请输入station_id' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="station_id"
                />
                  )}
              </Item>
            </Col>
          </Row>
          <Row>
            <Col span={10}>
              <Item
                label="版本"
                {...layout2}
              >
                {getFieldDecorator('aliass', {
                  rules: [
                      { required: true, message: '请输入版本' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="版本"
                />
                  )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="设备类型"
                {...layout2}
              >
                {getFieldDecorator('aliasx', {
                  rules: [
                      { required: true, message: '请输入设备类型' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="设备类型"
                />
                  )}
              </Item>
            </Col>
            <Col span={6} />
          </Row>
          <Row>
            <Col span={10}>
              <Item
                label="起始的编码序号"
                {...layout2}
              >
                {getFieldDecorator('aliasw', {
                  rules: [
                      { required: true, message: '请输入起始的编码序号' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="起始的编码序号"
                />
                  )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="删除条件"
                {...layout2}
              >
                {getFieldDecorator('aliasq', {
                  rules: [
                      { required: true, message: '请输入删除条件' },
                  ],
                  initialValue: '',
              })(
                <Input
                  placeholder="删除条件"
                  style={{width: 482}}
                />
                  )}
              </Item>
            </Col>
            <Col span={6} />
          </Row>
        </Form>
        <Button type="primary" style={{left: '40%', marginBottom: 10}}>开始同步</Button>
        <Button type="primary" style={{left: '45%', marginBottom: 10}}>删除此分类数据</Button>
      </div>
    );
  }
}
