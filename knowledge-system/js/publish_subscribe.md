# 发布订阅模式

## 概念

* 发布订阅模式又叫观察者模式，它定义对象间的一种一对多的依赖关系，当一个对象的状态发生改变时，所有依赖于它的对象都将得到通知。

* 发布订阅模式可以广泛应用于异步编程中，这是一种替代传递回调函数的方案。比如，我们可以订阅 ajax 请求的 error、succ 等事件。 或者如果想在动画的每一帧完成之后做一些事情，那我们可以订阅一个事件，然后在动画的每一帧完成之后发布这个事件。在异步编程中使用发布订阅模式，我们就无需过多关注对象在异步运行期间的内部状态，而只需要订阅感兴趣的事件发生点。

* 第二点说明发布订阅模式可以取代对象之间硬编码的通知机制，一个对象不用再显式地调用另外一个对象的某个接口。发布订阅模式让两个对象松耦合地联系在一起，虽然不太清楚彼此的细节，但这不影响它们之间相互通信。当有新的订阅者出现时，发布者的代码不需要任何修改；同样发布者需要改变时，也不会影响到之前的订阅者。只要之前约定的事件名没有变化，就可以自由地改变它们。

* 使用 addEventListener 为元素添加事件监听函数就是典型的订阅发布模式

## 实现

```js
class Subject {
  observers = []

  addObserver(observer) {
    this.observers.push(observer)
  }
  removeObserver(observer) {
    let index = this.observers.indexOf(observer)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
  notify() {
    this.observers.forEach(observer => {
      observer.update()
    })
  }
}

class Observer{
  constructor(fn) {
      this.update = fn;
  }
  subscribeTo(subject) {
    subject.addObserver(this)
  }
}

// 测试代码

let subject = new Subject()
let observer = new Observer(function() {
    console.log('update 调用了')
})
observer.subscribeTo(subject)

subject.notify()
```

## 实现 eventBus

```js
class EventBus {
  map = {} 

  on(type, handler) {
    this.map[type] = (this.map[type] || []).concat(handler)
  }

  once(type, handler) {
    const _this = this
    function cb() {
        _this.off(type, cb)
        handler.apply(_this, arguments);
    }
    this.on(type, cb)
  }

  fire(type, data) {
    this.map[type] && this.map[type].forEach(handler => handler(data))
  }

  off(type, handler) {
    if(this.map[type]) {
      if(!handler) {
        delete this.map[type]
      } else {
        let index = this.map[type].indexOf(handler)
        if (index >= 0) {
          this.map[type].splice(index, 1)
        }
      }
    }
  }
}


const eventBus = new EventBus()

eventBus.on('click:btn', data => {
  console.log(data)
})

eventBus.fire('click:btn', {a: 1, b: 2})
eventBus.off('click:btn')
eventBus.fire('click:btn', {a: 1, b: 2})
```