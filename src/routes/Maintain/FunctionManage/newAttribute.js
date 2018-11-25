import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Table, Button, Input, message, Select, Popconfirm, Divider, InputNumber, Radio} from 'antd';
import styles from './index.less';
import parseValues from '../../../utils/utils';

const {Option} = Select;
const RadioGroup = Radio.Group;

@connect(({maintain, login}) => ({
  user: login.user,
  funcGroup: maintain.funcGroup,
}))
export default class NewAttribute extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.idx = 0;
    this.state = {
      data: [],
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps && nextProps.value !== undefined) {
      this.setState({
        data: nextProps.value,
      });
      this.edit = false;
    }
  }

  getRowByKey(key) {
    return this.state.data.filter(item => item.gid === key)[0];
  }

  index = 0;
  cacheOriginData = {};

  toggleEditable(e, key) {
    e.preventDefault && e.preventDefault();
    const target = this.getRowByKey(key);
    if (target) {
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
    const newData = this.state.data.filter(item => item.gid !== key);
    if(!isNaN(Number(key))) {
      this.props.attributedel(key)
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
    const newData = [...this.state.data];
    newData.push({
      gid: `NEW_TEMP_ID_${this.index}`,
      propertyName: '',         // 属性名
      propertyValue: '',        // 属性值
      editable: true,
      isNew: true,
    });
    this.index += 1;
    this.setState({data: newData});
    this.edit = true;

  };

  handleFieldChange = (value, fieldName, key, idx) => {
    const newData = [...this.state.data];
    const target = this.getRowByKey(key)
    if (target) {
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
      if (!target.propertyValue || !target.propertyName ) {
        message.error('请填写完整反馈项信息！');
        return;
      };
      delete target.isNew;
      this.toggleEditable(e, key);
      this.props.onChange(this.state.data);
      this.edit = false;
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

    const columns = [{
      title: '属性名',
      dataIndex: 'propertyName',
      key: 'propertyName',
      width: '10%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                e => {
                  this.handleFieldChange(e.target.value, 'propertyName', record.gid)
                }
              }
              placeholder="属性名"
            />
          );
        }
        return text;
      },
    }, {
      title: '属性值',
      dataIndex: 'propertyValue',
      key: 'propertyValue',
      width: '10%',
      render: (text, record) => {
        if (record.editable) {
          return (
            <Input
              value={text}
              onChange={
                e => {
                  this.handleFieldChange(e.target.value, 'propertyValue', record.gid)
                }
              }
              placeholder="属性值"
            />
          );
        }
        return text;
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
                  this.saveRow(e, record.gid)
                }}>保存</a>
                <Divider type="vertical"/>
                <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
                  <a>删除</a>
                </Popconfirm>
              </span>
            );
          }
          return (
            <span>
              <a onClick={(e) => {
                this.saveRow(e, record.gid)
              }}>保存</a>
              <Divider type="vertical"/>
              <a onClick={e => this.cancel(e, record.gid)}>取消</a>
            </span>
          );
        }
        return (
          <span>
            <a onClick={e => this.toggleEditable(e, record.gid)}>编辑</a>
            <Divider type="vertical"/>
            <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.gid)}>
              <a>删除</a>
            </Popconfirm>
          </span>
        );
      },
    }];

    return (
      <div>
        <div style={{marginBottom: 15}}>
          <Button
            style={{marginLeft: 20}}
            type='primary'
            onClick={this.newMember}
            icon="plus"
          >
            新增属性
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
