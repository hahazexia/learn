const Koa = require('koa')
const router = require('koa-router')()

const koa = new Koa()
koa.use(router.routes())

const Vue = require('Vue')
const renderer = require('vue-server-renderer').createRenderer()  //创建一个 renderer 实例
const app = new Vue({          //创建Vue实例
  template: `<div>{{msg}}</div>`,
  data(){
    return {
      msg: 'This is renderred by vue-server-renderer'
    }
  }
})

router.get('/',(ctx)=>{
  //调用renderer实例的renderToString方法，将Vue实例渲染成字符串
  //该方法接受两个参数，第一个是Vue实例，第二个是一个回调函数，在渲染完成后执行
  renderer.renderToString(app, (err, html) => {   //渲染得到的字符串作为回调函数的第二个参数传入
    ctx.body = `<!DOCTYPE html>
    <html lang="en">
      <head><title>Vue SSR</title></head>
      <body>
        ${html}    //将渲染得到的字符串拼接到要返回的结果中
      </body>
    </html>`
  })
})

koa.listen(9000, () => {
  console.log('server is listening in 9000');
})
