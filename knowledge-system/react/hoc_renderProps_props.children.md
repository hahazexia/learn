# HOC、render props、props.children

## HOC

常用的高阶组件有两种方式正向的属性代理和反向的组件继承。

* 所谓正向属性代理，就是用组件包裹一层代理组件，在代理组件上，我们可以做一些，对源组件的代理操作。

```js
function HOC(WrapComponent) {
    return class Advance extends React.Component {
       state = {
           name:'alien'
       }
       render() {
           return <WrapComponent { ...this.props } { ...this.state } />
       }
    }
}
```

* 优点
    *  正常属性代理可以和业务组件低耦合，零耦合，对于条件渲染和 props 属性增强，只负责控制子组件渲染和传递额外的 props 就可以，所以无须知道，业务组件做了些什么。所以正向属性代理，更适合做一些开源项目的 HOC，目前开源的 HOC 基本都是通过这个模式实现的。
    * 同样适用于 class 声明组件，和 function 声明的组件。
    * 可以完全隔离业务组件的渲染,相比反向继承，属性代理这种模式。可以完全控制业务组件渲染与否，可以避免反向继承带来一些副作用，比如生命周期的执行。
    * 可以嵌套使用，多个 HOC 是可以嵌套使用的，而且一般不会限制包装HOC的先后顺序。
* 缺点
    * 一般无法直接获取业务组件的状态，如果想要获取，需要 ref 获取组件实例。
    *  无法直接继承静态属性。如果需要继承需要手动处理，或者引入第三方库。

下面是一个例子

```js
class Index extends React.Component {
  render() {
    return <div> hello,world </div>
  }
}
Index.say = function() {
  console.log('my name is alien')
}
function HOC(Component) {
  return class wrapComponent extends React.Component {
     render() {
       return <Component { ...this.props } { ...this.state } />
     }
  }
}
const newIndex = HOC(Index)
console.log(newIndex.say) // undefined
```

上面例子中可以看出，经过 HOC 处理后的高阶组件无法继承原来组件 Index 的静态属性 say，会打印 undefined。

* 反向继承和属性代理有一定的区别，在于包装后的组件继承了业务组件本身，所以我们我无须在去实例化我们的业务组件。当前高阶组件就是继承后，加强型的业务组件。这种方式类似于组件的强化。

```js
class Index extends React.Component {
  render() {
    return <div> hello,world  </div>
  }
}

function HOC(Component) {
    return class wrapComponent extends Component{ /* 直接继承需要包装的组件 */}
}
export default HOC(Index)

```

优点
* 方便获取组件内部状态，比如state，props，生命周期，绑定的事件函数等
* es6 继承可以良好继承静态属性。我们无须对静态属性和方法进行额外的处理。

缺点

* 无状态组件无法使用。
* 和被包装的组件强耦合，需要知道被包装的组件的内部状态，具体是做什么的
* 如果多个反向继承 hoc 嵌套在一起，当前状态会覆盖上一个状态。这样带来的隐患是非常大的，比如说有多个 componentDidMount，当前 componentDidMount 会覆盖上一个 componentDidMount。这样副作用串联起来，影响很大。

下面是一个例子：

```js
class Index extends React.Component {
  render() {
    return <div> hello,world  </div>
  }
}
Index.say = function() {
  console.log('my name is alien')
}
function HOC(Component) {
  return class wrapComponent extends Component {}
}
const newIndex =  HOC(Index)
console.log(newIndex.say)

```

## HOC 场景

1. 混入 props
    * 高阶组件最常用的功能，承接上层的 props，在混入自己的 props，来强化组件
    ```js
        function FactoryHOC(Component) {
            class Hoc extends React.Component {
                state = {
                    x: undefined,
                    y: undefined
                }
                render() {
                    return (
                        <div onMouseMove={e => {
                            this.setState({
                                x: e.clientX,
                                y: e.clientY
                            })
                        }}>
                            <Component {...this.props} x={this.state.x} y={this.state.y}></Component>
                        </div>
                    )
                }
            }
            return Hoc
        }

        const Mouse = FactoryHOC((props) => <div>mouse{props.x}{props.y}</div>)
    ```


```js
function renderHOC(WrapComponent){
  return class Index  extends React.Component{
      constructor(props){
        super(props)
        this.state={ visible:true }  
      }
      setVisible(){
         this.setState({ visible:!this.state.visible })
      }
      render(){
         const {  visible } = this.state 
         return <div className="box"  >
           <button onClick={ this.setVisible.bind(this) } > 挂载组件 </button>
           { visible ? <WrapComponent { ...this.props } setVisible={ this.setVisible.bind(this) }   />  : <div className="icon" ><SyncOutlined spin  className="theicon"  /></div> }
         </div>
  }
      }
}

class Index extends React.Component{
  render(){
    const { setVisible } = this.props
    return <div className="box" >
        <img  src='https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=294206908
        <p>hello,my name is alien</p>,2427609994&fm=26&gp=0.jpg'   /> 
        <button onClick={() => setVisible()}  > 卸载当前组件 </button>
    </div>
  }
}
export default renderHOC(Index)
```