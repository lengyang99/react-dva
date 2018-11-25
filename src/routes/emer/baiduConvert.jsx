import {message} from 'antd';

export default {
    MCBAND: [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
    LLBAND: [75, 60, 45, 30, 15, 0],
    MC2LL: [[1.410526172116255e-8, 0.00000898305509648872, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 17337981.2],
        [-7.435856389565537e-9, 0.000008983055097726239, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 10260144.86],
        [-3.030883460898826e-8, 0.00000898305509983578, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
        [-1.981981304930552e-8, 0.000008983055099779535, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
        [3.09191371068437e-9, 0.000008983055096812155, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
        [2.890871144776878e-9, 0.000008983055095805407, -3.068298e-8, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 826088.5]],

    LL2MC: [[-0.0015702102444, 111320.7020616939, 1704480524535203.0, -10338987376042340.0, 26112667856603880.0, -35149669176653700.0, 26595700718403920.0, -10725012454188240.0, 1800819912950474.0, 82.5],
        [0.0008277824516172526, 111320.7020463578, 647795574.6671607, -4082003173.641316, 10774905663.51142, -15171875531.51559, 12053065338.62167, -5124939663.577472, 913311935.9512032, 67.5],
        [0.00337398766765, 111320.7020202162, 4481351.045890365, -23393751.19931662, 79682215.47186455, -115964993.2797253, 97236711.15602145, -43661946.33752821, 8477230.501135234, 52.5],
        [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
        [-0.0003441963504368392, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
        [-0.0003218135878613132, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],


    /**
     * 百度web墨卡托转经纬度
     * @param cD
     * @return
     */
    convertMC2LL: function (cD) {
        var cF = null;
        for (var cE = 0; cE < this.MCBAND.length; cE++) {
            if (cD.y >= this.MCBAND[cE]) {
                cF = this.MC2LL[cE];
                break;
            }
        }
        var T = this.convertor(cD, cF);
        return T;
    },

    /**
     * 百度经纬度转web墨卡托
     * @param T
     * @return
     */
    convertLL2MC: function (T) {
        var cE = null;
        T.x = this.getLoop(T.x, -180, 180);
        T.y = this.getRange(T.y, -74, 74);

        for (let cD = 0; cD < this.LLBAND.length; cD++) {
            if (T.y >= this.LLBAND[cD]) {
                cE = this.LL2MC[cD];
                break;
            }
        }
        if (cE == null) {
            for (let cD = this.LLBAND.length - 1; cD >= 0; cD--) {
                if (T.y <= -this.LLBAND[cD]) {
                    cE = this.LL2MC[cD];
                    break;
                }
            }
        }
        var cF = this.convertor(T, cE);
        return cF;
    },

    /**
     * 经纬度转为百度的经纬度
     * @param p
     * @return
     * @throws Exception
     */
    getBaiduGpsPointByGps: function (p, callback) {
        this.onlineTrans2Baidu(p.x, p.y, function (res) {
            callback(res);
        });
    },
    /**
     * 百度的经纬度纠偏获取真实位置
     * @param p
     * @return
     * @throws Exception
     */
    getGpsPointByBaiduGps: function (p, callback) {
        this.onlineTrans2Baidu(p.x, p.y, function (res) {
            var dx = res.x;
            var dy = res.y;
            var gpsX = 2 * p.x - dx;
            var gpsY = 2 * p.y - dy;

            var result = {x: gpsX, y: gpsY};
            callback(result);
        });
    },

    onlineTrans2Baidu: function (x, y, callback) {
        var baseUrl = 'http://api.map.baidu.com/ag/coord/convert?from=0&to=4';
        baseUrl += '&x=' + x;
        baseUrl += '&y=' + y;
        var theObj = this;
        $.ajax({
            url: baseUrl,
            dataType: 'jsonp',
            jsonp: 'callback',
            success: function (res) {
                if (res.error && res.error > 0) {
                    message.error('在线请求坐标转换出错');
                    // throw new Exception('在线请求坐标转换出错');
                }
                var x = Number(theObj._base64.base64decode(res.x));
                var y = Number(theObj._base64.base64decode(res.y));
                var result = {x: x, y: y};
                callback(result);
            }
        });
    },
    convertor: function (cD, cE) {
        if (cD == null || cE == null) {
            return null;
        }
        var ret = {};
        var T = cE[0] + cE[1] * Math.abs(cD.x);
        var cC = Math.abs(cD.y) / cE[9];
        var cF = cE[2] + cE[3] * cC + cE[4] * cC * cC + cE[5] * cC * cC * cC + cE[6] * cC * cC * cC * cC + cE[7] * cC * cC * cC * cC * cC + cE[8] * cC * cC * cC * cC * cC * cC;
        T *= (cD.x < 0 ? -1 : 1);
        cF *= (cD.y < 0 ? -1 : 1);

        ret.x = T;
        ret.y = cF;
        return ret;
    },
    getRange: function (cD, cC, T) {
        cD = Math.max(cD, cC);
        cD = Math.min(cD, T);
        return cD;
    },
    getLoop: function (cD, cC, T) {
        while (cD > T) {
            cD -= T - cC;
        }
        while (cD < cC) {
            cD += T - cC;
        }
        return cD;
    },
    fD: function (a, b, c) {
        for (; a > c;)
          a -= c - b;
        for (; a < b;)
          a += c - b;
        return a;
    },
    jD: function (a, b, c) {
        b != null && (a = Math.max(a, b));
        c != null && (a = Math.min(a, c));
        return a;
    },
    yk: function (a) {
        return Math.PI * a / 180
    },
    Ce: function (a, b, c, d) {
        var dO = 6370996.81;
        return dO * Math.acos(Math.sin(c) * Math.sin(d) + Math.cos(c) * Math.cos(d) * Math.cos(b - a));
    },
    getDistance: function (a, b) {
        if (!a || !b)
          return 0;
        a.x = this.fD(a.x, -180, 180);
        a.y = this.jD(a.y, -74, 74);
        b.x = this.fD(b.x, -180, 180);
        b.y = this.jD(b.y, -74, 74);
        return this.Ce(this.yk(a.x), this.yk(b.x), this.yk(a.y), this.yk(b.y));
    },
}


