# property 和 attribute

## 概念

html 元素的属性有两种，property 和 attribute，它们有什么区别呢？

```html
<input type="text" value="aaa">
```

上面这个输入框的 html 代码上定义的两个属性 type 和 value 就是 attribute。

* property 是浏览器根据 html 生成的 dom 节点的属性。
* attribute 是在 html 代码中在标签上定义的属性。它会被加入到 dom 节点的 attributes 属性中。
    * element.getAttribute(name) 获取属性
    * element.setAttribute(name, value) 设置属性
    * element.removeAttribute(name) 删除属性
    * element.hasAttribute(name) 是否包含有指定的属性

## 差别

1. attribute 对象包含标签里定义的所有属性，property 只包含 html 标准的属性，不包含自定义属性
2. attribute 里的属性的值是 html 标签上原始的值，除非使用 setAttribute() 方法更改，不会根据用户输入而改变（eg: input 标签）。property 在页面初始化时会映射并创建 Attribute 对象里的标准属性，从而节点对象能以对象的访问方式获取标准属性。在用户输入内容修改了原始值后，property 里对应的属性会随之变化。即，查看原始值使用 attribute，查看最新值使用 property。（input 的 value 值也可以通过 input.defaultValue 查看原始值）
3. property 与 attribute 的某些属性名称是完全一样的，例如 ref, id。某些名称有些轻微差别，例如 attribute 里的 for、class 属性映射出来对应 property 里的 htmlFor、className.某些属性名称一样，但是属性值会有限制或者修改，不会完全一样，相关的属性有 src, href, disabled, multiple 等。
4. 由于 property 不能读取自定义属性，如果标签在开始的时候对标准属性定义了非标准范围内的值，property 会默认选择一个标准值代替，导致与 attribute 里的属性不完全相等。
    ```html
        <input id="input" type="foo"></input>
        // input.type === 'text'
        // input.getAttribute('type') === 'foo'
    ```

