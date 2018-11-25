import React, { PureComponent } from 'react';
import classnames from 'classnames';
import { Row, Col, Button, Input } from 'antd';
import { connect } from 'dva';
import styles from './SearchPlan.less';


@connect(state => ({
  inputVale: state.stationAuthorityOption.searchOption,
}))
class SearchPlan extends PureComponent {
  clickButtonWithType = (type) => {
    switch (type) {
      case 'search':
        this.props.dispatch({
          type: 'stationAuthorityOption/getAuthList',
          payload: {
            userName: this.props.inputVale,
            pageSize: 10,
            pageNum: 1,
          },
        });
        break;
      case 'rest':
        break;
      default:
        break;
    }
  };
  changeOnValue = (e) => {
    this.props.dispatch({
      type: 'stationAuthorityOption/changeOnValue',
      payload: e.target.value,
    });
  };
  render() {
    const { className, inputVale } = this.props;
    return (
      <div className={classnames(styles.searchbar, className)}>
        <Row gutter={16}>
          <Col span={10}>
            <label htmlFor="">用户姓名:</label>
            <Input
              className={styles.searchbar_select}
              placeholder="输入用户名 or itcode"
              onChange={this.changeOnValue}
              value={inputVale}
            />
          </Col>
          <Col span={6}>
            <Button className={styles.searchbar_search} type="primary" onClick={this.clickButtonWithType.bind(this, 'search')}>查询</Button>
            <Button className={styles.searchbar_rest} onClick={this.clickButtonWithType.bind(this, 'rest')}>重置</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SearchPlan;
