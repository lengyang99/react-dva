/**
 * Created by remote on 2017/5/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import WrappedIframe from '../WrappedIframe';

// 把 iframe 包在一个组建里，设 shouldComponentUpdate 为 false
class Map extends React.Component {
  render() {
    let comp = null;
    if (this.props.mapcfg) {
      comp = <WrappedIframe src="./map/arcgis/map.html" {...this.props} />;
    }
    return comp;
  }
}

Map.defaultProps = {
  onMapLoad: () => null,
  mapcfg: null,
};

Map.propTypes = {
  eventTarget: PropTypes.string.isRequired,
  mapcfg: PropTypes.shape({
    centerx: PropTypes.number,
    centery: PropTypes.number,
  }),
  onMapLoad: PropTypes.func,
};

export default Map;
