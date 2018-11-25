import React, { PureComponent } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import { Table, Popconfirm, notification } from 'antd';
import AdvancedSearchForm from './subcomponent/AdvancedSearchForm';
import TreeLists from './subcomponent/TreeLists';
import { searchForLocationMessage, deleteLocationMgn } from '../../services/eqLocation';
import styles from './ListView.less';

@connect(
  state => ({
    funs: state.login.funs,
  })
)
class ListView extends PureComponent {
  constructor(props) {
    super(props);
    let location_edit = true; // 设备位置编辑
    let location_delete = true; // 设备位置删除
    for (let i = 0; i < props.funs.length; i++) {
      let json = props.funs[i];
      if (json.code === 'location_edit') {
        location_edit = false;
      }
      if (json.code === 'location_delete') {
        location_delete = false;
      }
    }
    this.SearchWithType = this.SearchWithType.bind(this);
    this.state = {
      dataSource: [],
      pageTotal: 0,
      searchCondition: {},
      currentPage: 1,
      pageSize: 10,
      gid: '',
    };
    this.columns = [{
      title: '编号',
      dataIndex: 'locCode',
    }, {
      title: '位置名称',
      dataIndex: 'locName',
      render: text => <a>{text}</a>,
    }, {
      title: '所属站点',
      dataIndex: 'stationName',
    }, {
      title: '父级位置',
      dataIndex: 'parentName',
    }, {
      title: '类型',
      dataIndex: 'typeName',
    }, {
      title: '责任人',
      dataIndex: 'responsible',
      width: 100,
    }, {
      title: '所属机构',
      dataIndex: 'orgname',
    }, {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <a onClick={this.gotoGISDetails.bind(this, record)}>GIS</a>
          <span className="divider" />
          <a disabled={location_edit} onClick={this.inspectOrEditDetails.bind(this, record)}>编辑</a>
          <span className="divider" />
          <Popconfirm
            title="确定删除?一旦删除，不可撤销！"
            onConfirm={this.deleteItem.bind(this, record)}
            okText="是"
            cancelText="否"
          >
            <a disabled={location_delete}>删除</a>
          </Popconfirm>
        </span>
      ),
    }];
  }
  componentDidMount() {
  // 必须在这里声明，所以 ref 回调可以引用它
    this.props.onRef(this);
    searchForLocationMessage({
      pageNum: 1,
      pageSize: 10,
    }).then((response) => {
      if (response.success) {
        this.setState({
          dataSource: response.data.list.map((value, index) => Object.assign(value, { key: index })),
          pageTotal: response.data.total,
        });
      } else {
        notification.error({
          message: '查询失败',
        });
      }
    });
  }

  // 搜索
  SearchWithType(type, mub, param) {
    const ofSearch = type.field0;
    const ofLocation = type.field1;
    const ofTpye = type.field2;
    const parentGid = param === 'topsearch' ? undefined : param;
    if (param === 'topsearch') {
      this.setState({
        gid: undefined,
      });
    }
    const { pageSize } = this.state;
    searchForLocationMessage({
      pageNum: mub,
      pageSize,
      searchString: ofSearch,
      stationId: ofLocation,
      locType: ofTpye,
      parentId: parentGid,
    }).then((response) => {
      if (response.success) {
        this.setState({
          dataSource: response.data.list.map((value, index) => Object.assign(value, { key: index })),
          pageTotal: response.data.total,
          searchCondition: type,
          currentPage: mub,
        });
      } else {
        notification.error({
          message: '查询失败',
        });
      }
    });
  }
  // 删除
  deleteItem = (record) => {
    deleteLocationMgn(record.gid).then((responses) => {
      if (responses.success) {
        notification.success({
          message: '删除成功',
        });
        this.researchDataList();
        this.reloadTreeData();
      } else {
        notification.error({
          message: '删除失败',
        });
      }
    });
  };
  myName = () => {
    this.tree.fetchList();
    this.SearchWithType(this.state.searchCondition, this.state.currentPage, this.state.gid);
  };
  reloadTreeData = () => {
    this.tree.fetchList();
  };
  researchDataList = () => {
    this.SearchWithType(this.state.searchCondition, this.state.currentPage, this.state.gid);
  };
  pageChange = (pageNumber) => {
    this.SearchWithType(this.state.searchCondition, pageNumber, this.state.gid);
  };
  showSizeChange = (current, pageSize) => {
    this.setState({
      pageSize,
    });
    this.SearchWithType(this.state.searchCondition, current, this.state.gid);
  };
  clickTreeShowList = (selectedKeys) => {
    this.setState({
      gid: selectedKeys[0],
    });
    this.SearchWithType(this.state.searchCondition, 1, selectedKeys[0]);
  };
  gotoGISDetails = (record) => {
    this.props.showDetail(record, 'gis');
  };
  inspectOrEditDetails = (record) => {
    this.props.showDetail(record);
  };
  onDoubleClick = (record) => {
    this.props.showDetail(record, 'doubleClick');
  };
  AddLocalMessages = () => {
    this.props.showDetail('add');
  };
  render() {
    const { funs } = this.props;
    return (
      <div className={styles.location}>
        <div className={styles.locationSide}>
          <TreeLists
            ref={ref => { this.tree = ref; }}
            onSelect={this.clickTreeShowList}
            className={styles.locationTree}
          />
        </div>
        <div className={styles.locationMain}>
          <AdvancedSearchForm
            SearchForItem={this.SearchWithType}
            showAddModal={this.AddLocalMessages}
          />
          <Table
            className={styles.locationList}
            columns={this.columns}
            dataSource={this.state.dataSource}
            rowSelection={{ type: 'checkbox' }}
            onRow={record => ({
              onDoubleClick: this.onDoubleClick.bind(this, record),
            })}
            pagination={{
              showQuickJumper: true,
              showSizeChanger: true,
              total: this.state.pageTotal,
              onChange: this.pageChange,
              onShowSizeChange: this.showSizeChange,
              current: this.state.currentPage,
              showTotal: () => (<span>总计<span style={{ color: '#40a9ff' }}> {this.state.pageTotal} </span>条</span>),
            }}
          />
        </div>
      </div>
    );
  }
}

ListView.propTypes = {
  showDetail: propTypes.func,
};

ListView.defaultProps = {
  showDetail: f => f,
};

export default ListView;
