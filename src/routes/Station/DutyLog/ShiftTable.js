import React, {Component} from 'react';
import {Table, Pagination} from 'antd';
import PropTypes from 'prop-types';
import {Link} from 'dva/router';


import styles from './ShiftTable.less';

class ShiftTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const columns = [
      {
        title: '站点',
        dataIndex: 'stationName',
      },
      {
        title: '日期',
        dataIndex: 'zbrq',
      }, {
        title: '班次',
        dataIndex: 'bc',
      },
      {
        title: '值班人',
        dataIndex: 'zbr',
      },
      {
        title: '接班时间',
        dataIndex: 'jiebansj',
      },
      {
        title: '交班时间',
        dataIndex: 'jiaobansj',
      },
      {
        title: '操作',
        render: (text, record, index) => {
          return (
            <div>
              <Link to={`/station/DutyDetail?action=read&zbrzid=${record.gid}`}>详情</Link>
            </div>
          );
        },
      }];

    const {totalCount, listCzZbrz} = this.props.listdata.data;
    // 表格分页
    const pagination = {
      total: totalCount,
      pageSizeOptions: ['10', '20', '30'],
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal(total, [start, end]) {
        return (<div style={{position: 'absolute', left: 10}}>
          共 {total} 条记录 当前第{start} 到 {end} 条
        </div>);
      },
    };
    return (
      <Table
        rowKey="gid"
        className={styles.table}
        columns={columns}
        dataSource={listCzZbrz}
        pagination={pagination}
        // loading={this.props.loading}
        onChange={this.props.onChange}
      />
    );
  }
}

ShiftTable.defaultProps = {
  listdata: '',
};

ShiftTable.propTypes = {
  listdata: PropTypes.object,
};

export default ShiftTable;
