import React, { PureComponent } from 'react';
import TabsControls from './TabsControls';
import styles from './Location.less';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

class Location extends PureComponent {
  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.location}>
          <TabsControls />
        </div>
      </PageHeaderLayout>
    );
  }
}

export default Location;
