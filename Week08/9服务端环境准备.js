// server
// HTTP 协议
// POST/HTTP/1.1                  Request line method(POST,GET 最常用，还有OPTION ect.)/路径/版本（还有2.0;3.0 ect)
// Host:127.0.0.1                                        Headers(多行) key:values 键值对 行数不固定；空行结束
// Content-Type:application/x-www-form-urlencoded        Header
// field                                                 body;body 格式由 Content-Type 决定
const http = require('http')
http.createServer((request,response)=>{
    let body = []
    request.on('error',(err)=>{
        console.error(err)
    }).on('data',(chunk)=>{
        body.push(chunk.toString())
    }).on('end',()=>{
        body = Buffer.concat(body).toString()
        console.log('body',body)
        response.writeHead(200,{'Content-Type':'text/html'})
        response.end(' Hellow World\n')
    })
}).listen(8080)
console.log('server started')

