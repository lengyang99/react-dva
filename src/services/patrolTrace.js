/**
 * Created by hexi on 2017/11/21.
 */
import request from '../utils/request';

export async function getPersonTree(params) {
  if (params.loadType === 'noLoading') {
    return request(`/proxy/user/getUserPosition?userid=${params.userid}`, {
      method: 'GET',
    }, false, false, false, true, false);
  } else {
    return request(`/proxy/user/getUserPosition?userid=${params.userid}`, {
      method: 'GET',
    });
  }
}

// 查询车辆信息
export async function getEmerTempCar(data) {
  return request(`/proxy/emer/location/getEmerTempCar?objtype=2`, {
    method: 'GET',
  });
}
// 查询车辆轨迹
export async function getEmerTempCarTrack(data) {
  const {vehicle, stime, etime} = data 
  return request(`/proxy/emer/location/getEmerTempCarTrack?vehicle=${vehicle}&btime=${stime}&etime=${etime}`, {
    method: 'GET',
  });
}
export async function queryPatrolPosition(data) {
  let {userIds, startTime, endTime} = data;
  return request(`/proxy/position/getManyUsersHistoryPosition?userIds=${userIds}&startTime=${startTime}&endTime=${endTime}`, {
    method: 'GET',
  });
}


export async function queryStagnatePoints(data) {
  let {userid,startTime,endTime} = data;
  return request(`/proxy/position/staypos/getStayPosByUserid?userid=${userid}&startTime=${startTime}&endTime=${endTime}`, {
    method: 'GET',
  });
}

export async function trajectoryExportExcel(data) {
  let {userid, startTime, endTime} = data;
  return request(`/proxy/position/trajectoryExportExcel?userIds=${userid}&startTime=${startTime}&endTime=${endTime}`, {
    method: 'GET',
  });
}

