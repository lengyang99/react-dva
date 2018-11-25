import React, { Component } from 'react';
import { Table, Button, Modal, Checkbox, Icon, Tooltip} from 'antd';
import styles from './index.less';
import NewFeedModal from '../NewModalForm/NewFeedModal';

const TYPES = [
  {value: 'TXT', name: '短文本'},
  {value: 'TXTEXT', name: '长文本'},
  {value: 'DATE', name: '日期'},
  {value: 'DATETIME', name: '时间戳'},
  {value: 'NUM', name: '数字'},
  {value: 'DDL', name: '选择'},
  {value: 'RDO', name: '单选'},
  {value: 'CHK', name: '多选'},
  {value: 'GEOM', name: '位置'},
  {value: 'PIPEDEV', name: '管段'},
  {value: 'ATT', name: '附件'},
  {value: 'IMG', name: '照片'},
  {value: 'TITLE_DIVIDER', name: '标题'},
];
const confirm = Modal.confirm;
export default class FeedbackTable2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isEdit: false,
      isNum: false,
      isSelect: false,
      showValue: false,
      showWarn: false,
      isTXTSEL: false,
      editAliasValue: '',
      showBt: false,
      select: {
        record: {},
        index: null,
      },
      feedData: [],
      aliasInfo: [],
    };
  }
  gid = 6;
  defaultPageSize=5;
  feedItem = {};
  form = null;
  // 数据类型改变
  handleTypeChange =(value, type) => {
    const showValue = ['TXT', 'TXTEXT', 'NUM', 'RDO', 'CHK', 'DDL', 'TXTSEL'];
    const isSelect = ['RDO', 'CHK', 'DDL'];
    const isNum = ['NUM'];
    const showWarn = ['NUM', 'RDO', 'CHK', 'DDL', 'TXTSEL'];
    this.setState({showWarn: showWarn.includes(value), isTXTSEL: value === 'TXTSEL', isSelect: isSelect.includes(value), showValue: showValue.includes(value), isNum: isNum.includes(value)}, () => {
      if (type !== 1 && showValue.includes(value)) {
        this.form.setFieldsValue({'value': ''});
      }
      if (type !== 1 && showWarn.includes(value)) {
        this.form.setFieldsValue({'warningrange': ''});
      }
    });
  }
  // 根据序号排序
  sortFindex = (feedData) => {
    feedData.forEach((item, index) => {
      Object.assign(item, { findex: index + 1 });
    });
  }
  feedDataSave = (data) => {
    this.sortFindex(data);
    this.setState({feedData: data});
  }
  // 是否必填
  handleCheckChage = (e, gid, column) => {
    const { feedData } = this.state;
    const newData = [...feedData];
    const target = newData.filter(item => gid === item.gid)[0];
    if (target) {
      target[column] = e.target.checked ? 1 : 0;
      this.feedDataSave(newData);
    }
  }
  // 编辑
  ediHandle = (record) => {
    this.feedItem = record;
    this.handleTypeChange(record.type, 1);
    this.setState({ visible: true, isEdit: true, editAliasValue: record.alias});
  }
  // 取消
  handleCancel = () => {
    this.feedItem = {};
    this.restState();
  }
  // 删除
  delHandle = (record) => {
    const that = this;
    const { aliasInfo, feedData } = this.state;
    confirm({
      title: '是否删除记录项?',
      onOk() {
        const feedInfo = feedData.filter(item => {
          return item.gid !== record.gid;
        });
        that.setState({
          aliasInfo: aliasInfo.filter(item => {
            return item.gid !== record.gid;
          }),
        });
        that.feedDataSave(feedInfo);
      },
      onCancel() {
      },
    });
  };
  // 显示
  showModal = () => {
    this.feedItem = {};
    this.setState({ visible: true});
  }
  // 重置
  restState = () => {
    this.form.resetFields();
    this.setState({ visible: false, isEdit: false, isNum: false, isSelect: false, showValue: false });
  }
  checkFeedData = (data) => {
    data.forEach((item, idx) => {
      Object.assign(item, {title: this.getTitle(data, idx)});
    });
  }
  getTitle = (data, idx) => {
    let title = null;
    for (let index = idx; index >= 0; index -= 1) {
      if (data[index].type === 'TITLE_DIVIDER') {
        title = data[index].alias;
        break;
      }
    }
    return title;
  }
  // 校检名称
  handleCheckAlias = (rule, value, callback) => {
    // 如果处于编辑状态下的校检名称，当前名称不会作为重名依据
    const type = this.form.getFieldValue('type');
    const {aliasInfo, editAliasValue, isEdit, feedData} = this.state;
    let title = value;
    let msg = '已经存在该反馈项,请重新输入!';
    if (type !== 'TITLE_DIVIDER' && this.getTitle(feedData, feedData.length - 1)) {
      title = this.getTitle(feedData, feedData.length - 1);
      msg = '相同标题下添加反馈项重复!';
    }
    let flag = true;
    aliasInfo.forEach(item => {
      if (item.alias === value && item.title === title) {
        flag = false;
      }
    });
    if (isEdit && value && value !== editAliasValue && !flag) {
      callback(msg);
    }
    if (!isEdit && value && !flag) {
      callback(msg);
    }
    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    callback();
  }
  // 校验预警范围
  handleCheckWarn = (rule, value, callback) => {
    const {showWarn, isNum, isTXTSEL} = this.state;
    let msg = '';
    if (isNum) {
      msg = this.checkNumWarn(value);
    } else if (showWarn) {
      if (isTXTSEL) {
        const defaultvalue = this.form.getFieldValue('defaultvalue');
        msg = this.checkChkValue(value, defaultvalue);
      } else {
        const selectValues = this.form.getFieldValue('selectValues');
        msg = this.checkChkValue(value, selectValues);
      }
    }
    if (msg !== '') {
      callback(msg);
    }
    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    callback();
  }
  // 利用replace每次只替换一个不同元素为空特性 查重 true 为无重复
  checkeRepeat = (ary) => {
    const s = `${ary.join(',')},`;
    let flag = true;
    for (let i = 0; i < ary.length; i++) {
      if (s.replace(`${ary[i]},`, '').indexOf(`${ary[i]},`) > -1) {
        flag = false;
        break;
      }
    }
    return flag;
  }
  checkChkValue = (value, selectValues) => {
    const values = selectValues.replace(/，/g, ',');
    const defaultValues = value.replace(/，/g, ',');
    let msg = '';
    if (value && value !== '' && values) {
      const valuesArr = values.split(',');
      const defaultArr = defaultValues.split(',');
      if (!this.checkeRepeat(defaultArr)) {
        msg = '输入值包含重复的选择项';
      } else if (defaultArr && Array.isArray(defaultArr)) {
        for (let i = 0; i < defaultArr.length; i++) {
          if (!valuesArr.includes(defaultArr[i])) {
            msg = '输入值应为选择域其中的一项或者多项';
            break;
          }
        }
      }
    }
    return msg;
  }
  checkRdoValue = (value, selectValues) => {
    const values = selectValues.replace(/，/g, ',');
    if (values) {
      const valuesArr = values.split(',');
      if (value && !valuesArr.includes(value)) {
        return '输入值应为选择域其中的一项';
      }
    }
  }
  checkNumWarn = (value) => {
    const values = value.replace(/，/g, ',');
    const numArr = values.split(',');
    if (value) {
      if (numArr.length !== 2) {
        return '预警范围格式不正确';
      } else if (parseFloat(numArr[0]).toString() === 'NaN' && parseFloat(numArr[1]).toString() === 'NaN') {
        return '预警范围格式不正确';
      } else if (parseFloat(numArr[0]) >= parseFloat(numArr[1])) {
        return '预警范围格式不正确';
      }
    }
  }
  // 校验默认值
  handleCheckValue = (rule, value, callback) => {
    const type = this.form.getFieldValue('type');
    const selectValues = this.form.getFieldValue('selectValues');
    const defaultvalue = this.form.getFieldValue('defaultvalue');
    const {isSelect, isTXTSEL} = this.state;
    let msg = '';
    if (type === 'CHK') {
      msg = this.checkChkValue(value, selectValues);
    } else if (isSelect) {
      msg = this.checkRdoValue(value, selectValues);
    } else if (isTXTSEL) {
      msg = this.checkRdoValue(value, defaultvalue);
    }
    if (msg !== '') {
      callback(msg);
    }
    // Note: 必须总是返回一个 callback，否则 validateFieldsAndScroll 无法响应
    callback();
  }
  rowClassName = (record, index) => {
    return index === this.state.select.index ? styles.selectRow : '';
  };
  handleClick = (record, index) => {
    this.setState({
      select: {
        record,
        index,
      },
      showBt: true,
    }, () => {
      this.rowClassName();
    });
  }
  // 上移
  handleClickBySortUp = (record, index) => {
    const {feedData} = this.state;
    const temp = feedData[index];
    feedData[index] = feedData[index - 1];
    feedData[index - 1] = temp;
    if (index !== 0) {
      this.handleClick(record, index - 1);
    } else {
      this.handleClick(record, feedData.length - 1 - index);
    }
    this.feedDataSave(feedData);
  }
  // 下移
  handleClickBySortDown = (record, index) => {
    const {feedData} = this.state;
    const temp = feedData[index];
    feedData[index] = feedData[index + 1];
    feedData[index + 1] = temp;
    if (index < feedData.length - 1) {
      this.handleClick(record, index + 1);
    } else {
      this.handleClick(record, index - (feedData.length - 1));
    }
    this.feedDataSave(feedData);
  }
  renderSeletValue = (text, records) => {
    const select = ['RDO', 'CHK', 'DDL'];
    const textArr = text.split(',');
    const alias = [];
    if (textArr && Array.isArray(textArr) && select.includes(records.type)) {
      (records.selectValues || []).forEach((ele) => {
        if (textArr.includes(ele.name)) {
          alias.push(ele.alias);
        }
      });
      return <span>{alias.toString()}</span>;
    } else {
      return <span>{text}</span>;
    }
  }
  // 确定
  handleOk = (e) => {
    const form = this.form;
    const { isEdit, aliasInfo, feedData} = this.state;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        Object.assign(values, {name: values.alias});
        let title = values.alias;
        if (values.type !== 'TITLE_DIVIDER' && this.getTitle(feedData, feedData.length - 1)) {
          title = this.getTitle(feedData, feedData.length - 1);
        }
        const feedInfo = { gid: isEdit ? this.feedItem.gid : this.gid += 1,
          required: isEdit ? this.feedItem.required : 1,
          title,
          standard: '自定义',
          ...values };
        const params = [];
        params.push(feedInfo);
        // 如果处于编辑状态,否则是新建状态
        if (isEdit) {
          // 编辑时作替换操作 不改变原有顺序
          const findex = this.feedItem.findex - 1;
          const newData = [...this.state.feedData];
          newData[findex] = feedInfo;
          this.feedDataSave(newData);
          // 编辑时保存名称信息，便于排重
          const editAlias = aliasInfo.filter(item => {
            return item.gid !== feedInfo.gid;
          });
          this.setState({aliasInfo: [...editAlias, ...params]});
        } else {
          this.feedDataSave([...feedData, ...params]);
          aliasInfo.push(feedInfo);
        }
        this.restState();
      }
    });
  }
  render() {
    const { showBt, showWarn, isTXTSEL, isSelect, showValue, isNum, visible, feedData, select: {record, index}} = this.state;
    const { disabled} = this.props;
    const columns = [
      {
        key: 'findex',
        title: '序号',
        dataIndex: 'findex',
      },
      {
        key: 'alias',
        title: '名称',
        dataIndex: 'alias',
        render: (text) => (<Tooltip title={text}><span>{text}</span></Tooltip>),
      }, {
        key: 'type',
        title: '数据类型',
        dataIndex: 'type',
        render: (text) => {
          const item = TYPES.find((ele) => ele.value === text);
          return <span>{item ? item.name : text}</span>;
        },
      },
      {
        key: 'selectValues',
        title: '选择域',
        dataIndex: 'selectValues',
        render: (text, records) => {
          return <span>{records.type === 'TXTSEL' ? records.defaultvalue : text}</span>;
        },
      },
      {
        key: 'value',
        title: '默认值',
        dataIndex: 'value',
      },
      {
        key: 'accuracy',
        title: '小数精度',
        dataIndex: 'accuracy',
      },
      {
        key: 'unit',
        title: '单位',
        dataIndex: 'unit',
      },
      {
        key: 'warningrange',
        title: '预警范围',
        dataIndex: 'warningrange',
      },
      {
        key: 'warningillustration',
        title: '预警提醒说明',
        dataIndex: 'warningillustration',
        render: (text) => (<Tooltip title={text}><span>{text}</span></Tooltip>),
      },
      {
        key: 'standard',
        title: '反馈类型',
        dataIndex: 'standard',
      },
      {
        key: 'required',
        title: '是否必填',
        dataIndex: 'required',
        render: (text, records) => {
          return (<div style={{textAlign: 'center'}}>
            <Checkbox
              disabled={disabled === 'read'}
              checked={text === 1}
              onChange={e => { this.handleCheckChage(e, records.gid, 'required'); }}
            />
          </div>);
        },
      },
      {
        key: 'action',
        title: '操作',
        dataIndex: 'action',
        render: (text, records) => (
          records.standard !== '标准' ? <span>
            <a disabled={disabled === 'read'} onClick={() => { this.ediHandle(records); }}>编辑</a>
            <span style={{color: 'e8e8e8'}}> | </span>
            <a disabled={disabled === 'read'} onClick={() => { this.delHandle(records); }}>删除</a>
          </span> : <span />
        ),
      }];
    const total = feedData.length;
    return (
      <div className={styles['feed-layout']}>
        <div>
          <Button
            disabled={disabled === 'read'}
            type="primary"
            htmlType="button"
            onClick={this.showModal}
          >+ 新建任务反馈内容
          </Button>
          <div style={{float: 'right', marginTop: 10, display: showBt ? 'inline-block' : 'none'}}>
            <Button
              type="primary"
              size="small"
              style={{ marginRight: 5, display: index === 0 ? 'none' : 'inline-block' }}
              onClick={() => { this.handleClickBySortUp(record, index); }}
            ><Icon type="caret-up" />上移</Button>
            <Button
              type="primary"
              size="small"
              style={{ display: index === total - 1 ? 'none' : 'inline-block' }}
              onClick={() => { this.handleClickBySortDown(record, index); }}
            ><Icon type="caret-down" />下移</Button>
          </div>
        </div>
        <div style={{clear: 'both'}} />
        <NewFeedModal
          ref={form => {
            this.form = form;
          }}
          visible={visible}
          isNum={isNum}
          isSelect={isSelect}
          showValue={showValue}
          showWarn={showWarn}
          feedItem={this.feedItem}
          isTXTSEL={isTXTSEL}
          typeData={TYPES}
          handleCheckWarn={this.handleCheckWarn}
          handleCheckAlias={this.handleCheckAlias}
          handleCheckValue={this.handleCheckValue}
          handleTypeChange={this.handleTypeChange}
          handleOk={this.handleOk}
          handleCancel={this.handleCancel}
        />
        <Table
          columns={columns}
          dataSource={feedData || []}
          pagination={false}
          rowKey={records => `${records.findex}_${records.alias}`}
          rowClassName={this.rowClassName}
          onRow={(records, indexs) => ({
            onClick: this.handleClick.bind('', records, indexs),
          })}
          bordered
        />
      </div>
    );
  }
}
