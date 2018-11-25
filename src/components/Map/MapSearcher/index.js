import React from 'react';
import { connect } from 'dva';
import { Input, Select, Button, Menu, Spin } from 'antd';
import { loadModules } from 'esri-loader';

const InputGroup = Input.Group;
const Option = Select.Option;

@connect(state => ({
  points: state.mapSearch.results,
}))

export default class MapSearcher extends React.Component {
  constructor(props) {
    super(props);

    this.search = this.search.bind(this);

    this.map = null;

    this.state = {
      type: '地址',
      text: '',
      isMenu: false,
      fetching: false,
    };
  }

  componentDidMount() {
  }

  // 搜索框内容改变触发事件
  handleMenuClick = (value) => {
    const data = value.key.split(',');
    const point = {
      x: data[0],
      y: data[1],
    };
    this.map.centerAt(point);
    // $('#searchInput').value
  };

  // 输入框内容改变时触发事件
  handleChange = (e) => {
    const content = e.target.value;
    this.setState({
      text: content,
    });
    if (content === '') {
      this.setState({ isMenu: false });
    }
  };
  // 将搜索结果点绘制到地图上
  drawPoint = (points) => {
    loadModules(['esri/geometry/Point',
      'esri/SpatialReference',
      'esri/graphic',
      'esri/Color',
      'esri/symbols/PictureMarkerSymbol',
      'esri/symbols/TextSymbol',
      'esri/symbols/Font'], { url: this.apiUrl })
      .then(([Point, SpatialReference, Graphic, Color, PictureMarkerSymbol, TextSymbol, Font]) => {
        const font = new Font('10pt', Font.STYLE_NORMAL, Font.VARIANT_NORMAL, Font.WEIGHT_BOLD, 'Courier');
        // 只取搜索结果前5个
        for (let i = 0; i < (points.length <= 5 ? points.length : 5); i++) {
          // 新建ArcGIS 符号对象
          const markerSymbol = new PictureMarkerSymbol('images/map/location/' + (i + 1) + '.png', 26, 41);
          // 新建ArcGIS Point对象
          const point = new Point(points[i].x, points[i].y,
            new SpatialReference({ wkid: 3857 }));
          // 将name设置到text符号中
          const textSymbol = new TextSymbol(points[i].attributes.name, font, new Color('#696969'));
          textSymbol.setOffset(10, 10).setHaloColor(new Color('#fff')).setHaloSize(2);
          textSymbol.setAlign(TextSymbol.ALIGN_MIDDLE);
          textSymbol.setOffset(10, 30);
          // textSymbol.setText(points[i].name);
          this.map.graphics.add(new Graphic(point, markerSymbol));
          this.map.graphics.add(new Graphic(point, textSymbol));
        }
      });
    // 默认平移到第一个点
    this.map.centerAt(points[0].point);
    this.setState({
      fetching: false,
      isMenu: true,
    });
  };

  // 搜索按钮点击事件
  search = () => {
    this.setState({fetching: true}); // 搜索
    const searchType = this.state.type;
    const text = this.state.text;
    switch (searchType) {
      case '地址':
        this.props.dispatch({
          type: 'mapSearch/search',
          payload: {
            searchParams: {
              c: 191,
              wd: text,
            },
            transParams: {
              coors: '',
              ecode: '0011',
              fromSRID: 'BDMecator',
              toSRID: 'Mercator',
            },
            fun: this.drawPoint,
          },
        });
        break;
      case '管网':
        alert('功能正在开发中...');
        break;
      default:
        break;
    }
  };

  selectChange = (value) => {
    this.setState({
      type: `selected ${value}`,
    });
  };

  render() {
    const MenuItem = [];
    const waitnotice = (this.state.fetching ? <Spin style={{ position: 'absolute', top: 8, left: 350 }} /> : null);
    if (this.props.points) {
      const points = this.props.points;
      for (let i = 0; i < (points.length <= 5 ? points.length : 5); i++) {
        const point = points[i];
        MenuItem.push(
          <Menu.Item key={'' + point.x + ',' + point.y}>
            {point.attributes.name}
          </Menu.Item>
        );
      }
    }
    const menu = this.state.isMenu ? (
      <Menu
        style={{
          marginLeft: 72,
          width: 240,
        }}
        onClick={this.handleMenuClick}
      >{MenuItem}
      </Menu>
    ) : null;
    return (
      <InputGroup
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 150,
          width: 350,
        }}
        compact
      >
        <Select defaultValue="地址" onChange={this.selectChange}>
          <Option value="地址">地址</Option>
          <Option value="管网">管网</Option>
        </Select>
        <Input
          id="searchInput"
          style={{ width: 240 }}
          placeholder="输入搜索内容"
          onChange={this.handleChange}
        />
        <Button type="primary" icon="search" onClick={this.search}/>
        {waitnotice}
        {menu}
      </InputGroup>
    );
  }
}
