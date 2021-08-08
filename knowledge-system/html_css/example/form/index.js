const express = require('express')
const app = express()
const port = 3000

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true }))

app.use(express.static('./'))

app.get('/', (req, res) => {
    res.sendFile('./index.html')
})

app.post('/test', (req, res) => {
    console.log('/test req.body', req.body)
    console.log('/test req.params', req.params)
    res.send('收到了')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})