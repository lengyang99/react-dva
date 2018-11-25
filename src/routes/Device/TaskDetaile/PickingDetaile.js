import React, { Component } from 'react';
import { Button, Form, Select, Col, Row, Table, InputNumber } from 'antd';
import styles from './index.less';


const FormItem = Form.Item;
@Form.create()
export default class PickingDetaile extends Component {
  render() {
    const { form, mlDetaile, handleBack } = this.props;
    const { getFieldDecorator } = form;
    const { mtInfo, cbname, reserve } = mlDetaile && mlDetaile.length > 0 ? mlDetaile[0] : {};
    const data = [...new Set(reserve)];
    // const { cname, ccode, facname, faccode, wlname, wlcode, cbname, cbcode } = placeInfo && placeInfo.length > 0 ? placeInfo[0] : {};
    const { facName, wlName } = reserve && reserve.length > 0 ? reserve[0] : {};
    const formItemLayout = {
      labelCol: {
        xs: { span: 12 },
        sm: { span: 10 },
      },
      wrapperCol: {
        xs: { span: 28 },
        sm: { span: 12 },
        md: { span: 6 },
      },
    };
    const columns = [{
      title: '物料编号',
      dataIndex: 'matnr',
      key: 'matnr',
    },
    {
      title: '物料类别',
      dataIndex: 'groupdes',
      key: 'groupdes',
    },
    {
      title: '物料名称',
      dataIndex: 'des',
      key: 'des',
    },
    {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
      render: (text, record) => {
        return (<InputNumber
          value={record.bdmng}
        />);
      },
    }];
    return (
      <div>
        <div >
          <Form
            hideRequiredMark
          >
            <Row >
              <Col span={9}>
                <FormItem
                  label="移动类型"
                  {...formItemLayout}
                >
                  {getFieldDecorator('mtInfo', {
                    // initialValue:`【${item.subject}】 ${item.mtInfo}`
                    initialValue: mtInfo,
                  })(
                    <Select
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem
                  label="公司名称"
                  {...formItemLayout}
                >
                  {getFieldDecorator('cname', {
                    initialValue: '廊坊新奥燃气有限公司',
                  })(
                    <Select
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row >
              <Col span={9}>
                <FormItem
                  label="工厂中心"
                  {...formItemLayout}
                >
                  {getFieldDecorator('facname', {
                    // initialValue: `【${faccode}】 ${facname}`
                    initialValue: facName,
                  })(
                    <Select
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={7}>
                <FormItem
                  label="成本中心"
                  {...formItemLayout}
                >
                  {getFieldDecorator('cbname', {
                    // initialValue: `【${cbcode}】 ${cbname}`
                    initialValue: cbname,
                  })(
                    <Select
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
            </Row>
            <Row >
              <Col span={9}>
                <FormItem
                  label="物料库名称"
                  {...formItemLayout}
                >
                  {getFieldDecorator('wlname', {
                    // initialValue: `【${wlcode}】 ${wlname}`
                    initialValue: wlName,
                  })(
                    <Select
                      disabled
                      style={{ width: 240 }}
                    />
                    )}
                </FormItem>
              </Col>
              <Col span={11} />
            </Row>
            <Row >
              <Col span={9}>
                <Button style={{ width: 240, left: '42%', marginBottom: 10 }} >所选物料</Button>
              </Col>
              <Col span={11} />
            </Row>
            <FormItem>
              <Table
                style={{ width: '54%', marginLeft: '15%' }}
                columns={columns}
                dataSource={data || []}
                rowKey={record => record.gid}
              />
            </FormItem>
          </Form>
          <Button
            className={styles.button2}
            type="primary"
            htmlType="button"
            onClick={handleBack}
          >返回</Button>
        </div>
      </div>
    );
  }
}
