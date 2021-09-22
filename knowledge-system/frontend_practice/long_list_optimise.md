# 长列表优化

## content-visibility

content-visibility 属性有三个可选值:

* visible: 默认值。对布局和呈现不会产生什么影响。
* hidden: 元素跳过其内容的呈现。用户代理功能（例如，在页面中查找，按 Tab 键顺序导航等）不可访问已跳过的内容，也不能选择或聚焦。类似于对其内容设置了 display: none 属性。
* auto: 对于用户可见区域的元素，浏览器会正常渲染其内容；对于不可见区域的元素，浏览器会暂时跳过其内容的呈现，等到其处于用户可见区域时，浏览器在渲染其内容。


将长列表中的元素都设置 css 样式 content-visibility: auto; 即可完成优化。

[查看代码](./example/)

## 常规方法优化长列表（只加载可视区域数据）

先进行 10000 的长列表创建和插入

```html
<ul id="container"></ul>
<script>
    let total = 100000;
    let container = document.getElementById("container")

    for (let i = 0; i < total; i++) {
        let li = document.createElement("li");
        li.innerHTML = i;
        container.appendChild(li)
    }
</script>
```

这样循环创建和插入会非常慢，会卡顿，白屏时间变长

使用 DocumentFragment 和 requestAnimationFrame 进行优化

```html
<ul id="container"></ul>
<script>
    let total = 100000;
    let container = document.getElementById("container")
    let timer = Date.now();
    let index = 0;
    let id = 0;

    function load() {
        index += 50;
        if (index < total) {
            requestAnimationFrame(() => {
                let fragment  = document.createDocumentFragment();
                for (let i = 0; i < 50; i++) {
                    let li = document.createElement("li");
                    li.innerHTML = i
                    fragment.appendChild(li)   
                }
                container.appendChild(fragment)
                load();
            },0)
        }
    }

    load();
</script>
```

用 DocumentFragment 和 requestAnimationFrame 优化后，虽然白屏时间短了，但是页面还是有卡顿的情况，并且开启开发者工具后会卡住，因为操作太多要等很长时间。

所以可以使用只渲染可视区域内的数据来优化长列表。

```html
<!-- App.vue -->
<template>
  <div id="app">
    <virtalList :size=40 :remain=8 :items="items" :varlable=true>
      <template v-slot="item">
        <div class="list-item">{{item.item.id + item.item.value}}</div>
      </template>
    </virtalList>
  </div>
</template>

<script>
import Mock from 'mockjs'
import virtalList from './virtalList.vue'

// size: Number, //当前每一项的高度
// remain: Number, //可见多少个
// items: Array, //当前项目

export default {
  name: 'App',
  data() {
    return {
      items: []
    }
  },
  components: {
    virtalList
  },
  created() {
    let items  = [];
    for (var i = 0; i < 500; i++) {
      items.push({
        id: i,
        value: Mock.Random.sentence(5,50)}
      );
    }
    this.items = items;
  }
}
</script>

<!-- virtalList -->
<template>
    <div class="viewport" ref="viewport" @scroll="handlScroll">
        <div class="scroll-bar" ref="scrollbar"></div>
        <div class="scroll-list" :style="{transform:`translate(0,${offset}px)`}">
          <div v-for="item in visibleData" ref="items" :key="item.id" :vid="item.id">
            <slot :item="item"></slot>
          </div>
        </div>
    </div>
</template>

<script>
// size: Number, //当前每一项的高度
// remain: Number, //可见多少个
// items: Array, //当前项目

export default {
    props: {
        items: Array,
        remain: Number,
        size: Number
    },
    data() {
        return {
            start: 0,
            end: 0,
            offset: 0
        }
    },
    computed: {
        // prevCount nextCount 可视区域的前面几项和后面几项多加载出来，防止滚动时出现空白
        prevCount() {
          return Math.min(this.start, this.remain);
        },
        nextCount() {
          return Math.min(this.remain, this.items.length - this.end);
        },
        visibleData() {
          let start = this.start - this.prevCount;
          let end = this.end + this.nextCount;
          return this.items.slice(start, end);
        },
    },
    methods: {
      handlScroll() {
        // viewport 的滚动条滚动的时候，去通过 transform translate 改变 scroll-list 元素的 y 轴的位置
        let scrollTop = this.$refs.viewport.scrollTop;
        this.start = Math.floor(scrollTop / this.size); // 列表开始的位置等于 滚动的位置 / 列表的高度
        this.end = this.start + this.remain; // 要渲染列表结束的位置等于列表开始的位置加上每一页数据条数
        this.offset = this.start * this.size - this.prevCount * this.size; // 计算 scroll-list 的 y 轴偏移
      }
    },
    mounted() {
      // 每一项 40 高度，最少看到 8 项，所以设置 viewport 列表高度为 40 * 8
      this.$refs.viewport.style.height = this.size * this.remain + "px";
      // 设置 scrollbar 元素高度为完整数据列表的长度，它的作用是将 viewport 撑开，使得滚动条是可滚动的
      this.$refs.scrollbar.style.height = this.items.length * this.size + "px";
    }
}
</script>

<style lang="scss" scoped>
.viewport {
  overflow-y: scroll;
  position: relative;
}
.scroll-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.list-item {
  height: 40px;
  overflow: hidden;
  border: 1px solid #000;
}
</style>

```

[查看代码](./example/long_list/)

