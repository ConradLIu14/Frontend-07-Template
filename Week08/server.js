const http = require('http')
http.createServer((request,response)=>{
    let body = []
    request.on('error',(err)=>{
        console.error(err)
    }).on('data',(chunk)=>{
        body.push(chunk.toString())
        // console.log('body',body)
    }).on('end',()=>{
        // body = Buffer.concat(body).toString() // 先把这里注释掉吧
        console.log('body:',body)
        response.writeHead(200,{'Content-Type':'text/html'})
        response.end(' Hellow World\n')
    })
}).listen(8088)// 不要监听 有用途的端口
console.log('server started')