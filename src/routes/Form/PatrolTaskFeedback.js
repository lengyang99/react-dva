import React from "react";
import Taskfeedback from "../../components/Taskdetail/Taskfeedback";

// 巡线任务设备反馈：阀门、庭院点、调压设备
export default class PatrolTaskFeedback extends React.Component {
  constructor() {
    super();
    this.state = {

    };
  }

  render() {
    // 反馈信息有待进一步处理
    const { patrolDeviceFeedbackInfo } = this.props;
    return <Taskfeedback detaildata={patrolDeviceFeedbackInfo} />;
  }
}
