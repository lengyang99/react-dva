import React from "react";
import { connect } from "dva";
import classnames from "classnames";
import styles from "./Equipment.less";

import { Tabs, Tag, Select, Icon, Button, Row, Col, Table } from 'antd';
const TabPane = Tabs.TabPane;
const CheckableTag = Tag.CheckableTag;
const Option = Select.Option;

class MaterielInfo extends React.Component{
  constructor({taskdetail}){
    super();

    this.state = {
      
    }
  }


 
  render(){
    const  columns = [
              {
                title: '物料编码',
                dataIndex: 'eqName',
              },
              {
                title: '物料名称',
                dataIndex: 'lastChangeTime', 
              }, 
              {
                title: '数量',
                dataIndex: 'arriveTime',
              },
              {
                title: '单位',
                dataIndex: 'feedbackTime',
              }
            ]
    const detaildata = [];
    
    const a = this.props.taskdetail.eqdetail.data || [];
    // const b = a[0] || [];
    const c = a.filter((item)=>{
      return item.alias === "物料信息"
    })
    const b = c[0] || [];
    const sbdetail = b.items || [];
    let al=a.length;
    return <div className={styles.equipment} style={{height: 'calc(100vh - 300px)', overflowY:'auto'}}>
      <div style={{marginBottom: 40}}>
        <h3><p style={{width: 5 , height: '100%', backgroundColor: '#444'}}></p>领料信息</h3>
        <div>
          <Row>
            <Col span={12}></Col>
            <Col span={12}></Col>
          </Row>
          <Row>
            <Col span={12}></Col>
            <Col span={12}></Col>
          </Row>
          <Row>
            <Col span={12}></Col>
            <Col span={12}></Col>
          </Row>
          <Row>
            <Col span={12}></Col>
            <Col span={12}></Col>
          </Row>
          <Row>
            <Col span={12}></Col>
            <Col span={12}></Col>
          </Row>
        </div>
        <h3><p style={{width: 5 , height: '100%', backgroundColor: '#444'}}></p>物料清单</h3>
        <Table 
          columns={columns} 
          dataSource={detaildata}
          rowKey="key"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger:true,
            pageSizeOptions: ["10", "20", "30", "40"]
          }}
        />
      </div>
    </div>
  }
}

export default connect(
  ({taskdetail}) => {
    return {
      taskdetail
    }
  }
)(MaterielInfo)

