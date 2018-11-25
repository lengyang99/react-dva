import styles from './index.less';
import React, {PureComponent} from 'react';


// export default class State extends PureComponent{
//   constructor({props}){
//     super(props)
//   }

//   render(){
//       const {datas, value, onChange, defaultValue} = this.props;
//       const items = datas.map(item =>
//         <label className={styles['state-item']}
//                style={{
//                  color: item.name === (value !== undefined ? value : defaultValue) ? '#1C8DF5' : '#272727'
//                }}
//                onClick={() => {
//                  onChange(item.name);
//                }} key={item.name}
//         ><span>{item.alias}</span></label>);

//       return (
//         <div style={{display: 'inline-block'}}>{items}</div>
//       )
//   }
// }

const State = ({datas, value, onChange, defaultValue}) => {
  console.log(datas, value, "vvvvvv");
  const items = datas.map(item =>
      <label className={styles['state-item']}
             style={{
               color: item.name === (value !== undefined ? value : defaultValue) ? '#1C8DF5' : '#272727'
             }}
             onClick={() => {
               onChange(item.name);
             }} key={item.name}
      ><span>{item.alias}</span></label>);

      return (
        <div style={{display: 'inline-block'}}>{items}</div>
      )
}

export default State;
