import React from 'react';
import { Pagination } from 'antd';
import { loadModules } from 'esri-loader';
import styles from './index.less';


export default class Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = { index: 0 };

    this.map = this.props.map.getMapObj();
    this.apiUrl = this.props.map.getApiUrl();

    this.onChange = this.onChange.bind(this);
    this.display = this.display.bind(this);
  }
  componentWillMount() {
    // 初始第一个图标高亮
    this.display(1);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.elements && this.props.elements !== nextProps.elements) {
      this.setState({ index: 0 });
    }
  }

  onChange(pageNumber) {
    this.display(pageNumber);
    this.setState({ index: pageNumber - 1 });
  }

  // 绘制点线
  display(index) {
    this.destory();
    // 默认第一个高亮显示
    loadModules([
      'esri/geometry/Point',
      'esri/symbols/SimpleLineSymbol',
      'esri/layers/GraphicsLayer',
      'esri/graphic',
      'esri/Color',
      'esri/symbols/PictureMarkerSymbol'], { url: this.apiUrl })
      .then(([
        Point,
        SimpleLineSymbol,
        GraphicsLayer,
        Graphic,
        Color,
        PictureMarkerSymbol]) => {
        const pointLayer = new GraphicsLayer({ id: 'selected-point-image' });
        const lineLayer = new GraphicsLayer({ id: 'selected-line-image' });
        const geom = this.props.elements[index - 1].geometry;
        // 新建ArcGIS 符号对象
        const markerSymbol = new PictureMarkerSymbol('images/map/location/' + index + '-selected.png', 25, 45);
        markerSymbol.setOffset(0, 20);
        // 点类型直接画图片
        if (geom.type === 'point') {
          this.map.centerAndZoom(geom, 18);
          pointLayer.add(new Graphic(geom, markerSymbol));
        } else if (geom.type === 'polyline') {
          const middlePoint = new Point((geom.paths[0][0][0] + geom.paths[0][1][0]) / 2,
            (geom.paths[0][0][1] + geom.paths[0][1][1]) / 2, geom.spatialReference);
          const lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
            new Color('#FF0000'),
            3);
          this.map.centerAndZoom(middlePoint, 18);
          lineLayer.add(new Graphic(geom, lineSymbol));
          lineLayer.add(new Graphic(middlePoint, markerSymbol));
        }
        this.map.addLayer(pointLayer);
        this.map.addLayer(lineLayer);
      });
  }

  destory = () => {
    // 清空地图标记
    const layer1 = this.map.getLayer('selected-point-image');
    const layer2 = this.map.getLayer('selected-line-image');
    layer1 && this.map.removeLayer(layer1);
    layer2 && this.map.removeLayer(layer2);
  };
  render() {
    if (!this.props.elements || this.props.elements.length === 0) {
      return <div />;
    }

    const element = this.props.elements[this.state.index];
    const keyValueArray = [];
    for (const prop in element.attributes) {
      if (element.attributes[prop]) {
        if (element.attributes[prop] === '空' || element.attributes[prop] === 'Null'
            || element.attributes[prop] === 'null') {
          element.attributes[prop] = '--';
        }
        keyValueArray.push({ key: prop, value: element.attributes[prop] });
      }
    }

    return (
      <div>
        <div className={styles.pageContent}>
          {
            keyValueArray.map(item => (
              <div key={item.key} className={styles.pageRow}>
                <span>{item.key}: </span>
                <span>{item.value}</span><br />
              </div>
            ))
          }
        </div>
        <Pagination
          simple
          className={styles.pagination}
          size="small"
          defaultPageSize={1}
          current={this.state.index + 1}
          total={this.props.elements.length > 20 ? 20 : this.props.elements.length}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
