import React from 'react';
import {Tabs} from 'antd';
import flatten from 'lodash/flatten';
import castArray from 'lodash/castArray';

import styles from './style.less';

const {TabPane} = Tabs;

export default class Control extends React.Component {
  render() {
    const {defaultActiveKey = '0', tabBarStyle = {margin: 0}, size = 'small', tabPosition = 'top', tabPaneStyle, onChange, children, tabs = [], props = {}} = this.props;
    const items = flatten(castArray(children || []));
    return (
      <div className={`${styles.tab} ${styles[`tab_${tabPosition}`]}`}>
        <Tabs size={size} tabPosition={tabPosition} defaultActiveKey={defaultActiveKey} {...props} tabBarStyle={tabBarStyle} onChange={onChange}>
          {
            items.map((item, idx) => {
                return (
                  <TabPane tab={tabs[idx]} key={`${idx * 1}`} >
                    <div className={`${tabPaneStyle || ''}`}>{item}</div>
                  </TabPane>
                );
            })
          }
        </Tabs>
      </div>
    );
  }
}
