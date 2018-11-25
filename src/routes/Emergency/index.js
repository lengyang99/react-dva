import React from 'react';
import {getCurrTk} from "../../utils/utils"

export default class Emergency extends React.Component {

  constructor (props) {
    super(props);
    const url=`http://10.39.3.117:9001/zhyy/#/emer?token=${getCurrTk()}`;
    window.open(url);
  }
  render() {
    return null;
  }
}
