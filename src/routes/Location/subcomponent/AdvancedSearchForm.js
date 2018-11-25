import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Input, Button, Select, notification } from 'antd';
import styles from './AdvancedSearchForm.less';
import { fetchSiteList, fetchPositionType } from '../../../services/eqLedger';

const FormItem = Form.Item;
const Option = Select.Option;

@connect(
  state => ({
    funs: state.login.funs,
  })
)
class AdvancedSearchForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      siteOption: [],
      siteStyles: [],
    };
  }
  componentDidMount() {
    fetchSiteList().then((data) => {
      if (data.success) {
        this.setState({
          siteOption: data.data,
        });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
    fetchPositionType().then((data) => {
      if (data.success) {
        this.setState({
          siteStyles: data.data,
        });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  }

  // To generate mock Form.Item
  getFields(siteOptions, siteStyles) {
    const count = this.state.expand ? 10 : 6;
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const children = [];
    const labeldatas = [{
      key: '搜索',
      value: false,
    }, {
      key: '所属站点',
      value: siteOptions,
    }, {
      key: '类型',
      value: siteStyles,
    }];

    labeldatas.forEach((value, index) => {
      const labelName = labeldatas[index];
      children.push(
        <Col span={8} key={value.key} style={{ display: index < count ? 'block' : 'none' }}>
          <FormItem {...formItemLayout} label={labelName.key} className={styles.locationFormItem}>
            {getFieldDecorator(`field${index}`)(
              labelName.value === false ? <Input placeholder="按位置名称、编号查询" /> : <Select placeholder="请选择" >{this.getOptions(labelName.value)}</Select>
            )}
          </FormItem>
        </Col>
      );
    });
    return children;
  }

  getOptions = (arr) => {
    const children = [];
    if (Array.isArray(arr)) {
      arr.forEach((value, index) => {
        const options = arr[index];
        children.push(
          <Option key={options.value} value={options.value}>{options.text}</Option>
        );
      });
    }
    return children;
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  handleAdd = (e) => {
    e.preventDefault();
    this.props.showAddModal('add');
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      this.props.SearchForItem(values, 1, 'topsearch');
    });
  };z

  render() {
    const { siteOption, siteStyles } = this.state;
    const { funs } = this.props;
    let location_add = true; // 设备位置添加
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='location_add') {
        location_add = false;
      }
    }
    return (
      <div>
        <Form
          onSubmit={this.handleSearch}
        >
          <Row gutter={16}>
            <Col span={18}>
              {this.getFields(siteOption, siteStyles)}
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <Button className={styles.locationFormButton} type="primary" htmlType="submit">查询</Button>
              <Button onClick={this.handleReset}>重置</Button>
            </Col>
          </Row>
          <Row>
            <Col offset={1}>
              <Button className={styles.locationFormButton} type="primary" disabled={location_add} onClick={this.handleAdd}>新增</Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

AdvancedSearchForm.defaultProps = {
  SearchForItem: f => f,
  showAddModal: f => f,
};

export default Form.create()(AdvancedSearchForm);
