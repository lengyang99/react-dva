import React from 'react';
import EsriMap from '../../../components/Map/EsriMap';
import Coordinate from '../../../components/Map/Coordinate';

/**
 * 简化地图控件，去掉多余的工具栏等
 */
export default class MapCtrl extends React.Component {
  state = {};
  render() {
    const {isxy = 1, ...mapProps} = this.props;
    const {xy = {}} = this.state;
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative', border: '1px solid gray', boxSizing: 'border-box'}}>
        <EsriMap onMapCreated={() => { /* 没毛用的函数 但必须有，底层强制性调用，这里被迫为空 */ }} {...mapProps} onSetXy={(val) => this.setState({xy: val})} />
        {isxy && <Coordinate xy={xy} />}
      </div>
    );
  }
}
