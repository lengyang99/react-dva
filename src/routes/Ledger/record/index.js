import React, { PureComponent } from 'react';
import { connect } from 'dva';
import propTypes from 'prop-types';
import EqHead from './../component/EqHead';
import RecordList from './RecordList';

@connect(
  state => ({
    eqCode: state.ledger.eqCustom.eqCode,
    eqName: state.ledger.eqCustom.eqName,
  }),
)
export default class Record extends PureComponent {
  static propTypes = {
    eqCode: propTypes.oneOfType([propTypes.string, propTypes.number]),
    eqName: propTypes.string,
  };
  static defaultProps = {
    eqCode: '',
    eqName: '',
  };
  render() {
    const { eqCode, eqName } = this.props;
    return (
      <div>
        <EqHead id={eqCode} name={eqName} />
        <RecordList />
      </div>
    );
  }
}
