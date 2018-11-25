import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Card from './Card.jsx';
import styles from './CardList.css';
import { Pagination } from 'antd';

const FormatStr = 'YYYY/MM/DD';

export default class CardList extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    // clean state
  }

  render() {
    const { data, stationData, title, progressOption: { arrive, feedback, total }, pagination, titleExtra, patrolLayerInfo, authorityMenu } = this.props;
    const cards = [];
    for (let i = 0; i < data.length; i++) {
      const ii = data[i];
      const ta = ii.totalNum || 0;
      const tf = ii.totalFeedbackNum || 0;
      const tl = (ii.totalLine || 0) + (ii.totalKeyline || 0);
      const dol = (ii.arriveLine || 0) + (ii.arriveKeyline || 0);
      const stationId = stationData ? stationData[ii.stationid || ii.zoneId] : 0;
      let showArriveRate = ii.totalNum > 0; // 是否显示到位率
      let showFeedbackRate = ii.totalFeedbackNum > 0; // 是否显示反馈率
      let showOverRate = ii.totalLine > 0 || ii.totalKeyline > 0; // 是否显示覆盖率
      let patrolLayerList = []; // 记录任务点类型
      if (ii.layerids) {
        ii.layerids.split(',').map((ids) => {
          patrolLayerInfo.map((layers) => {
            if (ids === `${layers.gid}`) {
              if (patrolLayerList.toString().indexOf(layers.type) === -1) {
                patrolLayerList.push(layers.type);
              }
            }
          });
        });
      }
      const pgs = [
        {
          gid: ii.gid,
          color: 1,
          text: '覆盖长度',
          doing: dol > tl ? (tl / 1000).toFixed(2) : ((dol / 1000) < 0.01 && dol !== 0 ? 0.01 : (dol / 1000).toFixed(2)),
          total: (tl / 1000).toFixed(2),
          visible: showOverRate,
        },
        {
          gid: ii.gid,
          color: 1,
          text: '反馈数量',
          doing: ii.feedbackNum > tf ? tf : ii.feedbackNum,
          total: tf,
          visible: showFeedbackRate,
        },
        {
          gid: ii.gid,
          color: 0,
          text: '到位数量',
          doing: ii.arriveNum > ta ? ta : ii.arriveNum,
          total: ta,
          visible: showArriveRate,
        }
      ];

      const isFun = Object.prototype.toString.call(titleExtra) === '[object Function]';

      cards.push(<Card
        gid={stationId || ii.gid || ii.id}
        key={`card-${i}`}
        {...this.props.cardOption}
        title={ii[title] || ii.usernames}
        name={ii.name || ''}
        planType={ii.type}
        titleExtra={isFun ? titleExtra(ii) : ii[titleExtra]}
        stationName={ii ? ii.station : ''}
        taskStatus={ii ? ii.checkid : 0}
        progressData={pgs}
        foot={`${moment(ii.startTime).format(FormatStr)} ~ ${moment(ii.endTime).format(FormatStr)}`}
        footExtra={<a
          className={styles.extra}
        />}
        patrolLayerList={patrolLayerList}
        authorityMenu={authorityMenu}
        showTaskDetails={() => {
          this.props.detailClick && this.props.detailClick(ii, { tabList: patrolLayerList, showArriveRate: showArriveRate, showFeedbackRate: showFeedbackRate, showOverRate: showOverRate });
        }}
        delTask={() => { this.props.delTask && this.props.delTask(ii.gid) }}
        transferTask={() => { this.props.transferTask && this.props.transferTask(ii) }}
      />);
    }

    const pages = pagination ? (
      <Pagination {...pagination}
      />
    ) : null;
    return (
      <div>
        <ul className={styles.card}>
          {cards}
        </ul>
        {pages}
      </div >
    );
  }

  static defaultProps = {
    data: [],
    cardOption: {},
    moreHandleClick: f => f,
    detailClick: f => console.log(f),
    pagination: false,
    showFeedback: true,
  };

  static propTypes = {
    data: PropTypes.array,
    moreHandleClick: PropTypes.func,
    detailClick: PropTypes.func,
    titleExtra: PropTypes.any,
    title: PropTypes.any,
    cardOption: PropTypes.object,
    pagination: PropTypes.any,
    showFeedback: PropTypes.bool
  };
}

