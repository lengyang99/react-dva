import React, { Component } from 'react';
import { Input, Select, Button } from 'antd';
import propTypes from 'prop-types';
import classnames from 'classnames';
import update from 'immutability-helper';
import { fetchSiteList } from '../../services/eqLedger';
import styles from './Toolbar.less';

const Option = Select.Option;

export default class Toolbar extends Component {
  static propTypes = {
    filterOption: propTypes.object.isRequired,
    fetchList: propTypes.func.isRequired,
    changeModalOption: propTypes.func.isRequired,
  };
  state = {
    searchValue: '',
    siteList: [],
    siteValue: undefined,
    rowValue: [],
    rowList: [{
      title: '公司编码',
      dataIndex: 'ccode',
    }, {
      title: '分类编码',
      dataIndex: 'clsGid',
    }, {
      title: '设备分类层次结构',
      dataIndex: 'clsHierarchy',
    }, {
      title: '分类名称',
      dataIndex: 'clsName',
    }, {
      title: '企业编码',
      dataIndex: 'ecode',
    }, {
      title: '设备编码',
      dataIndex: 'eqCode',
    }, {
      title: '设备名称',
      dataIndex: 'eqName',
    }, {
      title: '设备状态',
      dataIndex: 'eqStatus',
    }, {
      title: '设备类型编码',
      dataIndex: 'eqType',
    }, {
      title: '设备类型名称',
      dataIndex: 'eqTypeName',
    }, {
      title: '设备类型值',
      dataIndex: 'eqTypeValue',
    }, {
      title: '执行区域名称',
      dataIndex: 'eqWorkZoneName',
    }, {
      title: '设备二维码标记',
      dataIndex: 'ewCodeUUID',
    }, {
      title: '故障分类代码',
      dataIndex: 'failCode',
    }, {
      title: '故障分类名称',
      dataIndex: 'failName',
    }, {
      title: '固定资产编号',
      dataIndex: 'fixAstsCode',
    }, {
      title: 'gis编码',
      dataIndex: 'gisCode',
    }, {
      title: '完好等级',
      dataIndex: 'goodGrads',
    }, {
      title: '工商户代码',
      dataIndex: 'houseHoldCode',
    }, {
      title: '工商户名称',
      dataIndex: 'houseHoldName',
    }, {
      title: '重要程度',
      dataIndex: 'impDegree',
    }, {
      title: '安装日期',
      dataIndex: 'instalDate',
    }, {
      title: '安装单位',
      dataIndex: 'instalUnit',
    }, {
      title: '是否线性设备',
      dataIndex: 'isLinearEq',
    }, {
      title: '是否特种设备',
      dataIndex: 'isSpclEq',
    }, {
      title: '纬度',
      dataIndex: 'latitude',
    }, {
      title: '经度',
      dataIndex: 'longitude',
    }, {
      title: '生产厂家',
      dataIndex: 'manufacturer',
    }, {
      title: '材质',
      dataIndex: 'material',
    }, {
      title: '规格型号',
      dataIndex: 'model',
    }, {
      title: '原设备编码',
      dataIndex: 'oldEqCode',
    }, {
      title: '组织名称',
      dataIndex: 'orgName',
    }, {
      title: '父类名称',
      dataIndex: 'parentName',
    }, {
      title: '位置描述',
      dataIndex: 'posDesc',
    }, {
      title: '位置名称',
      dataIndex: 'posName',
    }, {
      title: '出厂日期',
      dataIndex: 'prodDate',
    }, {
      title: '质保到期日',
      dataIndex: 'qltyExp',
    }, {
      title: '责任人',
      dataIndex: 'responsible',
    }, {
      title: '序列号',
      dataIndex: 'serialNum',
    }, {
      title: '周转备件',
      dataIndex: 'spareParts',
    }, {
      title: '周转备件库存数量',
      dataIndex: 'sparePartsAmount',
    }, {
      title: '站点名称',
      dataIndex: 'stationName',
    }, {
      title: '供应商',
      dataIndex: 'supplier',
    }, {
      title: '作业区域',
      dataIndex: 'IDworkZone',
    }],
  };

  componentDidMount() {
    fetchSiteList().then(({ success, data }) => {
      if (success) {
        this.setState({
          siteList: data,
        });
      }
    });
  }

  /**
   * @desc 设备索引条件表单 change 事件
   * @param {string} type - ['search' | 'site']
   * @param {object | string} e - dom 事件
   */
  handleChange = (type, e) => {
    let options = {};
    switch (type) {
      case 'search':
        this.setState({
          searchValue: e.target.value,
        });
        options = update(this.props.filterOption, { $merge: { keyword: e.target.value } });
        break;
      case 'site':
        this.setState({
          siteValue: e,
        });
        options = update(this.props.filterOption, { $merge: { site: e } });
        break;
      default:
        console.error('can\'t arrive here');
    }
    this.props.changeModalOption(options);
  };
  /**
   * @desc 设备点击事件
   * @param {string} type - 搜索 or 重置收索条件 ['search' | 'reset']
   */
  handleClick = (type) => {
    let options = {};
    switch (type) {
      case 'search':
        this.props.fetchList(update(this.props.filterOption, {$merge: {pageNum: 1, pageSize: 10}}));
        break;
      case 'reset':
        this.setState({
          searchValue: undefined,
          siteValue: undefined,
        });
        options = update(this.props.filterOption, { $merge: { searchValue: undefined, siteValue: undefined } });
        this.props.changeModalOption(options);
        this.props.fetchList(options);
        break;
      default:
        console.error('can\'t arrive here');
    }
  };
  /**
   * @desc 表格行展示选择
   * @param {array} value
   */
  handleRowChange = (value) => {
    this.setState({
      rowValue: value,
    });
    this.props.handleRowChange(value);
  };
  render() {
    const { searchValue, siteValue, rowValue } = this.state;
    const style = { width: 200 };
    return (
      <div className={classnames('clearfix', styles.equipment__toolbar)}>
        <div className="pull-left">
          <div className={styles.equipment__toolbar__item}>
            <label id="search">搜索: </label>
            <Input
              style={style}
              placeholder="请输入设备名称、所属位置"
              onChange={this.handleChange.bind('', 'search')}
              value={searchValue}
            />
          </div>
          <div className={styles.equipment__toolbar__item}>
            <label id="site">所属站点: </label>
            <Select
              allowClear
              style={style}
              placeholder="请选择站点"
              onChange={this.handleChange.bind('', 'site')}
              value={siteValue}
            >
              {this.state.siteList.map(ele => <Option key={ele.value} value={ele.value}>{ele.text}</Option>)}
            </Select>
          </div>
          <div className={styles.equipment__toolbar__item}>
            <label id="site">展示项选择: </label>
            <Select
              allowClear
              style={style}
              placeholder="请选择表格展示项"
              mode="multiple"
              labelInValue
              onChange={this.handleRowChange}
              value={rowValue}
            >
              {this.state.rowList.map(ele => <Option key={ele.dataIndex} value={ele.dataIndex}>{ele.title}</Option>)}
            </Select>
          </div>
        </div>
        <div className="pull-right">
          <Button style={{ marginRight: 10 }} type="primary" onClick={this.handleClick.bind('', 'search')}>查询</Button>
          <Button style={{ marginRight: 10 }} onClick={this.handleClick.bind('', 'reset')}>重置</Button>
        </div>
      </div>
    );
  }
}
