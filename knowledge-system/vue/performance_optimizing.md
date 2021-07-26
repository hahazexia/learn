# 性能优化

1. 路由懒加载
2. keep-alive
3. v-show
4. v-for 和 v-if 避免同时使用
5. 长列表优化
    1. 纯粹数据展示，不需要响应式数据，将数据 Object.freeze()
    2. 使用虚拟滚动库，之渲染部分区域的内容
6. 事件的销毁。销毁无用的定时器
7. 图片懒加载
8. 第三方插件按需引入
9. 无状态组件标记为函数式组件
10. 子组件分割
11. 变量本地化
12. ssr


## 详细

1. 路由懒加载

路由配置中指定 component 参数时使用 import() 动态 import 语法，定义一个能够被 Webpack 自动代码分割的异步组件。

```js
const router = new VueRouter({
    routes: [
        { path: '/foo', component: () => import('./Foo.vue')}
    ]
})
```

2. keep-alive

```html
<template>
    <div id="app">
        <keep-alive>
            <router-view/>
        </keep-alive>
    </div>
</template>
```

3. v-show

```html
<template>
    <div class="cell">
        <!--这种情况用 v-show 复用 DOM，比 v-if 效果好 -->
        <div v-show="value" class="on">
            <Heavy :n="10000"/>
        </div>
        <section v-show="!value" class="off">
            <Heavy :n="10000"/>
        </section>
    </div>
</template>
```

4. v-for 和 v-if 避免同时使用

```html
<template>
    <ul>
        <li
        v-for="user in activeUsers"
        :key="user.id">
            {{ user.name }}
        </li>
    </ul>
</template>
<script>
export default {
    computed: {
        activeUsers: function () {
            return this.users.filter(function (user) {
                return user.isActive
            })
        }
    }
}
</script>
```

5. 长列表优化
    1. 纯粹数据展示，不需要响应式数据，将数据 Object.freeze()
    ```js
    export default {
        data: () => ({
            users: []
        }),
        async created() {
            const users = await
            axios.get("/api/users"); this.users =
            Object.freeze(users);
        }
    };
    ```
    2. 使用虚拟滚动库，之渲染部分区域的内容
    ```js
    <recycle-scroller class="items" :items="items" :item-size="24" >
        <template v-slot="{ item }">
            <FetchItemView :item="item" @vote="voteItem(item)" />
        </template>
    </recycle-scroller>
    // vue-virtual-scroller、vue-virtual-scroll-list
    ```
6. 事件的销毁。销毁无用的定时器

```js
created() {
    this.timer = setInterval(this.refresh, 2000)
},
beforeDestroy() {
    clearInterval(this.timer)
}
```
7. 图片懒加载

```js
<img v-lazy="/static/img/1.png">
// vue-lazyload
```
8. 第三方插件按需引入

```js
import Vue from 'vue';
import { Button, Select } from 'element-ui';

Vue.use(Button)
Vue.use(Select)
```
9. 无状态组件标记为函数式组件

函数式组件只是一个接受一些 prop 的函数，这意味它无状态 (没有响应式数据)，也没有实例 (没有 this 上下文)。

```js
<template functional>
    <div class="cell">
        <div v-if="props.value" class="on"></div>
        <section v-else class="off"></section>
    </div>
</template>

<script>
export default {
    props: ['value']
}
</script>
```
10. 子组件分割

将数据变化频繁的地方单独提取成组件可以优化性能，因为这样 diff 的时候少比较了一些不变化的节点。

11. 变量本地化

```html
<template>
    <div :style="{ opacity: start / 300 }"> {{ result }}</div>
</template>

<script>
import { heavy } from '@/utils'

export default {
    props: ['start'],
    computed: {
        base () {
            return 42
        },
        result () {
            const base = this.base // 不要频繁引用
            this.base let result = this.start

            for (let i = 0; i < 1000; i++) {
                result += heavy(base)
            }
            return result
        }
    }
}
</script>
```
12. ssr
