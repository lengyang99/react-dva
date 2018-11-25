import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import Toolbar from './ToolBar';
import Emaps from './Maps';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';

class Map extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      map: {},
      eqGis: {
        x: this.props.BasicMessageValue.longitude,
        y: this.props.BasicMessageValue.latitude,
      },
    };
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    this.setState({
      eqGis: {
        x: nextProps.BasicMessageValue.longitude,
        y: nextProps.BasicMessageValue.latitude,
      },
    });
  }
  getEqGis = (x, y) => {
    this.setState({
      eqGis: { x, y },
    });
  };
  getMaps = (map) => {
    this.setState({
      map,
    });
  };
  setLocation = () => {
    const { map } = this.state;
    const apiUri = `${map.mapCfg.api_path}/frame/arcgis_js_api/library/3.20/3.20/init.js`;
    const mapTool = new DrawPointMapTool(map.getMapObj(), apiUri, geom => {
      this.setState({
        eqGis: { x: geom.x, y: geom.y },
      });
    });
    map.switchMapTool(mapTool);
  };
  reloadData = () => {
    this.props.reloadData();
  };
  render() {
    const { gid, locName, locType, gisCode } = this.props.BasicMessageValue;
    const { eqGis } = this.state;
    console.log(this.props);
    return (
      <div>
        <Toolbar
          eqGis={eqGis}
          gisCode={gisCode}
          locName={locName}
          locType={locType}
          gid={gid}
          setLocation={this.setLocation}
          reloadData={this.reloadData}
        />
        <Emaps
          eqGis={eqGis}
          getEqGis={this.getEqGis}
          getMaps={this.getMaps}
        />
      </div>
    );
  }
}

export default Map;
