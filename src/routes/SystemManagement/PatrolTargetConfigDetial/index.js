import React from 'react';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import DetialForm from './DetialForm';

export default ({ ...otherProps}) => (
  <PageHeaderLayout>
    <div className={styles.container}>
      <DetialForm {...otherProps} />
    </div>
  </PageHeaderLayout>
);
