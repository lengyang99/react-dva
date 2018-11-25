import React, { PureComponent } from 'react';

import Toolbar from './Toolbar';
import List from './List';
import EditModal from './EditModal';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

export default class MessageTemplate extends PureComponent {
  static propTypes = {

  };
  render() {
    return (
      <PageHeaderLayout>
        <Toolbar />
        <List />
        <EditModal />
      </PageHeaderLayout>
    );
  }
}
