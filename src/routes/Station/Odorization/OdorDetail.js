import React, { Component } from 'react';
import {connect} from 'dva';
import {Tabs,Input,Select,Button} from 'antd';
import {routerRedux,Link} from 'dva/router';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import styles from './index.less';
import parseValues from '../../../utils/utils';
const TabPane = Tabs.TabPane;
const TextArea = Input.TextArea;
@connect(({login,odorization}) => ({
    formData: odorization.formData,
    detailDtata: odorization.detailDtata,
    user: login.user,
  }))
export default class OdorDetail extends Component{
    constructor(props){
        super(props);
        this.initParams();
        this.state={

        }
    }
    operationType='';
    recordId='';
    initParams = () => {
        const { location: { search } } = this.props;
        const { operationType ,gid } = parseValues(search) || {};
        if (operationType && gid) {
            this.operationType=operationType;
            this.recordId=gid;
        } 
    }
    componentDidMount = () =>{
        this.props.dispatch({
            type: 'odorization/getFormData',
            payload: {
                recordId:this.recordId,
            },
        });
    }
    goBack = () =>{
        this.props.dispatch(routerRedux.push(`Odor-record`));
    }
    render(){
        const {formData}=this.props;
        const data =formData && formData.params && formData.params.length!==0? formData.params : [];
        return (
            <PageHeaderLayout showBack={true}>
                <Tabs
                defaultActiveKey='1'
                >
                    <TabPane
                        tab={this.operationType}
                        key="1"
                    >
                        {data.map((item, idx) => {
                            let alias = '';
                            if(item.alias === '场站加注'){
                                alias = '管网加臭'
                            }else if(item.alias === '场站补液'){
                                alias = '场站加注'
                            }
                             return(
                             <div key={item.id} className={styles.container} >   
                             <div className={styles.order}>
                                    <div className={styles.title} />
                                    <span className={styles.titleSpan}>{alias}</span>
                                </div>
                                {(item.items || []).map((item2, i) => {
                                  return <div key={item2.gid} className={styles['field-block2']}>
                                        <label>{`${item2.alias} :`}</label>
                                        <Input readOnly className={styles.input3} value={item2.value} />
                                    </div>
                                })}
                                </div>)
                            })}
                        <Button type='primary' style={{left:'47%',marginBottom:'10px'}} onClick={this.goBack}>返回</Button>
                    </TabPane>
                </Tabs>
            </PageHeaderLayout>
        )
    }
} 