import {
    formStationInit,
    formStationSubmit,
    queryRange,
} from '../services/station';
import { message} from 'antd';
  export default {
    namespace: 'formStation',
    state: {},
    effects: {
        * formStationInit({payload, callback}, {call}) {
            const res = yield call(formStationInit, payload);
            if (!res.success) {
              message.error(res.msg);
              return;
            }
            callback && callback(res);
        },
        * formStationSubmit({payload, callback}, {call}) {
            const res = yield call(formStationSubmit, payload);
            if (!res.success) {
              message.error(res.msg);
              return;
            }
            callback && callback(res);
        },
        * queryRange({payload, callback}, {call}) {
            const res = yield call(queryRange, payload);
            console.log(res);
            if (!res.success) {
              message.error(res.msg);
              return;
            }
            callback && callback(res);
        }
    },
  };