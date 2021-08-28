require('dotenv').config({ path: './client/.env' })
const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' })
    fs.createReadStream('./client/index.html').pipe(res)
})

const port = process.env.PORT || 3000
server.listen(port, () => {
    console.log(`Server is listening at port: ${port}`)
})