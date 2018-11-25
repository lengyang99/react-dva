import React from "react";
import { connect } from "dva";
import classnames from "classnames";
import styles from "./Equipment.less";

import { Tabs, Tag, Select, Icon, Button, Row, Col } from 'antd';
const TabPane = Tabs.TabPane;
const CheckableTag = Tag.CheckableTag;
const Option = Select.Option;

class Equipment extends React.Component{
  constructor({taskdetail, props}){
    super(props);

  }

  render(){
    const allData = this.props.taskdetail.eqdetail.data || [];
    const eqInfo = allData.filter((item)=>{
      return item.alias === "设备信息"
    });
    const sbdetail = eqInfo[0] ? (eqInfo[0].items ?eqInfo[0].items : []) : [];
    let al = allData.length;
    return al > 0 ? <div className={styles.equipment} style={{height: 'calc(100vh - 300px)', overflowY:'auto'}}>
      {sbdetail.length > 0 && sbdetail.map((item, index)=>{
        if(item.visible === 1){
          return <p key={index}>
            <Row>
              <Col span={8}  style={{textAlign: 'right'}}>
              <b>{item.alias}:</b>
              </Col>
              <Col span={16} style={{textAlign: 'left'}}>
                <span style={{marginLeft: 20}}>{item.value}</span>
              </Col>
            </Row>
          </p>
        }})
      }     
    </div>:null
  }
}

export default connect(
  ({taskdetail}) => {
    return {
      taskdetail
    }
  }
)(Equipment)

