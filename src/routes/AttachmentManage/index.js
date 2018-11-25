import React from 'react';
import styles from './index.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SearchPlan from './SearchPlan';
import List from './List';

export default () => (
  <PageHeaderLayout>
    <div className={styles.container}>
      <SearchPlan />
      <List />
    </div>
  </PageHeaderLayout>
);
