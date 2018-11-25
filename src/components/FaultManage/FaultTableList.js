import React,{PureComponent} from 'react';
import {Table,Pagination,Icon,Dropdown,Menu} from 'antd';
import PropTypes from 'prop-types';
import { Link } from 'dva/router';
import styles from '../../routes/Station/FaultManage.less';



export default class FaultTableList extends PureComponent{

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
                <Link to={`/event-list-detail?eventtype=5&eventid=${record.eventid}`}>
                  详情
                </Link>

            </div>
          );
        }
      },
    ];

    //表格分页
    const pagination={
      total:this.props.data.length,
      pageSize:5,
      pageSizeOptions:['5','10'],
      showQuickJumper:true,
      showSizeChanger:true,
      showTotal:function () {
        return<div style={{position:'absolute',left:'2%'}}>
          共{this.total} 条记录  第{this.current}/{this.total%this.pageSize==0?
          this.total%this.pageSize==0:Math.ceil(this.total/this.pageSize)}页
        </div>
      }
    };

    return(
      <div>
        <Table
          loading={false}
          columns={columns}
          dataSource={this.props.data}
          pagination={pagination}
        />
      </div>
    );
  }

}

FaultTableList.defaultProps={
  data:[]
};
FaultTableList.propTypes={
  data:PropTypes.array,
}

