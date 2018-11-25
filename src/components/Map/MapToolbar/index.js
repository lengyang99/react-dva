import React, { PureComponent } from 'react';
import styles from './index.less';
import Layers from './Layers';
import { EnlargeMapTool } from '../common/maptool/EnlargeMapTool';
import { MeasureDistanceMapTool } from '../common/maptool/MeasureDistanceMapTool';
import { IdentifyMapTool } from '../common/maptool/IdentifyMapTool';
import { EnlargeIdentifyMapTool } from '../common/maptool/EnlargeIdentifyMapTool';

export default class MapToolbar extends PureComponent {
  constructor(props) {
    super(props);

    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.resetMap = this.resetMap.bind(this);
    this.enlarge = this.enlarge.bind(this);
    this.measureDistance = this.measureDistance.bind(this);
    this.identify = this.identify.bind(this);
    this.thematicStatistics = this.thematicStatistics.bind(this);
    this.clear = this.clear.bind(this);
    this.legend = this.legend.bind(this);
  }

  /*
  * 放大地图
  * */
  zoomIn() {
    if (!this.props.map) {
      return;
    }

    this.props.map.zoomIn();
  }

  /*
   * 缩小地图
   * */
  zoomOut() {
    if (!this.props.map) {
      return;
    }

    this.props.map.zoomOut();
  }

  /*
   * 复位地图
   * */
  resetMap() {
    if (!this.props.map) {
      return;
    }

    this.props.map.resetMap();
  }

  /**
   * 拉框放大
   */
  enlarge() {
    if (!this.props.map) {
      return;
    }

    const mapTool = new EnlargeMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl());
    this.props.map.switchMapTool(mapTool);
  }

  /*
   * 测量距离
   * */
  measureDistance() {
    if (!this.props.map) {
      return;
    }

    const mapTool = new MeasureDistanceMapTool(this.props.map.getMapObj(), this.props.map.getApiUrl());
    this.props.map.switchMapTool(mapTool);
  }

  /**
   * 点击查询
   */
  identify() {
    if (!this.props.map) {
      return;
    }

    const mapTool = new IdentifyMapTool(this.props.map.getMapObj(),
      this.props.map.getApiUrl(),
      this.props.map.getMapCfg(),
      this.props.onSetQueryResults);

    this.props.map.switchMapTool(mapTool);
  }
  /**
   * 拉框查询
   */
  enlargeIdentify = () => {
    if (!this.props.map) {
      return;
    }
    const mapTool = new EnlargeIdentifyMapTool(this.props.map.getMapObj(),
      this.props.map.getApiUrl(),
      this.props.map.getMapCfg(),
      this.props.onSetQueryResults);

    this.props.map.switchMapTool(mapTool);
  };

  /**
   * 专题统计
   */
  thematicStatistics() {
    this.props.onShowThematicStatistics();
  }

  /**
   * 图例
   */
  legend() {
    this.props.onShowLegend();
  }

  /**
   * 清除
   */
  clear() {
    if (!this.props.map) {
      return;
    }

    this.props.map.clear();
    this.props.map.resetToDefaultMapTool();
  }

  render() {
    return (
      <div className={styles.toolbarBox}>
        <Layers map={this.props.map} layers={this.props.layers} setLayer={this.props.setLayer} changeVisible={this.props.changeVisible}/>
        <button
          type="button"
          id="zoomInBtn"
          className={`${styles.toolbarBtn} ${styles.zoomInImg}`}
          title="放大地图"
          onClick={this.zoomIn}
        />
        <button
          type="button"
          id="zoomOutBtn"
          className={`${styles.toolbarBtn} ${styles.zoomOutImg}`}
          title="缩小地图"
          onClick={this.zoomOut}
        />
        <button
          type="button"
          id="resetBtn"
          className={`${styles.toolbarBtn} ${styles.resetImg}`}
          title="复位地图"
          onClick={this.resetMap}
        />
        <button
          type="button"
          id="enlargeBtn"
          className={`${styles.toolbarBtn} ${styles.enlargeImg}`}
          title="拉框放大"
          onClick={this.enlarge}
        />
        <button
          type="button"
          id="distanceBtn"
          className={`${styles.toolbarBtn} ${styles.distanceImg}`}
          title="测量距离"
          onClick={this.measureDistance}
        />
        {/*<button
          type="button"
          id="rangeQueryBtn"
          className={`${styles.toolbarBtn} ${styles.rangeQueryImg}`}
          title="范围查询"
          onClick={this.enlargeIdentify}
        />
        <button
          type="button"
          id="queryBtn"
          className={`${styles.toolbarBtn} ${styles.queryImg}`}
          title="点击查询"
          onClick={this.identify}
        />*/}
        <button
          type="button"
          id="queryMetaBtn"
          className={`${styles.toolbarBtn} ${styles.tjfxImg}`}
          title="统计查询"
          onClick={() => {
            const {onShowStaticQuery = () => {}} = this.props;
            onShowStaticQuery();
          }}
        />
        <button
          type="button"
          id="queryMetaBtn"
          className={`${styles.toolbarBtn} ${styles.tjcxImg}`}
          title="条件查询"
          onClick={() => {
            const {onShowQuery = () => {}} = this.props;
            onShowQuery();
          }}
        />
        <button
          type="button"
          id="queryMetaBtn"
          className={`${styles.toolbarBtn} ${styles.queryImg}`}
          title="地址查询"
          onClick={() => {
            const {onShowAddrQuery = () => {}} = this.props;
            onShowAddrQuery();
          }}
        />
        <button
          type="button"
          id="thematicBtn"
          className={`${styles.toolbarBtn} ${styles.thematicStatisticsImg}`}
          title="专题统计"
          onClick={this.thematicStatistics}
        />
        <button
          type="button"
          id="legendBtn"
          className={`${styles.toolbarBtn} ${styles.legendImg}`}
          title="图例"
          onClick={this.legend}
        />
        <button
          type="button"
          id="clearBtn"
          className={`${styles.toolbarBtn} ${styles.clearImg}`}
          title="清除"
          onClick={this.clear}
        />
      </div>
    );
  }
}
