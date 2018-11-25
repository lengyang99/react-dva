import React, { PureComponent } from 'react';
import { Input, Select, Button, Icon, message, Modal, Row } from 'antd';
import { connect } from 'dva';
import propTypes from 'prop-types';
import update from 'immutability-helper';
import moment from 'moment';
import qs from 'qs';
import { initOption } from './initOption';
import styles from './ToolBar.less';

const Option = Select.Option;

@connect(
  state => ({
    userInfo: state.login.user,
    organizationName: state.login.user.cCompany,
    user: state.login.user.trueName,
    funs: state.login.funs,
    token: state.login.token,
    siteList: state.ledger.siteList,
    filterOption: state.ledger.filterOption,
    selectedRowKeys: state.ledger.selectedRowKeys,
    allowDownload: state.ledger.allowDownload,
    classifyList: state.ledger.classifyList,
  })
)
export default class Toolbar extends PureComponent {
  static propTypes = {
    token: propTypes.string,
    user: propTypes.string,
    organizationName: propTypes.string,
    siteList: propTypes.array.isRequired,
    filterOption: propTypes.object.isRequired,
  };
  static defaultProps = {
    token: '',
    user: '',
    organizationName: '',
  };
  state = {
    eqCode: '',
    searchValue: '',
    siteValue: undefined,
    model: '',
    manufacturer: '',
    oldEqCode: '',
    visible: false,
    eqType: undefined, // 设备类型
    visibleDownload: false,
    email: undefined,
    reEmail: undefined,
  };

  componentDidMount() {
    this.props.dispatch({ type: 'ledger/fetchSiteList' });
  }
  componentWillUnmount() {
    // 质控所有查询条件
    this.props.dispatch({
      type: 'ledger/setFilterVale',
      payload: {
        clsName: [],
        eqKind: [],
        eqStatus: [],
        eqTypeName: [],
        gisReportState: [],
      },
    });
    this.props.dispatch({
      type: 'ledger/setFilterOption',
      payload: {
        keyword: undefined, // 过滤关键字
        eqCode: undefined, // 设备编号
        site: undefined, // 站点
        parentId: undefined, // 父级 ID
        locGid: undefined, // 位置 ID
        clsGid: undefined, // 分类 ID
        pageNum: undefined, // 页码
        pageSize: undefined, // 页数
        sortRule: undefined, // 排序规则
        sortField: undefined, // 排序名称
      },
    });
  }

  /**
   * @desc 表单 change 事件
   * @param {string} type - change事件类型 ['search', 'site']
   * @param {object | string} e
   */
  handleChange = (type, e) => {
    switch (type) {
      case 'search':
        this.setState({ searchValue: e.target.value });
        break;
      case 'site':
        this.setState({ siteValue: e });
        break;
      case 'eqCode':
        this.setState({ eqCode: e.target.value });
        break;
      case 'model':
        this.setState({ model: e.target.value });
        break;
      case 'manufacturer':
        this.setState({ manufacturer: e.target.value });
        break;
      case 'oldEqCode':
        this.setState({ oldEqCode: e.target.value });
        break;
      default:
        console.error('can\'t arrive here');
    }
  };
  /**
   * @desc 获取台账列表
   */
  fetchLedger = () => {
    this.props.dispatch({
      type: 'ledger/fetchLedger',
      payload: update(this.props.filterOption, {
        $merge: {
          ...initOption,
          keyword: this.state.searchValue,
          site: this.state.siteValue,
          eqCode: this.state.eqCode,
          model: this.state.model,
          manufacturer: this.state.manufacturer,
          oldEqCode: this.state.oldEqCode,
          pageNum: 1,
          pageSize: this.props.filterOption.pageSize,
        },
      }),
    });
  };
  reFetchLedger = () => {
    this.props.dispatch({
      type: 'ledger/fetchLedger',
      payload: update(this.props.filterOption, {
        $merge: {
          ...initOption,
          keyword: this.state.searchValue,
          site: this.state.siteValue,
          eqCode: this.state.eqCode,
          model: this.state.model,
          manufacturer: this.state.manufacturer,
          oldEqCode: this.state.oldEqCode,
          eqType: undefined,
          clsGids: undefined,
          eqStatus: undefined,
          gisReportState: undefined,
          eqKind: undefined,
          pageNum: 1,
          pageSize: this.props.filterOption.pageSize,
        },
      }),
    });
  };
  /**
   * @desc 台账工具栏点击事件
   * @param {string} type - 事件类型['search', 'reset', 'download']
   */
  handleClick = (type, e) => {
    const { selectedRowKeys } = this.props;
    switch (type) {
      case 'search':
        this.fetchLedger();
        break;
      case 'reset':
        this.setState({
          searchValue: '',
          eqCode: '',
          siteValue: undefined,
          model: '',
          manufacturer: '',
          oldEqCode: '',
        }, () => {
          this.reFetchLedger();
          this.props.dispatch({
            type: 'ledger/setFilterVale',
            payload: {
              clsName: [],
              eqKind: [],
              eqStatus: [],
              eqTypeName: [],
              gisReportState: [],
            },
          });
        });
        break;
      case 'new':
        this.props.dispatch({
          type: 'ledger/setDisabled',
          payload: false,
        });
        this.props.dispatch({
          type: 'ledger/newLedger',
          payload: {
            isNewLedger: true,
            activeKey: 'ledger',
            organizationName: this.props.organizationName,
            user: this.props.user,
            changedTime: moment(Date.now()),
          },
        });
        this.props.dispatch({
          type: 'ledger/setErcodeImage',
          payload: 'none',
        });
        break;
      case 'export':
        if (selectedRowKeys.length > 200) {
          message.warn('不能超过200条');
        }
        if (selectedRowKeys.length === 0) {
          message.warn('请选择至少1条');
        }
        break;
      case 'updateType':
        if (selectedRowKeys.length === 0) {
          message.warn('请选择至少1条');
        } else {
          this.setState({
            visible: true,
            eqType: undefined,
          });
        }
        break;
      default:
        console.error('can\'t arrive here');
    }
  };
  download = () => {
    this.setState({
      visibleDownload: true,
      email: undefined,
      reEmail: undefined,
    });
  };
  downloadOk = () => {
    const { filterOption, selectedRowKeys } = this.props;
    const { email, reEmail } = this.state;
    const reg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
    if (!reg.test(email)) {
      message.warn('请输入正确的邮箱地址！');
    } else if (email === reEmail) {
      this.props.dispatch({
        type: 'ledger/fetchForDownload',
        payload: {
          ...filterOption,
          eqIds: Array.isArray(selectedRowKeys) ? selectedRowKeys.join(',') : undefined,
          email,
        },
        callback: () => {},
      });
      message.success('离线下载已发送，请稍后查看邮箱。');
      this.setState({
        visibleDownload: false,
      });
    } else {
      message.warn('请确认两次邮箱输入一致！');
    }
  };
  downloadCancel = () => {
    this.setState({
      visibleDownload: false,
    });
  };
  inputOnChange = (type, e) => {
    this.setState({
      [type]: e.target.value,
    });
  };
  handleOnChange = (e) => {
    this.setState({
      eqType: e,
    });
  };
  handleOk = () => {
    const { eqType } = this.state;
    const { selectedRowKeys } = this.props;
    this.props.dispatch({
      type: 'ledger/updateLdgrTypes',
      payload: {
        eqType,
        gids: selectedRowKeys,
      },
      callback: () => {
        this.setState({
          visible: false,
        });
        this.fetchLedger();
      },
    });
  };
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };
  render() {
    const { searchValue, siteValue, eqCode, model, manufacturer, oldEqCode, visible, eqType, visibleDownload, email, reEmail } = this.state;
    const { siteList, selectedRowKeys, funs, userInfo, allowDownload, classifyList } = this.props;
    let ledger_add = true; // 设备台账添加
    for (let i = 0; i < funs.length; i++) {
      let json = funs[i];
      if (json.code === 'ledger_add') {
        ledger_add = false;
      }
    }
    const downloadOptions = { ...this.props.filterOption, ecode: userInfo.ecode, token: this.props.token, pageNum: undefined, pageSize: undefined };
    const exportErCode = { eqIds: selectedRowKeys.toString() };
    return (
      <div className={styles.toolbar}>
        <div className={styles.toolbar__basic}>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="search">查询 :</label>
            <Input
              className={styles.toolbar__basic__search}
              id="search"
              placeholder="请输入设备名称、位置"
              onChange={this.handleChange.bind('', 'search')}
              value={searchValue}
            />
          </div>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="search">设备编码 :</label>
            <Input
              className={styles.toolbar__basic__code}
              id="search"
              placeholder="请输入设备编码"
              onChange={this.handleChange.bind('', 'eqCode')}
              value={eqCode}
            />
          </div>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="model">规格型号 :</label>
            <Input
              className={styles.toolbar__basic__code}
              id="search"
              placeholder="请输入规格型号"
              onChange={this.handleChange.bind('', 'model')}
              value={model}
            />
          </div>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="manufacturer">生产厂家 :</label>
            <Input
              className={styles.toolbar__basic__code}
              id="search"
              placeholder="请输入生产厂家"
              onChange={this.handleChange.bind('', 'manufacturer')}
              value={manufacturer}
            />
          </div>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="oldEqCode">原设备编码 :</label>
            <Input
              className={styles.toolbar__basic__code}
              id="oldEqCode"
              placeholder="请输入设备编码"
              onChange={this.handleChange.bind('', 'oldEqCode')}
              value={oldEqCode}
            />
          </div>
          <div className={styles.toolbar__basic__item}>
            <label htmlFor="site">所属站点 :</label>
            <Select
              allowClear
              id="site"
              className={styles.toolbar__basic__site}
              placeholder="请选择"
              onChange={this.handleChange.bind('', 'site')}
              value={siteValue}
            >
              {siteList.map(option => <Option value={option.value} key={option.kid}>{option.text}</Option>)}
            </Select>
          </div>
          <div className={styles.toolbar__basic__item}>
            <Button className={styles.toolbar__btn} type="primary" onClick={this.handleClick.bind('', 'search')}>查询</Button>
            <Button className={styles.toolbar__btn} onClick={this.handleClick.bind('', 'reset')}>重置</Button>
          </div>
        </div>
        <div>
          <Button className={styles.toolbar__btn} type="primary" disabled={ledger_add} onClick={this.handleClick.bind('', 'new')}><Icon type="plus" />新建</Button>
          <Button onClick={this.download} className={styles.toolbar__btn} type="primary">
            <Icon type="download" />
            <a style={{ color: 'white', paddingLeft: 8 }}>下载</a>
          </Button>
          {
            (selectedRowKeys.length === 0 || selectedRowKeys.length > 200) ?
              (<Button className={styles.toolbar__btn} type="primary" onClick={this.handleClick.bind('', 'export')}>
                <Icon type="export" />
                <a style={{ color: 'white', paddingLeft: 8 }}>批量导出二维码</a>
              </Button>) :
              (<Button className={styles.toolbar__btn} type="primary">
                <Icon type="export" />
                <a href={`/proxy/ldgrWordFile?${qs.stringify(exportErCode)}`} style={{ color: 'white', paddingLeft: 8 }}>批量导出二维码</a>
              </Button>)
          }
          <Button className={styles.toolbar__btn} type="primary" onClick={this.handleClick.bind('', 'updateType')}>批量更新类型</Button>
        </div>
        <Modal
          title="批量修改"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Row>
            <label>设备类型 :</label>
            <Select
              value={eqType}
              onChange={this.handleOnChange}
              style={{width: '200px', marginLeft: '10px'}}
              placeholder="请选择"
            >
              {
                classifyList.map(item => (
                  <Option key={item.value}>{item.text}</Option>
                ))
              }
            </Select>
          </Row>
        </Modal>
        <Modal
          title="执行离线下载"
          visible={visibleDownload}
          onOk={this.downloadOk}
          onCancel={this.downloadCancel}
        >
          <Row>
            <label style={{ marginLeft: '20px'}}>用户邮箱 :</label>
            <Input
              style={{width: '300px', marginLeft: '10px'}}
              value={email}
              onChange={this.inputOnChange.bind('', 'email')}
              placeholder="请输入邮箱地址"
            />
          </Row>
          <Row style={{marginTop: '10px'}}>
            <label style={{ marginLeft: '20px'}}>确认邮箱 :</label>
            <Input
              style={{width: '300px', marginLeft: '10px'}}
              value={reEmail}
              onChange={this.inputOnChange.bind('', 'reEmail')}
              placeholder="请输入相同邮箱"
            />
          </Row>
        </Modal>
      </div>
    );
  }
}
