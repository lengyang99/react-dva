import React from 'react';
import { connect } from 'dva';
import { Table, Spin, message, Form } from 'antd';
import styles from './style/index.less';
import FromSearch from './FormSearch';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

@connect(state => ({
  data: state.loginLog.data,
  columns: state.loginLog.columns,
  loading: state.loginLog.loading,
}))
@Form.create()

export default class LoginLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'loginLog/loadData',
      payload: {
        loading: true,
      },
    });
    this.props.dispatch({
      type: 'loginLog/tableQuery',
      payload: {
        where: 'and 1=1',
      },
    });
  }
  // 隔行换色
  setRowClassName = (record, index) => {
    if (index % 2 !== 0) {
      return styles.doubleRow;
    }
  };
  // 显示总页数
  showTotal = total => {
    return `共${total}条数据`;
  };
  // 查询
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const val = JSON.parse(JSON.stringify(values));
        let where = 'and 1=1';
        if (values.time && values.time.length > 0) {
          val.time[0] = values.time[0].format('YYYY-MM-DD');
          val.time[1] = values.time[1].format('YYYY-MM-DD');
        }
        for (const [key, value] of Object.entries(val)) {
          switch (key) {
            case 'time':
              if (value.length > 0) {
                where += ` and createtime >='${value[0]}' and createtime <= '${value[1]} 23:59:59'`;
              }
              break;
            case 'username':
              where += ` and ${key} like '%${value}%'`;
              break;
            default:
              if (value !== '全部') {
                where += ` and ${key}='${value}'`;
              }
              break;
          }
        }
        this.props.dispatch({
          type: 'loginLog/loadData',
          payload: {
            loading: true,
          },
        });
        this.props.dispatch({
          type: 'loginLog/tableQuery',
          payload: {
            where,
          },
        });
      } else {
        message.warning('搜索失败！');
      }
    });
  };
  render() {
    return (
      <PageHeaderLayout>
        <div style={{ textAlign: 'center', width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)' }}>
          <FromSearch
            handleSubmit={this.handleSubmit}
            form={this.props.form}
          />
          <Spin tip="Loading..." spinning={this.props.loading}>
            <Table
              dataSource={this.props.data}
              columns={this.props.columns}
              style={{ width: '100%', height: '100%', minWidth: '700px', padding: '0 20px' }}
              bordered
              pagination={{
                showTotal: this.showTotal,
              }}
              rowClassName={this.setRowClassName}
              onChange={this.tablePageChange}
            />
          </Spin>
        </div>
      </PageHeaderLayout>
    );
  }
}

