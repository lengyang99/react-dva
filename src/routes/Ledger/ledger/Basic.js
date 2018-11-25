import React, { Component } from 'react';
import printJS from 'print-js';
import { Input, Select, Form, Button } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';
import classnames from 'classnames';
import EqModal from './EqModal';
import SelectTree from './SelectTree';
import OrgTree from './OrgTree';
import styles from './Form.less';

const Option = Select.Option;
const Item = Form.Item;

/**
 * @desc Select 组件的 Options
 * @param {[]} data
 */
const getOptions = data => {
  if (Array.isArray(data)) {
    return data.map(ele => <Option key={ele.value} value={ele.value.toString()}>{ele.text}</Option>);
  } else {
    return null;
  }
};
const getCompanyOptions = data => {
  if (Array.isArray(data)) {
    return data.map(ele => <Option key={ele.bwkey}>{ele.name}</Option>);
  } else {
    return null;
  }
};

@connect(
  state => ({
    eqDetailPositionName: state.ledger.eqDetailPositionName,
    siteList: state.ledger.siteList,
    ledgerLists: state.ledger.ledgerLists,
    imageDisplay: state.ledger.imageDisplay,
    disabled: state.ledger.disabled,
    groupTreeData: state.ledger.groupTreeData,
  })
)
export default class Basic extends Component {
  static propTypes = {
    ledgerLists: propTypes.object.isRequired,
    imageDisplay: propTypes.string,
  };
  static defaultProps = {
    imageDisplay: 'none',
  };
  // 分类 onChange 事件
  handleChange = (value, tags) => {
    this.props.dispatch({
      type: 'ledger/setEqClassify',
      payload: tags[0],
    });
  };


  handleChangePosition = (value, label, e) => {
    console.log(e);
    this.props.dispatch({
      type: 'ledger/setEqDetail',
      payload: {
        ...this.props.eqDetail,
        position: value,
        ccode: e.triggerNode ? e.triggerNode.props.ccode : '',
        isEdit: true,
      },
    });
  };
  state = {
    visible: false,
  };
  /**
   * @desc 模态框关闭 or 打开
   * @param {boolean} flag
   */
  toggleModal = (flag) => {
    this.setState({
      visible: flag,
    });
  };

  render() {
    const { ledgerLists, imageDisplay, eqDetail, groupTreeData, disabled } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.form}>
        <p className="title">基本信息</p>
        <div className={styles.form__field}>
          <div>
            <div className={classnames('pull-left', styles.form__qr__l)}>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="id">设备编码 :</label>
                {getFieldDecorator('id')(<Input className={styles.form__input__middle} id="id" disabled placeholder="设备编号" />)}
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="name">设备名称 :</label>
                {getFieldDecorator('name', {
                  rules: [{ required: true, message: '设备名称不能为空' }],
                })(<Input disabled={disabled} className={styles.form__input__middle} id="name" placeholder="请输入设备名称" />)}
                <div className="form__required" />
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="classify">设备分类 :</label>
                {getFieldDecorator('classify', {
                  rules: [{ required: true, message: '设备分类不能为空' }],
                })(
                  <SelectTree
                    disabled={disabled}
                    className={styles.form__input__middle}
                    id="classify"
                    dataSource={ledgerLists.classify}
                    placeholder="请选择设备分类"
                    searchPlaceholder="请输入需要索引的设备"
                    onChange={this.handleChange}
                  />
                )}
                <div className="form__required" />
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="organization">所属组织 :</label>
                {/*<Input disabled={disabled} className={styles.form__input__middle} value={this.props.eqDetail.organizationName} id="organization" disabled />*/}
                {getFieldDecorator('organizationName', {
                  rules: [{ required: true, message: '所属组织不能为空' }],
                })(
                  <OrgTree
                    disabled={disabled}
                    className={styles.form__input__middle}
                    id="organization"
                    dataSource={groupTreeData}
                    placeholder="请选择组织"
                    searchPlaceholder="请输入需要索引的组织"
                    onChange={this.handleChange}
                  />
                )}
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="site">所属站点 :</label>
                {getFieldDecorator('site', {
                  rules: [{ required: true, message: '所属站点不能为空' }],
                })(
                  <Select disabled={disabled} className={styles.form__input__middle} id="site" placeholder="请选择站点" allowClear>
                    {getOptions(ledgerLists.site)}
                  </Select>
                )}
                <div className="form__required" />
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="area">执行区域 :</label>
                {getFieldDecorator('area')(
                  <Select disabled={disabled} className={styles.form__input__middle} id="site" placeholder="请选择可执行区域" allowClear>
                    {getOptions(ledgerLists.area)}
                  </Select>
                )}
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="position">所属位置 :</label>
                <SelectTree
                  disabled={disabled}
                  className={styles.form__input__middle}
                  id="position"
                  dataSource={ledgerLists.pos}
                  placeholder="请选择位置"
                  searchPlaceholder="请输入需要索引的位置"
                  onChange={this.handleChangePosition}
                  value={this.props.eqDetail.position}
                />
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="ccode">所属公司 :</label>
                {getFieldDecorator('ccode')(
                  <Select className={styles.form__input__middle} id="ccode" disabled>
                    {getCompanyOptions(ledgerLists.companyCode)}
                  </Select>
                )}
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="positionName">位置名称 :</label>
                {getFieldDecorator('positionName')(
                  <Input disabled={disabled} className={styles.form__input__middle} id="positionName" placeholder="请输入位置名称" />
               )}
              </Item>
              <Item className={styles.form__item__large}>
                <label className={styles.form__label} htmlFor="oldEqCode">原设备编码 :</label>
                {getFieldDecorator('oldEqCode')(
                  <Input disabled={disabled} className={styles.form__input__middle} id="name" placeholder="请输入原设备编码" />
                )}
              </Item>
            </div>
            <div
              className={classnames('pull-right', styles.form__qr__r)}
              style={{display: imageDisplay}}
            >
              <img src={`/proxy/ldgrFile/${eqDetail.ewCodeUUID}`} alt="qr" className={styles.form__qr__image} />
              <Button
                className={styles.form__qr__print}
                type="primary"
                onClick={() => {
                  printJS({
                    printable: `/proxy/ldgrFile/${eqDetail.ewCodeUUID}`,
                    type: 'image',
                    header: `设备名称:${eqDetail.name} & 设备编号:${eqDetail.id}`,
                  });
                }}
              >打印二维码</Button>
            </div>
          </div>
          <div className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="parentEq">父级设备 :</label>
            <Input
              disabled={disabled}
              value={this.props.eqDetail.parentName}
              onClick={this.toggleModal.bind('', true)}
              id="parentEq"
              className={styles.form__input__small}
              placeholder="请选择父级设备"
            />
          </div>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="type">设备类型 :</label>
            {getFieldDecorator('type')(
              <Select disabled={disabled} className={styles.form__input__small} id="type" allowClear placeholder="请选择设备类型">
                {getOptions(ledgerLists.type)}
              </Select>
            )}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="perfect">完好等级 :</label>
            {getFieldDecorator('perfect')(
              <Select disabled={disabled} className={styles.form__input__small} id="perfect" allowClear placeholder="请选择完好等级">
                {Array.isArray(ledgerLists.perfectLevel) ?
                  ledgerLists.perfectLevel.map(ele => <Option key={ele.value} value={ele.kid}>{ele.text}</Option>) :
                  null
                }
              </Select>
            )}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="isSpecial" placeholder="是否为特种设备">特种设备 :</label>
            {getFieldDecorator('isSpecial')(
              <Select disabled={disabled} className={styles.form__input__small} id="isSpecial" allowClear initValue="0">
                <Option value="1">是</Option>
                <Option value="0">否</Option>
              </Select>
            )}
          </Item>
        </div>
        <EqModal visible={this.state.visible} toggleModal={this.toggleModal} />
      </div >
    );
  }
}
