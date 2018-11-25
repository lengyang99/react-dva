import { EventEmitter2 } from 'eventemitter2';

// eventbus 是一个简单的EventEmitter2 对象
export default new EventEmitter2({
  wildcard: true,
});
