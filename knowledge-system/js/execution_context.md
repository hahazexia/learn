# 执行上下文

## 执行上下文

执行上下文是评估和执行 JavaScript 代码的环境的抽象概念。每当 Javascript 代码在运行的时候，它都是在执行上下文中运行。

它有以下分类：

* 全局执行上下文 — 这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 window 对象（浏览器的情况下），并且设置 this 的值等于这个全局对象。一个程序中只会有一个全局执行上下文。
* 函数执行上下文 — 每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建，它会按定义的顺序（将在后文讨论）执行一系列步骤。
* eval 函数执行上下文 — 执行在 eval 函数内部的代码也会有它属于自己的执行上下文，但由于 JavaScript 开发者并不经常使用 eval，所以在这里我不会讨论它。


1. 当 JavaScript 执行全局代码的时候，会编译全局代码并创建全局执行上下文，而且在整个页面的生存周期内，全局执行上下文只有一份。
2. 当调用一个函数的时候，函数体内的代码会被编译，并创建函数执行上下文，一般情况下，函数执行结束之后，创建的函数执行上下文会被销毁。
3. 当使用 eval 函数的时候，eval 的代码也会被编译，并创建执行上下文。


执行上下文是 JavaScript 执行一段代码时的运行环境，在执行上下文中存在一个变量环境的对象（Viriable Environment）。

```js

showName()
console.log(myname)
var myname = 'test'
function showName() {
    console.log('函数showName被执行');
}
```

* 第 1 行和第 2 行，由于这两行代码不是声明操作，所以 JavaScript 引擎不会做任何处理；
* 第 3 行，由于这行是经过 var 声明的，因此 JavaScript 引擎将在环境对象中创建一个名为 myname 的属性，并使用 undefined 对其初始化；
* 第 4 行，JavaScript 引擎发现了一个通过 function 定义的函数，所以它将函数定义存储到堆 (HEAP）中，并在环境对象中创建一个 showName 的属性，然后将该属性值指向堆中函数的位置。
* 当执行到 showName 函数时，JavaScript 引擎便开始在变量环境对象中查找该函数，由于变量环境对象中存在该函数的引用，所以 JavaScript 引擎便开始执行该函数，并输出“函数 showName 被执行”结果。
* 接下来打印“myname”信息，JavaScript 引擎继续在变量环境对象中查找该对象，由于变量环境存在 myname 变量，并且其值为 undefined，所以这时候就输出 undefined。
* 接下来执行第 3 行，把“test”赋给 myname 变量，赋值后变量环境中的 myname 属性值改变为“test”

总结：
1. JavaScript 代码执行过程中，需要先做变量提升，而之所以需要实现变量提升，是因为 JavaScript 代码在执行之前需要先编译。
2. 在编译阶段，变量和函数会被存放到变量环境中，变量的默认值会被设置为 undefined；在代码执行阶段，JavaScript 引擎会从变量环境中去查找自定义的变量和函数。
3. 如果在编译阶段，存在两个相同的函数，那么最终存放在变量环境中的是最后定义的那个，这是因为后定义的会覆盖掉之前定义的。 `如果变量和函数同名，那么在编译阶段，变量的声明会被忽略`。（这个规则是在编译截断变量提升的时候）

## 调用栈

执行栈，也就是在其它编程语言中所说的“调用栈”，用来存储代码运行时创建的所有执行上下文。

当 JavaScript 引擎第一次遇到你的脚本时，它会创建一个全局的执行上下文并且压入当前调用栈。每当引擎遇到一个函数调用，它会为该函数创建一个新的执行上下文并压入栈的顶部。

引擎会执行那些执行上下文位于栈顶的函数。当该函数执行结束时，执行上下文从栈中弹出，控制流程到达当前栈中的下一个上下文。

```js

var a = 2
function add(b,c) {
  return b + c
}
function addAll(b,c) {
  var d = 10
  result = add(b,c)
  return  a + result + d
}
addAll(3,6)
```

1. 创建全局上下文，并将其压入栈底。全局上下文的变量环境对象包含 变量 a = undefined；函数 add；函数 addAll。
2. 开始执行全局代码。变量 a 赋值变为 2。
3. addAll 函数被调用。编译该函数创建一个执行上下文，将该函数的执行上下文压入栈。d = undefined；result = undefined。
4. 执行 addAll 函数代码。d 赋值为 10。
5. add 函数被调用。编译该函数创建一个执行上下文，将该函数的执行上下文压入栈。
6. 执行 add 函数代码。返回 9，add 函数执行上下文从调用栈中弹出。addAll 中 result 被赋值为 9。
7. addAll 返回 21，addAll 函数执行上下文从调用栈中弹出。这时候调用栈中只剩下全局执行上下文了。

## 创建执行上下文

创建执行上下文有两个阶段：1) 创建阶段 和 2) 执行阶段。

在 JavaScript 代码执行前，执行上下文将经历创建阶段。在创建阶段会发生三件事：

* this 值的决定，即我们所熟知的 This 绑定。
* 创建词法环境组件。
* 创建变量环境组件。

### this 绑定

在全局执行上下文中，this 的值指向全局对象。(在浏览器中，this引用 Window 对象)。

在函数执行上下文中，this 的值取决于该函数是如何被调用的。如果它被一个引用对象调用，那么 this 会被设置成那个对象，否则 this 的值被设置为全局对象或者 undefined（在严格模式下）。


### 词法环境

[官方的 ES6](http://ecma-international.org/ecma-262/6.0/) 文档把词法环境定义为

> **词法环境**是一种规范类型，基于 ECMAScript 代码的词法嵌套结构来定义**标识符**和具体变量和函数的关联。一个词法环境由环境记录器和一个可能的引用**外部**词法环境的空值组成。

简单来说**词法环境**是一种持有**标识符—变量映射**的结构。（这里的**标识符**指的是变量/函数的名字，而**变量**是对实际对象[包含函数类型对象]或原始数据的引用）。

现在，在词法环境的**内部**有两个组件：(1) **环境记录器**和 (2) 一个**外部环境的引用**。

1.  **环境记录器**是存储变量和函数声明的实际位置。
2.  **外部环境的引用**意味着它可以访问其父级词法环境（作用域）。

**词法环境**有两种类型：

*   **全局环境**（在全局执行上下文中）是没有外部环境引用的词法环境。全局环境的外部环境引用是 **null**。它拥有内建的 Object/Array/等、在环境记录器内的原型函数（关联全局对象，比如 window 对象）还有任何用户定义的全局变量，并且 `this`的值指向全局对象。
*   在**函数环境**中，函数内部用户定义的变量存储在**环境记录器**中。并且引用的外部环境可能是全局环境，或者任何包含此内部函数的外部函数。

**环境记录器**也有两种类型（如上！）：

1.  **声明式环境记录器**存储变量、函数和参数。
2.  **对象环境记录器**用来定义出现在**全局上下文**中的变量和函数的关系。

简而言之，

*   在**全局环境**中，环境记录器是对象环境记录器。
*   在**函数环境**中，环境记录器是声明式环境记录器。

**注意 —** 对于**函数环境**，**声明式环境记录器**还包含了一个传递给函数的 `arguments` 对象（此对象存储索引和参数的映射）和传递给函数的参数的 **length**。

抽象地讲，词法环境在伪代码中看起来像这样：

```
GlobalExectionContext = { // 全局执行上下文
  LexicalEnvironment: { // 词法环境
    EnvironmentRecord: { // 环境记录器
      Type: "Object",
      // 在这里绑定标识符
    }
    outer: <null> // 外部环境引用
  }
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: { // 此法环境
    EnvironmentRecord: { // 环境记录器
      Type: "Declarative",
      // 在这里绑定标识符
    }
    outer: <Global or outer function environment reference> // 外部环境引用
  }
}
```

### 变量环境：

它同样是一个词法环境，其环境记录器持有**变量声明语句**在执行上下文中创建的绑定关系。

如上所述，变量环境也是一个词法环境，所以它有着上面定义的词法环境的所有属性。

在 ES6 中，**词法环境**组件和**变量环境**的一个不同就是前者被用来存储函数声明和变量（`let` 和 `const`）绑定，而后者只用来存储 `var` 变量绑定。

我们看点样例代码来理解上面的概念：

```
let a = 20;
const b = 30;
var c;

function multiply(e, f) {
 var g = 20;
 return e * f * g;
}

c = multiply(20, 30);
```

执行上下文看起来像这样：

```
GlobalExectionContext = { // 全局执行上下文

  ThisBinding: <Global Object>, // 绑定 this 到全局变量

  LexicalEnvironment: { // 词法环境
    EnvironmentRecord: { // 环境记录器
      Type: "Object",
      // 在这里绑定标识符
      a: < uninitialized >,
      b: < uninitialized >,
      multiply: < func >
    }
    outer: <null>
  },

  VariableEnvironment: { // 变量环境 只用来存储 var 变量
    EnvironmentRecord: {
      Type: "Object",
      // 在这里绑定标识符
      c: undefined,
    }
    outer: <null>
  }
}

FunctionExectionContext = { // 函数执行上下文
  ThisBinding: <Global Object>,

  LexicalEnvironment: { // 词法环境
    EnvironmentRecord: { // 环境记录器
      Type: "Declarative",
      // 在这里绑定标识符
      Arguments: {0: 20, 1: 30, length: 2},
    },
    outer: <GlobalLexicalEnvironment>
  },

  VariableEnvironment: { // 变量环境 只用来存储 var 变量
    EnvironmentRecord: {
      Type: "Declarative",
      // 在这里绑定标识符
      g: undefined
    },
    outer: <GlobalLexicalEnvironment>
  }
}
```

**注意** — 只有遇到调用函数 `multiply` 时，函数执行上下文才会被创建。

可能你已经注意到 `let` 和 `const` 定义的变量并没有关联任何值，但 `var` 定义的变量被设成了 `undefined`。

这是因为在创建阶段时，引擎检查代码找出变量和函数声明，虽然函数声明完全存储在环境中，但是变量最初设置为 `undefined`（`var` 情况下），或者未初始化（`let` 和 `const` 情况下）。

这就是为什么你可以在声明之前访问 `var` 定义的变量（虽然是 `undefined`），但是在声明之前访问 `let` 和 `const` 的变量会得到一个引用错误。

这就是我们说的变量声明提升。

### 执行阶段

这是整篇文章中最简单的部分。在此阶段，完成对所有这些变量的分配，最后执行代码。

**注意** — 在执行阶段，如果 JavaScript 引擎不能在源码中声明的实际位置找到 `let` 变量的值，它会被赋值为 `undefined`。

## ES2018 中的执行上下文

以上介绍的是 ES5 的执行上下文，在 ES2018 中，执行上下文又变成了这个样子，this 值被归入 lexical environment，但是增加了不少内容。

* lexical environment：词法环境，当获取变量或者 this 值时使用。
* variable environment：变量环境，当声明变量时使用。
* code evaluation state：用于恢复代码执行位置。
* Function：执行的任务是函数时使用，表示正在被执行的函数。
* ScriptOrModule：执行的任务是脚本或者模块时使用，表示正在被执行的代码。
* Realm：使用的基础库和内置对象实例。
* Generator：仅生成器上下文有这个属性，表示当前生成器。