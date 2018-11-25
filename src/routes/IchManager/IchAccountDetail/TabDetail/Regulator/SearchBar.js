import React, { PureComponent } from 'react';
import { Input, Button, Select } from 'antd';
import update from 'immutability-helper';
import { connect } from 'dva';
import styles from './Toolbar.less';

const initOption = {
  pageNum: 1, // 页码
  pageSize: 10, // 页数
  keyword: undefined, // 过滤关键字
  eqCode: undefined,
  model: undefined, // 规格型号
  eqStatus: undefined, // 状态
  eqType: undefined, // 类型
  posId: undefined, // 所属站点ID
  clsGid: undefined, // 分类 ID
};
const Option = Select.Option;
@connect(state => ({
  // filterOption: state.ichAccount.filterOption,
  // regulatorFilter: state.ichAccount.regulatorFilter,
}))
class SearchBar extends PureComponent {
  state = {
    eqCode: '',
    keyword: '',
    model: '',
    // siteValue: undefined,
  };
  handleClick = (type) => {
    switch (type) {
      case 'search':
        this.fetchRegulator();
        break;
      case 'reset':
        this.setState({
          keyword: '',
          eqCode: '',
          model: '',
          // siteValue: undefined,
        }, () => {
          this.fetchRegulator();
        });
        break;
      default:
        console.error('can\'t arrive here');
    }
  };
  handleChange = (type, e) => {
    switch (type) {
      case 'search':
        this.setState({ keyword: e.target.value });
        break;
      case 'eqCode':
        this.setState({ eqCode: e.target.value });
        break;
      case 'model':
        this.setState({ model: e.target.value });
        break;
      // case 'site':
      //   this.setState({ siteValue: e });
      //   break;
      default:
        console.error('can\'t arrive here');
    }
  };
  fetchRegulator = () => {
    // this.props.dispatch({
    //   type: 'ichAccount/fetchRegulatorList',
    //   payload: {
    //     pageOption: update(this.props.filterOption, {
    //       $merge: {
    //         ...initOption,
    //         keyword: this.state.keyword,
    //         eqCode: this.state.eqCode,
    //         model: this.state.model,
    //         site: this.state.siteValue,
    //         pageNum: 1,
    //         pageSize: 10,
    //       },
    //     }),
    //   },
    // });
  };
  render() {
    const { keyword, eqCode, model } = this.state;
    return (
      <div className={styles.toolbar__basic}>
        <div className={styles.toolbar__basic__item}>
          <label htmlFor="search">查询 :</label>
          <Input
            className={styles.toolbar__basic__search}
            id="search"
            placeholder="请输入设备名称、位置"
            onChange={this.handleChange.bind('', 'search')}
            value={keyword}
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
          <Button className={styles.toolbar__btn} type="primary" onClick={this.handleClick.bind('', 'search')}>查询</Button>
          <Button className={styles.toolbar__btn} onClick={this.handleClick.bind('', 'reset')}>重置</Button>
        </div>
      </div>
    );
  }
}

export default SearchBar;
