import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import DragBox from '../../yd/DragBox';
import styles from './index.css';

const cx = classNames.bind(styles);

/**
 * 对话框
 */
class Dialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      moveable: false,
      show: true,
      min: false,
      bodyShow: true
    };
  }

  iHeight = '';
  minDlg = () => {
    this.setState({min: !this.state.min})
  }

  componentDidMount() {
    let container = this.refs.container;
    console.log(container.offsetHeight);
    const h = container.offsetHeight + 'px';
    this.iHeight = h;
    container.style.height = h;
    container.addEventListener("transitionend", this.tranHandle)
  }

  tranHandle = () => {
    this.setState({bodyShow: !this.state.min})
  };

  getStrLen = (str) => {
    let len = 0;
    if (str) {
      const arr = str.split('');
      arr.forEach((ele) => {
        if (/[\u4e00-\u9fa5]/.test(ele)) {
          len += 1;
        } else {
          len += 0.5;
        }
      });
    }
    return len * 14 + 80
  };

  render() {
    const titleWrapStyle = cx('dialog-title-wrap', 'titleWrapStyle');
    const btnWrapStyle = cx('dialog-btn-wrap', 'btnWrapStyle');
    let frameStyle = null;

    const {width, title, position} = this.props;

    let top = 200;
    let left = 0;
    let right = 0;
    let bottom = 0;
    let clientWidth = width || 354;
    let boundary = null;
    let name = '';
    let icon = '';
    if (typeof title === 'object') {
      name = title.name;
      icon = title.icon;
    }
    else {
      name = title;
    }
    // 图标
    const iconComp = icon !== '' ?
      (<img
        src={title.icon}
        alt="icon"
        style={{
          verticalAlign: 'middle',
        }}
      />) :
      null;

    if (position) {
      top = position.top || null;
      left = position.left || null;
      right = position.right || null;
      bottom = position.bottom || null;

      frameStyle = {
        width: width ? `${width}px` : null,
      };
      if (typeof top === 'number') {
        frameStyle.top = top;
      }
      else if (typeof bottom === 'number') {
        frameStyle.bottom = bottom;
      }
      if (typeof left === 'number') {
        frameStyle.left = left;
      }
      else if (typeof right === 'number') {
        frameStyle.right = right;
      }
    }
    else {
      frameStyle = {
        top: '200px',
        left: `calc(50% - ${clientWidth / 2}px)`,
        width: width ? `${width}px` : null,
      };
    }

    // 处理移动范围
    // 1/2 width 默认为117px
    if (typeof this.props.boundary === 'undefined' || this.props.boundary === '') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      right = ((windowWidth / 2) + (clientWidth / 2)) - 10;
      bottom = (windowHeight - top) - 10;

      boundary = {
        top: (-top),
        left: (-right),
        right,
        bottom,
      };
    }
    else {
      boundary = this.props.boundary;
    }

    const {min} = this.state;
    const {minable} = this.props;
    let titleStyle = {};
    if (min) {
      let mw = `${this.getStrLen(name)}px`;
      frameStyle = {
        ...frameStyle
        , width: mw,
        overflow: 'hidden'
      };
      titleStyle.width = mw;
    }
    frameStyle.height = min ? '35px' : this.iHeight;
    frameStyle.position = 'absolute';
    return (
      <DragBox
        show={this.state.show}
        boundary={boundary}
        modal={this.props.modal}
      >
        <div className={styles.div} style={frameStyle} ref="container">
          <div
            className={titleWrapStyle}
            unselectable="on"
            style={titleStyle}
            title={name}
          >
            {iconComp}
            <span style={{marginLeft: '9px'}}>{name}</span>

            <div
              className={btnWrapStyle}
              onClick={this.props.onClose}
              role="button"
              tabIndex={0}
            >
              ×
            </div>
            <div
              className={btnWrapStyle}
              onClick={this.minDlg}
              role="button"
              tabIndex={0}
            >
              {
                minable ? <span style={{
                  fontWeight: min ? 'normal' : 'bold'
                }}>{min ? '□' : '-'}</span> : null
              }
            </div>
          </div>
          <div className={styles.body}>
            <div style={{
              visibility: this.state.bodyShow ? 'visible' : 'hidden',
              transition: 'visibility 0.1s ease-out'
            }}>
              {this.props.children}
            </div>
          </div>
        </div>
      </DragBox>
    );
  }
}

Dialog.defaultProps = {
  title: 'Dialog',
  onClose: null,
  modal: false,
  boundary: 'body',
  position: null,
  width: null,
  minable: true,
};

/**
 * API
 * @prop {object|string}   title   对话框的标题和图标
 * @prop {string}   title.name
 * @prop {string}   title.icon
 * @prop {bool}     modal   是否为模态
 * @prop {function} onClose 点击关闭时的事件
 * @prop {(object|string)}   boundary 最小拖拽范围 {top, left, right, top}可以基于现在的位置向左向右向上向下移动多少
 * @prop {number}   width   对话框宽度
 * @prop {object}   position   对话框初始位置，top、left 优先级高于 bottom、right
 * @prop {number}   position.top
 * @prop {number}   position.left
 * @prop {number}   position.right
 * @prop {number}   position.bottom
 */
Dialog.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    }),
  ]),
  modal: PropTypes.bool,
  onClose: PropTypes.func,
  boundary: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      left: PropTypes.number,
      right: PropTypes.number,
      top: PropTypes.number,
      bottom: PropTypes.number,
    }),
  ]),
  position: PropTypes.object,
  width: PropTypes.number,
  minable: PropTypes.bool
};

export default Dialog;
