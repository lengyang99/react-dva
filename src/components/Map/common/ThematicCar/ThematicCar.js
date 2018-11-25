/**
 * Created by hexi on 2018/3/2.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ShowPatrolCar from './ShowPatrolCar.js';

export default class ThematicCar extends PureComponent {
  constructor(props) {
    super(props);
  }

  onClose = () => {
    this.props.onClose();
  }

  render() {
    return this.props.thematicCarVisible ?
      <ShowPatrolCar map={this.props.map} onClose={this.onClose} /> : null;
  }
}

ThematicCar.defaultProps = {
  thematicCarVisible: false,
  map: null,
  onClose: () => {
  },
};

ThematicCar.propTypes = {
  thematicCarVisible: PropTypes.bool,
  map: PropTypes.object,
  onClose: PropTypes.func,
};
