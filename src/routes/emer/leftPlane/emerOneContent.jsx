import React from 'react';
import {Table, Button} from 'antd';
import {connect} from 'dva';
import s from '../css/emerMonitor.css'

@connect(state => ({}))

export default class emerOneContent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div style={this.props.style}>
        <div className={s.oneContent_title}>{this.props.title}</div>
        <div className={s.oneContent}>
          <div className={s.oneContent_body}>{this.props.body}</div>
        </div>
      </div>
    );
  }
}
