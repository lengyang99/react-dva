/**
 * Created by remote on 2017/5/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import eventBus from '../../../utils/eventBus';

/** 把 iframe 包在一个组建里，设 shouldComponentUpdate 为 false */
class WrappedIframe extends React.Component {
  componentDidMount() {
    this.el.contentWindow._tool = { appEvent: eventBus, ...this.props };
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <iframe
        title="wapper"
        ref={(el) => {
          this.el = el;
        }}
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="0"
        src={this.props.src}
      >
        您的浏览器不支持嵌入式框架，或者当前配置为不显示嵌入式框架。
      </iframe>
    );
  }
}

/**
 * @prop {string} eventTarget
 * @prop {string} url
 */
WrappedIframe.propTypes = {
  eventTarget: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

WrappedIframe.defaultProps = {
  src: '',
};

export default WrappedIframe;
