# 组件通信

共有 8 种方式：

* props
* $emit / $on
* $children / $parent
* $attrs / $listeners
* ref
* $root
* eventbus
* vuex

按照组件关系分类

* 父子组件
    * props
    * $emit / $on
    * $children / $parent
    * $attrs / $listeners
    * ref
* 兄弟组件
    * $parent
    * $root
    * eventbus
    * vuex
* 跨层级
    * eventbus
    * vuex
    * provide / inject

