const typeList = [
  { type: 'classify', typeName: '故障分类' },
  { type: 'malfunction', typeName: '故障' },
  { type: 'reason', typeName: '原因' },
  { type: 'solutionR', typeName: '措施' },
];

/**
 * @desc 格式化需要判断的表单内容
 * @param {object} data
 * @return {{}}
 */
const formatData = (data) => {
  const temp = {};
  /**
   * @desc 获取不为空的第一项
   * @param {object} list 表单数据
   * @return {number} - 返回索引
   */
  const startID = (list) => {
    const isNoEmpty = item => item.name || item.code;
    let index = 0;
    typeList.forEach((field, i) => {
      if (isNoEmpty(list[field.type])) {
        index = i;
        if (!list[field.type].isNew) {
          index = i + 1;
        }
        return false;
      }
    });
    console.log(index);
    return index;
  };
  const index = startID(data);
  typeList.slice(0, index + 1).forEach((field) => {
    Object.assign(temp, {
      [field.type]: { name: data[field.type].name, code: data[field.type].code, ...field },
    });
  });
  return temp;
};
/**
 * @desc 表单验证
 * @param {string} name
 * @param {string} code
 * @param {string} type
 * @param {string} typeName
 * @return {{}}
 */
const fieldValidate = ({ name, code, type, typeName }) => {
  const init = {
    nameErrorMessage: '',
    nameError: false,
    codeErrorMessage: '',
    codeError: false,
  };
  switch (true) {
    case !name && !!code:
      return {
        [type]: {
          ...init,
          nameErrorMessage: `${typeName}不能为空`,
          nameError: true,
        },
      };
    case !!name && !code:
      return {
        [type]: {
          ...init,
          codeErrorMessage: `${typeName}编码不能为空`,
          codeError: true,
        },
      };
    case !name && !code:
      return {
        [type]: {
          nameErrorMessage: `${typeName}不能为空`,
          nameError: true,
          codeErrorMessage: `${typeName}编码不能为空`,
          codeError: true,
        },
      };
    default:
      return {
        [type]: init,
      };
  }
};
/**
 * @desc 表单验证
 * @param {object} data - 四级联动需要验证的数据
 * @return {{flag: boolean, data: {}}}
 */
const formValidate = (data) => {
  const dataFormat = formatData(data);
  const result = {
    flag: false,
    data: {},
  };
  for (const key in dataFormat) {
    if (dataFormat.hasOwnProperty(key)) {
      Object.assign(result.data, fieldValidate(dataFormat[key]));
    }
  }
  result.flag = Object.keys(result.data).every(ele => !result.data[ele].nameError && !result.data[ele].codeError);
  return result;
};

export {
  fieldValidate,
  typeList,
};

export default formValidate;
