import React, {PureComponent} from 'react';
import {Button, message, Table, Input, Select, } from 'antd';
import {connect} from 'dva';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './SpareParts.less';
const Option = Select.Option;

@connect(
    state => ({
    data: state.spareParts.dataList,
    factory: state.spareParts.factoryList,
}))
  
export default class SpareParts extends PureComponent {
  state={
    loading: true,
    total: 0,
    factoryCode: '0',
    des:'',
  }

  componentDidMount() {
    this.props.dispatch({
        type: 'spareParts/getList',
        params: {pageno: 1,pagesize: 10},
        callback: ({msg,success,total})=>{
            this.setState({
                total: total,
            });
        }
    });

    this.props.dispatch({
        type: 'spareParts/getFactory',
    });
    this.setState({
        loading: false,
    });
  }

  //搜索
  query = () => {
    this.setState({
        loading: true,
    });
    let param = this.getParam();
    this.props.dispatch({
        type: 'spareParts/getList',
        params: param,
        callback: ({msg,success,total})=>{
            if (success) {
                this.setState({
                    loading: false,
                    total: total,
                });
            }
        }
    });
  }

  handleInputChange = (value) => {
    this.setState({
        des: value,
    });
  }

  handleSelectChange = (value) => {
    this.setState({
        factoryCode: value,
    });
  }

  //重置
  clear = () => {
      this.setState({
        loading: true,
        des: "",
        factoryCode: "0",
      });
      this.props.dispatch({
        type: 'spareParts/getList',
        params: {pageno: 1,pagesize: 10},
        callback: ({msg,success,total})=>{
            if (success) {
                this.setState({
                    loading: false,
                    total: total,
                });
            }
        }
    });
  }

  getParam = () => {
    let param = {};
    if (this.state.factoryCode == 0) {
        param = {
            pageno: 1,
            pagesize: 10,
            des: this.state.des,
            factoryCode: "",
        };
    } else {
        param = {
            pageno: 1,
            pagesize: 10,
            des: this.state.des,
            factoryCode: this.state.factoryCode,
        };
    }
    return param;
  }
  //分页改变时回调
  handleTableChange = (pagination) => {
    this.setState({
        loading: true,
    });
    let param = this.getParam();
    if (typeof(param) != "undefined") {
        param.pageno = pagination.current;
        param.pagesize = pagination.pageSize;
    }
    
    this.props.dispatch({
        type: 'spareParts/getList',
        params: param,
        callback: ({msg,success})=>{
            this.setState({
                loading: false,
            });
        }
    });
  }

  render() {
    const {data,factory} = this.props;
    //定义列
    const cols = [
        {title: '工厂编码', dataIndex: 'faccode',},
        {title: '工厂名称', dataIndex: 'facname',},
        {title: '物料编码', dataIndex: 'code',},
        {title: '物料名称', dataIndex: 'des',},
        {title: '分组', dataIndex: 'groupdes',},
        {title: '库存地', dataIndex: 'loction',},
        {title: '单位', dataIndex: 'unitname',},
        {title: '数量', dataIndex: 'number',},
    ];

    //定义分页
    const paginationProps = {
        total: this.state.total,
        showSizeChanger: true,
        showQuickJumper: true,
        defaultPageSize: 10,
        pageSizeOptions: ['10', '20', '30', '40'],
        showTotal: (total,range)=>{
            return <div> 共 {total} 条记录 </div>;
        } 
    };

    return (
      <PageHeaderLayout>
        <div className={styles['field-block']}>
            <label>快速搜索：</label>
        </div>
        <div className={styles['field-block']}>
            <label>工厂：</label>
            <Select className={styles.select} allowClear value={this.state.factoryCode} onChange={(value)=>{this.handleSelectChange(value)}}>
                <Option key="0">全部</Option>
                {(factory || []).map(item => {
                  return <Option key={item.faccode}>{item.facname}</Option>
                })}
            </Select>
        </div>
        <div className={styles['field-block']}>
            <Input className={styles.input} value={this.state.des} placeholder='物料编码，物料名称' onChange={(e)=>{this.handleInputChange(e.target.value)}}/>
        </div>
        <Button type="primary" icon="search" style={{marginLeft: '25px'}} onClick={this.query}>查询</Button>
        <Button style={{marginLeft: '25px',width: '85px'}} onClick={this.clear}>重置</Button>
        <div style={{marginTop: '20px'}}>
            <Table 
                   // loading={this.state.loading}
                    bordered rowKey={record => record.gid + record.faccode}
                    columns={cols} dataSource={data || []}
                    pagination={paginationProps}
                    onChange={(pagination) => { this.handleTableChange(pagination) }} />
        </div>
      </PageHeaderLayout>
    );
  }
}
