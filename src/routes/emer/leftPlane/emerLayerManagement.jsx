import React from 'react';
import {Table, Button} from 'antd';
import {connect} from 'dva';
import styles from '../css/emerLayerManagement.css';
import EmerEventDetails from '../emerEvent/emerEventDetails.jsx';

@connect(state => ({}))

export default class EmerLayerManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {

  }

  render() {
    return (
      <div className={styles.leftView} />
    );
  }
}
