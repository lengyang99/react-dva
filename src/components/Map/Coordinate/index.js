import React from 'react';
import styles from './index.less';

/**
 * 坐标显示组件
 */
export default class Coordinate extends React.Component {
  render() {
    if (!this.props.xy) {
      return null;
    }

    return (
      <div className={styles.container}>
        <div className={styles.row}>
          <span>X: </span>
          <span>{this.props.xy.x}</span>
        </div>
        <div className={styles.row}>
          <span>Y: </span>
          <span>{this.props.xy.y}</span>
        </div>
      </div>
    );
  }
}
