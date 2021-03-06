# 渲染流程

渲染流水线由下面几个阶段组成：

1. 构建 DOM 树
2. 样式计算
3. 布局阶段
4. 分层
5. 绘制
6. 分块
7. 栅格化
8. 合成

## 详细

1. 构建 DOM 树。将 html 解析为浏览器能够理解的结构内存中的 DOM 树。

2. 样式计算（Recalculate Style）。计算出 DOM 节点中每个元素的具体样式。
    1. 将 css 转换为浏览器可以认识的 styleSheets。
    2. 转换样式表中的属性值，使其标准化
    3. 计算出 DOM 树中每个节点的具体样式。（CSS 的继承规则和层叠规则）每个 DOM 节点的样式被保存在 ComputedStyle 的结构内。

3. 布局阶段。计算出 DOM 树中可见元素的几何位置。
    1. 创建布局树。构建一棵只包含可见元素布局树。遍历 DOM 树中的所有可见节点，并把这些节点加到布局树中，而不可见的节点会被布局树忽略掉。
    2. 布局计算。计算布局树节点的坐标位置。

4. 分层。为特定的节点生成专用的图层，并生成一棵对应的图层树（LayerTree）。
    * 并不是布局树的每个节点都包含一个图层，如果一个节点没有对应的层，那么这个节点就从属于父节点的图层。
    * 拥有层叠上下文属性的元素会被提升为单独的一层。例如，使用定位属性的元素、定义透明属性的元素、使用 CSS 滤镜的元素等
    * 需要剪裁（clip）的地方也会被创建为图层。例如，div 宽度有限，其中文字换行的时候就会裁剪。文字部分单独创建一个层，如果出现滚动条，滚动条也会被提升为单独的层。

5. 图层绘制。把一个图层的绘制拆分成很多小的绘制指令，然后生成记录绘制顺序和绘制指令的列表。

6. 分块。绘制列表生成后，主线程会把该绘制列表提交（commit）给合成线程。合成线程会将图层划分为图块（tile）。合成线程会按照视口附近的图块来优先生成位图，实际生成位图的操作是由栅格化来执行的。所谓栅格化，是指将图块转换为位图。

7. 栅格化。所谓栅格化，是指将图块转换为位图。而图块是栅格化执行的最小单位。渲染进程维护了一个栅格化的线程池，所有的图块栅格化都是在线程池内执行。栅格化过程都会使用 GPU 来加速生成，生成的位图被保存在 GPU 内存中。

8. 合成和显示。一旦所有图块都被光栅化，合成线程就会生成一个绘制图块的命令，浏览器进程里面有一个叫 viz 的组件，用来接收合成线程发过来的 DrawQuad 命令，然后根据 DrawQuad 命令，将其页面内容绘制到内存中，最后再将内存显示在屏幕上。

## 总结

1. 渲染进程将 HTML 内容转换为能够读懂的 DOM 树结构。
2. 渲染引擎将 CSS 样式表转化为浏览器可以理解的 styleSheets，计算出 DOM 节点的样式。
3. 创建布局树，并计算元素的布局信息。
4. 对布局树进行分层，并生成分层树。
5. 为每个图层生成绘制列表，并将其提交到合成线程。
6. 合成线程将图层分成图块，并在光栅化线程池中将图块转换成位图。
7. 合成线程发送绘制图块命令 DrawQuad 给浏览器进程。
8. 浏览器进程根据 DrawQuad 消息生成页面，并显示到显示器上。