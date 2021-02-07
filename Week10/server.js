const http = require('http')
let e1 = `<html lang="en">
<head>
<style>
    #container{
        width:500px;
        height:300px;
        display:flex;
    }
    #container #myid{
        width:200px;
    }
    #container .c1{
        flex:1;
    }
</style>
</head>
<body>
    <div id = "container">
        <div id = "myid"/>
        <div class = "c1"/>
    </div>
</body>
</html>`
let html_example1 = `<html lang="en">
<head>
<style>
    #container{
        width:500px;
        height:300px;
        display:flex;
        background-color:rgb(255,255,255)
    }
    #container #myid{
        width:200px;
        height:100px;
        background-color:rgb(255,0,0)
    }
    #container .c1{
        flex:1;
        background-color:rgb(0,255,0)
    }
</style>
</head>
<body>
    <div id = "container">
        <div id = "myid"/>
        <div class = "c1"/>
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
