
const originalProto = Array.prototype
const arrayProto = Object.create(originalProto);

['push', 'pop', 'shift', 'unshift'].forEach(method => {
    arrayProto[method] = function() {
        originalProto[method].apply(this, arguments)


    }
})

function defineReactive(obj, key, val) {
    // 如果val本身还是对象，需要递归处理
    observe(val)

    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key)

            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set(v) {
            if (v !== val) {
                console.log('set', key)
                // 如果传入的 v 是一个对象，还需要递归处理
                observe(v)
                val = v;
                // update()

                dep.notify()
            }
        }
    })
}

// 对 obj 做响应式处理
function observe(obj) {
    // 判断 obj 的值，必须是 object
    if (typeof obj !== 'object' || obj == null) {
        return obj
    }
    new Observer(obj);
}

class Observer {
    constructor(value) {
      this.value = value;
  
      if (Array.isArray(value)) {
        value.__proto__ = arrayProto

        for (let i = 0; i < value.length; i++) {
            observe(value[i])
        }
      } else {
        // object
        this.walk(value);
      }
    }
  
    // 对象响应式处理
    walk(obj) {
      Object.keys(obj).forEach((key) => defineReactive(obj, key, obj[key]));
    }
  }

function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(v) {
                vm.$data[key] = v
            }
        })
    })
}

class XVue {
    constructor(options) {
        // 保存选项
        this.$options = options
        this.$data = options.data
        this.$methods = options.methods
        // 对 data 做响应式处理
        observe(this.$data)
        // 代理
        proxy(this)
        // 编译
        new Compile(options.el, this)
    }
}

class Compile {
    constructor(el, vm) {
        // 保存 vue 实例
        this.$vm = vm
        // 编译模板树
        this.compile(document.querySelector(el))
    }
    // el 是模板中的根节点
    compile(el) {
        // 获取 el 所有子节点
        el.childNodes.forEach(node => {
            if (node.nodeType === 1) {
                console.log('element', node.nodeName)
                this.compileElement(node)
                if (node.childNodes.length > 0) {
                    this.compile(node)
                }
            } else if (this.isInter(node)) {
                console.log('text', node.textContent)
                this.compileText(node)
            }
        })
    }

    // 编译 element
    compileElement(node) {
        // 获取当前元素所有属性，判断是否动态
        const nodeAttrs = node.attributes
        Array.from(nodeAttrs).forEach(attr => {
            const attrName = attr.name
            const exp = attr.value

            // 判断 attrName 是否是指令或者事件
            if (attrName.startsWith('x-')) {
                // 指令 截取 x- 后面的部分
                const dir = attrName.substring(2)
                // 判断是否存在对应的处理函数，如果有就调用
                this[dir] && this[dir](node, exp)
            }

            // 事件
            if (attrName.startsWith('@')) {
                const event = attrName.substring(1)
                node.addEventListener(event, e => {
                    this.$vm.$methods[exp] && this.$vm.$methods[exp].call(this.$vm, e)
                }, false)
            }
        })
    }

    // x-text
    text(node, exp) {
        this.update(node, exp, 'text')
    }

    // x-html
    html(node, exp) {
        this.update(node, exp, 'html')
    }

    model(node, exp) {
        this.update(node, exp, 'model')

        node.addEventListener('input', e => {
            this.$vm[exp] = e.target.value
        }, false)
    }

    update(node, exp, dir) {
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])

        new Wacher(this.$vm, exp, function(val) {
            fn && fn(node, val)
        })
    }

    compileText(node) {
        this.update(node, RegExp.$1, 'text')
    }

    textUpdater(node, val) {
        node.textContent = val
    }

    htmlUpdater(node, val) {
        node.innerHTML = val
    }

    modelUpdater(node, val) {
        node.value = val
    }
    // 判断是否是插值节点
    isInter(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
    }
}


class Wacher {
    constructor(vm, key, updateFn) {
        this.vm = vm;
        this.key = key
        this.updateFn = updateFn

        Dep.target = this
        vm[key]
        Dep.target = null
    }

    update() {
        this.updateFn.call(this.vm, this.vm[this.key])
    }
}

class Dep {
    constructor() {
        // 保存关联的 watcher 实例
        this.deps = []
    }

    addDep(dep) {
        this.deps.push(dep)
    }

    notify() {
        this.deps.forEach(dep => dep.update())
    }
}