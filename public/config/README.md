## 地图相关配置
地图配置入口是`init.js`
```
"cfgs": [
    {
      "key": "mapcfg",
      "ecode": "0011",              -- 企业编码
      "mapType":"base",             -- 地图类型
      "url": "./config/mapcfg.json",-- 地图配置文件
      "loaded": true                -- 是否加载
    },
    {
      "key": "emer",
      "ecode": "0011",
      "mapType":"base",
      "url": "./config/lfBaiduMap.json",
      "loaded": true
    },
    {
      "key": "dgBaiduMap",
      "ecode": "0611",
      "mapType":"emer",
      "url": "./config/dgBaiduMap.json",
      "loaded": true
    }
  ]
```
### Usage
**mapType**有两个值：分别是`emer`和`base`(默认值)   
**ecode**为企业编码
