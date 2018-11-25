import React, {PureComponent} from 'react';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import {connect} from 'dva';

import { routerRedux } from 'dva/router';

//import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import CardList from '../../components/CardList/CardList';
import TaskSearch from '../../components/SearchPanel/TaskSearch';

@connect(state => ({
  data: state.maintain.data,
  areaData: state.maintain.areaData,
}))
export default class TaskOne extends PureComponent {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
      console.log(this.props.location,"开始单个任务获得数据");
      this.props.dispatch({
        type: 'maintain/querySummary',
        payload: {
          planId: this.props.location.state.planId,
          function: "valve",
        }
      });
    
  }

  render() {
    console.log(this.props,"单个任务");
    const {data,areaData} = this.props;    
    return (
      <div style={{backgroundColor:'#fff'}}>
        <TaskSearch
          station={areaData}
          expOnChange={(data) => {

          }
          }
        >
        </TaskSearch>
        <CardList
          progressOption={
            {
              arrive: 'arriveCount',
              feedback: 'feedBackCount',
              total: 'taskCount',
            }
          }
          title="assigneeName"
          titleExtra="完成"
          list={data["valve"]|| []}
          detailClick={this.detailHandle}
        />
      </div>
    );
  }
}
