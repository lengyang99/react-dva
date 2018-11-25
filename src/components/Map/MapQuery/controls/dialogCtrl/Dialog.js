import React from 'react';
import ReactDOM from 'react-dom';
import { Modal, Spin, Icon } from 'antd';
import Drag from './Drag';

import styles from '../style.less';

const extendObj = (obj1, obj2) => Object.assign(Object.assign({}, obj1), obj2);

const getClass = (className = '') => className.split(' ').filter(x => x);

const addClass = (source, target) => getClass(source).concat(getClass(target)).join(' ');

const delClass = (source, target) => { const dels = getClass(target); return getClass(source).filter(x => !dels.some(y => x === y)).join(' '); };

const appClass = (source, target) => addClass(delClass(source, target), target);

const getWrapClassName = (mask, wrapClassName) => (mask === true ? addClass(wrapClassName, `${styles.dialog} ${styles.dialog_mask}`) : addClass(wrapClassName, styles.dialog));

const getLocalStyle = (wrapClassName) => delClass(wrapClassName, styles.vertical_center_modal);

const getCenterStyle = (wrapClassName) => appClass(wrapClassName, styles.vertical_center_modal);

const getProps = (left, top, modle, props) => {
  const {mask, wrapClassName, style} = props;
  const wrapClass = getWrapClassName(mask, wrapClassName);
  const resilt = { visible: true, mask: false, maskClosable: false, maskStyle: {background: '#00000020'}, ...props, children: undefined, centered: false, style: extendObj(style, {margin: 0})};
  if (!(isNaN(left) || isNaN(top))) Object.assign(resilt, {style: extendObj(resilt.style, {left, top}), wrapClassName: getLocalStyle(wrapClass)});
  else if (props.center === true || props.centered) resilt.wrapClassName = getCenterStyle(wrapClass);
  if (modle) resilt.className = appClass(resilt.className, styles.dialog_min);
  return resilt;
};

const getModalProps = (target) => {
  const {left, top, modle, minModel} = target.state;
  return Object.assign(getProps(left, top, modle, target.props), getTitle(target, modle, minModel));
};

const getNormalTitle = (target) => <div className={styles.dialog_title} onMouseDown={() => { target.setState({drag: true}, () => target.drag.startDrag()); }}>{target.props.title}</div>;

const getMinTitle = (target, modle) => {
  const {closable = true} = target.props;
  const style = closable ? {marginRight: '42px'} : {borderRadius: '0 4px 0 0'};
  return (
    <div className={styles.dialog_title_min}>
      <div onMouseDown={() => { target.setState({drag: true}, () => target.drag.startDrag()); }}>
        <div ref={r => { Object.assign(target, {tbody: r}); }}>{target.props.title}</div>
      </div>
      <Icon type={modle === 0 ? 'shrink' : 'arrows-alt'} style={style} onClick={() => target.setState({modle: (modle + 1) % 2})} />
    </div>
  );
};

const getMinSize = (target) => {
  const {tbody, props: {width, closable = true}, state: {modle}} = target;
  if (tbody && modle) {
    const func = 'findDOMNode';
    const {scrollWidth: wd} = ReactDOM[func](tbody);
    return {width: wd + 42 * (closable ? 2 : 1), height: 43};
  } return {width};
};

const getTitle = (target, modle, minModel) => {
  if (minModel) {
    return {title: getMinTitle(target, modle), ...getMinSize(target)};
  } else return {title: getNormalTitle(target)};
};

export default class Dialog extends React.Component {
  state = {drag: false, modle: 0, minModel: false}
  componentWillMount() {
    const {left, top, minModel = false, mask} = this.props; // 在模态下 最小化无效
    Object.assign(this.state, {left: left * 1, top: top * 1, modle: 0, minModel: mask ? false : minModel});
  }
  render() {
    const {drag} = this.state;
    const {children, loading, loadmsg = '正在加载...'} = this.props;
    return (
      <div>
        <Modal ref={r => { this.dialog = r; }} {...getModalProps(this)}>
          <div className={styles.dialog_body}>{children}</div>
          {loading && <div className={styles.dialog_loading}><div><Spin size="large" spinning tip={loadmsg} /></div></div>}
          {drag && <Drag ref={r => { this.drag = r; }} target={this.dialog} onDraged={(e) => { this.setState({...e, drag: false}); }} />}
        </Modal>
      </div>
    );
  }
}

