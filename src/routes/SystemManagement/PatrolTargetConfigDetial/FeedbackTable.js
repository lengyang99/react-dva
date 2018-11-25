import React, { PureComponent } from 'react';
import { Table, Popconfirm, Row, Button, Icon, Divider, Dropdown, Menu } from 'antd';
import { connect } from 'dva';
import Dialog from './Dialog';
import styles from './FeedbackTable.less';

@connect(state => ({
  feedbackList: state.PatrolTargetConfig.feedbackList,
}))
export default class FeedbackTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isAdd: false,
    };
  }
  onMoveTo = (record, to) => { // 移动
    const { feedbackList } = this.props;
    let list = [];
    feedbackList.forEach(item => {
      if (item.findex !== record.findex) {
        list.push(item);
      }
    });
    list.splice((to - 1), 0, record);
    this.props.dispatch({
      type: 'PatrolTargetConfig/setFeedbackData',
      payload: list,
    });
  };
  handleClick = (type, record) => {
    const { feedbackList } = this.props;
    let list = [];
    switch (type) {
      case 'add':
        this.setState({
          isAdd: true,
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/showModal',
          payload: true,
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/setFeedbackDetial',
          payload: {
            findex: '',
            name: '',
            defaultvalue: '',
            visible: 1,
            edit: 1,
            info: '',
            alias: undefined,
            type: undefined,
            required: undefined,
          },
        });
        break;
      case 'edit':
        this.setState({
          isAdd: false,
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/showModal',
          payload: true,
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/setFeedbackDetial',
          payload: record,
        });
        break;
      case 'delete':
        feedbackList.forEach(item => {
          if (item.findex !== record.findex) {
            list.push(item);
          }
        });
        this.props.dispatch({
          type: 'PatrolTargetConfig/setFeedbackData',
          payload: list,
        });
        break;
      default:
        break;
    }
  };
  render() {
    const { feedbackList } = this.props;
    const { isAdd } = this.state;
    const menu = (record) => (
      <Menu title="序号" className={styles.menu} >
        <Menu.Item disabled>序号</Menu.Item>
        <Menu.Divider />
        {feedbackList.map(item => (
          <Menu.Item key={item.findex} onClick={this.onMoveTo.bind(this, record, item.findex)}>{item.findex}</Menu.Item>
        ))}
      </Menu>
    );
    const TYPES = [
      {value: 'TXT', name: '短文本'},
      {value: 'TXTEXT', name: '长文本'},
      {value: 'DATE', name: '日期'},
      {value: 'DATETIME', name: '时间戳'},
      {value: 'NUM', name: '数字'},
      {value: 'TXTSEL', name: '选择'},
      {value: 'RDO', name: '单选'},
      {value: 'ATT', name: '附件'},
      {value: 'IMG', name: '照片'},
      {value: 'TITLE_DIVIDER', name: '标题'},
    ];
    const columns = [
      {
        title: '序号',
        dataIndex: 'findex',
        key: 'findex',
      },
      {
        title: '名称',
        dataIndex: 'alias',
        key: 'alias',
      },
      {
        title: '数据类型',
        dataIndex: 'type',
        key: 'type',
        render: (text) => {
          const item = TYPES.find((ele) => ele.value === text);
          return <span>{item ? item.name : text}</span>;
        },
      },
      {
        title: '是否必填',
        dataIndex: 'required',
        key: 'required',
        render: (text) => (text ? '是' : '否'),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (
          <span>
            <a onClick={this.handleClick.bind(this, 'edit', record)}>编辑</a>
            <Divider type="vertical" />
            <Popconfirm
              title="确定删除?一旦删除，不可撤销！"
              onConfirm={this.handleClick.bind(this, 'delete', record)}
              okText="是"
              cancelText="否"
            >
              <a>删除</a>
            </Popconfirm>
            <Divider type="vertical" />
            <Dropdown title="序号" overlay={menu(record)} trigger={['click']}>
              <a>
                移动<Icon type="down" />
              </a>
            </Dropdown>
          </span>
        ),
      },
    ];
    // 表格分页
    const pagination = {
      size: 'small',
      defaultPageSize: 10,
      total: feedbackList.length,
      showTotal: (total) => {
        return (<div>共 {total} 条记录 </div>);
      },
    };
    return (
      <div>
        <Row>
          <Button
            onClick={this.handleClick.bind(this, 'add')}
            className={styles.addbtn}
            type="primary"
          ><Icon type="plus" />添加反馈项</Button>
        </Row>
        <Row>
          <Table
            columns={columns}
            pagination={pagination}
            dataSource={feedbackList}
            bordered
            rowKey={(record) => record.findex}
          />
        </Row>
        <Dialog isAdd={isAdd} types={TYPES} />
      </div>
    );
  }
}
