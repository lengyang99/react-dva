import React from 'react';
import ReactDOM from 'react-dom';
import {addEvent, removeEvent} from '../common';

import styles from '../style.less';

const evts = (el, type, func) => {
  addEvent(el, type, func);
  return () => removeEvent(el, type, func);
};

const evtsMng = (el) => {
  let events = [];
  return {
    add(type, func) {
      events.push(evts(el, type, func));
    },
    clear() {
      events.forEach(func => func());
      events = [];
    },
  };
};

const range = (start, end, val) => {
  if (val < start) return start;
  if (val > end) return end;
  return val;
};

const vals = () => {
  let source = null;
  return (val) => {
    if (source) return val - source;
    source = val; return 0;
  };
};

export default class Drag extends React.Component {
  state = {width: 0, height: 0, left: 0, top: 0}
  componentDidMount() {
    const {target} = this.props;
    const func = 'findDOMNode';
    const node = ReactDOM[func](target);
    const {ownerDocument, lastElementChild: {firstElementChild}} = node;
    this.element = {target: firstElementChild, body: ownerDocument.documentElement || ownerDocument.body};
    this.events = evtsMng(ownerDocument);
  }
  componentWillUnmount() {
    this.events.clear();
  }
  startDrag() {
    const {onDraged} = this.props;
    const {target, body} = this.element;
    const {clientWidth, clientHeight} = body;
    const {scrollWidth: width, scrollHeight: height, offsetLeft: left, offsetTop: top} = target;
    const maxWidth = clientWidth - width;
    const maxHeight = clientHeight - height;
    const lval = vals();
    const tval = vals();
    this.events.add('mousemove', (e) => {
      const {clientX: x, clientY: y} = e;
      this.setState({left: range(0, maxWidth, left + lval(x)), top: range(0, maxHeight, top + tval(y))});
    });
    this.events.add('mouseup', () => {
      this.events.clear();
      onDraged({left: this.state.left, top: this.state.top});
    });
    this.setState({width, height, left, top});
  }
  render() {
    const {width, height, left, top} = this.state;
    return <div className={styles.drag} style={{width: `${width}px`, height: `${height}px`, left, top}} />;
  }
}
