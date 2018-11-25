import React from 'react';
import styles from './index.less';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import SearchPlan from './SearchPlan';
import List from './List';
import Dialog from './Dialog';

export default () => (
  <PageHeaderLayout>
    <div className={styles.container}>
      <SearchPlan className={styles.container_searchplan} />
      <List />
      <Dialog />
    </div>
  </PageHeaderLayout>
);
