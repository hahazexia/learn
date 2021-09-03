# v-model

```js
<body>
    <div id="app">
        <input type="text" v-model="test">
        <div>{{test}}</div>
    </div>
    </div>
  </body>
  <script src="./vue.js"></script>
  <script>
    new Vue({
      name: "App",
      el: '#app',
      data () {
          return {
              test: 1
          }
      }
    })
  </script>
```

1. 编译器在词法分析的时候会调用 `src\platforms\web\compiler\modules\model.js` 中的 preTransformNode 做前置处理，目的是:

```html
<input v-model="data[type]" :type="type">
<!-- 上面这种形式转化为下面 -->
<input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
<input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
<input v-else :type="type" v-model="data[type]">
```

因为 input 的 type 不同，双向绑定需要处理的事件也不同，所以变成这种形式，降低了处理的复杂度。

2. 接着 processElement 方法中会调用 processAttrs 处理其他指令，包括 v-bind v-on v-model。处理完 v-model 后将其添加到 el.directives 上。

本例中的 el.directives 如下：

```js
[{
    "name": "model",
    "rawName": "v-model",
    "value": "test",
    "arg": null,
    "isDynamicArg": false,
    "start": 42,
    "end": 56
}]
```

3. generate 阶段（根据 AST 生成 render 代码），会调用 genElement ，其中会调用 genData ，genData 中调用了 genDirectives。

```js
function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','

}
```

genDirectives 中先通过 `state.directives[dir.name]` 拿到 v-model 对应的生成方法，v-model 对应的 model 方法在 `src\platforms\web\compiler\directives\model.js` 中。因为 input 是 text 普通类型的，所以 model 方法会走到 genDefaultModel(el, value, modifiers) 中。

```js
function model (
  el: ASTElement,
  dir: ASTDirective,
  _warn: Function
) {
    else if (tag === 'input' || tag === 'textarea') {
    genDefaultModel(el, value, modifiers)
  }
}
```

genDefaultModel 中对于当前例子设置 valueExpression 为 '$event.target.value'，event 为 'input'，意思就是 value 值是 event.target.value，而 addEventListener 绑定的事件为 input 事件。

然后会调用 genAssignmentCode 去生成代码。此处调用为 genAssignmentCode('test', "$event.target.value")。返回值得到 "test=$event.target.value"。然后又命中了 needCompositionGuard，于是变成 "if($event.target.composing)return;test=$event.target.value"（注意：原生事件对象的 event.isComposing 用于判断当前输入处于输入法输入的中途 阶段）。

接下来是关键的两句代码，

```js
  addProp(el, 'value', `(${value})`)
  addHandler(el, event, code, null, true)
```

这两句代码使得双向绑定成为现实，通过修改 AST 元素，给 el 添加一个 prop，相当于我们在 input 上动态绑定了 value，又给 el 添加了事件处理，相当于在 input 上绑定了 input 事件，相当于变成了如下：

```js
<input
  v-bind:value="test"
  v-on:input="test=$event.target.value">
```

其实就是动态绑定了 input 的 value 指向了 test 变量，并且在触发 input 事件的时候去动态把 test 设置为目标值，这样实际上就完成了数据双向绑定了，所以说 v-model 实际上就是语法糖。

4. addProp 之后 el.props（el.props 用于存放绑定的原生 DOM 对象属性）为：

```js
// el.props
[
    {
        dynamic: undefined
        name: "value"
        value: "(test)"
    }
]
```

addHandler 之后 `el.events`（el.events 用于存放事件）为：

```js
// el.events
{
    input: {
        dynamic: undefined
        value: "if($event.target.composing)return;test=$event.target.value"
    }
}
```

然后 genDefaultModel 执行结束，model 也执行结束，又回到还没执行完的 genDirectives 方法，最后 genDirectives 返回的字符串如下：

```js
"directives:[{name:"model",rawName:"v-model",value:(test),expression:"test"}]"
```

接着 genProps 会生成 domProps:{"value":(test)} 加入到 genData 的字符串中。

然后 genHandlers 会生成 on:{"input":function($event){if($event.target.composing)return;test=$event.target.value}} 加入到 genData 的字符串中。

这两部对应了刚才 addProp addHandler 对 AST 的修改（分别添加了 el.props 和 el.events）。

最后 genElement 的返回值为 

```js
"_c('input',{directives:[{name:"model",rawName:"v-model",value:(test),expression:"test"}],attrs:{"type":"text"},domProps:{"value":(test)},on:{"input":function($event){if($event.target.composing)return;test=$event.target.value}}})"

// 转化成对象

_c('input',{
    directives:[
        {
            name:"model",
            rawName:"v-model",
            value:(test),
            expression:"test"
        }
    ],
    attrs:{
        "type":"text"
    },
    domProps:{
        "value":(test)
    },
    on:{
        "input": function($event){
            if($event.target.composing)return;
            test=$event.target.value
        }
    }
})
```

也就是说最后 render 函数用 _c 创建这个 input 元素的时候其实就会有这些属性。

5. 接下来在 patch 的阶段，createElm 会去创建真实的 dom 节点，然后会调用 invokeCreateHooks 函数去循环所有更新 dom 节点属性的函数，主要有下面这些函数：
    * updateAttrs
    * updateClass
    * updateDOMListeners
    * updateDOMProps
    * updateStyle
    * updateDirectives

其中 updateDOMProps 就负责刚才 input 的 domProps，updateDOMListeners 就负责绑定事件。


updateDOMProps 为 input 元素设置 value 属性值。

```js
function updateDOMProps() {
    for (key in props) {
        if (key === 'value' && elm.tagName !== 'PROGRESS') {
            // store value as _value as well since
            // non-string values will be stringified
            elm._value = cur
            // avoid resetting cursor position when value is the same
            const strCur = isUndef(cur) ? '' : String(cur)
            if (shouldUpdateValue(elm, strCur)) {
                elm.value = strCur
            }
        } else if (
        // skip the update if old and new VDOM state is the same.
        // `value` is handled separately because the DOM value may be temporarily
        // out of sync with VDOM state due to focus, composition and modifiers.
        // This  #4521 by skipping the unnecesarry `checked` update.
        cur !== oldProps[key]
        ) {
            // some property updates can throw
            // e.g. `value` on <progress> w/ non-finite value
            try {
                elm[key] = cur
            } catch (e) {}
        }
    }
}
```

updateDOMListeners 最后负责绑定事件，其中最后使用 addEventListener 去绑定事件。


```js
function updateDOMListeners (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
    return
  }
  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.elm
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, createOnceHandler, vnode.context)
  target = undefined
}
```

6. 于是当 js 修改 data 中数据值的时候，会通知 watcher 重新渲染，然后重新获取到值绑定到 dom 元素的 value 上。如果输入框输入了其他值，则会触发 input 事件，把 event.target.value 赋值给 data 中数据。