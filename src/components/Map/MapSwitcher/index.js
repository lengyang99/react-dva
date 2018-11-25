import React from 'react';
import { Radio } from 'antd';
import styles from './index.less';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


export default class MapSwitcher extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange = (e) => {
    this.props.mapSwitcherOnchange(e);
    this.props.map.loadMap(this.props.map.getMapCfg(), this.props.map.getDivId(), e.target.value, null);
  }

  render() {
    if (!this.props.map) {
      return null;
    }

    let visibleId = null;
    const groupContent = [];
    const baseMapArray = this.props.map.getMapCfg().map_base[0].maps;
    for (let i = 0; i < baseMapArray.length; ++i) {
      if (baseMapArray[i].visible == 1) {
        visibleId = baseMapArray[i].id;
      }
      groupContent.push(
        <RadioButton key={baseMapArray[i].id} value={baseMapArray[i].id}>
          {baseMapArray[i].name}
        </RadioButton>
      );
    }
    return (<div className={styles.mapSwitcher}>
      {
        groupContent.length > 1 ?<RadioGroup onChange={this.onChange} defaultValue={visibleId} size="small">
        {groupContent}
      </RadioGroup> : null
      }
    </div>);
  }
}
