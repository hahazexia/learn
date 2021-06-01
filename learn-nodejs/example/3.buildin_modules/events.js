const EventEmitter = require('events')

// 创建发射器
const emitter = new EventEmitter();

// 监听事件
emitter.on('click', (args) => {
    console.log('监听1click事件', args)
});
const listener =  (args) => {
    console.log('监听2click事件', args)
};
emitter.on('click', listener);

// 发射事件

setTimeout(() => {
    emitter.emit('click', 'aa', 'bb', 'cc')
    emitter.off('click', listener)
    emitter.emit('click', 'aa', 'bb', 'cc')
}, 2000)