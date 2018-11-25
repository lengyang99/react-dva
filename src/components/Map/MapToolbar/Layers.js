import React from 'react';
import { Popover, Switch } from 'antd';
import styles from './index.less';
import ThematicPerson from '../common/ThematicPerson/ThematicPerson';
import ThematicCar from '../common/ThematicCar/ThematicCar';

export default class Layers extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layers: null,
    };
  }

  componentDidMount() {
    this.props.setLayer(this.changeLayers.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.layers) {
      this.setState({ layers: nextProps.layers });
    }
  }

  changeLayers = (layer) => {
    this.setState({ layers: layer });
  }

  showLayer(layerId, checked) {
    // 车辆监控和人员监控去定时器
    if (layerId === 'personTrack') {
      this.props.changeVisible('thematicPersonVisible', checked);
    }
    if (layerId === 'carMonitor') {
      this.props.changeVisible('thematicCarVisible', checked);
      this.props.map.clearLayerInterval();
    }
    this.props.map.setLayerVisibility(layerId, checked);
    this.setState({ layers: this.props.map.getLayers() });
  }

  render() {
    let layerContent = null;
    if (this.state.layers) {
      const mapService = this.state.layers.mapService.slice(0);
      const layerList = mapService.concat(this.state.layers.mapThematic.slice(0));
      layerList.reverse();

      layerContent = (
        <ul style={{ margin: 0, padding: 0 }}>
          {
            layerList.map(item =>
              (
                <li key={item.id} className={styles.layer}>
                  <Switch
                    size="small"
                    onChange={(checked) => { this.showLayer(item.id, checked); }}
                    checked={item.visible === 1}
                    style={{ float: 'left', display: 'inline-block' }}
                  />
                  <span style={{
                    float: 'left',
                    display: 'inline-block',
                    marginLeft: 10,
                    fontSize: '12px',
                    lineHeight: '16px' }}
                  >
                    {item.name}
                  </span>
                  <div style={{ clear: 'both' }} />
                </li>
              )
            )
          }
        </ul>
      );
    }

    return (
      <div>
        <Popover placement="leftTop" title="图层控制" content={layerContent}>
          <button
            type="button"
            id="layerBtn"
            className={`${styles.toolbarBtn} ${styles.layerImg}`}
            title="图层控制"
          />
        </Popover>
      </div>
    );
  }
}

