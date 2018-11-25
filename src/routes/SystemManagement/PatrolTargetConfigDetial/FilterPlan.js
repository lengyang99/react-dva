import React, { PureComponent } from 'react';
import { Table, Row, Col, Button, Icon, Select, Input } from 'antd';
import { connect } from 'dva';

const Options = Select.Option;

@connect(state => ({
  dataSource: state.PatrolTargetConfig.filterDataSource,
  filterOptions: state.PatrolTargetConfig.filterOptions,
}))
export default class FilterPlan extends PureComponent {
  add = () => {
    const { dataSource } = this.props;
    let [...list] = dataSource;
    list.push({
      term: '',
      mark: '',
      value: '',
      relation: dataSource.length ? '' : undefined,
    });
    this.props.dispatch({
      type: 'PatrolTargetConfig/setFilterData',
      payload: list,
    });
  };
  delete = (record) => {
    const { dataSource } = this.props;
    let [...list] = dataSource;
    list.splice(record.index, 1);
    this.props.dispatch({
      type: 'PatrolTargetConfig/setFilterData',
      payload: list,
    });
  };
  handleChange = (type, record, value) => {
    const { dataSource } = this.props;
    let newData = { ...dataSource[record.index], [type]: type === 'value' ? value.target.value : value};
    let [...list] = dataSource;
    list[record.index] = newData;
    this.props.dispatch({
      type: 'PatrolTargetConfig/setFilterData',
      payload: list,
    });
  };
  render() {
    const { dataSource, filterOptions } = this.props;
    const MARK = [
      {
        title: '大于',
        value: '>',
      },
      {
        title: '小于',
        value: '<',
      },
      {
        title: '等于',
        value: '=',
      },
      {
        title: '模糊',
        value: '~',
      },
    ];
    const columns = [
      {
        title: '条件关系',
        dataIndex: 'relation',
        render: (text, record) => (
          <Select
            disabled={!record.index}
            style={{ width: 80 }}
            value={record.relation}
            onChange={this.handleChange.bind(this, 'relation', record)}
          >
            <Options key="and">并且</Options>
            <Options key="or">或者</Options>
          </Select>
        ),
      },
      {
        title: '条件',
        dataIndex: 'term',
        render: (text, record) => (
          <Select
            style={{ width: 140 }}
            value={record.term}
            onChange={this.handleChange.bind(this, 'term', record)}
          >
            {
              filterOptions.map(item => (
                <Options key={item.name}>{item.alias}</Options>
              ))
            }
          </Select>
        ),
      },
      {
        title: '符号',
        dataIndex: 'mark',
        render: (text, record) => (
          <Select
            style={{ width: 80 }}
            value={record.mark}
            onChange={this.handleChange.bind(this, 'mark', record)}
          >
            {
              MARK.map(item => (
                <Options key={item.value}>{item.title}</Options>
              ))
            }
          </Select>
        ),
      },
      {
        title: '值',
        dataIndex: 'value',
        render: (text, record) => (
          <Input
            style={{ width: 140 }}
            value={record.value}
            onChange={this.handleChange.bind(this, 'value', record)}
          />
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        render: (text, record) => (
          <span>
            <Icon
              style={{fontSize: '20px'}}
              type="delete"
              onClick={this.delete.bind(this, record)}
            />
          </span>
        ),
      },
    ];
    return (
      <Row gutter={32}>
        <Col span={24}>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            showHeader={false}
            rowKey={(record) => record.index}
          />
        </Col>
        <Col span={4}>
          <Button onClick={this.add} type="primary"><Icon type="plus" />添加</Button>
        </Col>
      </Row>
    );
  }
}
