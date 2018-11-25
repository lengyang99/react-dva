import React from 'react';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';

import styles from '../css/emerEventDetails.css';

export default class EmerEventDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  render = () => {
    const {emerEventDetails, onCancel} = this.props;
    return (
      <Dialog
        title="应急事件详情"
        width={570}
        onClose={onCancel}
        position={{
          top: 180,
          left: 400,
        }}
        modal
      >
        <div id={styles.emerEventDetails} style={{margin: 10}}>
          <table>
            <tbody>
              <tr>
                <td><span>事件名称：</span><span>{emerEventDetails.name}</span></td>
                <td><span>事件类型：</span><span>{emerEventDetails.typeName}</span></td>
              </tr>
              <tr>
                <td><span>事件级别：</span><span>{emerEventDetails.levelName}</span></td>
                <td><span>事件状态：</span><span>{emerEventDetails.statusName}</span></td>
              </tr>
              <tr>
                <td><span>事发单位：</span><span>{emerEventDetails.incidentUnit}</span></td>
                <td><span>事发时间：</span><span>{emerEventDetails.incidentTime}</span></td>
              </tr>
              <tr>
                <td><span>管道编码：</span><span>{emerEventDetails.pipeId}</span></td>
                <td><span>影响用户范围：</span><span>{emerEventDetails.influenceRange}</span></td>
              </tr>
              <tr>
                <td><span>上报人：</span><span>{emerEventDetails.reporter}</span></td>
                <td><span>上报人电话：</span><span>{emerEventDetails.reporterTel}</span></td>
              </tr>
              <tr>
                <td colSpan="2"><span>事发地址：</span><span>{emerEventDetails.incidentAddr}</span></td>
              </tr>
              <tr>
                <td colSpan="2"><span>人员伤亡情况：</span><span>{emerEventDetails.casualtyStatistic}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Dialog>
    );
  }
}

