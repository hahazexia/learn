# 修饰符

## 表单修饰符

这三个都用在 input 输入框 v-model 上

* .lazy 在 change 时而非 input 时更新
* .number 自动将用户的输入值转为数值类型
* .trim 去除首尾空白字符

## 事件修饰符

* .stop 阻止事件冒泡（相当于 event.stopPropagation()）
* .prevent 阻止事件的默认行为 （相当于 event.preventDefault()）
* .self 点击元素本身时才触发回调
* .once 只触发一次事件回调
* .capture 向下捕获方式触发
* .passive 滚动事件延迟
* .native 转为原生事件

## 鼠标按键修饰符

这三个用在 click 事件上

* .left 左键点击
* .right 右键点击
* .middle 中键点击

## 键值修饰符

* keyCode attribute 例如：`<input v-on:keyup.13="submit">`

按键码的别名：

* .enter
* .tab
* .delete (捕获“删除”和“退格”键)
* .esc
* .space
* .up
* .down
* .left
* .right

## 系统修饰键

* .ctrl
* .alt
* .shift
* .meta （在 Mac 系统键盘上，meta 对应 command 键 (⌘)。在 Windows 系统键盘 meta 对应 Windows 徽标键）
* .exact 精确控制系统修饰键

```html
<!-- 即使 Alt 或 Shift 被一同按下时也会触发 -->
<button v-on:click.ctrl="onClick">A</button>

<!-- 有且只有 Ctrl 被按下的时候才触发 -->
<button v-on:click.ctrl.exact="onCtrlClick">A</button>

<!-- 没有任何系统修饰符被按下的时候才触发 -->
<button v-on:click.exact="onClick">A</button>
```

## v-bind 修饰符

* .prop - 作为一个 DOM property 绑定而不是作为 attribute 绑定。
* .camel - (2.1.0+) 将 kebab-case attribute 名转换为 camelCase。
* .sync (2.3.0+) 语法糖，会扩展成一个更新父组件绑定值的 v-on 侦听器。

在有些情况下，我们可能需要对一个 prop 进行“双向绑定”。

```html
// 子组件
this.$emit('update:title', newTitle)

// 父组件
<text-document
  v-bind:title="doc.title"
  v-on:update:title="doc.title = $event"
></text-document>
```

如上例子，子组件发射一个事件，父组件监听这个事件然后更新传给子组件的 props 数据。这种模式的一个缩写，即 .sync 修饰符

```html
<text-document v-bind:title.sync="doc.title"></text-document>
```