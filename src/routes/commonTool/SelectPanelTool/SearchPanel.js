import React from 'react';
import PropTypes from 'prop-types';
import {DatePicker, Select, Input, TreeSelect} from 'antd';
import moment from 'moment';
import styles from './SearchPanel.less';

const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const TreeNode = TreeSelect.TreeNode;

class SearchPanel extends React.Component {
  constructor(props) {
    super(props);
    this.searchObj = {};
  }

  componentWillMount() {
    let fields = this.props.field;
    let params = {};
    for (let i = 0; i < fields.length; i++) {
      this.setState({
        [fields[i].name]: fields[i].value,
      });
      // params[fields[i].name] = fields[i].value;
    }
    // this.setState({
    //   params: params,
    // });
    // this.state = params;
  }

  getTreeData = (formData) => {
    return formData.map((item, i) => {
      if (item.selectValues && item.selectValues.length > 0) {
        return (<TreeNode
          value={item.name}
          title={item.alias}
          key={`${item.name}_${i}`}
        >
          {this.getTreeData(item.selectValues)}
        </TreeNode>);
      } else {
        return (<TreeNode
          value={item.name}
          title={item.alias}
          key={`${item.name}_${i}`}
        />);
      }
    });
  }

  initInputPanel = (data) => {
    let panelData = [];
    for (let i = 0; i < data.length; i++) {
      let dataInfo = data[i];
      let datadiv = '';
      this.state[dataInfo.name] = dataInfo.value;
      switch (dataInfo.valueType) {
        case 'tree':
          let tree = this.getTreeData(dataInfo.selectValues);
          datadiv = (
            <div key={`${this.props.fieldName}_${i}`} className={styles.select_panel_div}>
              <span style={{marginRight: '15px'}}>
                {`${dataInfo.alias}:`}
              </span>
              <TreeSelect
                showSearch
                style={{width: dataInfo.width}}
                value={this.state[dataInfo.name]}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeDefaultExpandAll
                onChange={this.onChangeTreeSelectValue.bind(this, dataInfo.name)}
              >
                {tree}
              </TreeSelect>
            </div>
          );
          this.searchObj[dataInfo.name] = this.state[dataInfo.name];
          break;
        case 'ddl':
          let selectOpt = dataInfo.selectValues.map((data, index) => {
            return (<Option key={data.value + index} value={data.value}>{data.name}</Option>);
          });
          datadiv = (
            <div key={`${this.props.fieldName}_${i}`} className={styles.select_panel_div}>
              <span style={{marginRight: '15px'}}>
                {`${dataInfo.alias}:`}
              </span>
              <Select
                style={{width: dataInfo.width}}
                value={this.state[dataInfo.name]}
                onChange={this.onChangeSelectValue.bind(this, dataInfo.name)}
              >
                {selectOpt}
              </Select>
            </div>
          );
          this.searchObj[dataInfo.name] = this.state[dataInfo.name];
          break;
        case 'input':
          datadiv = (
            <div key={`${this.props.fieldName}_${i}`} className={styles.select_panel_div}>
              <span style={{marginRight: '15px'}}>
                {`${dataInfo.alias}:`}
              </span>
              <Input
                style={{width: dataInfo.width}}
                placeholder={dataInfo.placeholder}
                value={this.state[dataInfo.name]}
                onChange={this.onChangeInputValue.bind(this, dataInfo.name)}
              />
            </div>
          );
          this.searchObj[dataInfo.name] = this.state[dataInfo.name];
          break;
        case 'date':
          datadiv = (
            <div key={this.props.fieldName + '_' + i} className={styles.select_panel_div}>
                            <span style={{marginRight: '15px'}}>
                               {dataInfo.alias + ':'}
                            </span>
              <DatePicker
                showTime
                // value={this.state[dataInfo.name] ? this.state[dataInfo.name] : moment()}
                onChange={this.onChangeDateValue.bind(this, dataInfo.name)}
                format="YYYY-MM-DD HH:mm:ss">
              </DatePicker>
            </div>
          );
          this.searchObj[dataInfo.name] = this.state[dataInfo.name];
          break;
        case 'rangeDate':
          datadiv = (
            <div key={this.props.fieldName + '_' + i} className={styles.select_panel_div}>
                            <span style={{marginRight: '15px'}}>
                               {dataInfo.alias + ':'}
                            </span>
              <RangePicker
                showTime
                // value={this.state[dataInfo.name] ? this.state[dataInfo.name] : moment()}
                onChange={this.onChangeRangeDateValue.bind(this, dataInfo.name)}
                format="YYYY-MM-DD HH:mm:ss">
              </RangePicker>
            </div>
          );
          this.searchObj[dataInfo.name] = this.state[dataInfo.name];
          break;
        default:
          break;
      }

      panelData.push(datadiv);
    }

    return panelData;
  }

  onChangeInputValue = (field, e, v) => {
    this.searchObj[field] = e.target.value;
    this.props.onclick(this.searchObj);
    this.setState({[field]: e.target.value});
  }

  onChangeSelectValue = (field, value) => {
    this.searchObj[field] = value;
    this.props.onclick(this.searchObj);
    this.setState({[field]: value});
  }

  onChangeTreeSelectValue = (field, value) => {
    this.searchObj[field] = value;
    this.props.onclick(this.searchObj);
    this.setState({[field]: value});
  }

  onChangeDateValue = (field, value) => {
    this.searchObj[field] = value;
    this.props.onclick(this.searchObj);
    this.setState({[field]: value});
  }

  onChangeRangeDateValue = (field, dates, dateStrings) => {
    this.searchObj[field] = dateStrings;
    this.props.onclick(dateStrings);
    this.setState({[field]: dates});
  }

  getSearchValue = () => {
    return this.searchObj;
  }

  render() {
    let panelInfo = this.initInputPanel(this.props.field);
    return (
      <div style={this.props.style || {}}>
        {panelInfo}
        <div style={{ clear: 'both' }}></div>
      </div>
    );
  }
}

SearchPanel.propTypes = {
  style: PropTypes.object,
  field: PropTypes.array,
  onclick: PropTypes.func,
};

SearchPanel.defaultProps = {
  style: {},
  field: [],
  onclick: function () {

  },
};

export default SearchPanel

// 数据格式
// const testdata2 = [
//     {
//         name: 'test',
//         alias: '测试1',
//         valueType: 'ddl',
//         value: '',
//         selectValues: [
//             {name: '测试', value: 'test'},
//             {name: '测试2', value: 'test2'}
//         ],
//     }
//     {
//         name: 'test3',
//         alias: '测试3',
//         value: '',
//         valueType:"input",
//     },
//     {
//         name: 'test4',
//         alias: '测试4',
//         value: '',
//         valueType:"date",
//     }
// ];
