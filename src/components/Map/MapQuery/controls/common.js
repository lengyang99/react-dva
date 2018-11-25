import React from 'react';
import { Menu, message } from 'antd';
import styles from './style.less';

const random = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

const guid = () => `${random() + random()}-${random()}-${random()}-${random()}-${random()}${random()}${random()}`;

const event = document.addEventListener ? {
  addEvent: (el, type, fn) => el.addEventListener(type, fn, false),
  delEvent: (el, type, fn) => el.removeEventListener(type, fn, false),
} : {
  addEvent: (el, type, fn) => el.attachEvent(`on${type}`, fn),
  delEvent: (el, type, fn) => el.detachEvent(`on${type}`, fn),
};

const addEvent = (el, type, fn) => {
  if (el.length) {
    for (let i = 0; i < el.length; i++) {
      addEvent(el[i], type, fn);
    }
  } else {
    try {
      event.addEvent(el, type, fn);
    } catch (e) {
      //
    }
  }
};

const removeEvent = (el, type, fn) => {
  if (el.length) {
    for (let i = 0; i < el.length; i++) {
      removeEvent(el[i], type, fn);
    }
  } else {
    try {
      event.delEvent(el, type, fn);
    } catch (e) {
      //
    }
  }
};

const autoMessage = (res, noSucTip) => {
  const {msgCode, msg: content} = res;
  const success = msgCode === 0;
  if (noSucTip && success) return success;
  message[success ? 'success' : 'error'](content);
  return success;
};

const getMenu = (items, target, left, top, action) => {
  const menus = Array.isArray(items) ? items : (items && items.show && Array.isArray(items.menus) ? items.menus : []);
  if (menus.length < 1) return null;
  const select = (e) => {
    const {item: {props: {data}}} = e;
    action(data);
  };
  return (
    <div style={{position: 'fixed', left, top, zIndex: 1000}}>
      <Menu style={{border: '1px solid #e8e8e8', borderRadius: '4px'}} onSelect={select}>
        {
            menus.map((menu, i) => (
              <Menu.Item key={`${i * 1}`} className={styles.menu} data={{menu, target}}>
                <a target="_blank" rel="noopener noreferrer">{menu.name}</a>
              </Menu.Item>
            ))
          }
      </Menu>
    </div>
  );
};

class ContentTip extends React.Component {
  render() {
    const {style = {}, msg, msgStyle = {}} = this.props;
    return (
      <div style={{height: '100%', width: '100%', display: 'flex', flexWrap: 'nowarp', justifyContent: 'center', alignItems: 'center', ...style}}>
        <span style={{fontSize: '18px', fontWeight: 900, color: '#40a9ff', ...msgStyle}}>{msg}</span>
      </div>
    );
  }
}

export {guid, addEvent, removeEvent, autoMessage, getMenu, ContentTip};
