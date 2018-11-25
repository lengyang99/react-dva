import React from 'react';
import PropTypes from 'prop-types';
import styles from './StationCard.less';
// import moment from 'moment';
import {Progress, Tooltip, Row, Col} from 'antd';

export default class StationCard extends React.PureComponent {
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

  render() {
    // const {title, titleExtra, foot, footExtra, data: {taskName, feedbackTime, taskCount, feedBackCount}} = this.props;
    const {title, titleExtra, foot, footExtra, data} = this.props;
    const id = this.props.gid || this.props.id;
    const bgColor = ['#1890ff', '#bd85cd', '#f8d473', '#6dcaec', '#abd275']
      [id ? id % 5 : Math.floor(Math.random() * 5)];
    const colors = ['#00a854', '#108ee9'];
    const status = ['success', 'active'];

    const ProgressContent = ({data: {color = 0, text, doing = 0, total = 0, date, visible = true}}) => {
      return (
        visible ?
        <div className={styles['progress-content']}>
          <div
            className={styles['progress-circle']}
            style={{
              borderColor: colors[color],
            }}
          />
          <label>{text}</label>
          <div className={styles['progress-progress']}
               style={{
                 width: `calc(100% - ${total > 99 ? 160 : 130}px)`
               }}
          >
            <Progress
              percent={(!total) ? 0 : (100 * doing / total)}
              showInfo={false}
              status={status[color]}
            />
          </div>

          <div className={styles['progress-into']}>
            <span style={{color: colors[color]}}>{doing}</span>
            {`/${total}`}
            <span style={{marginLeft: 5}}>{date}</span>
          </div>
        </div> : null

    )};
    // {
    //   <div className={styles.field}>
    //     <label>任务名称：</label>
    //     <label>{taskName}</label>
    //   </div>
    //   <div className={styles.field}>
    // <label>反馈时间：</label>
    //   <label>{feedbackTime ? moment(feedbackTime).format('YYYY-MM-DD HH:mm:ss') : '---'}</label>
    // </div>
    // }
    return (
      <div className={styles.card}>
        <div style={{
          padding: 10,
        }}
        >
          <div className={styles['card-head']}>
            <div className={styles['head-title']}>
              <div
                className={styles['head-avatar']}
                style={{
                  backgroundColor: bgColor,
                }}
              >{title && title.slice(-2)}
              </div>
              {title}
            </div>
            <div className={styles['head-extra']}>{titleExtra || null}</div>
          </div>
          {
            <div>
              <ProgressContent
                data={{
                  text: '反馈',
                  doing: data[0].feedbackCount,
                  total: data[0].totalCount,
                  date: data[0].unit,
                }}
              />
              <ProgressContent
                data={{
                  text: '反馈',
                  doing: data[1].feedbackCount,
                  total: data[1].totalCount,
                  date: data[1].unit,
                }}
              />
            </div>
          }
        </div>
        <div className={styles['card-foot']}>
          <div className={styles['foot-body']}>
            <Tooltip title={foot}>
              {foot}
            </Tooltip>
          </div>
          <div className={styles['foot-extra']}>{footExtra}</div>
        </div>

      </div>

    );
  }
}
