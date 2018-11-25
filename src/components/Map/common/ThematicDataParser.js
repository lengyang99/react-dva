/**
 * 专题数据解析
 * 新增专题数据的获取方法
 */
import request from '../../../utils/request';

export default class ThematicDataParser {
  getRequestData(url, callback) {
    request(url, {
      method: 'get',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/text;charset=UTF-8',
      },
    }).then((res) => {
      const result = this.parseResult(res);
      callback && callback(result);
    });
  }

  parseResult(data) {
    if (data.success !== undefined && data.success === false) {
      throw new Error(data.msg);
    }

    if (!data) {
      throw new Error('专题数据为空');
    }

    const result = [];
    for (let i = 0; i < data.list.length; ++i) {
      const element = { x: null, y: null, attr: [], link: [] , dataInfo: data.list[i]};
      let xy = null;
      for (let j = 0; j < data.params[0].items.length; ++j) {
        if (data.params[0].items[j].type == 'GEOMEXT') {
          xy = data.list[i][data.params[0].items[j].name];
        } else {
          element.attr.push({
            key: data.params[0].items[j].name,
            name: data.params[0].items[j].alias,
            type: data.params[0].items[j].type,
            value: data.list[i][data.params[0].items[j].name] ?
              data.list[i][data.params[0].items[j].name] : '',
          });
        }
      }
      if (data.list[i].eventid) {
        element.attr.push({
          key: 'eventid',
          name: 'eventid',
          value: data.list[i].eventid,
        });
      }
      if (xy) {
        const index = xy.indexOf(',');
        element.x = xy.slice(0, index);
        element.y = xy.slice(index + 1);
      }
      result.push(element);
    }

    return result;
  }
}
