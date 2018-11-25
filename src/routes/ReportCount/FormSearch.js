import React, { PureComponent } from 'react';
import { Row, Col, Select, Form, Button, DatePicker } from 'antd';
import moment from 'moment';

const FormItem = Form.Item;
const Option = Select.Option;

export default class FromSearch extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      params: {},
    };
    this.locCode = {}; // 当前 处理组织 //所属组织
    this.locCodeArr = []; // 处理组织  //所属组织
  }
  // 处理组织改变
  onChangelocCode = (valueObj) => {
    const params = this.state.params;
    params.loc_code = valueObj;
    this.locCodeArr.forEach(item => {
      if (item.name === valueObj) {
        this.locCode = item;
        params.loc_area = this.locCode.selectValues[0].name;
      }
    });
    this.setState({
      params,
    });
  }
  // 所属组织改变
  onChangelocArea = (valueObj) => {
    let params = this.state.params;
    params.loc_area = valueObj;
    this.setState({
      params,
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    const { loccode, sgschedule, locarea } = this.props.selectData;
    const formItemLayout = {
      labelCol: {
        sm: { span: 6 },
      },
      wrapperCol: {
        sm: { span: 16 },
      },
    };
    // 站点
    let locCodeOptions = null;
    // 所属组织
    let locAreaOptions = null;
    if (loccode && !this.state.params.loc_code) {
      this.locCodeArr = loccode;
      this.locCodeArr.unshift({ name: '全部', alias: '全部', selectValues: [{ name: '全部', alias: '全部' }] });
      this.locCode = loccode[0];
    }
    if (this.locCode.alias) {
      locCodeOptions = this.locCodeArr.map(city => <Option key={city.name || '全部'}>{city.alias}</Option>);
      if (this.locCode.selectValues.length > 0) {
        locAreaOptions = this.locCode.selectValues.map(city => <Option key={city.name || '全部'}>{city.alias}</Option>);
      }
    }
    return (
      <Form
        onSubmit={this.props.handleSubmit}
        style={{
          width: '100%',
          padding: '20px',
        }}
      >
        <Row gutter={10}>
          <Col span={8} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="站点">
              {getFieldDecorator('loccode', {
                rules: [],
                initialValue: this.state.params.loc_code || '全部',
              })(
                // <Select>
                //   <Option value="">全部</Option>
                //   {(loccode || []).map(v => <Option key={v.name} value={v.name}>{v.alias}</Option>)}
                // </Select>
                <Select
                  onChange={this.onChangelocCode}
                >
                  {locCodeOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="所属区域">
              {getFieldDecorator('locarea', {
                rules: [],
                initialValue: this.state.params.loc_area || '全部',
              })(
                // <Select>
                //   <Option value="">全部</Option>
                //   {(locarea || []).map(v => <Option key={v.name} value={v.name}>{v.alias}</Option>)}
                // </Select>
                <Select
                  onChange={this.onChangelocArea}
                >
                  {locAreaOptions}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="施工工期">
              {getFieldDecorator('sgschedule', {
                rules: [],
                initialValue: '',
              })(
                <Select>
                  <Option value="">全部</Option>
                  {(sgschedule || []).map(v => <Option key={v.name} value={v.name}>{v.alias}</Option>)}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8} >
            <FormItem {...formItemLayout} style={{ marginBottom: 0 }} label="时间">
              {getFieldDecorator('time', {
                rules: [],
                initialValue: moment(),
              })(<DatePicker style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
          <Col span={8} offset={8}>
            <Button type="primary" htmlType="submit" style={{ marginTop: '3px', marginLeft: '30px' }}>
              搜索
            </Button>
            <Button type="primary" style={{ marginTop: '3px', marginLeft: '15px' }}>
              导出
            </Button>
          </Col>
        </Row >
      </Form >
    );
  }
}
