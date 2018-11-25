import React, { PureComponent } from 'react';
import { Input, Button } from 'antd';
import { connect } from 'dva';
import styles from './Toobar.less';

const TextArea = Input.TextArea;
@connect(
  state => ({
    company: state.login.user.company,
    funs: state.login.funs,
  })
)
class ToolBar extends PureComponent {
  state = {
    searchWord: '',
  };
  /**
   * @desc 新增故障
   */
  handleClickAdd = () => {
    this.props.dispatch({
      type: 'malfunction/toggleModal',
      payload: true,
    });
    this.props.dispatch({
      type: 'malfunction/initModalOption',
      payload: this.props.company,
    });
  };
  /**
   * @desc search input 数据变化
   * @param {object} e - dom 事件
   */
  handleChange = (e) => {
    this.setState({
      searchWord: e.target.value,
    });
  };
  /**
   * @desc 搜索故障
   */
  handleSearch = () => {
    this.props.dispatch({
      type: 'malfunction/fetchMalList',
      payload: {
        keyword: this.state.searchWord,
      },
    });
  };

  render() {
    const { funs } = this.props;
    let malfunction_add = true; // 故障体系添加
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='malfunction_add') {
        malfunction_add = false;
      }
    }
    return (
      <div className={styles.malfunction__toolbar}>
        <div className={styles.malfunction__search}>
          <label htmlFor="search">查询: </label>
          <TextArea
            id="search"
            autosize="true"
            className={styles.malfunction__search__input}
            placeholder="请输入故障分类、现象、原因、措施"
            value={this.state.searchWord}
            onChange={this.handleChange}
          />
        </div>
        <div className={styles.malfunction__btns}>
          <Button
            type="primary"
            icon="search"
            className={styles.malfunction__button}
            onClick={this.handleSearch}
          >
            搜索
          </Button>
          <Button
            type="primary"
            icon="plus"
            className={styles.malfunction__button}
            disabled={malfunction_add}
            onClick={this.handleClickAdd}
          >
            新增
          </Button>
        </div>
      </div>
    );
  }
}

export default ToolBar;
