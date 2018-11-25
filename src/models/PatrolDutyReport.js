import { getPatrol, about } from '../services/station';
export default {
    namespace: 'PatrolDutyReport',

    state: {
      datas: [],
      tags: [],
      PatrolList: []
    },

    effects: {
        // init: function*(action, { put }) {
        //     const datas = yield fetch("/proxy/patrol/leakcar/getLeakCarListByCondition?ecode=4&startTime=2017-11-21 09:00:00&endTime=2017-11-30 10:00:00&pageno=1&pagesize=5", {
        //         "method": "GET",
        //         "headers": {
        //             "Content-Type": "application/json"
        //         }
        //     }).then((datas) => { return datas.json() })
        //     yield put({ "type": "init_sync", datas });
        // },
        // * getPatrol({ eventType, callback }, { call, put }) {
        //     const res = yield call(getPatrol, eventType);
        //     callback(res);

        //     yield put({ "type": "init_sync", datas });
        // },
        * getPatrol({ eventType, callback }, { call, put }) {
            const res = yield call(getPatrol, eventType);

            // console.log(res)
            yield put({
                type: 'getPatrols',
                res
            });
        },

        * about({ startValue, endValue }, { call, put }) {
            const data = yield call(about, { startValue, endValue });
            // console.log(startValue)
            console.log(data)
            yield put({
                type: 'abouts',
                data
            });
        },
        //     about: function*({ startValue, endValue }, { put }) {
        //         const data = yield fetch("/proxy/patrol/leakcar/getLeakCarListByCondition?ecode=4&startTime=" + startValue + "&endTime=" + endValue + "&pageno=1&pagesize=5", {
        //             "method": "GET",
        //             "headers": {
        //                 "Content-Type": "application/json"
        //             }
        //         }).then((data) => { return data.json() })
        //         yield put({ "type": "about_sync", data });
        //     },
        // },

    },
    reducers: {

        getPatrols(state, { res }) {
            return {
                ...state,
                PatrolList: res.list,
            };
        },
        abouts(state, { data }) {
            console.log(data)
            return {
                ...state,
                PatrolList: data.list
            }
        },

    }
}
