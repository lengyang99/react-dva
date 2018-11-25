import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Modal, Input, Button, Table, InputNumber } from 'antd';
import styles from './index.less';
import MaterialTable from './MaterialTable.js';

export default class MaterialSelect extends Component {
  constructor(props) {
    super(props);
    let materStr = props.defaultValue;
    let mater = [];
    try {
      mater = JSON.parse(materStr);
    } catch(e) {
      console.error(e);
    }
    this.state = {
      showMaterialModal: false,
      selectMaterial: mater,
    };
  }

  componentDidMount() {

  }

  getValues = () => {
    return this.state.selectMaterial;
  }

  openMaterialModal = () => {
    this.setState({
      showMaterialModal: true,
    });
  }

  onSelectClick = (values) => {
    let selectResult = this.state.selectMaterial;
    for (let i = 0; i < values.length; i++) {
      let flag = true;
      for (let j = 0; j < this.state.selectMaterial.length; j++) {
        if (this.state.selectMaterial[j].gid === values[i].gid) {
          flag = false;
        }
      }
      if (flag) {
        values[i].num = 1;
        selectResult.push(values[i]);
      }
    }

    this.setState({
      selectMaterial: selectResult,
    });
    this.props.changeMaterialSelect(selectResult);
  }

  onCloseModal = () => {
    this.setState({
      showMaterialModal: false,
    });
  }

  handleInputChage = (value, gid, column) => {
    const tmpData = [...this.state.selectMaterial];
    for (let i = 0; i < tmpData.length; i++) {
      if (tmpData[i].gid === gid) {
        tmpData[i][column] = value;
      }
    }
    this.setState({ selectMaterial: tmpData });
    this.props.changeMaterialSelect(tmpData);
  }

  reducePick = (record) => {
    const targetData = this.state.selectMaterial;
    const reduceItem = targetData.filter(item => {
      return item.gid !== record.gid;
    })
    this.setState({ selectMaterial: reduceItem });
    this.props.changeMaterialSelect(reduceItem);
  }

  render() {
    let that = this;
    const columns = [{
      title: '物料编号',
      dataIndex: 'code',
      key: 'code',
      width: '15%',
    }, {
      title: '物料类别',
      dataIndex: 'groupdes',
      key: 'groupdes',
      width: '30%',
    }, {
      title: '物料名称',
      dataIndex: 'des',
      key: 'des',
      width: '30%',
    }, {
      title: '数量',
      dataIndex: 'num',
      key: 'num',
      width: '15%',
      render: (text, record) => {
        return (<InputNumber
          style={{width: '60px'}}
          autoFocus
          max={666}
          min={1}
          value={text}
          placeholder="请输入数量"
          onChange={value => { this.handleInputChage(value, record.gid, 'num'); }}
        />);
      },
    }, {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: '10%',
      render: (text, record) => {
        return (<a onClick={() => { this.reducePick(record); }}>删除</a>);
      },
    },
    ];

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
      <span>
        <Table
          className={styles[this.props.tableClass]}
          style={{marginLeft: '130px', marginTop: '10px'}}
          columns={columns}
          dataSource={this.state.selectMaterial}
          size="small"
        />
        {this.state.showMaterialModal ? <MaterialTable
          onSelectClick={this.onSelectClick}
          onCloseModal={this.onCloseModal}
        /> : null}
      </span>
    );
  }
}

MaterialSelect.defaultProps = {
  tableClass: '',
  defaultValue: '',
  changeMaterialSelect: (f) => f,
};

MaterialSelect.propTypes = {
  tableClass: PropTypes.string,
  defaultValue: PropTypes.string,
  changeMaterialSelect: PropTypes.func,
};
