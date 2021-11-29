# context

## context 的使用场景

* 当所有组件有一些共享的或者全局的数据，那么使用 props 传递这些数据给深层次的组件将变得繁琐，这时候应该使用 context。

```js
class App extends React.Component {
  render() {
    return <Toolbar theme="dark" />;
  }
}

function Toolbar(props) {
  // Toolbar 组件接受一个额外的“theme”属性，然后传递给 ThemedButton 组件。
  // 如果应用中每一个单独的按钮都需要知道 theme 的值，这会是件很麻烦的事，
  // 因为必须将这个值层层传递所有组件。
  return (
    <div>
      <ThemedButton theme={props.theme} />
    </div>
  );
}

class ThemedButton extends React.Component {
  render() {
    return <Button theme={this.props.theme} />;
  }
}

```

如果使用 context 如下


```js
// Context 可以让我们无须明确地传遍每一个组件，就能将值深入传递进组件树。
// 为当前的 theme 创建一个 context（“light”为默认值）。
const ThemeContext = React.createContext('light');
class App extends React.Component {
  render() {
    // 使用一个 Provider 来将当前的 theme 传递给以下的组件树。
    // 无论多深，任何组件都能读取这个值。
    // 在这个例子中，我们将 “dark” 作为当前的值传递下去。
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

// 中间的组件再也不必指明往下传递 theme 了。
function Toolbar() {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

class ThemedButton extends React.Component {
  // 指定 contextType 读取当前的 theme context。
  // React 会往上找到最近的 theme Provider，然后使用它的值。
  // 在这个例子中，当前的 theme 值为 “dark”。
  static contextType = ThemeContext;
  render() {
    return <Button theme={this.context} />;
  }
}
```

* 如果只是想避免层层传递一些属性，这些属性并不是全局的，那么没有必要使用 context，因为会使得复用性变差，这时候应该使用组合的形式，也就是将深层的组件作为 props 从顶层传递下去，最后在深层使用直接显示即可。或者将深层组件放在顶层组件的闭合标签之内包裹（类似插槽），然后使用 props.children 传递下去。

```js
function Page(props) {
  const user = props.user;
  const userLink = (
    <Link href={user.permalink}>
      <Avatar user={user} size={props.avatarSize} />
    </Link>
  );
  return <PageLayout userLink={userLink} />;
}

// 现在，我们有这样的组件：
<Page user={user} avatarSize={avatarSize} />
// ... 渲染出 ...
<PageLayout userLink={...} />
// ... 渲染出 ...
<NavigationBar userLink={...} />
// ... 渲染出 ...
{props.userLink}
```

## context api

* React.createContext
    * 创建一个 Context 对象。当 React 渲染一个订阅了这个 Context 对象的组件，这个组件会从组件树中离自身最近的那个匹配的 Provider 中读取到当前的 context 值。
    ```js
        const MyContext = React.createContext(defaultValue);
    ```

* Context.Provider
    * 每个 Context 对象都会返回一个 Provider React 组件，它允许消费组件订阅 context 的变化。Provider 接收一个 value 属性，传递给消费组件。当 Provider 的 value 值发生变化时，它内部的所有消费组件都会重新渲染。
    ```js
        <MyContext.Provider value={/* 某个值 */}>
    ```
    * Provider 组件的 value 值的新旧变化检测使用的是 Object.is 算法，所以会出现一些问题：如果给 Provider 的 value 传递的值是引用类型，那么每一次 Provider 重新渲染的时候，它包裹的所有消费组件都会重新渲染。因为 value 值总是被赋值为新对象。
    ```js
        class App extends React.Component {
            render() {
                return (
                    <MyContext.Provider value={{something: 'something'}}>
                        <Toolbar />
                    </MyContext.Provider>
                );
            }
        }
    ```
    将这个对象提到父组件的 state 中可以解决这个问题：
    ```js
        class App extends React.Component {
            constructor(props) {
                super(props);
                this.state = {
                    value: {something: 'something'},
                };
            }

            render() {
                return (
                    <MyContext.Provider value={this.state.value}>
                        <Toolbar />
                    </MyContext.Provider>
                );
            }
        }
    ```

* Class.contextType
    * 将 class 上的静态属性 contextType 设置为 React.createContext 创建的 context 对象，就可以在任意生命周期和 render 函数中使用 this.context 获取到最近的 provider 提供的值。
    ```js
        class MyClass extends React.Component {
            // static contextType = MyContext; 这样写也可以
            componentDidMount() {
                let value = this.context;
                /* 在组件挂载完成后，使用 MyContext 组件的值来执行一些有副作用的操作 */
            }
            componentDidUpdate() {
                let value = this.context;
                /* ... */
            }
            componentWillUnmount() {
                let value = this.context;
                /* ... */
            }
            render() {
                let value = this.context;
                /* 基于 MyContext 组件的值进行渲染 */
            }
        }
        MyClass.contextType = MyContext;
    ```

* Context.Consumer
    * Context.Consumer 使得函数式组件可以订阅 context 中的数据。这种方法需要一个函数作为子元素。这个函数接收当前的 context 值，并返回一个 React 节点。
    ```js
        export const ThemeContext = React.createContext({
            theme: themes.dark,
            toggleTheme: () => {},
        });

        function ThemeTogglerButton() {
            return (
                <ThemeContext.Consumer>
                    {({theme, toggleTheme}) => (
                        <button
                            onClick={toggleTheme}
                            style={{backgroundColor: theme.background}}>
                            Toggle Theme
                        </button>
                    )}
                </ThemeContext.Consumer>
            );
        }
    ```

* Context.displayName
    * 可以为 context 对象设置 displayName 属性，在 React DevTools 中将显示为该 displayName 属性
    ```js
        const MyContext = React.createContext(/* some value */);
        MyContext.displayName = 'MyDisplayName';

        <MyContext.Provider> // "MyDisplayName.Provider" 在 DevTools 中
        <MyContext.Consumer> // "MyDisplayName.Consumer" 在 DevTools 中
    ```

## 例子

* 消费多个 context

```js
// Theme context，默认的 theme 是 “light” 值
const ThemeContext = React.createContext('light');

// 用户登录 context
const UserContext = React.createContext({
  name: 'Guest',
});

class App extends React.Component {
  render() {
    const {signedInUser, theme} = this.props;

    // 提供初始 context 值的 App 组件
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

function Layout() {
  return (
    <div>
      <Sidebar />
      <Content />
    </div>
  );
}

// 一个组件可能会消费多个 context
function Content() {
  return (
    <ThemeContext.Consumer>
      {theme => (
        <UserContext.Consumer>
          {user => (
            <ProfilePage user={user} theme={theme} />
          )}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```