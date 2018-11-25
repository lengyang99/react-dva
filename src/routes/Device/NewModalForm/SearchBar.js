import React, { PureComponent } from 'react';
import {Select, Icon, Button, Input, TreeSelect, Popconfirm, Tooltip, Checkbox} from 'antd';
import {getEqConfigData, getEqConfigParam} from '../../../services/operationStandard';
import styles from '../NewRelMaintenPlan/index.less';

const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;
const defaultSearch = {
  propertys: [], // 设备技术参数的筛选条件
  parameters: [], // 设备属性筛选条件
  areaId: null, // 区域id
  others: null, // 模糊关键字
  isConnectPlan: null, // 制定状态
};
export default class NewAreaEqModal extends PureComponent {
    state = {
      ...defaultSearch,
      expand: false, // 是否展开高级查询
      itemNameList: {}, // 筛选项
      itemValueList: {}, // 筛选关键项
      filedData: [], // 设备属性和设备条件，
      eqTypeData: {}, // 设备分类数据,
      divIndex: {
        i: null,
        index: null,
      },
    }
    componentDidMount() {
      const { funcList, activeKey, functionKey} = this.props;
      const { gid } = funcList[`${activeKey}_${functionKey}`] || {};
      this.queryOperaType(gid);
    }
    loop = (list) => {
      return !Array.isArray(list) ? null : list.map(ele => {
        if (!ele.hasOwnProperty('children') || ele.children.length === 0) {
          return <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.name} key={`${ele.gid}`} />;
        } else {
          return (
            <TreeNode value={parseInt(ele.gid, 10)} dataRef={ele} title={ele.name} key={`${ele.gid}`}>
              {this.loop(ele.children)}
            </TreeNode>
          );
        }
      });
    };
    expand = () => {
      this.setState({ expand: !this.state.expand });
    }
    // 区域改变
    onAreaChange = (value) => {
      this.queryEqAreaData({areaId: value || null});
      this.props.dispatch({
        type: 'device/areaIdChange',
        payload: value || null,
      });
    }
    // 按制定状态筛选
    handleStatusChange = (value) => {
      this.setState({ isConnectPlan: value });
    }
    // 模糊
    handleLikeValueChange = (e) => {
      this.setState({ others: e.target.value });
    }
    // 区域制定计划
    handleBoxChange = (e) => {
      this.props.handleBoxCheck(e.target.checked);
      this.setState({ expand: !this.state.expand });
      this.queryEqAreaDataByArea();
    }
    queryEqAreaDataByArea = () => {
      const areaId = this.props.areaId;
      if (areaId) {
        this.props.dispatch({
          type: 'device/queryAreaEq',
          payload: {areaId, pageno: 1, pagesize: 10, isSyncEquipment: 1, propertys: this.state.propertys, parameters: this.state.parameters},
          callback: (data) => {
          },
        });
      }
    }
    // 根据条件查询设备
    queryEqAreaData = (params = {}) => {
      this.props.queryEqAreaData(params);
    }
    // 条件查询
    handleSearch = () => {
      // this.getEqSerachParams();
      const searchArr = [...this.state.filedData];
      const propertys = [];
      const parameters = [];
      searchArr.forEach(ele => {
        if (ele.searchItems && ele.searchItems.length !== 0) {
          ele.searchItems.forEach(item => {
            const flag = item.itemName === '<单击添加搜索项>' || item.itemUse === '<单击添加条件>' || item.itemValue === '<单击添加关键字>';
            if (flag) {
              propertys.push({ ecode: ele.ecode, equipmentType: ele.equipmentType });
              parameters.push({ ecode: ele.ecode, equipmentType: ele.equipmentType });
            } else {
              if (item.type === 'parameters') {
                parameters.push({ ecode: ele.ecode, equipmentType: ele.equipmentType, parameterName: item.itemName, parameterValue: item.itemValue, isUse: item.itemUse });
              }
              if (item.type === 'propertys') {
                propertys.push({ ecode: ele.ecode, equipmentType: ele.equipmentType, propertyName: item.itemName, propertyValue: item.itemValue, isUse: item.itemUse });
              }
            }
          });
        } else {
          propertys.push({ ecode: ele.ecode, equipmentType: ele.equipmentType });
          parameters.push({ ecode: ele.ecode, equipmentType: ele.equipmentType });
        }
      });
      this.setState({propertys, parameters});
      this.queryEqAreaData({ propertys, parameters });
    }
    // 查询作业类型详情
    queryOperaType = (value) => {
      this.props.dispatch({
        type: 'operationStandard/readOperaType',
        payload: {
          functionId: value,
        },
        callback: (data) => {
          if (data && data.functionEquipmentTypes.length !== 0) {
            const properData = [];
            const parametersData = [];
            const searchAry = [];
            (data.functionEquipmentTypes || []).forEach(item => {
              const searchItems = [];
              if (item.properties.length !== 0) {
                item.properties.forEach(item2 => {
                  searchItems.push({
                    itemName: item2.propertyName,
                    itemValue: item2.propertyValue,
                    itemUse: item2.isUse,
                    type: 'propertys',
                  });
                  properData.push({
                    ecode: item2.ecode,
                    equipmentType: item2.equipmentType,
                    propertyName: item2.propertyName,
                    propertyValue: item2.propertyValue,
                    isUse: item2.isUse,
                  });
                });
              } else {
                properData.push({
                  ecode: item.ecode,
                  equipmentType: item.equipmentType,
                });
              }
              if (item.parameters.length !== 0) {
                item.parameters.forEach(item2 => {
                  searchItems.push({
                    itemName: item2.parameterName,
                    itemValue: item2.parameterValue,
                    itemUse: item2.isUse,
                    type: 'parameters',
                  });
                  parametersData.push({
                    ecode: item2.ecode,
                    equipmentType: item2.equipmentType,
                    parameterName: item2.parameterName,
                    parameterValue: item2.parameterValue,
                    isUse: item2.isUse,
                  });
                });
              } else {
                parametersData.push({
                  ecode: item.ecode,
                  equipmentType: item.equipmentType,
                });
              }
              searchAry.push({ ecode: item.ecode, equipmentType: item.equipmentType, searchItems });
            });
            this.setState({ propertys: properData, parameters: parametersData, filedData: searchAry });
            this.queryEqAreaData({ propertys: JSON.stringify(properData), parameters: JSON.stringify(parametersData)});
            this.getItemNameList(searchAry);
          } else {
            this.queryEqAreaData({ propertys: [], parameters: []});
          }
        },
      });
    }
    // 获取关键字列表
    getItemValueList = (equipmentType, itemName, type, eqTypeData) => {
      const itemValueList = { ...this.state.itemValueList };
      if (type === 'parameters' && !itemValueList[`${equipmentType}_${itemName}`]) {
        getEqConfigParam({ clsGid: equipmentType, col: itemName }).then((res) => {
          if (res.data) {
            const parameterValue = [];
            res.data.forEach(item => {
              parameterValue.push({ fieldKey: item, fieldValue: item });
            });
            itemValueList[`${equipmentType}_${itemName}`] = parameterValue;
          }
        });
      } else if (type === 'propertys' && !itemValueList[`${equipmentType}_${itemName}`]) {
        const fieldValueData = (eqTypeData[equipmentType] || []).filter(item => item.fieldName === itemName && item.fieldValue);
        const propertyValue = [];
        fieldValueData.forEach(item => {
          propertyValue.push({ fieldKey: item.fieldValue, fieldValue: item.fieldValue });
        });
        itemValueList[`${equipmentType}_${itemName}`] = propertyValue;
      }
      this.setState({ itemValueList });
    }
    // 获取筛选项列表
    getItemNameList = (data) => {
      const itemNameList = {};
      const eqTypeData = {};
      const parameters = [
        { fieldKey: 'eq_name', fieldValue: '设备名称', type: 'parameters' },
        { fieldKey: 'pos_desc', fieldValue: '展示位置', type: 'parameters' },
        { fieldKey: 'model', fieldValue: '规格型号', type: 'parameters' },
        { fieldKey: 'eq_status', fieldValue: '设备状态', type: 'parameters' },
        { fieldKey: 'imp_degree', fieldValue: '材质', type: 'parameters' },
        { fieldKey: 'good_grades', fieldValue: '完好等级', type: 'parameters' },
        { fieldKey: 'gis_report_state', fieldValue: 'gis上报状态', type: 'parameters' },
        { fieldKey: 'is_spcl_eq', fieldValue: '是否特种设备', type: 'parameters' },
        { fieldKey: 'is_linear_eq', fieldValue: '是否线性设备', type: 'parameters' },
        { fieldKey: 'supplier', fieldValue: '供应商', type: 'parameters' },
        { fieldKey: 'manufacturer', fieldValue: '生产厂家', type: 'parameters' },
        { fieldKey: 'responsible', fieldValue: '责任人', type: 'parameters' },
      ];
      data.forEach(ele => {
        getEqConfigData({ equipmentType: ele.equipmentType }).then((res) => {
          const fieldName = new Set();
          (res.data || []).forEach(item2 => {
            if (item2.fieldValue) {
              fieldName.add(item2.fieldName);
            }
          });
          const fieldNameData = [...fieldName];
          const propertys = [];
          fieldNameData.forEach(item3 => {
            propertys.push({ fieldKey: item3, fieldValue: item3, type: 'propertys' });
          });
          itemNameList[ele.equipmentType] = [...propertys, ...parameters];
          eqTypeData[ele.equipmentType] = res.data;
          (ele.searchItems || []).forEach(item => {
            this.getItemValueList(ele.equipmentType, item.itemName, item.type, eqTypeData);
          });
        });
      });
      this.setState({ eqTypeData, itemNameList });
    }
    // 改变高级筛选条件
    onChxChange = (item, column, index, idx, equipmentType) => {
      const datas = [...this.state.filedData];
      const data = datas[index].searchItems;
      if (column === 'itemName') {
        data[idx].itemName = item.fieldKey;
        data[idx].type = item.type;
        this.getItemValueList(equipmentType, item.fieldKey, item.type, this.state.eqTypeData);
      } else if (column === 'itemUse') {
        data[idx].itemUse = item.fieldKey;
      } else if (column === 'itemValue') {
        data[idx].itemValue = item.fieldKey;
      }
      this.onFiledDataChange(datas);
    }
    // 删除高级筛选条件
    reduceSearch = (index, idx) => {
      const data = [...this.state.filedData];
      data[index].searchItems.splice(idx, 1);
      this.onFiledDataChange(data);
    }
    // 增加高级筛选条件
    addSearch = (ecode, equipmentType, index) => {
      const data = [...this.state.filedData];
      data[index].ecode = ecode;
      data[index].equipmentType = equipmentType;
      data[index].searchItems.push({ itemName: '<单击添加搜索项>', itemUse: '<单击添加条件>', itemValue: '<单击添加关键字>' });
      this.onFiledDataChange(data);
    }
    onFiledDataChange = (data) => {
      this.setState({ filedData: data });
    }
    divClassName = (i, index) => {
      return i === this.state.divIndex.i && index === this.state.divIndex.index ? styles.selectRow : '';
    };
    handleDivClick = (i, index) => {
      this.setState({
        divIndex: { i, index },
      }, () => {
        this.divClassName(i, index);
      });
    }
    render() {
      const {eqTypeData, areaData, checked, areaId, taskType, mode} = this.props;
      const {expand, filedData, isConnectPlan, others, itemValueList, itemNameList} = this.state;
      const caterData = [
        { alias: '全部', value: null },
        { alias: '未制定', value: 0 },
        { alias: '已制定', value: 1 },
      ];
      const catergoryOptions = (caterData || []).map(item => <Option value={item.value}>{item.alias}</Option>);
      const parameterList = {
        'pos_desc': '展示位置',
        'model': '规格型号',
        'eq_status': '设备状态',
        'imp_degree': '材质',
        'good_grades': '完好等级',
        'gis_report_state': 'gis上报状态',
        'is_spcl_eq': '是否特种设备',
        'is_linear_eq': '是否线性设备',
        'supplier': '供应商',
        'manufacturer': '生产厂家',
        'responsible': '责任人',
      };
      const msg = [
        '设备编号、设备名称、地址',
        '用户名称、客户号、合同号、设备编号、读表人、表钢号、地址',
        '用户名称、客户号、合同账户、地址',
      ];
      const bool = [{ fieldKey: 0, fieldValue: '不等于' }, { fieldKey: 1, fieldValue: '等于' }];
      const State = ({ datas, onChange }) => {
        const items = (datas || []).map(item =>
          (<div
            className={styles.label}
            onClick={() => {
                      onChange(item);
                  }}
            key={item.fieldKey}
          ><span>{item.fieldValue}</span></div>));
        return (<div style={{ maxHeight: 200, overflow: 'auto' }}>{items}</div>);
      };
      return (
        <div>
          <div>
            {!checked ? <div className={styles['field-block2']}>
              <label>设备计划制定状态：</label>
              <Select
                className={styles.select}
                value={isConnectPlan}
                onChange={this.handleStatusChange}
              >
                { catergoryOptions}
              </Select>
            </div> : null}
            <div className={styles['field-block2']}>
              <label>所属区域：</label>
              <TreeSelect
                className={styles.treeSelect}
                value={areaId}
                showSearch
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="请选择"
                allowClear
                onChange={this.onAreaChange}
                treeDefaultExpandAll
                filterTreeNode={(inputValue, treeNode) => treeNode.props.title.indexOf(inputValue) > -1}
              >
                {this.loop(areaData)}
              </TreeSelect>
            </div>
            {areaId && taskType !== 2 ? <div className={styles['field-block2']}>
              <Tooltip title="依据区域和设备坐标的空间关系动态生成任务">
                <Checkbox
                  className={styles.checkbox}
                  checked={checked}
                  onChange={this.handleBoxChange}
                >
                    按区域制定计划
                </Checkbox>
              </Tooltip>
            </div> : null }
            {!checked ?
              <div className={styles['field-block2']}>
                <Tooltip title={msg[mode]}>
                  <Input
                    className={styles.input}
                    placeholder={msg[mode]}
                    value={others}
                    onChange={this.handleLikeValueChange}
                  />
                </Tooltip>
              </div>
                   : null}
            {!checked ?
              <div className={styles['field-block3']}>
                <Button
                  type="primary"
                  htmlType="button"
                  className={styles['new-dev-btn']}
                  onClick={this.handleSearch}
                >查询
                </Button>
                <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.expand}>
                  {expand ? '收起' : '高级查询'}<Icon type={expand ? 'up' : 'down'} />
                </a>
              </div>
               : null}
          </div>
          <div style={{display: !expand || checked ? 'none' : 'inline-block', border: '1px solid RGB(204,204,204)', borderRadius: 5, maxHeight: 100, width: '100%', overflow: 'auto'}}>
            {(filedData || []).map((ele, i) => {
                const eqItem = (eqTypeData || []).find(item => item.id === ele.equipmentType.toString());
                return (<div>
                  <div>
                    <label style={{marginLeft: 10}}>{`设备分类: ${eqItem ? eqItem.name : ele.equipmentType}`}</label>
                    <a style={{marginLeft: 10, color: 'RGB(100,190,0)'}} onClick={() => this.addSearch(ele.ecode, ele.equipmentType, i)}>单击添加搜索项</a>
                  </div>
                  {(ele.searchItems || []).map((item, idx) => (
                    <div className={this.divClassName(i, idx)} onClick={() => this.handleDivClick(i, idx)}>
                      <div className={styles['field-block2']}>
                        <Popconfirm
                          placement="topLeft"
                          title={<State datas={itemNameList[ele.equipmentType]} onChange={(val) => this.onChxChange(val, 'itemName', i, idx, ele.equipmentType)} />}
                          okText=""
                          cancelText=""
                        >
                          <label style={{'color': '#379FFF', cursor: 'pointer', fontSize: 14}}>{item.type === 'parameters' ? parameterList[item.itemName] : item.itemName}</label>
                        </Popconfirm>
                      </div>
                      <div className={styles['field-block2']}>
                        <Popconfirm
                          placement="topLeft"
                          title={<State datas={bool} onChange={(val) => this.onChxChange(val, 'itemUse', i, idx)} />}
                          okText="确定"
                          cancelText="取消"
                        >
                          <label style={{cursor: 'pointer', fontSize: 14}}>{item.itemUse === 0 ? '不等于' : item.itemUse === 1 ? '等于' : item.itemUse}</label>
                        </Popconfirm>
                      </div>
                      <div className={styles['field-block2']}>
                        <Popconfirm
                          placement="topLeft"
                          title={<State datas={itemValueList[`${ele.equipmentType}_${item.itemName}`]} onChange={(val) => this.onChxChange(val, 'itemValue', i, idx)} />}
                          okText="确定"
                          cancelText="取消"
                        >
                          <label style={{'color': '#379FFF', cursor: 'pointer', fontSize: 14}} >{item.itemValue }</label>
                        </Popconfirm>
                      </div>
                      <div className={styles['field-block2']}>
                        <a style={{color: 'red', fontSize: 12}}onClick={() => this.reduceSearch(i, idx)}><Icon type="close" /></a>
                      </div>
                    </div>
              ))}
                </div>);
              })}
          </div>
        </div>
      );
    }
}
