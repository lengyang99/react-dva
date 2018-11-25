import React, { PureComponent } from 'react';
import { connect } from 'dva';
import List from './List';
import Dialog from '../../../IchAccount/Dialog';

@connect(state => ({
  userDetail: state.ichAccountDetail.userDetail,
}))
class Regulator extends PureComponent {
  componentDidMount() {
    const { userDetail } = this.props;
    this.props.dispatch({
      type: 'ichAccountDetail/fetchConnectedRegulator',
      payload: {
        gshId: userDetail && userDetail.gid,
      },
    });
  }
  render() {
    return (
      <div>
        <List />
        <Dialog />
      </div>
    );
  }
}

export default Regulator;
