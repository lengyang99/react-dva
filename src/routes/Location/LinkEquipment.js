import React, { PureComponent } from 'react';
import propTypes from 'prop-types';
import { Table } from 'antd';
import LinkHeader from './subcomponent/LinkHeader';

class LinkEquipment extends PureComponent {
  render() {
    const columns = [
      {
        title: '序号',
        dataIndex: '',
      },
      {
        title: '设备编码',
        dataIndex: '',
      },
      {
        title: '设备名称',
        dataIndex: '',
      },
      {
        title: '位置',
        dataIndex: '',
      },
      {
        title: '状态',
        dataIndex: '',
      },
      {
        title: '所属站点',
        dataIndex: '',
      },
      {
        title: '所属机构',
        dataIndex: '',
      },
    ];
    const {locName, locType} = this.props.BasicMessageValue;
    return (
      <div>
        <LinkHeader locName={locName} locType={locType} />
        <Table dataSource={[]} columns={columns} />
      </div>
    );
  }
}

LinkEquipment.propTypes = {
  BasicMessageValue: propTypes.object,
};

LinkEquipment.defaultProps = {
  BasicMessageValue: {},
};

export default LinkEquipment;
