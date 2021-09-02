# stylelint 代码规范

## 基础使用

stylelint 用于检查 css 代码的风格和错误。

```js
// vue 项目安装下面三个
yarn add -D stylelint stylelint-scss stylelint-config-standard stylelint-webpack-plugin
```

### 配置文件

stylelint 使用下面这几种配置文件都可以：

* 在 package.json 文件中添加 stylelint 字段
* 项目根目录添加 .stylelintrc 文件，文件内容是 json 对象
* 项目根目录添加 stylelint.config.js 文件，文件中导出一个 js 对象
* 项目根目录添加 stylelint.config.cjs 文件，文件中导出一个 js 对象。（这种情况是当在 package.json 中指定了 "type": "module" 的情况，也就是开启了 nodejs 的 ES module 模式，详情可以查看 [nodejs文档](https://nodejs.org/dist/latest-v14.x/docs/api/packages.html#packages_determining_module_system)）

### rules

* 配置对象中的 rules 用来指定自定义规则。
* 和 eslint 不同，stylelint 中具体的一条规则没有默认值，需要用户自己手动来指定。
* rules 是一个对象，属性 key 对应规则的名字，属性 value 对应规则的具体配置。属性 value 可以有如下写法
    * null 将此规则关闭
    * 只写一个值，即使用主要设置。（指定一个主要设置就自动将此规则开启）
    * 两个值，在一个数组中，`[主要设置，次要设置]`

下面是例子

```js
{
  "rules": {
    "block-no-empty": null,
    "comment-empty-line-before": [
      "always",
      {
        "ignore": ["stylelint-commands", "after-comment"]
      }
    ],
    "max-empty-lines": 2,
    "unit-allowed-list": ["em", "rem", "%", "s"]
  }
}
```

### severity

通过指定规则的 severity 次要设置来修改它严重程度。

severity 有两个值:

* "warning"
* "error" (默认值)

```js
{
  "rules": {
    "indentation": [
      2,
      {
        "except": ["value"],
        "severity": "warning"
      }
    ]
  }
}
```

### extends

通过 extends 字段指定第三方配置对象。

```js
{
  "extends": "stylelint-config-standard",
  "rules": {
    "indentation": "tab",
    "number-leading-zero": null
  }
}

{
  "extends": ["stylelint-config-standard", "./myExtendableConfig"],
  "rules": {
    "indentation": "tab"
  }
}
```

最终第三方的配置和自定义的配置合并，自定义规则会覆盖第三方的规则，第三方的规则按照数组顺序后出现的规则会覆盖前面的。

## plugins

* 插件是社区创建的一整组规则，为了去支持一些非标准的 css 语法，或者工具或者一些具体的应用场景。
* 比如 stylelint-scss 支持 sass 语法的检查

## ignoreFiles

可以提供 glob 或者 一组 glob 来指定忽略哪些文件。

```js
{
  "ignoreFiles": ["**/*.js"]
}
```

## 忽略规则

下面三种注释分别是忽略此行之后所有代码，忽略下一行，忽略下一行的特定规则。

```js
/* stylelint-disable */
.a {}

/* stylelint-disable-next-line */
.a {}

/* stylelint-disable-next-line block-no-empty */
.a {}
```

## 为 vue 配置 stylelint

项目目录下新建 stylelint.config.js 文件，其中写入下列配置:

```js
module.exports = {
    "extends": "stylelint-config-standard",
    "plugins": [
      "stylelint-scss"
    ],
    "rules": {
        // 不要使用已被 autoprefixer 支持的浏览器前缀
        'media-feature-name-no-vendor-prefix': true,
        'at-rule-no-vendor-prefix': true,
        'selector-no-vendor-prefix': true,
        'property-no-vendor-prefix': true,
        'value-no-vendor-prefix': true,
        // 最多允许嵌套 20 层，去掉默认的最多 2 层
        'max-nesting-depth': 20,
        // 颜色值要小写
        'color-hex-case': 'lower',
        // 颜色值能短则短
        'color-hex-length': 'short',
        // 不能用 important
        'declaration-no-important': true,
    }
}

```

在 vue.config.js 中添加 configureWebpack 字段，其中添加 plugin

```js
{
    configureWebpack: {
        plugins: [
            new StylelintPlugin({
                files: ['./src/**/*.{vue,htm,html,css,sss,less,scss,sass}'],
            })
        ]
    }
}
```

这样每次本地运行项目的时候都会自动 stylelint 所有文件。开发环境能够对 vue 文件起作用的原因是因为 vue-loader 已经添加了对 stylelint 的支持，所以只需要简单配置就可以了。

在 package.json 中加入一个命令：

```js
{
    "scripts": {
        "style-all": "stylelint ./src/**/*.{vue,css,sass,scss} --fix"
    }
}
```

这个命令运行后会自动修复所有文件的 css 代码