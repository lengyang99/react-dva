import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Col, Form, Input, Table, Button, Select, Popconfirm, Divider, DatePicker, InputNumber } from 'antd';
import styles from './DetaiInfo.less';
import Dialog from '../../../../../components/yd-gis/Dialog/Dialog';

const FormItem = Form.Item;
const Option = Select.Option;
@connect(state => ({
  GISPropsData: state.ichAccountDetail.GISPropsData,
  CustomPropsData: state.ichAccountDetail.CustomPropsData,
  basePropsData: state.ichAccountDetail.userDetail,
}))
class DetailInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showAddCustomField: false,
      inEditCustomField: false,
      theCustomFieldValue: <Input />,
      customFieldRules: [],
      cFieldName: '',
      cFieldType: '',
      cFieldValue: '',
      cId: '',
    };
  }
  valueOnchange = (type, e) => {
  };

  // 查询工商户信息
  queryBussinessUserInfo = () => {
    this.props.dispatch({
      type: 'ichAccountDetail/getIchAccountDetail',
      payload: {
        gsh_gid: this.props.basePropsData.gid,
      },
    });
  }

  handleAddOrEditCuntomField = (op, record) => {
    if (record) {
      this.setState({
        inEditCustomField: true,
        cFieldName: record.fieldName,
        cFieldType: record.enumType,
        cFieldValue: record.fieldValue,
        cId: record.id,
      });
    } else {
      this.setState({
        inEditCustomField: false,
        cFieldName: '',
        cFieldType: '',
        cFieldValue: '',
        cId: '',
      });
    }
    if (op === 'open') {
      this.setState({ showAddCustomField: true });
    } else {
      this.setState({ showAddCustomField: false });
    }
  }

  // 添加自定义字段
  addCustomField = (e) => {
    e.preventDefault();
    this.props.form.validateFields((errors, values) => {
      if (!!errors) {
        console.log('自定义属性提交失败！');
        return;
      }
      const params = {
        fieldName: values.fieldName,
        fieldValue: values.fieldValue,
        fieldType: values.fieldType,
      };
      if (this.state.inEditCustomField) {
        this.props.dispatch({
          type: 'ichAccountDetail/editGshCustomInfo',
          payload: { ...params, cGid: this.state.cId },
          callback: this.queryBussinessUserInfo,
        });
      } else {
        this.props.dispatch({
          type: 'ichAccountDetail/addGshCustomInfo',
          payload: { ...params, gshGid: this.props.basePropsData.gid },
          callback: this.queryBussinessUserInfo,
        });
      }
      this.handleAddOrEditCuntomField('close');
    });
  }

  // 删除自定义字段
  delCustomField = (cGid) => {
    this.props.dispatch({
      type: 'ichAccountDetail/delGshCustomInfo',
      payload: {
        cGid: cGid,
      },
      callback: this.queryBussinessUserInfo,
    });

  }

  handleCFieldTypeChange = (value) => {
    let theCustomFieldValue = null;
    let customFieldRules = [];
    switch (value) {
      case 'String':
        theCustomFieldValue = <Input />;
        break;
      case 'Integer':
        theCustomFieldValue = <InputNumber />;
        customFieldRules = [{ type: 'integer', message: '请输入整数数值!' }];
        break;
      case 'Float':
        theCustomFieldValue = <InputNumber />;
        customFieldRules = [{ type: 'float', message: '请输入小数数值!' }];
        break;
      case 'Date':
        theCustomFieldValue = <DatePicker showTime format='YYYY-MM-DD HH:mm:ss' placeholder='请选择时间' onOk={this.handleCFieldValueChange} />;
        break;
      default:
        theCustomFieldValue = <Input />;
        break;
    }
    this.setState({
      theCustomFieldValue,
      customFieldRules,
      cFieldType: value
    });
  }

  render() {
    const that = this;
    const { GISPropsData, CustomPropsData } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = (x, y) => {
      return {
        labelCol: { span: x },
        wrapperCol: { span: y, push: 1 },
      };
    };
    const customColums = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 80,
        render: (text, record, index) => {
          return index + 1;
        },
      },
      {
        title: '属性名称',
        dataIndex: 'fieldName',
        width: 150,
      },
      {
        title: '属性值',
        dataIndex: 'fieldValue',
        width: 150,
      },
      {
        title: '更多操作',
        dataIndex: 'moreAction',
        width: 150,
        render: (text, record) => {
          return (
            this.props.CustomPropsData.length >= 1
              ?
              <span>
                <a href="javascript:;" onClick={() => this.handleAddOrEditCuntomField('open', record)}>编辑</a>
                <Divider type="vertical" />
                <Popconfirm title="确认删除？" onConfirm={() => this.delCustomField(record.id)}>
                  <a href="javascript:;">删除</a>
                </Popconfirm>
              </span> : null
          );
        }
      }
    ];
    const customFormItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    // let theCustomFieldValue = null;
    // switch (this.state.cFieldType) {
    //   case 'String':
    //     theCustomFieldValue = <Input />;
    //     break;
    //   case 'Integer':
    //     theCustomFieldValue = <InputNumber />;
    //     this.customFieldRules = [{ type: 'integer', message: '请输入整数数值!' }];
    //     break;
    //   case 'Float':
    //     theCustomFieldValue = <InputNumber />;
    //     this.customFieldRules = [{ type: 'float', message: '请输入小数数值!' }];
    //     break;
    //   case 'Date':
    //     theCustomFieldValue = <DatePicker showTime format='YYYY-MM-DD HH:mm:ss' placeholder='请选择时间' onOk={this.handleCFieldValueChange} />;
    //     break;
    //   default:
    //     theCustomFieldValue = <Input />;
    //     break;
    // }
    return (
      <div className={styles.container}>
        <div className={styles.header}><span className={styles.header__icon} />GIS属性</div>
        <div>
          {
            Array.isArray(GISPropsData) ? GISPropsData.map(item => (
              <Col span={12}>
                <FormItem label={item.fieldName} {...formItemLayout(4, 15)}>
                  <Input
                    style={{ zIndex: '1000' }}
                    defaultValue={item.fieldValue}
                  // value={this.state.value}
                  // onChange={this.valueOnchange.bind('', 'aaa')}
                  />
                </FormItem>
              </Col>
            )) :
              null
          }
        </div>
        <div className={styles.header}><span className={styles.header__icon} />自定义属性</div>
        <div>
          <Button style={{ marginBottom: 10 }} onClick={() => this.handleAddOrEditCuntomField('open')} type="primary">添加</Button>
          <Table
            bordered
            dataSource={CustomPropsData}
            columns={customColums}
          />
        </div>
        {
          this.state.showAddCustomField ?
            <Dialog
              title='新增自定义属性'
              width={300}
              onClose={() => this.handleAddOrEditCuntomField('close')}
              position={{
                top: 400,
                left: 280,
              }}
            >
              <Form onSubmit={this.addCustomField}>
                <FormItem
                  {...customFormItemLayout}
                  label='属性名'
                >
                  {getFieldDecorator('fieldName', {
                    rules: [{
                      required: true, message: '请输入属性名！',
                    }, {
                      whitespace: true, message: '属性名不能为空！',
                    }],
                    initialValue: that.state.cFieldName,
                  })(
                    <Input />
                  )}
                </FormItem>
                <FormItem
                  {...customFormItemLayout}
                  label='属性类型'
                >
                  {getFieldDecorator('fieldType', {
                    rules: [{
                      required: true, message: '请选择属性类型！',
                    }],
                    initialValue: that.state.cFieldType,
                  })(
                    <Select onSelect={that.handleCFieldTypeChange}>
                      <Option key={0} value='String'>文本</Option>
                      <Option key={1} value='Integer'>整数</Option>
                      <Option key={2} value='Float'>小数</Option>
                      <Option key={3} value='Date'>日期</Option>
                    </Select>
                  )}
                </FormItem>
                <FormItem
                  {...customFormItemLayout}
                  label='属性值'
                >
                  {getFieldDecorator('fieldValue', {
                    rules: that.state.customFieldRules,
                    initialValue: that.state.cFieldValue,
                  })(
                    that.state.theCustomFieldValue
                  )}
                </FormItem>
                <FormItem
                  wrapperCol={{ span: 12, offset: 12 }}
                >
                  <Button type="primary" size="small" htmlType="submit" style={{ marginRight: 20 }}>保存</Button>
                  <Button size="small" onClick={() => this.handleAddOrEditCuntomField('close')}>取消</Button>
                </FormItem>
              </Form>
            </Dialog> : null
        }
      </div>
    );
  }
}

export default DetailInfo = Form.create({})(DetailInfo);