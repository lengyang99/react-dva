import React from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import FromSearch from './FormSearch';
import Table from './Table';
import styles from './index.less';

@connect(state => ({
  tableData: state.reportCount.tableData,
  selectData: state.reportCount.selectData,
  countData: state.reportCount.countData,
}))
@Form.create()
export default class ReportCount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.reporttime = moment().format('YYYY-MM-DD');
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'reportCount/tableQuery',
      payload: {
        loccode: '',
        locarea: '',
        reporttime: this.reporttime,
        sgschedule: '',
      },
    });
  }
  // 查询
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.reporttime = values.time.format('YYYY-MM-DD');
        this.props.dispatch({
          type: 'reportCount/tableQuery',
          payload: {
            loccode: values.loccode === '全部' ? '' : values.loccode,
            locarea: values.locarea === '全部' ? '' : values.locarea,
            reporttime: values.time.format('YYYY-MM-DD'),
            sgschedule: values.sgschedule,
          },
        });
      } else {
        message.warning('搜索失败！');
      }
    });
  };
  render() {
    return (
      <div className={styles.main}>
        <FromSearch
          handleSubmit={this.handleSubmit}
          form={this.props.form}
          selectData={this.props.selectData}
        />
        <div className={styles.tableWrapper}>
          <Table
            tableData={this.props.tableData}
            countData={this.props.countData}
            reporttime={this.reporttime}
          />
        </div>
      </div>
    );
  }
}

