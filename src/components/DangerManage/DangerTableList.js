import React,{PureComponent} from 'react';
import {Table,Icon,Dropdown,Menu} from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';


export default class DangerTableList extends PureComponent{

  constructor(props){
    super(props);
    this.state={};
  };

  render(){

    const columns=[
      {
        title:'上报人',
        dataIndex:'reportername',
      },
      {
        title:'上报时间',
        dataIndex:'reportertime',
      },
      {
        title:'事件编号',
        dataIndex:'eventid',
      },
      {
        title:'地址',
        dataIndex:'address',
        render:(text,record,index)=><span title={text}>{text}</span>
      },
      {
        title:'状态',
        dataIndex:'statename',
      },
      {
        title:'备注',
        dataIndex:'remark',
        render:(text,record,index)=><span title={text}>{text}</span>
      },
      {
        title:'操作',
        render: (text, record, index) => {
          return(
            <div>
              <Link to={`/event-list-detail?eventtype=6&eventid=${record.eventid}`}>
                详情
              </Link>

            </div>
          );
        }
      },
    ];



    // const paginationProps={
    //   showSizeChanger:true,
    //   showQuickJumper:true,
    //   ...pagination,
    // };
    return(
      <div>
        <Table
          loading={false}
          columns={columns}
          dataSource={this.props.data}
          // pagination={paginationProps}
        />
      </div>
    );
  }

}

DangerTableList.defaultProps={
  data:[]
};
DangerTableList.propTypes={
  data:PropTypes.array,
}

