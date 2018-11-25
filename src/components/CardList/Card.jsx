import React from 'react';
import PropTypes from 'prop-types';
import { Progress, Dropdown, Menu, AutoComplete, Tooltip, Popconfirm } from 'antd';
import styles from './Card.css';
import { width } from 'window-size';

export default class Card extends React.PureComponent {
  static propTypes = {
    title: PropTypes.string,
    titleExtra: PropTypes.any,
    progressData: PropTypes.array,
    foot: PropTypes.any,
    footExtra: PropTypes.any,
  };
  static defaultProps = {
    title: '标题',
    foot: '卡片页脚',
    progressData: [],
  };

  // 下拉菜单项改变
  onSelectMenuItem = (menuObj) => {
    const { showTaskDetails, delTask, transferTask } = this.props;
    let menuText = menuObj.item.props.children;
    switch (menuText) {
      case '详情':
        showTaskDetails();
        break;
      case '删除':
        
        break;
      case '转交':
        transferTask();
        break;
      default:
        break;
    }
  }

  render() {
    const { name, title, titleExtra, progressData, foot, footExtra, visible, authorityMenu, stationName, taskStatus, planType, delTask } = this.props;
    const id = this.props.gid || this.props.id;
    const bgColor = ['#FD9D36', '#FFD11C', '#1890FF', '#22AC38', '#9790ED']
    [id ? id % 5 : Math.floor(Math.random() * 5)];
    const colors = ['#00a854', '#108ee9'];
    const status = ['success', 'active'];
    const ProgressContent = ({ data: { color = 0, text, doing = 0, total = 0, visible = true } }) => (
      visible ?
        <div className={styles['progress-content']}>
          <div
            className={styles['progress-circle']}
            style={{ borderColor: colors[color] }}
          />
          <label>{text}</label>
          <div className={styles['progress-progress']}
            style={{ width: 90 }}
          >
            <Progress
              percent={(!total) ? 0 : (100 * doing / total)}
              showInfo={false}
              status={status[color]}
            />
          </div>

          <div className={styles['progress-into']}>
            <span><span style={{ color: colors[color] }}>{doing}</span><span>{text === '覆盖长度' ? `/${total}km` : `/${total}个`}</span></span>
            {Number(total) === 0 ?
              <span style={{ marginLeft: 15}}>0%</span>
              :
              <span style={{ marginLeft: 15}}>{`${((doing / total) * 100).toFixed(0)}%`}</span>
            }
          </div>
        </div > : null

    );
    const grs = progressData.map((item, index) => (
      <ProgressContent key={`progress-${index}`} data={{ ...item }} />
    ));
    const authorityMenuList = (
      <Menu onClick={this.onSelectMenuItem}>
        {
          authorityMenu.map((item, index) => {
            if(item === '删除'){
              return (<Menu.Item key={`${index}`}>
                      <Popconfirm title="确定要删除此任务吗?" onConfirm={() => delTask()} okText="确定" cancelText="取消" placement="topLeft">
                        <a href="#">{item}</a>
                      </Popconfirm>
                    </Menu.Item>);
            }else{
              return (<Menu.Item key={`${index}`}>{item}</Menu.Item>);
            }
          })
        }
      </Menu>
    );
    const areaName = stationName && stationName.length > 15 ? `${stationName.substr(0, 15)}...` : stationName;
    const tempTitle = title ? title.split(',').join('、').toString() : '';
    const areaManager = tempTitle.length > 15 ? `${tempTitle.substr(0, 15)}...` : tempTitle;
    const taskIsOk = taskStatus === 1 ? true : false;
    return (
      <li className={styles.card}>
        <div style={{
          padding: 10,
        }}
        >
          <div className={styles['card-head']}>
            <div className={styles['head-title']}>
              <div className={styles['head-title-area']}>
                {
                  stationName && stationName.length > 12 ?
                    <Tooltip placement="rightTop" title={stationName}>{areaName}</Tooltip> :
                    areaName
                }
              </div>
              <div className={styles['head-title-manager']}>
                {
                  tempTitle.length > 12 ?
                    <Tooltip placement="rightTop" title={tempTitle}>{areaManager}</Tooltip> :
                    areaManager
                }
              </div>
              <div className={styles['head-title-name']}>
                {
                  name && name.length > 18 ?
                    <Tooltip title={name}>(<b>{planType === 1 ? '常规' : '临时'}</b>){name}</Tooltip> :
                    <span>(<b>{planType === 1 ? '常规' : '临时'}</b>){name}</span>
                }
              </div>
            </div>
            <div
              className={styles['head-extra']}
              style={{ backgroundColor: `${taskIsOk ? '#F67F0E' : '#36BAFE'}` }}
            >
              {titleExtra || null}
            </div>
          </div>
          <div className={styles['process-box']}>
            {grs}
          </div>
        </div>
        <div className={styles['card-foot']}>
          <div className={styles['foot-body']}>
            {foot}
          </div>
          <div className={styles['foot-extra']}>
            <Dropdown
              overlay={authorityMenuList}
              trigger={['click']}
            >
              {footExtra}
            </Dropdown>
          </div>
        </div>

      </li>

    );
  }
}
