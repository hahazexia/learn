# 获取元素

## document.getElementById

```js
var element = document.getElementById(id);
```

* 如果获取不到对应 id 的元素，则返回 null
* 如果有 id 重复的元素，则获取代码中出现的第一个
* getElementById 只能作为 document 的属性使用

## getElementsByTagName

```js
var elements = document.getElementsByTagName(name);
var elements = element.getElementsByTagName(tagName);

elements.length // html 集合的长度
elements[0] // 获取 html 集合中第 0 个元素
elements.item(0) // 同上
```

* 返回一个包括所有给定标签名称的元素的 HTML 集合（HTMLCollection）。HTMLCollection 是即时更新的；当其所包含的文档结构发生改变时，它会自动更新
* 可以在 document 和任意元素上调用

## getElementsByClassName

```js
var elements = document.getElementsByClassName(name);
var elements = element.getElementsByClassName(name);

document.getElementsByClassName('red test'); // 获取所有 class 同时包括 'red' 和 'test' 的元素
```

* 返回一个包含了所有指定类名的子元素的  HTML 集合（HTMLCollection）。HTMLCollection 是即时更新的
* 可以在 document 和任意元素上调用

## querySelector

```js
var element = document.querySelector(selectors);
var element = element.querySelector(selectors);

var el = document.querySelector("div.user-panel.main input[name='login']");
```

* 返回与指定选择器或选择器组匹配的第一个 html 元素。 如果找不到匹配项，则返回 null
* 可以在 document 和任意元素上调用
* 匹配是使用深度优先先序遍历，从文档标记中的第一个元素开始，并按子节点的顺序依次遍历
* 当在指定元素上调用时，选择器首先会应用到整个文档，而不是这个指定元素，来创建一个可能有匹配元素的初始列表。然后从结果元素中检查它们是否是指定元素的后代元素。第一个匹配的元素将会被 querySelector 方法返回。

## querySelectorAll

```js
var elementList = document.querySelectorAll(selectors);
var elementList = container.querySelectorAll(selectors);

elementList.length // nodeList 长度
elementList[0] // 获取 nodeList 第 0 个元素
elementList.item(0) // 同上
elementList.forEach(function (item, index, nodeList) => {});
```

* 返回与指定的选择器组匹配的文档中的元素列表 (使用深度优先的先序遍历文档的节点)
* 返回的是静态 NodeList，不会随着文档变化而变化，不是即时更新的。