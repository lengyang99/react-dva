# Pro

一套基于 dva 所搭建的开发框架，参考了 Ant Design Pro 项目实践 转移到其他项目


## 目录说明

```bash
├── mock                     # 本地模拟数据
├── public                   # 静态资源区，build 时会直接 copy 至 dist 目录
|   |── config               # 网站配置文件
|   |── images               # 静态图片存放
|   │   |── menus            # 菜单图标
│   │   ├── favicon.ico      # Favicon
│   └── index.html           # HTML 入口模板
├── src
│   ├── common               # 应用公用配置，如导航信息
│   ├── components           # 业务通用组件
│   ├── e2e                  # 集成测试用例
│   ├── layouts              # 通用布局
│   ├── models               # dva model
│   ├── routes               # 业务页面入口和常用模板
│   ├── services             # 后台接口服务
│   ├── utils                # 工具库
│   ├── polyfill.js          # 兼容性垫片
│   ├── theme.js             # 主题配置
│   ├── index.js             # 应用入口
│   ├── index.less           # 全局样式
│   └── router.js            # 路由入口
├── tests                    # 测试工具
├── README.md
└── package.json
```

### layouts

用于网站基本布局设置,是网站的基本骨架

### routes

功能模块，例如设备查询-点击查询、设备查询-范围查询等

### models

一个功能组需要对应至少一个 model，用来处理业务逻辑，这其中包含了所有 react-redux、redux-saga 内容。
model 和 model 之前通过 namespace 加以区分（namespace 带有重复检查机制）

### services

服务请求，用来定义 ajax 请求，例如在 api1.0 时代封装的 table.js、layer.js

### common/nav.js

功能路由配置地址，集中化配置

## 知识地图

从上到下，依次依赖
+ [dva](https://github.com/dvajs/dva/blob/master/README_zh-CN.md)
+ [roadhog](https://github.com/sorrycc/roadhog/blob/master/README.md)
+ [create-react-app](https://github.com/facebookincubator/create-react-app/blob/master/README.md)
