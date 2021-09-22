const Vue = require('vue')
const server = require('express')()
// const renderer = require('vue-server-renderer').createRenderer()
const renderer = require('vue-server-renderer').createRenderer({
  template: require('fs').readFileSync('./public/index2.html', 'utf-8')
})

server.get('*', (req, res) => {
  const app = new Vue({
    data: {
      url: req.url
    },
    template: `<div>访问的 URL 是： {{ url }}</div>`
  })

  const context = {
    title: 'vue ssr',
    meta: `
        <meta name="keyword" content="vue,ssr">
        <meta name="description" content="vue srr demo">
    `,
  };

  renderer.renderToString(app, context, (err, html) => {
    if (err) {
      console.log(err)
      res.status(500).end('Internal Server Error')
      return
    }
    res.setHeader('Content-Type', 'text/html;charset=utf-8')
    res.end(html);
    // res.end(`
    //   <!DOCTYPE html>
    //   <html lang="en">
    //     <head><title>Hello</title></head>
    //     <body>${html}</body>
    //   </html>
    // `)
  })
})

server.listen(8080)
