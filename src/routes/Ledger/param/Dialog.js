import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Modal, Input, DatePicker, Select, InputNumber, Checkbox, Col, Row } from 'antd';
import propTypes from 'prop-types';
import moment from 'moment';

const Option = Select.Option;
const TextArea = Input.TextArea;

@connect(
  state => ({
    selectedOptions: state.ledger.selectOptions,
    eqClassify: state.ledger.eqCustom.eqClassify,
  })
)
export default class Dialog extends PureComponent {
  static propTypes = {
    modalOption: propTypes.object.isRequired,
    eqClassify: propTypes.string,
    visible: propTypes.bool.isRequired,
    confirm: propTypes.func.isRequired,
    isAddModel: propTypes.bool.isRequired,
    selectedOptions: propTypes.array,
  };

  static defaultProps = {
    eqClassify: '',
    selectedOptions: [],
  };

  handleOk = () => {
    this.props.confirm();
  };

  handleChange = (value) => {
    this.props.setModalOption({
      ...this.props.modalOption,
      enumType: value,
      fieldValue: undefined,
    });
  };

  handleValueChange = (type, e) => {
    let fieldValue = null;
    switch (type) {
      case '下拉框':
        fieldValue = e;
        break;
      case '文本框':
        fieldValue = e.target.value;
        break;
      case '日期':
        fieldValue = e.format('YYYY-MM-DD');
        break;
      case '数字':
        fieldValue = e;
        break;
      case '复选框':
        fieldValue = e;
        break;
      default:
        return;
    }
    this.props.setModalOption({
      ...this.props.modalOption,
      fieldValue,
    });
  };
  handleFormChange = (type, e) => {
    const value = e.target.value;
    switch (type) {
      case 'id':
        this.props.setModalOption({
          ...this.props.modalOption,
          orderBy: value,
        });
        break;
      case 'attribute':
        this.props.setModalOption({
          ...this.props.modalOption,
          fieldName: value,
        });
        break;
      case 'unit':
        this.props.setModalOption({
          ...this.props.modalOption,
          measureunit: value,
        });
        break;
      default:
        console.log('can\'t reach it');
    }
  };

  switchComponent(type) {
    console.log(this.props.modalOption.fieldValue);
    const style = { width: '100%' };
    switch (type) {
      case '下拉框':
        return <Select style={style} value={this.props.modalOption.fieldValue} onChange={this.handleValueChange.bind('', '下拉框')} >{this.props.selectedOptions.map(ele => (<Option key={ele.enumVal} value={ele.description}>{ele.description}</Option>))}</Select>;
      case '文本框':
        return <TextArea rows={1} style={style} value={this.props.modalOption.fieldValue} onChange={this.handleValueChange.bind('', '文本框')} />;
      case '日期':
        return <DatePicker style={style} value={this.props.modalOption.fieldValue ? moment(this.props.modalOption.fieldValue) : undefined} onChange={this.handleValueChange.bind('', '日期')} />;
      case '数字':
        return <InputNumber style={style} value={this.props.modalOption.fieldValue} onChange={this.handleValueChange.bind('', '数字')} />;
      case '复选框':
        return <Checkbox style={style} value={this.props.modalOption.fieldValue} onChange={this.handleValueChange.bind('', '复选框')} />;
      default:
        return <Input disabled />;
    }
  }

  render() {
    const { visible, toggleModal, eqClassify } = this.props;
    const { orderBy, fieldName, measureunit, enumType } = this.props.modalOption;
    console.log('orderBy:',orderBy);
    const typeList = this.props.isAddModel ? [
      { name: '文本框', value: '文本框' },
      { name: '日期', value: '日期' },
      { name: '数字', value: '数字' },
      { name: '复选框', value: '复选框' },
    ] : [
      { name: '下拉框', value: '下拉框' },
      { name: '文本框', value: '文本框' },
      { name: '日期', value: '日期' },
      { name: '数字', value: '数字' },
      { name: '复选框', value: '复选框' },
    ];
    return (
      <Modal
        visible={visible}
        title={`${this.props.modalOption.id === undefined ? '添加属性' : '修改属性'}`}
        onCancel={toggleModal.bind('', false)}
        onOk={this.handleOk}
      >
        <div>
          <Row gutter={10}>
            <Col span={12}>
              <label className="ant-form-item-required" htmlFor="id">序号: </label>
              <Input id="id" value={orderBy} onChange={this.handleFormChange.bind('', 'id')} />
            </Col>
            <Col span={12}>
              <label htmlFor="classify">分类名称: </label>
              <Input id="classify" value={eqClassify} disabled />
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={12}>
              <label className="ant-form-item-required" id="attribute">属性名称: </label>
              <Input htmlFor="attribute" value={fieldName} placeholder="请输入属性名称" onChange={this.handleFormChange.bind('', 'attribute')} />
            </Col>
            <Col span={12}>
              <label className="ant-form-item-required" id="type">类型: </label>
              <Select htmlFor="type" allowClear placeholder="请选择类型:" style={{ width: '100%' }} value={enumType} onChange={this.handleChange}>
                {typeList.map(ele => <Option value={ele.value} key={ele.value}>{ele.name}</Option>)}
              </Select>
            </Col>
          </Row>
          <Row gutter={10}>
            <Col span={12}>
              <label id="value">属性值: </label>
              {this.switchComponent(enumType)}
            </Col>
            <Col span={12}>
              <label id="unit">单位: </label>
              <Input value={measureunit} htmlFor="unit" placeholder="请输入单位" onChange={this.handleFormChange.bind('', 'unit')} />
            </Col>
          </Row>
        </div>
      </Modal>
    );
  }
}
