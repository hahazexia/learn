# v-for 和 v-if

```html
<!DOCTYPE html> <html>
<body>
    <div id="demo">
        <p v-for="child in children" v-if="isFolder">{{child.title}}</p>
        <!-- <template v-if="isFolder">
            <p v-for="child in children">{{child.title}}</p>
        </template> -->
    </div> 
    <script src="./vue.js"></script>
    <script>
        const app = new Vue({
            el: '#demo',
            data() {
                return {
                    children: [
                        {title:'foo'},
                        {title:'bar'},
                    ]
                }
            },
            computed: {
                isFolder() {
                    return this.children && this.children.length > 0
                }
            },
        });
        console.log(app.$options.render);
    </script>
</body>
</html>

```
v-if 在 v-for 同一层时的 render 函数：

```js
(function anonymous() {
    with (this) {
        return _c('div', {
            attrs: {
                "id": "demo"
            }
        }, _l((children), function(child) {
            return (isFolder) ? _c('p', [_v(_s(child.title))]) : _e()
        }), 0)
    }
}
)

```

v-if 在 v-for 外层时的 render 函数：

```js
(function anonymous() {
    with (this) {
        return _c('div', {
            attrs: {
                "id": "demo"
            }
        }, [(isFolder) ? _l((children), function(child) {
            return _c('p', [_v(_s(child.title))])
        }) : _e()], 2)
    }
}
)

```

通过生成的 render 函数可以发现，v-for 在解析的时候优先级比 v-if 要高。如果同时出现，每次渲染都会先执行循环再判断条件，无论如何循环都不可避免，浪费了性能 。要避免出现这种情况，则在外层嵌套 template，在这一层进行 v-if 判断，然后在内部进行v-for 循环。如果条件出现在循环内部，可通过计算属性提前过滤掉那些不需要显示的项。

源码中的依据是 genElement `src\compiler\codegen\index.js`

```js
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.parent) {
    el.pre = el.pre || el.parent.pre
  }

  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    return genSlot(el, state)
  } else {
    // component or element
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      let data
      if (!el.plain || (el.pre && state.maybeComponent(el))) {
        data = genData(el, state)
      }

      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      code = state.transforms[i](el, code)
    }
    return code
  }
}
```

可以看到先判断 el.for 调用 genFor 然后再判断 el.if 调用 genIf