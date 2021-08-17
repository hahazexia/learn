# ESLint代码规范

## 基础使用

ESLint 是一个用来检查代码错误的工具。

```js
// 安装 eslint 到当前项目
npm install eslint --save-dev
yarn add eslint --dev

// 为当前项目生成 eslint 配置文件，会在项目目录下生成 .eslintrc.{js,yml,json} 文件
npx eslint --init
yarn run eslint --init

```

npx eslint --init 初始化选择 es6 module 模块，vue 后，生成的 .eslintrc.js 文件如下：

```js
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:vue/essential"
    ],
    "parserOptions": {
        "ecmaVersion": 12,
        "sourceType": "module"
    },
    "plugins": [
        "vue"
    ],
    "rules": {
        
    }
};

```

### rules 定义具体规则

其中 rules 字段就是用来加入自定义规则的地方。例如可以这样写：

```js
{
    "rules": {
        "semi": ["error", "always"], // 必须使用分号，否则报错
        "quotes": ["error", "single"] // 尽可能使用单引号，否则报错
    }
}
```

### env 环境设置

* 每个不同的环境都定义了一组不同的全局变量。通过设置 env 指定具体的环境变量。
    + browser 浏览器环境变量
    + node nodejs 环境变量
    + es2021 添加所有 ECMAScript 2021 环境变量，并设置解析器选项 ecmaVersion 为 12
    + es6 启用所有 ECMAScript 6 特性，并设置解析器选项 ecmaVersion 为 6

### eslint 扩展配置

* .eslintrc.js 配置文件是可以扩展的。配置文件一旦被扩展了，就会继承其他配置文件的属性并且所有选项都被修改。基础配置文件会和扩展配置文件合并成最终的结果配置文件。
* 通过设置配置文件中的 extends 字段可以设置扩展
    + 字符串。配置文件的路径，可共享配置的名称（例如， eslint:recommended ，eslint:all）
    + 字符串數組。多个配置文件
* extends 属性如果设置了 eslint:recommended 则会使用一组常见问题的规则
* extends 属性也可以写成类似 plugin:vue/essential 的形式，这个意思是使用 eslint-plugin-vue 插件，斜杠后是具体的配置名。（也就是这样的语法：plugin:省略了 eslint-plugin- 前缀的包名/配置名）

### parserOptions 指定解析器选项

* ecmaVersion 可以设置的值为 3, 5 (default), 6, 7, 8, 9, 10, 11, or 12。用来指定 ECMAScript 版本。
* sourceType 设置值为 "script" (default) 或者 "module"。普通 script 标签引入代码或者 es6 模块。
* ecmaFeatures 值为一个对象，设置一些你想开启的语言特性。
    + globalReturn 允许全局作用域下使用 return 语句
    + impliedStrict 开启全局严格模式（如果 ecmaVersion 大于等于 5）
    + jsx 启用 jsx

### parser 指定解析器

* 默认情况下 eslint 使用的解析器是 Espree，可以指定其他解析器

### plugins 插件

eslint 可以使用第三方插件。

* 通过 plugins 字段设置插件，值是一个插件名组成的数组，数组的元素是插件名字，省略 eslint-plugin- 前缀。比如使用 eslint-plugin-vue 就设置 'vue' 即可。

### root: true

* 默认情况下，ESLint 会在所有父级目录里寻找配置文件。ESLint 一旦发现配置文件中有 "root": true，它就会停止在父级目录中寻找。


## 为 vue 项目配置 eslint

vue 项目使用 eslint 必须使用 eslint-plugin-vue，同时还有 vue-eslint-parser，vue-eslint-parser 可以让 eslint 去识别 .vue 文件中的 template 模板。

```js
npm install --save-dev eslint eslint-plugin-vue vue-eslint-parser
```

vue 项目可以使用下面的配置：

```js
module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        parser: 'babel-eslint'
    },
    plugins: ['vue'],
    root: true,
    rules: {
        // 禁止使用 var 来声明
        'no-var': 'error',
        // 禁止修改 const 声明的变量
        'no-const-assign': 'error',
        // 优先使用 const 而不是 let
        'prefer-const': ['error', { destructuring: 'all' }],
        // 声明的变量必须被使用
        'no-unused-vars': [
        'error',
        {
            args: 'none',
            caughtErrors: 'none',
            ignoreRestSiblings: true,
            vars: 'all',
        },
        ],
        // 推荐使用模板字符串
        'prefer-template': 'warn',
        // 使用分号结尾
        semi: ['error', 'always'],
        // 使用单引号
        quotes: ['error', 'single'],
        // 2 个空格缩进
        indent: [
        'error',
        4,
        {
            SwitchCase: 1,
            offsetTernaryExpressions: true,
        },
        ],

        
        // 组件的 data 必须是一个函数
        'vue/no-shared-component-data': 'error',
        // 校验组件的 Prop 默认值类型
        'vue/require-valid-default-prop': 'error',
        // v-for 必须含有键值
        'vue/require-v-for-key': 'error',
        // 禁止注册没有使用的组件
        'vue/no-unused-components': 'warn',
        // render 函数必须有返回值
        'vue/require-render-return': 'error',
    },
};

```

* 当项目中监测出大量错误时，使用自定义的终端命令去自动修复一些问题：`"lint-all": "eslint --fix --ext .js --ext .vue src/"`。这个命令的含义：1. --fix 是指自动修复的意思 2. --ext 用于指定需要修复的文件的后缀名 3. src/ 指的是需要执行命令的目录

* 在代码中添加一些注释可以取消 eslint 的检测：

```js
/* eslint-disable */

// 这中间的代码不检测

/* eslint-enable */


// 本行不检测
// eslint-disable-line

// 下一行不检测
// eslint-disable-next-line
```