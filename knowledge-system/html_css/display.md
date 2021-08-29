# display

## 概念

display 指定了盒子的两个类型：

* 外部显示类型(outer display type) 定义了元素本身如何参与流式布局的处理
* 内部显示类型(inner display type) 定义了元素内子元素的布局方式。

```js
display: [ <display-outside> || <display-inside> ] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>

// 下面是不同参数的取值

<display-outside>  = block | inline | run-in
<display-inside>   = flow | flow-root | table | flex | grid | ruby
<display-listitem> = <display-outside>? && [ flow | flow-root ]? && list-item
<display-internal> = table-row-group | table-header-group |
                     table-footer-group | table-row | table-cell |
                     table-column-group | table-column | table-caption |
                     ruby-base | ruby-text | ruby-base-container |
                     ruby-text-container
<display-box>      = contents | none
<display-legacy>   = inline-block | inline-table | inline-flex | inline-grid
```

以下是不同值的说明表

|   简短写法   |  完整写法  |  生成的盒子  |
|  ----  | ----  | ----  |
|  none  |    |  从盒子树（box tree）中删除子树  |
|  contents  |    |  元素被盒子树（box tree）中内容取代  |
|  block  |   block flow  |  块级块容器，也叫块盒子  |
|  flow-root  |   block flow-root  |  块级块容器创建一个新的 BFC  |
|  inline  |   inline flow  |  行内盒子  |
|  inline-block  |   inline flow-root  |  行内级别块容器，也叫行内块  |
|  list-item  |   block flow list-item  |  带有附加标记盒的块盒  |
|  inline list-item  |   inline flow list-item  |  带有附加标记盒的行内盒  |
|  flex  |   block flex  |  块级别 flex 容器  |
|  inline-flex  |   inline flex  |  行内级别 flex 容器  |
|  grid  |   block grid  |  块级别 grid 容器  |
|  inline-grid  |   inline grid  |  行内级别 grid 容器  |
|  table  |   block table  |  块级表格包装盒包含了表格网格盒  |
|  inline-table  |   inline table  |  行内级表格包装盒包含了表格网格盒  |


## display-outside 的取值

* block 当在流布局中，生成一个块级盒子
* inline 当在流布局中，生成一个内联级盒子

## display-inside 的取值

* flow 
    * 元素内容使用流布局。
    * 如果其 outer display 类型是 inline 或 run-in，且其正在参与块或内联格式化上下文，则它会生成 inline box；否则会生成一个块容器盒。
    * 根据其他属性的值（比如 position，float 或 overflow）以及它本身是否参与块或内联格式化上下文，它要么为其内容建立新的块格式化上下文，要么将其内容集成到其父格式化上下文
* flow-root
    * 该元素生成一个块容器盒，并使用流布局布置其内容。它总是为其内容建立一个新的块格式化上下文
* table
    * 该元素生成一个主要的表格包装盒，它建立了一个块格式化上下文，它包含一个额外生成的表格网格盒，它建立了一个表格格式化上下文
* flex
    * 该元素生成一个主 flex 容器盒并建立一个 flex 格式化上下文。
* grid
    * 该元素生成一个主 grid 容器盒，并建立一个 grid 格式化上下文。
