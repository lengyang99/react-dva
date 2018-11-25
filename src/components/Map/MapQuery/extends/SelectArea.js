import React from 'react';
import { Button, Tooltip, Row, Col } from 'antd';

const getTipBtn = (props, sicon) => {
  const {tip, icon, itarget, type, name = '', query} = props;
  const select = sicon === icon;
  return (
    <Tooltip key={tip} title={tip} placement="top">
      {
        itarget ? <Button type={type || (select ? 'primary' : 'default')} style={{marginLeft: '6px', padding: '0 8px'}} onClick={() => query(props)}>{itarget}</Button> :
        <Button type={type || (select ? 'primary' : 'default')} style={{marginLeft: '6px'}} icon={icon} onClick={() => query(props)}>{name}</Button>
      }
    </Tooltip>
  );
};

export default class Control extends React.Component {
  constructor(props) {
    super(props);
    const {geometry} = props.value || {};
    this.state = {geometry};
  }
  componentWillReceiveProps(nextProps) {
    if ('value' in nextProps) {
      const {value} = nextProps;
      this.setState(value);
    }
  }
  handleGeometryChange = (geometry) => {
    if (!('value' in this.props)) {
      this.setState({ geometry });
    }
    this.triggerChange({ geometry });
  }
  triggerChange = (changedValue) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, changedValue));
    }
  }
  render() {
    const { items = [], select = '', area = '', tip = '点此处添加区域☞'} = this.props;
    return (
      <div style={{marginTop: '-7px'}}>
        <Row key="row1" gutter={4}>
          <Col key="col1" span={9}><span style={{color: '#1890ff', paddingLeft: '8px', fontWeight: 900, whiteSpace: 'nowrap'}}>{area}</span></Col>
          <Col key="col4" span={15}><div style={{textAlign: 'right'}}><span style={{color: 'red'}}>{tip}</span>{items.map((x) => getTipBtn(x, select))}</div></Col>
        </Row>
      </div>
    );
  }
}
