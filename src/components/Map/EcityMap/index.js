import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styles from './index.less';
import ThematicContainer from '../common/ThematicContainer';
import Legend from '../Legend';
import EsriMap from '../EsriMap';
import MapToolbar from '../MapToolbar';
import {MapQuery, StaticQuery, AddrQuery} from '../MapQuery';
import QueryResult from '../QueryResult';
import Coordinate from '../Coordinate';
import ThematicStatistics from '../ThematicStatistics';
import MapSwitcher from '../MapSwitcher';
import ThematicPerson from '../common/ThematicPerson/ThematicPerson';
import ThematicCar from '../common/ThematicCar/ThematicCar';

export default class EcityMap extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      map: null,
      queryResults: null,
      xy: null,
      thematicStatisticsVisible: false,
      legendVisible: false,
      isxy: 1,
      isMapTool: 1,
      thematicPersonVisible: false,
      thematicCarVisible: false,
    };

    this.onMapCreated = this.onMapCreated.bind(this);
    this.setQueryResults = this.setQueryResults.bind(this);
    this.closeQueryResults = this.closeQueryResults.bind(this);
    this.setXy = this.setXy.bind(this);
    this.showThematicStatistics = this.showThematicStatistics.bind(this);
    this.showLegend = this.showLegend.bind(this);
  }

  componentWillUnmount() {
    this.state.map.clearLayerInterval();
  }
  /*
   ArcGISMap实例创建时调用
   */
  onMapCreated(arcGISMap) {
    this.setState({ map: arcGISMap });
    this.setState({
      isxy: arcGISMap.mapCfg.isxy,
      isMapTool: arcGISMap.mapCfg.isxy,
    });
    if (this.props.onMapCreated) {
      this.props.onMapCreated(arcGISMap);
    }
  }

  setQueryResults(results) {
    this.setState({ queryResults: results });
  }

  setXy(xyObj) {
    this.setState({ xy: xyObj });
  }

  closeQueryResults() {
    this.setState({ queryResults: null });
  }

  showThematicStatistics() {
    this.setState({ thematicStatisticsVisible: true });
  }

  closeThematicStatistics = () => {
    this.setState({ thematicStatisticsVisible: false });
  }

  showLegend() {
    this.setState({ legendVisible: true });
  }
  closeLegend = () => {
    this.setState({ legendVisible: false });
  }
  mapSwitcherOnchange = () => {
    if (this.props.mapSwitcherOnchange) {
      this.props.mapSwitcherOnchange();
    }
  };

  setLayer = (changeLayer) => {
    this.changeLayer = changeLayer;
  }

  onCloseThematicPerson = () => {
    this.setState({
      thematicPersonVisible: false,
    });
    this.state.map.setLayerVisibility('personTrack', false);
    this.setLayer(this.state.map.getLayers());
  }

  onCloseThematicCar = () => {
    this.setState({
      thematicCarVisible: false,
    });
    this.state.map.setLayerVisibility('carMonitor', false);
    this.setLayer(this.state.map.getLayers());
  }

  changeVisible = (name, check) => {
    this.setState({
      [name]: check,
    });
  }

  render() {
    const styleObj = {
      position: 'relative',
      top: 0,
      left: 0,
      borderColor: 'gray',
      borderWidth: 1,
      borderStyle: 'solid',
      backgroundColor: '#fff',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    };

    const {queryVisible, staticQeryVisible, addrQeryVisible} = this.state; // 显示控制状态

    const showElemnets = { // 显示入口
      onShowQuery: () => this.setState({ queryVisible: !queryVisible }),
      onShowStaticQuery: () => this.setState({ staticQeryVisible: !staticQeryVisible }),
      onShowAddrQuery: () => this.setState({ addrQeryVisible: !addrQeryVisible }),
    };

    const Elements = [ // 显示内容
      queryVisible && <MapQuery key="MapQuery" mapTarget={this.state.map} onClose={() => this.setState({queryVisible: false})} />,
      staticQeryVisible && <StaticQuery key="StaticQuery" mapTarget={this.state.map} onClose={() => this.setState({staticQeryVisible: false})} />,
      addrQeryVisible && <AddrQuery key="AddrQuery" mapTarget={this.state.map} />,
    ];

    const MapToolbarComp = this.state.isMapTool === 1 ?
      (<MapToolbar
        map={this.state.map}
        setLayer={this.setLayer}
        changeVisible={this.changeVisible}
        layers={this.state.map && this.state.map.getLayers()}
        onSetQueryResults={this.setQueryResults}
        onShowThematicStatistics={this.showThematicStatistics}
        onShowLegend={this.showLegend}
        {...showElemnets}
      />) : null;
    const CoordinateComp = this.state.isxy === 1 ? <Coordinate xy={this.state.xy} /> : null;
    const MapSwitcheComp = this.props.mapType === 'emer' ? null : <MapSwitcher mapSwitcherOnchange={this.mapSwitcherOnchange} map={this.state.map} />;
    return (

      <div id="ecityMap" style={styleObj}>
        <EsriMap
          mapId={this.props.mapId}
          onMapCreated={this.onMapCreated}
          onMapLoad={this.props.onMapLoad}
          onSetXy={this.setXy}
          mapType={this.props.mapType}
          ecode={this.props.ecode}
        />

        {/* <MapSearcher
          map={this.state.map}
        /> */}
        {MapSwitcheComp}
        {/* <MapSwitcher map={this.state.map} /> */}

        {MapToolbarComp}

        <ThematicPerson
          thematicPersonVisible={this.state.thematicPersonVisible}
          map={this.state.map}
          onClose={this.onCloseThematicPerson}
        />
        <ThematicCar
          thematicCarVisible={this.state.thematicCarVisible}
          map={this.state.map}
          onClose={this.onCloseThematicCar}
        />

        <QueryResult
          queryResults={this.state.queryResults}
          map={this.state.map}
          onCloseQueryResults={this.closeQueryResults}
        />

        <ThematicStatistics
          visible={this.state.thematicStatisticsVisible}
          ecode={this.props.ecode}
          onClose={this.closeThematicStatistics}
        />

        <Legend
          visible={this.state.legendVisible}
          onClose={this.closeLegend}
        />

        {Elements}

        {CoordinateComp}

        <ThematicContainer />
        {/* <div className={styles.mapFooter}> */}
        {/* <span>Copyright &copy; 2017 地理信息基础服务平台</span> */}
        {/* </div> */}
      </div>
    );
  }
}

EcityMap.propTypes = {
  /*
   mapId为挂载arcgis地图的<div>标签的id，取值请遵循HTML的id属性的命名规范
   mapId应该保持其唯一性，如果页面有多个地图，请确保其取值的唯一性
   */
  mapId: PropTypes.string.isRequired,

  /*
   类ArcGISMap的实例创建后，会调用此回调方法，参数为类ArcGISMap的实例
   如果仅仅是需要持有类ArcGISMap的实例供以后使用，请设置此回调方法
   注意：类ArcGISMap的实例只有在地图响应内置的load事件后，内部状态才能完全设置好。
   如果需要在地图加载时马上操作地图，应该提供onMapLoad方法。
   */
  onMapCreated: PropTypes.func,

  /*
   ArcGIS的map对象响应load事件的时候，会调用此回调方法，参数为类ArcGISMap的实例
   如果需要在地图加载时，马上自动进行定位、添加图形、添加自定义图层，或其他地图操作，请设置此回调方法
   */
  onMapLoad: PropTypes.func,

  mapType: PropTypes.string,
  ecode: PropTypes.string,
};

EcityMap.defaultProps = {
  onMapCreated: null,
  onMapLoad: null,
  mapType: 'base',
};
