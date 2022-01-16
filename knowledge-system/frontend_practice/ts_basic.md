# typescript 基础

## 使用 type

* 可以定义一个 `type` 确保函数的入参和返回值是正确的类型：
    ```js
        type Todo = {
            id: number
            text: string
            done: boolean
        }
        // Make sure that the input and the output
        // are of the correct type (both must be Todo)
        function toggleTodo(todo: Todo): Todo {
            // ...
        }
    ```
* 使用 `readonly` 关键字确保对象的属性不会被修改：
    ```js
        type Todo = {
            readonly id: number
            readonly text: string
            readonly done: boolean
        }
        function toggleTodo(todo: Todo): Todo {
            // This won’t compile
            todo.done = !todo.done
            return todo
        }
    ```
    这一点在 react 这样的框架中很有用，因为一般改变 state 都需要生成新的对象，而不是直接改变原来的对象

* 可以使用映射类型（`mapped types`）将一个 `type` 转变成另一个 `type`
    ```js
        // Readonly<...> makes each property readonly
        type Todo = Readonly<{
            id: number
            text: string
            done: boolean
        }>
    ```

## 处理数组和字面类型（literal types）

* 通过给某一个类型后面添加 `[]` 来指定一个数组类型，还可以将它设置成只读的
    ```js
        function completeAll(
            todos: readonly Todo[]
        ): CompletedTodo[] {
            // ...
        }
    ```
* 可以使用字面类型（literal types）指定某个属性必须是某个确定的值
    ```js
        type CompletedTodo = Readonly<{
            id: number
            text: string
            done: true
        }>
    ```
* 可以通过交叉类型（intersection types）来复写某些属性以去除重复代码
    ```js
        type Todo = Readonly<{
            id: number
            text: string
            done: boolean
        }>
        // Override the done property of Todo
        type CompletedTodo = Todo & {
            readonly done: true
        }
    ```

## 联合类型（union types）

* 可以使用 `A | B` 的语法创建联合类型，表示一种类型是 A 或者 B
    ```js
        type Place = 'home' | 'work' | { custom: string }
    ```
* 在属性名后加问好使其成为可选属性
    ```js
        type Todo = Readonly<{
            id: number
            text: string
            done: boolean
            // place is optional
            place?: Place
        }>
    ```

## 理解泛型

* 泛型的概念有点像普通的函数参数，只是它处理的是 type

```js
    // 声明一个泛型函数
    function genericFunc<T>() {
        // 在这里使用 T 类型
    }
    // 调用的时候，T 类型就是 number
    genericFunc<number>()
```

* 泛型还可以指定哪些类型是泛型允许的

```js
    // 限制泛型 T 只能是 number
function genericFunc<T extends number>()
// Success
genericFunc<number>()
// Error
genericFunc<string>()
```

* 还可以指定泛型的默认值

```js
// 设置泛型 T 的默认值是 number
function genericFunc<T = number>()
// 调用时不传泛型参数则默认泛型是 number
genericFunc()
```

* 泛型用的大写字母一般用描述它的单词的首字母，例如
    * S (for “S”tate)
    * T (for “T”ype)
    * E (for “E”lement)
    * K (for “K”ey)
    * V (for “V”alue)

* 泛型可以接收多个参数，并且后续的参数的允许范围可以使用之前的泛型类型

```js
// The second parameter S must be either
// boolean or whatever was specified for F
function makePair<
  F extends number | string,
  S extends boolean | F
>()
// These will work
makePair<number, boolean>()
makePair<number, number>()
makePair<string, boolean>()
makePair<string, string>()
// This will fail because the second
// parameter must extend boolean | number,
// but instead it’s string
makePair<number, string>()

```

* 可以创建泛型接口或者泛型类型别名，以达到复用

```js
// Extract into a generic interface
// to make it reusable
interface Pair<A, B> {
  first: A
  second: B
}

// Extract into a generic type alias. It’s
// basically identical to using an interface
type Pair<A, B> = {
  first: A
  second: B
}


function makePair<F, S>() {
  // Usage: Pass F for A and S for B
  let pair: Pair<F, S>
  // ...
}
```

## 断言（type assertions）

有些时候可能 typescript 不知道某个值是什么类型，比如使用 document.getElementById 获取某个 html 元素的时候，typescript 只知道会返回 HTMLElement，但是不知道具体的类型，这时候就可以使用断言，来指定更明确的类型。

```js
const myCanvas = document.getElementById('main_canvas') as HTMLCanvasElement;
```

除了上面 as 语法，还可以使用尖括号的语法，是等价的

```js
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

## 枚举（enum）

枚举允许定义一组起了名字的常量，支持数字枚举和字符串枚举。

* 数字枚举

```js
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```

第一个常量从 1 开始，后面的常量依次自增 1。如果不设置第一个从 1 开始，默认从 0 开始

```js
enum UserResponse {
  No = 0,
  Yes = 1,
}
 
function respond(recipient: string, message: UserResponse): void {
  // ...
}
 
respond("Princess Caroline", UserResponse.Yes);
```

* 字符串枚举

```js
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

