import React from 'react';
import { Tabs } from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import styles from './index.less';

const { TabPane } = Tabs;

export default class Legend extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  componentDidMount() {
  }

  render() {
    if (!this.props.visible) {
      return null;
    }

    return (
      <Dialog
        width={250}
        title="图例"
        position={
          { bottom: 85, right: 50 }}
        onClose={this.props.onClose}
      >
        <Tabs
          size="small"
          className={styles.tabs}
        >
          <TabPane tab="管点" key="1" className={styles.tabPane}>
            <div className={styles.tabPaneContent}>
              <img src="images/map/legend/管点.png" alt="管点图例" />
            </div>
          </TabPane>
          <TabPane tab="管段" key="2" className={styles.tabPane}>
            <div className={styles.tabPaneContent}>
              <img src="images/map/legend/管段.png" alt="管段图例" />
            </div>
          </TabPane>
        </Tabs>
      </Dialog>
    );
  }
}
