import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Input, Button } from 'antd';
import classnames from 'classnames';
import propTypes from 'prop-types';
import styles from './Toolbar.less';
import EqHead from '../component/EqHead';
import { DrawPointMapTool } from '../../../components/Map/common/maptool/DrawPointMapTool';

@connect(
  state => ({
    funs: state.login.funs,
    map: state.ledger.map,
    eqCustom: state.ledger.eqCustom,
    eqGis: state.ledger.gis,
    filterOption: state.ledger.filterOption,
  })
)
export default class Toolbar extends PureComponent {
  static propTypes = {
    eqCustom: propTypes.object.isRequired,
    eqGis: propTypes.object.isRequired,
    filterOption: propTypes.object.isRequired,
    map: propTypes.object,
  };

  static defaultProps = {
    map: null,
  };

  handleSubmit = () => {
    const { eqCustom: { gid }, filterOption, eqGis: { gisId, x, y } } = this.props;
    if (gid) {
      this.props.dispatch({
        type: 'ledger/postGis',
        payload: {
          filterOption,
          options: {
            gid,
            gisCode: gisId,
            longitude: x,
            latitude: y,
          },
        },
      });
    }
  };

  handleMark = () => {
    const { eqGis: { gisId, x, y } , funs } = this.props;
    const apiUri = `${this.props.map.mapCfg.api_path}/frame/arcgis_js_api/library/3.20/3.20/init.js`;
    const mapTool = new DrawPointMapTool(this.props.map.getMapObj(), apiUri, geom => {
      this.props.dispatch({
        type: 'ledger/setGis',
        payload: {
          gisId,
          x: geom.x,
          y: geom.y,
        },
      });
    });
    this.props.map.switchMapTool(mapTool);
  };

  render() {
    const { eqCustom: { eqCode, eqName }, eqGis: { gisId, x, y }, funs } = this.props;
    let ledger_GIS_add = true; // 设备台账GIS添加
    for ( let i = 0; i < funs.length; i++ ){
      let json = funs[i];
      if (json.code=='ledger_GIS_add') {
        ledger_GIS_add = false;
      }
    }
    return (
      <div className={styles.toolbar}>
        <p className={classnames('title', styles.toolbar__title)}>基本信息</p>
        <EqHead name={eqName} id={eqCode} />
        <div>
          <p className={classnames('title', styles.toolbar__title)}>GIS 信息</p>
          <div className={styles.toolbar__item}>
            <label className={styles.toolbar__label} htmlFor="gis">GIS编号 :</label>
            <Input value={gisId} disabled className={styles.toolbar__input} id="gis" />
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
          <Button disabled={ledger_GIS_add} onClick={this.handleSubmit} type="primary">保存</Button>
        </div>
      </div>
    );
  }
}
