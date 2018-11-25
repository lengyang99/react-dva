import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'antd';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'dva';
import propTypes from 'prop-types';
import moment from 'moment';
import update from 'immutability-helper';
import { initOption } from './initOption';
import DropMenu from './DropMenu';

/**
 * @desc 提交数据格式化
 * @param {object} data - 需要格式化的数据
 * @return {object} - 返回格式化后的数据
 */
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
@connect(
  state => ({
    funs: state.login.funs,
    list: state.ledger.eqList,
    filterOption: state.ledger.filterOption,
    classifyList: state.ledger.classifyList,
    selectedRowKeys: state.ledger.selectedRowKeys,
    typeFilter: state.ledger.typeFilter,
    runStatus: state.ledger.ledgerLists.status,
    eqKindData: state.ledger.eqKindData,
    userid: state.login.user.id,
    ecode: state.login.user.ecode,
    filterVale: state.ledger.filterVale,
  })
)
export default class EQList extends PureComponent {
  static propTypes = {
    classifyList: propTypes.array.isRequired,
    list: propTypes.object.isRequired,
    filterOption: propTypes.object.isRequired,
    typeFilter: propTypes.array.isRequired,
  };

  componentDidMount() {
    const { userid, ecode } = this.props;
    // 获取台账列表
    this.props.dispatch({
      type: 'ledger/fetchLedger',
      payload: update(this.props.filterOption, {
        $merge: {
          pageNum: 1,
          pageSize: 10,
        },
      }),
    });
    this.props.dispatch({ type: 'ledger/fetchClassifyList' });
    this.props.dispatch({ type: 'ledger/getRunStatus' });
    // 获取组织树
    this.props.dispatch({type: 'ledger/fetchGroupTree', payload: {userid}});
    // 获取设备种类
    this.props.dispatch({type: 'ledger/fetchEqKindes', payload: ecode});
  }

  /**
   * @desc 列表点击事件
   * @param {string} type - 点击事件类型 ['edit', 'delete', 'gis']
   * @param {object} record
   */
  handleClick = (type, record) => {
    switch (type) {
      case 'edit':
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
        break;
      case 'takeALook':
        this.props.dispatch({
          type: 'ledger/setDisabled',
          payload: true,
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
        break;
      case 'delete':
        this.props.dispatch({
          type: 'ledger/deleteLedger',
          payload: {
            gid: record.gid,
            filterOption: this.props.filterOption,
          },
        });
        break;
      case 'gis':
        this.props.dispatch({
          type: 'ledger/setDisabled',
          payload: false,
        });
        this.props.dispatch({
          type: 'ledger/setGis',
          payload: {
            gisId: record.gisCode,
            x: record.longitude,
            y: record.latitude,
          },
        });
        this.props.dispatch({
          type: 'ledger/setEqDetail',
          payload: dataFormat(record),
        });
        this.props.dispatch({
          type: 'ledger/setEqActiveKey',
          payload: 'map',
        });
        break;
      default:
        console.log('can\'t reach it');
    }
  };

  /**
   * @desc 分页改变后获取台账列表
   * @param {number} current - 当前页
   * @param {number} size - 每页的数目大小
   */
  handleChange = (current, size) => {
    const filterOption = update(this.props.filterOption, { $merge: { pageNum: current, pageSize: size }});
    console.log(filterOption);
    this.props.dispatch({
      type: 'ledger/setFilterOption',
      payload: filterOption,
    });
    this.props.dispatch({
      type: 'ledger/fetchLedger',
      payload: filterOption,
    });
  };
  handleChangeTable = ({ current, pageSize }, filters, sorter) => {
    console.log(filters);
    if (sorter && sorter.field) {
      const sortField = sorter.field.split('').map(letter => (/[A-Z]/.test(letter) ? `_${letter.toLowerCase()}` : letter)).join('');
      const sortRule = sorter.order.replace('end', '');
      this.props.dispatch({
        type: 'ledger/fetchLedger',
        payload: update(this.props.filterOption, { $merge: { sortField, sortRule }}),
      });
    } else if (!isEmpty(filters)) {
      this.props.dispatch({
        type: 'ledger/setFilterVale',
        payload: {...filters},
      });
      this.props.dispatch({
        type: 'ledger/fetchLedgerWithFilter',
        payload: update(this.props.filterOption, {
          $merge: {
            ...this.props.filterOption,
            eqType: Array.isArray(filters.eqTypeName) ? filters.eqTypeName.join(',') : '',
            clsGids: Array.isArray(filters.clsName) ? filters.clsName.join(',') : '',
            eqStatus: (Array.isArray(filters.eqStatus) && filters.eqStatus.length !== 0) ? filters.eqStatus.join(',') : undefined,
            gisReportState: (Array.isArray(filters.gisReportState) && filters.gisReportState.length !== 0) ? filters.gisReportState.join(',') : undefined,
            eqKind: (Array.isArray(filters.eqKind) && filters.eqKind.length !== 0) ? filters.eqKind.join(',') : undefined,
            pageNum: current,
            pageSize,
          },
        }),
      });
    } else {
      const filterOption = update(this.props.filterOption, { $merge: { pageNum: current, pageSize }});
      this.props.dispatch({
        type: 'ledger/fetchLedger',
        payload: filterOption,
      });
    }
  };
  selectionOnchange = (selectedRowKeys) => {
    this.props.dispatch({
      type: 'ledger/setSelectedRowKeys',
      payload: selectedRowKeys,
    });
  };
  render() {
    const { list, selectedRowKeys, funs } = this.props;
    let ledger_edit = true; // 设备台账编辑
    let ledger_delete = true; // 设备台账删除
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code === 'ledger_edit') {
        ledger_edit = false;
      }
      if (json.code === 'ledger_delete') {
        ledger_delete = false;
      }
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: this.selectionOnchange,
    };
    const GISStatus = [
      {value: '0', text: '缺失上报'},
      {value: '1', text: '删除上报'},
      {value: '2', text: '修改上报'},
      {value: '3', text: '已反馈处理'},
      {value: '999', text: '未上报'},
    ];
    const columns = [
      {
        title: '设备编码',
        dataIndex: 'eqCode',
        width: 200,
        fixed: true,
        sorter: true,
      },
      {
        title: '设备名称',
        dataIndex: 'eqName',
        width: 100,
      },
      {
        title: '规格型号',
        dataIndex: 'model',
        width: 120,
      },
      {
        title: '生产厂家',
        dataIndex: 'manufacturer',
        width: 120,
      },
      {
        title: '位置',
        dataIndex: 'posDesc',
        width: 100,
      },
      {
        title: '分类',
        dataIndex: 'clsName',
        filters: this.props.typeFilter,
        filteredValue: this.props.filterVale.clsName,
        width: 120,
      },
      {
        title: '种类',
        dataIndex: 'eqKind',
        filters: Array.isArray(this.props.eqKindData) ? this.props.eqKindData.map(item => ({value: item, text: item})) : [],
        filteredValue: this.props.filterVale.eqKind,
        width: 120,
      },
      {
        title: '类型',
        dataIndex: 'eqTypeName',
        filters: this.props.classifyList,
        filteredValue: this.props.filterVale.eqTypeName,
        width: 120,
      },
      {
        title: '运行状态',
        dataIndex: 'eqStatus',
        filters: this.props.runStatus,
        filteredValue: this.props.filterVale.eqStatus,
        width: 120,
      },
      {
        title: 'GIS变更状态',
        dataIndex: 'gisReportState',
        filters: GISStatus,
        width: 160,
        render: (value) => {
          const item = GISStatus.find(ele => ele.value === value);
          return <span>{item ? item.text : '未上报'}</span>;
        },
      },
      {
        title: '原设备编码',
        dataIndex: 'oldEqCode',
        width: 164,
      },
      {
        title: '所属站点',
        dataIndex: 'stationName',
        width: 120,
      },
      {
        title: '操作',
        width: 120,
        render: (text, record) => (
          <span>
            <a onClick={this.handleClick.bind('', 'gis', record)}>GIS</a>
            <span className="divider" />
            <a disabled={ledger_edit} onClick={this.handleClick.bind('', 'edit', record)}>编辑</a>
            <span className="divider" />
            <Popconfirm title="确认要删除吗?" onConfirm={this.handleClick.bind('', 'delete', record)}>
              <a disabled={ledger_delete}>删除</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Table
        columns={columns}
        rowKey="gid"
        rowSelection={rowSelection}
        scroll={{ x: 1800 }}
        pagination={{
          current: list.pageNum,
          pageSize: list.pageSize,
          total: list.total,
          showSizeChanger: true,
          showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {list.total} </span>条</span>),
          pageSizeOptions: ['10', '20', '30', '40', '100'],
        }}
        onRow={record => ({
          onDoubleClick: this.handleClick.bind('', 'takeALook', record),
        })}
        dataSource={list.list}
        onChange={this.handleChangeTable}
      />
    );
  }
}
