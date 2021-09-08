# flex

## 基础概念

* flex-flow 属性（flex-direction 和 flex-wrap 的简写模式）和书写模式（writing mode）会决定这些条件如何编排组织 物理方向（top/right/bottom/left），坐标轴（vertical/horizontal），大小（width/height）。
* main axis（主轴）：flex 容器中 flex 项目排列的主要坐标轴。书写模式默认情况下（horizontal-tb），主轴为从左到右，水平方向。
* main-start main-end：flex 项目在 flex 容器中从 main-start 开始朝 main-end 的方向排列。
* cross axis（侧轴）：与主轴垂直的轴。书写模式默认情况下（horizontal-tb），侧轴为从上到下，垂直方向。
* cross-start cross-end：flex 行（Flex lines）将项目放置入容器的方向是从 cross-start 开始朝 cross-end 方向排列。
* block axis（块轴）：是沿 块(block) （比如段落元素）的布局方向延伸的轴， 它会垂直穿过行内轴
* inline axis（内联轴）：是在使用特定写作模式中，沿句子单词的流动方向的轴。比如对于英语或者中文来说， 内联轴是水平的
* 块轴（Block Axis）又常称为列（Column）, 内联轴（Inline Axis）又常称为行（Row）
* 行内轴（Inline Axis）也对标 Flexbox 中的主轴 Main Axis
* 块轴（Block Axis）也对标 Flexbox 中的侧轴 Cross Axis

## flex 容器和 flex 项目

* 在元素上使用 display 设置值为 flex 或 inline-flex ，该容器会成为 flex 容器，该容器下的子元素，包括 文本节点，伪元素会是 flex 项目。
* 设置为 display: flex 时，flex 容器未显式设置与宽度相关的属性时，其宽度与其父容器等同（相当于 width: 100% ）
* 设置为 display: inline-flex 时，flex 容器未显式设置与宽度相关的属性时，其宽度等同于所有 flex 项目的宽度和
* 当 flex 容器中所有 flex 项目所有宽和大于 flex 容器时：
    * 设置为 display: flex 时，flex 项目会溢出 flex 容器
    * 设置为 display: inline-flex 时，flex 项目会撑大 flex 容器，有可能造成 flex 容器溢出其父元素（或祖先元素）

## flex 容器的属性

**注意：以下的属性讲解都以默认书写模式为准，也就是没有修改 writing-mode direction text-orientation 以及 html 属性 dir 时的主轴和侧轴方向。**

### flex-flow（flex-direction flex-wrap）

* flex-flow 属性是 flex-direction 和 flex-wrap 的简写。
* flex-flow 只显式设置一个值，并且该值和 flex-direction 相匹配时， flex-wrap 会取值 initial
* flex-flow 只显式设置一个值，并且该值和 flex-wrap 相匹配时， flex-direction 会取值 initial
* flex-flow 显式设置两个值时， flex-direction 和 flow-wrap 没有先后顺序之分，即可 flex-flow: column wrap 和 flex-flow: wrap column 等同

#### flex-direction

flex-direction 用于设置主轴方向。

|   值   |  含义  |
|  ----  | ----  |
|  row  |  默认值。从左至右，水平方向。  |
|  row-reverse  |  和 row 相反。从右至左，水平方向。  |
|  column  |  从上至下，垂直方向。  |
|  column-reverse  |  和 column 相反。从下至上，垂直方向。  |

#### flex-wrap

flex-wrap 指定 flex 项目在 flex 容器换行的方式 。所有 flex 项目宽度总和大于 flex 容器主轴尺寸时，设置 flex-wrap 属性才能生效。

|   值   |  含义  |
|  ----  | ----  |
|  nowrap  |  默认值。 不换行，可能会溢出。 |
|  wrap  |  默认值。 换行。 |
|  wrap-reverse  |  默认值。 换行。cross-start 和 cross-end 互换 |

### justify-content 主轴方向对齐方式

![justify-content](../img/justify-content.awebp)

在 flex 容器中使用 justify-content 来控制 flex 项目在 Flex 容器主轴方向的对齐方式，也可以用来分配 flex 容器中主轴方向的剩余空间。使用 justify-content 分配 flex 容器剩余空间，主要是将剩余空间按不同的对齐方式，将剩余空间分配给 flex 项目的两侧，即控制 flex 项目与 flex 项目之间的间距。

|   值   |  含义  |
|  ----  | ----  |
|  flex-start  |  flex 项目从 main-start 开始排列  |
|  flex-end  |  flex 项目从 main-end  开始排列  |
|  center  |  flex 项目向主轴中心排列，第一个 flex 项目与 main-start 的距离和最后一个 flex 项目与 main-end 的距离相等   |
|  space-between  |  会让第一个 flex 项目的盒子起始边缘与 flex 容器主轴起点相稳合，最后一个 flex 项目的盒子结束边缘与 flex 容器主轴终点相稳合，其它相邻 flex 项目之间间距相等。当 flex 容器中只有一个 flex 项目时，其表现行为和 flex-start 等同  |
|  space-around  |  会让第一个 flex 项目的盒子起始边缘与 flex 容器主轴起点间距和最后一个 flex 项目的盒子结束边缘与 flex 容器主轴终点间距相等，并且等于其他相邻两个 flex 项目之间间距的一半。当 flex 容器中只有一个 flex 项目时，其表现行为和 center 等同  |
|  space-evenly  |  会让第一个 flex 项目的盒子起始边缘与 flex 容器主轴起点间距和最后一个 flex 项目的盒子结束边缘与 flex 容器主轴终点间距相等，并且等于其他相邻两个 flex 项目之间间距。当 flex 容器中只有一个 flex 项目时，其表现行为和 center 等同  |


* 如果 flex 容器没有额外的剩余空间，或者说剩余空间为负值时， justify-content 的值表现形式：
    * flex-start 会让 flex 项目在 Flex 容器主轴结束点处溢出
    * flex-end 会让 flex 项目在 flex 容器主轴起点处溢出
    * center 会让 flex 项目在 flex 容器两端溢出
    * space-between 和 flex-start 相同
    * space-around 和 center 相同
    * space-evenly 和 center 相同

### align-items 侧轴方向对齐方式

![align-items](../img/align-items.awebp)

align-items 控制 flex 项目在侧轴方向的对齐方式。

|   值   |  含义  |
|  ----  | ----  |
|  stretch  |  flex 项目未显式设置 height (或 width )的时候，flex 项目在侧轴方向被拉伸到与容器相同的高度或宽度  |
|  flex-start  |  flex 项目向 cross-start 对齐  |
|  flex-end  |  flex 项目向 cross-end 对齐  |
|  center  |  flex 项目在侧轴上居中  |
|  baseline  |  flex 项目在侧轴与基线对齐  |

* 如果 flex 容器没有剩余空间或剩余空间为负值是：
    * flex-start 会让 flex 项目在 flex 容器侧轴终点处溢出
    * flex-end 会让 flex 项目在 flex 容器侧轴起点处溢出
    * center 会让 flex 项目在 flex 容器侧轴两侧溢出
    * baseline 会让 flex 项目在 flex 容器侧轴终点溢出，有点类似于 flex-start

### align-content 多行（列）对齐方式

![align-content](../img/align-content.awebp)

align-content 只适用于 flex 容器在没有足够空间（所有 flex 项目宽度之和大于 flex 容器主轴尺寸），并且显式设置 flex-wrap 的值为非 wrap 时。

align-content 表现行为有点类似于 justify-cotent 控制 flex 项目在主轴方向的对齐方式（分配 flex 容器主轴剩余空间），而 align-content 可以用来控制多行状态下，行在 flex 容器侧轴的对齐方式（分配 flex 容器侧轴剩余空间）。可以把 align-content 状态下侧轴中的整行当作是 justify-content 状态下单个 flex 项目。

|   值   |  含义  |
|  ----  | ----  |
|  flex-start  |  所有行从 cross-start 开始填充。  |
|  flex-end  |  所有行从 cross-end 开始填充。  |
|  center  |  所有行在侧轴居中填充。  |
|  stretch  |  拉伸所有行来填满剩余空间。  |
|  space-between  |  第一行与 cross-start 紧贴，最后一行与 cross-end 紧贴，其他行之间距离相等。当 flex 容器中只有一行时，其表现行为和 flex-start 等同  |
|  space-around  |  第一行与 cross-start 和 最后一行与 cross-end 的距离相等，是其他行之间距离的一半。当 flex 容器中只有一行时，其表现行为和 center 等同  |
|  space-evenly  |  每一行之间距离相等。当 flex 容器中只有一行时，其表现行为和 center 等同  |


* 当 flex 容器中所有行的尺寸之和大于 flex 容器侧轴尺寸（flex 容器侧轴没有可用空间或可用空间为负值）时，各值表现行为：
* flex-start 会让 flex 容器的行在侧轴结束点溢出
* flex-end 会让 flex 容器的行在侧轴起点溢出
* center 会让 flex 容器行在侧轴两端溢出
* stretch 表现行为类似于 flex-start
* space-around 表现行为类似于 center
* space-between 表现行为类似于 flex-start
* space-evenly 表现行为类似于 center


## flex 项目的属性

### align-self

![align-self](../img/align-self.awebp)

|   值   |  含义  |
|  ----  | ----  |
|  auto  |  设置为 flex 容器的 align-items 值  |
|  flex-start  |  对齐至 cross-start  |
|  flex-end  |  对齐至 cross-end  |
|  center  |  对齐至侧轴中心  |
|  baseline  |  在侧轴与基线对齐  |
|  stretch  |  拉伸来填满剩余空间。  |

### flex

flex 属性使 flex 项目根据 flex 容器的可用空间对自身做伸缩计算，其包含三个子属性： flex-basis 、 flex-shrink 和 flex-grow 。

* 即 flex 的三个子属性： flex-grow （扩展比率）、 flex-shrink （收缩比率）和 flex-basis （伸缩基准）。这三个属性可以控制Flex项目，具体的表现如下：
    * flex-grow ：设置 flex 项目的扩展比率，让 flex 项目得到（扩展）多少 flex 容器剩余空间（Positive Free Space），即 flex 项目可能会变大
    * flex-shrink ：设置 flex 项目收缩比率，让 flex 项目减去 flex 容器不足的空间（Negative Free Space），即 flex 项目可能会变小
    * flex-basis ：flex 项目未扩展或收缩之前，它的大小，即指定了 flex 项目在主轴方向的初始大小


* flex 属性可以指定 1个值（单值语法） 、 2个值（双值语法） 或 3个值（三值语法） 。
    + 单值语法：值必须为以下其中之一：
        * 一个无单位的数（ <number> ），比如 flex: 1 ，这个时候它会被当作 <flex-grow> 的值
        * 一个有效的宽度（ width ）值，比如 flex: 30vw ，这个时候它会被当作 <flex-basis> 的值
        * 关键词 none 、 auto 或 initial （即初始值）
    + 双值语法：第一个值必须为一个无单位数值，并且它会被当作 <flex-grow> 的值；第二个值必须为以下之一：
        * 一个无单位的数（ <number> ），它会被当作 <flex-shrink> 的值
        * 一个有效的宽度（ width ）值，它会被当作 <flex-basis> 的值
    + 三值语法：
        * 第一个值必须是一个无单位数（ <number> ），并且它会被当作 <flex-grow> 的值
        * 第二个值必须是一个无单位数（ <number> ），并且它会被当作 <flex-shrink> 的值
        * 第三个值必须为一个有效的宽度（ width ）值，并且它会被当作 <flex-basis> 的值

|   值   |  含义  |
|  ----  | ----  |
|  auto  | flex 项目会根据自身的 width 和 height 来确定尺寸，但 flex 项目根据 flex 容器剩余空间进行伸缩。其相当于 flex: 1 1 auto  |
|  initial  | flex 项目会根据自身的 width 和 height 来设置尺寸。它会缩短自身以适应 flex 容器，但不会伸长并吸收 flex 容器中的额外剩余空间来适应 flex 容器。其相当于 flex: 0 1 auto  |
|  none  | flex 项目会根据自身的 width 和 height 来设置尺寸。它是完全非弹性的（既不会缩短，也不会伸长来适应 flex 容器）。其相当于 flex: 0 0 auto  |

### flex-grow

flex-grow 计算公式：

![flex-grow](../img/flex-grow.awebp)

### flex-shrink

flex-shrink 计算公式

![flex-shrink](../img/flex-shrink.awebp)

### flex-basis

如果 flex 项目未显式指定 flex-basis 的值，那么 flex-basis 将回退到 width （或 inline-size ）属性；如果未显式指定 width （或 inline-size ）属性的值，那么 flex-basis 将回退到基于 flex 项目内容计算宽度。不过，决定 flex 项目尺寸大小，还受 flex-grow 和 flex-shrink 以及 flex 容器大小的影响。而且 flex 项目 最终尺寸 会受 min-width、 max-width(或 min-inline-size 、 max-inline-size )属性限制。


## 题目

第一题

用 flex 实现 flex 项目是对角线的布局

<details>
<summary>答案</summary>

```html
<style>
        div {
            box-sizing: border-box;
        }
        .box {
            width: 400px;
            height: 400px;
            display: flex;
            justify-content: space-evenly;
        }
        .inner-box {
            padding: 30px;
        }
        .inner-box-1 {
            align-self: flex-start;
            background-color: blueviolet;
        }
        .inner-box-2 {
            align-self: center;
            background-color: dodgerblue;
        }
        .inner-box-3 {
            align-self: flex-end;
            background-color: forestgreen;
        }
    </style>
    <div class="box">
        <div class="inner-box inner-box-1"></div>
        <div class="inner-box inner-box-2"></div>
        <div class="inner-box inner-box-3"></div>
    </div>
```
</details>
<br><br>

第二题

用 flex 实现。flex 项目一共有 4 个，1 和 3 在侧轴上方，2 和 4 才侧轴下方。

<details>
<summary>答案</summary>

```html
    <style>
        div {
            box-sizing: border-box;
        }
        .box {
            width: 400px;
            height: 130px;
            display: flex;
            justify-content: space-evenly;
        }
        .inner-box {
            padding: 30px;
        }
        .inner-box-1 {
            align-self: flex-start;
            background-color: blueviolet;
        }
        .inner-box-2 {
            align-self: flex-end;
            background-color: dodgerblue;
        }
        .inner-box-3 {
            align-self: flex-start;
            background-color: forestgreen;
        }
        .inner-box-4 {
            align-self: flex-end;
            background-color: lightsalmon;
        }
    </style>
    <div class="box">
        <div class="inner-box inner-box-1"></div>
        <div class="inner-box inner-box-2"></div>
        <div class="inner-box inner-box-3"></div>
        <div class="inner-box inner-box-4"></div>
    </div>
```
</details>
<br><br>