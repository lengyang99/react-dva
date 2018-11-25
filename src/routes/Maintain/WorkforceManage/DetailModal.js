import React, { PureComponent } from 'react';
import {connect} from 'dva';
import moment from 'moment';
import _ from 'lodash';
import {Select, Table, Button, Icon, Modal, Tooltip} from 'antd';
import styles from './index.less';

const Option = Select.Option;

@connect(({ station, maintain, login}) => ({
  classManage: station.classManage,
  workContentList: maintain.workContentList,
  feedbackUsers: station.feedbackUsers,
  user: login.user,
}))
export default class DetailModal extends PureComponent {
  constructor(props) {
    super(props);
    this.edit = false;
    this.index = 0;
    this.state = {
      data: []
    }
  }

  componentDidMount() {

  }
  componentWillUnmount() {
    this.props.onRef(null);
  }



  render() {
    const { data, show, handleCancel} = this.props;
    const pbDetail = [];
    data.map(item => {
      const userArr = item.workList && item.workList.length > 0 ? item.workList[0].bcList[0].zbrList : [];
      const userName = [];
      userArr.map(item1 => userName.push(item1.userName));
      pbDetail.push({
        regionName: item.regionName,
        workContent: item.workList && item.workList.length > 0 ? item.workList[0].workContent : '',
        userName: userName.join(","),
      })
    })
    const columns = [{
      title: '区域',
      dataIndex: 'regionName',
      width: '20%',
    },
    {
      title: '工作内容',
      dataIndex: 'workContent',
      width: '30%',
    },
    {
      title: '人员',
      dataIndex: 'userName',
      width: '50%',
    }];
    return (
      <Modal
        visible={show}
        className={styles.modal}
        width={900}
        maskClosable={false}
        title='值班详情'
        footer={null}
        onCancel={handleCancel}
      >
        <Table
          columns={columns}
          rowKey={record => record.gid}
          dataSource={pbDetail}
          pagination={false}
          scroll={{y: 360}}
        />
      </Modal>
    );
  }
}
