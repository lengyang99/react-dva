import React from 'react';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import List from './List';

export default () => (
  <PageHeaderLayout>
    <div className={styles.container}>
      <List />
    </div>
  </PageHeaderLayout>
);
