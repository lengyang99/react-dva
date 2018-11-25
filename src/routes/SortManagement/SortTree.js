/**
 * @author malfunction 树组件
 * @desc tree 组件的方法等同于 antd tree 提供的方法
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import { Button, Icon, Input, Modal, Tree } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';
import fetch from '../../utils/request';
import classnames from 'classnames';
import SortEdit from './SortEdit';

const confirm = Modal.confirm;
const TreeNode = Tree.TreeNode;
const UNSELECTED = '-1'; // 未选中节点

const NoSearchComponent = () => (<p style={{ textAlign: 'center', marginTop: 10 }}>暂无搜索结果</p>);

const loop = (list) => {
  return !Array.isArray(list) ? null : list.map(ele => {
    if (!ele.hasOwnProperty('children')) {
      return <TreeNode key={ele.id} title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} parentId={ele.pid} clsCode={ele.data.clsCode} />;
    } else {
      return (
        <TreeNode key={ele.id} title={`${ele.totalData === null ? ele.name : `${ele.name}(${ele.totalData})`}`} parentId={ele.pid} clsCode={ele.data.clsCode}>
          {loop(ele.children)}
        </TreeNode>
      );
    }
  });
};

@connect(
  state => ({
    funs: state.login.funs,
    classification: state.sortmanagement.classification,
    pageNum: state.sortmanagement.propertyPageList.pageNum,
    pageSize: state.sortmanagement.propertyPageList.pageSize,
  })
)
class SortTree extends Component {
  static propTypes = {
    width: propTypes.oneOfType([propTypes.string, propTypes.number]),
    height: propTypes.oneOfType([propTypes.string, propTypes.number]),
    overflow: propTypes.string,
    className: propTypes.string,
  };

  static defaultProps = {
    width: 280,
  };

  constructor(props) {
    super(props);
    this.state = {
      list: [],
      treeData: [],
      style: {
        width: props.width,
        height: props.height,
        overflow: props.overflow,
      },
      visible: false,
      method: '',
    };
  }

  componentDidMount() {
    this.query();
  }

  componentWillUnmount() { // 加载grid数据
    this.queryGridData(UNSELECTED);
  }

  onChange = (e) => {
    const searchValue = e.target.value;
    const { list } = this.state;
    const temp = [];

    /**
     * @desc 递归需要过滤数据的列表
     * @param {Array} list
     * @param {String} value
     */
    const filterData = (list_, value) => {
      if (Array.isArray(list_)) {
        list_.forEach(ele => {
          if (ele.name.indexOf(value) === -1 && ele.hasOwnProperty('children')) {
            filterData(ele.children, value);
          } else if (ele.name.indexOf(value) > -1) {
            temp.push(ele);
          }
        });
      }
    };
    filterData(list, searchValue);
    this.setState({
      treeData: searchValue ? temp : list,
    });
  };

  queryGridData = (gid) => {
    const params = {
      clsGid: gid,
      pageNum: this.props.pageNum,
      pageSize: this.props.pageSize,
    };
    this.props.dispatch({
      type: 'sortmanagement/queryProperty',
      payload: params,
    });
    this.props.dispatch({
      type: 'sortmanagement/queryEquipment',
      payload: params,
    });
  }

  onSelect = (selectedKeys, e) => {
    let classification = {
      gid: UNSELECTED, // 未选中节点
      parentId: '',
      clsCode: '',
      description: '',
    }
    if (selectedKeys.length !== 0) {
      const [gid] = selectedKeys;
      classification = {
        gid: gid,
        parentId: e.node.props.parentId,
        clsCode: e.node.props.clsCode,
        description: e.node.props.title,
      };
    }
    this.props.dispatch({
      type: 'sortmanagement/setClassification',
      payload: classification,
    });

    this.queryGridData(classification.gid);
  };

  query = () => {
    fetch('/proxy/eqClassification/tree').then(data => {
      this.setState({
        list: data.data,
        treeData: data.data,
      });
    });
  };

  handleClickAdd = (value, event) => {
    event.stopPropagation(); // 阻止事件冒泡
    if (value) {
      return;
    }
    this.setState({
      visible: true,
      method: 'add',
    });
  };

  handleClickDelete = (value, event) => {
    event.stopPropagation(); // 阻止事件冒泡
    if (value) {
      return;
    }
    const gid = this.props.classification.gid;
    if (gid === UNSELECTED || gid === '') {
      Modal.info({
        title: '请先选择分类，再进行删除！',
        content: (
          <div>
            <p>点击左端树的某一节点</p>
          </div>
        ),
        onOk() {},
      });
    } else {
      confirm({
        title: '确定要删除吗？',
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => {
          fetch(`/proxy/eqClassification/${gid}`, {
            method: 'DELETE',
          }).then(data => {
            this.query();
            this.props.dispatch({
              type: 'sortmanagement/setClassification',
              payload: { gid: UNSELECTED },
            });
            this.queryGridData(UNSELECTED);
          });
        },
      });
    }
  };

  handleClickUpdate = (value, event) => {
    event.stopPropagation(); // 阻止事件冒泡
    if (value) {
      return;
    }
    const gid = this.props.classification.gid;
    console.log(gid);
    if (gid === UNSELECTED || gid === '') {
      Modal.info({
        title: '请先选择分类，再进行修改！',
        content: (
          <div>
            <p>点击左端树的某一节点</p>
          </div>
        ),
        onOk() {},
      });
    } else {
      this.setState({
        visible: true,
        method: 'update',
      });
    }
  };

  toggleModal = visible => {
    this.setState({
      visible: visible,
    });
  };

  render() {
    const { className, ...otherProps } = this.props;
    const { treeData, style, visible, method } = this.state;
    const { funs } = this.props;
    let sortmanagement_add = true; // 设备分类添加
    let sortmanagement_edit = true; // 设备分类编辑
    let sortmanagement_delete = true; // 设备分类删除
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='sortmanagement_add') {
        sortmanagement_add = false;
      }
      if (json.code=='sortmanagement_edit') {
        sortmanagement_edit = false;
      }
      if (json.code=='sortmanagement_delete') {
        sortmanagement_delete = false;
      }
    }
    return (
      <div style={style} className={classnames('malfunction-tree', className)}>
        <Input placeholder="分类名称查询" style={{ marginBottom: 5, width: 200, height: 30, fontSize: 12 }} onChange={this.onChange} />
        <Icon disabled={sortmanagement_add} type="file-add" style={{ fontSize: 20, color: '#08c', padding: 2, cursor: 'pointer' }} onClick={this.handleClickAdd.bind(this, sortmanagement_add)} />
        <Icon disabled={sortmanagement_edit} type="edit" style={{ fontSize: 20, color: '#08c', padding: 2, cursor: 'pointer' }} onClick={this.handleClickUpdate.bind(this, sortmanagement_edit)} />
        <Icon disabled={sortmanagement_delete} type="delete" style={{ fontSize: 20, color: '#08c', padding: 2, cursor: 'pointer' }} onClick={this.handleClickDelete.bind(this, sortmanagement_delete)} />
        <Scrollbars style={{ height: 380 }}>
          {treeData && treeData.length === 0 ? <NoSearchComponent /> : <Tree onSelect={this.onSelect} showLine {...otherProps}>{loop(treeData)}</Tree>}
        </Scrollbars>
        <SortEdit
          visible={visible}
          method={method}
          toggleModal={this.toggleModal}
          query={this.query}
        />
      </div>
    );
  }
}

export default SortTree;
