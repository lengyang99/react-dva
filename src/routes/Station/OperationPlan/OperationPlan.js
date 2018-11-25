import React, {PureComponent} from 'react';
import {Tabs, Button,message, Tag, Input, Tooltip} from 'antd';

const TabPane = Tabs.TabPane;
import {connect} from 'dva';

import {routerRedux} from 'dva/router';

// import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from "./OperationPlan.less"

import TrendStatistics from './TrendStatistics';
import SupplyGas from './SupplyGas';
import OperationInsight from './OperationInsight';

const { CheckableTag } = Tag;
export default class OperationPlan extends PureComponent {
  constructor(){
    super()

    this.state = {
      curveType: "供气类型",
      isShowColor: true,
      tags: ['值班日志', '运行台账', '预防性维护', '故障列表'],
      inputVisible: false,
      inputValue: '',
    }
  }
 
  
    componentDidMount() {

     }


    handleClose = (removedTag) => {
      const tags = this.state.tags.filter(tag => tag !== removedTag);
      console.log(tags);
      this.setState({ tags });
    }
  
    showInput = () => {
      this.setState({ inputVisible: true }, () => this.input.focus());
    }
  
    handleInputChange = (e) => {
      this.setState({ inputValue: e.target.value });
    }
  
    handleInputConfirm = () => {
      const state = this.state;
      const inputValue = state.inputValue;
      let tags = state.tags;
      if (inputValue && tags.indexOf(inputValue) === -1) {
        tags = [...tags, inputValue];
      }
      this.setState({
        tags,
        inputVisible: false,
        inputValue: '',
      });
    }
  
    saveInputRef = input => this.input = input
    handleChange(tag, checked) {
      this.setState({curveType: tag});
      
    }
    changeColor(){
      this.setState({isShowColor: !this.state.isShowColor})
    }
  render() { 
    const { tags, inputVisible, inputValue } = this.state;
    const tagsFromServer = ['供气曲线', "压力曲线"];
    const runData = ["值班日志台账", "安全巡查记录台账", "压力容器检查台账", "环城高压台账", "LNG计量撬运行参数", "LNG罐区运行参数", "调压撬运行记录", "值班日志台账"]  
    return (

        <div className={styles.operationPlan}>
          <div className={styles.operationPlan_left + " " + styles.operationPlan_main + " " + styles.operationPlan_left1}>
            <span className={styles.operationPlan_titile}>运营洞察</span>
            <hr/>
            <div>
              <OperationInsight></OperationInsight>
            </div>
          </div>
          <div className={styles.operationPlan_right + " " + styles.operationPlan_main + " " + styles.operationPlan_right1}>
            <span className={styles.operationPlan_titile}>值班信息</span>
            <hr/>
            <div style={{ fontSize: 14}}>
              <p>值班长：仇爱军</p>
              <p>值班人：李玉华</p>
              <p>值班时间：2017-11-11 06:00:00</p>
            </div>
          </div>
           <div className={styles.operationPlan_left + " " + styles.operationPlan_main + " " + styles.operationPlan_left2}>
           <span className={styles.operationPlan_titile} >运行台账</span>
            <hr/>
            <ul>
              {runData.map((item, index)=>{
                return <li key={index} style={{cursor: 'pointer'}}>{item}</li>
              })}
            </ul>
          </div>
           <div className={styles.operationPlan_right + " " + styles.operationPlan_main + " " + styles.operationPlan_right2}>
              <span className={styles.operationPlan_titile}>快速开始</span>
              <hr/>
              <div style={{marginLeft: 15, marginTop: 10}}>
                {this.state.tags.map((tag, index) => {
                  const isLongTag = tag.length > 20;
                  const tagElem = (
                    <Tag key={tag}  style={{border: "none", margin: 15,fontSize: 14}}>
                      {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                    </Tag>
                  );
                  return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
                })}
                {this.state.inputVisible && (
                  <Input
                    ref={this.saveInputRef}
                    type="text"
                    size="small"
                    style={{ width: 78, margin: 15 }}
                    value={this.state.inputValue}
                    onChange={this.handleInputChange}
                    onBlur={this.handleInputConfirm}
                    onPressEnter={this.handleInputConfirm}
                  />
                )}
                {!this.state.inputVisible && <Button size="small" type="dashed" onClick={this.showInput} style={{marginLeft: 15 }}>+ 添加</Button>}
             </div>
          </div>
          <div className={styles.operationPlan_left + " " + styles.operationPlan_main + " " + styles.operationPlan_left3}>
            <span style={{marginRight: 45}} className={styles.operationPlan_titile}>趋势洞察</span>
            {" "}
            <Button size='small' onClick={this.changeColor.bind(this) } style={{backgroundColor: this.state.isShowColor ? "#0090FF" : "", marginRight: 10, marginTop: 10}} className={styles.operationPlan_b}>供气曲线</Button>
            <Button size='small' onClick={this.changeColor.bind(this) } style={{backgroundColor: this.state.isShowColor ? "" : "#0090FF"}}>压力曲线</Button>
            <hr/>
            <div className={styles.operationPlan_trend}>
              <TrendStatistics ></TrendStatistics>
            </div>
          </div>
           <div className={styles.operationPlan_right + " " + styles.operationPlan_main + " " + styles.operationPlan_right3}>
           <span className={styles.operationPlan_titile}>供气结构</span>
           <span style={{marginLeft: 60, color: '#999'}}>总供气量： 8212 （Nm³）</span>
            <hr/>
            <div>
              <SupplyGas></SupplyGas>
            </div>
          </div>
        </div>

    );
  }
}
