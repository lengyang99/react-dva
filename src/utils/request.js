import React from 'react';
import fetch from 'dva/fetch';
import {notification} from 'antd';
import parseValues, {getCurrTk, getUserInfo} from './utils';
import store from '../index';


function checkStatus(response, randerTime) {
  const {dispatch} = store;
  dispatch({
    type: 'global/changeSpin',
    payload: {
      spinIndex: randerTime,
      showSpin: false,
    },
  });
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  notification.error({
    message: `请求错误 ${response.status}: ${response.url}`,
    description: response.statusText,
  });
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

/**
 * Requests a URL, returning a promise.
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @param  {boolean} [attach] The attach to determine "attach"
 * @param  {boolean} [noTk] without token
 * @param  {boolean} [noRandTime] with rand time
 * @param  {boolean} [addEcode]
 * @param  {boolean} [loading] global loading,default is "true"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options = {}, attach = false, noTk = false, noRandTime = false, addEcode = true, loading = true) {
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = {...defaultOptions, ...options};

  let ecode = '';
  let userInfo = getUserInfo();
  if (userInfo.user && userInfo.user.ecode) {
    ecode = userInfo.user.ecode;
  }

  let addEcodeFlag = addEcode;
  if (newOptions.body) {
    for (let key in newOptions.body) {
      if (newOptions.body.hasOwnProperty(key) && key === 'ecode') {
        addEcodeFlag = false;
        break;
      }
    }
  }

  if (url.indexOf('?') >= 0) {
    let getParams = parseValues(url);
    for (let key in getParams) {
      if (getParams.hasOwnProperty(key) && key === 'ecode') {
        addEcodeFlag = false;
        break;
      }
    }
  }

  if (newOptions.method === 'POST' || newOptions.method === 'PUT') {
    if (!attach) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      if (addEcodeFlag) {
        newOptions.body.ecode = ecode;
        addEcodeFlag = false;
      }
      newOptions.body = JSON.stringify(newOptions.body);
    }
  }

  const randerTime = new Date().getTime();
  if (!noTk) {
    const tk = getCurrTk();
    newOptions.headers = {...newOptions.headers, token: tk};
    let ii = url.indexOf('?');
    if (ii === -1) {
      url += '?';
    }
    url += `&token=${tk}`;
  }
  if (!noRandTime) {
    url += `&randerTime=${randerTime}`;
  }

  if (addEcodeFlag) {
    url += `&ecode=${ecode}`;
  }
  url += '&plat=pc';
  // 默认就有等待条
  // && !/emer/i.test(url)

  if (loading) {
    const {dispatch} = store;
    dispatch({
      type: 'global/changeSpin',
      payload: {
        spinIndex: randerTime,
        showSpin: true,
      },
    });
  }
  return fetch(url, newOptions)
    .then((response) => {
      // console.log(response);
      return checkStatus(response, randerTime);
    }).then(response => {
      return response.json().then((res) => {
        const {code} = res;
        if (code === '401' || code === 401) {
          const { dispatch } = store;
          dispatch({
            type: 'login/logout',
          });
          return;
        }
        return res;
      });
    }).catch((error) => {
      if (error.code) {
        notification.error({
          message: error.name,
          description: error.message,
        });
      }
      if ('stack' in error && 'message' in error) {
        notification.error({
          message: `请求错误: ${url}`,
          description: error.message,
        });
      }
      return error;
    });
}
