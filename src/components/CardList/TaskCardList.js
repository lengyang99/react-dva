import React, {PureComponent} from 'react';
import {List} from 'antd';
import PropTypes from 'prop-types';
import StationCard from './StationCard';
import styles from './StationCard.less';

const FormatStr='YYYY/MM/DD ';
export default class TaskCardList extends PureComponent {

  constructor(props) {
    super(props);
  }

  render() {
    const {data = [],loading,stateValues} = this.props;
    console.log(data);
    const statusMap={};
    stateValues.forEach((dd)=>{
      statusMap[dd.name] = dd.alias;
    });
    const TitleExt = ({status})=>(
      <span style={status===2?{color:'red'}:{}}>
        {statusMap[status]}
      </span>
    );
    return (
      <List
        rowKey="planId"
        loading={loading}
        grid={{gutter: 24, lg: 4, md: 3, sm: 2, xs: 1}}
        dataSource={data}
        renderItem={item => (
          <List.Item key={item.equipmentUnitId}>
            <StationCard
              id={item.equipmentUnitId}
              data={item.summary}
              title={item.equipmentUnitName}
              titleExtra={<TitleExt {...item}/>}
              // foot={`${moment(item.startTime).format(FormatStr)} ~ ${moment(item.endTime).format(FormatStr)}`}
              foot={item.equipmentUnitName}
              footExtra={<a
                className={styles.extra}
                onClick={() => {
                  this.props.detailClick && this.props.detailClick(item);
                }}
              />}
            />
          </List.Item>
        )}
      />
    );
  }

  static defaultProps = {
    data: [],
    detailClick: f => f,
  };

  static proTypes = {
    data: PropTypes.array,
    detailClick: PropTypes.func,
    titleExtra: PropTypes.any,
    title: PropTypes.any,
  };
}
