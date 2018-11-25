import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './EmerDialog.less';

export default class EmerDialog extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    const {title, width, height, titleRight, children} = this.props;
    return (
      <div className={styles.emerDialog} style={{width: width, height: height}}>
        <div className={styles.emerDialogTitle} style={{width: 'calc(100% + 34px)'}}>
          {title}
          <div className={styles.titleRight}>{titleRight}</div>
        </div>
        <div className={styles.bodyMain} style={{width: 'calc(100% + 14px)', height: 'calc(100% - 30px)'}}>
          {children}
        </div>
      </div>
    );
  }

  static propTypes = {
    title: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
      }),
    ]),
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 组件的宽度
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 组件的高度
    titleLeft: PropTypes.any,
    titleRight: PropTypes.any,
  };

  static defaultProps = {
    width: 355,
  };
}
