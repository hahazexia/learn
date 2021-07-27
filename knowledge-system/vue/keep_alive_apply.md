# keep-alive 应用

## 缓存列表页 

主页 --> 列表页--> 详情页，详情页 --> 主页 --> 列表页

我们希望，

* 从详情页返回列表页的时候页面的状态是缓存，不用重新请求数据，提升用户体验。
* 从列表页返回主页的时候页面，注销掉列表页，以在进入不同的列表页的时候，获取最新的数据。


1. 2 个 router-view

```html
<keep-alive>
    <!-- 需要缓存的视图组件 -->
    <router-view v-if="$route.meta.keepAlive">
    </router-view>
</keep-alive>

<!-- 不需要缓存的视图组件 -->
<router-view v-if="!$route.meta.keepAlive">
</router-view>
```

2. router 里定义需要被缓存的视图

```js
new Router({
    routes: [
        {
            path: '/',
            name: 'index',
            component: () => import('./views/keep-alive/index.vue')
        },
        {
            path: '/list',
            name: 'list',
            component: () => import('./views/keep-alive/list.vue'),
            meta: {
                keepAlive: true //需要被缓存
            }
        },
        {
            path: '/detail',
            name: 'detail',
            component: () => import('./views/keep-alive/detail.vue')
        }
    ]
})
```

3. keep-alive 组件如果设置了 include ，就只有和 include 匹配的组件会被缓存，所以动态修改 include 数组来实现按需缓存。

```html
<keep-alive :include="include">
    <!-- 需要缓存的视图组件 -->
    <router-view v-if="$route.meta.keepAlive">
    </router-view>
</keep-alive>

<!-- 不需要缓存的视图组件 -->
<router-view v-if="!$route.meta.keepAlive">
</router-view>
```

app.vue 里监听路由的变化

```js
export default {
  name: "app",
  data: () => ({
    include: []
  }),
  watch: {
    $route(to, from) {
        // 返回首页直接重置 include
        if (to.name === 'index') {
            this.include = []
            return;
        }
        //如果 要 to(进入) 的页面是需要 keepAlive 缓存的，把 name push 进 include数组
        if (to.meta.keepAlive) {
            !this.include.includes(to.name) && this.include.push(to.name);
        }
    }
  }
};
```


## 记录上次列表滚动的高度位置

* 产品列表中，滚动到一定位置的时候，点击查看产品信息，后退之后，需要回到原先的滚动位置，这是常见的需求。所有页面均在 router-view 中，暂时使用了keep-alive 来缓存所有页面，所以进入不同分类的产品列表，和不同的产品详情页面，需要更新数据。


* 在路由元信息中设置一个变量：scrollToPre，即标记是否要回到上一次滚动位置，而我们的产品页面 productList 是要恢复上次滚动高度的，不回到顶部，所以设置为 true。当离开路由的时候，还是判断这个变量是否为 true，是则记录滚动的高度到 vuex 中 （所以我们这个变量有 2 个作用，你要维护 2 个也可以）然后每当进入路由页面的时候，如果本路由的 scrollToPre 为 true，则从 vuex 中读取上次记录的高度，并恢复。


router 设置

```js
{
    routes: [{
            path: '/',
            name: 'home',
            component: Home,
            meta: { title: "凤凰旅游"}
        },
        {
            path: '/product',
            name: 'product',
            component: () => import('./views/Product.vue'),
            meta: { title: "旅游"}
        },
        {
            path: '/productList/:id',
            name: 'productList',
            component: () => import('./views/productList.vue'),
            meta: { title: "列表", scrollToPre: true}
        },
        {
            path: '/productShow/:id',
            name: 'productShow',
            component: () => import('./views/productShow.vue'),
            meta: { title: "旅游产品显示"}
        }
    ]
}
```

store 中定义一个变量存储滚动高度

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scrollTop :0
  },
  mutations: {
      recordScrollTop(state,n){
          state.scrollTop = n
      }
  }
})
```

导航守卫

```js
router.beforeEach((to, from, next) => {
    document.title = to.meta.title
    // 要离开页面如果设置为要记住上滚动高度到，以便下次进来恢复高度
    if (from.meta.scrollToPre) {
        store.commit('recordScrollTop', document.documentElement.scrollTop)
    }
    next()
})
router.afterEach((to, from) => {
    // 如果进入后的页面是要滚动到顶部，则设置scrollTop = 0
    //否则从vuex中读取上次离开本页面记住的高度，恢复它
    if (to.meta.scrollToPre) {
        setTimeout(() => {
            document.documentElement.scrollTop = store.state.scrollTop
        }, 50)
    } else {
        setTimeout(() => {
            document.documentElement.scrollTop = 0
        }, 10)
    }
});
```

## 缓存了页面之后，当参数不同的时候，更新数据

当进入不同分类的产品列表页面，或不同 id 的产品页面，由于缓存了上次的结果，当然要我们来处理更新。首先上面有说到，使用了 keep-alive，路由页面便可以使用 activated 生命周期钩子，因为使用了 keep-alive 其它普通的生命周期只执行了一次，而 activated 每次显示页面都会激活（类似小程序的 onShow），必须使用这个来更新思路：在页面 data 中维护一个 id,默认为 0 ，每次进这个页面时调用 activated 生命周期钩子，判断这个 id 是否与路由 url 中的参数一致如果不一致，则根据这个 id 更新相关数据，并且把 data 中的 id，更新为新的 id，别忘了还要清空上次分类的产品数据当然别忘了，你应该初始读取一次数据，比如在 created 里面， 而 activated 第一次创建页面时不会激活，缓存之后，第二次进入才会开始激活。

```js
activated() {
    //由于缓存了本页面，每次激活页面都要判断是否重置相关参数，并重新加载数据
    if (this.id !== this.$route.params.id) {
        this.id = this.$route.params.id //更新分类id
        this.curpage = 1 //初始化页面为1
        this.product = [] //清空上次不同分类的产品数据
        this.getProduct('/api/productList.php', this.id, this.curpage).then((res)=>{
            this.ptotal = res.total
            res.products.forEach((item)=>{
                this.product.push (item)
            })
            this.loading = false
        })
    }
}
```