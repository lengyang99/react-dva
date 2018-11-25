import React from 'react';
import { connect } from 'dva';
import { Table, Row, Col, DatePicker } from 'antd';
import moment from 'moment';
import styles from './style/index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const { RangePicker } = DatePicker;

@connect(state => ({
  data: state.countPeople.data,
  columns: state.countPeople.columns,
  total: state.countPeople.total,
  columnsLogin: state.countPeople.columnsLogin,
  dataLogin: state.countPeople.dataLogin,
  totalLogin: state.countPeople.totalLogin,
  totalUserLogin: state.countPeople.totalUserLogin,
}))
export default class CountPeople extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentWillMount() {
    this.props.dispatch({
      type: 'countPeople/tableQuery',
      payload: {},
    });
    this.props.dispatch({
      type: 'countPeople/tableQueryLogin',
      payload: {
        stime: moment().startOf('month').format('YYYY-MM-DD'),
        etime: moment().endOf('month').format('YYYY-MM-DD'),
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
  onRangeChange = (date, dateString) => {
    this.props.dispatch({
      type: 'countPeople/tableQueryLogin',
      payload: {
        stime: dateString[0],
        etime: dateString[1],
      },
    });
  }
  render() {
    return (
      <PageHeaderLayout>
        <div style={{ textAlign: 'center', paddingTop: 25, width: '100%', height: 'calc(100% - 175px)', minHeight: 'calc(100vh - 175px)' }}>
          <Row gutter={10}>
            <Col span={11} >
              <div className={styles.header}>
                <h3 className={styles.toH}>在线人数统计：<span className={styles.total}>{this.props.total}</span></h3>
                <h3 className={styles.toH}>登录人次统计：<span className={styles.total}>{this.props.totalLogin}</span></h3>
                <h3 className={styles.toH}>用户数统计：<span className={styles.total}>{this.props.totalUserLogin}</span></h3>
              </div>
              <Table
                dataSource={this.props.data}
                columns={this.props.columns}
                style={{ width: '100%', height: '100%', padding: '0 20px' }}
                bordered
                pagination={{
                  showTotal: this.showTotal,
                }}
                rowClassName={this.setRowClassName}
              />
            </Col>
            <Col span={12} offset={1}>
              <div className={styles.header}>
                <span>时间：</span>
                <RangePicker
                  className={styles.rangePicker}
                  onChange={this.onRangeChange}
                  defaultValue={[moment().startOf('month'), moment().endOf('month')]}
                />
              </div>
              <Table
                dataSource={this.props.dataLogin}
                columns={this.props.columnsLogin}
                style={{ width: '100%', height: '100%', padding: '0 20px' }}
                bordered
                pagination={{
                  showTotal: this.showTotal,
                }}
                rowClassName={this.setRowClassName}
              />
            </Col>
          </Row>
        </div>
      </PageHeaderLayout>
    );
  }
}
