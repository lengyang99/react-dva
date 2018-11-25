/**
 * 数学工具类
 */
class MathUtil {
  /**
   * 按比率缩小Extent
   * @param extent 结构{xmin: number, ymin: number, xmax: number, ymax: number}
   * @param rate 缩小比率（0 < rate < 1）(指缩小后，现值相对于原值的比率)
   * @returns {{xmin: number, ymin: number, xmax: number, ymax: number}}
   */
  static lessenExtent(extent, rate) {
    const xCenter = (extent.xmax + extent.xmin) / 2.0;
    const yCenter = (extent.ymax + extent.ymin) / 2.0;

    return {
      xmin: xCenter - (rate * (xCenter - extent.xmin)),
      ymin: yCenter - (rate * (yCenter - extent.ymin)),
      xmax: xCenter + (rate * (extent.xmax - xCenter)),
      ymax: yCenter + (rate * (extent.ymax - yCenter)),
    };
  }

  /**
   * 按比率扩大Extent
   * @param extent 结构{xmin: number, ymin: number, xmax: number, ymax: number}
   * @param rate 扩大比率（0 < rate < 1）(指扩大后，原值相对于现值的比率)
   * @returns {{xmin: number, ymin: number, xmax: number, ymax: number}}
   */
  static enlargeExtent(extent, rate) {
    return MathUtil.lessenExtent(extent, 1 / rate);
  }
}

export default {MathUtil};
