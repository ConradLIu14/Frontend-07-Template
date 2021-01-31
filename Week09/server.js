const http = require('http')
let html_example1 = `<html lang="en">
<head>
<style>
    body div #myid{
        width: 100px;
        background-color: #ff5000;
    }
    
    body div img{
        width: 30px;
        background-color: #ff1111;
    }
</style>
</head>
<body>
<p id = 'p'></p>
<div>
    <img id='myid'/>
    <img />
</div>
</body>
</html>`
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
        // response.writeHead(statusCode, [reasonPhrase], [headers])
        // 200 成功 404 未找到
        response.writeHead(200,{'Content-Type':'text/html'})  //
        response.end(html_example1)
    })
}).listen(8088)// 不要监听 有用途的端口
console.log('server started')
