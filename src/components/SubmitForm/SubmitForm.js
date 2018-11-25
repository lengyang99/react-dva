import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Select, Input, InputNumber, Table, DatePicker, message,
  Checkbox, Radio, Switch, Icon, Upload, Button, TreeSelect, Modal, Rate
} from 'antd';
import moment from 'moment';
import styles from './index.less';
import { getAttachInfo } from '../../services/seeMedia';
import { getCurrTk } from '../../utils/utils.js';
import MaterialSelect from '../MaterialTable/MaterialSelect.js';
import SearchAddress from '../SearchAddress/SearchAddress.js';
import PipeEquip from '../PipeEquip/PipeEquip.js';
import ContractNum from '../ContractNum/ContractNum.js';
import EngineeringCode from '../EngineeringCode/EngineeringCode.js';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const dateFormat = 'YYYY-MM-DD';
const datetimeFormat = 'YYYY-MM-DD HH:mm:ss';

const Option = Select.Option;
const SHOW_CHILD = TreeSelect.SHOW_CHILD;

class SubmitForm extends Component {
  constructor(props) {
    super(props);
    this.propsData = props;
    this.initPropsData();
  }

  componentWillReceiveProps(nextProps) {
    // 当第二次输入的数据与第一次不符时重新加载表单
    let flag = false;
    if (this.propsData.data.length === nextProps.data.length) {
      for (let i = 0; i < nextProps.data.length; i++) {
        if (nextProps.data[i].gid !== this.propsData.data[i].gid) {
          flag = true;
        }
      }
    } else {
      flag = true;
    }
    if (flag) {
      this.propsData = nextProps;
      this.initPropsData(1);
    }
  }

  initPropsData = (type) => {
    this.values = {};
    this.attValues = {};
    this.delAttValues = {};
    this.CgMap = {};
    this.cascade = this.propsData.cascade;
    this.showInputState = {}; // 判断当前字段的显隐
    let stObj = {};
    let attUUidStr = '';
    for (let pm of this.propsData.data) {
      let nm = pm.name;
      if (pm.type === 'TITLE_DIVIDER') {
        //  去除分割符
      } else if (pm.type === 'IMG' || pm.type === 'ADO' || pm.type === 'ATT') {
        stObj[pm.name] = [];
        if (pm.value && pm.value.length > 0) {
          attUUidStr = `${attUUidStr},${pm.value}`;
        }
      } else if (pm.type === 'DATE') {
        // 时间类型设置默认时间
        stObj[pm.name] = pm.value || (moment().format(dateFormat));
      } else if (pm.type === 'DATETIME') {
        // 时间类型设置默认时间
        stObj[pm.name] = pm.value || moment().format(datetimeFormat);
      } else if (pm.type === 'FAULT') {
        // 故障类型数据
        stObj[pm.name] = {};
        for (let faultData of this.propsData.data) {
          if (faultData.type === 'FAULT') {
            try {
              stObj[pm.name][faultData.name] = {};
              stObj[pm.name][faultData.name] = JSON.parse(faultData.value);
            } catch (e) {
              stObj[pm.name][faultData.name] = faultData.value;
            }
          }
        }
      } else {
        stObj[pm.name] = pm.value;
      }
    }
    if (attUUidStr.length > 0) {
      attUUidStr = attUUidStr.substring(1, attUUidStr.length);
      this.getAttachInfos(attUUidStr);
    }
    this.setValues(this.propsData.data);
    stObj.tmpaddr = '';
    if (type) {
      this.setState({
        ...stObj,
      });
    } else {
      this.state = stObj;
    }
  }

  setValues = (data) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].type === 'DIVIDERTHICK') {
        continue;
      }

      if (data[i].type === 'TITLE_DIVIDER') {
        continue;
      }
      // 设置不可编辑非必填项也要提交数据
      if (data[i].edit === 1 && data[i].visible === 1
        || (data[i].edit === 0 && data[i].required === 1 && data[i].visible === 1)) {
        let tmpvalue = data[i].value;
        if (data[i].type === 'DATE') {
          if (data[i].value) {
            tmpvalue = data[i].value;
          } else {
            tmpvalue = moment().format(dateFormat);
          }
        }
        if (data[i].type === 'DATETIME') {
          if (!data[i].value) {
            tmpvalue = moment().format(datetimeFormat);
          }
        }
        if (data[i].type === 'FAULT') {
          tmpvalue = {};
          for (let j = 0; j < data.length; j++) {
            if (data[j].type === 'FAULT') {
              try {
                tmpvalue[data[j].name] = {};
                tmpvalue[data[j].name] = JSON.parse(data[j].value);
              } catch (e) {
                tmpvalue[data[j].name] = data[j].value;
              }
            }
          }
        }
        this.values[data[i].name] = {
          value: tmpvalue,
          name: data[i].name,
          alias: data[i].alias,
          required: data[i].required,
          type: data[i].type,
        };
        if (data[i].type === 'GEOM' || data[i].type === 'GEOMG') {
          let geomData = null;
          for (let j = 0; j < data.length; j++) {
            if (data[j].name === `${data[i].name}_geom`) {
              geomData = data[j];
              break;
            }
          }
          this.values[`${data[i].name}_geom`] = {
            value: '',
            name: `${data[i].name}_geom`,
            alias: '坐标',
            required: 0,
            type: 'TXT',
          };
          if (geomData) {
            this.values[geomData.name] = {
              ...this.values[geomData.name],
              value: geomData.value,
              alias: geomData.alias,
              required: geomData.required,
              type: geomData.type,
            };
          }
        }
      }
    }
  }

  getValues = () => {
    const params = {};
    let keys = Object.keys(this.values);
    for (let key of keys) {
      if (this.showInputState[this.values[key].name] === false) {
        continue;
      }

      if (this.values[key].type !== 'ADO' && this.values[key].type !== 'IMG' && this.values[key].type !== 'ATT'
        && this.values[key].type !== 'FAULT' && this.values[key].type !== 'MATERIAL') {
        params[key] = this.values[key].value;
      } else if (this.values[key].type === 'FAULT') {
        for (let key2 in this.values[key].value) {
          if (this.values[key].value.hasOwnProperty(key2)) {
            params[key2] = this.values[key].value[key2];
          }
        }
      } else if (this.values[key].type === 'MATERIAL') {
        params[key] = this.refs.materialSelect.getValues();
      }
    }
    return params;
  };

  getAttValues = () => {
    let that = this;
    const params = {};
    const attValues = that.attValues;
    let keys = Object.keys(that.attValues);
    for (let key of keys) {
      if (this.showInputState[that.attValues[key].name] === false) {
        continue;
      }
      let fileList = that.attValues[key].value;
      const formData = new FormData();
      const addFields = [];
      fileList.forEach((file) => {
        if (file.gid) {
          addFields.push(file.gid);
          file = JSON.stringify(file);
        }
        formData.append('files[]', file);
      });
      if (addFields.length > 0) {
        formData.append('addUids', addFields.join(','));
      }
      if (that.delAttValues[that.attValues[key].name]) {
        formData.append('deleteUids', that.delAttValues[that.attValues[key].name]);
      }
      if (fileList.length === 0 && !that.delAttValues[that.attValues[key].name]) {
        continue;
      }
      params[key] = formData;
    }
    return params;
  }

  validateRequired() {
    let keys = Object.keys(this.values);
    for (let key of keys) {
      let elem = this.values[key];
      if (this.showInputState[elem.name] === false) {
        continue;
      }

      if (elem.required === 1 && elem.type === 'PIPEDEV') {
        if (elem.value.pipe.length === 0 && elem.value.equip.length === 0) {
          return elem.alias;
        }
      }

      if (elem.required === 1 && (!elem.value || elem.value.length === 0) && elem.type !== 'PIPEDEV') {
        if (elem.type === 'ADO' || elem.type === 'IMG' || elem.type === 'ATT') {
          if ((!this.attValues[elem.name] || !this.attValues[elem.name].value || this.attValues[elem.name].value.length === 0)) {
            return elem.alias;
          }
        } else {
          return elem.alias;
        }
      }
    }
    return '';
  }

  setDevInputValue = (name, val) => {
    this.setState({
      [`${name}dev`]: val,
    });
  };
  setContInputValue = (name, val) => {
    this.setState({
      [`${name}cont`]: val,
    });
  };

  setAddInputValue = (name, val) => {
    this.setState({
      [`${name}add`]: val,
    });
  };

  setCgMap = (group, selectValues) => {
    this.CgMap[group] = this.CgMap[group] || {};
    for (let sv of selectValues) {
      if (sv.selectValues && sv.selectValues.length > 0) {
        this.CgMap[group][sv.name] = sv.selectValues;
        this.setCgMap(group, sv.selectValues);
      }
    }
  };

  handleChange = (name, val) => {
    this.values[name] && (this.values[name].value = val);
    if (name === 'is_workflow_approval' && val === '10000001') {
      this.props.workflowApproval();
    }
    this.setState({
      [name]: val,
    });
  };

  getItemDom = (data, index) => {
    let that = this;
    if (data.visible !== 1) {
      return null;
    }

    let { type, name, edit, selectValues, value, required, unit, alias, placeholder, accuracy } = data;
    value = this.values[name] && (this.values[name].value || '').length > 0 ? this.values[name].value : value;
    if (edit === 1 && !this.values[name] || (edit === 0 && required === 1)) {
      this.values[name] = {
        value: value,
        name: name,
        alias: data.alias,
        required: required,
        type: type,
      };
    }

    let nameStyle = {};
    let editable = edit === 1; // 是否可以编辑

    let inputWidth = 'field';
    let widthNum = 200;
    if (unit) {
      widthNum = 200 - 12 * unit.length;
    }

    // 默认值为文本，其他类型在后面做判断
    let fieldComp = (
      <Input
        className={styles[inputWidth]}
        style={{ width: widthNum }}
        disabled={!editable}
        defaultValue={value}
        value={this.state[name]}
        placeholder={placeholder}
        onChange={editable ? (eve) => {
          this.handleChange(name, eve.target.value);
        } : null}
      />
    );
    if (name === 'engineering_code' || name === 'zh_no') { // 工程编号
      fieldComp = (
        <EngineeringCode
          value={value || this.state[name]}
          codeName={name}
          onChangeValue={(obj) => {
            for (const [ContractNumKey, ContractNumValue] of Object.entries(obj)) {
              this.handleChange(ContractNumKey, ContractNumValue);
            }
          }}
        />
      );
    } else if (name === 'zh_ht_code') { // 合同号
      fieldComp = (
        <ContractNum
          value={value || this.state[name]}
          onChangeValue={(obj) => {
            for (const [ContractNumKey, ContractNumValue] of Object.entries(obj)) {
              this.handleChange(ContractNumKey, ContractNumValue);
            }
          }}
          request // 户内置换 合同号 需要在查询一个接口
        />
        // <ZhhtCode
        //   value={value || this.state[name]}
        //   onChangeValue={(obj) => {
        //     for (const [ContractNumKey, ContractNumValue] of Object.entries(obj)) {
        //       this.handleChange(ContractNumKey, ContractNumValue);
        //     }
        //   }}
        // />
      );
    } else if (type === 'NUM') { // 数字类型
      value = Number.parseFloat(value);
      value = Number.isNaN(value) ? 0 : value;
      fieldComp = (
        <InputNumber
          defaultValue={value}
          value={this.state[name]}
          className={styles[inputWidth]}
          style={{ width: widthNum }}
          placeholder={placeholder}
          disabled={edit !== 1}
          formatter={(value) => Number.isNaN(value) ? '' : value}
          onChange={(v) => {
            let str = `${v}`;
            str = str.replace(/[^\d.]/g, '');
            if (accuracy && accuracy != 0 && str.indexOf('.') >= 0) {
              str = str.substring(0, str.indexOf('.') + parseInt(accuracy, 10) + 1);
            }
            this.handleChange(name, str);
          }}
        >
        </InputNumber>
      );
    } else if (type === 'TXTEXT') {
      inputWidth = 'textarea1';
      if (this.propsData.column === 2) {
        inputWidth = 'textarea2';
      }
      fieldComp = (
        <Input.TextArea
          className={styles[inputWidth]}
          value={this.state[name]}
          rows={4}
          disabled={data.edit < 1}
          style={{ verticalAlign: 'middle', resize: 'none' }}
          placeholder={placeholder}
          onChange={(e) => {
            this.handleChange(name, e.target.value);
          }}
        />
      );
    } else if (type === 'DATE') {
      fieldComp = (
        <DatePicker
          className={styles[inputWidth]}
          disabled={edit !== 1}
          onChange={(d, dtr) => {
            this.handleChange(name, (dtr === '' || dtr === undefined) ? '' : dtr)
          }}
          placeholder=""
          value={moment(this.state[name], dateFormat).isValid() ? moment(this.state[name], dateFormat) : ''}
        >
        </DatePicker>
      );
    } else if (type === 'DATETIME') {
      fieldComp = (
        <DatePicker
          className={styles[inputWidth]}
          showTime
          format={datetimeFormat}
          disabled={edit !== 1}
          onChange={(d, dtr) => {
            this.handleChange(name, (dtr === '' || dtr === undefined) ? '' : dtr)
          }}
          placeholder=""
          value={moment(this.state[name], datetimeFormat).isValid() ? moment(this.state[name], datetimeFormat) : ''}
        >
        </DatePicker>
      );
    } else if (type === 'CONTACTS' || type === 'CONTACTM') {
      let nameInitArr = [];
      if (type === 'CONTACTS') {
        nameInitArr = '';
        for (const e of data.selectValues.values()) {
          if (e.name === String(data.value)) {
            nameInitArr = e.alias;
          }
        }
      } else {
        nameInitArr = [];
        let dataV = '';
        try {
          dataV = JSON.parse(data.value);
        } catch (e) {
          console.log(e);
        }
        for (const val of data.selectValues.values()) {
          for (const val1 of (dataV || []).values()) {
            if (val.name === String(val1)) {
              nameInitArr.push(val.alias);
            }
          }
        }
      }
      fieldComp = (
        <Input
          className={styles[inputWidth]}
          disabled={edit !== 1}
          onClick={(eve) => {
            this.props.contactHandleClick(data);
          }}
          value={this.state[`${name}cont`] || (Array.isArray(nameInitArr) ? nameInitArr.join(',') : nameInitArr)}
        />
      );
    } else if (type === 'DDL' || type === 'CONTACTS') {
      let cascadeGroup = data.cascadeGroup;
      let cg = '';
      let sn = '0';
      if (cascadeGroup) {
        cg = cascadeGroup.group;
        sn = cascadeGroup.sn;
        this.setCgMap(cg, selectValues);

        if (sn > 0) {
          const newSt = this.state;
          if (!newSt[cg + sn]) {
            newSt[cg + sn] = [];
            this.setState(newSt);
          }
        }

        //  设置默认值
        if (!value) {
          value = (this.state[cg + sn] && this.state[cg + sn].length) > 0 ? this.state[cg + sn][0].name : '';
          if (!value) {
            value = selectValues[0].name;
          }
          if (this.values[name]) {
            this.values[name].value = value;
          }
        }
        if (value) {
          const tmpData = this.setChildDDL(selectValues, value, sn, 0);
          const nextSt = this.state[cg + (parseInt(sn, 10) + 1)];
          if ((!nextSt || nextSt.length === 0) && tmpData && tmpData.length > 0) {
            this.setState({
              [cg + (parseInt(sn, 10) + 1)]: tmpData,
            });
          }
        }
      }

      const childData = (sn === '0' ? selectValues : this.state[cg + sn]);
      let children = childData.map((item) => (
        <Option key={item.name} value={item.name}>{item.alias}</Option>
      ));

      fieldComp = (
        <Select
          showSearch
          className={styles[inputWidth]}
          style={{ width: widthNum }}
          value={value}
          placeholder={placeholder}
          disabled={edit !== 1}
          filterOption={(inputValue, treeNode) => {
            if (treeNode.props.children.indexOf(inputValue) >= 0) {
              return true;
            } else {
              return false;
            }
          }}
          onChange={(val) => {
            if (cg && that.CgMap[cg] && that.CgMap[cg][val]) {
              let svs = that.CgMap[cg][val];
              let newSt = that.state;
              newSt[cg + (Number.parseInt(sn, 10) + 1)] = svs;
              for (let i = 0; i < this.propsData.data.length; i++) {
                let tmpdata = this.propsData.data[i];
                if (tmpdata.name !== data.name && tmpdata.cascadeGroup && tmpdata.cascadeGroup.group === data.cascadeGroup.group) {
                  that.values[tmpdata.name].value = '';
                  // break;
                }
              }

              that.setState(newSt);
            }

            this.handleChange(name, val);
          }}
        >
          {
            children
          }
        </Select>
      );
    } else if (type === 'TXTSEL') {
      let selectData = data.defaultvalue.split(',');
      let children = selectData.map((item) => (
        <Option key={item} value={item}>{item}</Option>
      ));

      fieldComp = (
        <Select
          showSearch
          className={styles[inputWidth]}
          style={{ width: widthNum }}
          value={value}
          disabled={edit !== 1}
          onChange={(val) => {
            this.handleChange(name, val);
          }}
        >
          {
            children
          }
        </Select>
      );
    } else if (type === 'RDO') {
      let key = true;
      if (selectValues.map.name) {
        key = true;
      } else {
        key = false;
      }
      fieldComp = (
        <RadioGroup
          className={styles.rdo_style}
          disabled={edit !== 1}
          onChange={(eve) => {
            this.handleChange(name, eve.target.value);
          }}
          defaultValue={value}>
          {
            selectValues.map((item) => (
              <Radio value={item.name}>{item.alias}</Radio>
            ))
          }
        </RadioGroup>
      );
    } else if (type === 'DEV') {
      let devName = '';
      if (value) {
        try {
          const devAry = [];
          let devData = []
          if (!Array.isArray(value)) {
            devData = JSON.parse(value);
            devData.forEach((item) => {
              devAry.push(item.eqcode);
            });
          } else {
            value.forEach((item) => {
              devAry.push(item.eqcode);
            });
          }
          devName = devAry.join('、');
        } catch (e) {
          console.error(e);
        }
      }
      fieldComp = (
        <Input
          className={styles[inputWidth]}
          disabled={edit !== 1}
          onClick={(eve) => {
            this.props.devHandleClick(name, value);
          }}
          value={devName}
        />
      );
    } else if (type === 'PIPEDEV') {
      fieldComp = (
        <PipeEquip
          fieldname={name}
          defaultValue={value}
          getMap={this.propsData.getMap}
          geomHandleClick={this.propsData.geomHandleClick}
          backToForm={this.propsData.backToForm}
          clickPipeDev={(devData) => {
            this.handleChange(name, devData);
          }}
          styles={{ display: 'inline-block' }}
          disabled={edit !== 1}
        />);
    } else if (type === 'FAULT') {
      let faultValue = '';
      if (this.state[name]) {
        if (this.state[name].repair_classify && this.state[name].repair_classify.name) {
          faultValue = this.state[name].repair_classify.name;
        }
        if (this.state[name].repair_malfunction && this.state[name].repair_malfunction.name) {
          faultValue += (faultValue ? `/${this.state[name].repair_malfunction.name}` : this.state[name].repair_malfunction.name);
        }
        if (this.state[name].repair_reason && this.state[name].repair_reason.name) {
          faultValue += (faultValue ? `/${this.state[name].repair_reason.name}` : this.state[name].repair_reason.name);
        }
        if (this.state[name].repair_solution && this.state[name].repair_solution.name) {
          faultValue += (faultValue ? `/${this.state[name].repair_solution.name}` : this.state[name].repair_solution.name);
        }
      }
      fieldComp = (
        <Input
          className={styles[inputWidth]}
          disabled={edit !== 1}
          onClick={(eve) => {
            that.props.faultHandleClick(name);
          }}
          value={faultValue}
        />
      );
    } else if (type === 'ADD' || type === 'ADDR') {
      fieldComp = (
        <Input
          className={styles[inputWidth]}
          disabled={edit !== 1}
          onClick={(eve) => {
            this.props.addressHandleClick(name);
          }}
          value={this.state[`${name}add`]}
        />
      );
    } else if (type === 'MATERIAL') {
      inputWidth = 'textarea1';
      if (this.propsData.column === 2) {
        inputWidth = 'textarea2';
      }
      fieldComp = (
        <span>
          <Button
            className={styles.field1}
            disabled={edit !== 1}
            onClick={(eve) => {
              this.refs.materialSelect.openMaterialModal();
            }}
          >选择物料</Button>
          <MaterialSelect
            ref="materialSelect"
            defaultValue={value}
            changeMaterialSelect={(selectValue) => {
              this.handleChange(name, selectValue);
            }
            }
            tableClass={inputWidth} />
        </span>
      );
    } else if (type === 'CHK') {
      let checkGroup = selectValues.map((item) => {
        return { label: item.alias, value: item.name };
      });
      let tmpData = [];
      try {
        tmpData = JSON.parse(value);
      } catch (e) {
      }
      fieldComp = (
        <CheckboxGroup
          className={styles.checkbox_style}
          disabled={edit !== 1}
          onChange={(value) => {
            let result = [];
            value.forEach(item => {
              if (item) {
                result.push(item);
              }
            });
            if (result.length === 0) {
              result = '';
            }
            this.handleChange(name, result);
          }}
          options={checkGroup}
          defaultValue={tmpData}>
        </CheckboxGroup>
      );
    } else if (type === 'DDLEXT') {
      const children = [];
      selectValues.map((ii) => {
        children.push(<Option key={ii.name}>{ii.alias}</Option>);
      });

      fieldComp = (
        <div style={{ minHeight: '50px' }}>
          <Select
            style={{ height: '180px', width: widthNum }}
            allowClear={true}
            className={styles[inputWidth]}
            mode="combobox"
            placeholder={placeholder}
            onChange={(val) => {
              this.handleChange(name, val)
            }}
            defaultValue={this.propsData.data.value}
          >
            {children}
          </Select>
        </div>
      )
    } else if (type === 'CONTACTM') {
      const children = [];
      selectValues.map((ii) => {
        children.push(<Option key={ii.name} value={ii.name}>{ii.alias}</Option>);
      });
      /*
       * mada
       * 2017-10-26
       * 新增filterOption   if判断
       * */
      const selected = [];
      try {
        value = JSON.parse(value);
      } catch (e) {
        try {
          // 数据格式不规范导致的解析失败
          const valueStr = value.replace(/\[|]/g, '');
          value = valueStr ? valueStr.split(',') : [];
        } catch (e1) {
          value = [];
        }
      }
      value.map((vi) => {
        selected.push(vi + '');
      });
      fieldComp = (
        <Select
          className={styles[inputWidth]}
          style={{ width: widthNum }}
          mode="multiple"
          value={selected}
          placeholder={placeholder}
          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          onChange={(val) => {
            if (val.toString()) {
              this.handleChange(name, '[' + val.toString() + ']');
            } else {
              this.handleChange(name, '');
            }
          }}
        >
          {children}
        </Select>
      )
    } else if (type === 'TOGGLE') {
      let flag = false;
      for (let i0 of selectValues) {
        if (value === i0.name) {
          flag = i0.logmark === '1';
          break;
        }
      }
      fieldComp = (
        <Switch
          defaultChecked={flag}
          onChange={(val) => {
            for (let ii of selectValues) {
              let flagStr = val ? '1' : '0';
              if (flagStr === ii.logmark) {
                this.handleChange(name, ii.name);
                break;
              }
            }
          }}
        />
      );
    } else if (type === 'RATE') {
      fieldComp = (
        <Rate
          count={5}
          allowHalf={true}
          value={value}
          onChange={(val) => {
            this.handleChange(name, val);
          }}
        />
      );
    } else if (type === 'CONTRACT') {
      fieldComp = (
        <ContractNum
          value={value || this.state[name]}
          onChangeValue={(obj) => {
            for (const [ContractNumKey, ContractNumValue] of Object.entries(obj)) {
              this.handleChange(ContractNumKey, ContractNumValue);
            }
          }}
        />
      );
    } else if (type === 'GEOM' || type === 'GEOMG') {
      const addressValue = {
        addr: value || this.state[name],
        point: this.values[`${name}_geom`] ? this.values[`${name}_geom`].value : '',
      };
      fieldComp = (
        <SearchAddress
          getMap={this.propsData.getMap}
          defaultValue={addressValue}
          fieldname={name}
          geomHandleClick={this.propsData.geomHandleClick}
          setAddrTitle={this.props.setAddrTitle}
          geomSelectedPoint={(fieldname, fieldpoint, fieldaddr) => {
            this.handleChange(fieldname, fieldaddr);
            this.handleChange(`${fieldname}_geom`, `${fieldpoint.x},${fieldpoint.y}`);
            this.props.geomSelectedPoint(fieldname, fieldpoint);
          }}
        />);
    } else if (type === 'TREE') {
      let cascadeGroup = data.cascadeGroup;
      let cg = '';
      let sn = '0';
      if (cascadeGroup) {
        cg = cascadeGroup.group;
        sn = cascadeGroup.sn;
        this.setCgMap(cg, selectValues);
      }

      if (sn > 0) {
        const newSt = this.state;
        if (!newSt[cg + sn]) {
          newSt[cg + sn] = [];
          this.setState(newSt);
        }
      }

      const getDefault = (values, index, forIndex) => {
        if (values && values.length > 0) {
          if (index == forIndex) {
            return values;
          }
          if (values[0].selectValues && values[0].selectValues.length > 0) {
            forIndex++;
            return getDefault(values[0].selectValues, index, forIndex);
          } else {
            return values;
          }
        } else {
          return [];
        }
      }

      let children = [];
      if (this.state[cg + sn] && this.state[cg + sn].length > 0) {
        children = this.state[cg + sn];
      } else {
        children = getDefault(selectValues, sn, 0);
      }

      if (value) {
        value = this.getDefaultValue(value, children);
      }
      //  设置默认值
      if (!value) {
        let tmpValues = getDefault(children, -1, 0);
        if (tmpValues.length > 0) {
          value = tmpValues[0].name;
        }
        if (this.values[name]) {
          this.values[name].value = value;
        }
      }

      let treeGroup = [];
      this.dealTreeData(children, treeGroup);

      fieldComp = (
        <TreeSelect
          showSearch
          treeData={treeGroup}
          showCheckedStrategy={SHOW_CHILD}
          value={value}
          multiple={false}
          className={styles[inputWidth]}
          style={{ width: widthNum }}
          disabled={edit !== 1}
          placeholder={placeholder}
          filterTreeNode={(inputValue, treeNode) => {
            if (treeNode.props.title.indexOf(inputValue) >= 0) {
              return true;
            } else {
              return false;
            }
          }}
          onSelect={(value, label, extra) => {
            if (extra.node.props.children && extra.node.props.children.length > 0) {
              this.handleChange(name, '');
            } else {
              this.handleChange(name, value);
            }
          }}>
        </TreeSelect>
      );
    } else if (type === 'ADO' || type === 'IMG' || type === 'ATT') {
      if (value && !that.attValues[name]) {
        try {
          if (that.state.allAttValues && that.state.allAttValues.length > 0) {
            that.attValues[name] = {
              value: [],
              name: name,
              alias: data.alias,
              required: required,
              type: type,
            };

            that.attValues[name].value = that.state.allAttValues.filter((item) => {
              return value.indexOf(item.uid) >= 0;
            });
            that.handleChange(name, that.attValues[name].value);
          }
        } catch (e) {
          console.error(e);
        }
      }
      nameStyle = {
        float: 'left',
        marginTop: '6px',
      };
      let props = {
        onRemove: (file) => {
          let fileList = that.state[name];
          if (typeof fileList === 'string' && fileList === '') {
            fileList = [];
          }
          let index = fileList.indexOf(file);
          let newFileList = fileList.slice();
          newFileList.splice(index, 1);
          that.attValues[name].value = Object.assign([], newFileList);
          if (file.gid) {
            if (that.delAttValues[name]) {
              that.delAttValues[name] = `${that.delAttValues[name]},${file.gid}`;
            } else {
              that.delAttValues[name] = file.gid;
            }
          }

          that.setState({
            [name]: that.attValues[name].value,
          });
        },
        beforeUpload: (file) => {
          let fileList = that.state[name];
          if (typeof fileList === 'string' && fileList === '') {
            fileList = [];
          }
          let newFileList = fileList.concat(file);
          if (edit === 1 && !this.attValues[name]) {
            that.attValues[name] = {
              value: [],
              name: name,
              alias: data.alias,
              required: required,
              type: type,
            };
          }
          that.attValues[name].value = Object.assign([], newFileList);
          that.setState({
            [name]: that.attValues[name].value,
          });
          return false;
        },
        fileList: that.state[name],
      };

      let attachWidth = (this.propsData.column === 2 ? 'attach2' : 'attach1');
      fieldComp = (
        <div className={styles[attachWidth]}>
          <Upload {...props}>
            <Button>
              <Icon type="upload" /> 上传
            </Button>
          </Upload>
        </div>
      );
    }

    let divStyle = styles.div + ' ' + (type === 'CHK' ? styles.chk_div : '') + ' ' + (type === 'TXTEXT' ? styles.txtext_div : '')
    let returnDiv = (
      <div key={name} className={divStyle}>
        <span className={styles.name} style={nameStyle}>{alias}：</span>
        {fieldComp}
        {unit ? <span style={{ dispaly: 'inline-block', width: unit.length * 14 }}>{unit}</span> : null}
        <span
          className={styles.starSpan + ' ' + (type === 'CHK' ? styles.chk_star : '')}>{data.required ? '*' : null}</span>
      </div>
    );
    return returnDiv;
  };

  getDefaultValue = (value, treeData) => {
    for (let i = 0; i < treeData.length; i++) {
      if (treeData[i].name == value) {
        return value;
      }
      if (treeData[i].selectValues && treeData[i].selectValues.length > 0) {
        return this.getDefaultValue(value, treeData[i].selectValues);
      }
    }
    return '';
  }

  setChildDDL = (selectValues, value, sn, index) => {
    for (let i = 0; i < selectValues.length; i++) {
      if (sn == index) {
        if (value === selectValues[i].name && selectValues[i].selectValues) {
          return selectValues[i].selectValues;
        }
      } else {
        index++;
        return this.setChildDDL(selectValues[i].selectValues, value, sn, index);
      }
    }
    return [];
  }

  dealTreeData = (data, resultData) => {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      let temp = {
        label: item.alias,
        value: item.name,
        key: item.name,
      };
      resultData.push(temp);
      if (item.selectValues && item.selectValues.length > 0) {
        temp.children = [];
        this.dealTreeData(item.selectValues, temp.children);
      }
    }
  }

  setFieldHideOrShow = () => {
    let conObj = {}; // 当存在多个相同字段的配置时只取第一个匹配的数据
    this.showInputState = {};
    for (let i = 0; i < this.cascade.length; i++) {
      if (this.state[this.cascade[i].field]) {
        for (let j = 0; j < this.cascade[i].conditions.length; j++) {
          if (!conObj.hasOwnProperty(this.cascade[i].field)) {
            let operation = '==';
            if (this.cascade[i].conditions[j].operation) {
              operation = this.cascade[i].conditions[j].operation;
            }
            if (this.getHideFlag(operation, this.state[this.cascade[i].field], this.cascade[i].conditions[j].value)) {
              conObj[this.cascade[i].field] = this.cascade[i].conditions[j];
              let hidefield = this.cascade[i].conditions[j].hide.split(',');
              for (let k = 0; k < hidefield.length; k++) {
                this.showInputState[hidefield[k]] = false;
              }
            }
          }
        }
      }
    }

    const opreation = ['==', '!=', '>=', '<=', '>', '<', '.indexOf'];
    for (let k = 0; k < this.propsData.data.length; k++) {
      let tmpData = this.propsData.data[k];
      if (tmpData.hide) {
        let hide = tmpData.hide.replace(/\s+/g, '');
        const keys = Object.keys(this.values);
        keys.forEach((item, index) => {
          if (this.values.hasOwnProperty(item)) {
            opreation.forEach((optItem) => {
              if (hide.indexOf(item + optItem) >= 0 && this.values[item]) {
                hide = hide.replace(item + optItem, `'${this.values[item].value}'${optItem}`);
              }
            });
          }
        });

        let flag = this.isCondition(hide);
        if (flag) {
          this.showInputState[tmpData.name] = false;
        }
      }
    }
  }

  isCondition = (hide) => {
    try {
      return this.evil(hide);
    } catch (e) {
      return false;
    }
  }

  getHideFlag = (operation, value, hideValue) => {
    let flagStr = '';
    if (operation === 'indexOf') {
      flagStr = `"${value}".${operation}("${hideValue}") >= 0`;
    } else {
      flagStr = `${value}${operation}${hideValue}`;
    }
    return this.isCondition(flagStr);
  }

  evil = (fn) => {
    const Fn = Function; // 一个变量指向Function，防止有些前端编译工具报错
    return new Fn('return ' + fn)();
  }

  getAttachInfos = (value) => {
    let that = this;
    getAttachInfo(value).then((res) => {
      if (!res.success) {
        message.info(res.mag);
        return;
      }
      const attachList = [];
      res.data.forEach((item) => {
        const attUrl = window.location.origin + '/proxy/attach/downloadFile?id=' + item.id + '&token=' + getCurrTk();
        attachList.push({
          gid: item.id,
          uid: item.id,
          name: item.filename,
          url: attUrl,
          thumbUrl: attUrl,
        });
      });
      this.setState({
        allAttValues: attachList,
      });
    });
  }

  render() {
    const data = JSON.parse(JSON.stringify(this.propsData.data));
    // for (const elemAcc1 of data.values()) {
    //   if (elemAcc1.name === 'accept_userid') {
    //     elemAcc1.selectValues = JSON.parse(JSON.stringify(data[3].selectValues));
    //   }
    // }
    // 主办人 协办人 不能选择同一个
    // if (data.length > 3) { if (data[2].name === 'accept_userid') { data[2].type = 'CONTACTS'; } }
    if (this.state.accept_userid) {
      for (const elemAcc of data.values()) {
        if (elemAcc.type === 'CONTACTM') {
          for (const [iAcc, eAcc] of elemAcc.selectValues.entries()) {
            if (eAcc.name === this.state.accept_userid) {
              elemAcc.selectValues.splice(iAcc, 1);
            }
          }
        }
      }
    }
    if (this.state.assist_man) {
      for (const elemAcc1 of data.values()) {
        if (elemAcc1.type === 'CONTACTS') {
          const arr1 = [];
          for (const [iAcc1, eAcc1] of elemAcc1.selectValues.entries()) {
            for (const [inAcc, enAcc] of this.state.assist_man.entries()) {
              if (eAcc1.name === String(enAcc)) {
                arr1.push(iAcc1);
              }
            }
          }
          arr1.sort();
          let flagData = 0;
          for (const inData of arr1.values()) {
            elemAcc1.selectValues.splice(inData - flagData, 1);
            flagData++;
          }
        }
      }
    }
    this.setFieldHideOrShow();
    let comp = null;

    const length = data.length;
    if (length > 0) {
      comp = [];
    }
    let tk = 0;
    let columnComp = [];

    for (let index = 0; index < length; index++) {
      if (this.showInputState[data[index].name] === false
        || data[index].visible === 0 || !data[index].visible) {
        if (index === length - 1 && columnComp.length > 0) {
          comp.push((
            <div key={tk}>
              {columnComp}
            </div>
          ));
        }
        continue;
      }
      tk++;

      if (data[index].type === 'DIVIDERTHICK') {
        comp.push(columnComp);
        comp.push((
          <div
            key={tk}
            style={{
              width: '100%',
              padding: '5px 10px',
            }}
          >
            <div
              style={{
                margin: '5px 0',
                height: 2,
                backgroundColor: '#888',
              }}
            >
            </div>
          </div>
        ));
        columnComp = [];
        continue;
      }

      if (data[index].type === 'TITLE_DIVIDER') {
        comp.push(columnComp);
        comp.push(
          <div key={tk} style={{ width: '100%', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
            <div style={{
              float: 'left',
              width: '3px',
              marginTop: '3px',
              marginRight: '10px',
              marginBottom: '10px',
              height: '15px',
              backgroundColor: '#1890FF'
            }}></div>
            <span>{data[index].alias}</span>
          </div>
        );
        columnComp = [];
        continue;
      }

      if (data[index].type === 'CHK' || data[index].type === 'TXTEXT'
        || data[index].type === 'ATT' || data[index].type === 'IMG' || data[index].type === 'ADO') {
        comp.push((
          <div key={tk}>
            {columnComp}
          </div>
        ));
        tk++;
        comp.push((
          <div key={tk}>
            {this.getItemDom(data[index], index)}
          </div>
        ));
        columnComp = [];
        continue;
      }

      columnComp.push(this.getItemDom(data[index], index));

      if (columnComp.length === this.propsData.column || index === (length - 1)) {
        comp.push((
          <div key={tk}>
            {columnComp}
          </div>
        ));
        columnComp = [];
        continue;
      }
    }

    return (
      <div>
        {comp}
      </div>
    );
  }
}

SubmitForm.defaultProps = {
  data: [],
  addrList: [], // 记录当前查询地址的下拉值
  getMap: (f) => f, // 获取当前地图对象
  column: 1,
  cascade: [], // 接收参数是否包含隐藏显示
  geomHandleClick: (f) => f,
  devHandleClick: (f) => f,
  faultHandleClick: (f) => f,
  addressHandleClick: (f) => f,
  materialHandleClick: (f) => f,
  onChangeGeomValue: (f) => f,
  backToForm: (f) => f,
};

SubmitForm.propTypes = {
  data: PropTypes.array.isRequired,
  addrList: PropTypes.array,
  getMap: PropTypes.func,
  cascade: PropTypes.array,
  column: PropTypes.number,
  geomHandleClick: PropTypes.func,
  devHandleClick: PropTypes.func,
  faultHandleClick: PropTypes.func,
  addressHandleClick: PropTypes.func,
  materialHandleClick: PropTypes.func,
  onChangeGeomValue: PropTypes.func,
  backToForm: PropTypes.func,
};

export default SubmitForm;
