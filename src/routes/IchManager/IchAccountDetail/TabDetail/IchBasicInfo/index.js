import React, { PureComponent } from 'react';
import UserInfo from './UserInfo';
import styles from './index.less';

class IchBasicInfo extends PureComponent {
  render() {
    return (
      <div className={styles.container}>
        <UserInfo />
      </div>
    );
  }
}

export default IchBasicInfo;
