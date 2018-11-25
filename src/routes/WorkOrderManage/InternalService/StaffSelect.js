import React, { PureComponent } from 'react';
import { Select, Button, Row, Col, Input, message } from 'antd';
import { connect } from 'dva';
import qs from 'qs';
import styles from './StaffSelect.less';

const Option = Select.Option;
@connect(state => ({
  totalRatio: state.service.totalRatio,
  internalServiceList: state.service.internalServiceList,
}))
class StaffSelect extends PureComponent {
  handleSave = () => {
    const { totalRatio, internalServiceList, processInstanceId } = this.props;
    if (totalRatio > 1) {
      message.error('分配比例超过100%, 请重新分配');
    } else if (totalRatio < 1) {
      message.error('分配比例未达到100%, 请重新分配');
    } else {
      console.log(internalServiceList);
      this.props.dispatch({
        type: 'service/saveInnerService',
        payload: {
          datas: internalServiceList,
          processinstanceid: processInstanceId,
        },
      });
    }
  };
  componentDidMount() {

  }
  render() {
    const { internalServiceList, processInstanceId } = this.props;
    let sponsorList = [];
    let coordinatorList = [];
    let coordinatorSelectedList = [];
    if (internalServiceList && internalServiceList.length) {
      coordinatorList = internalServiceList.filter(item => item.isOrganiser !== '1');
      sponsorList = internalServiceList.filter(item => item.isOrganiser === '1');
      coordinatorSelectedList = coordinatorList.map(item => item.truename);
    }
    return (
      <Row className={styles.container}>
        <Col span={6}>
          <label htmlFor="sponsor">主办人:</label>
          <Input className={styles.sponsor} value={sponsorList.length ? sponsorList[0].truename : ''} disabled />
        </Col>
        <Col span={8}>
          <label htmlFor="coordinator">协办人:</label>
          <Select
            disabled
            className={styles.coordinator}
            mode="multiple"
            defaultValue={coordinatorSelectedList}
          >
            {
              coordinatorList.map((item, index) => {
                return (
                  <Option key={item.gid} value={item.truename}>{item.truename}</Option>
                );
              })
            }
          </Select>
        </Col>
        <Col span={6}>
          <Button type="primary" onClick={this.handleSave} style={{marginRight: 20}}>
            保存
          </Button>
          <Button type="primary">
            <a href={`/proxy/innerService/export?${qs.stringify({processinstanceid: processInstanceId, width: '', excelName: ''})}`}>导出</a>
          </Button>
        </Col>
      </Row>
    );
  }
}

export default StaffSelect;
