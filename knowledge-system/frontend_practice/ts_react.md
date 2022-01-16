# typescript react 最佳实践

## tsconfig.json

```ts
{
  "compilerOptions": {
    "target": "es5", // 指定ECMAScript目标版本
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ], // 要包含在编译中的库文件列表
    "allowJs": true, // 允许编译JavaScript文件
    "skipLibCheck": true, // 跳过所有声明文件的类型检查
    "esModuleInterop": true, // 禁用命名空间导入(import * as fs from "fs") ，并启用CJS/AMD/UMD风格导入(import fs from "fs")
    "allowSyntheticDefaultImports": true, // 允许从没有默认导出的模块中进行默认导入
    "strict": true, // 启用所有严格类型检查选项
    "forceConsistentCasingInFileNames": true, // 禁止对同一文件使用大小写不一致的引用。
    "module": "esnext", //  指定模块代码生成
    "moduleResolution": "node", // 使用Node.js风格解析模块
    "isolatedModules": true, // 无条件地发出未解析文件的导入
    "resolveJsonModule": true, // 包括以.json扩展名导入的模块
    "noEmit": true, // 不输出结果(意思是不编译代码，只执行类型检查)
    "jsx": "react", // Support JSX in .tsx files
    "sourceMap": true, // 生成相应的.map文件
    "declaration": true, // 生成相应的.d.ts文件
    "noUnusedLocals": true, // 报告未使用的局部变量的错误
    "noUnusedParameters": true, // 报告未使用参数的错误
    "incremental": true, // 通过从先前的编译中读取/写入磁盘上的文件来启用增量编译
    "noFallthroughCasesInSwitch": true // 报告switch语句中不可命中情况的错误
  },
  "include": [
    "src/**/*" // *** 需要做类型检查的文件 ***
  ],
  "exclude": ["node_modules", "build"] // *** 避免检查类型的文件 ***
}
```

## 引入 React

以下这种方式最可靠，因为未来可能会放弃默认导出的方式

```ts
import * as React from 'react'

import * as ReactDOM from 'react-dom'
```

另外一种就是如下

```ts
import React from 'react'

import ReactDOM from 'react-dom'
```

需要 tsconfig.json 添加额外的配置："allowSyntheticDefaultImports": true

## props

常用 props 类型


```ts
type AppProps = {
  message: string;
  count: number;
  disabled: boolean;
  /** array of a type! */
  names: string[];
  /** string literals to specify exact string values, with a union type to join them together */
  status: "waiting" | "success";
  /** an object with any number of properties (PREFERRED) */
  obj3: {
    id: string;
    title: string;
  };
  /** array of objects! (common) */
  objArr: {
    id: string;
    title: string;
  }[];
  /** a dict object with any number of properties of the same type */
  dict1: {
    [key: string]: MyTypeHere;
  };
  dict2: Record<string, MyTypeHere>; // equivalent to dict1
  /** function that doesn't take or return anything (VERY COMMON) */
  onClick: () => void;
  /** function with named prop (VERY COMMON) */
  onChange: (id: number) => void;
  /** function type syntax that takes an event (VERY COMMON) */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** alternative function type syntax that takes an event (VERY COMMON) */
  onClick(event: React.MouseEvent<HTMLButtonElement>): void;
  /** an optional prop (VERY COMMON!) */
  optional?: OptionalType;
};

export declare interface AppProps {
  children1: JSX.Element; // bad, doesnt account for arrays
  children2: JSX.Element | JSX.Element[]; // meh, doesn't accept strings
  children3: React.ReactChildren; // despite the name, not at all an appropriate type; it is a utility
  children4: React.ReactChild[]; // better, accepts array children
  children: React.ReactNode; // best, accepts everything (see edge case below)
  functionChildren: (name: string) => React.ReactNode; // recommended function as a child render prop type
  style?: React.CSSProperties; // to pass through style props
  onChange?: React.FormEventHandler<HTMLInputElement>; // form events! the generic parameter is the type of event.target
  //  more info: https://react-typescript-cheatsheet.netlify.app/docs/advanced/patterns_by_usecase/#wrappingmirroring
  props: Props & React.ComponentPropsWithoutRef<"button">; // to impersonate all the props of a button element and explicitly not forwarding its ref
  props2: Props & React.ComponentPropsWithRef<MyButtonWithForwardRef>; // to impersonate all the props of MyButtonForwardedRef and explicitly forwarding its ref
}
```

## 函数组件

经常可以看到代码中这样定义函数组件：

```ts
const App: React.FunctionComponent<{ message: string }> = ({ message }) => (
  <div>{message}</div>
);
```

而当前已经[不建议](https://github.com/facebook/create-react-app/pull/8177)使用 React.FunctionComponent 或简写 React.FC。它与普通的函数的写法有以下区别：

* React.FC 会显示定义返回类型，而普通函数是隐式定义的
* React.FC 会对静态属性进行类型检查和自动补全（例如 `displayName`, `propTypes`, `defaultProps`），而普通函数不会。React.FC 使用 `defaultProps` 存在[已知问题](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet/issues/87)
* React.FC 提供了 `children` 的隐式定义，这存在一些[已知问题](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33006)
* 未来 React.FC 可能会自动将 props 标记成 readonly

不建议使用 React.FC 的原因：

* 提供了 `children` 的隐式定义。这意味这所有组件都将接受 `children`，即使它们本不应该接收 `children`
* 不支持泛型。
    * 例如，可以这样定义一个泛型组件：
    ```ts
        type GenericComponentProps<T> = {
            prop: T
            callback: (t: T) => void
        }
        const GenericComponent = <T>(props: GenericComponentProps<T>) => {/*...*/}
    ```
    但是使用 React.FC 后就不行了，无法保证 React.FC 返回的泛型 T
    ```ts
        const GenericComponent: React.FC</* ??? */> = <T>(props: GenericComponentProps<T>) => {/*...*/}
    ```
* 使命名空间组件的写法变得别扭
```ts
// use React.FC
const  Select: React.FC<SelectProps> & { Item: React.FC<ItemProps> } = (props) => {/* ... */ }
Select.Item = (props) => { /*...*/ }

// don't use
const Select = (props: SelectProps) => {/* ... */}
Select.Item = (props: ItemProps) => { /*...*/ }

```
* defaultProps 存在问题
```ts
type  ComponentProps = { name: string; }

const  Component = ({ name }: ComponentProps) => (<div>
	{name.toUpperCase()} /* Safe since name is required */
</div>);
Component.defaultProps = { name: "John" };

const  Example = () => (<Component />) /* Safe to omit since name has a default value */
```
如果这时候 name 是可选的，使用 `React.FC<{name?: string}>` 就会使 name.toUpperCase() 报错

## hook

### useState

默认情况下，会自动推导 state 的类型

```ts
const [val, toggle] = React.useState(false);
// 推导为 boolean
```

如果想要显式设置类型，则可以使用联合类型

```ts
const [user, setUser] = React.useState<IUser | null>(null);
```

如果 state 声明后会立马赋值，也可以使用断言

```ts
const [user, setUser] = React.useState<IUser>({} as IUser);
```
这样会暂时骗过编译器 {} 是 IUser 类型，后续你需要给 state 设置一个值，否则后续会产生错误

### useEffect

useEffect 需要注意回调函数的返回值只能是函数或者 undefined。当使用箭头函数的时候可能会忽视这个问题

```ts
function DelayedEffect(props: { timerMs: number }) {
  const { timerMs } = props;

  useEffect(
    () =>
      setTimeout(() => {
        /* do stuff */
      }, timerMs),
    [timerMs]
  );
  // bad example! setTimeout implicitly returns a number
  // because the arrow function body isn't wrapped in curly braces
  return null;
}
```

### useRef

useRef 返回一个引用，它是只读的或者可变的。

* DOM 元素引用

传入元素类型作为其类型参数，null 作为初始值。这时候 userRef 返回的对象将是一个 readonly 的属性 current。

```ts
function Foo() {
  // - If possible, prefer as specific as possible. For example, HTMLDivElement
  //   is better than HTMLElement and way better than Element.
  // - Technical-wise, this returns RefObject<HTMLDivElement>
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Note that ref.current may be null. This is expected, because you may
    // conditionally render the ref-ed element, or you may forgot to assign it
    if (!divRef.current) throw Error("divRef is not assigned");

    // Now divRef.current is sure to be HTMLDivElement
    doSomethingWith(divRef.current);
  });

  // Give the ref to an element so React can manage it for you
  return <div ref={divRef}>etc</div>;
}
```

* 可变值引用

提供你自定义的类型，初始值保证和这个类型对应即可

```ts
function Foo() {
  // Technical-wise, this returns MutableRefObject<number | null>
  const intervalRef = useRef<number | null>(null);

  // You manage the ref yourself (that's why it's called MutableRefObject!)
  useEffect(() => {
    intervalRef.current = setInterval(...);
    return () => clearInterval(intervalRef.current);
  }, []);

  // The ref is not passed to any element's "ref" prop
  return <button onClick={/* clearInterval the ref */}>Cancel timer</button>;
}
```

### useMemo useCallback

下面是 useMemo useCallback 的[官方定义](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/89bbde51aa72e04375685a8a7b3e0e319700dc94/types/react/v16/index.d.ts#L1104)

```ts
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;

    function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
```

因此，useCallBack 使用时需要使用泛型参数指定 callback 的参数的类型，否则就是 any；useMemo 使用的时候可以通过泛型参数指定返回值的类型

```ts
const handleChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(evt => {console.log(evt.target.value)}, []);

const result = React.useMemo<number>(() => 2, []);
```