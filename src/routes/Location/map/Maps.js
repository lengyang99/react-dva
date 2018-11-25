import React, { Component } from 'react';
import propTypes from 'prop-types';
import CityMap from '../../../components/Map/EcityMap';
import styles from './Maps.less';
import mapMark from '../../../assets/mapmark.png';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';

const pointInfo = {
  width: 30,
  height: 30,
  layerId: 'eqLayer',
  id: 'eqPoint',
  src: mapMark,
};

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maps: undefined,
    };
  }
  static propTypes = {
    getEqGis: propTypes.func,
    getMaps: propTypes.func,
    eqGis: propTypes.object,
  };
  static defaultProps = {
    getEqGis: f => f,
    getMaps: f => f,
    eqGis: {},
  };
  componentDidUpdate() {
    const { eqGis: { x, y } } = this.props;
    if (this.state.maps !== undefined) {
      this.state.maps.mapDisplay.image({ ...pointInfo, x, y });
    }
  }
  handleMapLoad = (map) => {
    const apiUri = `${map.mapCfg.api_path}/frame/arcgis_js_api/library/3.20/3.20/init.js`;
    this.props.getMaps(map);
    this.setState({
      maps: map,
    });
    const mapTool = new DrawPointMapTool(map.getMapObj(), apiUri, geom => {
      this.props.getEqGis(geom.x, geom.y);
      map.mapDisplay.image({ ...pointInfo, x: geom.x, y: geom.y });
    });
    map.switchMapTool(mapTool);
  };
  render() {
    return (
      <div className={styles.map}>
        <CityMap mapId="location" onMapLoad={this.handleMapLoad} />
      </div>
    );
  }
}
