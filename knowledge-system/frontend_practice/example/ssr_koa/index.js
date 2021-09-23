const Koa = require('koa')
const router = require('koa-router')()

const koa = new Koa()
koa.use(router.routes())

const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()
const app = new Vue({
  template: `<div>{{msg}}</div>`,
  data(){
    return {
      msg: 'This is renderred by vue-server-renderer'
    }
  }
})

router.get('/', ctx => {
  renderer.renderToString(app, (err, html) => {
    ctx.body = `<!DOCTYPE html>
    <html lang="en">
      <head><title>Vue SSR</title></head>
      <body>
        ${html}
      </body>
    </html>`
  })
})

koa.listen(9000, () => {
  console.log('server is listening in 9000');
})
