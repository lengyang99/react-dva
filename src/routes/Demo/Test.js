/**
 * Created by hexi on 2017/11/27.
 */
import React from 'react';
import Iframe from '../../components/yd/WrappedIframe/WrappedIframe.js';
export default class Map extends React.Component {

  componentWillUnmount() {

  }

  render() {
    return (
      <Iframe src={'http://zhyy-mask-enn-adas.ipaas.enncloud.cn/login.html?data=eyJuYW1lIjoieGFueWtnIn0&nonce=abcd&timestamp=1506153402000&signature=A16DE2229FD2DF86EA44AADC338954B963DB7AA6'}>

      </Iframe>
    );
  }
}
