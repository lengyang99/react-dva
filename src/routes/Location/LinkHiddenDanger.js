import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Table } from 'antd';
import LinkHeader from './subcomponent/LinkHeader';

class LinkHiddenDanger extends PureComponent {
  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: '',
      },
      {
        title: '隐患编号',
        dataIndex: 'eventid',
      },
      {
        title: '隐患名称',
        dataIndex: '',
      },
      {
        title: '隐患等级',
        dataIndex: '',
      },
      {
        title: '隐患位置',
        dataIndex: 'address',
      },
      {
        title: '发生日期',
        dataIndex: 'reporttime',
      },
      {
        title: '状态',
        dataIndex: 'state',
      },
      {
        title: '所属站点',
        dataIndex: 'locName',
      },
      {
        title: '所属机构',
        dataIndex: 'companyName',
      },
    ];
    const { locName, locType } = this.props.BasicMessageValue;
    const { hiddenlistData, hiddenTotalPage, hiddenPageChange } = this.props;
    return (
      <div>
        <LinkHeader
          locName={locName}
          locType={locType}
        />
        <Table
          columns={columns}
          rowKey="eventid"
          dataSource={hiddenlistData}
          pagination={{
            total: hiddenTotalPage,
            onChange: hiddenPageChange,
            showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {hiddenTotalPage} </span>条</span>),
          }}
        />
      </div>
    );
  }
}

LinkHiddenDanger.propTypes = {
  BasicMessageValue: propTypes.object,
  hiddenlistData: propTypes.array,
  hiddenTotalPage: propTypes.number,
  hiddenPageChange: propTypes.func.isRequired,
};

LinkHiddenDanger.defaultProps = {
  BasicMessageValue: {},
  hiddenlistData: [],
  hiddenTotalPage: 0,
};

export default LinkHiddenDanger;
