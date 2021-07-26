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

## props

```html
<!--父组件-->
<template>
    <div id="app">
        <Child v-bind:child="users"></Child>
    </div>
</template>
<script>
import Child from "./components/Child"
export default {
    name: 'App',
    data(){
        return {
            users:["Eric","Andy","Sai"] 
        }
    },
    components:{
        "Child":Child
    }
}
</script>

<!--子组件-->
<template>
    <div class="hello">
        <ul>
            <li v-for="item in child">{{ item }}</li>
        </ul>
    </div>
</template>
<script>
    export default {
        name: 'Hello World',
        props:{
            child: { //这个就是父组件中子标签自定义名字
                type: Array, //对传递过来的值进行校验
                required: true //必添
            }
        }
    }
</script>
```

props 父组件向子组件传递数据

## $emit

```html
<!--子组件 Header.vue-->
<template>
    <div>
        <h1 @click="changeTitle">{{ title }}</h1>
    </div>
</template>
<script>
export default {
    name: 'header',
    data() {
        return {
            title:"Vue.js Demo"
        }
    },
    methods:{
        changeTitle() {
            this.$emit("titleChanged","子向父组件传值"); //自定义事件 传递值 “子向父组件传值”
        }
    }
}
</script>

<!--父组件-->
<template>
    <div id="app">
        <header v-on:titleChanged="updateTitle"></header>
        <!--
            与子组件titleChanged 自定义事件保持一致
            updateTitle($event)接受传递过来的文字
        -->
        <h2>{{ title }}</h2>
    </div>
</template>
<script>
import Header from "./components/Header"
export default {
    name: 'App',
    data(){
        return{
            title:"传递的是一个值"
        }
    },
    methods:{
        updateTitle(e){ //声明这个函数
            this.title = e;
        }
    },
    components:{
        "header": Header,
    }
}
</script>
```

父组件中在子组件标签上绑定一个事件，子组件中 this.$emit 触发这个事件，子向父传递数据

## eventBus

```js
import Vue from 'vue'
export defult new Vue()
```

```html
<!--gg 组件-->
<template id="a">
    <div>
        <h3>gg 组件</h3>
        <button @click="sendMsg">将数据发送给 dd 组件</button>
    </div>
</template>
<script>
import bus from './bus'
export default {
    methods: {
        sendMsg(){
            bus.$emit('sendTitle','传递的值')
        }
    }
}
</script>

<!--dd 组件-->

<template>
    <div>
        接收 gg 传递过来的值：{{msg}}
    </div>
</template>

<script>
import bus from './bus'
export default {
    data(){
        return {
            mag: ''
        }
    }
    mounted(){
        bus.$on('sendTitle',(val)=>{
            this.mag = val
        })
    }
}
</script>
```

## vuex

Vuex 实现了一个单向数据流，在全局拥有一个 State 存放数据，当组件要更改 State 中的数据时，必 须通过 Mutation 提交修改信息， Mutation 同时提供了订阅者模式供外部插件调用获取State 数据的 更新。

而当所有异步操作(常见于调用后端接口异步获取更新数据)或批量的同步操作需要走 Action ，但Action 也是无法直接修改 State 的，还是需要通过 Mutation 来修改 State 的数据。最后，根据 State 的变化，渲染到视图上。

* state ： vuex 的唯一数据源，如果获取多个 state , 可以使用 ...mapState 。

```js
export const store = new Vuex.Store({
    state: {
        productList: [
            {
                name: 'goods 1',
                price: 100
            }
        ]
    }
})
```

* getter : 可以将 getter 理解为计算属性， getter 的返回值根据他的依赖缓存起来，依赖发生变化才会被重新计算。

```js
import Vue from 'vue'
import Vuex from 'vuex';

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
        productList: [
            {
                name: 'goods 1',
                price: 100
            }
        ]
    },

    getters: {
        getSaledPrice: (state) => {
            let saleProduct = state.productList.map((item) => {
                return {
                    name: '**' + item.name + '**',
                    price: item.price / 2
                }
            })
            return saleProduct;
        }
    }
})


// 获取 getter 计算后的值
export default {
    data () {
        return {
            productList : this.$store.getters.getSaledPrice
        }
    }
}
```

* mutation ：更改 vuex 的 state 中唯一的方是提交 mutation 都有一个字符串和一个回调函数。 回调函数就是进行状态修改的地方。并且会接收 state 作为第一个参数 payload 为第二个参 数， payload 为自定义函数， mutation 必须是同步函数。

```js
// 辅助对象 mapMutations
mutations: {
    reducePrice: (state, payload) => {
        return state.productList.forEach((product) => {
            product.price -= payload;
        })
    }
}


methods: {
    reducePrice(){
        this.$store.commit('reducePrice', 4)
    }
}
```

* action ： action 类似 mutation 都是修改状态，不同之处：
    * action 提交的 mutation 不是直接修改状态
    * action 可以包含异步操作，而 mutation 不行
    * action 中的回调函数第一个参数是 context ，是一个与 store 实例具有相同属性的方法的对象
    * action 通过 store.dispatch 触发， mutation 通过 store.commit 提交

```js
actions: {
    reducePriceAsync: (context, payload) => {
        setTimeout(()=> {
            context.commit('reducePrice', payload);
        }, 2000)
    }
}


methods: {
    reducePriceAsync(){
        this.$store.dispatch('reducePriceAsync', 2)
    },
}
```

* module ：由于是使用单一状态树，应用的所有状态集中到比较大的对象，当应用变得非常复杂，store 对象就有可能变得相当臃肿。为了解决以上问题，vuex 允许我们将 store 分割成模块，每个模块拥有自己的 state mutation action getter ，甚至是嵌套子模块从上至下进行同样方式分割。

```js
const moduleA = {
    state: {...},
    mutations: {...},
    actions: {...},
    getters: {...}
}
const moduleB = {
    state: {...},
    mutations: {...},
    actions: {...},
    getters: {...}
}
const store = new Vuex.Store({
    a: moduleA,
    b: moduleB
})

store.state.a
store.state.b
```

## $attr/$listeners

多级组件嵌套需要传递数据时，通常使用的方法是通过 vuex。但如果仅仅是传递数据，而不做中间处理，使用 vuex 处理，未免有点大材小用。为此 Vue2.4 版本提供了另一种方法。

* $attrs ：包含了父作用域中不被 prop 所识别 (且获取) 的特性绑定 (class 和 style 除外)。当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 (class 和 style 除外)，并且可以通过 v-bind="$attrs" 传入内部组件。通常配合 inheritAttrs 选项一起使用。
* $listeners ：包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 v-on="$listeners" 传入内部组件

```html
<!--index.vue-->
<template>
    <div>
        <child-com1 :foo="foo" :boo="boo" :coo="coo" :doo="doo" title="前端工匠">
        </child-com1>
    </div>
</template>
<script>
    const childCom1 = () => import("./childCom1.vue");
    export default {
        components: { childCom1 },
        data() {
            return {
                foo: "Javascript",
                boo: "Html",
                coo: "CSS",
                doo: "Vue"
            };
        }
    };
</script>

<!--childCom1.vue-->
<template class="border">
    <div>
        <p>foo: {{ foo }}</p>
        <p>childCom1 的$attrs: {{ $attrs }}</p>
        <child-com2 v-bind="$attrs"></child-com2>
    </div>
</template>
<script>
const childCom2 = () => import("./childCom2.vue");

export default {
    components: {
        childCom2
    },
    inheritAttrs: false, // 没有在 props 声明的属性不会被作为普通的 HTML attribute 应用在子组件的根元素上
    props: {
        foo: String // foo 作为 props 属性绑定
    },
    created() {
        console.log(this.$attrs); 
        // { "boo": "Html", "coo": "CSS", "doo": "Vue", "title": "前端工匠" }
    }
}
</script>

<!--childCom2.vue-->
<template>
    <div class="border">
        <p>boo: {{ boo }}</p>
        <p>childCom2: {{ $attrs }}</p>
        <child-com3 v-bind="$attrs"></child-com3>
    </div>
</template>
<script>
const childCom3 = () => import("./childCom3.vue");

export default {
    components: {
        childCom3
    },
    inheritAttrs: false,
    props: {
        boo: String
    },
    created() {
        console.log(this.$attrs);
        // {"coo": "CSS", "doo": "Vue", "title": "前端工匠" }
    }
};
</script>

<!--childCom3.vue-->

<template>
    <div class="border">
        <p>childCom3: {{ $attrs }}</p>
    </div>
</template>
<script>
export default {
    props: {
        coo: String,
        title: String 
    }
};
</script>
```

简单来说： $attrs 与 $listeners 是两个对象， $attrs 里存放的是父组件中绑定的非 Props 属性，$listeners 里存放的是父组件中绑定的非原生事件。

## provide / inject

Vue2.2.0 新增 API, 这对选项需要一起使用，以允许一个祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深，并在起上下游关系成立的时间里始终生效。一言而蔽之：祖先组件中通过 provider 来提供变量，然后在子孙组件中通过 inject 来注入变量。

provide / inject API 主要解决了跨级组件间的通信问题，不过它的使用场景，主要是子组件获取上级组件的状态，跨级组件间建立了一种主动提供与依赖注入的关系。

```js
//a.vue
export default {
    provide: {
        name: 'aaa'
    }
}

// b.vue
export default {
    inject: ['name'],
    mounted () {
        console.log(this.name)
    }
}
```

provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的 property 还是可响应的。所以，上面 A.vue 的 name 如果改变了，B.vue 的 this.name 是不会改变的。

## $parent / $children 与 ref

* ref ：如果在普通的 DOM 元素上使用，引用指向的就是 DOM 元素；如果用在子组件上，引用就指向组件实例
* $parent / $children ：访问父 / 子实例

## 总结

vue 中常用的通信方式由 6 种，分别是：
    1. props（父传子）
    2. $emit/$on 事件总线（跨层级通信）
    3. vuex（状态管理 常用） 优点：一次存储数据，所有页面都可访问
    4. $parent/$children（父子 项目中不建议使用）缺点：不可跨层级
    4. $attrs/$listeners
    5. provide/inject（高阶用法 = 推荐使用） 优点：使用简单 缺点：不是响应式