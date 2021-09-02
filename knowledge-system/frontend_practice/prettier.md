# prettier 代码规范

## 基础使用

prettier 是一个代码格式化工具，用于统一代码风格。

```js
yarn add -D prettier stylelint-config-prettier eslint-config-prettier
```

### 和其他 lint 一起使用

一般和 eslint 还有 stylelint 配合的时候，让 prettier 处理风格，让 eslint 和 stylelint 处理 js 和 css 的错误和不合理之处。因为 eslint 和 stylelint 也可以处理风格，所以他们之间由于风格会出现冲突，所以需要 stylelint-config-prettier eslint-config-prettier 这两个插件来覆盖它们之间冲突的风格配置。

安装之后在 eslint 和 stylelint 的配置文件里加入 extends 字段。eslint 里在 extends 的数组里最后面加上 "prettier" 即可，stylelint 在 extends 的数组里最后面加上 "stylelint-config-prettier" 即可。

### 忽略文件

设置目录后 prettier 会自动处理不同后缀名的文件，有些不想处理的文件可以新建一个 .prettierignore 文件，然后在其中定义需要被忽略的文件和目录即可。

```js
*.png
*.svg
*.gif
*.pem
*.mp3
*.ttf
*.woff
```

### 配置文件

配置文件可以使用以下几种：

* package.json 中的 prettier 字段
* 名为 .prettierrc 的 json 或 yaml 文件
* .prettierrc.json, .prettierrc.yml, .prettierrc.yaml, 或者 .prettierrc.json5
* 导出一个对象的 .prettierrc.js, .prettierrc.cjs, prettier.config.js, prettier.config.cjs 文件
* .prettierrc.toml 文件

### 常用规则

配置文件导出的对象里就是具体的 prettier 规则了：

```js
module.exports = {
  tabWidth: 2, // 设置 tab 缩进使用几个空格
  useTabs: false, // 是否使用 tab 取代空格缩进
  semi: true, // 语句结尾必须有分号
  singleQuote: true, // 使用单引号还是双引号
  quoteProps: "as-needed", // 对象属性名是否需要用引号
  trailingComma: "es5", // 对象或数组或参数列表结尾是否要加上一个逗号
  bracketSpacing: true, // 对象的花括号是否添加空格
  arrowParens: "avoid", // 箭头函数是否省略参数的圆括号
  vueIndentScriptAndStyle: false // vue 单文件组件中的 script 和 style 标签的代码是否需要整体缩进
}
```