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
    send(connection){
        return new Promise((reslove,reject)=>{
            const parser = new ResponseParser;
            // reslove("")
            if(connection){
                connection.write(this.toString())
            }else {
                connection = net.createConnection({
                    host:this.host,
                    port:this.port
                },()=>{
                    connection.write(this.toString())
                })
            }
            connection.on('data',(data)=>{
                console.log(data.toString());
                parser.receive(data.toString());
                if(parser.isFinished){
                    reslove(parser.response);
                    connection.end();
                }
            })
            connection.on('error',(err)=>{
                reject(err)
                connection.end();
            })
        })
    }
    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key=>`${key}:${this.headers[key]}`).join('\r\n')}\r 
\r
${this.bodyText}`// 这里面不能随便空格的
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