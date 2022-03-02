const http = require('http')
const fs = require('fs')

const server = http.createServer((request, response) => {
    const { url, method, headers } = request

    if (url !== '/favicon.ico') {
        if (url === '/' && method === 'GET') {
        
            response.statusCode = 200
            response.setHeader('Content-Type', 'text/html')
            fs.createReadStream('index.html').pipe(response)
            // fs.readFile('index.html',(err, data) => {
            //     response.statusCode = 200
            //     response.setHeader('Content-Type', 'text/html')
            //     response.end(data)
            // })
        } else if (url === '/users' && method === 'GET') {
            response.writeHead(200, {
                'Content-Type': 'application/json'
            })
            response.end(JSON.stringify({
                name : 'laowang'
            }))
        } else if (method === 'GET' && headers.accept.indexOf('image/*') !== -1) {
            fs.createReadStream('./' + url).pipe(response)
            // fs.readFile('./' + url, (err, data) => {
            //     response.statusCode = 200
            //     response.end(data)
            // })
        }
    }
})

server.listen(3000)