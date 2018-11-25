import React, { PureComponent } from 'react';
import { stringify } from 'qs';
import { Table, DatePicker, Input, Button, Divider, InputNumber, message, Spin, Checkbox, Icon, Tabs, Row, Col, Modal, Select } from 'antd';
import { connect } from 'dva';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

import styles from './meterTaskResult.less';
import SelectPanel from '../../commonTool/SelectPanelTool/SelectPanel';

const OrderButton = ({ title = '', btUp = '', btDown = '', queryFunc = () => { } }) => {
  return (
    <span>{title}
      <span className={btUp} onClick={() => {
        if (title === '抄表日期') {
          queryFunc('meterReadTimeAsc');
        } else if (title === '抄表人') {
          queryFunc('meterReaderAsc');
        }
      }}></span>
      <span className={btDown} onClick={() => {
        if (title === '抄表日期') {
          queryFunc('meterReadTimeDesc');
        } else if (title === '抄表人') {
          queryFunc('meterReaderDesc');
        }
      }}></span>
    </span>
  );
}

const Option = Select.Option;
const { RangePicker } = DatePicker;
const confirm = Modal.confirm;
const TabPane = Tabs.TabPane;
const dateFormat = 'YYYY-MM-DD';
const defaultState = {
  // 查询条件
  startTime: null,
  endTime: null,
  quickParam: '', // 快速搜索
  contractAccount: '', // 合同账户
  feedbackName: '', // 抄表人
  eqName: '', // 表钢号
  meterReadTime: 'sd', // 抄表日期
  isbackpass: null, // 是否提交到CSS
};

message.config({
  top: 300,
  duration: 2,
});

@connect(state => ({
  user: state.login.user,
  dataSouce: state.meterTaskResult.data,
  token: state.login.token,
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
    };
    this.orderType = null; // 排序规则
    this.orderFlag = true; // 排序是否开启
    this.queryData();
  }
  queryData = () => {
    this.props.dispatch({
      type: 'meterTaskResult/getResInfo',
      payload: {
        ecode: this.props.user.ecode,
        param: this.state.quickParam,
        contractAccount: this.state.contractAccount,
        meterReader: this.state.feedbackName,
        eqName: this.state.eqName,
        stime: this.state.startTime,
        etime: this.state.endTime,
        pageno: this.state.pageParam.pageno,
        pagesize: this.state.pageParam.pagesize,
        isBackpass: this.state.isbackpass,
        orderType: this.orderType,
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
  edit(key, num, funkey) {
    this.setState({
      editData: {
        rowKey: key,
        this_num: num,
        business_key: funkey,
      },
    }, () => {
      this.setState({
        editDialog: true,
      });
      console.log(this.state.editData);
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
    const businessKey = this.state.editData.business_key;
    fd.append('rowKey', rowKey);
    fd.append('this_num', thisNum);
    fd.append('businesskey', businessKey);

    this.props.dispatch({
      type: 'meterTaskResult/editThisNum',
      payload: fd,
      callback: (res) => {
        if (res.success) {
          message.info('数据编辑成功！');
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
        } else {
          message.info('数据编辑失败！');
          this.setState({
            loading: false,
            editDialog: false,
          });
        }
      },
    });
  };
  // 表格提交操作
  commit = (record) => {
    const that = this;
    const data = [{
      adattats: record.meterReadTime.substr(0, 10).replace(/-/g, ''),
      gernr: record.gernr,
      ablbelnr: record.ablbelnr,
      ablgr_ent: '01',
      zwstand: record.thisNum,
      meterused: record.thisLiquidNum,
    }];
    confirm({
      title: '是否确认数据提交到CCS用于结算？',
      onOk() {
        that.dispatchData(data);
      },
      onCancel() {
      },
    });
  };
  // 批量提交
  commitDatas = () => {
    const that = this;
    const rows = this.state.rowSelection.selectRows;
    const datas = [];
    for (let i = 0; i < rows.length; i++) {
      datas.push({
        adattats: rows[i].meterReadTime.substr(0, 10).replace(/-/g, ''),
        gernr: rows[i].gernr,
        ablbelnr: rows[i].ablbelnr,
        ablgr_ent: '01',
        zwstand: rows[i].thisNum,
        meterused: rows[i].thisLiquidNum,
      });
    }
    confirm({
      title: '是否确认数据提交到CCS用于结算？',
      onOk() {
        that.dispatchData(datas);
      },
      onCancel() {
      },
    });
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
          message.info(res.msg);
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
      }
    });
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
    const businesskey = this.state.editData.business_key;
    this.setState({
      editData: {
        rowKey: key,
        this_num: value,
        business_key: businesskey,
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

  // excel导出服务
  // reportExcel = () => {
  //   const params = {
  //     ecode: this.props.user.ecode,
  //     param: this.state.quickParam,
  //     contract_account: this.state.contractAccount,
  //     feedback_name: this.state.feedbackName,
  //     eq_name: this.state.eqName,
  //     arrive_time_start: this.state.startTime,
  //     arrive_time_end: this.state.endTime,
  //     pageno: this.state.pageParam.pageno,
  //     pagesize: this.state.pageParam.pagesize,
  //   };
  //   this.props.dispatch(routerRedux.push('/proxy/gshMeterReading/meterReadingLedgerExportExcel?' + stringify(params)));
  //   // this.props.dispatch({
  //   //   type: 'meterTaskResult/reportExcel',
  //   //   payload: {
  //   //     ecode: this.props.user.ecode,
  //   //     param: this.state.quickParam,
  //   //     contract_account: this.state.contractAccount,
  //   //     feedback_name: this.state.feedbackName,
  //   //     eq_name: this.state.eqName,
  //   //     arrive_time_start: this.state.startTime,
  //   //     arrive_time_end: this.state.endTime,
  //   //     pageno: this.state.pageParam.pageno,
  //   //     pagesize: this.state.pageParam.pagesize,
  //   //   },
  //   //   callback: (res) => {
  //   //     // console.log(res);
  //   //     // if (res.success) {
  //   //     //   message.info('数据导出成功！');
  //   //     // } else {
  //   //     //   message.info('数据导出失败！');
  //   //     // }
  //   //   },
  //   // });
  // };

  // 获取导出服务的参数
  getReportParam = () => {
    const params = {
      ecode: this.props.user.ecode,
      param: this.state.quickParam,
      contractAccount: this.state.contractAccount,
      meterReader: this.state.feedbackName,
      eqName: this.state.eqName,
      stime: this.state.startTime,
      etime: this.state.endTime,
      isBackpass: this.state.isbackpass,
      pageno: this.state.pageParam.pageno,
      pagesize: this.state.pageParam.pagesize,
      token: this.props.token,
    };
    return params;
  };
  // 抄表日期改变
  meterReadTimeChange = (valueObj) => {
    this.setState({
      meterReadTime: valueObj.value,
    });
    let startTime = null;
    let endTime = null;
    switch (valueObj.value) {
      case 'td':
        startTime = moment().startOf('day');
        endTime = moment().endOf('day');
        break;
      case 'yd':
        startTime = moment().subtract(1, 'day').startOf('day');
        endTime = moment().subtract(1, 'day').endOf('day');
        break;
      case 'tm':
        startTime = moment().startOf('month');
        endTime = moment().endOf('month');
        break;
      case 'ym':
        startTime = moment().subtract(1, 'month').startOf('month');
        endTime = moment().subtract(1, 'month').endOf('month');
        break;
      default:
        startTime = null;
        endTime = null;
        break;
    }
    startTime = startTime ? startTime.format(dateFormat) : startTime;
    endTime = endTime ? endTime.format(dateFormat) : endTime;
    this.setState({
      startTime, endTime
    });
  }
  // 是否已经提交到CSS
  handleIsReturn = (value) => {
    this.setState({ isbackpass: value });
  }
  // 排序规则改变
  orderTypeChange = (value) => {
    if (this.orderType === value) {
      return;
    }
    if (this.orderFlag) {
      this.orderFlag = false;
      this.orderType = value;
      this.queryData();
      this.orderType = null;
    }
  }
  render() {
    const that = this;
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
      title: '用户名称',
      dataIndex: 'houseHoldName',
    }, {
      title: '客户号',
      dataIndex: 'houseHoldCode',
    }, {
      title: '合同账户',
      dataIndex: 'contractAccount',
    }, {
      title: '合同号',
      dataIndex: 'contractCode',
    }, {
      title: '表钢号',
      dataIndex: 'eqName',
    }, {
      title: '地址',
      dataIndex: 'posDesc',
    }, {
      title: '抄表日期',
      dataIndex: 'meterReadTime',
      sorter: (a, b) => {
        if (moment(a.meterReadTime).isBefore(b.meterReadTime)) {
          return -1;
        } else {
          return 1;
        }
      }
    }, {
      title: '抄表人',
      dataIndex: 'meterReader',
      sorter: (a, b) => {
        return a.meterReader.localeCompare(b.meterReader, 'zh-CN');
      }
    }, {
      title: '上次表底数',
      dataIndex: 'lastNum',
    }, {
      title: '本次表底数',
      dataIndex: 'thisNum',
      editable: true,
    }, {
      title: '期间气量',
      dataIndex: 'periodOfGas',
    }, {
      title: '抄表类型',
      dataIndex: 'meterReadType',
      filters: [{
        text: '结算抄表',
        value: '结算抄表',
      }, {
        text: '临时抄表',
        value: '临时抄表',
      }, {
        text: '常规抄表',
        value: '常规抄表',
      }],
      onFilter: (value, record) => record.meterReadType.indexOf(value) === 0,
    }, {
      title: '是否周转表',
      dataIndex: 'isCycleMeter',
      filters: [{
        text: '是',
        value: '是',
      }, {
        text: '否',
        value: '否',
      }],
      onFilter: (value, record) => record.isCycleMeter.indexOf(value) === 0,
    }, {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => {
        const isCommitable = record.isGoldMeter === '否' && record.meterReadType === '结算抄表' && record.isBackpass === '否' && record.isBackToCcs === '是';
        const rows = [];
        rows.push(record);
        return (
          <div>
            <a onClick={() => this.edit(record.rowKey, record.thisNum, record.feedbackId)}>编辑</a>
            <Divider type="vertical" />
            {isCommitable ? (
              <a onClick={() => this.commit(record)}>提交</a>
            ) : (<span style={{ fontColor: '#999' }}>已提交</span>)}
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
        }, () => {
          this.queryData();
        });
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
          <Col span={10} style={{ textAlign: 'center' }}>
            <p>{item.text}</p>
          </Col>
        </Row>
      );
    });
    const TaskTimeData = [
      { name: '今日', value: 'td', more: '', showDot: true },
      { name: '昨日', value: 'yd', more: '', showDot: true },
      { name: '本月', value: 'tm', more: '', showDot: true },
      { name: '上月', value: 'ym', more: '', showDot: true },
      { name: '自定义', value: 'sd', more: '', showDot: true }
    ];
    return (
      <PageHeaderLayout>
        <div style={{ backgroundColor: '#fff' }}>
          <Row span={24} style={{ marginBottom: 10, display: 'block' }}>
            <span className={styles['font-style']}>
              <span style={{ display: 'inline-block', width: 400, position: 'relative', top: 11 }}>
                <SelectPanel fieldName="抄表日期" value={this.state.meterReadTime} dataType="ddl" showMoreInfo={false}
                  data={TaskTimeData} onclick={this.meterReadTimeChange} />
              </span>
              <span style={{ position: 'relative', top: 0 }}>
                <RangePicker
                  style={{ width: 330 }}
                  allowClear={false}
                  value={[this.state.startTime ? moment(this.state.startTime, dateFormat) : null, this.state.endTime ? moment(this.state.endTime, dateFormat) : null]}
                  format={dateFormat}
                  onChange={this.dateOnChange}
                />
              </span>
            </span>
          </Row>
          <Row key="topdiv_row" span={24} style={{ paddingTop: 5 }}>
            <Col span={14}>
              <span
                className={styles['font-style']}
              >快速搜索：</span>
              <Input
                style={{
                  width: 330,
                }}
                value={this.state.quickParam}
                placeholder="合同账户、合同号、表钢号、地址、抄表人"
                onChange={this.quickParamChange}
              />
            </Col>
            <Col span={10}>
              <Button style={{ marginRight: 20 }} type="primary" onClick={this.queryData}>查询</Button>
              <Button onClick={this.resetHandle}>重置</Button>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggle}>
                {this.state.expand ? '收起' : '高级查询'}<Icon type={this.state.expand ? 'up' : 'down'} />
              </a>
            </Col>
          </Row>
          <Row
            key="middlediv_row"
            style={{ marginTop: 11, paddingBottom: 10 }}
            span={24}
          >
            <Col span={this.state.expand ? 14 : 0}>
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
            <Col span={10}>
              <Button style={{ marginRight: 20 }} type="primary" onClick={this.commitDatas}>提交</Button>
              <Button
                type="primary"
                // onClick={this.reportExcel}
                href={`${window.location.origin}/proxy/gshMeterReading/meterReadingLedgerExportExcel?${stringify({ ...this.getReportParam() })}`}
              >导出</Button>
            </Col>
          </Row>
          <Row span={24} style={{ marginBottom: 10, display: this.state.expand ? 'block' : 'none' }}>
            <span className={styles['font-style']} >表钢号：</span>
            <Input
              id="bgh_input"
              style={{ marginRight: 20, marginLeft: 14, width: 200 }}
              onChange={this.bghChange}
              value={this.state.eqName}
            />
            <span className={styles['font-style']}>是否已经提交到CCS：</span>
            <Select
              onChange={this.handleIsReturn}
              value={this.state.isbackpass}
              style={{ width: 60 }}
            >
              <Option key={1} value={1}>是</Option>
              <Option key={0} value={0}>否</Option>
            </Select>
          </Row>
          <Row key="table_row">
            <Col span={this.state.isShowInfo ? 21 : 24}>
              <Table
                rowSelection={rowSelection}
                scroll={{ x: 1500 }}
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
                        style={{ width: 60, color: '#000' }}
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
      </PageHeaderLayout>
    );
  }
}
