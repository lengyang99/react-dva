import {intersection} from 'lodash';

export function getHomePath(currentUser = {}, funs = []) {
  if (!currentUser.roleCode) {
    return '';
  }
  if (currentUser.roleCode.split(',').indexOf('equipment') !== -1) {
    return '/home/equipment';
  }
  // if (currentUser.roleCode.split(',').indexOf('director') !== -1) {
  //   return '/home/director';
  // }
  for (const it of funs) {
    if (it.code === 'page_cz') {
      const frs = it.roles.split(',');
      const urs = currentUser.roleCode.split(',');
      if (intersection(frs, urs).length > 0) {
        return '/home/station';
      }
    }
  }
  return '/home/pipe-net';
}
