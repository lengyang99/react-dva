import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {TreeSelect} from 'antd';
// import {routerRedux, Link} from 'dva/router';
import styles from './index.less';

const TreeNode = TreeSelect.TreeNode;

@connect(state => ({
  userInfo: state.login.user,
  treeData: state.global.companyData
}))

export default class CompanySwitch extends PureComponent {
  constructor(props) {
    super(props);
    this.state={
      flag:false,
    }
  }
  componentWillMount(){
    // this.setState({company:this.props.userInfo.company});
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'global/queryCompany',
      payload: {
        userid: this.props.userInfo.id,
        isfilter: false
      }
    })
  }

  componentWillUnmount() {
  }

  handleSelect=(value,node)=> {
    // this.setState({company: value});
    const {attributes:{ecode},text}=node.props.dataRef;
    this.changeEcode(ecode,text);
  };
  changeEcode=(ecode,text)=>{
    let storageUser = JSON.parse(localStorage.getItem('user'));
    storageUser.user.ecode = ecode;
    storageUser.user.cCompany = text;
    this.props.dispatch({
      type:'login/changeEcode',
      payload:{
        isSuccess:true,
        ...storageUser
      }
    });

  };
  handleChange=(value)=>{
    // this.setState({company:value});
    if(!value){
      this.setState({flag:!this.state.flag},()=>{
        const {userInfo} = this.props;
        this.changeEcode(userInfo.originEcode,userInfo.company);
      })
    }
  };

  handleCompanyClick=()=>{
    const {treeData=[]} = this.props;
    console.log(treeData);
    if(treeData.length===0){
      return;
    }
    this.setState({
      flag:true,
      // company:this.props.userInfo.company
    });

  };
  renderTreeNodes = (data) => {
    return data.map((item) => {
      const disabled = (item.attributes.level | 0) !== 3;
      const {text} = item;
      if (item.children) {
        return (
          <TreeNode
            disabled={disabled}
            title={text}
            key={text}
            dataRef={item}
            value={text}
          >
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode
        disabled={disabled}
        title={text}
        key={text}
        dataRef={item}
        value={text}
      />;
    });
  };


  render() {
    const {treeData, userInfo} = this.props;
    const {flag} = this.state;
    return (
      <span className={styles.companyBox}>
        <a href="javascript:void(0)"
           onClick={this.handleCompanyClick}
           className={styles.company}
           style={{
             display:flag?'none':''
           }}
        >{userInfo.cCompany}</a>

        <TreeSelect
          style={{
            display:flag?"":'none',
            minWidth:300,
          }}
          value={userInfo.cCompany}
          treeDefaultExpandAll
          allowClear={true}
          onSelect={this.handleSelect}
          onChange={this.handleChange}
        >
          {this.renderTreeNodes(treeData)}
        </TreeSelect>
      </span>

    );
  }
}
