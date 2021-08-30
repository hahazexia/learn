# 选择器

css 的普通规则 qualified rule 主要是由选择器和声明区块构成。声明区块又由属性和值构成。

* 普通规则
    + 选择器
    + 声明列表
        - 属性
        - 值
            * 值的类型
            * 函数

## 选择器

选择器的语法结构如下：

* complex-selector （复杂选择器，一个或多个复合选择器和关系符组成的选择器）
    + combinator （关系符，在两个选择器之间，表示两个选择器的关系）
        - 空格 （Descendant_combinator 后代选择器，所有不管多少层的所有后代元素）
        - `>` （Child_combinator 子选择器，直接子元素）
        - `+` （Adjacent_sibling_combinator 紧邻兄弟选择器，紧邻第一个元素之后的一个兄弟元素）
        - `~` （General_sibling_combinator 一般兄弟选择器，第一个元素之后的所有兄弟元素）
        - `||` （Column_combinator 列选择器）
    + compound-selector （复合选择器，没有关系符的多个简单选择器的组合，表示单个元素的多个同时发生的条件）
        - type-selectors （元素选择器，就是标签名，例如 div）
        - subclass-selectors
            * id （id 选择器 #a）
            * class （类选择器 .className）
            * attribute （属性选择器 `a[title]`）
            * pseudo-class （伪类选择器）
        - pseudo-element （伪元素）


下面是兄弟选择器的例子：

```html
    <style>
        div + p {
            background-color: blue;
        }
        .last ~ p {
            background-color: green;
        }
    </style>

    <div></div>
    <p>111</p> <!-- 111 的 p 标签会是蓝色背景色 -->
    <p class="last">222</p>
    <p>333</p> <!-- 333 和 444 的 p 标签会是绿色背景色 -->
    <p>444</p>
```

## 优先级

CSS 标准用一个三元组 (a, b, c) 来构成一个复杂选择器的优先级。
* id 选择器的数目记为 a；
* 伪类选择器和 class 选择器的数目记为 b；
* 伪元素选择器和标签选择器数目记为 c；
* “*” 不影响优先级。

```js
// base 是一个足够大的正整数。
specificity = base * base * a + base * b + c
```

* 行内属性的优先级永远高于 CSS 规则。
* 属性值后加 `!important` 将高于行内属性。
* 同一优先级的选择器遵循“后面的覆盖前面的”原则。

    ```html
        <div id="my" class="y x">text<div>
    ```
    ```css
        .x {
            background-color:lightblue;
        }
        .y {
            background-color:lightgreen;
        }
    ```
    上面的例子中 .y 在 css 代码的最后面，所以最终起作用的是 .y。

    再看一个例子
    ```html
        <div id="my" class="x y z">text<div>
    ```

    ```css
        .x, .z {
            background-color:lightblue;
        }
        .y {
            background-color:lightgreen;
        }
    ```
    逗号分隔的是选择器列表（或者说选择器分组），它的优先级是分开计算的，所以最终优先级仍跟 .y 规则相同