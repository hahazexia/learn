# 严格模式

早期的 JavaScript 语言有很多设计不合理的地方，但是为了兼容以前的代码，又不能改变老的语法，只能不断添加新的语法，引导程序员使用新语法。

严格模式是从 ES5 进入标准的，主要目的有以下几个。

* 明确禁止一些不合理、不严谨的语法，减少 JavaScript 语言的一些怪异行为。
* 增加更多报错的场合，消除代码运行的一些不安全之处，保证代码运行的安全。
* 提高编译器效率，增加运行速度。
* 为未来新版本的 JavaScript 语法做好铺垫。

1. 启用

  ```js
  'use strict';
  ```

  * use strict放在脚本文件的第一行，整个脚本都将以严格模式运行。
  * use strict放在函数体的第一行，则整个函数以严格模式运行。

2. 显式报错

  一些操作在正常模式下只会默默地失败，而在严格模式下会报错。

  * 只读属性不可写

  ```js
  'use strict';
  'abc'.length = 5;
  // TypeError: Cannot assign to read only property 'length' of string 'abc'


  // 对只读属性赋值会报错
  'use strict';
  Object.defineProperty({}, 'a', {
    value: 37,
    writable: false
  });
  obj.a = 123;
  // TypeError: Cannot assign to read only property 'a' of object #<Object>


  // 删除不可配置的属性会报错
  'use strict';
  var obj = Object.defineProperty({}, 'p', {
    value: 1,
    configurable: false
  });
  delete obj.p
  // TypeError: Cannot delete property 'p' of #<Object>
  ```

  * 只设置了取值器的属性不可写

  ```js
    'use strict';
    var obj = {
      get v() { return 1; }
    };
    obj.v = 2;
    // Uncaught TypeError: Cannot set property v of #<Object> which has only a getter
  ```

  * 禁止扩展的对象不可扩展

  ```js
    'use strict';
    var obj = {};
    Object.preventExtensions(obj);
    obj.v = 1;
    // Uncaught TypeError: Cannot add property v, object is not extensible
  ```

  * eval、arguments 不可用作标识名

    ```js
      'use strict';
      var eval = 17;
      var arguments = 17;
      var obj = { set p(arguments) { } };
      try { } catch (arguments) { }
      function x(eval) { }
      function arguments() { }
      var y = function eval() { };
      var f = new Function('arguments', "'use strict'; return 17;");
      // SyntaxError: Unexpected eval or arguments in strict mode
    ```

  * 函数不能有重名的参数

    ```js
      function f(a, a, b) {
        'use strict';
        return a + b;
      }
      // Uncaught SyntaxError: Duplicate parameter name not allowed in this context
    ```

  * 禁止八进制的前缀0表示法

    ```js
          'use strict';
          var n = 0100;
          // Uncaught SyntaxError: Octal literals are not allowed in strict mode.
    ```

3. 增强的安全措施

  * 全局变量显式声明
  
  ```js
    'use strict';

    v = 1; // 报错，v未声明

    for (i = 0; i < 2; i++) { // 报错，i 未声明
      // ...
    }

    function f() {
      x = 123;
    }
    f() // 报错，未声明就创建一个全局变量
  ```

  * 禁止 this 关键字指向全局对象

  ```js
    // 正常模式
    function f() {
      console.log(this === window);
    }
    f() // true

    // 严格模式
    function f() {
      'use strict';
      console.log(this === undefined);
    }
    f() // true
  ```

  * 禁止使用 fn.callee、fn.caller

  ```js
    function f1() {
      'use strict';
      f1.caller;    // 报错
      f1.arguments; // 报错
    }

    f1();
  ```

  * 禁止使用 arguments.callee、arguments.caller

  ```js
    'use strict';
    var f = function () {
      return arguments.callee;
    };

    f(); // 报错
  ```

  * 禁止删除变量

  ```js
    'use strict';
    var x;
    delete x; // 语法错误

    var obj = Object.create(null, {
      x: {
        value: 1,
        configurable: true
      }
    });
    delete obj.x; // 删除成功
  ```

4. 静态绑定

JavaScript 语言的一个特点，就是允许“动态绑定”，即某些属性和方法到底属于哪一个对象，不是在编译时确定的，而是在运行时（runtime）确定的。严格模式对动态绑定做了一些限制。某些情况下，只允许静态绑定。也就是说，属性和方法到底归属哪个对象，必须在编译阶段就确定。这样做有利于编译效率的提高，也使得代码更容易阅读，更少出现意外。

* 禁止使用 with 语句

  ```js
    'use strict';
    var v  = 1;
    var obj = {};

    with (obj) {
      v = 2;
    }
    // Uncaught SyntaxError: Strict mode code may not include a with statement
  ```

  * 创设 eval 作用域

  正常模式下，JavaScript 语言有两种变量作用域（scope）：全局作用域和函数作用域。严格模式创设了第三种作用域：eval作用域。正常模式下，eval语句的作用域，取决于它处于全局作用域，还是函数作用域。严格模式下，eval语句本身就是一个作用域，不再能够在其所运行的作用域创设新的变量了，也就是说，eval所生成的变量只能用于eval内部。

  ```js
    (function () {
      'use strict';
      var x = 2;
      console.log(eval('var x = 5; x')) // 5
      console.log(x) // 2
    })()


    // 在 eval 中使用严格模式
    // 方式一
    function f1(str){
      'use strict';
      return eval(str);
    }
    f1('undeclared_variable = 1'); // 报错

    // 方式二
    function f2(str){
      return eval(str);
    }
    f2('"use strict";undeclared_variable = 1')  // 报错
  ```

  * arguments 不再追踪参数的变化

  ```js
    function f(a) {
      a = 2;
      return [a, arguments[0]];
    }
    f(1); // 正常模式为[2, 2]

    function f(a) {
      'use strict';
      a = 2;
      return [a, arguments[0]];
    }
    f(1); // 严格模式为[2, 1]
  ```

5. 向下一个版本的 JavaScript 过渡

  * 非函数代码块不得声明函数

  ```js
    'use strict';
    if (true) {
      function f1() { } // 语法错误
    }

    for (var i = 0; i < 5; i++) {
      function f2() { } // 语法错误
    }
  ```

  * 保留字

  ```js
    function package(protected) { // 语法错误
      'use strict';
      var implements; // 语法错误
    }
  ```


## 总结

严格模式主要有以下限制。

* 变量必须声明后再使用
* 函数的参数不能有同名属性，否则报错
* 不能使用with语句
* 不能对只读属性赋值，否则报错
* 不能使用前缀 0 表示八进制数，否则报错
* 不能删除不可删除的属性，否则报错
* 不能删除变量delete prop，会报错，只能删除属性delete global[prop]
* eval不会在它的外层作用域引入变量
* eval和arguments不能被重新赋值
* arguments不会自动反映函数参数的变化
* 不能使用arguments.callee
* 不能使用arguments.caller
* 禁止this指向全局对象
* 不能使用fn.caller和fn.arguments获取函数调用的堆栈
* 增加了保留字（比如protected、static和interface）