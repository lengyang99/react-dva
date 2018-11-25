/**
 * Created by hexi on 2017/11/30.
 */
import React from 'react';

export default class Map extends React.Component {

  constructor (props) {
    super(props);

    window.open("http://zhyy-mask-enn-adas.ipaas.enncloud.cn/login.html?data=eyJuYW1lIjoieGFueWtnIn0&nonce=abcd&timestamp=1506153402000&signature=A16DE2229FD2DF86EA44AADC338954B963DB7AA6");
    //window.location.href = '';
  }

  componentWillmount() {
    console.log('test');
  }

  componentWillUnmount() {

  }

  render() {
    return (
      <div></div>
    );
  }
}
