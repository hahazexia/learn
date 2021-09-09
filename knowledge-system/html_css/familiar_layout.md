# 常见布局

## 两栏布局

* float + overflow：左边 div 固定宽度，然后 float:left，右边 div overflow:hidden

![layout_2columns_1](../img/layout_2columns_1.awebp)

* float + margin：左边 div 固定宽度，然后 float:left，右边 div 设置 margin-left 值和左边 div 宽度一样

![layout_2columns_2](../img/layout_2columns_2.awebp)

* flex: 父级容器 display:flex，左边 div 固定宽度，右边 div flex:1

![layout_2columns_3](../img/layout_2columns_3.awebp)

* grid：父级容器 display:grid 和 grid-template-columns: 200px auto; 200px 是左边 div 的宽度，左边 div 固定宽度

![layout_2columns_4](../img/layout_2columns_4.awebp)

## 三栏布局（两侧栏定宽主栏自适应）

* 圣杯布局

![layout_3columns_1](../img/layout_3columns_1.awebp)

* 双飞翼布局

![layout_3columns_2](../img/layout_3columns_2.awebp)

* float + overflow（BFC 原理）

![layout_3columns_3](../img/layout_3columns_3.awebp)

* flex

![layout_3columns_4](../img/layout_3columns_4.awebp)

* grid

![layout_3columns_5](../img/layout_3columns_5.awebp)

## 多列等高布局

* padding + 负 margin

![more_columns_1](../img/more_columns_1.awebp)

* 设置父级背景图片

![more_columns_2](../img/more_columns_2.awebp)

## 三行布局（头尾定高主栏自适应）

* calc

![three_row_1](../img/three_row_1.awebp)

* absolute

![three_row_2](../img/three_row_2.awebp)

* flex

![three_row_3](../img/three_row_3.awebp)

* grid

![three_row_4](../img/three_row_4.awebp)