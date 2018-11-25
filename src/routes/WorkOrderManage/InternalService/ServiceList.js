import React, { PureComponent } from 'react';
import { Table, Input } from 'antd';
import { connect } from 'dva';
import update from 'immutability-helper';

@connect(state => ({
  internalServiceList: state.service.internalServiceList,
}))
class ServiceList extends PureComponent {
  handleChange = (record, e) => {
    console.log(record, e.target.value);
    console.log(update(record, {$merge: {apportionmentRatio: e.target.value}}))
    this.props.dispatch({
      type: 'service/updateInternalServiceList',
      payload: update(record, {$merge: {apportionmentRatio: e.target.value}}),
    });
  };
  handleRatio = (record, e) => {
    this.props.dispatch({
      type: 'service/changeRatio',
      payload: update(record, {$merge: {apportionmentRatio: e.target.value}}),
    });
  };
  render() {
    const { internalServiceList } = this.props;
    const column = [{
      title: '姓名',
      dataIndex: 'truename',
      key: 'truename',
    }, {
      title: '工种',
      dataIndex: 'workType',
      key: 'workType',
    }, {
      title: '工分（或工时)',
      dataIndex: 'workHours',
      key: 'workHours',
    }, {
      title: '分摊比例',
      dataIndex: 'apportionmentRatio',
      key: 'apportionmentRatio',
      render: (text, record, index) => {
        return (
          <span>
            <Input
              style={{width: 100}}
              placeholder="分摊比例"
              value={record.apportionmentRatio}
              onChange={this.handleChange.bind('', record)}
              onBlur={this.handleRatio.bind('', record)}
            />
          </span>
        );
      },
    }, {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
    }];
    return (
      <Table
        dataSource={internalServiceList}
        columns={column}
      />
    );
  }
}

export default ServiceList;
