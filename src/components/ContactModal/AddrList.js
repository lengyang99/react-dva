/**
 * Created by hexi on 2018/1/31.
 */
import React, { Component } from 'react';
import { List, Checkbox, Radio, Input } from 'antd';
import pinyin from 'pinyin-es5';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './addrList.less';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const Search = Input.Search;

export default class AddrList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: this.props.defaultValue,
    };
    this.listData = [];
    this.listSearchData = [];
    this.selectdata = [];
  }
  // 修改pinyin插件 有些中文字没有的bug
  bug = (data, reg) => {
    if (reg.test(data)) {
      return data;
    } else {
      switch (data) {
        case '邵':
          return 'S';
        case '鲍':
          return 'B';
        case '哦':
          return 'O';
        case '尧':
          return 'Y';
        case '蔡':
          return 'C';
        case '窦':
          return 'D';
        case '仝':
          return 'T';
        case '翟':
          return 'Z';
        case '郝':
          return 'H';
        case '邱':
          return 'Q';
        case '闫':
          return 'Y';
        case '冉':
          return 'R';
        case '尹':
          return 'Y';
        case '祁':
          return 'Q';
        case '姬':
          return 'J';
        case '缑':
          return 'G';
        case '阮':
          return 'R';
        case '廖':
          return 'L';
        case '邹':
          return 'Z';
        case '邸':
          return 'D';
        case '韦':
          return 'W';
        case '倪':
          return 'N';
        case '詹':
          return 'Z';
        case '庾':
          return 'Y';
        default:
          return '其它';
      }
    }
  }
  componentWillMount() {
    const { data } = this.props;
    const reg = new RegExp('^[A-Z]+$');
    if (data.length > 0) {
      const letterGroup = { 'A': [], 'B': [], 'C': [], 'D': [], 'E': [], 'F': [], 'G': [], 'H': [], 'I': [], 'J': [], 'K': [], 'L': [], 'M': [], 'N': [], 'O': [], 'P': [], 'Q': [], 'R': [], 'S': [], 'T': [], 'U': [], 'V': [], 'W': [], 'X': [], 'Y': [], 'Z': [], '其它': [] };
      let attr = [];
      for (const elem of data.values()) {
        attr = pinyin(elem.name.split('')[0], { style: pinyin.STYLE_FIRST_LETTER })[0] || []; // 取名字的首字母 返回数组对象
        for (const [key, value] of Object.entries(letterGroup)) {
          if (key === this.bug((attr[0] || '').toUpperCase(), reg)) { // 首字母转大写
            value.push(elem);
          }
        }
      }
      for (const [k, v] of Object.entries(letterGroup)) {
        if (v.length > 0) { // 过滤掉 无数据的字母组
          this.listData.push({ name: k, isLetter: true }); // isLetter 区分 数据中 是 字母还是 姓名
          this.listSearchData.push({ name: k, isLetter: true });
          for (const e of v.values()) {
            this.listData.push(e);
            this.listSearchData.push(e);
          }
        }
      }
    }
  }
  onCheckChange = (data) => {
    this.selectdata = [];
    if (this.props.isRadio) {
      for (const elem of this.listData.values()) {
        if (elem.id === data.target.value) {
          this.selectdata = elem;
        }
      }
      this.setState({
        value: data.target.value,
      });
    } else {
      for (const e of this.listData.values()) {
        for (const elem of data.values()) {
          if (e.id === elem) {
            this.selectdata.push(e);
          }
        }
      }
      this.setState({
        value: data,
      });
    }
    this.props.onCheckChange(this.selectdata); // this.selectdata返回 传入的data选的那条
  }
  onSearch = (data, a, b) => {
    this.listSearchData = [];
    for (const elem of this.listData.values()) {
      if (data === '') {
        this.listSearchData.push(elem);
      } else if (elem.name.includes(data)) {
        this.listSearchData.push(elem);
      }
    }
    this.setState({});
  }
  render() {
    let dom = {};
    const ListDom = [1].map((key) => {
      let a = this.listSearchData;
      return (<List
        key={`${key}_addrList`}
        dataSource={this.listSearchData}
        pagination={{
          pageSize: 100,
          total: this.listSearchData.length,
        }}
        renderItem={item => {
          dom = {};
          if (!item.isLetter) {
            if (this.props.isRadio) {
              dom = { avatar: <Radio value={item.id} /> };
            } else {
              dom = { avatar: <Checkbox value={item.id} /> };
            }
          }
          return (
            <List.Item className={classNames({ [styles.itemBg]: item.isLetter })}>
              <List.Item.Meta
                {...dom}
                title={<span>{item.name}</span>}
              />
            </List.Item>
          );
        }}
      />);
    });
    return (
      <div className={styles.group}>
        <Search
          placeholder="输入您要搜索的人"
          onSearch={this.onSearch}
          enterButton
          className={styles.search}
        />
        {this.props.isRadio ?
          <RadioGroup
            className={styles.group}
            onChange={this.onCheckChange}
            value={this.state.value}
          >
            {ListDom}
          </RadioGroup> :
          <CheckboxGroup
            className={styles.group}
            onChange={this.onCheckChange}
            value={this.state.value}
          >
            {ListDom}
          </CheckboxGroup>
        }
      </div>
    );
  }
}

/**
 * 通讯录
 * @prop {function} onCheckChange -勾选变化时的回调函数
 * @prop {array} data - 格式：[{name:'张三',id:'11'},{name:'李四',id:'11'}]
 *                      说明：name,id必须存在，{}中name为固定key名称，其他key可随意命名
 * @prop {bool} isRadio - 是否为单选
 * @prop {bool} defaultValue - 单选、多选默认值(单选 any 、多选string[])
 */
AddrList.propTypes = {
  onCheckChange: PropTypes.func,
  data: PropTypes.array,
  isRadio: PropTypes.bool,
  defaultValue: PropTypes.arrayOf(PropTypes.string),
};
AddrList.defaultProps = {
  onCheckChange: () => null,
  data: [],
  isRadio: true,
  defaultValue: [],
};
