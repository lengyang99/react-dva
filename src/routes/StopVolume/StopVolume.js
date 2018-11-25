import React, { PureComponent } from 'react';
import { Button, message, Table, Input, Select, Icon, DatePicker, Tooltip, Spin } from 'antd';
import { connect } from 'dva';
import fetch from 'dva/fetch';
import { routerRedux, Link } from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import { stringify } from 'qs';
import { getCurrTk } from '../../utils/utils.js';
import styles from './StopVolume.less';
const Option = Select.Option;

@connect(({ stopVolume, login }) => ({
  data: stopVolume.dataList,
  type: stopVolume.type,
  user: login.user || []
}))

export default class StopVolume extends PureComponent {
  state = {
    loading: true,
    downLoading: false, //导出加载
    isExpand: false,
    total: 0,
    condition: '',//工单编号
    type: '全部',//业务类型
    starttime: '',
    endtime: '',
    current: 1,
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'stopVolume/getList',
      params: { pageno: 1, pagesize: 10 },
      callback: ({ total }) => {
        this.setState({
          total: total,
        });
      }
    });

    this.props.dispatch({
      type: 'stopVolume/getType',
    });
    this.setState({
      loading: false,
    });
  }

  //搜索
  query = () => {
    this.setState({
      loading: true,
      current: 1,
    });
    let param = this.getParam();
    this.props.dispatch({
      type: 'stopVolume/getList',
      params: param,
      callback: ({ total }) => {
        this.setState({
          loading: false,
          total: total,
        });
      }
    });
  }

  handleInputChange = (value) => {
    this.setState({
      condition: value,
    });
  }

  handleSelectChange = (value) => {
    let typeValue = "全部";
    this.props.type.forEach((element, index) => {
      if (index == value) {
        typeValue = element.type;
      }
    });
    this.setState({
      type: typeValue,
    });
  }

  //日期选择
  onChange = (date, dateString) => {
    this.setState({
      starttime: dateString[0],
      endtime: dateString[1],
    });
  }

  //重置
  clear = () => {
    this.setState({
      loading: true,
      condition: '',
      type: '全部',
      starttime: '',
      endtime: '',
      current: 1,
    });
    this.props.dispatch({
      type: 'stopVolume/getList',
      params: { pageno: 1, pagesize: 10 },
      callback: ({ total }) => {
        this.setState({
          loading: false,
          total: total,
        });
      }
    });
  }

  //展开
  expand = () => {
    this.setState({
      isExpand: !this.state.isExpand,
    });
  }

  getParam = () => {
    let param = {};
    if (this.state.type == "全部") {
      param = {
        pageno: 1,
        pagesize: 10,
        condition: this.state.condition,
        type: "",
        starttime: this.state.starttime,
        endtime: this.state.endtime,
      };
    } else {
      param = {
        pageno: 1,
        pagesize: 10,
        condition: this.state.condition,
        type: this.state.type,
        starttime: this.state.starttime,
        endtime: this.state.endtime,
      };
    }
    return param;
  }


  // 获取搜索参数
  getSearchValue = () => {
    const { stationId, time, stateValue } = this.state;
    const { pageno, pagesize } = this.props;
    let date = time.format(FormatStr);
    if (stateValue === 1) {
      date = moment().format(FormatStr);
    }
    if (stateValue === 0) {
      date = moment().subtract(1, 'months').format(FormatStr);
    }
    const params = {
      stationid: stationId === '全部' ? '' : stationId,
      date,
      pageno,
      pagesize,
    };
    return params;
  };

  //分页改变时回调
  handleTableChange = (pagination) => {
    this.setState({
      loading: true,
      current: pagination.current,
    });
    let param = this.getParam();
    if (typeof (param) != "undefined") {
      param.pageno = pagination.current;
      param.pagesize = pagination.pageSize;
    }
    this.props.dispatch({
      type: 'stopVolume/getList',
      params: param,
      callback: ({ total }) => {
        this.setState({
          total: total,
          loading: false,
        });
      }
    });
  };

  downLoadData = () => {
    this.setState({ downLoading: true, });
    const url = `${window.location.origin}/proxy/stopgas/stopGasListByConditionExportExcel?${stringify({ ...this.getParam(), ecode: this.props.user.ecode, token: getCurrTk() })}`
    let header = {
      "Content-Type": "application/json;charset=UTF-8",
    };
    location.href = url;
    return fetch(url, {
      method: 'GET',
      headers: header,
    }).then((response) => response.blob())
      .then((responseData) => {
        console.log('res:', url, responseData);
        if (responseData) {
          this.setState({
            downLoading: false,
          })
        }
      })
      .catch((err) => {
        console.log('err:', url, err);
      });

  }

  render() {
    const { data } = this.props;
    const { RangePicker } = DatePicker;
    const { current } = this.state;
    data && data.map((item, index) => {
      data[index].findex = index + 1 + data.length * (current - 1)
    })
    //定义列
    const cols = [
      { title: '序号', dataIndex: 'findex', width: '5%', },
      { title: '事件编号', dataIndex: 'wonum', width: '7%', },
      { title: '业务类型', dataIndex: 'type', width: '8%' },
      { title: '停气地点', dataIndex: 'stopgasAddress', width: '12%' },
      { title: '停气开始时间', dataIndex: 'stopgasStime', width: '12%', },
      { title: '停气结束时间', dataIndex: 'stopgasEtime', width: '12%', },
      { title: '停气范围', dataIndex: 'repairRange', width: '15%', },
      { title: '上报人', dataIndex: 'username', width: '7%', },
      {
        title: '是否延期', dataIndex: 'isDelay', width: '6%',
        render: (text, record) => {
          if (record.isDelay == 1) {
            return <span style={{ marginLeft: '25%' }}>是</span>
          }
          return <span style={{ marginLeft: '25%' }}>否</span>
        }
      },
      { title: '创建时间', dataIndex: 'gmtCreate', width: '9%', },
      { title: '备注', dataIndex: 'remark', width: '7%', },
    ];

    //定义分页
    const paginationProps = {
      total: this.state.total,
      current: this.state.current,
      showSizeChanger: true,
      showQuickJumper: true,
      defaultPageSize: 10,
      pageSizeOptions: ['10', '20', '30', '40'],
      showTotal: (total, range) => {
        return <div> 共 {total} 条记录 </div>;
      }
    };

    return (
      <PageHeaderLayout>
        <div className={styles['field-block']}>
          <label>业务类型：</label>
          <Select className={styles.select} allowClear value={this.state.type} onChange={(value) => { this.handleSelectChange(value) }}>
            <Option key="全部">全部</Option>
            {
              this.props.type.map((item, index) => {
                return <Option key={index}>{item.type}</Option>
              })}
          </Select>
        </div>
        <div className={styles['field-block']}>
          <label>快速搜索：</label>
          <Input className={styles.input} value={this.state.condition} placeholder='停气范围' onChange={(e) => { this.handleInputChange(e.target.value) }} />
        </div>
        <div className={styles['field-block']}>
          <Button type="primary" style={{ marginLeft: 25, }} onClick={this.query}>查询</Button>
          <Button style={{ marginLeft: 25, }} onClick={this.clear}>重置</Button>
          <div style={{ color: '#1890ff', cursor: 'pointer', float: 'right', display: 'block', marginLeft: 25, }} onClick={this.expand}>
            <span style={{ verticalAlign: 'middle', display: this.state.isExpand ? 'inline' : 'none' }}>收起<Icon type="up" /></span>
            <span style={{ verticalAlign: 'middle', display: this.state.isExpand ? 'none' : 'inline' }}>展开<Icon type="down" /></span>
          </div>
        </div>
        <div className={styles['field-block']}>
          <Button type="primary">
            <Icon type="download" />
            {/* <a onClick={this.downLoadData} href={`${window.location.origin}/proxy/stopgas/stopGasListByConditionExportExcel?${stringify({...this.getParam(), ecode: '0011', token: getCurrTk()})}`} style={{ color: 'white', paddingLeft: 8 }}>导出</a> */}
            <a onClick={this.downLoadData} style={{ color: 'white', paddingLeft: 8 }}>导出</a>
          </Button>
        </div>
        <div style={{ display: this.state.isExpand ? 'block' : 'none', marginTop: '20px' }}>
          <span>选择日期：</span>
          <RangePicker format="YYYY-MM-DD HH:mm:ss" showTime onChange={this.onChange} />
        </div>
        <div style={{ marginTop: '20px' }}>
          <Table
            // bordered
            rowKey={record => record.gid}
            columns={cols}
            dataSource={data}
            pagination={paginationProps}
            scroll={{ x: 1700 }}
            onChange={(pagination) => { this.handleTableChange(pagination) }} />
        </div>
        <div className={styles['loading']} style={{ display: this.state.downLoading ? 'block' : 'none' }}>
          <Spin size="large" />
        </div>
      </PageHeaderLayout>
    );
  }
}
