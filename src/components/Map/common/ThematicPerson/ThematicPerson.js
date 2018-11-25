/**
 * Created by hexi on 2018/3/2.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ShowPatrolPerson from './ShowPatrolPerson.js';


export default class ThematicPerson extends PureComponent {
  constructor(props) {
    super(props);
  }

  onClose = () => {
    this.props.onClose();
  }

  render() {
    return this.props.thematicPersonVisible ?
      <ShowPatrolPerson map={this.props.map} onClose={this.onClose} /> : null;
  }
}

ThematicPerson.defaultProps = {
  thematicPersonVisible: false,
  map: null,
  onClose: () => {
  },
};

ThematicPerson.propTypes = {
  thematicPersonVisible: PropTypes.bool,
  map: PropTypes.object,
  onClose: PropTypes.func,
};
