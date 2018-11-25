import React, { Component } from 'react';
import EcityMap from '../../components/Map/EcityMap';

export default class MapView extends Component {
  constructor (props) {
    super(props);
  }

  render() {
    return (
      <div style={{ width: '100%', height: 'calc(100vh - 120px)' }}>
        <EcityMap mapId="mapView" />
      </div>
    );
  }
}
