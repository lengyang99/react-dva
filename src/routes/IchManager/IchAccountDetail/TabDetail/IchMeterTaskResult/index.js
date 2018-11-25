import React, { PureComponent } from 'react';
import { Table, DatePicker, Input, Button, Divider, InputNumber, message, Spin, Checkbox, Icon, Tabs, Row, Col } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import Dialog from '../../../../../components/yd-gis/Dialog/Dialog';

import styles from './index.less';
import {stringify} from "qs";

const { RangePicker } = DatePicker;
const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const defaultState = {
  // 查询条件
  startTime: moment(new Date()).add('days', -30).format(dateFormat),
  endTime: moment(new Date()).format(dateFormat),
  quickParam: '', // 快速搜索
  contractAccount: '', // 合同账户
  feedbackName: '', // 抄表人
  eqName: '', // 表钢号
};

message.config({
  top: 300,
  duration: 2,
});

@connect(state => ({
  user: state.login.user,
  dataSouce: state.meterTaskResult.data,
  token: state.login.token,
  userDetail: state.ichAccountDetail.userDetail,
}))

export default class MeterTaskResult extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSouce: [],
      rowSelection: {
        rowKeys: [],
        selectRows: [], // 选中的行
      },
      editDialog: false,
      editData: {}, // 编辑中的数据
      loading: false,
      expand: false, // 高级查询收起
      isShowInfo: false,
      items: [{
        name: 'shangqidubiaoshu',
        alias: '上期机械表读数',
        value: 333.3,
      }],
      // 分页器参数
      pageParam: {
        pageno: 1,
        pagesize: 20,
      },
      total: 0, // 记录总数
      ...defaultState,
      quickParam: this.props.userDetail.contractAccount,
    };

    this.queryData();
  }
  queryData = () => {
    const {userDetail} = this.props;
    console.log(userDetail);
    this.props.dispatch({
      type: 'meterTaskResult/getResInfo',
      payload: {
        ecode: this.props.user.ecode,
        param: userDetail.contractAccount,
        contract_account: this.state.contractAccount,
        feedback_name: this.state.feedbackName,
        eq_name: this.state.eqName,
        arrive_time_start: this.state.startTime,
        arrive_time_end: this.state.endTime,
        pageno: this.state.pageParam.pageno,
        pagesize: this.state.pageParam.pagesize,
      },
      callback: (data) => {
        // console.log(data.data);
        this.setState({
          dataSouce: data.list,
          loading: false,
          total: data.total,
        });
      },
    });
  };

  // 表格编辑操作
  edit(key, num) {
    this.setState({
      editData: {
        rowKey: key,
        this_num: num,
      },
      editDialog: true,
    });
  }
  // 编辑确认按钮点击
  editConfirm = () => {
    // this.setState({
    //   loading: true,
    // });
    const fd = new FormData();
    const rowKey = this.state.editData.rowKey;
    const thisNum = this.state.editData.this_num.toFixed(3);
    fd.append('rowKey', rowKey);
    fd.append('this_num', thisNum);
    this.props.dispatch({
      type: 'meterTaskResult/editThisNum',
      payload: fd,
      callback: (res) => {
        const rows = this.state.dataSouce;
        for (let i = 0; i < rows.length; i++) {
          if (rows[i].rowKey === rowKey) {
            // 重新计算期间气量
            rows[i].this_num = thisNum;
            rows[i].period_of_gas = (thisNum - rows[i].last_num).toFixed(3);
          }
        }
        this.setState({
          loading: false,
          editDialog: false,
          dataSouce: rows,
        });
        if (res.success) {
          message.info('数据编辑成功！');
        } else {
          message.info('数据编辑失败！');
        }
      },
    });
  };
  // 表格提交操作
  commit = (record) => {
    const data = [{
      adattats: record.arrive_time.substr(0, 10).replace(/-/g, ''),
      gernr: record.gernr,
      ablbelnr: record.ablbelnr,
      ablgr_ent: '01',
      zwstand: record.this_num,
      meterused: record.this_liquid_num,
    }];
    this.dispatchData(data);
  };
  // 批量提交
  commitDatas = () => {
    const rows = this.state.rowSelection.selectRows;
    const datas = [];
    for (let i = 0; i < rows.length; i++) {
      datas.push({
        adattats: rows[i].arrive_time.substr(0, 10).replace(/-/g, ''),
        gernr: rows[i].gernr,
        ablbelnr: rows[i].ablbelnr,
        ablgr_ent: '01',
        zwstand: rows[i].this_num,
        meterused: rows[i].this_liquid_num,
      });
    }
    this.dispatchData(datas);
  };
  // 提交数据
  dispatchData = (datas) => {
    const fd = new FormData();
    fd.append('pushTasks', JSON.stringify(datas));
    this.props.dispatch({
      type: 'meterTaskResult/commitResult',
      payload: fd,
      callback: (res) => {
        // console.log(res);
        if (res.success) {
          message.info('数据提交成功！');
        } else {
          message.info('数据提交失败！');
        }
      },
    });
  };
  // 表格行选择
  onSelectChange = (selectedRowKeys, selectedRows) => {
    // key.push(Keys);
    this.setState({
      rowSelection: {
        rowKeys: selectedRowKeys,
        selectRows: selectedRows,
      }});
  };

  // 编辑窗口取消
  onCancel = () => {
    this.setState({
      editData: {},
      editDialog: false,
    });
  };
  // 编辑窗口 InputNumber改变
  onEditNumChange = (value) => {
    const key = this.state.editData.rowKey;
    this.setState({
      editData: {
        rowKey: key,
        this_num: value,
      },
    });
  };

  // 重置按钮点击
  resetHandle = () => {
    this.setState(defaultState);
  };
  // 快速搜索input修改
  quickParamChange = (target) => {
    this.setState({
      quickParam: target.target.value,
    });
  };
  // 合同账户input修改
  htzhChange = (target) => {
    this.setState({
      contractAccount: target.target.value,
    });
  };
  // 抄表人input修改
  cbrChange = (target) => {
    this.setState({
      feedbackName: target.target.value,
    });
  };
  // 表钢号input修改
  bghChange = (target) => {
    this.setState({
      eqName: target.target.value,
    });
  };
  // 获取导出服务的参数
  getReportParam = () => {
    const params = {
      ecode: this.props.user.ecode,
      param: this.state.quickParam,
      contract_account: this.state.contractAccount,
      feedback_name: this.state.feedbackName,
      eq_name: this.state.eqName,
      arrive_time_start: this.state.startTime,
      arrive_time_end: this.state.endTime,
      pageno: this.state.pageParam.pageno,
      pagesize: this.state.pageParam.pagesize,
      token: this.props.token,
    };
    return params;
  };
  // 抄表日期修改
  dateOnChange = (date, dateStr) => {
    this.setState({
      startTime: dateStr[0],
      endTime: dateStr[1],
    });
  };
  // 收缩按钮点击
  toggle = () => {
    this.setState({
      expand: !this.state.expand,
    });
  };

  // 表格双击事件
  dbClickRow = (record) => {
    this.setState({
      isShowInfo: true,
      items: record.items,
    });
  };
  // 反馈详情取消界面
  delHandler = () => {
    this.setState({
      isShowInfo: false,
    });
  };
  render() {
    const rowSelection = {
      selectedRowKeys: this.state.rowSelection.rowKeys,
      onChange: this.onSelectChange,
      getCheckboxProps: (record) => {
        const isBack = record.isbackpass === '否';
        // 设置显示一共几条数据
        return (
          <div>
            {isBack ? (
              <Checkbox />
            ) : null}
          </div>
        );
      },
    };

    const columns = [{
      title: '合同账号描述',
      dataIndex: 'contract_account_desc',
    }, {
      title: '合同账号',
      dataIndex: 'contract_account',
    }, {
      title: '合同号',
      dataIndex: 'contract_code',
    }, {
      title: '表钢号',
      dataIndex: 'eq_name',
    }, {
      title: '地址',
      dataIndex: 'pos_desc',
    }, {
      title: '抄表日期',
      dataIndex: 'arrive_time',
    }, {
      title: '抄表人',
      dataIndex: 'feedback_name',
    }, {
      title: '上次表底数',
      dataIndex: 'last_num',
    }, {
      title: '本次表底数',
      dataIndex: 'this_num',
      editable: true,
    }, {
      title: '期间气量',
      dataIndex: 'period_of_gas',
    }, {
      title: '抄表类型',
      dataIndex: 'meter_read_type',
      filters: [{
        text: '结算抄表',
        value: '结算抄表',
      }, {
        text: '周转抄表',
        value: '周转抄表',
      }, {
        text: '日常抄表',
        value: '日常抄表',
      }],
      onFilter: (value, record) => record.meter_read_type.indexOf(value) === 0,
    }, {
      title: '是否周转表',
      dataIndex: 'is_cyclicity_meter',
      filters: [{
        text: '是',
        value: '是',
      }, {
        text: '否',
        value: '否',
      }],
      onFilter: (value, record) => record.is_cyclicity_meter.indexOf(value) === 0,
    }, {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => {
        const isCommitable = record.is_cyclicity_meter === '否' && record.isbackpass === '否';
        const rows = [];
        rows.push(record);
        return (
          <div>
            <a onClick={() => this.edit(record.rowKey, record.this_num)}>编辑</a>
            <Divider type="vertical" />
            {isCommitable ? (
              <a onClick={() => this.commit(rows)}>提交</a>
            ) : (<span style={{fontColor: '#999'}}>提交</span>)}
          </div>
        );
      },
    }];
    // 表格分页
    const pagination = {
      total: this.state.total,
      current: this.state.pageParam.pageno,
      pageSize: this.state.pageParam.pagesize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      onShowSizeChange: (current, pageSize) => {
        this.setState({
          pageParam: {
            pageno: current,
            pagesize: pageSize,
          },
        });
        this.queryData();
      },
      onChange: (current, pageSize) => {
        this.setState({
          dataSouce: [],
          pageParam: {
            pageno: current,
            pagesize: pageSize,
          },
        });
        this.queryData();
      },
      showTotal: () => {
        // 设置显示一共几条数据
        return <div>共 {this.state.total} 条数据</div>;
      },
    };

    const DialogCamp = this.state.editDialog ? (
      <Dialog
        title="数据编辑"
        width={350}
        onClose={this.onCancel}
        position={{ top: 250, left: 700 }}
      >
        <div style={{ marginTop: 15 }}>
          <span className={styles['font-style']}>本次表底数：</span>
          <InputNumber style={{ width: 200 }} defaultValue={this.state.editData.this_num} step={0.001} onChange={this.onEditNumChange} />
        </div>
        <Button style={{ marginTop: 15, marginBottom: 12, marginLeft: 130 }} type="primary" onClick={this.editConfirm}>确认</Button>
      </Dialog>
    ) : null;
    const loadingCamp = this.state.loading ? (
      <Spin style={{ left: 700 }} tip="Loading..." size="large" />
    ) : null;
    const itemCamp = this.state.items.map((item, index) => {
      return (
        <Row key={index}>
          <Col span={14}>
            <p>
              <span>{item.alias}</span>
              <span>:</span>
            </p>
          </Col>
          <Col span={10} style={{textAlign: 'center'}}>
            <p>{item.text}</p>
          </Col>
        </Row>
      );
    });
    return (
      <div>
        <div style={{ backgroundColor: '#fff' }}>
          <Row key="topdiv_row" span={24} style={{ paddingTop: 12 }}>
            <span
              className={styles['font-style']}
            >快速搜索：</span>
            <Input
              style={{
                marginRight: 363,
                width: 330,
              }}
              value={this.state.quickParam}
              placeholder="合同账户、合同号、表钢号、地址、抄表人"
              onChange={this.quickParamChange}
            />
            <Button style={{marginRight: 20}} type="primary" onClick={this.queryData}>查询</Button>
            <Button onClick={this.resetHandle}>重置</Button>
            <a style={{marginLeft: 8, fontSize: 12}} onClick={this.toggle}>
              {this.state.expand ? '收起' : '高级查询'}<Icon type={this.state.expand ? 'up' : 'down'} />
            </a>
          </Row>
          <Row
            key="middlediv_row"
            style={{marginTop: 10, paddingBottom: 10}}
            span={24}
          >
            <Col span={this.state.expand ? 11 : 0}>
              <span className={styles['font-style']} >合同账户：</span>
              <Input
                id="htzh_input"
                style={{ marginRight: 20, width: 200 }}
                value={this.state.contractAccount}
                onChange={this.htzhChange}
              />
              <span className={styles['font-style']} >抄表人：</span>
              <Input
                id="cbr_input"
                style={{ marginRight: 50, marginLeft: 14, width: 200 }}
                value={this.state.feedbackName}
                onChange={this.cbrChange}
              />
            </Col>
            <Col span={13}>
              <Button style={{marginRight: 20}} type="primary" onClick={this.commitDatas}>提交</Button>
              <Button
                type="primary"
                href={`${window.location.origin}/proxy/gshMeterReading/meterReadingLedgerExportExcel?${stringify({ ...this.getReportParam() })}`}
              >导出</Button>
            </Col>
          </Row>
          <Row span={24} style={{ marginBottom: 10, display: this.state.expand ? 'block' : 'none' }}>
            <span className={styles['font-style']} >表钢号：</span>
            <Input
              id="bgh_input"
              style={{ marginRight: 20, marginLeft: 14, width: 200}}
              onChange={this.bghChange}
              value={this.state.eqName}
            />
            <span className={styles['font-style']} >抄表日期：</span>
            <RangePicker
              style={{width: 330}}
              allowClear={false}
              value={[moment(this.state.startTime, dateFormat), moment(this.state.endTime, dateFormat)]}
              format={dateFormat}
              onChange={this.dateOnChange}
            />
          </Row>
          <Row key="table_row">
            <Col span={this.state.isShowInfo ? 21 : 24}>
              <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={this.state.dataSouce}
                rowKey="rowKey"
                pagination={pagination}
                onRow={(record) => {
                  return {
                    onDoubleClick: () => { this.dbClickRow(record); }, // 双击行查看详情
                  };
                }}
              />
            </Col>
            <Col span={this.state.isShowInfo ? 3 : 0}>
              <Tabs defaultActiveKey="1" size="small">
                <TabPane
                  tab={
                    <span>
                      反馈详情
                      <Icon
                        type="close"
                        style={{width: 60, color: '#000'}}
                        onClick={() => {
                          this.delHandler();
                        }}
                      />
                    </span>}
                  key="1"
                >{itemCamp}</TabPane>
              </Tabs>
            </Col>
          </Row>
        </div>
        {DialogCamp}
        {loadingCamp}
      </div>
    );
  }
}
