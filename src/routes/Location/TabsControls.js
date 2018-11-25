import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Tabs, notification } from 'antd';
import { connect } from 'dva';
import ListView from './ListView';
import DetailsView from './DetailsView';
import LinkEquipment from './LinkEquipment';
import LinkHiddenDanger from './LinkHiddenDanger';
import Maps from './map';
import {
  getLocationMessages,
  fetchAttachmentList,
  getHiddenLinkData,
  getLocCode,
  fetchLocationTree,
} from '../../services/eqLocation';

const TabPane = Tabs.TabPane;

@connect(
  state => ({
    changeby: state.login.user.trueName,
    orgname: state.login.user.company,
  })
)
class TabsControls extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tabDisplay: 'none',
      activeKey: '1',
      childDataSource: [],
      BasicMessageValue: {},
      attachmentListArr: [],
      hiddenlistData: [],
      hiddenTotalPage: 0,
      edit: true,
      treeData: [],
    };
  }
  static propTypes = {
    changeby: propTypes.string,
    orgname: propTypes.string,
  };

  static defaultProps = {
    changeby: '',
    orgname: '',
  };
  componentDidMount() {
    fetchLocationTree().then((data) => {
      if (data.success) {
        this.setState({
          treeData: data.data,
        });
      } else {
        notification.error({
          message: '下拉值获取失败',
        });
      }
    });
  }
  callback = (key) => {
    if (key === '1') {
      this.setState({
        tabDisplay: 'none',
        activeKey: key,
        BasicMessageValue: {},
      });
    } else {
      this.setState({
        tabDisplay: 'block',
        activeKey: key,
      });
    }
    if (key === '4') { // 请求关联隐患数据
      const code = this.state.BasicMessageValue.locCode;
      if (code !== undefined) {
        getHiddenLinkData({
          locCode: code,
          pageno: '1',
          pagesize: '50000',
        }).then((response) => {
          if (response.success) {
            this.setState({
              hiddenlistData: response.data.map((value, index) => Object.assign(value, { key: index })),
              hiddenTotalPage: response.total,
            });
          }
        });
      }
    }
  };
  reloadData = () => {
    this.setState({
      activeKey: '1',
      tabDisplay: 'none',
    });
    this.listView.myName();
    // this.listview.researchDataList()
    // this.listview.reloadTreeData()
  };

  showDetail = (record, item) => {
    this.setState({
      tabDisplay: 'block',
      activeKey: item === 'gis' ? '5' : '2',
      edit: item !== 'doubleClick',
    });
    // 添加 //编辑
    if (record === 'add') {
      this.setState({ attachmentListArr: [] });
      this.setState({
        BasicMessageValue: {
          isNewAttachmentList: '1',
          changedby: this.props.changeby,
          orgname: this.props.orgname,
        },
      });
    } else {
      // 请求附件列表
      fetchAttachmentList({ locCode: record.gid, pageNum: '1', pageSize: '100' }).then((response) => {
        if (response.success) {
          const { data } = response;
          const { list } = data;
          const newAttachmentListArr = [];
          if (list && list.length) {
            list.forEach(item => {
              const attachmentListJson = {};
              attachmentListJson.uid = item.gid;
              attachmentListJson.name = item.fileName;
              attachmentListJson.status = 'done';
              // attachmentListJson.url = `/proxy/ldgrFile/findById?id=${item.fileGid}`;// 预览
              attachmentListJson.url = `/proxy/eqLocationFile/downloadFile?id=${item.fileGid}`;// 下载
              newAttachmentListArr.push(attachmentListJson);
            });
          }
          this.setState({ attachmentListArr: newAttachmentListArr });
        }
      });
      // 请求子级列表
      getLocationMessages({ parentId2: record.gid }).then((responses) => {
        if (responses.success) {
          this.setState({
            childDataSource: responses.data.list.map((value, index) => Object.assign(value, { key: index })),
            BasicMessageValue: record,
          });
        } else {
          notification.error({
            message: '查询失败',
          });
        }
      });
    }
  };
  hiddenPageChange = (pageNumber) => {
    const code = this.state.BasicMessageValue.locCode;
    if (code !== undefined) {
      getHiddenLinkData({
        locCode: code,
        pageno: pageNumber,
        pagesize: '10',
      }).then((response) => {
        if (response.success) {
          this.setState({
            hiddenlistData: response.data,
            hiddenTotalPage: response.total,
          });
        }
      });
    }
  };
  onRef = (ref) => {
    this.listView = ref;
  };
  onValueChange = (props, value) => {
    this.setState({
      BasicMessageValue: { ...this.state.BasicMessageValue, ...value },
    }, () => {
      const { gid } = this.state.BasicMessageValue;
      const { parentId, locType, stationType } = this.state.BasicMessageValue;
      if (!gid && locType && stationType) {
        if (value.locType || value.stationType || value.parentId) {
          getLocCode({parentId, locType, stationType}).then(data => {
            if (data.success) {
              this.setState({
                BasicMessageValue: { ...this.state.BasicMessageValue, locCode: data.data },
              });
            } else {
              notification.warn({message: data.msg});
              this.setState({
                BasicMessageValue: { ...this.state.BasicMessageValue, locCode: '' },
              });
            }
          });
        }
      }
    });
  };
  render() {
    return (
      <Tabs
        animated={false}
        defaultActiveKey="1"
        activeKey={this.state.activeKey}
        onChange={this.callback}
        tabBarStyle={{ display: this.state.tabDisplay }}
      >
        <TabPane tab="列表" key="1">
          <ListView
            showDetail={this.showDetail}
            onRef={this.onRef}
          />
        </TabPane>
        <TabPane tab="位置信息" key="2">
          <DetailsView
            childDataSource={this.state.childDataSource}
            BasicMessageValue={this.state.BasicMessageValue}
            reloadData={this.reloadData}
            attachmentListArr={this.state.attachmentListArr}
            edit={this.state.edit}
            onValueChange={this.onValueChange}
            treeData={this.state.treeData}
          />
        </TabPane>
        <TabPane tab="关联设备" key="3">
          <LinkEquipment BasicMessageValue={this.state.BasicMessageValue} />
        </TabPane>
        <TabPane tab="隐患记录" key="4">
          <LinkHiddenDanger
            BasicMessageValue={this.state.BasicMessageValue}
            hiddenlistData={this.state.hiddenlistData}
            hiddenTotalPage={this.state.hiddenTotalPage}
            hiddenPageChange={this.hiddenPageChange}
          />
        </TabPane>
        <TabPane tab="地图" key="5">
          <Maps
            BasicMessageValue={this.state.BasicMessageValue}
            reloadData={this.reloadData}
          />
        </TabPane>
      </Tabs>
    );
  }
}

export default TabsControls;
