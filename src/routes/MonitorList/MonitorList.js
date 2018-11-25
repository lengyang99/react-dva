import React, {Component} from 'react';
import {connect} from 'dva';
import { Pagination } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import MonitorCard from '../../components/MonitorCard/MonitorCard';
import styles from './MonitorList.less';

@connect(state => ({
  points: state.monitor.results,
}))

export default class MonitorList extends Component {
  constructor(props) {
    super(props);

    this.pageInfo = {
      pageNo: 1,
      pageSize: 10,
    };
    this.getMonitorData();
  }

  getMonitorData = () => {
    this.props.dispatch({
      type: 'monitor/fetchTags',
      payload: {
        fetchParams: {
          // ecode: '0011', // this.props.user.ecode,
          pageno: this.pageInfo.pageNo,
          pagesize: this.pageInfo.pageSize,
          // eventId: '69729fa9eeaf466d9e2c3de512e95a35',
        }
      },
    });
  }

  getCardList = () => {
    let result = [];
    if (this.props.points.data.length > 0) {
      this.props.points.data.forEach((item) => {
        result.push(
          <div className={styles.monitorCard}>
            <MonitorCard data={item} />
          </div>
        );
      });
    }
    return result;
  }

  render() {
    const cardList = this.getCardList();
    return (
      <PageHeaderLayout>
        <div className={styles.cardDiv}>
          {cardList}
        </div>
        <Pagination
          className={styles.page}
          showSizeChanger
          defaultCurrent={1}
          total={this.props.points.total}
          showTotal={(total, range) => `当前第${range[0]}至${range[1]}条，共${total}条数据`}
          onChange={(page, pageSize) => {
             this.pageInfo.pageNo = page;
             this.pageInfo.pageSize = pageSize;
             this.getMonitorData();
          }}
          onShowSizeChange={(current, size) => {
            this.pageInfo.pageNo = current;
            this.pageInfo.pageSize = size;
            this.getMonitorData();
          }}
        />
      </PageHeaderLayout>
    );
  }
}
