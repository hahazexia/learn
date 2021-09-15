# vue+nodejs配置多版本打包

## history

前端路由 vue-router 使用 history 模式

```js
const router = new VueRouter({
  mode: 'history'
});
```

webpack 打包的时候输出路径和 publicPath 配置上对应的版本号，版本号可以放 vue 项目的 .env 文件里，然后用 process.env.VERSION 来获取

```js
module.exports = {
  publicPath: `/${process.env.VERSION}/`,
  outputDir: resolve(`../server/app/public/${process.env.VERSION}`),
}
```

node 层收到请求返回页面的时候根据请求路径提取出版本号然后找到对应版本号路径下的 html 文件：

```js
class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    const version = Number(ctx.request.url.split('/')[1]);
    const indexPath = version ? `../public/${version}/index.html` : '../public/index.html'
    const dir = path.resolve(__dirname, indexPath);
    const html = fs.readFileSync(dir);
    ctx.body = html.toString();
  }
}
```

然后访问页面地址为以下即可：

```js
http://127.0.0.1:7001/5.3.15/message
// 5.3.15 是不同的版本号
```

## hash

前端路由 vue-router 使用 hash 模式

```js
const router = new VueRouter({
  mode: 'hash'
});
```

webpack 打包的时候输出路径和 publicPath 配置上对应的版本号

```js
module.exports = {
  publicPath: `/${version}/`,
  outputDir: resolve(`../server/app/public/${version}`),
}
```

然后 node 端返回页面的时候返回默认的 public/index.html 就可以了不需要改动，只是不同版本访问页面的时候将访问地址修改即可：

```js
http://127.0.0.1:7001/5.3.15/index.html#message
// 5.3.15 是不同的版本号
```