# 使用 why-did-you-render 检查多余的重复渲染

[why-did-you-render](https://www.npmjs.com/package/@welldone-software/why-did-you-render) 插件可以帮助发现 react 项目中潜在的可避免的重复渲染。

## 安装

```bash
npm install @welldone-software/why-did-you-render --save-dev

yarn add --dev @welldone-software/why-did-you-render
```

* 手动引入
  * 创建一个 wdyr.js 并且将它作为整个应用的第一个文件 import。
  ```js
    // wdyr.js
    import React from 'react';

    if (process.env.NODE_ENV === 'development') {
      const whyDidYouRender = require('@welldone-software/why-did-you-render');
      whyDidYouRender(React, {
        trackAllPureComponents: true,
      });
    }
  ```
* 使用 [wdyr-webpack-plugin](https://www.npmjs.com/package/wdyr-webpack-plugin) 引入
  ```js
    // webpack.config.js
    const WdyrWebpackPlugin = require('wdyr-webpack-plugin');

    module.exports = {
      plugins: [
        new WdyrWebpackPlugin({
          enable: process.env.NODE_ENV === 'development',
          trackAllPureComponents: true,
          // other options
        })
      ]
    }
  ```

**注意：永远不要在生产环境使用 why-did-you-render ，因为它会使 react 变慢。**

## 用法

* 如果设置了 `trackAllPureComponents: true`，那么所有的纯组件（React.PureComponent 和 React.memo）将会被此插件追踪。否则，你需要自己手动在你想要追踪的组件（类组件或函数组件）添加 whyDidYouRender 属性，值为 true 即可。（例如 MyComponent.whyDidYouRender = true）。

* 插件启用后，当页面渲染或者交互的时候，如果存在不必要的 re-render，控制台就会出现提示，如下图所示：
  ![wdyr_use_state.png](./img/wdyr_use_state.png)
  这里出现的问题是 state 的值并未改变但是因为是引用类型所以造成了 re-render。根据这样的提示可以方便定位代码中的位置，然后一个一个解决，知道不再出现提示。

## 常见 re-render 问题

### props

