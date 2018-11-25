import React, { PureComponent } from 'react';
import propTypes from 'prop-types';

import ToolBar from './ToolBar';
import List from './List';
import EditModal from './EditModal';
import styles from './index.less';

export default class ConfigIntegral extends PureComponent {
  static propTypes = {

  };
  render() {
    return (
      <div className={styles.container}>
        <ToolBar />
        <List />
        <EditModal />
      </div>
    );
  }
}
