import React, { PureComponent } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import EqHead from './../component/EqHead';
import MaintainList from './MaintainList';

@connect(
  state => ({
    eqCode: state.ledger.eqCustom.eqCode,
    eqName: state.ledger.eqCustom.eqName,
    taskList: state.ledger.taskList,
    planList: state.ledger.planList,
  }),
)
export default class Maintain extends PureComponent {
  static propTypes = {
    eqCode: propTypes.oneOfType([propTypes.string, propTypes.number]),
    eqName: propTypes.string,
    taskList: propTypes.object.isRequired,
    planList: propTypes.object.isRequired,
  };
  static defaultProps = {
    eqCode: '',
    eqName: '',
  };
  state = {
    planId: '',
    pageNumberOfPlan: 1,
    pageNumberOfTask: 1,
  };
  setPlanId = planId => {
    this.setState({ planId });
  };
  setPageNumber = (type, current) => {
    if (type === 'plan') {
      this.setState({ pageNumberOfPlan: current});
    } else {
      this.setState({ pageNumberOfTask: current });
    }
  };

  render() {
    const { eqCode, eqName, taskList, planList } = this.props;
    const { pageNumberOfPlan, pageNumberOfTask } = this.state;
    return (
      <div>
        <EqHead id={eqCode} name={eqName} />
        <MaintainList
          planId={this.state.planId}
          setPageNumber={this.setPageNumber}
          pageNumber={pageNumberOfPlan}
          setPlanId={this.setPlanId}
          title="维护计划"
          rowKey="planId"
          type="plan"
          data={planList}
        />
        <MaintainList
          planId={this.state.planId}
          setPageNumber={this.setPageNumber}
          pageNumber={pageNumberOfTask}
          title="维护记录"
          rowKey="taskId"
          type="task"
          data={taskList}
        />
      </div>
    );
  }
}
