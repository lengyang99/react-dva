import React, { Component } from 'react';
import { Icon, Select, TreeSelect} from 'antd';
import styles from './EqConfig.less';
import {getEqConfigData, getEqConfigParam} from '../../../services/operationStandard';


const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
const loop = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children')) {
      return <TreeNode value={ele.id} dataRef={ele} title={ele.name} key={`${ele.id}`} />;
    } else {
      return (
        <TreeNode value={ele.id} dataRef={ele} title={ele.name} key={`${ele.id}`}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};
let uuid = 1;
let ugid = 1; // 预览后标识重置 累加后标识可能重复     设备条件的propertyValue下拉选 编辑时未还原
export default class EqConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eqTypeData: {}, // 根据设备类型查询条件结果
      eqData: props.value, // 设备设置
      delPropertyIds: {}, // 删除的技术参数
      delParameterIds: {}, // 删除的属性
      delEquipmentTypeIds: [], // 删除的设备分类
      fieldNameList: {}, // 技术参数列表
      fieldValueList: {}, // 技术参数属性值列表
      parameterValueList: {}, // 属性值列表
    };
    this.initParams();
  }
  initParams = () => {
    const eqData = [...this.state.eqData];
    this.initEqConfig(eqData);
    this.onChange(eqData);
  }
  /**
 *@desc 构造初始数组结构 保证至少有一个空技术参数 和 空的属性，且技术与属性数组长度相等
 *@param {Array} 设备配置数据
 */
  initEqConfig = (data = []) => {
    const id = `pr_${ugid += 1}`;
    data.forEach((item, index) => {
      if (item.equipmentType && item.equipmentType !== '') {
        this.onAreaSelect(item.equipmentType, index, '000');
      }
      if (!item.properties || item.properties.length === 0) {
        item.properties.push({
          ugid: id,
          propertyName: '',
          propertyValue: '',
          isUse: '',
        });
      }
      if (!item.parameters || item.parameters.length === 0) {
        item.parameters.push({
          ugid: id,
          parameterName: '',
          parameterValue: '',
          isUse: '',
        });
      }
      const len1 = item.properties.length;
      const len2 = item.parameters.length;
      if (len1 > len2) {
        for (let i = 0; i < len1 - len2; i++) {
          item.parameters.push({
            ugid: id,
            parameterName: '',
            parameterValue: '',
            isUse: '',
          });
        }
      }
      if (len1 < len2) {
        for (let i = 0; i < len2 - len1; i++) {
          item.properties.push({
            ugid: id,
            propertyName: '',
            propertyValue: '',
            isUse: '',
          });
        }
      }
    });
  };
  /**
 *@desc 构造初始数组结构 保证至少有一个空技术参数 和 空的属性，且技术与属性数组长度相等
 *@param {String,String,int,int,int} 改变列的值，被改变的列名称,数组下标，数组下标, 改变属性或改变技术参数
 */
  onChangeEqData = (value, column, index, index2, type) => {
    const newData = [...this.state.eqData];
    if (index2 || index2 === 0) {
      if (type === 1) {
        const parameters = [...newData[index].parameters] || [];
        parameters[index2][column] = value;
        newData[index].parameters = parameters;
      }
      if (type === 0) {
        const properties = [...newData[index].properties] || [];
        properties[index2][column] = value;
        newData[index].properties = properties;
      }
    } else {
      newData[index][column] = value;
    }
    this.onChange(newData);
  }
  // 回调
  onChange = (data) => {
    if (this.props.onChange) {
      this.props.onChange(data);
    }
    this.setState({eqData: data});
  }
  /**
 *@desc 删除设备分类或者设备分类下的属性和技术参数
 *@param {int,int,int,int,int} 1 删除设备分类 2 删除设备分类下的属性和技术参数，数组下标，1 删除数据库记录 0 删除界面新建记录, 数组下标
 */
  remove = (type, gid, index, del, index2) => {
    let newData = [...this.state.eqData];
    const fieldNameList = {...this.state.fieldNameList};
    const fieldValueList = {...this.state.fieldValueList};
    const parameterValueList = {...this.state.parameterValueList};
    const delPropertyIds = {...this.state.delPropertyIds};
    const delParameterIds = {...this.state.delParameterIds};
    const delEquipmentTypeIds = [...this.state.delEquipmentTypeIds];
    if (type === 1) {
      newData = newData.filter(item => {
        const eqId = item.gid ? item.gid : item.uuid;
        return eqId !== gid;
      });
      if (this.props.action === 'edit' && del === 1) {
        delEquipmentTypeIds.push(gid);
      }
      delete fieldNameList[`${index}_${index2}`];
      const {keys} = Object;
      for (const key of keys(fieldValueList)) {
        if (key.startsWith(`${index}`)) {
          delete fieldValueList.key;
        }
      }
      for (const key of keys(parameterValueList)) {
        if (key.startsWith(`${index}`)) {
          delete parameterValueList.key;
        }
      }
    }
    if (type === 2) {
      const properties = [...newData[index].properties] || [];
      const parameters = [...newData[index].parameters] || [];
      const target = properties.filter(item => {
        const pId = item.gid ? item.gid : item.ugid;
        return pId !== gid;
      });
      parameters.splice(index2, 1);
      if (target) {
        newData[index].properties = target;
        newData[index].parameters = parameters;
      }
      const {keys} = Object;
      for (const key of keys(fieldValueList)) {
        if (key.startsWith(`${index}_${index2}`)) {
          delete fieldValueList.key;
        }
      }
      for (const key of keys(parameterValueList)) {
        if (key.startsWith(`${index}_${index2}`)) {
          delete parameterValueList.key;
        }
      }
      if (this.props.action === 'edit' && del === 1) {
        const eqId = newData[index].gid;
        const target2 = properties.filter(item => {
          const pId = item.gid ? item.gid : item.ugid;
          return pId === gid;
        })[0];
        const target3 = parameters[index2];
        if (target2) {
          const eqIds = [];
          eqIds.push(target2.gid);
          if (delPropertyIds.hasOwnProperty('eqId') && delPropertyIds[eqId].length !== 0) {
            delPropertyIds[eqId] = [...delPropertyIds[eqId], ...[eqIds]];
          } else {
            delPropertyIds[eqId] = eqIds;
          }
        }
        if (target3) {
          const eqIds = [];
          eqIds.push(target3.gid);
          if (delParameterIds.hasOwnProperty('eqId') && delParameterIds[eqId].length !== 0) {
            delParameterIds[eqId] = [...delParameterIds[eqId], ...[eqIds]];
          } else {
            delParameterIds[eqId] = eqIds;
          }
        }
      }
    }
    this.setState({fieldNameList, fieldValueList, parameterValueList, delEquipmentTypeIds, delPropertyIds, delParameterIds});
    this.onChange(newData);
  }
  // 增加(设备分类、设备技术参数，设备属性)
  add = (type, index = 0) => {
    const id = `pr_${ugid += 1}`;
    const newData = [...this.state.eqData];
    const params = {
      uuid: `pr_${uuid += 1}`,
      equipmentType: '',
      properties: [
        {
          ugid: id,
          propertyName: '',
          propertyValue: '',
          isUse: ''}],
      parameters: [
        {
          ugid: id,
          parameterName: '',
          parameterValue: '',
          isUse: ''}],
    };
    if (type === 2) {
      newData[index].properties.push({
        ugid: id,
        propertyName: '',
        propertyValue: '',
        isUse: '',
      });
      newData[index].parameters.push({
        ugid: id,
        parameterName: '',
        parameterValue: '',
        isUse: '',
      });
    }
    if (type === 1) {
      newData.push(params);
    }
    this.onChange(newData);
  }
  // 清空条件选择
  resetSelect = (value, index, gid, del) => {
    const newData = [...this.state.eqData];
    const fieldNameList = {...this.state.fieldNameList};
    const fieldValueList = {...this.state.fieldValueList};
    const parameterValueList = {...this.state.parameterValueList};
    const delEquipmentTypeIds = [...this.state.delEquipmentTypeIds];
    const id = `pr_${ugid += 1}`;
    if (this.props.action === 'edit' && del === 1) {
      delEquipmentTypeIds.push(gid);
    }
    // 删除原有的设备分类
    newData[index] = [];
    // 创建新的设备分类
    newData[index].uuid = `pr_${uuid += 1}`;
    newData[index].equipmentType = value;
    newData[index].properties = [{
      ugid: id,
      propertyName: '',
      propertyValue: '',
      isUse: '',
    }];
    newData[index].parameters = [{
      ugid: id,
      parameterName: '',
      parameterValue: '',
      isUse: '',
    }];
    delete fieldNameList[`${index}_${value}`];
    const {keys} = Object;
    for (const key of keys(fieldValueList)) {
      if (key.startsWith(`${index}`)) {
        delete fieldValueList.key;
      }
    }
    for (const key of keys(parameterValueList)) {
      if (key.startsWith(`${index}`)) {
        delete parameterValueList.key;
      }
    }
    this.setState({ fieldNameList, parameterValueList, fieldValueList, delEquipmentTypeIds});
    this.onChange(newData);
  }
  // 选择设备
  onAreaSelect = (value, index, reset, del) => {
    this.onChangeEqData(value, 'equipmentType', index);
    if (reset !== '000') {
      this.resetSelect(value, index, reset, del);
    }
    getEqConfigData({equipmentType: value}).then((res) => {
      if (res.data) {
        const fieldName = new Set();
        (res.data || []).forEach(item => {
          if (item.fieldValue) {
            fieldName.add(item.fieldName);
          }
        });
        const fieldNameData = [...fieldName];
        const fieldNameList = {...this.state.fieldNameList};
        const eqTypeData = {...this.state.eqTypeData};
        eqTypeData[index] = res.data;
        fieldNameList[`${index}_${value}`] = fieldNameData;
        this.setState({fieldNameList, eqTypeData});
      }
    });
  }
  getEqParamData = (value, type, index, index2) => {
    getEqConfigParam({clsGid: type, col: value}).then((res) => {
      if (res.data) {
        const parameterValueList = {...this.state.parameterValueList};
        parameterValueList[`${index}_${index2}_${value}`] = res.data;
        this.setState({parameterValueList});
      }
    });
  }
  // 选择技术参数/属性
  onSelectChange = (value, alias, index, index2, type, eqType) => {
    if (eqType) {
      this.getEqParamData(value, eqType, index, index2);
    }
    this.onChangeEqData(value, alias, index, index2, type);
    const values = type === 0 ? 'propertyValue' : 'parameterValue';
    this.onChangeEqData('', values, index, index2, type);
    const eqTypeData = {...this.state.eqTypeData};
    const fieldValueData = (eqTypeData[index] || []).filter(item => item.fieldName === value && item.fieldValue);
    const fieldValueList = {...this.state.fieldValueList};
    fieldValueList[`${index}_${index2}_${value}`] = fieldValueData;
    this.setState({fieldValueList});
  }
  /**
 *@desc 根据数组下标获取设备分类属性下拉选数据
 *@param {int} 数组下标
 *@return {Object} 属性下拉选
 */
  getParameterNameData = (index) => {
    const eqData = [...this.state.eqData];
    let parameterValueOptions = null;
    if (eqData[index].equipmentType && eqData[index].equipmentType !== '') {
      const parameterName = [
        {fieldKey: 'eq_name', fieldValue: '设备名称'},
        {fieldKey: 'pos_desc', fieldValue: '展示位置'},
        {fieldKey: 'model', fieldValue: '规格型号'},
        {fieldKey: 'eq_status', fieldValue: '设备状态'},
        {fieldKey: 'imp_degree', fieldValue: '材质'},
        {fieldKey: 'good_grades', fieldValue: '完好等级'},
        {fieldKey: 'gis_report_state', fieldValue: 'gis上报状态'},
        {fieldKey: 'is_spcl_eq', fieldValue: '是否特种设备'},
        {fieldKey: 'is_linear_eq', fieldValue: '是否线性设备'},
        {fieldKey: 'supplier', fieldValue: '供应商'},
        {fieldKey: 'manufacturer', fieldValue: '生产厂家'},
        {fieldKey: 'responsible', fieldValue: '责任人'},
      ];
      parameterValueOptions = (parameterName || []).map(item =>
        <Option key={item.fieldKey} value={item.fieldKey} title={item.fieldValue}>{item.fieldValue}</Option>
      );
    } else {
      parameterValueOptions = null;
    }
    return parameterValueOptions;
  }
  /**
 *@desc 根据数组下标和属性获取设备分类属性的属性值下拉选数据
 *@param {int,int,String} 数组下标,数组下标,属性
 *@return {Object} 属性下拉选
 */
  getParameterValueData = (index, index2, value) => {
    const parameterValueList = {...this.state.parameterValueList};
    const parameterValueOptions = (parameterValueList[`${index}_${index2}_${value}`] || []).map(item =>
      <Option key={item} value={item} title={item}>{item}</Option>
    );
    return parameterValueOptions;
  }
  getFieldNameData = (index, value) => {
    const fieldNameList = {...this.state.fieldNameList};
    const fieldNameOptions = (fieldNameList[`${index}_${value}`] || []).map(item =>
      <Option key={item} value={item} title={item}>{item}</Option>
    );
    return fieldNameOptions;
  }
  getFieldValueData = (index, index2, value) => {
    const fieldValueList = {...this.state.fieldValueList};
    const fieldValueOptions = (fieldValueList[`${index}_${index2}_${value}`] || []).map(item =>
      <Option key={item.fieldValue} value={item.fieldValue} title={item.fieldValue}>{item.fieldValue}</Option>
    );
    return fieldValueOptions;
  }
  render() {
    const {action, eqTypeData} = this.props;
    const eqData = [...this.state.eqData];
    const formItems = eqTypeData.length !== 0 ? eqData.map((item, index) => {
      const gid = item.gid ? item.gid : item.uuid;
      const del = item.gid ? 1 : 0;
      const equipmentType = item.equipmentType ? `${item.equipmentType}` : item.equipmentType;
      return (
        <div key={gid} style={{display: 'inline-block', padding: 5, marginLeft: 80}} >
          <div style={{float: 'left'}}>
            <div className={styles['field-block']}>
              <label>{`设备分类${index + 1}：`}</label>
              <TreeSelect
                disabled={action === 'read'}
                showSearch
                className={styles.select3}
                value={equipmentType}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                onSelect={(value) => { this.onAreaSelect(value, index, gid, del); }}
                treeDefaultExpandAll
                filterTreeNode={(inputValue, treeNode) => treeNode.props.title.indexOf(inputValue) > -1}
              >
                {loop(eqTypeData)}
              </TreeSelect>
            </div>
            {eqData.length > 1 ? (
              <Icon
                className={styles['dynamic-delete-button']}
                type="minus"
                disabled={eqData.length === 1 || action === 'read'}
                onClick={() => this.remove(1, gid, index, del, item.equipmentType)}
              />
              ) : null}
            {index === 0 ? (
              <Icon
                disabled={action === 'read'}
                className={styles['dynamic-delete-button']}
                type="plus"
                onClick={() => this.add(1, index)}
              />
              ) : null}
          </div>
          <div style={{float: 'right' }}>
            { (item.properties || []).map((item2, index2) => {
            const pgid = item2.gid ? item2.gid : item2.ugid;
            const del2 = item2.gid ? 1 : 0;
              return (
                <div key={pgid}>
                  <div style={{width: 700, height: 50}}>
                    <div className={styles['field-block']}>
                      <label>{`技术参数${index2 + 1}：`}</label>
                      <Select
                        allowClear
                        disabled={action === 'read'}
                        onChange={(value) => this.onSelectChange(value, 'propertyName', index, index2, 0)}
                        value={item2.propertyName}
                        className={styles.select}
                      >
                        {this.getFieldNameData(index, item.equipmentType)}
                      </Select>
                    </div>
                    <div className={styles['field-block']}>
                      <Select
                        allowClear
                        disabled={action === 'read'}
                        onChange={(value) => this.onChangeEqData(value, 'isUse', index, index2, 0)}
                        className={styles.select4}
                        value={item2.isUse}
                      >
                        <Option value={1}>等于</Option>
                        <Option value={0}>不等于</Option>
                      </Select>
                    </div>
                    <div className={styles['field-block']}>
                      <Select
                        allowClear
                        disabled={action === 'read'}
                        onChange={(value) => this.onChangeEqData(value, 'propertyValue', index, index2, 0)}
                        className={styles.select2}
                        value={item2.propertyValue}
                      >
                        {this.getFieldValueData(index, index2, item2.propertyName)}
                      </Select>
                    </div>
                    <div style={{display: 'inline-block'}}>
                      {item.properties.length > 1 ? (
                        <Icon
                          className={styles['dynamic-delete-button']}
                          type="minus"
                          disabled={item.properties.length === 1 || action === 'read'}
                          onClick={() => this.remove(2, pgid, index, del2, index2)}
                        />
              ) : null}
                      {index2 === 0 ? (
                        <Icon
                          disabled={action === 'read'}
                          className={styles['dynamic-delete-button']}
                          type="plus"
                          onClick={() => this.add(2, index)}
                        />
              ) : null}
                    </div>
                  </div>
                  <div style={{width: 700, height: 50}}>
                    <div className={styles['field-block']}>
                      <label>{`属性${index2 + 1}：`}</label>
                      <Select
                        allowClear
                        disabled={action === 'read'}
                        onChange={(value) => this.onSelectChange(value, 'parameterName', index, index2, 1, item.equipmentType)}
                        value={item.parameters[index2].parameterName}
                        className={styles.select}
                      >
                        {this.getParameterNameData(index)}
                      </Select>
                    </div>
                    <div className={styles['field-block']}>
                      <Select
                        allowClear
                        disabled={action === 'read'}
                        onChange={(value) => this.onChangeEqData(value, 'isUse', index, index2, 1)}
                        className={styles.select4}
                        value={item.parameters[index2].isUse}
                      >
                        <Option value={1}>等于</Option>
                        <Option value={0}>不等于</Option>
                      </Select>
                    </div>
                    <div className={styles['field-block']}>
                      <Select
                        disabled={action === 'read'}
                        onChange={(value) => this.onChangeEqData(value, 'parameterValue', index, index2, 1)}
                        className={styles.select2}
                        value={item.parameters[index2].parameterValue}
                      >
                        {this.getParameterValueData(index, index2, item.parameters[index2].parameterName)}
                      </Select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }) : null;
    return (
      <div>
        {formItems}
      </div>
    );
  }
}
