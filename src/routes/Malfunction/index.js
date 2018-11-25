import React, { PureComponent } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import Toolbar from './Toolbar';
import Dialog from './Dialog';
import List from './List';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

@connect()
export default class Malfunction extends PureComponent {
  componentDidMount() {
    this.props.dispatch({ type: 'malfunction/fetchMalList' });
  }

  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.malfunction}>
          <Toolbar />
          <List />
          <Dialog />
        </div>
      </PageHeaderLayout>
    );
  }
}
