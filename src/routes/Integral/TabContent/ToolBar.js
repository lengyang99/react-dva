import React, { Fragment, PureComponent } from 'react';
import { Input, Button } from 'antd';
import { connect } from 'dva';
import styles from './ToolBar.less';

@connect(state => ({
  search: state.integral.search,
  activeKey: state.integral.activeKey,
}))
export default class ToolBar extends PureComponent {
  static propTypes = {

  };
  handleChange = e => {
    this.props.dispatch({
      type: 'integral/setSearch',
      payload: e.target.value,
    });
  };
  handleClick = type => {
    switch (type) {
      case 'new':
        this.props.dispatch({
          type: 'integral/setModalActive',
          payload: true,
        });
        break;
      case 'search':
        this.props.dispatch({
          type: 'integral/fetchListWithKeywords',
          payload: {
            calcMode: this.props.activeKey,
            queryCriteria: this.props.search,
          },
        });
        break;
      default:
        return 0;
    }
  };
  render() {
    const { search, activeKey } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.formItem}>
          <label className={styles.label} htmlFor="keyword">关键字: </label>
          <Input className={styles.input} id="keyword" onChange={this.handleChange} value={search} placeholder="请输入要查找的内容" />
        </div>
        <div className={styles.btns}>
          <Button onClick={this.handleClick.bind(this, 'search')} className={styles.btn}>搜索</Button>
          {
            activeKey === 'config' ? null :
              [
                <Button type="primary" key="new" onClick={this.handleClick.bind(this, 'new')} className={styles.btn}>新增</Button>,
              ]
          }
        </div>
      </div>
    );
  }
}
