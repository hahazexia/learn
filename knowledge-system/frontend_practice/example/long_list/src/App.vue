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

