import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Table } from 'antd';


class ChildLocation extends PureComponent {
  constructor(props) {
    super(props);

    this.columns = [{
      title: '序号',
      dataIndex: 'gid',
    }, {
      title: '位置编号',
      dataIndex: 'locCode',
    }, {
      title: '位置名称',
      dataIndex: 'locName',
    }];
  }

  render() {
    return (
      <div>
        <div className="title">子级位置
        </div>
        <Table
          style={{ margin: '0 20px' }}
          columns={this.columns}
          dataSource={this.props.childDataSource}
          pagination={{
            pageSize: 4,
          }}
        />
      </div>
    );
  }
}

ChildLocation.protoType = {
  childDataSource: propTypes.array,
};

ChildLocation.defaultType = {
  childDataSource: [],
};

export default ChildLocation;
