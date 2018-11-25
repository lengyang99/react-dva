import React from 'react';
import {Table, Button} from 'antd';
import {connect} from 'dva';
import s from '../css/emerMonitor.css'

@connect(state => ({}))

export default class emerLeftPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className={s.leftPanel}>
        {this.props.content.map((e) => e)}
      </div>
    );
  }
}
