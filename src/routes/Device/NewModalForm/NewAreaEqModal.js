import React, { PureComponent } from 'react';
import { Modal, Table, Card} from 'antd';
import SearchBar from './SearchBar';

export default class NewAreaEqModal extends PureComponent {
  searchBar = null;
  // 根据条件查询设备
  queryEqAreaData = (params = {}) => {
    const { functionKey, areaId, functionGroup, workObjectType} = this.props;
    const { others, isConnectPlan, propertys, parameters } = this.searchBar.state ;
    const searchParams = {
      areaId: !areaId || areaId === '' ? null : areaId,
      others,
      functionKey,
      isConnectPlan,
      propertys,
      parameters,
      ...params };
    this.props.dispatch({
      type: `device/${functionGroup === 'household' && workObjectType !== 1 ? 'queryAreaGsh' : 'queryAreaEq'}`,
      payload: {
        pageno: 1,
        pagesize: this.props.pagesize,
        ...searchParams,
      },
    });
    this.props.onPaginationChange({pageno: 1});
  }
  // 分页
  handleTableChage2 = (pagination) => {
    const params = {
      pageno: pagination.current,
      pagesize: pagination.pageSize,
    };
    this.queryEqAreaData({ pageno: params.pageno, pagesize: params.pagesize });
    this.props.onPaginationChange(params);
  }
  getPageSizeByTotal = (total) => {
    if (total >= 0 && total < 100) {
      return ['10', '20', '30', '40'];
    } else if (total >= 100 && total < 500) {
      return ['50', '100', '200', '400'];
    } else if (total >= 500 && total < 5000) {
      return ['100', '500', '1000', '2000'];
    } else if (total >= 5000 && total < 10000) {
      return ['1000', '2000', '3000', '4000'];
    } else if (total >= 10000) {
      return ['10000', '15000', '20000', '25000'];
    }
  }
  render() {
    const { areaEqVisible, eqTableLoading, rowSelection, handleBoxCheck, pagination,
      areaEqData, handleCancel, handleOk, handleTableChage, columns, checked} = this.props;
    return (
      <Modal
        visible={areaEqVisible}
        title="关联设备"
        maskClosable={false}
        onOk={() => handleOk(2)}
        onCancel={() => handleCancel(2)}
        width={1060}
        style={{left: 80, top: 90}}
        bodyStyle={{maxHeight: 500, overflow: 'auto'}}
      >
        <Card title={
          <SearchBar
            {...this.props}
            ref={ref => { this.searchBar = ref; }}
            checked={checked}
            handleBoxCheck={handleBoxCheck}
            queryEqAreaData={this.queryEqAreaData}
          />}
        >
          <Table
            columns={columns}
            dataSource={areaEqData}
            loading={eqTableLoading}
            pagination={pagination}
            onChange={!checked ? this.handleTableChage2 : handleTableChage}
            rowKey={records => records.eqCode}
            rowClassName={this.rowClassName}
            rowSelection={rowSelection}
            bordered
          />
        </Card>
      </Modal>
    );
  }
}
