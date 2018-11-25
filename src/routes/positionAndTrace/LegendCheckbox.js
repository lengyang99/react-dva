import React, { PureComponent } from 'react';
import { Checkbox, Row, Col, Icon } from 'antd';
import PropTypes from 'prop-types';

const CheckboxGroup = Checkbox.Group;
export default class LegendCheckbox extends PureComponent{
  static propTypes = {
    list: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
  };
  onChange = (type, values) => {
    this.props.onChange(type, values);
  };
  render() {
    const {list, type} = this.props;
    return (
      <div>
        <CheckboxGroup style={{ width: '100%' }} onChange={this.onChange.bind('', type)} defaultValue={list}>
          {
            list.map((item, index) => {
              return (
                <Row>
                  {item.type === 'point' ?
                    <Col>
                      <Checkbox value={item}>{item.name}</Checkbox>
                      {/* <span>{item.legend}</span> */}
                      <span>{item.number}</span>
                      <img src={item.color} style={{marginLeft: 30}}/>
                    </Col>
                    :
                    <Col>
                      <Checkbox value={item}>{item.name}</Checkbox>
                      <span>{item.number.toFixed(2)}</span>
                      <span style={{ width: 60, height: 5, background:item.color, display: 'inline-block', margin: '0 0 5px 30px' }}></span>
                    </Col>
                  }
                      
                </Row>
              );
            })
          }
        </CheckboxGroup>
      </div>
    );
  }
}
