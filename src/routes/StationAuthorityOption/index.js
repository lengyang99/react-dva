import React from 'react';
import styles from './index.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import SearchPlan from './SearchPlan';
import List from './List';
import TreeSelect from './TreeSelect';
import Dialog from './Dialog';

export default () => (
  <PageHeaderLayout>
    <div className={styles.container}>
      <SearchPlan className={styles.searchplan} />
      <div className={styles.childcontainer}>
        <TreeSelect className={styles.treeselect} />
        <List className={styles.list} />
        <Dialog />
      </div>
    </div>
  </PageHeaderLayout>
);
