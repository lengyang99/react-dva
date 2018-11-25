import React, { PureComponent } from 'react';
import { Table, Button } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';

const dataFormat = data => ({
  gid: data.gid,
  id: data.eqCode,
  name: data.eqName,
  classify: data.clsGid ? data.clsGid.toString() : undefined,
  classifyName: data.clsName,
  organization: data.ecode,
  organizationName: data.orgName,
  site: data.stationId ? data.stationId.toString() : undefined,
  area: data.workZone ? data.workZone.toString() : undefined,
  position: data.posId ? data.posId.toString() : undefined,
  positionName: data.posDesc,
  type: data.eqType ? data.eqType.toString() : undefined,
  perfect: data.goodGrads ? data.goodGrads.toString() : undefined,
  isSpecial: data.isSpclEq,
  parentId: data.parentId,
  parentName: data.parentName,
  model: data.model,
  company: data.instalUnit,
  manufacturer: data.manufacturer,
  installDate: data.instalDate,
  person: data.responsible,
  importantLevel: data.impDegree ? data.impDegree.toString() : undefined,
  user: data.changedby,
  productionDate: data.prodDate,
  code: data.serialNum,
  malfunction: data.failCode ? data.failCode.toString() : undefined,
  changedTime: data.changedbyTime ? moment(data.changedbyTime) : undefined,
  material: data.material,
  provider: data.supplier,
  qualityDate: data.qltyExp,
  fixedCode: data.fixAstsCode,
  status: data.eqStatus ? data.eqStatus.toString() : undefined,
  ewCodeUUID: data.ewCodeUUID,
  nextRepairDate: data.nextRepairDate,
  nextRepairLevel: data.nextRepairLevel,
  proDefineNumber: data.proDefineNumber,
  spareParts: data.spareParts,
  sparePartsAmount: data.sparePartsAmount,
  oldEqCode: data.oldEqCode,
  ccode: data.ccode,
});
@connect(state => ({
  filterOption: state.ichAccount.filterOption,
  connectedRegulator: state.ichAccountDetail.connectedRegulator,
  userDetail: state.ichAccountDetail.userDetail,
}))
class List extends PureComponent {
  handleClick = (record, type) => {
    switch (type) {
      case 'delete':
        this.props.dispatch({
          type: 'ichAccountDetail/deleteRegulator',
          payload: {
            gid: record.relationId,
          },
        });
        break;
      case 'detail':
        this.props.dispatch({
          type: 'ledger/setDisabled',
          payload: false,
        });
        this.props.dispatch({
          type: 'ledger/editLedger',
          payload: {
            eqDetail: dataFormat(record),
            eqGid: record.gid,
            activeKey: 'ledger',
            isNewLedger: false,
          },
        });
        this.props.dispatch({
          type: 'ledger/setErcodeImage',
          payload: 'block',
        });
        this.props.dispatch({
          type: 'ledger/setGis',
          payload: {
            gisId: record.gisCode,
            x: record.longitude,
            y: record.latitude,
          },
        });
        this.props.dispatch(routerRedux.push('/equipment/ledger'));
        break;
      default:
        break;
    }
  };
  handleShowTotal = (total, range) => {
    return `共${total}条记录 第${range[0]}/${range[1]}页`;
  };
  handleConnect = () => {
    this.props.dispatch({
      type: 'ichAccount/fetchRegulatorList',
      payload: {
        pageOption: this.props.filterOption,
      },
    });
  };
  render() {
    const { connectedRegulator } = this.props;
    const columns = [
      {
        title: '设备编码',
        dataIndex: 'eqCode',
        width: 164,
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
      },
      {
        title: '规格型号',
        dataIndex: 'model',
      },
      {
        title: '生产厂家',
        dataIndex: 'manufacturer',
      },
      {
        title: '位置',
        dataIndex: 'posDesc',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => {
          return (
            <span>
              <a onClick={this.handleClick.bind(this, record, 'delete')}>删除</a>
              <span className="divider" />
              <a onClick={this.handleClick.bind(this, record, 'detail')}>详情</a>
            </span>
          );
        },
      },
    ];
    return (
      <div>
        <div style={{ marginBottom: 20}}>
          <Button type="primary" onClick={this.handleConnect} icon="plus">关联调压器</Button>
        </div>
        <Table
          rowKey={record => record.gid}
          dataSource={connectedRegulator}
          columns={columns}
          // pagination={{
            // total: connectedRegulator.length || 0,
            // showTotal: this.handleShowTotal,
            // showQuickJumper: true,
            // pageSize: 10,
            // current: 1,
            // pageSizeOptions: ['10', '20', '30', '40'],
          // {/*}}*/}
          // onChange={this.handleTableChange}
        />
      </div>
    );
  }
}

export default List;
