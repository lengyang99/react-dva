import React from 'react';
import request from '../../../../utils/request';
import {DialogCtrl} from '../controls';

export default class StreetView extends React.Component {
  componentWillMount() {
    const {uid} = this.props;
    const params = {uid, qt: 'poi'};
    request([`baiduVista/?_=${Date.parse(new Date())}`].concat(Object.keys(params).map(name => `${name}=${params[name]}`)).join('&')).then(res => {
      const {content: [{poiinfo: {PID: panoid, Dir: heading}}]} = res;
      const src = `https://map.baidu.com/#panoid=${panoid}&panotype=street&heading=${heading}`;
      this.setState({...this.state, src});
    });
  }
  render() {
    const {src} = this.state || {};
    const {width, height, title, close: onCancel} = this.props;
    return (
      <DialogCtrl mask center destroyOnClose {...{onCancel, title, width, footer: null, bodyStyle: {padding: 0}}}>
        <div style={{height, overflow: 'hidden'}}>
          {src && (<iframe title="街景" style={{marginTop: '-60px', width: 'calc(100% + 55px)'}} allowFullScreen frameBorder={0} height={`${height.replace('px', '') * 1 + 76}px`} src={src} >您的浏览器不支持iframe</iframe>)}
        </div>
      </DialogCtrl>
    );
  }
}
