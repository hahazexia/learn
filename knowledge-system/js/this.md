# this绑定

## 概念

* 执行上下文中除了变量环境，词法环境，outer 外部引用，还有 this。
* 全局执行上下文中，this 指向 window。默认情况下，函数执行上下文中 this 也指向 window，如果函数中使用了严格模式，函数直接调用时 this 指向 undefined。

## 如何判断 this 执行指向


* 函数是否在new 中调用（new 绑定）？如果是的话this 绑定的是新创建的对象。

```js
var bar = new foo()
```

* 函数是否通过call、apply（显式绑定）或者硬绑定调用？如果是的话，this 绑定的是指定的对象。

```js
var bar = foo.call(obj2)
```

* 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话，this 绑定的是那个上下文对象。

```js
var bar = obj1.foo()
```

* 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到全局对象。

```js
var bar = foo()
```

* 一个最常见的 this 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定。

```js
function foo() {
　　console.log( this.a );
}
var obj = {
　　a: 2,
　　foo: foo
};
var bar = obj.foo; // 函数别名！
var a = "oops, global"; // a 是全局对象的属性
bar(); // "oops, global"
```

还有将函数作为参数传递的情况：

```js
function foo() {
　　console.log( this.a );
}
function doFoo(fn) {
　　// fn 其实引用的是foo
　　fn(); // <-- 调用位置！
}
var obj = {
　　a: 2,
　　foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
doFoo( obj.foo ); // "oops, global"
```

还有 setTimeout 也一样：

```js
function foo() {
　　console.log( this.a );
}
var obj = {
　　a: 2,
　　foo: foo
};
var a = "oops, global"; // a 是全局对象的属性
setTimeout( obj.foo, 100 ); // "oops, global"
```

还有数组的那些遍历处理的方法，也是将函数作为参数传递进去：

```js
var o = {
  v: 'hello',
  p: [ 'a1', 'a2' ],
  f: function f() {
    this.p.forEach(function (item) {
      console.log(this.v + ' ' + item);
    });
  }
}

o.f()
// undefined a1
// undefined a2
```

对象的方法中立即执行的函数也会使用默认绑定：

```js
var o = {
  f1: function () {
    console.log(this);
    var f2 = function () {
      console.log(this);
    }();
  }
}

o.f1()
// Object
// Window
```

回调函数也会丢失绑定，使用默认绑定：

```js
var o = new Object();
o.f = function () {
  console.log(this === o);
}

// jQuery 的写法
$('#button').on('click', o.f);
```

赋值表达式，条件表达式，逗号表达式的返回值都会使函数中的 this 丢失之前的隐式绑定，而去使用默认绑定，将 this 绑定到 window 上：

```js
// 情况一
(obj.foo = obj.foo)() // window
// 情况二
(false || obj.foo)() // window
// 情况三
(1, obj.foo)() // window
```

* 箭头函数不绑定 this

箭头函数不使用this的四种标准规则（也就是不绑定this），而是根据外层作用域来决定this。

```js
// 情况一
var obj = {
  data: [],
  getData: function() {
    setTimeout(() => {
      var res = ["abc", "cba", "nba"];
      this.data.push(...res); // obj.data
    }, 1000);
  }
}

obj.getData();

// 情况二
var obj = {
  data: [],
  getData: () => {
    setTimeout(() => {
      console.log(this); // window
    }, 1000);
  }
}

obj.getData();
```

隐式绑定丢失的情况：

* 函数别名
* 将函数作为参数传递
  * setTimeout setInterval 的回调
  * 数组的遍历方法：forEach map filter 等
  * addEventListener 传递的回调也会隐式丢失，this 会绑定到事件添加到的那个 html 元素上
* 对象的方法中的立即执行函数
* 赋值表达式，条件表达式，逗号表达式的返回值


## 题目

第一题

```js
var name = "window";
var person = {
  name: "person",
  sayName: function () {
    console.log(this.name);
  }
};
function sayName() {
  var sss = person.sayName;
  sss(); 
  person.sayName(); 
  (person.sayName)(); 
  (b = person.sayName)(); 
}
sayName();
```

<details>
<summary>答案</summary>

```js
function sayName() {
  var sss = person.sayName;
  // 独立函数调用，没有和任何对象关联
  sss(); // window
  // 关联
  person.sayName(); // person
  (person.sayName)(); // person
  (b = person.sayName)(); // window
}
```
</details>
<br><br>

第二题

```js
var name = 'window'
var person1 = {
  name: 'person1',
  foo1: function () {
    console.log(this.name)
  },
  foo2: () => console.log(this.name),
  foo3: function () {
    return function () {
      console.log(this.name)
    }
  },
  foo4: function () {
    return () => {
      console.log(this.name)
    }
  }
}

var person2 = { name: 'person2' }

person1.foo1(); 
person1.foo1.call(person2); 

person1.foo2();
person1.foo2.call(person2);

person1.foo3()();
person1.foo3.call(person2)();
person1.foo3().call(person2);

person1.foo4()();
person1.foo4.call(person2)();
person1.foo4().call(person2);
```


<details>
<summary>答案</summary>

```js
// 隐式绑定，肯定是person1
person1.foo1(); // person1
// 隐式绑定和显示绑定的结合，显示绑定生效，所以是person2
person1.foo1.call(person2); // person2

// foo2()是一个箭头函数，不适用所有的规则
person1.foo2() // window
// foo2依然是箭头函数，不适用于显示绑定的规则
person1.foo2.call(person2) // window

// 获取到foo3，但是调用位置是全局作用于下，所以是默认绑定window
person1.foo3()() // window
// foo3显示绑定到person2中
// 但是拿到的返回函数依然是在全局下调用，所以依然是window
person1.foo3.call(person2)() // window
// 拿到foo3返回的函数，通过显示绑定到person2中，所以是person2
person1.foo3().call(person2) // person2

// foo4()的函数返回的是一个箭头函数
// 箭头函数的执行找上层作用域，是person1
person1.foo4()() // person1
// foo4()显示绑定到person2中，并且返回一个箭头函数
// 箭头函数找上层作用域，是person2
person1.foo4.call(person2)() // person2
// foo4返回的是箭头函数，箭头函数只看上层作用域
person1.foo4().call(person2) // person1
```
</details>
<br><br>

第三题

```js
var name = 'window'
function Person (name) {
  this.name = name
  this.foo1 = function () {
    console.log(this.name)
  },
  this.foo2 = () => console.log(this.name),
  this.foo3 = function () {
    return function () {
      console.log(this.name)
    }
  },
  this.foo4 = function () {
    return () => {
      console.log(this.name)
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

person1.foo1()
person1.foo1.call(person2)

person1.foo2()
person1.foo2.call(person2)

person1.foo3()()
person1.foo3.call(person2)()
person1.foo3().call(person2)

person1.foo4()()
person1.foo4.call(person2)()
person1.foo4().call(person2)
```


<details>
<summary>答案</summary>

```js
// 隐式绑定
person1.foo1() // peron1
// 显示绑定优先级大于隐式绑定
person1.foo1.call(person2) // person2

// foo是一个箭头函数，会找上层作用域中的this，那么就是person1
person1.foo2() // person1
// foo是一个箭头函数，使用call调用不会影响this的绑定，和上面一样向上层查找
person1.foo2.call(person2) // person1

// 调用位置是全局直接调用，所以依然是window（默认绑定）
person1.foo3()() // window
// 最终还是拿到了foo3返回的函数，在全局直接调用（默认绑定）
person1.foo3.call(person2)() // window
// 拿到foo3返回的函数后，通过call绑定到person2中进行了调用
person1.foo3().call(person2) // person2

// foo4返回了箭头函数，和自身绑定没有关系，上层找到person1
person1.foo4()() // person1
// foo4调用时绑定了person2，返回的函数是箭头函数，调用时，找到了上层绑定的person2
person1.foo4.call(person2)() // person2
// foo4调用返回的箭头函数，和call调用没有关系，找到上层的person1
person1.foo4().call(person2) // person1
```
</details>
<br><br>

第四题

```js
var name = 'window'
function Person (name) {
  this.name = name
  this.obj = {
    name: 'obj',
    foo1: function () {
      return function () {
        console.log(this.name)
      }
    },
    foo2: function () {
      return () => {
        console.log(this.name)
      }
    }
  }
}
var person1 = new Person('person1')
var person2 = new Person('person2')

person1.obj.foo1()()
person1.obj.foo1.call(person2)()
person1.obj.foo1().call(person2)

person1.obj.foo2()()
person1.obj.foo2.call(person2)()
person1.obj.foo2().call(person2)
```


<details>
<summary>答案</summary>

```js
// obj.foo1()返回一个函数
// 这个函数在全局作用于下直接执行（默认绑定）
person1.obj.foo1()() // window
// 最终还是拿到一个返回的函数（虽然多了一步call的绑定）
// 这个函数在全局作用于下直接执行（默认绑定）
person1.obj.foo1.call(person2)() // window
person1.obj.foo1().call(person2) // person2

// 拿到foo2()的返回值，是一个箭头函数
// 箭头函数在执行时找上层作用域下的this，就是obj
person1.obj.foo2()() // obj
// foo2()的返回值，依然是箭头函数，但是在执行foo2时绑定了person2
// 箭头函数在执行时找上层作用域下的this，找到的是person2
person1.obj.foo2.call(person2)() // person2
// foo2()的返回值，依然是箭头函数
// 箭头函数通过call调用是不会绑定this，所以找上层作用域下的this是obj
person1.obj.foo2().call(person2) // obj
```
</details>
<br><br>

第五题

```js
class C {
    showThis() {
        console.log(this);
    }
}
var o = new C();
var showThis = o.showThis;

showThis();
o.showThis();
```

<details>
<summary>答案</summary>

类中的代码默认按照 strict 模式运行，所以 this 指向了 undefined 而不是 window
```js
class C {
    showThis() {
        console.log(this);
    }
}
var o = new C();
var showThis = o.showThis;

showThis(); // undefined
o.showThis(); // o
```
</details>
<br><br>

第六题

```js
var name = 'aaa'
var obj = {
  name: 'bbb',
  show: function () {
    console.log(this.name)
  },
  wait: function () {
    var fn = this.show
    fn()
  }
}
obj.wait()
```

<details>
<summary>答案</summary>

```js
var name = 'aaa'
var obj = {
  name: 'bbb',
  show: function () {
    console.log(this.name)
  },
  wait: function () {
    var fn = this.show
    fn()
  }
}
obj.wait()

// 'aaa'
```
</details>
<br><br>

第七题

```js
function Foo() {
  Foo.a = function() {
    console.log(1)
  }

  this.a = function() {
    console.log(2)
  }
}

Foo.prototype.a = function() {
  console.log(3)
}

Foo.a = function() {
  console.log(4)
}

Foo.a();

let obj = new Foo(); 
obj.a();
Foo.a();
```


<details>
<summary>答案</summary>

```js
function Foo() {
  Foo.a = function() {
    console.log(1)
  }

  this.a = function() {
    console.log(2)
  }
}

Foo.prototype.a = function() {
  console.log(3)
}

Foo.a = function() {
  console.log(4)
}

Foo.a();

let obj = new Foo(); 
obj.a();
Foo.a();

// 4 2 1
```
</details>
<br><br>

第八题

```js
var n = 2
var obj = {
  n: 3,
  fn: (function(n) {
    n *= 2
    this.n += 2
    var n = 5
    console.log("window.n", window.n)
    return function (m) {
      console.log("n:", n, "m", m)
      this.n *= 2
      console.log(m + (++n))
    }
  })(n)
}

var fn = obj.fn;
fn(3)
obj.fn(3)
console.log(n, obj.n)
```


<details>
<summary>答案</summary>

```js
var n = 2
var obj = {
  n: 3,
  fn: (function(n) {
    n *= 2
    this.n += 2
    var n = 5
    console.log("window.n", window.n)
    return function (m) {
      console.log("n:", n, "m:", m)
      this.n *= 2
      console.log(m + (++n))
    }
  })(n)
}

var fn = obj.fn; // window.n 4
fn(3) // "n:" 5 "m:" 3 9
obj.fn(3) // "n:" 6 "m:" 3 10
console.log(n, obj.n) // 8 6
```
</details>
<br><br>