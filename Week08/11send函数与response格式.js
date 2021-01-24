// 在Request 的构造器里收集必要信息
// 设计一个send 函数把收集到的请求真实发送到服务器
// send 函数是异步的，所以返回Promise
// HTTP response 格式:                       
// HTTP/1.1 200 OK                                    // status line   固定字符串HTTP/版本 状态码 状态文本       还有类似 404 not found 等等
// Content-Type:text/html                             // header
// Date:Mon,23 DEC 2019 06:46:19 GMT                  // header
// Connection:keep-alive                              // header
// Transfer-Encoding:chunked                          // header
// 
// 26                                                 // body body 由content-type 决定 chuncked body 是一个典型的格式
// <html> <body>Hello World <body></html>             // body
// 0                                                  // body 

const { rejects } = require("assert");
const net = require("net")

class Request{
    constructor(options){
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {}
        this.headers = options.headers ||{}
        if(!this.headers['Content-Type']){
            this.headers["Content-Type"] = 'application/x-www-form-urlencoded'
        }
        if(this.headers["Content-Type"]==='application/json')
            this.bodyText = JSON.stringify(this.body)
        else if(this.headers['Content-Type']==="application/x-www-form-urlencoded")
            this.bodyText = Object.keys(this.body).map(key=>`${key}=${encodeURIComponent(this.body[key])}`).join('b');
        this.headers["Content-Length"] = this.bodyText.length;//length 不传会是一个非法请求
    }
    send(){
        return new Promise((reslove,reject)=>{
            const parser = new ResponseParser;
            reslove("")
        })
    }
}

class ResponseParser{
    constructor(){

    }
    receive(string){
        for(let i =0;i<string.length;i++){
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char){

    }
}

void async function(){
    let request = new Request({
        method:"POST",
        host:'127.0.0.1',
        port:"8080",
        path:'/',
        headers:{
            ["X-Foo2"]:"customed",
        },
        body:{
            name:"Conrad",
        },
    });
    let response = await request.send()
    console.log(response)
}();