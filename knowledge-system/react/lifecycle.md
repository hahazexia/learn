# 生命周期

React 组件的生命周期分为挂载、更新、卸载阶段。React16.4 版本后的生命周期钩子函数只能在类组件中使用，而函数组件中的生命周期钩子函数用 React Hook 来实现。

## 挂载阶段

1. constructor
1. getDerivedStateFromProps
1. componentDidMount
1. render

```js
import React from 'react';

class HelloWorld extends React.Component {
  constructor(props) {
    super(props);
    this.state = { title: 'hello React' };
    console.log('执行constructor')
  }
  static getDerivedStateFromProps(props, state){
    console.log('执行getDerivedStateFromProps')
    return null;
  }
  componentDidMount(){
    console.log('执行componentDidMount')
  }
  render() {
    console.log('执行render')
    return (
      <div>{this.state.title}</div>
    );
  }
}

export default HelloWorld;
```

* constructor 仅用于以下两种情况：通过给 this.state 赋值对象来初始化内部 state。为事件处理函数绑定实例。
* getDerivedStateFromProps 会在调用 render 方法之前调用，并且在初始挂载及后续更新时都会被调用。它应返回一个对象来更新 state，如果返回 null 则不更新任何内容。
* componentDidMount 会在组件挂载后（插入 DOM 树中）立即调用。
  * 获取 DOM 元素
  * 请求服务端数据
  * 监听事件，必须在 componentWillUnmount 中取消监听
  * 可以调用 this.setState() 来改变 state 

## 更新阶段

1. getDerivedStateFromProps
1. shouldComponentUpdate
1. render
1. getSnapshotBeforeUpdate
1. componentDidUpdate

```js
import React from 'react';

class HelloWorld extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = {
      title: 'hello world'
    }
    this.update = this.update.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    console.log('执行getDerivedStateFromProps');
    return null;
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('执行shouldComponentUpdate');
    return true;
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('执行getSnapshotBeforeUpdate');
    return null;
  }
  componentDidUpdate() {
    console.log('执行componentDidUpdate')
  }
  update() {
    this.setState({
      title: 'hello react'
    })
  }
  render() {
    console.log('执行render')
    return (
      <div onClick={this.update}>{this.state.title}</div>
    )
  }
}
export default HelloWorld;

```

有三个操作会触发组件 update：

1. 组件的 props 发生变化
1. 执行 this.setState
1. 执行 this.forceUpdate


```js
shouldComponentUpdate(nextProps, nextState) {
  if (this.props.color !== nextProps.color) {
    return true;
  }
  if (this.state.count !== nextState.count) {
    return true;
  }
  return false;
}

```

* shouldComponentUpdate 
  * shouldComponentUpdate 接收更新之后的 state 和 props，通过和更新前的 state 和 props 对比，来判断是否更新组件，如果函数最后返回 true 则更新组件，反之返回 false 则不更新组件，一般用于性能优化
  * 在组件中执行 this.forceUpdate 触发组件更新，则不会执行 shouldComponentUpdate 钩子函数
  * 在 shouldComponentUpdate 中执行 this.setState 时，必须在一个条件语句里中，否会陷入无限更新的死循环，导致程序崩溃
  * 函数最后必须返回 true 或 false，若返回 false，后续 render、getSnapshotBeforeUpdate、componentDidUpdate 钩子函数不再被调用

* getSnapshotBeforeUpdate 
  * getSnapshotBeforeUpdate 调用时，props 和 state 已经更新了，故该钩子函数接收更新前的 props 和 state 作为参数，作为比较使用。getSnapshotBeforeUpdate 钩子函数最后返回一个值，该值会被 componentDidUpdate 钩子函数的第三个参数 snapshot 接收。
  * getSnapshotBeforeUpdate 钩子函数是在组件重新渲染后挂载到 DOM 之前被调用，故在该钩子函数中获取到的 DOM 还是更新前的 DOM ，一般用于组件 DOM 更新做一些交互操作。
  * 在其中执行 this.forceUpdate 或 this.setState 时，必须在一个条件语句里中，否会陷入无限更新的死循环，导致程序崩溃；
  * 函数最后必须返回一个值或 null，否则代码会报错；
  * 必须和 componentDidUpdate 钩子函数一起调用，否则代码会报错

* componentDidUpdate

  * componentDidUpdate 在组件重新渲染后并挂载到 DOM 中后才执行的，函数参数接收更新前的 state 和 props，还用snapshot 参数接收 getSnapshotBeforeUpdate 钩子函数返回值
  * 在其中执行 this.forceUpdate 或 this.setState 时，必须在一个条件语句里中，否会陷入无限更新的死循环，导致程序崩溃
  * 如果 shouldComponentUpdate 钩子函数返回值为 false，则不会调用 componentDidUpdate 钩子函数

## 卸载阶段

componentWillUnmount 会在组件卸载及销毁之前调用。我们一般在其中处理以下事项：

* 清除定时器
* 取消网络请求
* 解绑在 componentDidMount 钩子函数中监听的事件

## 父子组件挂载顺序

* 父 constructor
* 父 getDerivedStateFromProps
* 父 render
* 子 constructor
* 子 getDerivedStateFromProps
* 子 render
* 子 componentDidMount
* 父 componentDidMount

## 父子组件更新顺序

* 父 getDerivedStateFromProps
* 父 shouldComponentUpdate
* 父 render
* 子 getDerivedStateFromProps
* 子 shouldComponentUpdate
* 子 render
* 子 getSnapshotBeforeUpdate
* 父 getSnapshotBeforeUpdate
* 子 componentDidUpdate
* 父 componentDidUpdate

## 父子组件卸载顺序

* 子 componentWillUnmount
* 父 componentWillUnmount