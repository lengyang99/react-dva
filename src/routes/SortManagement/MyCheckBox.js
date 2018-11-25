import React, {PureComponent} from 'react';
import {Checkbox} from 'antd';

class MyCheckBox extends PureComponent {
  componentDidMount = () => {
  }
  render() {
    return (
      <Checkbox
        checked={this.props.value}
        onChange={this.props.onChange}
        style={this.props.style}
      >
        {this.props.text}
      </Checkbox>
    );
  }
}

export default MyCheckBox;
