import React from 'react';
import PropTypes from 'prop-types';
import Map from '../../yd/Map';
import { getCfgByKey } from '../../../utils/conf';

function empty() {

}

export default class EcityMap extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mapcfg: null };

    getCfgByKey('mapcfg').then((mapcfg) => {
      this.setState({
        mapcfg,
      });
    });
  }
  onMapLoad = () => {
    console.log('onload');
    this.props.onMapLoad();
  };

  render() {
    const baseStyle = Object.assign({
      height: '100%',
      width: '100%',
      backgroundColor:'#fff'
    }, this.props.style);

    return (
      <div style={baseStyle} >
        <Map
          eventTarget={this.props.eventTarget}
          mapcfg={this.state.mapcfg}
          onMapLoad={this.onMapLoad}
        />
      </div>
    );
  }
}

EcityMap.propTypes = {
  eventTarget: PropTypes.string.isRequired,
  onMapLoad: PropTypes.func,
  style: PropTypes.object,
};

EcityMap.defaultProps = {
  onMapLoad: empty,
  style: {},
};
