import React, { Component } from 'react';
import { Input, DatePicker, Select, Upload, Icon, Button, Form } from 'antd';
import { connect } from 'dva';
import classnames from 'classnames';
import propTypes from 'prop-types';
import styles from './Form.less';
import SparePartsModal from './SparePartsModal';

const Textarea = Input.TextArea;
const Item = Form.Item;
const Option = Select.Option;

const dataFormat = data => ({
  gid: data.gid,
  eqCode: data.id,
  eqName: data.name,
  clsGid: data.classify,
  stationId: data.site,
  workZone: data.area,
  posId: data.position || '',
  posDesc: data.positionName,
  eqType: data.type,
  goodGrads: data.perfect,
  isSpclEq: data.isSpecial,
  parentId: data.parentId,
  parentName: data.parentName,
  model: data.model,
  instalUnit: data.company,
  manufacturer: data.manufacturer,
  instalDate: data.installDate,
  responsible: data.person,
  impDegree: data.importantLevel,
  changedBy: data.user,
  prodDate: data.productionDate,
  serialNum: data.code,
  failCode: data.malfunction,
  material: data.material,
  supplier: data.provider,
  qltyExp: data.qualityDate,
  fixAstsCode: data.fixedCode,
  eqStatus: data.status,
  nextRepairDate: data.nextRepairDate,
  nextRepairLevel: data.nextRepairLevel,
  proDefineNumber: data.proDefineNumber,
  spareParts: data.spareParts,
  sparePartsAccount: data.sparePartsAccount,
  oldEqCode: data.oldEqCode,
  ccode: data.ccode,
});

@connect(
  state => ({
    token: state.login.token,
    funs: state.login.funs,
    attachmentListArr: state.ledger.attachmentListArr,
    isNewLedger: state.ledger.isNewLedger,
    eqClassify: state.ledger.eqClassify,
    filterOption: state.ledger.filterOption,
    ledgerLists: state.ledger.ledgerLists,
    nextRepairLevel: state.ledger.nextRepairLevel,
    disabled: state.ledger.disabled,
  })
)
export default class Detail extends Component {
  state = {
    name: '', // 上传附件的名称
    fileList: [], // 上传附件列表
    oldAttachmentListArr: [], // 是否要加载过已上传的附件
    visible: false,
  };
  static propTypes = {
    isNewLedger: propTypes.bool.isRequired,
    filterOption: propTypes.object.isRequired,
    ledgerLists: propTypes.object.isRequired,
    eqClassify: propTypes.string.isRequired,
  };
  /**
   * @desc 表单提交
   */
  handleSubmit = () => {
    const { fileList } = this.state;
    // this.setState({ fileList: [] });
    this.props.form.validateFields(errors => {
      if (!errors) {
        const { eqDetail, filterOption, isNewLedger, eqClassify } = this.props;
        this.props.dispatch({
          type: 'ledger/postLedger',
          payload: { eqDetailFormat: dataFormat(eqDetail), eqDetail, filterOption, isNewLedger, clsName: eqClassify, fileList },
        });
      }
    });
    this.setState({ fileList: [] });
  };
  toggleModal = (flag) => {
    this.setState({
      visible: flag,
    });
  };
  render() {
    const { getFieldDecorator } = this.props.form;
    const { isNewLedger, ledgerLists, attachmentListArr, nextRepairLevel, funs, sparePartsList, eqDetail, disabled } = this.props;
    let ledger_add = true; // 设备台账添加
    let ledger_edit = true; // 设备台账编辑
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code === 'ledger_add') {
        ledger_add = false;
      }
      if (json.code === 'ledger_edit') {
        ledger_edit = false;
      }
    }
    const { name, fileList, oldAttachmentListArr } = this.state;
    if (JSON.stringify(attachmentListArr) !== JSON.stringify(oldAttachmentListArr)) {
      this.setState({ fileList: attachmentListArr });
      this.setState({ oldAttachmentListArr: attachmentListArr });
    }
    if (fileList.length === 0 && JSON.stringify(fileList) !== JSON.stringify(attachmentListArr)) {
      this.setState({ fileList: attachmentListArr });
      this.setState({ oldAttachmentListArr: attachmentListArr });
    }
    const props = {
      name, // 发到后台的文件参数名
      fileList, // 已经上传的文件列表
      multiple: true, // 是否支持多选文件，ie10+ 支持。开启后按住 ctrl 可选择多个文件。
      onRemove: (file) => {
        if (ledger_edit) {
          return false;
        } else {
          const status = file.status;
          if (status === 'removed') {
            this.props.dispatch({
              type: 'ledger/deleteAttachmentList',
              payload: file.uid,
            });
          }
          this.setState(({ fileList }) => {
            const index = fileList.indexOf(file);
            const newFileList = fileList.slice();
            newFileList.splice(index, 1);
            return {
              fileList: newFileList,
            };
          });
        }
      },
      // 上传文件之前的钩子，参数为上传的文件，若返回 false 则停止上传。支持返回一个 Promise 对象，Promise 对象 reject 时则停止上传，resolve 时开始上传。注意：IE9 不支持该方法。
      beforeUpload: (file) => {
        this.setState({ name: file.name || '' });
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
    };
    return (
      <div>
        <p className="title">详细信息</p>
        <div className={styles.form__field}>
          <Item className={styles.form__item__large}>
            <label className={classnames(styles.form__label, 'align-top')} htmlFor="model">规格型号 :</label>
            {getFieldDecorator('model')(<Textarea disabled={disabled} className={classnames(styles.form__input__large, styles.form__model)} id="model" placeholder="请输入规格型号" />)}
          </Item>
          <Item className={styles.form__item__large}>
            <div className={styles.form__item__full}>
              <label className={styles.form__label} htmlFor="company">安装单位 :</label>
              {getFieldDecorator('company')(<Input disabled={disabled} className={styles.form__input__large} id="company" placeholder="请输入安装单位" />)}
            </div>
            <div className={styles.form__item__full}>
              <label className={styles.form__label} htmlFor="manufacturer">生产厂家 :</label>
              {getFieldDecorator('manufacturer')(<Input disabled={disabled} className={styles.form__input__large} id="manufacturer" placeholder="请输入生产厂家" />)}
            </div>
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="installDate">安装日期 :</label>
            {getFieldDecorator('installDate')(<DatePicker disabled={disabled} id="installDate" style={{ width: '50%' }} />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="person">责任人 :</label>
            {getFieldDecorator('person')(<Input disabled={disabled} className={styles.form__input__small} id="person" placeholder="请输入责任人" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="importantLevel">重要程度 :</label>
            {getFieldDecorator('importantLevel')(
              <Select disabled={disabled} className={styles.form__input__small} id="importantLevel" placeholder="请选择重要程度" allowClear>
                {Array.isArray(ledgerLists.importantLevel) ?
                  ledgerLists.importantLevel.map(ele => <Option value={ele.value} key={ele.kid}>{ele.text}</Option>) :
                  null
                }
              </Select>
            )}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="user">变更人 :</label>
            <Input className={styles.form__input__small} id="user" value={this.props.eqDetail.user} disabled />
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="productionDate">出厂日期 :</label>
            {getFieldDecorator('productionDate')(<DatePicker disabled={disabled} style={{ width: '50%' }} id="productionDate" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="code">序列号 :</label>
            {getFieldDecorator('code')(<Input disabled={disabled} className={styles.form__input__small} id="code" placeholder="请输入序列号" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="malfunction">故障分类 :</label>
            {getFieldDecorator('malfunction')(
              <Select
                disabled={disabled}
                className={styles.form__input__small}
                showSearch
                allowClear
                id="malfunction"
                placeholder="请选择故障分类"
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {Array.isArray(ledgerLists.malfunction) ?
                  ledgerLists.malfunction.map(ele => <Option value={ele.gid.toString()} key={ele.gid}>{ele.description}</Option>) :
                  null
                }
              </Select>
            )}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="changeDate">变更日期 :</label>
            <DatePicker style={{ width: '50%' }} id="changeDate" disabled value={this.props.eqDetail.changedTime} />
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="material">材质 :</label>
            {getFieldDecorator('material')(<Input disabled={disabled} className={styles.form__input__small} id="material" placeholder="请输入材质" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="provider">供应商 :</label>
            {getFieldDecorator('provider')(<Input disabled={disabled} className={styles.form__input__small} id="provider" placeholder="请输入供应商" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="qualityDate">质保到日期 :</label>
            {getFieldDecorator('qualityDate')(<DatePicker disabled={disabled} style={{ width: '50%' }} id="qualityDate" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="fixedCode">资产编号 :</label>
            {getFieldDecorator('fixedCode')(<Input disabled={disabled} className={styles.form__input__small} placeholder="请输入固定资产编号" id="fixedCode" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="status">状态 :</label>
            {getFieldDecorator('status')(
              <Select disabled={disabled} className={styles.form__input__small} id="status" placeholder="请选择状态" allowClear>
                {Array.isArray(ledgerLists.status) ?
                  ledgerLists.status.map(ele => <Option value={ele.value} key={ele.kid}>{ele.text}</Option>) :
                  null
                }
              </Select>
            )}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="nextRepairDate">下次维保时间 :</label>
            {getFieldDecorator('nextRepairDate')(<DatePicker style={{ width: '50%' }} id="nextRepairDate" disabled />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="nextRepairLevel">下次维保等级 :</label>
            {getFieldDecorator('nextRepairLevel')(
              <Select
                disabled
                className={styles.form__input__small}
                showSearch
                allowClear
                id="malfunction"
                placeholder="请选择等级"
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {Array.isArray(nextRepairLevel) ?
                  nextRepairLevel.map(item => <Option value={item.value}>{item.text}</Option>) :
                  null
                }
              </Select>
            )}
          </Item>
          {/*<Item className={styles.form__item__small}>*/}
            {/*<label className={styles.form__label} htmlFor="spareParts">周转备件 :</label>*/}
            {/*{getFieldDecorator('spareParts')(*/}
              {/*<Input*/}
                {/*disabled={disabled}*/}
                {/*value={this.props.eqDetail.parentName}*/}
                {/*onClick={this.toggleModal.bind('', true)}*/}
                {/*id="parentEq"*/}
                {/*className={styles.form__input__small}*/}
                {/*placeholder="请选择周转备件" />*/}
            {/*)}*/}
          {/*</Item>*/}
          <div className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="spareParts">周转备件 :</label>
            <Input
              disabled={disabled}
              value={this.props.eqDetail.spareParts}
              onClick={this.toggleModal.bind('', true)}
              id="spareParts"
              className={styles.form__input__small}
              placeholder="请选择周转备件"
            />
          </div>
          <div className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="sparePartsAccount">备件库存数量 :</label>
            <Input
              value={this.props.eqDetail.sparePartsAccount}
              id="sparePartsAccount"
              className={styles.form__input__small}
              placeholder="周转备件库存数量"
              disabled
            />
          </div>
          {/*<Item className={styles.form__item__small}>*/}
            {/*<label className={styles.form__label} htmlFor="sparePartsAmount">备件库存数量 :</label>*/}
            {/*{getFieldDecorator('sparePartsAmount')(*/}
              {/*<Input disabled className={styles.form__input__small} id="sparePartsAmount" placeholder="备件库存数量" />*/}
            {/*)}*/}
          {/*</Item>*/}
          <Item className={styles.form__item__small}>
            <label className={styles.form__label} htmlFor="proDefineNumber">项目定义号 :</label>
            {getFieldDecorator('proDefineNumber')(<Input disabled={disabled} className={styles.form__input__small} id="proDefineNumber" placeholder="输入项目号" />)}
          </Item>
          <Item className={styles.form__item__small}>
            <label className={styles.form__label}>附件 :</label>
            <Upload {...props}><Button disabled={ledger_edit}><Icon type="upload" />上传文件</Button></Upload>
          </Item>
          {
            disabled ?
              null :
              (<Button
                disabled={ledger_add}
                onClick={this.handleSubmit}
                type="primary"
                className="pull-right"
                style={{ marginRight: '6%' }}
              >
                保存
              </Button>)
          }
        </div>
        <SparePartsModal visible={this.state.visible} toggleModal={this.toggleModal} />
      </div>
    );
  }
}
