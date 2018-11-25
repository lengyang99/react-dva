import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';
import { connect } from 'dva';
import { Row, Col, Select, Input, Button } from 'antd';
import styles from './SearchPlan.less';

const Option = Select.Option;

@connect(state => ({
  searchOptions: state.ichAccount.searchOptions,
  typeList: state.ichAccount.typeList,
  gasList: state.ichAccount.gasList,
}))
export default class SearchPlan extends PureComponent {
  static propTypes = {
    className: propTypes.string,
  };
  static defaultProps = {
    className: '',
  };
  componentDidMount() {
    this.props.dispatch({
      type: 'ichAccount/fetchSearchOptions',
    });
  }
  clickButtonWithType = (type) => {
    switch (type) {
      case 'search':
        this.props.dispatch({
          type: 'ichAccount/fetchLedgerData',
          payload: this.props.searchOptions,
        });
        break;
      case 'rest':
        this.props.dispatch({
          type: 'ichAccount/searchValueOnchange',
          payload: {
            customer_type: undefined,
            param: undefined,
            gas_properties: undefined,
            pageno: 1,
            pagesize: 10,
          },
        });
        this.props.dispatch({
          type: 'ichAccount/fetchLedgerData',
          payload: {
            customer_type: undefined,
            param: undefined,
            gas_properties: undefined,
            pageno: 1,
            pagesize: 10,
          },
        });
        break;
      default:
        break;
    }
  };
  changeOnValue = (type, value) => {
    const values = Object.prototype.toString.call(value) === '[object String]' ? value : value.target.value;
    this.props.dispatch({
      type: 'ichAccount/searchValueOnchange',
      payload: {[type]: values},
    });
  };
  render() {
    const { className, typeList, gasList } = this.props;
    return (
      <div className={classnames(styles.searchbar, className)}>
        <Row gutter={32} className={styles.searchbar_row}>
          <div className={styles.searchbar_item}>
            <label htmlFor="用户类型">用户类型</label>
            <Select
              className={styles.searchbar_select}
              placeholder="请选择"
              value={this.props.searchOptions.customer_type}
              onChange={this.changeOnValue.bind(this, 'customer_type')}
            >
              {typeList.map(item => (
                <Option key={item.alias}>{item.alias}</Option>
              ))}
            </Select>
          </div>
          <div className={styles.searchbar_item}>
            <label htmlFor="快速搜索">快速搜索</label>
            <Input
              className={styles.searchbar_input}
              placeholder="客户描述、客户号、合同账户、地址"
              value={this.props.searchOptions.param}
              onChange={this.changeOnValue.bind(this, 'param')}
            />
          </div>
          <div className={styles.searchbar_item}>
            <Button className={styles.searchbar_search} type="primary" onClick={this.clickButtonWithType.bind(this, 'search')}>查询</Button>
            <Button className={styles.searchbar_rest} onClick={this.clickButtonWithType.bind(this, 'rest')}>重置</Button>
          </div>
        </Row>
        {/*<Row gutter={32}>*/}
          {/*<Col span={6}>*/}
            {/*<label htmlFor="用气性质">用气性质</label>*/}
            {/*<Select*/}
              {/*className={styles.searchbar_select}*/}
              {/*placeholder="请选择"*/}
              {/*value={this.props.searchOptions.gas_properties}*/}
              {/*onChange={this.changeOnValue.bind(this, 'gas_properties')}*/}
            {/*>*/}
              {/*{gasList.map(item => (*/}
                {/*<Option key={item.name}>{item.alias}</Option>*/}
              {/*))}*/}
            {/*</Select>*/}
          {/*</Col>*/}
        {/*</Row>*/}
      </div>
    );
  }
}
