import React from 'react';
import { getCurrTk } from '../../utils/utils.js';
import styles from './index.less';

export default (props) => {
  const { countData, tableData, reporttime } = props;
  let attr = {};
  const tbodyMap = tableData.map(item => {
    attr = item.attributes;
    return (
      <React.Fragment>
        <tr>
          <td rowSpan="5">
            <span>1</span>
          </td>
          <td rowSpan="5">{attr.gkjg_role}</td>
          <td rowSpan="5">
            <a className="detailInfo" name="" value="TW170001232">{attr.address}</a>
          </td>
          <td className={styles.head}>施工方式</td>
          <td>{attr.sg_way}</td>
          <td className={styles.head}>敷设方式</td>
          <td>{attr.install_method}</td><td>{attr.varchar2}</td>
          <td className={styles.head}>施工区域内燃气管道</td>
          <td>{attr.varchar36}</td>
          <td className={styles.head}>管控级别</td>
          <td>{attr.control_level}</td>
          <td className={styles.head}>是否完成探管</td>
          <td>{attr.varchar27}</td>
          <td className={styles.head}>保护协议及告知函</td>
          <td>{attr.is_protection_scheme}</td>
          <td className={styles.head}>地下空间</td>
          <td>{attr.varchar13}</td>
          <td rowSpan="3" className={styles.head}>施工动态</td>
          <td className={styles.head}>描述是否按施工方案施工，处于什么阶段，当日具体施工内容</td>
          <td>{attr.sg_step}</td>
          <td rowSpan="5">
            {attr.xc_img ? attr.xc_img.split(',').map(elem => {
              return <img src={`${window.location.origin}/proxy/attach/downloadFile?id=${elem}&token=${getCurrTk()}`} alt="无" />;
            }) : '无'}
          </td>
        </tr>
        <tr>
          <td className={styles.head}>开工日期</td>
          <td>{attr.deal_stime}</td>
          <td className={styles.head}>管径</td>
          <td colSpan="2">{attr.pipe_diameter}</td>
          <td className={styles.head}>燃气管道属性</td>
          <td>{attr.varchar8}</td>
          <td className={styles.head}>施工点与管道距离</td>
          <td>{attr.sg_distance}</td>
          <td className={styles.head}>探管时间</td>
          <td>{attr.varchar28}</td>
          <td className={styles.head}>保护方案</td>
          <td>{attr.varchar33}</td>
          <td rowSpan="3" className={styles.head}>地下空间位置关系</td>
          <td>{attr.varchar16}</td>
          <td className={styles.head}>描述施工方式是机械施工或人工开挖等</td>
          <td>{attr.sg_way}</td>
        </tr>
        <tr>
          <td className={styles.head}>穿越最大扩孔孔径</td>
          <td>无</td>
          <td className={styles.head}>阀门数量及状态</td>
          <td>1个</td><td>完好</td>
          <td className={styles.head}>燃气管道运行情况</td>
          <td>通气</td>
          <td className={styles.head}>管控类型</td>
          <td>开挖/开挖</td>
          <td className={styles.head}>探管方式</td>
          <td>人工开挖确认管位</td>
          <td className={styles.head}>停气施工</td>
          <td>不需要停气施工</td>
          <td>{attr.varchar14}</td>
          <td className={styles.head}>描述开挖、穿越设备等设备是否在施工区域内</td>
          <td>{attr.sg_step}</td>
        </tr>
        <tr>
          <td className={styles.head}>施工单位</td>
          <td>{attr.sg_company}</td>
          <td className={styles.head}>管道埋深及材质</td>
          <td>{attr.pipe_depth}</td><td>{attr.pipe_material}</td>
          <td className={styles.head}>燃气管道保护措施</td>
          <td>{attr.varchar37}</td>
          <td className={styles.head}>位置关系</td>
          <td>{attr.varchar10}</td>
          <td className={styles.head}>是否进入建筑红线</td>
          <td>{attr.varchar26}</td>
          <td className={styles.head}>应急预案及气源保障方案</td>
          <td>{attr.is_emergency_plan}</td>
          <td>{attr.varchar13}</td>
          <td rowSpan="2" className={styles.head}>监护动态</td>
          <td className={styles.head}>描述是否需要现场监护</td>
          <td>{attr.custody_remark}</td>
        </tr>
        <tr>
          <td className={styles.head}>建设单位</td>
          <td>{attr.varchar4}</td>
          <td className={styles.head}>合规性手续</td>
          <td colSpan="2">{attr.varchar18}</td>
          <td className={styles.head}>施工方案</td>
          <td>{attr.varchar23}</td>
          <td className={styles.head}>拍照取证</td>
          <td>{attr.varchar22}</td>
          <td className={styles.head}>警示标志</td>
          <td>{attr.varchar31}</td>
          <td className={styles.head}>符合作业关闭条件</td>
          <td>-</td>
          <td className={styles.head}>施工管理人员机械作业人员</td>
          <td>{attr.sg_linkman},{attr.sg_phone} {attr.varchar5}, {attr.varchar6}</td>
          <td className={styles.head}>描述监护时段及监护记录</td>
          <td>{attr.custody_stime}-{attr.custody_etime}</td>
        </tr>
      </React.Fragment>
    );
  });
  return (
    <div className={styles.bottom}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th colSpan="22">第三方施工管控日报表</th>
          </tr>
          <tr>
            <th colSpan="22" style={{ textAlign: 'left' }}>日期：{reporttime}</th>
          </tr>
          <tr>
            <th colSpan="3" rowSpan="3">管网数据</th>
            <th rowSpan="2">本日施工点(处)</th>
            <th colSpan="3">新增施工(处)</th>
            <th colSpan="5">管控级别(处)</th>
            <th colSpan="2" rowSpan="2">年度累计施工点(处)</th>
            <th colSpan="3" rowSpan="2">年度累计完成施工点(处)</th>
            <th colSpan="2">管网长度(km)</th>
            <th rowSpan="2">小区(个)</th>
            <th rowSpan="3" />
            <th rowSpan="4">现场照片</th>
          </tr>
          <tr>
            <th>每日</th>
            <th>月度</th>
            <th>年度</th>
            <th colSpan="2">一级</th>
            <th colSpan="2">二级</th>
            <th>三级</th>
            <th>中压</th>
            <th>庭院</th>
          </tr>
          {countData.dayNum ?
            <tr>
              <td>{countData.dayNum.total}</td>
              <td>{countData.dayNum.total}</td>
              <td>{countData.monthNum.total}</td>
              <td>{countData.yearNum.total}</td>
              <td colSpan="2">{(countData.controlLevel.一级 || {}).total}</td>
              <td colSpan="2">{(countData.controlLevel.二级 || {}).total}</td>
              <td>{(countData.controlLevel.三级 || {}).total}</td>
              <td colSpan="2">{countData.yearGrandTotalNum.total}</td>
              <td colSpan="3">{countData.yearFinishGrandTotalNum.total}</td>
              <td>{countData.mediumPressure}</td>
              <td>{countData.courtyard}</td>
              <td>{countData.residentialQuarters}</td>
            </tr> :
            <tr>
              <td />
              <td />
              <td />
              <td />
              <td colSpan="2" />
              <td colSpan="2" />
              <td />
              <td colSpan="2" />
              <td colSpan="3" />
              <td />
              <td />
              <td />
            </tr>
          }
          <tr>
            <th>
              编号
            </th>
            <th>负责人</th>
            <th>
              (镇/区)
                施工路段
            </th>
            <th colSpan="2">
              第三方施工信息
            </th>
            <th colSpan="5">
              燃气管道信息
            </th>
            <th colSpan="6">
              管控要项
            </th>
            <th colSpan="2">
              外部环境
            </th>
            <th colSpan="3">
              施工现场动态简述
            </th>
          </tr>
        </thead>
        <tbody>
          {tbodyMap}
        </tbody>
      </table>
    </div>
  );
};
