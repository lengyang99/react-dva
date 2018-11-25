import React, { PureComponent } from 'react';
import {routerRedux} from "dva/router";
import { connect } from 'dva';
import { Table } from 'antd';
import styles from './index.less';
import moment from "moment/moment";

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
  dataSource: state.ichAccountDetail.meterList,
}))
export default class List extends PureComponent {
  handleClick = (type, record) => {
    this.props.dispatch({
      type: 'ledger/setDisabled',
      payload: false,
    });
    this.props.dispatch({
      type: 'ledger/setErcodeImage',
      payload: 'block',
    });
    this.props.dispatch({
      type: 'ledger/fetchLedgerDetail',
      payload: record.eqGid,
      callback: (data) => {
        this.props.dispatch({
          type: 'ledger/editLedger',
          payload: {
            eqDetail: dataFormat(data),
            eqGid: data.gid,
            activeKey: 'ledger',
            isNewLedger: false,
          },
        });
        this.props.dispatch({
          type: 'ledger/setGis',
          payload: {
            gisId: data.gisCode,
            x: data.longitude,
            y: data.latitude,
          },
        });
      },
    });
    this.props.dispatch(routerRedux.push('/equipment/ledger'));
  };

  render() {
    const { dataSource } = this.props;
    const columns = [
      {
        title: '序号',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '表钢号',
        dataIndex: '表钢号',
        key: '表钢号',
      },
      {
        title: '合同号',
        dataIndex: '合同号',
        key: '合同号',
      },
      {
        title: '合同账户',
        dataIndex: '合同账户',
        key: '合同账户',
      },
      {
        title: '运行状态',
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: '安装位置',
        dataIndex: '安装位置',
        key: '安装位置',
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        render: (text, record) => (<span><a onClick={this.handleClick.bind(this, 'edit', record)}>详情</a></span>),
      },
    ];
    return (
      <div className={styles.list}>
        <Table
          columns={columns}
          dataSource={dataSource}
          rowKey={(record) => record.eqGid}
        />
      </div>
    );
  }
}
