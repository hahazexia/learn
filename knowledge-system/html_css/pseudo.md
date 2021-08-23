# 伪类伪元素

## 伪元素

1. 伪元素可以给其他方式无法访问的内容设置样式。例如，::first-letter 和 ::first-line 访问元素内容的第一个字母或者第一行。
2. 伪元素可以给不存在的内容设置样式（例如，::before 和 ::after 伪元素提供了访问生成的内容的方法）

* `::first-line`

必须作用于包含块 block container 才能生效。这里的块级不是元素，而是块盒即可。比如 display 为 table-cell 或者 inline-block 的后代流内元素的第一行就不会匹配到 ::first-line。

```html
<!-- div::first-line{color: red;} 生效的是 etcetera -->
<div>
    <p style="display: inline-block">
        hello<br>
        goodbye
    </p>
    etcetera
</div>
```

* `::first-letter`

和 ::first-line 类似，但是只取第一个字母。

```html
// 下面两种情况都没有 ::first-line

<div>
    <p style="display: inline-block">
        hello
        <br>
        goodbye
    </p>
    etcetera
</div>

<div>
    <br>
    this is a test
</div>
```

* `::after`

用来创建一个伪元素，作为已选中元素的最后一个子元素。通常会配合 content 属性来为该元素添加装饰内容。这个虚拟元素默认是行内元素。

* `::before`

创建一个伪元素，其将成为匹配选中的元素的第一个子元素。常通过 content 属性来为一个元素添加修饰性的内容。此元素默认为行内元素。

## 伪类

伪类是简单选择器，它允许基于文档树之外的信息进行选择，或者使用其他简单的选择器可能难以表达或无法表达这些信息。

1. 结构伪类

* `:nth-child(an + b)`: 根据位置匹配兄弟元素，n 为自然数，a 和 b 都必须为整数，并且元素的第一个子元素的下标为 1。

```html
<!-- 1, 5, 7 生效 -->
<style>
    div p:nth-child(2n+1) {color: red}
    div::before{content: 'test'}
</style>
<div>
  <p>1</p>
  <span>2</span>
  <span>3</span>
  <p>4</p>
  <p>5</p>
  <p>6</p>
  <p>7</p>
</div>

```

* `:nth-last-child()`: 和 :nth-child() 类似，不同的是从末尾开始计数。

* `:first-child`: 匹配一组兄弟元素中的第一个，比如 div > p:first-child 表示匹配 div 的 p 子元素中的第一个，要同时满足 p 和第一个。需要注意的是 div > p:first-child ， div p:first-child 和 div :first-child（有空格）的不同。

```html
<!-- 1 和 2 都生效 -->
<style>
    div :first-child {
      color: red;
    }
</style>

<div>
  <div>1</div>
  <div>
    <div>2</div>
  </div>
</div>

```

* `:last-child`: 匹配一组兄弟元素中的最后一个。

2. 逻辑伪类

* `:not()`: 该伪类函数用来匹配不符合一组选择器的元素。

```css
/* 既不是 <div> 也不是 <span> 的元素 */
body :not(div):not(span) {
  font-weight: bold;
}
```

3. 状态伪类

* `:hover`: 适用于用户使用指示设备虚指一个元素（鼠标指针虚指在某个元素但没有激活）的情况。这个样式会被任何与链接相关的伪类重写，像 :link, :visited, 和 :active 等。为了确保生效，:hover规则需要放在 :link 和 :visited 规则之后，但是在 :active 规则之前，按照 LVHA 的循顺序声明 :link－:visited－:hover－:active。

* `:active`: 匹配被用户激活的元素。当用鼠标交互时，它代表的是用户按下按键和松开按键之间的时间。

* `:focus`: 示获得焦点的元素（如表单输入）。当用户点击或触摸元素或通过键盘的 tab 键选择它时会被触发

4. 链接伪类

* `:link`: 选中元素当中的链接。它将会选中所有尚未访问的链接

* `:visited`: 匹配用户已访问过的链接。

5. 表单伪类

* `:enabled`: 表示任何被启用的（enabled）元素。如果一个元素能够被激活（如选择、点击或接受文本输入），或者能够获取焦点，则该元素是启用的。元素也有一个禁用的状态（disabled state），在被禁用时，元素不能被激活或获取焦点。

* `:disabled`: 表示任何被禁用的元素。如果一个元素不能被激活（如选择、点击或接受文本输入）或获取焦点，则该元素处于被禁用状态。元素还有一个启用状态（enabled state），在启用状态下，元素可以被激活或获取焦点。

* `:read-only`: 表示元素不可被用户编辑的状态（如锁定的文本输入框）。

* `:default`: 表示一组相关元素中的默认表单元素，可以理解为给默认选项一个特殊状态，告诉用户哪个选项是默认的。该选择器可以在 `<button>`, `<input type="checkbox">`, `<input type="radio">`, 以及 `<option>` 上使用。

* `:checked`: 表示任何处于选中状态的 radio, checkbox 或 select 元素中的 option HTML 元素。用户通过勾选/选中元素或取消勾选/取消选中，来改变该元素的 :checked 状态。

* `:required`: 任意设置了 required 属性的 `<input>` ，`<select>` , 或 `<textarea>` 元素。 这个伪类对于高亮显示在提交表单之前必须具有有效数据的字段非常有用。