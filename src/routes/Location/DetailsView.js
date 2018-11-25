import propTypes from 'prop-types';
import React, { PureComponent } from 'react';
import BasicMessageForm from './subcomponent/BasicMessageForm';
import ChildLocation from './subcomponent/ChildLocation';

class DetailsView extends PureComponent {
  render() {
    return (
      <div>
        <BasicMessageForm
          BasicMessageValue={this.props.BasicMessageValue}
          reloadData={this.props.reloadData}
          attachmentListArr={this.props.attachmentListArr}
          edit={this.props.edit}
          onValueChange={this.props.onValueChange}
          treeData={this.props.treeData}
        />
        <ChildLocation childDataSource={this.props.childDataSource} />
      </div>
    );
  }
}

DetailsView.protoType = {
  attachmentListArr: propTypes.array,
  BasicMessageValue: propTypes.object,
  childDataSource: propTypes.array,
  reloadData: propTypes.func,
  onValueChange: propTypes.func,
};

DetailsView.defaultType = {
  attachmentListArr: [],
  BasicMessageValue: {},
  childDataSource: [],
  reloadData: f => f,
  onValueChange: f => f,
};

export default DetailsView;
