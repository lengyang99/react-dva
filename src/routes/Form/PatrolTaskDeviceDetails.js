import React from "react";
import { Row, Col } from 'antd';
import style from './index.less';

// 巡线任务设备详情
export default class PatrolTaskDeviceDetails extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }

  render() {
    const { patrolDeviceDetailsInfo } = this.props;
    console.log('patrolDeviceDetailsInfo', patrolDeviceDetailsInfo);
    const eqAttr = patrolDeviceDetailsInfo.fieldAliases || {};
    const eqInfo = (patrolDeviceDetailsInfo && patrolDeviceDetailsInfo.features && patrolDeviceDetailsInfo.features[0] && patrolDeviceDetailsInfo.features[0].attributes) || {};
    let eqInfoArr = [];
    const keySpan = 12;
    const valueSpan = 12;
    const regx = /[a-z]/i;
    for (let attr in eqAttr) {
      let key = eqAttr[attr];
      if (regx.test(key)) {
        continue;
      }
      let value = eqInfo[attr];
      eqInfoArr.push(
        <Row>
          <Col span={keySpan} style={{textAlign: 'right'}}><span className={style['patrolTaskDeviceDetails']}>{key}：</span></Col>
          <Col span={valueSpan}>{value}</Col>
        </Row>
      );
    }
    return (
      <div style={{ width: 320, height: 395, overflow: 'auto' }}>
        {eqInfoArr}
      </div>
    );
  }
}
