import React, { PureComponent } from 'react';
import MeterForm from './MeterForm';
import MeterTable from './MeterTable';
import styles from './MeterInfo.less';

class MeterInfo extends PureComponent {
  render() {
    return (
      <div>
        <div className={styles.header}><span className={styles.header__icon} />表计信息</div>
        <div>
          <MeterForm />
          {/*<MeterTable />*/}
        </div>
      </div>
    );
  }
}

export default MeterInfo;
