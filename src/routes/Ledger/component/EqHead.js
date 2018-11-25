import React, { PureComponent } from 'react';
import { Input } from 'antd';
import propTypes from 'prop-types';
import styles from './EqHead.less';

export default class EQHead extends PureComponent {
  static propTypes = {
    id: propTypes.oneOfType([propTypes.string, propTypes.number]),
    name: propTypes.string,
  };
  static defaultProps = {
    id: '',
    name: '',
  };
  render() {
    const { id, name, ...props } = this.props;
    return (
      <div className={styles.head} {...props}>
        <div className={styles.head__item}>
          <label className={styles.head__label} htmlFor="id">设备编码 :</label>
          <Input className={styles.head__input} value={id} id="id" disabled />
        </div>
        <div className={styles.head__item}>
          <label className={styles.head__label} htmlFor="name">设备名称 :</label>
          <Input className={styles.head__input} value={name} id="name" disabled />
        </div>
      </div>
    );
  }
}
