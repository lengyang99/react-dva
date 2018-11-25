import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';
import { Row, Icon } from 'antd';
import styles from './SearchPlan.less';

export default class SearchPlan extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
    };
  }
  static propsTypes = {
    searchField: propTypes.array,
    extra: propTypes.array,
    actionBtn: propTypes.array,
  };
  static defaultProps = {
    searchField: [], // input,select
    extra: [], // input,select
    actionBtn: [], // btn
  };
  toggle = () => {
    this.setState({
      collapse: !this.state.collapse,
    });
  };
  render() {
    const { className, searchField, extra, actionBtn } = this.props;
    const { collapse } = this.state;
    return (
      <div className={classnames(styles.search, className)}>
        <Row className={styles.search_row}>
          {searchField.length ? searchField.map(item => (
            <div className={styles.search_item}>
              <label htmlFor="">{item.title}</label>
              <div className={styles.search_item_input} >{item.search}</div>
            </div>
          )) : null}
          <div className={styles.search_btn}>
            {actionBtn.length ? actionBtn : null}
          </div>
          <a style={{marginTop: '5px'}} onClick={this.toggle}>{collapse ? '收起' : '高级搜索'}<Icon type={collapse ? 'up' : 'down'} /></a>
        </Row>
        <Row style={{display: collapse ? 'inline' : 'none'}}>
          {extra.length ? extra.map(item => (
            <div className={styles.search_item_extra}>
              <label htmlFor="">{item.title}</label>
              <div className={styles.search_item_input} >{item.search}</div>
            </div>
          )) : null}
        </Row>
      </div>
    );
  }
}
