import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table } from 'antd';

@connect(
  state => ({
    classification: state.sortmanagement.classification,
    pageNum: state.sortmanagement.equipmentPageList.pageNum,
    pageSize: state.sortmanagement.equipmentPageList.pageSize,
    total: state.sortmanagement.equipmentPageList.total,
    data: state.sortmanagement.equipmentPageList.list,
  })
)

class EquipmentList extends PureComponent {
  render() {
    const { pageNum, pageSize, total, data } = this.props;

    const columns = [{
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 40,
      render: (text, record, index) => {
        return (index + 1);
      },
    }, {
      title: '设备编码',
      dataIndex: 'eqCode',
      width: 200,
      key: 'eqCode',
    }, {
      title: '设备名称',
      dataIndex: 'eqName',
      key: 'eqName',
    }, {
      title: '位置',
      dataIndex: 'posName',
      key: 'posName',
    }, {
      title: '所属站点',
      dataIndex: 'stationName',
      key: 'stationName',
    }, {
      title: '状态',
      dataIndex: 'eqStatus',
      key: 'eqStatus',
    }, {
      title: '所属组织',
      dataIndex: 'orgName',
      key: 'orgName',
    }];

    const pagination = {
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: (total_, range) => {
        const totalRow = total_ % this.props.pageSize === 0 ? total_ % this.props.pageSize === 0 : Math.ceil(total_ / this.props.pageSize);
        return <div>共 {total_} 条记录 第{this.props.pageNum}/{totalRow}页</div>;
      },
      current: pageNum,
      pageSize: pageSize,
      total: total,
      onChange: (current, _pageSize) => {
        const queryParams = {
          clsGid: this.props.classification.gid,
          pageNum: current,
          pageSize: _pageSize,
        };
        this.props.dispatch({
          type: 'sortmanagement/queryEquipment',
          payload: queryParams,
        });
      },
      onShowSizeChange: (current, _pageSize) => {
        const queryParams = {
          clsGid: this.props.classification.gid,
          pageNum: current,
          pageSize: _pageSize,
        };
        this.props.dispatch({
          type: 'sortmanagement/queryEquipment',
          payload: queryParams,
        });
      },
    };

    return (
      <div>
        <Table rowKey="gid" columns={columns} dataSource={data} pagination={pagination} />
      </div>
    );
  }
}

export default EquipmentList;
