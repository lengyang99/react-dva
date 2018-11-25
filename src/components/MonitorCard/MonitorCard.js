/**
 * Create on 2018/3/20.
 * descrip:  管网监测卡片组件
 */
import React, {PureComponent} from 'react';
import {Row, Col} from 'antd';
import PropTypes from 'prop-types';
import styles from './MonitorCard.less';

export default class MonitorCard extends PureComponent {
  static propTypes = {
    width: PropTypes.string,
    data: PropTypes.object,
  };

  static defaultProps = {
    width: '300px',
    data: {},
  };

  dealData = () => {
    let result = [];
    let indicators = this.props.data.indicators;
    if (indicators && indicators.length > 0) {
      indicators = indicators.slice(0, 4);
      indicators.forEach((item, index) => {
        result.push(
          <Row type="center" className={styles.rowName}>
            <Col span={14}><span className={styles.spanName}>{item.itemText}</span></Col>
            <Col span={1} style={{textAlign: 'center'}}>:</Col>
            <Col span={9}><span className={styles.spanValue}>{item.itemValue}{item.unit}</span></Col>
          </Row>
        );
      });
    }
    return result;
  }

  render() {
    let cardData = this.dealData();
    return (
      <div className={styles.cardBorder} style={{width: `${this.props.width}`}}>
        <div className={styles.cardTitle}>{this.props.data.name}</div>
        <div className={styles.cardContent}>
          {cardData}
        </div>
      </div>
    );
  }
}
