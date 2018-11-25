import React from 'react';
import {connect} from 'dva';
import { Row, Col, Modal} from 'antd';
import styles from './Taskfeedback.less';
import {getAttachUrl} from '../../services/api';
import SeeMediaInfo from '../../routes/commonTool/SeeMedia/SeeMediaInfo';

class Taskfeedback extends React.Component {
  constructor() {
    super();
    this.state = {
      visible: false,
      imgId: '',
    };
  }

  bigPic = (a) => {
    // this.refs.bigPic.style
    this.setState({
      visible: true,
      imgId: a,
    });
  };
   handleCancel = (e) => {
     this.setState({
       visible: false,
     });
   }
   changeIcon = (item) => {
     console.log(item, 'item');
     const {value} = item || '';
     if (item.type === 'RDO') {
       return item.value;
       //  return item.value === '是' ? <Icon type="check-circle" style={{color: 'green'}} /> : <Icon type="close-circle" style={{color: 'red'}} />;
     } else if (item.type === 'IMG' || item.type === 'ATT') {
       // const id = value ? value.split(',') : [];
       console.log(value, 'id');
       return <SeeMediaInfo attactInfo={value} />;
       // const img = id.map((imgId, index)=>{
       //   return <p key={index}>
       //     <img style={{width: 180, cursor: 'pointer'}} src={getAttachUrl(imgId)} onClick={()=>{this.bigPic(imgId)}} refs='bigpic'/>
       //   </p>
       // })
       // return img
       // return <img style={{width: 180}} src={'/proxy/attach/findById?id=' + item.value + '&token=' + this.props.token}/>
     } else if (item.type === 'NUM') {
       return item.value !== '' ? (item.value + item.unit) : item.value;
     } else {
       return item.value || '';
     }
   }
   showTitle = (item) => {
     if (item.type === 'TITLE_DIVIDER') {
       return (<div style={{float: 'left', width: '100%'}}>
         <div style={{
         float: 'left',
         width: '3px',
         marginTop: '5px',
         marginRight: '10px',
         marginBottom: '10px',
         height: '15px',
         backgroundColor: '#1890FF',
       }}
         />
         <span style={{fontWeight: 'bold'}}>{item.alias}</span>
       </div>);
     } else {
       return (<p>{item.alias}</p>);
     }
   }
   render() {
     // const a = this.props.taskdetail.eqdetail.data || [];
     const feedbackdata = this.props.detaildata;
     const hideValue = this.props.hideValue;
     return (<div className={styles.taskfeedback} style={{height: 'calc(100vh - 300px)', overflowY: 'auto'}}>
       {feedbackdata && feedbackdata.items && feedbackdata.items.length > 0 && feedbackdata.items.map(item => {
        if (item.visible === 1) {
          return (<Row key={item.gid}>
            <Col span={10}>{this.showTitle(item)}</Col>
            <Col span={14} style={{textAlign: 'center'}}>
              {!hideValue ? <div>{this.changeIcon(item)}</div> : null}
            </Col>
          </Row>);
        }
      })}
       <div>
         <Modal
           visible={this.state.visible}
           onCancel={this.handleCancel}
           footer={null}
           closable={false}
           wrapClassName={styles.web}
         >
           <img alt="" src={getAttachUrl(this.state.imgId)} style={{width: '100%'}} />
         </Modal>
       </div>
     </div>);
   }
}

export default connect(
  ({taskdetail}) => {
    return {
      taskdetail,
    };
  }
)(Taskfeedback);

