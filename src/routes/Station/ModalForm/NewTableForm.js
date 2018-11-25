import React, {PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import { Table, Button, Input, message, Select, Popconfirm, InputNumber, Radio, Form,
  TimePicker, Checkbox, Card, Icon} from 'antd';
import styles from './style.less';
import CheckItemModal from './CheckItemModal';

const {Option} = Select;
const FormItem = Form.Item;
const PeriodFormat = 'HH:00';
const defaultParams = {
  eqUnitArr: [], // 实际显示的检查对象数据(该数组只包含名字) 一维数组
  checkData: [], // 实际显示的检查项数据 二维数组
  addArr: [], //  待添加的检查项列表(待添)         全部已删除的检查项；二维数组
  delCheck: [], // 删除的检查项；
  checkedList: [], // 被勾选的检查项
  addCheckList: [], // 被勾选的检查对象
  timeOpen: {}, // 时间框是否打开
  item: '', // modal所需参数
  index: '', // modal所需参数
};
const days = moment().daysInMonth(); // 当前月的天数；
const children = [];
// for (let i = 1; i <= Number(days); i += 1) {
//   children.push(<Option key={i} value={i}>{i}</Option>);
// }
for (let i = 1; i <= 31; i += 1) {
  children.push(<Option key={i} value={i}>{i}</Option>);
}

@connect(({station}) => ({
  checkObj: station.checkObj, // 待添加的检查对象 存于models
  planDetaileData: station.planDetaileData,
}))

@Form.create()
export default class NewTableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...defaultParams,
      createTime: {}, // 创建时间
      bearTime: {}, // 维护时间
      checkGid: {}, // 检查项gid
      visible: false, // 是否弹出框
      rangeData: [], // 选择范围
      isChangeTime: false,   //生效日期是否可选
    };
  }
  form=null;
  index = null;// 新增检查项所在的检查对象下标
  gid = 0; // 新增检查项自定义id
  targetId=[];// targetId
  checkValus={};// 被勾选的检查项(对象)，
  formParams={};// 检查对象表单参数
  gidArr={}; // 检查对象gid
  componentDidMount() {
    if (this.props.value[0] === 'edit') {
      console.log('此时在编辑');
      const {checkTargetsInfos, planInfo: {equipmentUnitId}} = this.props.planDetaileData;
      let checkObjArr = [];
      const checkObjArr2 = [];
      let checkObjInfo = {};
      const checkDataArr = [];// 编辑时展示的检查项列表
      const eqUnitArr = []; // 编辑时展示的检查对象列表
      let checkItemData = {};
      // 由于新增和编辑时数据结构不同，需要解析数据结构展示数据
      // 将编辑时服务返回的数据结构转换为新增时的数据结构过程
      for (let i = 0; i < checkTargetsInfos.length; i++) {
        const checkDataArr2 = [];
        if (checkTargetsInfos[i].checkTargetFormInfos) {
          for (let j = 0; j < checkTargetsInfos[i].checkTargetFormInfos.length; j++) {
            for (let k = 0; k < checkTargetsInfos[i].checkTargetFormInfos[j].feedbackForm.length; k++) {
              const value = checkTargetsInfos[i].checkTargetFormInfos[j].checkTargetFormInfo;
              checkItemData = checkTargetsInfos[i].checkTargetFormInfos[j].feedbackForm[k];
              // 从该层结构获取需要展示的字段信息
              const params = {
                checkItemGid: value.gid,
                anytime: value.anytime,
                units: value.unit,
                frequency: value.frequency,
                onlyOn: value.onlyOn && value.onlyOn !== '' ? value.onlyOn.split(',') : null,
                startTime: value.startPeriod ? moment(value.startPeriod, PeriodFormat) : null,
                endTime: value.endPeriod ? moment(value.endPeriod, PeriodFormat) : null,
              };
              // 将其放在下一层结构里面
              if (checkItemData) {
                checkItemData.items[0] = {...checkItemData.items[0], ...params};
              }
              checkDataArr2.push(checkItemData.items[0] || []);
            }
            checkObjArr.push(checkItemData);
            checkObjInfo.formFields = checkObjArr;
            checkObjInfo.checkTargetInfo = checkTargetsInfos[i].checkTargetInfo;
          }
          checkObjArr2.push(checkObjInfo);
          checkObjArr = [];
          checkObjInfo = {};
          checkDataArr.push(checkDataArr2);
        } else {
          checkDataArr.push([]);
        }
        eqUnitArr.push(checkTargetsInfos[i].checkTargetInfo.checkTargetName);
        this.targetId.push(checkTargetsInfos[i].checkTargetInfo.checkTargetId);
        this.gidArr[checkTargetsInfos[i].checkTargetInfo.checkTargetId] = checkTargetsInfos[i].checkTargetInfo.gid;
      }
      // 获取检查项gid,创建时间,维护时间
      const paramsCheckGid = {...this.state.checkGid};
      const paramsCreateTime = {...this.state.createTime};
      const paramsBearTime = {...this.state.bearTime};
      for (let i = 0; i < checkTargetsInfos.length; i++) {
        if (checkTargetsInfos[i].checkTargetFormInfos) {
          for (let j = 0; j < checkTargetsInfos[i].checkTargetFormInfos.length; j++) {
            const value = checkTargetsInfos[i].checkTargetFormInfos[j].checkTargetFormInfo;
            paramsCheckGid[`gid_${i}_${j}`] = value.gid;
            paramsBearTime[`bearTime_${i}_${j}`] = value.lastBearTime;
            paramsCreateTime[`createTime_${i}_${j}`] = value.createTime;
            this.setState({
              checkGid: paramsCheckGid,
              bearTime: paramsBearTime,
              createTime: paramsCreateTime,
            });
          }
        }
        // 编辑时 初始化检查对象信息化
        const cehckObj = checkTargetsInfos[i].checkTargetInfo;
        const {anytime, onlyOn, checkTargetName, cycleFrequency, startPeriod, endPeriod, cycleUnit} = cehckObj;
        this.formParams[`name_${i}`] = checkTargetName || '';
        this.formParams[`anytime_${i}`] = anytime || 0;
        this.formParams[`unit_${i}`] = cycleUnit || '';
        this.formParams[`frequency_${i}`] = cycleFrequency || '';
        this.formParams[`periodBegin_${i}`] = startPeriod ? moment(cehckObj.startPeriod, 'HH:mm') : moment('00', 'HH:mm');
        this.formParams[`periodEnd_${i}`] = endPeriod ? moment(cehckObj.endPeriod, 'HH:mm') : moment('23', 'HH:mm');
        this.formParams[`onlyOn_${i}`] = onlyOn && onlyOn !== '' ? onlyOn.split(',') : null;
      }
      // 获取设备单元下的全部检查对象，并解析该数据结构
      this.props.dispatch({
        type: 'station/queryRange',
        callback: (res) => {
          console.log(res, 'res');
          if (res.data === null) {
            return;
          }
          const data = res.data.station_oper_type;
          this.setState({
            rangeData: data,
          });
        },
      });
      this.props.dispatch({
        type: 'station/queryCheckObj',
        payload: {eqUnitId: equipmentUnitId},
        callback: (checkObj) => {
          if (checkObj && checkObj.length !== 0) {
            const result = [];
            for (let i = 0; i < checkObj.length; i++) {
              for (let j = 0; j < eqUnitArr.length; j++) {
                if (checkObj[i].checkTargetInfo.name === eqUnitArr[j]) {
                  result.push(checkObj[i]);
                }
              }
            }
            const result1 = _.xor(checkObj, result);
            // 检查项可以添加的项；
            const checkDataAll = [];
            for (let i = 0; i < result.length; i++) {
              const checkDataAll2 = [];
              if (result[i].formFields) {
                // for (var j = 0; j < result[i].formFields.length; j++) {
                checkDataAll2.push(result[i].formFields[0].items);
                // }
                checkDataAll.push(result[i].formFields[0].items);
              } else {
                checkDataAll.push([]);
              }
            }
            // 增加删除的元素；
            const addArr = [];
            // addArr.length = checkDataAll.length
            for (let i = 0; i < checkDataAll.length; i++) {
              const aliasArr1 = [];
              const aliasArr2 = [];
              if (checkDataAll[i]) {
                for (let j = 0; j < checkDataAll[i].length; j++) {
                  aliasArr1.push(checkDataAll[i][j].alias);
                }
              } else {
                aliasArr1.push([]);
              }
              if (checkDataArr[i]) {
                for (let k = 0; k < checkDataArr[i].length; k++) {
                  aliasArr2.push(checkDataArr[i][k].alias);
                }
              } else {
                aliasArr2.push([]);
              }

              const aliasArr = _.xor(aliasArr1, aliasArr2);
              const cehckDataAlias = checkDataAll[i].filter((item) => {
                return aliasArr.includes(item.alias);
              });
              addArr.push(cehckDataAlias);
            }
            this.onChangeCheckObj(result1);
            // 初始化编辑时各项值
            this.setState({
              checkData: checkDataArr, // 正展示的检查项列表
              eqUnitArr, // 检查对象名字列表
              delCheck: result, // 删除的检查项
              addArr, // 显示待添加检查项列表
            });
          }
        },
      });
    }
  }
  componentWillUnmount() {
    this.onChangeCheckObj([]);
    this.onChangeEqUnit([]);
    this.resetTables();
    this.setState({checkData: []});
  }
  // 改变设备单元
  onChangeEqUnit = (eqUnit = []) => {
    console.log('清理设备单元');
    this.props.dispatch({
      type: 'station/changeEqData',
      payload: eqUnit,
    });
    this.setState({checkData: []});
  }
  // 改变检查对象
  onChangeCheckObj = (checkObj = []) => {
    console.log('清理检查对象');
    this.props.dispatch({
      type: 'station/checkObj',
      payload: checkObj,
    });
    this.setState({checkData: []});
  }
  // 清空整个检查项数组(table)
  resetTables = () => {
    this.setState(defaultParams);
    this.setState({checkData: []});
  }
  // 确认 添加检查对象时 把勾选的过滤掉
  onCheckObjChange = () => {
    const {checkObj} = this.props;
    const {addCheckList} = this.state;
    checkObj.filter((item) => {
      return addCheckList.includes(item.checkTargetInfo.name);
    });
  }

  // 当检查项数组(table)的某列发生变化时
  handleTableChange = (val, gid, column, idx) => {
    console.log(val, '哈哈');
    const columns = ['onlyOn', 'startTime', 'endTime'];
    const columns2 = ['units', 'frequency', 'onlyOn', 'startTime', 'endTime'];
    const newCheckData = [...this.state.checkData];
    console.log(newCheckData, '哈sd哈');
    const target = newCheckData[idx].filter(item => gid === item.gid)[0];
    if (target) {
      if (column === 'units') {
        if (!target.frequency) {
          target.frequency = 1;
        }
        if (val === '小时') {
          target.startTime = moment('00:00', PeriodFormat);
          target.endTime = moment('23:00', PeriodFormat);
        } else {
          this.resetTable(gid, columns, idx);
        }
      }
      if (column === 'anytime' || val === undefined) {
        const tableAnytime = [...this.state.checkData];
        this.resetTable(gid, columns2, idx);
        let isChangeTime = false
        if(val === 1){
          tableAnytime.some((item, index) => {
            if(!_.some(item, ['anytime', 0])){
              isChangeTime = true
            }else{
              isChangeTime = false
              return;
            }
          })
        }else{
          isChangeTime = false
        }
        this.props.isChangeTime(isChangeTime)
      }
      target[column] = val;
      this.props.onChangeSubStatus();
      this.setState({checkData: newCheckData});
    }
  }
  // 清空检查项数组(table)的某一列
  resetTable = (gid, columns, idx) => {
    const newCheckData = [...this.state.checkData];
    const target = newCheckData[idx].filter(item => gid === item.gid)[0];
    if (target) {
      columns.forEach(item => {
        if (item === 'anytime') {
          target[item] = 0;
        } else if (item === 'required') {
          target[item] = 1;
        } else if (item === 'onlyOn') {
          target[item] = [];
        } else {
          target[item] = null;
        }
      });
    }
    this.setState({ checkData: newCheckData });
  }
  // 重置整个table
  resetFullTable = (idx, value) => {
    const newCheckData = [...this.state.checkData];
    newCheckData[idx].forEach(item => {
      const {anytime, units} = item;
      if (!units) {
        item.anytime = value;
      } else {
        item.anytime = value;
        item.startTime = null;
        item.endTime = null;
        item.units = null;
        item.frequency = null;
        item.onlyOn = [];
      }
    });
    this.setState({checkData: newCheckData});
  }
  handleChangeRadio = (e, idx) => {
    const value = e.target.value;
    const formAnytime = this.props.form.getFieldsValue();
    const tableAnytime = [...this.state.checkData];
    let isChangeTime = false;
    this.resetFullTable(idx, value);
    if(value === 1){
      tableAnytime.some((item ,index) => {
        if(index !== idx &&  !_.some(item, ['anytime', 0]) ) {
          isChangeTime = true;
        }else if(index !== idx && _.some(item, ['anytime', 0]) ){
          isChangeTime = false;
          return;
        }
      })
    }else{
      isChangeTime = false;
    }
    this.props.isChangeTime(isChangeTime)
  }
  // 添加一列
  handleColumnChange = (values) => {
    const newCheckData = [...this.state.checkData];
    if (newCheckData && this.index !== null && newCheckData.length !== 0 && newCheckData[this.index].length !== 0) {
      const length = newCheckData[this.index].length;
      const params = {
        gid: `NEW_ITEM${this.gid++}`,
        accuracy: '0',
        checkItemGid: null,
        edit: 1,
        startTime: moment('00:00', PeriodFormat),
        endTime: moment('23:00', PeriodFormat),
        findex: length + 1,
        anytime: 0,
        unit: '',
        visible: 1,
        units: null,
        frequency: null,
        hide: '',
        info: '',
        name: values.alias || '',
        value: '',
        defaultvalue: '',
        onlyOn: [],
        ...values,
      };
      newCheckData[this.index].push(params);
      this.setState({ checkData: newCheckData });
    }
  }
  // 数组排序
  sortArr = (Arr) => {
    Arr.forEach((item, index) => {
      Object.assign(item, {findex: index + 1});
    });
  }
  // 数组取差集
  getArryMinux = (arr1 = [], arr2 = []) => {
    const result = [];
    const obj = {};
    if (arr2 === []) {
      return arr1.toString();
    } else {
      arr2.forEach(item => {
        obj[item] = 1;
      });
      arr1.forEach(item => {
        if (!obj[item]) {
          obj[item] = 1;
          result.push(item);
        }
      });
      return result.toString();
    }
  }
  // 检查周期发生改变时
  handleCheckObjChange = (value, idx) => {
    const {form } = this.props;
    if (!form.getFieldValue(`frequency_${idx}`)) {
      this.formParams[`frequency_${idx}`] = 1;
    }
    if (value === '小时') {
      this.formParams[`periodBegin_${idx}`] = moment('00:00', PeriodFormat);
      this.formParams[`periodEnd_${idx}`] = moment('23:00', PeriodFormat);
    }
    const newCheckData = [...this.state.checkData];
    newCheckData[idx].forEach(item => {
      this.handleTableChange(value, item.gid, 'units', idx);
    });
  }
  // 重置检查对象内容  注意:编辑时 之前的数据未重置
  resetCheckObj = (columns, idx) => {
    columns.forEach(item => {
      if (item === 'anytime') {
        this.formParams[`${item}_${idx}`] = 0;
      } else {
        this.formParams[`${item}_${idx}`] = null;
      }
    });
  }
  // 提交表单
  cardHandleSubmit = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values, '表单项的值');
        const { eqUnitArr, delCheck, checkGid, createTime, bearTime, checkData} = this.state;
        const eqUnitKey = [];
        for (let i = 0; i < eqUnitArr.length; i++) {
          for (let j = 0; j < delCheck.length; j++) {
            if (eqUnitArr[i] === delCheck[j].checkTargetInfo.name) {
              eqUnitKey.push(delCheck[j].checkTargetInfo.gid);
            }
          }
        }
        const checkItemId = [];
        const planCheckTargetId = [];
        const params = [];
        let flag = true;
        checkData.map((item, index) => {
          // const {name, anytime, unit, frequency, periodBegin, personalbariodEnd, onlyOn} = values;
          if (flag) {
            const name = values[`name_${index}`];
            const isAnytime = values[`anytime_${index}`];
            const unit = values[`unit_${index}`];
            const frequency2 = values[`frequency_${index}`];
            const periodBegin = values[`periodBegin_${index}`];
            const periodEnd = values[`periodEnd_${index}`];
            const onlyOn2 = values[`onlyOn_${index}`];
            // const items = [...this.state.checkData];
            const newItems = [];
            item.map((item1, index1) => {
              if (flag) {
                let {units, frequency, onlyOn, anytime, startTime, endTime, editable } = item1;
                if (editable && editable === true) {
                  message.warn('请先保存检查项名称信息');
                  flag = false;
                  return;
                }
                // 在不随机的情况下,如果检查项和检查对象的周期填写不完整，给予提示
                // 后期考虑给予红色框提示
                // 随机情况下，检查项不存在周期，则检查项随机
                if (isAnytime === 1 && !frequency && !units) {
                  const columns = ['units', 'frequency', 'onlyOn', 'startTime', 'endTime'];
                  this.resetTable(item1.gid, columns, index);
                  this.handleTableChange(1, item1.gid, 'anytime', index);
                  anytime = isAnytime;
                } else if (anytime === 0 && !(frequency && units) && !(unit && frequency2)) {
                  message.warn('请将周期信息填写完整');
                  flag = false;
                  return;
                }
                // 在不随机的情况下 如果检查对象存在周期，检查项不存在周期 则检查项继承检查对象周期信息
                if (anytime !== 1 && !frequency && !units && unit && frequency2) {
                  this.handleTableChange(unit, item1.gid, 'units', index);
                  this.handleTableChange(frequency2, item1.gid, 'frequency', index);
                  units = unit;
                  frequency = frequency2;
                  // 周期为小时
                  if (unit === '小时') {
                    startTime = periodBegin;
                    endTime = periodEnd;
                    this.handleTableChange(startTime, item1.gid, 'startTime', index);
                    this.handleTableChange(endTime, item1.gid, 'endTime', index);
                  }
                  // 周期为日
                  if (unit === '日') {
                    this.handleTableChange(onlyOn2, item1.gid, 'onlyOn', index);
                    onlyOn = onlyOn2;
                  }
                }
                // 检查项gid，后台以此判断是修改还是新增
                const checkGidInfo = Object.keys(checkGid).includes(`gid_${index}_${index1}`) ? checkGid[`gid_${index}_${index1}`] : null;
                const lastBearTime = Object.keys(bearTime).includes(`bearTime_${index}_${index1}`) ? bearTime[`bearTime_${index}_${index1}`] : null;
                const createTimes = Object.keys(createTime).includes(`createTime_${index}_${index1}`) ? createTime[`createTime_${index}_${index1}`] : null;
                const dataSource = { ...item1 };
                console.log(dataSource, 'huhuhu');
                const columns = ['units', 'frequency', 'anytime', 'onlyOn', 'startTime', 'endTime'];
                for (const key of Object.keys(dataSource)) {
                  if (columns.includes(key)) {
                    delete dataSource[key];
                  }
                  if (key === 'gid' && dataSource[key].startsWith('NEW_ITEM')) {
                    delete dataSource[key];
                  }
                }
                console.log(dataSource, 'dataSource');
                checkItemId.push(dataSource.checkItemGid);
                newItems.push({
                  checkItemId: checkGidInfo,
                  lastBearTime,
                  createTime: createTimes,
                  title: item1.alias,
                  unit: units,
                  frequency,
                  onlyOn: onlyOn && onlyOn !== '' && onlyOn.length !== 0 ? onlyOn.toString() : null,
                  startPeriod: startTime ? startTime.format(PeriodFormat) : null,
                  endPeriod: endTime ? endTime.format(PeriodFormat) : null,
                  anytime,
                  cycleName: frequency && units ? `每${frequency}${units}1次` : null,
                  fields: [
                    {
                      ...dataSource,
                    },
                  ],
                });
              }
            });
            planCheckTargetId.push(this.gidArr[this.targetId[index]]);
            params.push({
              planCheckTargetId: this.gidArr[this.targetId[index]] || null, // 检查对象id 后台以此判断是否修改
              name: eqUnitArr[index],
              anytime: isAnytime,
              checkTargetId: eqUnitKey[index],
              unit: unit && unit !== '' ? unit : null,
              frequency: frequency2 || null,
              cycleName: frequency2 && unit ? `每${frequency2}${unit}1次` : null,
              onlyOn: onlyOn2 && onlyOn2 !== '' && onlyOn2.length !== 0 ? onlyOn2.toString() : null,
              startPeriod: periodBegin ? periodBegin.format(PeriodFormat) : null,
              endPeriod: periodEnd ? periodEnd.format(PeriodFormat) : null,
              params: [
                ...newItems,
              ],
            });
          }
        });
        if (flag) {
          const delCheckTargetIds = this.getArryMinux(Object.values(this.gidArr), planCheckTargetId);
          const delCheckItemIds = this.getArryMinux(Object.values(checkGid), checkItemId);
          console.log(checkGid, '提交过去的参数', checkItemId, delCheckItemIds);
          console.log(Object.values(this.gidArr), '提交过去das 的参数', this.getArryMinux(Object.values(this.gidArr), planCheckTargetId));
          this.props.extraHandle({params, delCheckItemIds, delCheckTargetIds});
        }
      }
    });
  };

  // 添加检查对象；
  checkTitleHandler = (value) => {
    this.setState({
      addCheckList: value,
    });
  };
  // 勾选检查项时；
  checkPlanHandler = (value, idx) => {
    this.checkValus[idx] = value;
    this.setState({checkedList: value});
  };
  // 确认添加检查项
  confirmHandler = (idx) => {
    const { checkData, addArr, checkedList } = this.state;
    // 如果无勾选则不进行任何操作
    if (!this.checkValus[idx]) {
      return;
    }
    // 剩下的可以勾选的检查项
    const resultData = addArr[idx].filter(item => {
      return !this.checkValus[idx].includes(item.alias);
    });
    // 被移除的检查项
    const addData = addArr[idx].filter(item => {
      return this.checkValus[idx].includes(item.alias);
    });
    // 添加时如果不存在该字段则补上
    addData.forEach(item => {
      const {anytime, units} = item;
      if (!anytime && !units) {
        item.anytime = 0;
        item.startTime = null;
        item.endTime = null;
        item.units = null;
        item.frequency = null;
        item.onlyOn = [];
      }
    });
    addArr[idx] = resultData;
    checkData[idx] = [...checkData[idx], ...addData];
    this.sortArr(checkData[idx]);
    // 注意：这里需重置已勾选数据
    this.checkValus = {};
    this.setState({
      checkData,
      addArr,
      checkedList: [],
    });
  };
  // 删除检查项
  remove2 = (idx, record, index) => {
    // 原数据:checkData
    // 移动数据:record
    // 目标数据:addArr
    const checkData = [...this.state.checkData];
    const { addArr} = this.state;
    console.log(checkData, '哈哈哈哈哈', record);
    checkData[idx] = checkData[idx].filter(item => {
      return record.gid !== item.gid;
    });
    this.sortArr(checkData[idx]);
    const moveInfo = [];
    moveInfo.push(record);
    addArr[idx] = [...addArr[idx] || [], ...moveInfo];
    const columns = ['anytime', 'units', 'frequency', 'onlyOn', 'required', 'startTime', 'endTime'];
    this.resetTable(record.gid, columns, idx);
    this.setState({
      checkData,
      addArr,
    });
  }
  // 取消添加检查项
  onCancel = () => {
    this.setState({
      checkedList: [],
    });
  };
  // 取消添加检查对像
  onCancelO= () => {
    this.setState({
      addCheckList: [],
    });
  };
  // 添加检查对象
  addCheckList =() => {
    // 添加成功后： 检查项checkData改变(包括加字段信息) delCheck改变,checkObj变化,eqUnitArr变化
    // eqUnitArr ：展示可勾选检查对象
    const {addCheckList, eqUnitArr, delCheck } = this.state;
    if (addCheckList && addCheckList.length === 0) {
      return;
    }
    const newCheckData = [...this.state.checkData];
    const {checkObj, fixedCheckObj} = this.props;
    // 注意：这里过滤都是以名字作为过滤条件
    // 被选中的检查对象
    const isCheckData = checkObj.filter((item) => {
      return addCheckList.includes(item.checkTargetInfo.name);
    });
    // 剩下的的检查对象
    const resultCheckData = checkObj.filter((item) => {
      return !addCheckList.includes(item.checkTargetInfo.name);
    });
    // 检查对象名字数组 与检查对象同步
    const checkObjNames = [];
    isCheckData.forEach(item => {
      checkObjNames.push(item.checkTargetInfo.name);
    });
    const result2 = _.xor(fixedCheckObj, delCheck);

    // 检查项；
    const checkData = isCheckData ? isCheckData.map((item) => {
      return item.formFields && item.formFields.length > 0 ? item.formFields.map((item1) => {
        return item1.items && item1.items.length > 0 ? item1.items : [];
      }) : [];
    }) : [];
    const result = [];
    for (let i = 0; i < checkData.length; i += 1) {
      if (checkData[i].length > 0) {
        for (let j = 0; j < checkData[i].length; j += 1) {
          const resultData = checkData[i][j].filter(item => item.type !== 'TITLE_DIVIDER');
          result.push(resultData);
        }
      } else {
        result.push([]);
      }
    }

    // let tempCheckData3 = [];
    // result.forEach((item) => {
    //   if (item.length > 0) {
    //     tempCheckData3 = item.filter((item2) => {
    //       return item2.type !== 'TITLE_DIVIDER';
    //     });
    //     tempCheckData.push(tempCheckData3);
    //   }
    // });
    // let anytime = {...this.state.anytime};
    // 初始化 是否随机的值
    result.forEach((item, index) => {
      item.forEach((item2, index2) => {
        const {anytime, units } = item2;
        if (!anytime && !units) {
          item2.anytime = 0;
          item2.startTime = null;
          item2.endTime = null;
          item2.units = null;
          item2.frequency = null;
          item2.onlyOn = [];
          item2.findex = index2 + 1;
          item2.editable = false;// 是否可以编辑
        }
      });
    });
    const tempCheckData = [...newCheckData, ...result];
    this.onChangeCheckObj(resultCheckData);
    this.setState({
      checkData: tempCheckData,
      delCheck: [...delCheck, ...isCheckData],
      eqUnitArr: [...eqUnitArr, ...checkObjNames],
      addCheckList: [],
    });
  }
  // 删除检查对象
  delCheckList = (alias, idx) => {
    const {checkObj} = this.props;
    const checkData = [...this.state.checkData];
    const delCheck = [...this.state.delCheck]; // 所有被删除的检查对象
    const addArr = [...this.state.addArr];// 删除待添加检查项
    addArr.splice(idx, 1);
    // 此次被删除的检查对象
    const addItem = delCheck.filter(item => {
      return item.checkTargetInfo.name === alias;
    });
    // 被删除的同时需要清空填写的检查项数据
    if (addItem && addItem.length !== 0 && Array.isArray(addItem[0].formFields) && addItem[0].formFields.length !== 0) {
      if (addItem[0].formFields[0].items) {
        addItem[0].formFields[0].items.forEach(item => {
          item.anytime = 0;
          item.startTime = null;
          item.endTime = null;
          item.units = null;
          item.frequency = null;
          item.onlyOn = [];
          item.required = 1;
          item.editable = false;
        });
      }
    }
    // 剩下的检查对象
    const resultItem = delCheck.filter(item => {
      return item.checkTargetInfo.name !== alias;
    });
    const deleqUnit = this.state.eqUnitArr.filter((item1) => {
      return item1 !== alias;
    });
    // 提示框增加检查对象
    checkData.splice(idx, 1);
    this.onChangeCheckObj([...checkObj, ...addItem]);
    this.setState({
      checkData,
      eqUnitArr: deleqUnit,
      delCheck: resultItem,
      addArr,
    });
  }
  // 频率项失去焦点时
  handleFrequencyChange = (val, gid, column, idx) => {
    if (val === 0 || val === '' || isNaN(val)) {
      this.handleTableChange(1, gid, column, idx);
    }
  };
  handleOpenChange = (open, alias) => {
    const timeOpen = {...this.state.timeOpen};
    timeOpen[alias] = open;
    this.setState({timeOpen});
  };

  handleChangeDate = (val) => {
    console.log(val, '选定日');
  }
  headerBox = (item, index) => {
    const {cycleUnit, form, checkObj} = this.props;
    const {getFieldDecorator, getFieldsValue} = this.props.form;
    return (
      <Form
        name={`form_${index}`}
        layout="inline"
        onSubmit={this.cardHandleSubmit}
      >
        <FormItem>
          {getFieldDecorator(`name_${index}`, {
              })(
                <span>{item}</span>
              )}
        </FormItem>
        <FormItem
          label="临时"
        >
          {getFieldDecorator(`anytime_${index}`, {
                initialValue: this.formParams[`anytime_${index}`] || 0,
              })(
                <Radio.Group onChange={(e) => { this.handleChangeRadio(e, index); }}>
                  <Radio value={0}>否</Radio>
                  <Radio value={1}>是</Radio>
                </Radio.Group>
              )}
        </FormItem>
        {
              form.getFieldValue(`anytime_${index}`) === 0 ?
                <FormItem>
                  <FormItem
                    label="检查周期"
                  >
                    {getFieldDecorator(`unit_${index}`, {
                rules: [
                  {required: false, message: '周期'},
                ],
                initialValue: this.formParams[`unit_${index}`] || null,
                })(
                  <Select
                    onSelect={val => this.handleCheckObjChange(val, index)}
                    style={{width: 80}}
                  >
                    {
                    cycleUnit.map(it =>
                      <Option key={it.gid} value={it.name}>{it.name}</Option>
                    )
                    }
                  </Select>
                )}
                  </FormItem>
                  <FormItem
                    label="频率"
                  >
                    {getFieldDecorator(`frequency_${index}`, {
                rules: [
                  {required: false, message: '频率'},
                ],
                initialValue: this.formParams[`frequency_${index}`] || '',
              })(
                <InputNumber style={{width: 60}} min={1} />
              )}
                  </FormItem>
                  {
              form.getFieldValue(`unit_${index}`) === '小时' ?
                <FormItem
                  label="执行范围"
                >
                  <FormItem >
                    {getFieldDecorator(`periodBegin_${index}`, {
                    rules: [
                      {required: true, message: '开始时间'},
                    ],
                    initialValue: this.formParams[`periodBegin_${index}`] || null,
                  })(
                    <TimePicker
                      format={PeriodFormat}
                      style={{width: 100}}
                      hideDisabledOptions
                      open={this.state.timeOpen[`start_${index}`]}
                      onOpenChange={(open) => {
                      this.handleOpenChange(open, `start_${index}`);
                    }}
                      onChange={() => {
                      this.handleOpenChange(false, `start_${index}`);
                    }}
                      disabledHours={() => {
                       const end = form.getFieldValue(`periodEnd_${index}`);
                       return _.range(end ? end.hour() : 24, 24);
                     }}
                    />
                  )}
                  </FormItem>
                  <span style={{block: 'inline', textAlign: 'right', marginRight: 10}}> ─ </span>
                  <FormItem >
                    {getFieldDecorator(`periodEnd_${index}`, {
                    rules: [
                      {required: true, message: '结束时间'},
                    ],
                    initialValue: this.formParams[`periodEnd_${index}`] || null,
                  })(
                    <TimePicker
                      style={{width: 100}}
                      hideDisabledOptions
                      // disabledHours={()=>{
                      //   let begin = form.getFieldValue(`periodBegin_${index}`);
                      //   return _.range(0,begin?begin.hour():0);
                      // }}
                      open={this.state.timeOpen[`end_${index}`]}
                      onOpenChange={(open) => {
                        this.handleOpenChange(open, `end_${index}`);
                      }}
                      onChange={(_, endTime) => {
                        this.handleOpenChange(false, `end_${index}`);
                      }}
                      format={PeriodFormat}
                    />
                  )}
                  </FormItem>
                </FormItem> : null
              }
                  {
                 form.getFieldValue(`unit_${index}`) === '日' ?
                   <FormItem
                     label="选定日"
                   >
                     {getFieldDecorator(`onlyOn_${index}`, {
                    initialValue: this.formParams[`onlyOn_${index}`] || [],
                  })(
                    // <Input placeholder="请输入日期,用逗号隔开" />
                    <Select
                      mode="multiple"
                      placeholder="请选择日"
                      style={{width: 220}}
                      onChange={this.handleChangeDate}
                    >
                      {children}
                    </Select>
                  )}
                   </FormItem> : null
              }
                </FormItem> : null
            }
      </Form>
    );
  };
  // 添加检查项
  addPlanList = (idx) => {
    const {addArr} = this.state;
    return (
      <div>
        <span>请选择您要添加的检查项</span>
        <Checkbox.Group onChange={(val) => this.checkPlanHandler(val, idx)} value={this.state.checkedList}>
          {
                addArr[idx] && addArr[idx].map((item, index) =>
                  (<div key={item.gid}>
                    <Checkbox
                      key={item.gid}
                      value={item.alias}
                    >{item.alias}</Checkbox>
                  </div>)
                )
              }
        </Checkbox.Group>
      </div>
    );
  };
  renderColumns = (text, record, column, idx) => {
    return (
      <div className={styles['editable-cell']}>
        {
          record.editable ?
            <div className={styles['editable-cell-input-wrapper']}>
              <Input
                value={text}
                onChange={(e) => {
                this.handleTableChange(e.target.value, record.gid, 'alias', idx);
                this.handleTableChange(e.target.value, record.gid, 'name', idx);
                }}
                onPressEnter={() => { this.edit(record.gid, idx); }}
              />
              <Icon
                type="check"
                className={styles['editable-cell-icon-check']}
                onClick={() => { this.check(text, record, column, idx); }}
              />
            </div>
            :
            <div className={styles['editable-cell-text-wrapper']}>
              {text || ' '}
              <Icon
                type="edit"
                className={styles['editable-cell-icon']}
                onClick={() => { this.edit(record.gid, idx); }}
              />
            </div>
        }
      </div>
    );
  }
  // 检查并保存
  check = (text, record, column, idx) => {
    let flag = true;
    if (!text || text === '') {
      message.warn('检查项名称不能为空');
      flag = false;
    }
    const newCheckData = [...this.state.checkData];
    const newAddArr = [...this.state.addArr];
    // 数组过滤 名字相同且 不是自己本身的检查项，与实际显示的对比
    const target = newCheckData[idx].filter(item => text === item.alias && record.gid !== item.gid);
    // 与待添加的的对比
    const target2 = newAddArr[idx].filter(item => text === item.alias && record.gid !== item.gid);
    if ((target && target.length >= 1) || (target2 && target2.length >= 1)) {
      message.warn('检查项名称已存在');
      flag = false;
    }
    if (flag) {
      this.handleTableChange(false, record.gid, 'editable', idx);
    }
  }
  // 验证名称是否重复
  handleCheckAlias = (rule, value, callback) => {
    const newCheckData = [...this.state.checkData];
    const newAddArr = [...this.state.addArr];
    if (this.index !== null) {
      const target = newCheckData[this.index].filter(item => value === item.alias);
      const target2 = newAddArr[this.index].filter(item => value === item.alias);
      if ((target && target.length >= 1) || (target2 && target2.length >= 1)) {
        callback('已存在该检查项,请重新输入!');
      }
    }
    callback();
  }
  // 编辑
  edit = (gid, idx) => {
    this.handleTableChange(true, gid, 'editable', idx);
  }
  columns = (idx) => {
    const {cycleUnit, checkObj} = this.props;
    const {frequencyData, checkData} = this.state;
    return ([
      {
        title: '序号',
        dataIndex: 'findex',
        key: 'findex',
        width: '5%',
      }, {
        title: '检查项',
        dataIndex: 'alias',
        key: 'alias',
        width: '10%',
        render: (text, record) => {
          if (this.props.value[0] === 'edit') {
            return this.renderColumns(text, record, 'alias', idx);
          } else {
            return (<span>{text}</span>);
          }
        },
      }, {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: '5%',
      }, {
        title: '填写内容',
        dataIndex: 'defaultvalue',
        key: 'defaultvalue',
        width: '10%',
      }, {
        title: '是否必填',
        dataIndex: 'required',
        key: 'required',
        width: '8%',
        render: (text, record, index) => {
          return (<div>
            <Checkbox
              checked={text === 1}
              onChange={(e) => {
                  const value = e.target.checked ? 1 : 0;
                  this.handleTableChange(value, record.gid, 'required', idx);
                }}
            />
          </div>);
        },
      }, {
        title: '是否临时',
        dataIndex: 'anytime',
        key: 'anytime',
        width: '10%',
        render: (text, record, index) => {
          return (<Radio.Group
            value={text === 1}
            onChange={(e) => {
                      const value = e.target.value ? 1 : 0;
                      this.handleTableChange(value, record.gid, 'anytime', idx);
                    }}
          >
            <Radio defaultChecked value={false}>否</Radio>
            <Radio value>是</Radio>
          </Radio.Group>);
        },
      }, {
        title: '周期',
        dataIndex: 'units',
        key: 'units',
        width: '10%',
        render: (text, record, index) => {
          return record.anytime === 0 ?
            <Select
              allowClear
              style={{width: 80}}
              value={text}
              onChange={(value) => {
                      this.handleTableChange(value, record.gid, 'units', idx);
                    }}
            >
              {
                      cycleUnit.map(it =>
                        <Option key={it.gid} value={it.name}>{it.name}</Option>
                      )
                    }
            </Select> : null;
        },
      }, {
        title: '频率',
        dataIndex: 'frequency',
        key: 'frequency',
        width: '8%',
        render: (text, record, index) => {
          return record.anytime === 0 ?
            <InputNumber
              min={1}
              value={text}
              style={{width: 60 }}
              onChange={(value) => {
                      this.handleTableChange(value, record.gid, 'frequency', idx);
                    }}
              onBlur={(e) => { this.handleFrequencyChange(e.target.value, record.gid, 'frequency', idx); }}
            /> : null;
        },
      }, {
        title: '选择日',
        dataIndex: 'onlyOn',
        key: 'onlyOn',
        width: '12%',
        render: (text, record, index) => {
          return record.units === '日' && record.anytime === 0 ?
            // <Input
            //   value={text || ''}
            //   onChange={(e) => {
            //         this.handleTableChange(e.target.value, record.gid, 'onlyOn', idx);
            //       }}
            // />
            <Select
              mode="multiple"
              placeholder="请选择日"
              style={{width: 220}}
              value={record.onlyOn && record.onlyOn !== '' ? record.onlyOn : []}
              onChange={(val) => {
              this.handleTableChange(val, record.gid, 'onlyOn', idx);
            }}
            >
              {children}
            </Select> : null;
        },
      }, {
        title: '执行范围',
        dataIndex: 'time',
        key: 'time',
        width: '15%',
        render: (text, record, index) => {
          return record.units === '小时' && record.anytime === 0 ?
            <div>
              <TimePicker
                style={{width: 80 }}
                format={PeriodFormat}
                hideDisabledOptions
                disabledHours={() => {
                 const end = record.endTime;
                 return _.range(end ? end.hour() : 24, 24);
               }}
                open={this.state.timeOpen[`start_${idx}_${index}`]}
                onOpenChange={(open) => {
                 this.handleOpenChange(open, `start_${idx}_${index}`);
               }}
                value={record.startTime ? moment(record.startTime, PeriodFormat) : moment('00:00', PeriodFormat)}
                onChange={(value) => {
                 this.handleTableChange(value, record.gid, 'startTime', idx, 'start');
                 this.handleOpenChange(false, `start_${idx}_${index}`);
               }}
              />
              {'-'}
              <TimePicker
                style={{width: 80 }}
                format={PeriodFormat}
                hideDisabledOptions
              // disabledHours={()=>{
              //    let begin = record.startTime
              //    return _.range(0,begin?begin.hour():0);
              // }}
                open={this.state.timeOpen[`end_${idx}_${index}`]}
                onOpenChange={(open) => {
                this.handleOpenChange(open, `end_${idx}_${index}`);
              }}
                value={record.endTime ? moment(record.endTime, PeriodFormat) : moment('23:00', PeriodFormat)}
                onChange={(value) => {
                 this.handleTableChange(value, record.gid, 'endTime', idx);
                 this.handleOpenChange(false, `end_${idx}_${index}`);
               }}
              />
            </div> : null;
        },
      }, {
        title: '操作',
        key: 'action',
        width: '7%',
        render: (text, record, index) => {
          return (
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove2(idx, record, index)}>
              <a>删除</a>
            </Popconfirm>
          );
        },
      },
    ]
    );
  };
  // 数字验证；
  checkNumber = (theObj) => {
    const reg = /^\d+([,，]\d+)*$/;
    if (reg.test(theObj)) {
      return true;
    }
    return false;
  };
  showModal = (item, index) => {
    this.setState({visible: true});
    this.index = index;
  }
  onCancel = () => {
    const {form} = this.form.props;
    form.resetFields();
    this.setState({visible: false});
  }
  onOk = (e) => {
    const {form} = this.form.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      this.handleColumnChange(values);
    });
    form.resetFields();
    this.setState({visible: false});
  }
  render() {
    const {checkObj} = this.props;
    const { eqUnitArr, checkData} = this.state;

    const newList = (
      <div>
        <span>请选择检查对象</span>
        <Checkbox.Group onChange={this.checkTitleHandler} value={this.state.addCheckList}>
          {
          checkObj && checkObj.map(item =>
            (<div key={item.checkTargetInfo.gid}>
              <Checkbox
                key={item.checkTargetInfo.gid}
                value={item.checkTargetInfo.name}
              >{item.checkTargetInfo.name}</Checkbox>
            </div>)
          )
        }
        </Checkbox.Group>
      </div>
    );
    return (
      <div>
        <div style={{marginBottom: 15}}>
          <Popconfirm
            placement="top"
            title={newList}
            onCancel={this.onCancelO}
            onConfirm={() => { this.addCheckList(); }}
          >
            <Button
              style={{marginLeft: 20, marginRight: 20}}
              type="primary"
              icon="plus"
            >
              添加检查对象
            </Button>
          </Popconfirm>
          <Button type="primary" onClick={this.cardHandleSubmit}>保存</Button>
          <Button type="primary" style={{marginLeft: 20}} onClick={this.props.handleSubmit} loading={this.props.submitting}>提交</Button>
        </div>
        {eqUnitArr.length === 0 ? <hr /> : ''}
        {
          eqUnitArr.map((item, index) => {
            return (<div>
              <Card
                title={this.headerBox(item, index)}
                stylt={{minHeight: 50, marginTop: 16}}
                extra={
                  <Popconfirm
                    title="是否要删除此检查对象？"
                    onConfirm={() => this.delCheckList(item, index)}
                  >
                    <Button>删除</Button>
                  </Popconfirm>
                    }
              >
                <Popconfirm
                  placement="top"
                  title={this.addPlanList(index)}
                  onConfirm={() => { this.confirmHandler(index); }}
                  onCancel={this.onCancel}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button className="editable-add-btn" style={{marginBottom: 6}} >新增</Button>
                </Popconfirm>
                {this.props.value[0] === 'edit' ? <Button className="editable-add-btn" onClick={() => { this.showModal(item, index); }} style={{marginBottom: 6, marginLeft: 6}} >新增检查项</Button> : null}
                <Table
                  columns={this.columns(index)}
                  dataSource={checkData[index] && checkData[index].length > 0 ? checkData[index] : []}
                  rowKey={records => `${records.gid}`}
                  pagination={false}
                  scroll={{x: true}}
                />
              </Card>
              <div style={{height: 16, width: '100%'}} />
            </div>);
          })
        }
        <CheckItemModal
          wrappedComponentRef={form => { this.form = form; }}
          visible={this.state.visible}
          onOk={this.onOk}
          onCancel={this.onCancel}
          rangeData={this.state.rangeData}
          handleCheckAlias={this.handleCheckAlias}
        />
      </div>
    );
  }
}
