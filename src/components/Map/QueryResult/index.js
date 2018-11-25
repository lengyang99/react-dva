import React from 'react';
import { Tabs, Icon } from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import Page from './Page';
import styles from './index.less';

const { TabPane } = Tabs;

export default class QueryResult extends React.Component {
  constructor(props) {
    super(props);

    this.close = this.close.bind(this);
  }

  close = () => {
    // 清空地图标记
    const layer1 = this.props.map.getMapObj().getLayer('selected-point-image');
    const layer2 = this.props.map.getMapObj().getLayer('selected-line-image');
    layer1 && this.props.map.getMapObj().removeLayer(layer1);
    layer2 && this.props.map.getMapObj().removeLayer(layer2);
    // 清空地图标记
    const layer3 = this.props.map.getMapObj().getLayer('query-point-image');
    const layer4 = this.props.map.getMapObj().getLayer('query-line-image');
    layer3 && this.props.map.getMapObj().removeLayer(layer3);
    layer4 && this.props.map.getMapObj().removeLayer(layer4);
    this.props.onCloseQueryResults();
  };

  render() {
    if (!this.props.queryResults || this.props.queryResults.length === 0) {
      return null;
    }

    const tabPanes = this.props.queryResults.map(layer => (
      <TabPane tab={layer.layerName} key={layer.layerId}>
        <Page elements={layer.elements} map={this.props.map} />
      </TabPane>
    ));

    return (
      <Dialog
        width={340}
        title="查询结果"
        position={
          { top: 150, left: 20 }}
        onClose={this.close}
      >
        <Tabs
          size="small"
          className={styles.tabs}
        >
          { tabPanes }
        </Tabs>
      </Dialog>
    );
  }
}
