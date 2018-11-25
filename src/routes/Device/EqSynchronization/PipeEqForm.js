import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Checkbox, InputNumber, Input, Button, Form, Row, Col} from 'antd';
import styles from './index.less';

const Item = Form.Item;
@Form.create()
export default class PipeEqForm extends PureComponent {
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
                label="GIS服务地址"
                {...layout2}
              >
                {getFieldDecorator('walias', {
                    rules: [
                        { required: true, message: '请输入GIS服务地址' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="GIS服务地址"
                  />
                    )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="图层ID"
                {...layout2}
              >
                {getFieldDecorator('salias', {
                    rules: [
                        { required: true, message: '请输入图层ID' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="图层ID"
                  />
                    )}
              </Item>
            </Col>
            <Col span={6}>
              <Item
                label="条件"
                {...layout2}
              >
                {getFieldDecorator('adlias', {
                    rules: [
                        { required: true, message: '请输入条件' },
                    ],
                    initialValue: '',
                })(
                  <Input
                    placeholder="条件"
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
                {getFieldDecorator('alwias', {
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
                {getFieldDecorator('aflias', {
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
                {getFieldDecorator('aliass', {
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
                {getFieldDecorator('alidas', {
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
                {getFieldDecorator('aliaqs', {
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
                {getFieldDecorator('aliacs', {
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
                {getFieldDecorator('aliasg', {
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
        <div className={styles['field-block']} >
          <Button type="primary" className={styles.button}>开始同步</Button>
          <Button type="primary" className={styles.button}>删除此分类数据</Button>
          <Button type="primary" className={styles.button}>重置执行区域</Button>
          <Checkbox className={styles.checkbox}>不在范围内的work_zone置空</Checkbox>
          <InputNumber className={styles.button} />
          <Button type="primary" className={styles.button}>编码测试</Button>
        </div>
      </div>
    );
  }
}
