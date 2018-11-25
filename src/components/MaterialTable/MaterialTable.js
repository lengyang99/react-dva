import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Button, Table } from 'antd';
import styles from './index.less';
import {queryMaterialInfo} from '../../services/api.js';

export default class MaterialTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      materialInfo: [],
      total: 0,
      pageno: 1,
      pagesize: 10,
      inputValue: '',
      selectedRowKeys: [],
      selectedRowDatas: [],
    };
  }

  componentDidMount() {
    this.queryMaterialInfo();
  }

  // 搜索
  onSearch = () => {
    this.queryMaterialInfo({ wlcode: this.state.inputValue});
  };

  // 根据工厂中心查询领料
  queryMaterialInfo = (params = {}) => {
    params.pageno = this.state.pageno;
    params.pagesize = this.state.pagesize;
    queryMaterialInfo(params).then(({ success, data, total }) => {
      if (success) {
        this.setState({
          materialInfo: data,
          total: total,
        });
      }
    });
  }

  onChangeInputValue = (e) => {
    let value = e.target.value;
    this.setState({
      inputValue: value,
    });
  }

  onSelectChange = (data) => {
    this.setState({
      pageno: data.current,
      pagesize: data.pageSize,
    }, () => {
      this.onSearch();
    });
  }

  handleOk = () => {
    this.props.onSelectClick(this.state.selectedRowDatas);
    this.props.onCloseModal();
  }

  handleCancel = () => {
    this.props.onCloseModal();
  }

  render() {
    let that = this;
    const columns = [{
      title: '物料编号',
      dataIndex: 'code',
      key: 'code',
      width: '20%',
    }, {
      title: '物料类别',
      dataIndex: 'groupdes',
      key: 'groupdes',
      width: '20%',
    }, {
      title: '物料名称',
      dataIndex: 'des',
      key: 'des',
      width: '60%',
    }];

    // 表格分页
    const pagination = {
      total: this.state.total,
      showTotal: (total, range) => {
        return (<div className={styles.pagination}>
          共 {total} 条记录 第{that.state.pageno}/{Math.ceil(total / that.state.pagesize)}页
        </div>);
      },
    };

    let selectedRowKeys = this.state.selectedRowKeys;
    const rowSelection = {
      selectedRowKeys,
      onChange: (key, rows) => {
        this.setState({
          selectedRowKeys: key,
          selectedRowDatas: rows,
        });
        // callback(selectedRowKeys, selectedRows);
      },
    };

    return (
      <Modal
        visible={true}
        title="选择物料"
        maskClosable={false}
        onOk={this.handleOk.bind(this)}
        onCancel={this.handleCancel.bind(this)}
        style={{ top: '20px' }}
        width={600}
      >
        <div className={styles['field-block3']}>
          <label>搜索：</label>
          <Input
            className={styles.input}
            placeholder="按物料编号/物料名称查询"
            value={this.state.inputValue}
            onChange={this.onChangeInputValue.bind(this)}
          />
        </div>
        <Button className={styles.button3} onClick={this.onSearch.bind(this)}>
          查询</Button>
        <Table
          columns={columns}
          size="small"
          rowSelection={rowSelection}
          pagination={pagination}
          onChange={this.onSelectChange.bind(this)}
          dataSource={this.state.materialInfo || []}
          rowKey={record=>record.gid}
        />
      </Modal>
    );
  }
}

MaterialTable.defaultProps = {
  onSelectClick: (f) => f,
  onCloseModal: (f) => f,
};

MaterialTable.propTypes = {
  onSelectClick: PropTypes.func,
  onCloseModal: PropTypes.func,
};
