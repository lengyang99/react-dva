import { getEventForm, reportFormEvent,reportEventFile,getDictByKeys,getExtEventList,getStationUserList } from '../services/station';
import { message } from 'antd';

export default {
  namespace:'eventForm',

  state:{
    faultType:[],
    dangerType:[],
    faultDescript:[],
    dangerDescript:[],
    dangerList:{
      eventlist:[],
    },
    faultList:{
      eventlist:[],
    },
    eventForm:{
      tableName:'',
      params:[{
        items:[]
      }]
    },
    // stationUserList:{
    //
    // }

  },

  effects:{
    *getEventForm({stationUsers,eventType},{call,put}){
      const res=yield call(getEventForm ,eventType);
      ((res.params)[0].items)[0].selectValues=stationUsers;
      yield put({
        type:'saveEventForm',
        payload:{
          eventForm:res
        },
      });
    },

    *getFaultType({payload},{call,put}){
      const res=yield call(getDictByKeys,payload);
      console.log(res[payload.key]);
      if(res[payload.key]!=null&&res[payload.key].length>0){
        yield put({
          type:'saveFaultTypeData',
          payload:res[payload.key],
        });
      }
    },

    *getDangerType({payload},{call,put}){
      const res=yield call(getDictByKeys,payload);
      console.log(res);
      if(res[payload.key]!=null&&res[payload.key].length>0){
          yield put({
            type:'saveDangerType',
            payload:res[payload.key],
          });
      }
    },

    *getStationUserList({callback},{call,put}){
      const res=yield call(getStationUserList);
      const data=res.data;

      let stationArray=[];
      for(let i=0;i<data.length;i++){
        let station={};
        station.alias=data[i].name;
        station.logmark=data[i].gid;
        station.name=data[i].gid;
        let userArray=[];
        let users=data[i].users;
          if(users!=null&&users.length>0){
              for(let j=0;j<users.length;j++){
                let user={};
                user.alias=users[j].truename;
                user.logmark=users[j].userid;
                user.name=users[j].userid;
                userArray.push(user);
              }
          }
        station.selectValues=userArray;
        stationArray.push(station);
      }
      yield put({
        type:'saveStationUser',
        payload:res.data,
      });

      callback&&callback(stationArray);
    },

    *getFaultDescript({payload},{call,put}){
      const res=yield call(getDictByKeys,payload);
      console.log(res);
      if(res[payload.key]!=null&&res[payload.key].length>0) {
        yield put({
          type: 'saveFaultDescriptData',
          payload: res[payload.key],
        });
      }
    },

    *getDangerDescript({payload},{call,put}){
        const res=yield call(getDictByKeys,payload);
        console.log(res);
        if(res[payload.key]!=null&&res[payload.key].length>0){
          yield put({
            type:'saveDangerDescript',
            payload:res[payload.key],
          });
        }
    },

    *reportFormEvent({params,callback},{call,put}){
      const res=yield call(reportFormEvent,params);
      const eventid=res.data.gid;
      if(!res.success){
        message.error(res.msg);
        return;
      }

      callback(eventid);
    },

    *getFaultList({payload},{call,put}){
        const res=yield call(getExtEventList,payload);
          yield put({
            type:'saveFaultList',
            payload:res,
          });

    },

    *getDangerList({payload},{call,put}){
      const res=yield call(getExtEventList,payload);
      yield put({
        type:'saveDangerList',
        payload:res,
      });
    },

    *reportEventFile({formData,businesskey,callback},{call,put}){
      let flag=true;
      for(let i=0;i<formData.length;i++){
        formData[i].value.append('userid','2');
        formData[i].value.append('username','系统管理员');
        formData[i].value.append('tablename','p_event_form');
        formData[i].value.append('gid',businesskey);
        formData[i].value.append('tabletype','0');
        formData[i].value.append('field',formData[i].name);
        formData[i].value.append('columns','businesskey,name,text');
        const res=yield call(reportEventFile,formData[i].value);
        if(!res.success){
          message.error(res.msg);
          flag=false;
        }
      }
      callback(flag);
    }

  },

  reducers:{
    saveEventForm(state, action) {
      const formData = action.payload;
      return {
        ...state,
        ...formData,
      }
    },

    saveFaultList(state,action){
        return{
          ...state,
          faultList:action.payload,
        };
    },

    saveDangerList(state,action){
      return{
        ...state,
        dangerList:action.payload,
      };
    },

    saveFaultTypeData(state,action){
      return{
        ...state,
        faultType:action.payload,
      };
    },

    saveFaultDescriptData(state,action){
      return{
        ...state,
        faultDescript:action.payload,
      };
    },

    saveDangerType(state,action){
      return{
        ...state,
        dangerType:action.payload,
      };
    },

    saveStationUser(state,action){
      return{
        ...state,
        stationUserList:action.payload,
      }
    },

    saveDangerDescript(state,action){
      return{
        ...state,
        dangerDescript:action.payload,
      };
    },

  },
}
