import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import styles from './SwitchBar.less';

class SwitchBar extends PureComponent {
  constructor(props) {
    super(props);
    let show = {};
    props.showId && props.showId.forEach((item) => {
      show[item] = true;
    });
    this.state = {
      collapsed: false,
      ...show,
    };
  }

  static propTypes = {
    data: PropTypes.array.isRequired,
    showId: PropTypes.array,
    onSelect: PropTypes.func,
  };
  static defaultProps = {
    data: [],
    onSelect: () => {
    }
  };

  componentWillReceiveProps(props) {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  handleClick = () => {
  };

  setLayerAnimation = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  };

  itemClick = (item) => {
    const {id} = item;
    let flag = !this.state[id];
    let newState = {
      [id]: flag
    };
    this.setState(newState, () => {
      this.props.onSelect({
        ...item,
        selected: flag
      });
    })
  };

  render() {
    const {collapsed} = this.state;
    const {data = [], showId} = this.props;
    const bw = 70 + (data.length+1) * 30;
    return (
      <div
        className={styles.animation + ' ' + styles.layerManager}
        id="layer"
        style={{width: collapsed ? 50 : bw}}
      >
        <div className={styles.stationDiv} onClick={this.setLayerAnimation} />
        {
          data.map(item => {
            const {id, name, imgPath} = item;
            let flag = this.state[id] !== undefined ? this.state[id] : false;
            return (
              <div className={styles.stationBtn} key={id} id={id} onClick={() => { this.itemClick(item) }}>
                <div
                  className={styles.stationImg}
                  style={{
                    opacity: flag ? 1 : 0.5,
                    backgroundImage: `url("${imgPath}")`,
                  }}
                />
                <span className={styles.stationName}>{name}</span>
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default SwitchBar;
