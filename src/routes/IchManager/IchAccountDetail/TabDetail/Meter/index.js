import React from 'react';
import styles from './index.less';
import List from './List';


export default (props) => (
  <div className={styles.container}>
    <List {...props} />
  </div>
);
