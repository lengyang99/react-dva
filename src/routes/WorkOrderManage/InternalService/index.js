import React, { PureComponent } from 'react';
import { connect } from 'dva';
import StaffSelect from './StaffSelect';
import ServiceList from './ServiceList';

@connect(state => ({
  detailInfo: state.workOrder.detailInfo,
}))
class InternalService extends PureComponent {
  componentWillReceiveProps(nextProps, nextState) {
    console.log(nextProps.detailInfo);
    let list = [];
    if (nextProps.detailInfo.innerServiceinfo !== undefined) {
      list = nextProps.detailInfo.innerServiceinfo.data;
      const ratioList = list.map((item, index) => {
        const ratioStr = item.apportionmentRatio ? item.apportionmentRatio.replace('%', '') : '0';
        const ratioValue = ratioStr / 100;
        return ratioValue;
      });
      if (ratioList.length) {
        const total = ratioList.reduce((tem, item, index) => {
          return tem + item;
        });
        this.props.dispatch({
          type: 'service/setTotalRatio',
          payload: total,
        });
      } else {
        this.props.dispatch({
          type: 'service/setTotalRatio',
          payload: 0,
        });
      }
    }
    this.props.dispatch({
      type: 'service/setInternalServiceList',
      payload: list,
    });
  }
  render() {
    const { processInstanceId } = this.props;
    return (
      <div style={{margin: 20}}>
        <StaffSelect processInstanceId={processInstanceId} />
        <ServiceList />
      </div>
    );
  }
}

export default InternalService;
