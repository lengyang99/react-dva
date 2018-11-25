import React, { Component } from 'react';
import { Table, Button, Modal, Checkbox, Icon, Tooltip} from 'antd';
import styles from './index.less';
import NewFeedModal from '../NewModalForm/NewFeedModal';

const defaultFeedData = [{
  key: 'FEED_1',
  gid: 1,
  findex: 1,
  name: 'startTime',
  alias: '实际开始时间',
  type: 'DATE',
  required: 0,
  defaultvalue: '',
  standard: '标准',
},
{
  key: 'FEED_2',
  gid: 2,
  findex: 2,
  name: 'endTime',
  alias: '实际完成时间',
  type: 'DATE',
  required: 0,
  defaultvalue: '',
  standard: '标准',
},
{
  key: 'FEED_3',
  gid: 3,
  findex: 3,
  name: 'executor',
  alias: '执行人',
  type: 'TXT',
  required: 0,
  defaultvalue: '',
  standard: '标准',
},
{
  key: 'FEED_4',
  gid: 4,
  findex: 4,
  name: 'maintenanceRecord',
  alias: '维护记录',
  type: 'TXTEXT',
  required: 1,
  defaultvalue: '',
  standard: '标准',
},
{
  key: 'FEED_5',
  gid: 5,
  findex: 5,
  name: 'attachment',
  alias: '附件',
  type: 'ATT',
  required: 0,
  defaultvalue: '',
  standard: '标准',
},
];
const confirm = Modal.confirm;
export default class FeedbackTable2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      isEdit: false,
      showValue: false,
      current: 1,
      editAliasValue: '',
      showBt: false,
      select: {
        record: {},
        index: null,
      },
      feedData: [],
      aliasInfo: [
        {gid: 1, alias: '实际开始时间'},
        {gid: 2, alias: '实际完成时间'},
        {gid: 3, alias: '执行人'},
        {gid: 4, alias: '维护记录'},
        {gid: 5, alias: '附件'},
      ],
    };
  }
    gid = 6;
    defaultPageSize=5000;
    feedItem = {};
    form = null;
    // 数据类型改变
    handleTypeChange =(value) => {
      if (value === 'TXTSEL' || value === 'NUM') {
        this.setState({
          showValue: true,
        });
      } else {
        this.setState({
          showValue: false,
        });
      }
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
      this.handleTypeChange(record.type);
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
      this.setState({ visible: true });
    }
    // 重置
    restState = () => {
      this.form.resetFields();
      this.setState({ visible: false, isEdit: false, showValue: false });
    }

    // 排序时改变
    handleTableChage = (pagination) => {
      this.setState({
        current: pagination.current,
      });
    }
    // 校检
    handleCheckAlias = (rule, value, callback) => {
      // 如果处于编辑状态下的校检名称，当前名称不会作为重名依据
      const {aliasInfo, editAliasValue, isEdit} = this.state;
      if (isEdit && value && value !== editAliasValue && aliasInfo.find(item => item.alias === value)) {
        callback('已经存在该反馈项,请重新输入!');
      }
      if (!isEdit && value && aliasInfo.find(item => item.alias === value)) {
        callback('已经存在该反馈项,请重新输入!');
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
      const {current, feedData} = this.state;
      const currNum = (current - 1) * this.defaultPageSize;
      const temp = feedData[currNum + index];
      feedData[currNum + index] = feedData[(currNum + index) - 1];
      feedData[(currNum + index) - 1] = temp;
      if (index !== 0) {
        this.handleClick(record, index - 1);
      } else {
        this.setState({current: current - 1});
        this.handleClick(record, this.defaultPageSize - 1 - index);
      }
      this.feedDataSave(feedData);
    }
    // 下移
    handleClickBySortDown = (record, index) => {
      const {current, feedData} = this.state;
      const currNum = (current - 1) * this.defaultPageSize;
      const temp = feedData[currNum + index];
      feedData[currNum + index] = feedData[currNum + index + 1];
      feedData[currNum + index + 1] = temp;
      if (index < this.defaultPageSize - 1) {
        this.handleClick(record, index + 1);
      } else {
        this.setState({current: current + 1});
        this.handleClick(record, index - (this.defaultPageSize - 1));
      }
      this.feedDataSave(feedData);
    }
    // 确定
    handleOk = (e) => {
      const form = this.form;
      const { isEdit, aliasInfo, feedData} = this.state;
      e.preventDefault();
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          Object.assign(values, {name: values.alias});
          const feedInfo = { gid: isEdit ? this.feedItem.gid : this.gid += 1,
            required: isEdit ? this.feedItem.required : 1,
            standard: '自定义',
            ...values };
          const params = [];
          params.push(feedInfo);
          // 如果处于编辑状态,否则是新建状态
          if (isEdit) {
            const editData = feedData.filter(item => {
              return item.gid !== feedInfo.gid;
            });
            this.feedDataSave([...editData, ...params]);
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
      const { showBt, feedData, current, select: {record, index}} = this.state;
      const { disabled} = this.props;
      const TYPES = [
        {value: 'TXT', name: '短文本'},
        {value: 'TXTEXT', name: '长文本'},
        {value: 'DATE', name: '日期'},
        {value: 'DATETIME', name: '时间戳'},
        {value: 'NUM', name: '数字'},
        {value: 'TXTSEL', name: '选择'},
        {value: 'ATT', name: '附件'},
        {value: 'IMG', name: '照片'},
        {value: 'TITLE_DIVIDER', name: '标题'},
      ];
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
          key: 'defaultvalue',
          title: '选择域',
          dataIndex: 'defaultvalue',
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
              <a disabled={disabled === 'read'} onClick={(e) => { this.ediHandle(records); }}>编辑</a>
              <a disabled={disabled === 'read'} onClick={(e) => { this.delHandle(records); }}>&nbsp;&nbsp;&nbsp;删除</a>
            </span> : <span />
          ),
        }];
      const total = feedData.length;
      const totalSum = Math.ceil(total / this.defaultPageSize);
      const lastPage = total % this.defaultPageSize === 0 ? this.defaultPageSize : total % this.defaultPageSize;
      // 表格分页
      const pagination = {
        current,
        total: feedData.length,
        size: 'small',
        defaultPageSize: this.defaultPageSize,
        showTotal: (totals) => {
          return (<div>共 {totals} 条记录 </div>);
        },
      };
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
                style={{ marginRight: 5, display: current === 1 && index === 0 ? 'none' : 'inline-block' }}
                onClick={() => { this.handleClickBySortUp(record, index); }}
              ><Icon type="caret-up" />上移</Button>
              <Button
                type="primary"
                size="small"
                style={{ display: current === totalSum && index === lastPage - 1 ? 'none' : 'inline-block' }}
                onClick={() => { this.handleClickBySortDown(record, index); }}
              ><Icon type="caret-down" />下移</Button>
            </div>
          </div>
          <div style={{clear: 'both'}} />
          <NewFeedModal
            ref={form => {
                        this.form = form;
                    }}
            visible={this.state.visible}
            showValue={this.state.showValue}
            feedItem={this.feedItem}
            typeData={TYPES}
            handleCheckAlias={this.handleCheckAlias}
            handleTypeChange={this.handleTypeChange}
            handleOk={this.handleOk}
            handleCancel={this.handleCancel}
          />
          <Table
            columns={columns}
            dataSource={feedData || []}
            onChange={this.handleTableChage}
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
