# ref

ref 被用来给元素或子组件注册引用信息。引用信息将会注册在父组件的 $refs 对象上。如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例：

```js
<!-- `vm.$refs.p` will be the DOM node -->
<p ref="p">hello</p>

<!-- `vm.$refs.child` will be the child component instance -->
<child-component ref="child"></child-component>
```

当 v-for 用于元素或组件的时候，引用信息将是包含 DOM 节点或组件实例的数组。

关于 ref 注册时间的重要说明：因为 ref 本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们 - 它们还不存在！$refs 也不是响应式的，因此你不应该试图用它在模板中做数据绑定。


## 源码

* _init 初始化的时候会执行 initLifecycle() 函数，该函数会初始化当前 Vue 实例的 $refs 为一个空对象。

* 挂载的时候首先会将模板解析成一个 AST 对象，此时会执行 processElement() 函数，该函数又会执行 processRef 去解析 ref 属性，如下:

`src\compiler\parser\index.js`

```js
/**
 * 处理元素上的 ref 属性
 *  el.ref = refVal
 *  el.refInFor = boolean
 * @param {*} el
 */
function processRef (el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    // 判断包含 ref 属性的元素是否包含在具有 v-for 指令的元素内或后代元素中
    // 如果是，则 ref 指向的则是包含 DOM 节点或组件实例的数组
    el.refInFor = checkInFor(el)
  }
}


function checkInFor (el: ASTElement): boolean {
  let parent = el
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent
  }
  return false
}
```

* 最后将 AST 生成 render 函数的时候会执行 genData() 函数 genData() 会判断是否有 ref 和 refInFor 属性，如果有则保存到 data 属性上 （这个 data 属性就是 _c 函数的第二个参数）

`src\compiler\codegen\index.js`

```js
export function genData (el: ASTElement, state: CodegenState): string {
    // ref
  if (el.ref) {
    data += `ref:${el.ref},`
  }
  if (el.refInFor) {
    data += `refInFor:true,`
  }
}
```

* 之后 patch 过程中第一次渲染的时候，会执行 ref 模块的 create 钩子函数，组件更新的时候会调用 update 钩子，销毁的时候会调用 destroy 钩子，其内部都是调用 registerRef 方法去注册 ref 应用

`src\core\vdom\modules\ref.js`

```js
/* @flow */

import { remove, isDef } from 'shared/util'

export default {
  create (_: any, vnode: VNodeWithData) {
    registerRef(vnode)
  },
  update (oldVnode: VNodeWithData, vnode: VNodeWithData) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy (vnode: VNodeWithData) {
    registerRef(vnode, true)
  }
}

export function registerRef (vnode: VNodeWithData, isRemoval: ?boolean) {
  const key = vnode.data.ref
  if (!isDef(key)) return

  const vm = vnode.context
  const ref = vnode.componentInstance || vnode.elm // 如果 vnode 是组件，ref 取 componentInstance，否则就是 DOM 元素
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = undefined
    }
  } else {
    if (vnode.data.refInFor) { // 如果 ref 的元素有 v-for，则将其定义成一个数组
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
      } else if (refs[key].indexOf(ref) < 0) {
        // $flow-disable-line
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
    // ref 注册的元素会放在 vm.$refs 这个对象上
  }
}

```