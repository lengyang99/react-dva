import React, { Component } from 'react';
import styles from './index.less';
import PlanForm from './planForm';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

export default class NewOperaType extends Component {
  render() {
    return (
      <PageHeaderLayout>
        <div className={styles.body}>
          <PlanForm {...this.props} />
        </div>
      </PageHeaderLayout>);
  }
}
