// HTTP request implementation
// design a HTTP class
// content-type is a compulsory filed;default value is inevitable
// body is also key-value pairs
// content-type determine the format of body
// content-length is also inevitable


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
            //................
        })
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