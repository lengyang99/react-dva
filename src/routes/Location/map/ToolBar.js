import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Button, notification } from 'antd';
import classnames from 'classnames';
import propTypes from 'prop-types';
import styles from './ToolBar.less';
import LinkHeader from '../subcomponent/LinkHeader';
import { addAndEditLocationmsg } from '../../../services/eqLocation';
@connect(
  state => ({
    funs: state.login.funs,
    ecode: state.login.user.ecode, // 公司代码
  })
)
export default class Toolbar extends PureComponent {
  static propTypes = {
    gid: propTypes.number,
    locType: propTypes.string,
    locName: propTypes.string,
    eqGis: propTypes.object,
    setLocation: propTypes.func,
  };
  static defaultProps = {
    setLocation: f => f,
    gid: undefined,
    locType: '',
    locName: '',
    eqGis: {
      x: '',
      y: '',
    },
  };

  handleSubmit = () => {
    if (this.props.gid) {
      const param = {
        gid: this.props.gid,
        ecode: this.props.ecode,
        longitude: this.props.eqGis.x,
        latitude: this.props.eqGis.y,
      };
      addAndEditLocationmsg(param).then((data) => {
        if (data.success) {
          notification.success({
            message: '提交成功',
          });
          this.props.reloadData();
        } else {
          notification.error({
            message: '提交失败',
          });
        }
      });
    } else {
      notification.warning({
        message: '请先保存位置信息！',
      });
    }
  };

  handleMark = () => {
    this.props.setLocation();
  };
  render() {
    const { locName, locType, gisCode } = this.props;
    const { eqGis: { x, y }, funs } = this.props;
    let location_GIS_add = true; // 设备位置GIS添加
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='location_GIS_add') {
        location_GIS_add = false;
      }
    }
    return (
      <div className={styles.toolbar}>
        <p className={classnames('title', styles.toolbar__title)}>基本信息</p>
        <LinkHeader locName={locName} locType={locType} />
        <div>
          <p className={classnames('title', styles.toolbar__title)}>GIS 信息</p>
          <div className={styles.toolbar__item}>
            <label className={styles.toolbar__label} htmlFor="gis">GIS编号 :</label>
            <Input value={gisCode} disabled className={styles.toolbar__input} id="gis" />
          </div>
          <div className={styles.toolbar__item__small}>
            <label className={styles.toolbar__label} htmlFor="gis">横坐标 :</label>
            <Input disabled value={x} className={styles.toolbar__input__small} />
          </div>
          <div className={styles.toolbar__item__small}>
            <label className={styles.toolbar__label} htmlFor="gis">纵坐标 :</label>
            <Input disabled value={y} className={styles.toolbar__input__small} />
          </div>
          <Button onClick={this.handleMark} style={{ marginRight: 10 }} type="primary">标记位置</Button>
          <Button disabled={location_GIS_add} onClick={this.handleSubmit} type="primary">保存</Button>
        </div>
      </div>
    );
  }
}
