import React from 'react';
import {connect} from 'dva';
import {Table} from 'antd';
import Dialog from '../../../components/yd-gis/Dialog/Dialog';
import FileNames from '../data/FileConfig';
import styles from '../css/emerPlanDetails.css';

@connect(state => ({
  token: state.login.token,
}))

export default class EmerPlanDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // 预案关联的应急组织机构
      emerOrganizationData: [],
      // 预案的附件列表
      emerPlanAttachedFile: [],
    };
    this.handleGetEmerOrganization(this.props.emerPlan.planId);
    this.handleGetEmerPlanAttachedFile(this.props.emerPlan.attachedFile);
  }

  componentWillUnmount = () => {
    this.setState = (state, callback) => {};
  };

  // 查询应急组织机构信息
  handleGetEmerOrganization = (planId) => {
    let data = {};
    data.planId = planId;
    this.props.dispatch({
      type: 'emerLfMap/getEmerOrganization',
      payload: data,
      callback: (res) => {
        this.setState({
          emerOrganizationData: res.data,
        });
      },
    });
  }

  // 获取应急预案附件列表
  handleGetEmerPlanAttachedFile = (fileArr) => {
    let data = {};
    data.ids = fileArr;
    this.props.dispatch({
      type: 'emer/getEmerPlanAttachedFileList',
      payload: data,
      callback: (res) => {
        this.setState({
          emerPlanAttachedFile: res.data,
        });
      },
    });
  }

  // 打开预案附件
  handleOpenPlanAttachedFile = (url) => {
    const getWindowWidth = () => (window.innerWidth || document.documentElement.clientWidth);
    const newWindWidth = 590;
    const left = (getWindowWidth() - newWindWidth) / 2;
    window.open(url, '_blank,title="预案详情"',
      `width=${newWindWidth},height=440,left=${left},top=150,location=0,menubar=no,resizable=no,scrollbars=no,status=no,toolbar=no`
    );
  }

  render() {
    const {onCancel, emerPlan, token, position} = this.props;
    // 应急预案关联的应急组织表结构
    let organizationColumns = [{
      title: '#',
      key: '#',
      render: (text, record, index) => (
        <span>{index + 1}</span>
      ),
      width: 38,
    }, {
      title: '组织机构名称',
      dataIndex: 'name',
      key: 'name',
      width: 165,
    }, {
      title: '负责人',
      dataIndex: 'manager',
      key: 'manager',
      width: 65,
    }, {
      title: '电话',
      dataIndex: 'managerTel',
      key: 'managerTel',
      width: 90,
    }];
    // 预案附件链接
    let attachedFileUrl = 'proxy/attach/findById';
    // 下载预案附件链接
    let attachedFileDownloadUrl = 'proxy/attach/downloadFile';
    let that = this;
    return (
      <Dialog
        title="应急预案详情"
        width={450}
        onClose={onCancel}
        position={position}
      >
        <div className={styles.detailsItemWrapper}>
          <div>
            <span>预案名称：</span>
            <span>{emerPlan.name}</span>
          </div>
          <div>
            <span>所属单位：</span>
            <span>{emerPlan.ownerUnit}</span>
          </div>
          <div>
            <span>预案类型：</span>
            <span>{emerPlan.typeName}</span>
          </div>
          <div>
            <span>事件类型：</span>
            <span>{emerPlan.eventTypeName}</span>
          </div>
          <div>
            <span>预案状态：</span>
            <span>{emerPlan.statusName}</span>
          </div>
          <div>
            <span>创建人：</span>
            <span>{emerPlan.creator}</span>
          </div>
          <div>
            <span>创建时间：</span>
            <span>{emerPlan.createTime}</span>
          </div>
          <div>
            <span>附件：</span>
            <div>
              {
                this.state.emerPlanAttachedFile.map((item, index) => {
                  let {filename} = item || '';
                  // filename = 'CNG管道一般性泄漏现场处置方案.docx';
                  let url = `${attachedFileUrl}?token=${token}&id=${item.id}`;
                  let downloadUrl = `${attachedFileDownloadUrl}?token=${token}&id=${item.id}`;
                  const fName = filename.split('.')[0];
                  if (FileNames[fName] && (filename.endsWith('.docx') || filename.endsWith('.doc'))) {
                    url = `/images/static/${FileNames[fName]}`;
                  }
                  return (
                    <div key={index}>
                      <a
                        href="javascript:void(0)"
                        onClick={() => {
                          that.handleOpenPlanAttachedFile(url);
                        }}
                        style={{
                          display: 'inline-block',
                          textDecoration: 'none',
                        }}
                      >{item.filename}</a>
                      <a id={styles.a_download} href={downloadUrl}>下载</a>
                    </div>
                  );
                })
              }
            </div>
          </div>
          <div>
            <span>应急人员组织：</span>
            <span>
              <Table
                rowKey={record => record.gid}
                bordered
                columns={organizationColumns}
                dataSource={this.state.emerOrganizationData}
                pagination={false}
                scroll={{x: false, y: 117}}
              />
            </span>
          </div>
        </div>
      </Dialog>
    );
  }
}
