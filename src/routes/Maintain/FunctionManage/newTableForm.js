import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Table, Button, Input, message, Select, Popconfirm, Divider, InputNumber, Radio} from 'antd';
import styles from './index.less';
import parseValues from '../../../utils/utils';

const {Option} = Select;
const RadioGroup = Radio.Group;
const TYPES = {
  TITLE_DIVIDER: '标题',
  DIVIDERTHICK: '分隔',
  TXT: '短文本',
  TXTEXT: '长文本',
  DATE: '日期',
  DATETIME: '时间戳',
  NUM: '数字',
  TXTSEL:'选择',
};

const UNIT = ['NM³', 'Mpa', '℃', 'M³', 'NM³/h', 'mmg/Nm3', 'mm', 'Kpa', '吨'];
@connect(({maintain, login}) => ({
  user: login.user,
  funcGroup: maintain.funcGroup,
}))
export default class TableForm extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.isShowCycleWar = true;
    this.isShowContent = false;
    this.isShowInp = false;
    this.isShowNumInp = false;
    this.isShowPrecision = false;
    this.isShowUnitInp = false;
    this.idx = 0;
    this.state = {
      data: [],
    };
  }


  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value !== undefined) {
      this.setState({
        data: nextProps.value,
      }, () => {
        this.state.data && this.state.data.map((item) => {
          if (item.type && item.type === 'TXTSEL') {
            return this.isShowContent = true;
          }
          if (item.type && item.type === 'NUM') {
            return this.isShowPrecision = true;
          }
        })
      });
      this.edit = false;
    }
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.key === key)[0];
  }

  index = 0;
  cacheOriginData = {};

  toggleEditable(e, key) {
    e.preventDefault && e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
      if(target.type === 'TXTSEL'){
        this.isShowInp = true
      }else{
        this.isShowInp = false
      };
      if(target.type === 'NUM'){
        this.isShowNumInp = true
      }else{
        this.isShowNumInp = false
      }
      if(target.type !== 'TITLE_DIVIDER' && target.type !== 'DIVIDERTHICK'){
        this.isShowUnitInp = true;
      }else{
        this.isShowUnitInp = false;
      }
      // 进入编辑状态时保存原始数据
      if (!target.editable) {
        this.cacheOriginData[key] = {...target};
      }
      target.editable = !target.editable;
      const newData = [...this.state.data]
      this.setState({data: newData});
      this.edit = !this.edit;
    }
  }

  remove(key) {

    const newData = this.state.data.filter(item => item.key !== key);
    for (var i = 0; i < newData.length; i++) {
      if(newData[i].type === 'TXTSEL'){
        this.isShowContent = true;
        break;
      }
      this.isShowContent = false;
    };
    for (var i = 0; i < newData.length; i++) {
      if(newData[i].type === 'NUM'){
        this.isShowPrecision = true;
        break;
      }
      this.isShowPrecision = false;
    }
    this.setState({data: newData});
    this.props.onChange(newData);
    this.edit = false;

  }

  newMember = () => {

    if (this.edit === true) {
      message.error('请先保存编辑的行信息。');
      return;
    }
    if(this.state.data && this.state.data.length > 0){
      this.idx = this.state.data[this.state.data.length - 1].findex + 1
    }else{
      this.idx ++;
    }
    const newData = [...this.state.data];
    newData.push({
      key: `NEW_TEMP_ID_${this.index}`,
      findex: this.idx,         // 序号
      type: 'TITLE_DIVIDER',    // 数据类型
      name: '',                 // 任务内容
      alias: '',                // 检查项
      defaultvalue: '',         // 填写内容
      editable: true,
      isNew: true,
      unit: '',                // 单位
      required: null,           // 是否必填
      visible: null,           // 是否可见
      edit: null,           // 是否可编辑
      info: '',           // 说明
    });
    this.index += 1;
    this.setState({data: newData});
    this.edit = true;

  };
  //冒泡排序；
  sortArr = (arr) => {
    for (var i = 0; i < arr.length; i++) {
      for (var j = 0; j < arr.length - 1 - i; j++) {
        if(Number(arr[j].findex) > Number(arr[j + 1].findex)){
          var temp = arr[j];      //两个元素交换顺序
          arr[j] = arr[j + 1];
          arr[j + 1] = temp
        }
      };
    };
    return arr
  };

  handleFieldChange = (value, fieldName, key, idx) => {
    // let value = e.target.value

    //填写内容；
    if(fieldName === 'type' && value === 'TXTSEL'){
      this.isShowInp = true;
      this.isShowContent = true;
    }else if(fieldName === 'type' && value !== 'TXTSEL'){
      this.isShowInp = false;
      const checkContent = this.state.data
      if(checkContent.length === 1){
        this.isShowContent = false;
      }else if(checkContent.length > 1){
        for (var i = 0; i < checkContent.length - 1; i++) {
          if(checkContent[i].type === 'TXTSEL'){
            this.isShowContent = true;
            break;
          }
          this.isShowContent = false;
        }
      }
    }
    // 小数位数；
    if(fieldName === 'type' && value === 'NUM'){
      this.isShowNumInp = true;
      this.isShowPrecision = true;
    }else if(fieldName === 'type' && value !== 'NUM'){
      this.isShowNumInp = false;
      const checkPrecision = this.state.data
      if(checkPrecision.length === 1){
        this.isShowPrecision = false;
      }else if(checkPrecision.length > 1){
        for (var i = 0; i < checkPrecision.length - 1; i++) {
          if(checkPrecision[i].type === 'NUM'){
            this.isShowPrecision = true;
            break;
          }
          this.isShowPrecision = false;
        }
      }
    };
    // 单位编辑框；
    if (fieldName === 'type' && value === 'TITLE_DIVIDER' || value === 'DIVIDERTHICK') {
      this.isShowUnitInp = false;
    }else if(fieldName === 'type' && value !== 'TITLE_DIVIDER' && value !== 'DIVIDERTHICK'){
      this.isShowUnitInp = true;
    }

    const newData = [...this.state.data];

    const target = this.getRowByKey(key)
    if (target) {
      if(fieldName === 'type' && value !== 'TXTSEL'){
        target['defaultvalue'] = '';
      }else if(fieldName === 'type' && value !== 'NUM'){
        target['accuracy'] = ''
      }
      if(value === 'NUM'){
        target['accuracy'] = '0'
      }
      target[fieldName] = value;

      this.setState({
        data: newData,
      });
    }

  };

  saveRow(e, key) {
    e.persist();
    setTimeout(() => {
      if (this.clickedCancel) {
        this.clickedCancel = false;
        return;
      };
      const target = this.getRowByKey(key) || {};
      if (!target.type || !target.alias || !target.findex ) {
        message.error('请填写完整反馈项信息！');
        return;
      };

      if(this.isShowInp && !target.defaultvalue){
        message.error('请填写完整反馈项信息！');
        return;
      };
      // if(target.type !== 'TITLE_DIVIDER' && target.type !== 'DIVIDERTHICK' && !target.unit){
      //   message.error('请填写完整反馈项信息！');
      //   return;
      // }
      this.setState({
        data: this.sortArr(this.state.data),
      })
      delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
      this.edit = false;
      this.isShowInp = false;
      this.isShowNumInp = false;
      this.isShowUnitInp = false;
      this.idx = target.findex;
    }, 10);
  }

  cancel(e, key) {
    this.clickedCancel = true;
    e.preventDefault();
    const target = this.getRowByKey(key);
    if (this.cacheOriginData[key]) {
      Object.assign(target, this.cacheOriginData[key]);
      target.editable = false;
      delete this.cacheOriginData[key];
    }
    this.setState({data: [...this.state.data]});
    this.edit = false;
  }

  render() {
    const {cycleUnit} = this.props

    const columns = [
      {
        title: '序号',
        dataIndex: 'findex',
        key: 'findex',
        width: '6%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <InputNumber
                outoFocus
                min={0}
                style={{width: 60}}
                value={text === undefined ? this.idx : text}
                onChange={
                  value => {
                    this.handleFieldChange(value, 'findex', record.key)
                  }
                }
                placeholder="序号"
              />
            );
          }
          return text;
        },
      },{
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={
                  e => {
                    this.handleFieldChange(e.target.value, 'name', record.key)
                  }
                }
                placeholder="名称"
              />
            );
          }
          return text;
        },
      },{
        title: '别名',
        dataIndex: 'alias',
        key: 'alias',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Input
                value={text}
                onChange={
                  e => {
                    this.handleFieldChange(e.target.value, 'alias', record.key)
                  }
                }
                placeholder="名称"
              />
            );
          }
          return text;
        },
      }, {
        title: '单位',
        dataIndex: 'unit',
        key: 'unit',
        width: '10%',
        render: (text, record) => {
          if (record.editable && this.isShowUnitInp) {
            return (
              <Select
                mode="combobox"
                allowClear
                style={{ width: 100 }}
                value={text}
                onChange={
                  value => {this.handleFieldChange(value, 'unit', record.key)}
                }
              >
                {
                  UNIT.map(item =>
                    <Option key={item} value={item}>{item}</Option>
                  )
                }
              </Select>
            );
          }
          return text;
        },
      },{
        title: '数据类型',
        dataIndex: 'type',
        key: 'type',
        width: '10%',
        render: (text, record) => {
          if (record.editable) {
            return (
              <Select
                value={text === undefined ? 'TITLE_DIVIDER' : text}
                style={{width: '100%'}}
                onChange={val => {
                  this.handleFieldChange(val, 'type', record.key)
                }}
              >
                {
                  Object.keys(TYPES).map(kk =>
                    <Option  key={kk} value={kk}>{TYPES[kk]}</Option>
                  )
                }
              </Select>
            );
          }
          return TYPES[text] || '';
        },
      },{
        title: '是否必填',
        dataIndex: 'required',
        key: 'required',
        width: '10%',
        render: (text, record) => {
          const Text = text === 0 ? '否' : '是';
          if (record.editable) {
            return (
              <Radio.Group
                value={text}
                onChange={e => {
                  this.handleFieldChange(e.target.value, 'required', record.key)
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            );
          }
          return Text;
        },
      },{
        title: '是否可见',
        dataIndex: 'visible',
        key: 'visible',
        width: '10%',
        render: (text, record) => {
          const Text = text === 0 ? '否' : '是';
          if (record.editable) {
            return (
              <Radio.Group
                value={text}
                onChange={e => {
                  this.handleFieldChange(e.target.value, 'visible', record.key)
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            );
          }
          return Text;
        },
      },{
        title: '是否可编辑',
        dataIndex: 'edit',
        key: 'edit',
        width: '10%',
        render: (text, record) => {
          const Text = text === 0 ? '否' : '是';
          if (record.editable) {
            return (
              <Radio.Group
                checked={0}
                value={text}
                onChange={e => {
                  this.handleFieldChange(e.target.value, 'edit', record.key)
                }}
              >
                <Radio value={1}>是</Radio>
                <Radio value={0}>否</Radio>
              </Radio.Group>
            );
          }
          return Text;
        },
      },{
        title: '操作',
        key: 'action',
        render: (text, record) => {
          if (record.editable) {
            if (record.isNew) {
              return (
                <span>
                <a onClick={(e) => {
                  this.saveRow(e, record.key)
                }}>保存</a>
                <Divider type="vertical"/>
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
              );
            }
            return (
              <span>
              <a onClick={(e) => {
                this.saveRow(e, record.key)
              }}>保存</a>
              <Divider type="vertical"/>
              <a onClick={e => this.cancel(e, record.key)}>取消</a>
            </span>
            );
          }
          return (
            <span>
            <a onClick={e => this.toggleEditable(e, record.key)}>编辑</a>
            <Divider type="vertical"/>
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.key)}>
              <a>删除</a>
            </Popconfirm>
          </span>
          );
        },
      }];

    if(this.isShowContent){
      columns.splice(5, 0,
        {
          title: '填写内容',
          dataIndex: 'defaultvalue',
          key: 'defaultvalue',
          width: '20%',
          render: (text, record, index) => {
            if (record.editable && this.isShowInp) {
              return (
                <Input
                  value={text}
                  onChange={
                    e => {
                      this.handleFieldChange(e.target.value, 'defaultvalue', record.key, index)
                    }
                  }
                  placeholder="数据域,逗号连接"
                />
              );
            }
            return text;
          },
        },
      )
    };

    if(this.isShowPrecision){
      columns.splice(5, 0,
        {
          title: '小数位数',
          dataIndex: 'accuracy',
          key: 'accuracy',
          width: '8%',
          render: (text, record, index) => {
            const val = text && text.length === 0 ? '0' : text
            if (record.editable && this.isShowNumInp) {
              return (
                <InputNumber
                  min={0}
                  max={6}
                  style={{width: 60}}
                  outoFocus
                  value={val}
                  onChange={
                    value => {
                      this.handleFieldChange(value, 'accuracy', record.key, index)
                    }
                  }
                />
              );
            }
            return text;
          },
        },
      )
    }

    return (
      <div>
        <div style={{marginBottom: 15}}>
          <Button
            style={{marginLeft: 20}}
            type='primary'
            onClick={this.newMember}
            icon="plus"
          >
            新增
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={this.state.data}
          pagination={false}
        />

      </div>
    );
  }
}
