import React, { PureComponent } from 'react';
import { Table, Checkbox, Popconfirm, Tooltip } from 'antd';
import { find } from 'lodash';
import { connect } from 'dva';
import propTypes from 'prop-types';

/**
 * @decs modal 基础数据
 */
const initData = {
  isEdit: false,
  editName: '',
  classify: {
    name: '',
    id: '',
    parentId: '',
    code: '',
    isNew: true,
    active: false,
  },
  malfunction: {
    name: '',
    id: '',
    parentId: '',
    code: '',
    isNew: true,
    active: false,
  },
  reason: {
    name: '',
    id: '',
    parentId: '',
    code: '',
    isNew: true,
    active: false,
  },
  solution: {
    name: '',
    id: '',
    parentId: '',
    code: '',
    isNew: true,
    active: false,
  },
  solutionR: {
    name: '',
    id: '',
    parentId: '',
    code: '',
  },
};

const getTypeName = (typeName) => {
  const typeNameList = ['分类', '故障', '原因', '措施'];
  const index = typeNameList.indexOf(typeName);
  return (index + 1) > typeNameList.length - 1 ? '措施' : typeNameList[index + 1];
};

/**
 * @desc 展平 table 数据
 * @param {Array} list
 * @returns {Array}
 */
const flattenData = (list) => {
  const result = [];
  /**
   * @desc format 数据 移除 children
   * @param {object} data
   * @returns {object}
   */
  const dataFormat = (data) => {
    const obj = {};
    for (const key in data) {
      if (key !== 'children') {
        obj[key] = data[key];
      }
    }
    return obj;
  };
  /**
   * @desc 递归数据
   * @param {Object} data
   */
  const loop = (data) => {
    result.push(dataFormat(data));
    if (typeof data.children !== 'undefined' && Array.isArray(data.children)) {
      data.children.forEach((ele) => {
        loop(ele);
      });
    }
  };
  list.forEach(element => loop(element));
  return result;
};

/**
 * @desc 获取 form 数据
 * @param {Array} list
 * @param {number} id
 * @returns {Array}
 */
const setFormData = (list, id) => {
  const result = [find(list, { id })];
  /**
   * @desc 递归获取数据
   * @param {number} id
   */
  const loop = (id) => {
    const parentData = find(list, { id });
    result.unshift(parentData);
    if (parentData.pid) {
      loop(parentData.pid);
    }
  };
  // 判断如果当前元素有父级,则递归父级,否则不递归
  if (result[0].pid) {
    loop(result[0].pid);
  }
  return result;
};

/**
 * @desc 格式化数据
 * @param {Array} list
 */
const formatFormData = (list) => {
  const result = {};
  list.map(ele => ({
    [ele.data.type]: {
      name: ele.name,
      id: ele.id.toString(),
      parentId: ele.pid,
      code: ele.data.code,
      isNew: false,
      isActive: ele.data.active,
    },
  })).forEach((ele) => {
    Object.assign(result, ele);
  });
  return result;
};

@connect(
  state => ({
    funs: state.login.funs,
    list: state.malfunction.list || [],
    company: state.login.user.groupName,
  })
)
export default class List extends PureComponent {
  static propTypes = {
    list: propTypes.array.isRequired,
  };

  componentDidUpdate() {
    // 组件初始化后展平数据
    this.flatData = flattenData(this.props.list);
  }

  /**
   * @desc 修改故障是否活动
   * @param {object} record
   */
  handleChange = (record) => {
    this.props.dispatch({
      type: 'malfunction/updateMalfunctionActive',
      payload: {
        id: record.id,
        active: record.data.active === '1' ? '0' : '1',
      },
    });
  };

  /**
   * @desc 根据操作设置 modalOption 详情
   * @param {string} type - 类型 ['edit' | 'add']
   * @param {object} record - table row 数据
   */
  handleSetDetail = (type, record) => {
    const formData = formatFormData(setFormData(this.flatData, record.id));
    switch (type) {
      case 'edit':
        for (const key in formData) {
          if (parseInt(formData[key].id, 10) === parseInt(record.id, 10)) {
            formData[key].active = false;
          } else {
            formData[key].active = true;
          }
        }
        this.props.dispatch({
          type: 'malfunction/setModalEditOption',
          payload: record.id,
        });
        this.props.dispatch({
          type: 'malfunction/setModalOption',
          payload: {
            modalType: record.data.type,
            ...initData,
            ...formData,
            solutionR: {
              name: formData.solution && formData.solution.name,
              code: formData.solution && formData.solution.code,
            },
            isEdit: true,
            editName: record.data.type,
            isActive: record.data.active,
            quoteCount: record.data.quote,
            organization: record.data.organization,
          },
        });
        break;
      case 'add':
        for (const key in formData) {
          if (formData.hasOwnProperty(key)) {
            formData[key].active = false;
          }
        }
        this.props.dispatch({
          type: 'malfunction/setModalOption',
          payload: {
            modalType: null,
            ...initData,
            ...formData,
            isEdit: false,
            editName: '',
            quoteCount: '',
            organization: this.props.company,
            isActive: '1',
          },
        });
        break;
      default:
        return;
    }
    this.props.dispatch({
      type: 'malfunction/initFormList',
    });
    this.props.dispatch({
      type: 'malfunction/toggleModal',
      payload: true,
    });
  };
  /**
   * @desc 删除数据
   * @param {object} record - table row 数据
   */
  handleDelete = (record) => {
    this.props.dispatch({
      type: 'malfunction/deleteMalfunction',
      payload: record.id,
    });
  };

  render() {
    const { list , funs } = this.props;
    let malfunction_add = true; // 故障体系添加
    let malfunction_edit = true; // 故障体系编辑
    let malfunction_delete = true; // 故障体系删除
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='malfunction_add') {
        malfunction_add = false;
      }
      if (json.code=='malfunction_edit') {
        malfunction_edit = false;
      }
      if (json.code=='malfunction_delete') {
        malfunction_delete = false;
      }
    }
    const columns = [
      {
        title: '故障树',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => <Tooltip title={record.name}><span>({record.data.typeName}){record.name}</span></Tooltip>,
      },
      {
        title: '故障代码',
        dataIndex: 'code',
        key: 'code',
        width: 100,
        render: (text, record) => record.data.code,
      },
      {
        title: '引用次数',
        dataIndex: 'quote',
        key: 'quote',
        width: 100,
        render: (text, record) => record.data.quote,
      },
      {
        title: '活动',
        width: 100,
        render: (text, record) => <Checkbox checked3={record.data.active === '1'} onChange={this.handleChange.bind('', record)} />,
      },
      {
        title: '创建人',
        dataIndex: 'producer',
        key: 'producer',
        width: 100,
        render: (text, record) => record.data.producer,
      },
      // {
      //   title: '组织',
      //   dataIndex: 'organization',
      //   key: 'organization',
      //   width: 150
      //   render: (text, record) => record.data.organization,
      // },
      {
        title: '操作',
        width: 200,
        render: (text, record) => (
          <div>
            <a disabled={malfunction_edit} onClick={this.handleSetDetail.bind('', 'edit', record)}>编辑</a>
            <span className="divider" />
            <a disabled={malfunction_add} onClick={this.handleSetDetail.bind('', 'add', record)}>+{getTypeName(record.data.typeName)}</a>
            <span className="divider" />
            <Popconfirm onConfirm={this.handleDelete.bind('', record)} title="确定要删除这一项吗?">
              <a disabled={malfunction_delete}>删除</a>
            </Popconfirm>
          </div>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        pagation
      />
    );
  }
}
