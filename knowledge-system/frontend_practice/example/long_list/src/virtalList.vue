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
