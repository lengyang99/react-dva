import React, { Component } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import CityMap from '../../../components/Map/EcityMap';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';
import styles from './Map.less';
import mapMark from '../../../assets/mapmark.png';

const pointInfo = {
  width: 30,
  height: 30,
  layerId: 'eqLayer',
  id: 'eqPoint',
  src: mapMark,
};

@connect(
  state => ({
    map: state.ledger.map,
    eqGis: state.ledger.gis,
  })
)
export default class Map extends Component {
  static propTypes = {
    eqGis: propTypes.object.isRequired,
    map: propTypes.object,
  };
  static defaultProps = {
    map: null,
  };
  componentDidUpdate() {
    const { eqGis: { x, y } } = this.props;
    if (this.props.map && x && y) {
      this.props.map.mapDisplay.image({ ...pointInfo, x, y });
      this.props.map.centerAt({x, y});
    }
  }
  handleMapLoad = (map) => {
    const apiUri = `${map.mapCfg.api_path}/frame/arcgis_js_api/library/3.20/3.20/init.js`;
    const { eqGis: { gisId, x, y } } = this.props;
    this.props.dispatch({
      type: 'ledger/setMap',
      payload: map,
    });
    map.mapDisplay.image({ ...pointInfo, x, y });
    // const mapTool = new DrawPointMapTool(map.getMapObj(), apiUri, geom => {
    //   this.props.dispatch({
    //     type: 'ledger/setGis',
    //     payload: {
    //       gisId,
    //       x: geom.x,
    //       y: geom.y,
    //     },
    //   });
    // });
    // map.switchMapTool(mapTool);
  };
  render() {
    return (
      <div className={styles.map}>
        <CityMap mapId="ledger" onMapLoad={this.handleMapLoad} />
      </div>
    );
  }
}
