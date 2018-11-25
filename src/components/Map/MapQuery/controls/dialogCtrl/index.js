import React from 'react';
import Dialog from './Dialog';

export default class Control extends React.Component {
  render() {
    return <Dialog {...this.props} />;
  }
}
